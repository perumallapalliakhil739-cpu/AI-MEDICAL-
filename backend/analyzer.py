import os
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

import sys
from pathlib import Path

# Ensure both project root and backend dir are in sys.path
current_dir = Path(__file__).resolve().parent
if str(current_dir.parent) not in sys.path:
    sys.path.insert(0, str(current_dir.parent))
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

try:
    from backend import kb_loader
    from backend.critical_thresholds import evaluate_critical_values
except ImportError:
    import kb_loader
    from critical_thresholds import evaluate_critical_values

# Load environment variables
current_dir = Path(__file__).resolve().parent
load_dotenv(current_dir / ".env")


def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key or api_key == "your_gemini_api_key_here":
        raise ValueError("GEMINI_API_KEY is not configured in backend/.env")

    from google import genai
    from google.genai import types
    return genai.Client(api_key=api_key, http_options=types.HttpOptions(timeout=25000))


def analyze(scan_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Connects a scanned lab report to the ICMR STW Knowledge Base.
    
    1. Extracts abnormal tests (status == 'low' or status == 'high').
    2. Matches each abnormal test against ICMR STWs using kb_loader.find_conditions_by_marker().
    3. Ranks matched conditions by number of overlapping abnormal markers.
    4. Evaluates deterministic code-level critical thresholds (urgent_alert).
    5. Prompts Gemini strictly with the top 3 matched STWs and abnormal tests.
    6. Returns clean structured JSON with full source citations.
    """
    all_tests = scan_result.get("tests", [])

    # Code-level deterministic safety check (NOT done by AI)
    urgent_alert = evaluate_critical_values(all_tests)

    # a. Filter abnormal tests (low or high status)
    abnormal_tests = [
        t for t in all_tests 
        if str(t.get("status", "")).strip().lower() in {"low", "high"}
    ]

    # f. If all tests are normal (no abnormal values)
    if not abnormal_tests:
        return {
            "status": "all_normal",
            "urgent_alert": urgent_alert,
            "main_findings": [
                {
                    "summary": "All analyzed laboratory test parameters appear within standard physiological reference intervals. No abnormal deviations were detected on this report.",
                    "related_tests": [t.get("name") for t in all_tests[:5]],
                    "possible_condition": "Routine Physiological State",
                    "confidence_note": "Every extracted test parameter is marked within normal biological limits.",
                    "source": {
                        "stw_id": "normal-baseline",
                        "source_file": "ICMR Guidelines General Baseline"
                    }
                }
            ],
            "precautions": [
                {
                    "text": "Continue maintaining balanced nutrition, adequate hydration, and regular weekly physical activity.",
                    "source_stw_id": "general-wellness"
                }
            ],
            "medicines": [],
            "see_a_doctor_if": [
                "Consult your doctor for periodic routine health checks or if you experience any new symptoms despite normal lab values."
            ],
            "tests_without_match": []
        }

    # b. Find matching STW conditions for each abnormal test
    condition_matches: Dict[str, Dict[str, Any]] = {}
    matched_test_names = set()

    for test in abnormal_tests:
        test_name = test.get("name", "")
        matched_conds = kb_loader.find_conditions_by_marker(test_name)
        for cond in matched_conds:
            cid = cond["id"]
            if cid not in condition_matches:
                condition_matches[cid] = {
                    "cond": cond,
                    "matched_markers": set()
                }
            condition_matches[cid]["matched_markers"].add(test_name)
            matched_test_names.add(test_name)

    # Tests that matched no STW
    tests_without_match = [
        t.get("name") for t in abnormal_tests 
        if t.get("name") not in matched_test_names
    ]

    # e. If no abnormal tests matched any STW
    if not condition_matches:
        return {
            "status": "no_guideline_match",
            "urgent_alert": urgent_alert,
            "main_findings": [
                {
                    "summary": "Out-of-range test values were detected on your report, but they did not directly correspond to conditions currently loaded in our ICMR Standard Treatment Workflow guidelines.",
                    "related_tests": [t.get("name") for t in abnormal_tests],
                    "possible_condition": "Guideline Match Not Found",
                    "confidence_note": "No direct biomarker overlap was found in the active ICMR STW knowledge base.",
                    "source": {
                        "stw_id": "unmatched",
                        "source_file": "ICMR STW Repository"
                    }
                }
            ],
            "precautions": [
                {
                    "text": "Consult your physician to interpret these out-of-range biomarkers in the context of your overall medical history.",
                    "source_stw_id": "clinical-evaluation"
                }
            ],
            "medicines": [],
            "see_a_doctor_if": [
                "Schedule a clinical evaluation with your doctor to discuss these specific out-of-range parameters."
            ],
            "tests_without_match": tests_without_match or [t.get("name") for t in abnormal_tests]
        }

    # Rank conditions by count of matching abnormal markers
    ranked_conditions = sorted(
        condition_matches.values(),
        key=lambda item: len(item["matched_markers"]),
        reverse=True
    )

    # Pick top 3 matched conditions
    top_3_conditions = [item["cond"] for item in ranked_conditions[:3]]

    # c & d. Send Gemini ONLY abnormal tests and top 3 matched conditions
    client = get_gemini_client()
    from google.genai import types

    prompt = f"""You are MedScan AI's clinical analysis assistant. Your role is to explain out-of-range laboratory test results by referencing official Indian Council of Medical Research (ICMR) Standard Treatment Workflows (STWs).

PATIENT OUT-OF-RANGE LAB TESTS:
{json.dumps(abnormal_tests, indent=2)}

MATCHED ICMR STW GUIDELINES (SOURCE OF TRUTH):
{json.dumps(top_3_conditions, indent=2)}

ABNORMAL TESTS THAT DID NOT MATCH ANY GUIDELINE:
{json.dumps(tests_without_match, indent=2)}

Return ONLY a valid JSON object matching this schema:
{{
  "main_findings": [
    {{
      "summary": "A clear, empathetic 2-3 sentence explanation written at an 8th-grade reading level explaining how these specific test values relate to the matched ICMR guideline.",
      "related_tests": ["Exact names of the abnormal tests from the patient results that relate to this finding"],
      "possible_condition": "Exact condition name from the matched STW",
      "confidence_note": "A brief explanation of why this guideline was matched based on specific biomarker elevations or depressions",
      "source": {{
        "stw_id": "The STW id from the matched guideline (e.g. diabetes-type-2)",
        "source_file": "The source_file name from the matched guideline"
      }}
    }}
  ],
  "precautions": [
    {{
      "text": "Lifestyle or dietary recommendation directly derived from the matched STW's lifestyle_precautions",
      "source_stw_id": "The STW id this precaution comes from"
    }}
  ],
  "medicines": [
    {{
      "name": "Generic medicine name copied exactly from the matched STW",
      "purpose": "Clinical purpose or indication as stated in the STW",
      "notes": "Clinical note or timing as written in STW (DO NOT GIVE DOSAGE AMOUNTS)",
      "source_stw_id": "The STW id this medicine comes from"
    }}
  ],
  "see_a_doctor_if": [
    "Warning signs or emergency referral triggers copied from the matched STW's red_flags_refer_to_doctor list"
  ],
  "tests_without_match": {json.dumps(tests_without_match)}
}}

STRICT CLINICAL RULES:
1. Use ONLY the provided STW data above. Do NOT invent, assume, or add medicines, doses, or advice from general medical knowledge.
2. NEVER state a medical diagnosis. Always use non-diagnostic phrasing such as "these values may be associated with...", "this pattern is seen in...", or "these results warrant clinical review for...".
3. Every single precaution and medicine item MUST include its valid 'source_stw_id'.
4. DO NOT provide specific dosage amounts or quantities (do NOT mention mg, mg/day, tablet numbers, etc.).
5. Write all explanations for a general reader at about an 8th-grade reading level (clear, accessible, avoiding complex medical jargon).
6. Copy generic drug names exactly as written in the STW.
"""

    candidate_models = [
        os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite").strip(),
        "gemini-3.5-flash-lite",
        "gemini-2.5-flash",
        "gemini-3.5-flash",
        "gemini-3.8-flash",
    ]
    candidate_models = list(dict.fromkeys(candidate_models))

    analysis_data = None
    for model_name in candidate_models:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1,
                ),
            )
            analysis_data = json.loads(response.text)
            break
        except Exception:
            continue

    if not analysis_data:
        # Fallback structured synthesis directly from top matched STW if AI call fails
        top_cond = top_3_conditions[0]
        analysis_data = {
            "main_findings": [
                {
                    "summary": f"Your out-of-range lab results show patterns commonly evaluated under the ICMR guideline for {top_cond.get('condition')}. A physician should assess these markers in context with your overall health.",
                    "related_tests": list(ranked_conditions[0]["matched_markers"]),
                    "possible_condition": top_cond.get("condition"),
                    "confidence_note": f"Matched based on {len(ranked_conditions[0]['matched_markers'])} overlapping biomarker(s).",
                    "source": {
                        "stw_id": top_cond.get("id"),
                        "source_file": top_cond.get("source_file")
                    }
                }
            ],
            "precautions": [
                {"text": p, "source_stw_id": top_cond.get("id")}
                for p in top_cond.get("lifestyle_precautions", [])[:4]
            ],
            "medicines": [
                {
                    "name": m.get("name"),
                    "purpose": m.get("purpose"),
                    "notes": m.get("notes"),
                    "source_stw_id": top_cond.get("id")
                }
                for m in top_cond.get("medicines", [])[:3]
            ],
            "see_a_doctor_if": top_cond.get("red_flags_refer_to_doctor", [])[:4],
            "tests_without_match": tests_without_match
        }

    # Ensure urgent_alert is always attached
    analysis_data["urgent_alert"] = urgent_alert
    analysis_data["tests_without_match"] = tests_without_match

    return analysis_data
