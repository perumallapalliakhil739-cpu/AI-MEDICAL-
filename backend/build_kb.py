import os
import sys
import json
import glob
from pathlib import Path
from dotenv import load_dotenv

# Ensure backend directory is in path
current_dir = Path(__file__).resolve().parent
load_dotenv(current_dir / ".env")

STW_PDFS_DIR = current_dir / "stw_pdfs"
KB_OUTPUT_DIR = current_dir / "knowledge_base"

STW_PDFS_DIR.mkdir(parents=True, exist_ok=True)
KB_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key or api_key == "your_gemini_api_key_here":
        print("\n[ERROR] GEMINI_API_KEY is not set or is still the default placeholder in backend/.env")
        print("Please edit backend/.env and paste your valid Gemini API key.\n")
        sys.exit(1)

    from google import genai
    return genai.Client(api_key=api_key)


def process_pdf_with_gemini(client, pdf_path: Path):
    from google.genai import types

    file_name = pdf_path.name
    print(f"\n---> Processing: {file_name}")

    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    file_part = types.Part.from_bytes(
        data=pdf_bytes,
        mime_type="application/pdf",
    )

    prompt = f"""You are an expert clinical researcher analyzing an official Indian Council of Medical Research (ICMR) Standard Treatment Workflow (STW) guideline document.
Carefully review the attached PDF document, including all clinical flowcharts, algorithm nodes, tables, and guideline text.

Extract structured information matching this EXACT JSON schema:
{{
  "id": "kebab-case-unique-identifier e.g. type-2-diabetes-mellitus, dyslipidemia-management",
  "condition": "Official clinical condition name as written in the STW",
  "specialty": "Medical specialty (e.g. Endocrinology, Cardiology, Hematology, Gastroenterology)",
  "source_file": "{file_name}",
  "related_lab_markers": ["List of relevant laboratory test biomarkers mentioned in the STW, e.g. HbA1c, Fasting Blood Glucose, LDL-C, Hemoglobin"],
  "diagnostic_criteria": ["Specific diagnostic thresholds, clinical cutoffs, or classification criteria from the STW"],
  "recommended_investigations": ["Baseline and diagnostic laboratory investigations, imaging, or tests specified in the STW"],
  "lifestyle_precautions": ["Dietary, physical activity, and non-pharmacological interventions written in the STW"],
  "medicines": [
    {{
      "name": "Generic drug name copied exactly as written in STW",
      "purpose": "Clinical role (e.g. First-line therapy, Second-line, Add-on, Symptomatic relief)",
      "notes": "Dosage, timing, contraindication, or clinical notes exactly as written in STW"
    }}
  ],
  "red_flags_refer_to_doctor": ["Danger signs, acute complications, or referral triggers to higher center written in STW"],
  "follow_up": ["Follow-up timeline, monitoring intervals, and therapeutic targets from the STW"]
}}

STRICT RULES:
1. Use ONLY information explicitly present in this PDF document.
2. Do NOT add medicines, doses, investigations, or advice from general medical knowledge or external sources.
3. If any field or category is not present in the PDF, return an empty list [].
4. Copy drug names, dosages, and notes EXACTLY as written in the STW.
5. The 'id' must be clean lowercase kebab-case (a-z, 0-9, hyphens only).
6. Set 'source_file' to '{file_name}'.
"""

    candidate_models = [
        os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite").strip(),
        "gemini-3.5-flash-lite",
        "gemini-3.8-flash",
        "gemini-4-argon",
    ]
    # Remove duplicates while preserving order
    candidate_models = list(dict.fromkeys(candidate_models))

    for model_name in candidate_models:
        try:
            print(f"     Sending to Gemini ({model_name})...")
            response = client.models.generate_content(
                model=model_name,
                contents=[file_part, prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1,
                ),
            )
            data = json.loads(response.text)
            # Ensure mandatory fields
            if not data.get("id"):
                data["id"] = pdf_path.stem.lower().replace("_", "-").replace(" ", "-")
            data["source_file"] = file_name
            return data
        except Exception as e:
            error_str = str(e)
            print(f"     [Notice] Attempt with {model_name} failed: {error_str[:120]}...")
            if "503" in error_str or "UNAVAILABLE" in error_str:
                continue
            # For non-503 fatal errors, try next model or raise
            continue

    raise RuntimeError(f"Failed to process {file_name} across all candidate Gemini models.")


def main():
    print("=" * 70)
    print("  MedScan AI - ICMR Standard Treatment Workflows (STW) Knowledge Base Builder")
    print("=" * 70)

    pdf_files = list(STW_PDFS_DIR.glob("*.pdf")) + list(STW_PDFS_DIR.glob("*.PDF"))

    if not pdf_files:
        print(f"\n[!] No PDF files found in: {STW_PDFS_DIR}")
        print("Please copy your ICMR STW PDF files into the above folder and run:")
        print("    python backend/build_kb.py\n")
        return

    print(f"Found {len(pdf_files)} PDF(s) in {STW_PDFS_DIR}")
    client = get_gemini_client()

    summary_records = []

    for pdf_path in pdf_files:
        try:
            structured_data = process_pdf_with_gemini(client, pdf_path)
            doc_id = structured_data["id"]
            out_file = KB_OUTPUT_DIR / f"{doc_id}.json"

            with open(out_file, "w", encoding="utf-8") as f:
                json.dump(structured_data, f, indent=2, ensure_ascii=False)

            meds_count = len(structured_data.get("medicines", []))
            markers_count = len(structured_data.get("related_lab_markers", []))

            summary_records.append({
                "file": pdf_path.name,
                "condition": structured_data.get("condition", "Unknown"),
                "specialty": structured_data.get("specialty", "General"),
                "meds_count": meds_count,
                "markers_count": markers_count,
                "id": doc_id,
            })
            print(f"  [SAVED] -> {out_file.name} ({meds_count} meds, {markers_count} markers)")

        except Exception as err:
            print(f"  [FAILED] Could not process {pdf_path.name}: {err}")

    # Print Summary Table
    print("\n" + "=" * 90)
    print(f"{'Source File':<28} | {'Condition':<30} | {'Meds':<6} | {'Markers':<8} | {'Specialty'}")
    print("-" * 90)
    for rec in summary_records:
        file_disp = rec['file'][:26] + ".." if len(rec['file']) > 28 else rec['file']
        cond_disp = rec['condition'][:28] + ".." if len(rec['condition']) > 30 else rec['condition']
        print(f"{file_disp:<28} | {cond_disp:<30} | {rec['meds_count']:<6} | {rec['markers_count']:<8} | {rec['specialty']}")
    print("=" * 90)
    print(f"\nBuild complete! {len(summary_records)} conditions saved to {KB_OUTPUT_DIR}\n")


if __name__ == "__main__":
    main()

