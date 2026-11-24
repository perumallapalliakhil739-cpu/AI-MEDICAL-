import os
import time
import json
import sys
import traceback
from collections import defaultdict
from pathlib import Path
from typing import List, Optional, Union, Dict, Any
from fastapi import FastAPI, File, UploadFile, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Ensure both project root and backend dir are in sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir.parent) not in sys.path:
    sys.path.insert(0, str(backend_dir.parent))
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

load_dotenv(backend_dir / ".env")

try:
    from backend import kb_loader
    from backend import analyzer
except ImportError:
    import kb_loader
    import analyzer

app = FastAPI(
    title="MedScan AI Backend",
    description="FastAPI service for scanning medical lab reports and querying ICMR STW Knowledge Base",
    version="1.3.0",
)

# Enable CORS for frontend development server
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sliding window rate limiter (10 requests per minute per IP)
RATE_LIMIT_WINDOW = 60.0  # seconds
MAX_REQUESTS_PER_MINUTE = 10
_client_timestamps = defaultdict(list)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if request.url.path == "/api/scan" and request.method == "POST":
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        _client_timestamps[client_ip] = [
            t for t in _client_timestamps[client_ip] if now - t < RATE_LIMIT_WINDOW
        ]
        if len(_client_timestamps[client_ip]) >= MAX_REQUESTS_PER_MINUTE:
            print(f"[Rate Limit] IP {client_ip} exceeded {MAX_REQUESTS_PER_MINUTE} requests/min", flush=True)
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": f"Rate limit exceeded (maximum {MAX_REQUESTS_PER_MINUTE} scans per minute). Please wait a moment before uploading another report.",
                    "status_code": 429
                }
            )
        _client_timestamps[client_ip].append(now)
    return await call_next(request)


# ============================================================================
# Global Exception Handlers (Always returns {"error": "..."})
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    print(f"\n[HTTP {exc.status_code} Error on {request.method} {request.url.path}]: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": str(exc.detail), "status_code": exc.status_code}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_msg = "; ".join([f"{err.get('loc', ['field'])[-1]}: {err.get('msg', 'validation error')}" for err in exc.errors()])
    print(f"\n[Validation Error on {request.method} {request.url.path}]: {error_msg}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": error_msg, "status_code": 422}
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    print("\n" + "=" * 80)
    print(f"[UNHANDLED BACKEND EXCEPTION] on {request.method} {request.url.path}:")
    traceback.print_exc()
    print("=" * 80 + "\n")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": f"Internal Server Error: {str(exc)}",
            "type": type(exc).__name__,
            "status_code": 500
        }
    )


import time
from collections import defaultdict

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB in bytes
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB in bytes
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}

# Response Data Schemas
class TestItem(BaseModel):
    name: str = Field(description="Name of the test parameter")
    value: Union[float, int, str, None] = Field(default=None, description="Reported test value")
    unit: Optional[str] = Field(default=None, description="Unit of measurement")
    reference_range: Optional[str] = Field(default=None, description="Normal biological reference interval")
    status: str = Field(default="unknown", description="Status: low | normal | high | unknown")

class ScanReportResponse(BaseModel):
    report_type: Optional[str] = None
    report_date: Optional[str] = None
    lab_name: Optional[str] = None
    tests: List[TestItem] = []
    analysis: Optional[Dict[str, Any]] = None


# ============================================================================
# Health Check Endpoint
# ============================================================================

@app.get("/api/health")
def health_check():
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    is_configured = bool(api_key and api_key != "your_gemini_api_key_here")
    conditions = kb_loader.get_all_conditions()
    return {
        "status": "online",
        "service": "MedScan AI Backend",
        "model": os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite"),
        "gemini_api_key_configured": is_configured,
        "kb_conditions_count": len(conditions),
    }


# ============================================================================
# ICMR STW Knowledge Base Endpoints
# ============================================================================

@app.get("/api/conditions")
def list_conditions():
    """Returns list of all available ICMR Standard Treatment Workflow conditions."""
    return kb_loader.get_all_conditions()


@app.get("/api/conditions/{condition_id}")
def get_condition_detail(condition_id: str):
    """Returns full structured ICMR STW guideline JSON for a given condition ID."""
    condition = kb_loader.get_condition_by_id(condition_id)
    if not condition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Condition '{condition_id}' not found in the ICMR knowledge base."
        )
    return condition


@app.post("/api/analyze")
def analyze_report(payload: dict):
    """Analyzes a laboratory report payload against the ICMR STW knowledge base."""
    try:
        return analyzer.analyze(payload)
    except Exception as e:
        print("\n" + "=" * 80)
        print("[ERROR in /api/analyze]:")
        traceback.print_exc()
        print("=" * 80 + "\n")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis engine error: {str(e)}"
        )


# ============================================================================
# Report Scanning & Analysis Endpoint
# ============================================================================

@app.post("/api/scan", response_model=ScanReportResponse)
def scan_report(file: UploadFile = File(...)):
    """
    Accepts one medical report file (PDF, JPG, PNG, max 10MB).
    Reads the file purely in-memory, extracts structured laboratory data using Gemini API,
    and analyzes abnormal biomarkers against the ICMR STW Knowledge Base in one response.
    Ran synchronously in a threadpool to prevent blocking the async event loop.
    Rate limited to 10 requests/min via HTTP middleware.
    """
    # 1. Validate file extension and MIME type
    content_type = (file.content_type or "").lower()
    filename = (file.filename or "").lower()

    is_valid_mime = content_type in ALLOWED_MIME_TYPES
    is_valid_ext = any(filename.endswith(ext) for ext in [".pdf", ".jpg", ".jpeg", ".png", ".webp"])

    if not (is_valid_mime or is_valid_ext):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{content_type or filename}'. Please upload a valid PDF, JPG, or PNG report."
        )

    # Normalize mime type for Gemini
    normalized_mime = content_type
    if not is_valid_mime:
        if filename.endswith(".pdf"):
            normalized_mime = "application/pdf"
        elif filename.endswith((".jpg", ".jpeg")):
            normalized_mime = "image/jpeg"
        elif filename.endswith(".png"):
            normalized_mime = "image/png"
        elif filename.endswith(".webp"):
            normalized_mime = "image/webp"

    # 2. Process file strictly in memory and enforce 10MB size limit
    try:
        contents = file.file.read()
    except Exception as read_err:
        print("[ERROR] Failed to read uploaded file:", flush=True)
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file into memory: {str(read_err)}"
        )

    file_size = len(contents)

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty (0 bytes). Please upload a valid medical report."
        )

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds the 10 MB limit ({file_size / (1024 * 1024):.1f} MB uploaded). Please upload a smaller file."
        )

    # 3. Verify Gemini API Key configuration
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key or api_key == "your_gemini_api_key_here":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY is not configured in backend/.env. Please add a valid Google Gemini API key."
        )

    primary_model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite").strip()
    candidate_models = [primary_model]
    for fallback in ["gemini-3.5-flash-lite", "gemini-2.5-flash", "gemini-3.5-flash", "gemini-3.8-flash"]:
        if fallback not in candidate_models:
            candidate_models.append(fallback)

    # 4. Call Google Gemini API
    from google import genai
    from google.genai import types

    try:
        client = genai.Client(api_key=api_key, http_options=types.HttpOptions(timeout=25000))
    except Exception as client_err:
        print("[ERROR] Failed to initialize Gemini client:", flush=True)
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize Gemini API client: {str(client_err)}"
        )

    prompt = """You are an expert clinical laboratory report parser. Read the attached medical report file.
Extract all laboratory test parameters printed on this report.

Return ONLY a valid JSON object matching this schema:
{
  "report_type": "e.g. Blood test, Lipid profile, CBC, etc. (string or null)",
  "report_date": "Date printed on report, else null",
  "lab_name": "Name of diagnostic laboratory / hospital, else null",
  "tests": [
    {
      "name": "Test name (e.g. Hemoglobin, Total Cholesterol)",
      "value": "Value printed (e.g. 10.2, Positive, 140)",
      "unit": "Unit of measurement (e.g. g/dL, mg/dL) or null",
      "reference_range": "Normal biological reference interval printed in report, else null",
      "status": "low | normal | high | unknown"
    }
  ]
}

CRITICAL RULES:
1. Extract ONLY what is explicitly printed in the report.
2. Do NOT invent, assume, or hallucinate values, units, or reference ranges.
3. Status MUST be strictly one of: "low", "normal", "high", "unknown".
4. If no reference range is printed for a test or it cannot be reliably determined, set status to "unknown".
5. Return null for any missing or unprinted fields.
6. If the uploaded document is NOT a medical lab report, or the text is completely illegible/unreadable, return:
{
  "error": "The uploaded file does not appear to be a readable medical laboratory report.",
  "report_type": null,
  "report_date": null,
  "lab_name": null,
  "tests": []
}
"""

    file_part = types.Part.from_bytes(
        data=contents,
        mime_type=normalized_mime,
    )

    parsed_data = None
    last_error = None

    for model_name in candidate_models:
        try:
            print(f"[Gemini Scan] Attempting extraction with model '{model_name}' on file '{filename}'...", flush=True)
            response = client.models.generate_content(
                model=model_name,
                contents=[file_part, prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1,
                ),
            )
            response_text = response.text or "{}"
            parsed_data = json.loads(response_text)
            print(f"[Gemini Scan] Successfully extracted data using model '{model_name}'.", flush=True)
            break
        except json.JSONDecodeError as json_err:
            print(f"[ERROR] JSON decode error from model '{model_name}':", flush=True)
            traceback.print_exc()
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to parse structured JSON from AI response: {str(json_err)}"
            )
        except Exception as e:
            error_str = str(e)
            last_error = error_str
            print(f"[Notice] Extraction attempt with model '{model_name}' failed: {error_str[:120]}", flush=True)
            if "API_KEY_INVALID" in error_str or "API key not valid" in error_str:
                print("[ERROR] Invalid API Key detected:", flush=True)
                traceback.print_exc()
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="The provided GEMINI_API_KEY is invalid. Please check your key in backend/.env"
                )
            if "503" in error_str or "UNAVAILABLE" in error_str or "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                continue
            # For other errors, print full traceback to terminal
            print(f"[ERROR] Exception during model call '{model_name}':", flush=True)
            traceback.print_exc()

    if parsed_data is None:
        print("\n" + "=" * 80)
        print("[ERROR] All candidate Gemini models failed:")
        if last_error:
            print(f"Last error: {last_error}")
        print("=" * 80 + "\n")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"All Gemini models are temporarily busy or unreachable. {last_error or 'Please try again in a few moments.'}"
        )

    # 5. Validate output structure
    if parsed_data.get("error"):
        print(f"[INFO] Document validation failed: {parsed_data['error']}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=parsed_data["error"]
        )

    raw_tests = parsed_data.get("tests", [])
    if not raw_tests or len(raw_tests) == 0:
        print("[INFO] No test results detected in document.")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No test results could be detected in this document. Please ensure you upload a clear, legible laboratory report."
        )

    # Normalize status values
    cleaned_tests = []
    for test in raw_tests:
        status_val = str(test.get("status", "unknown")).strip().lower()
        if status_val not in {"low", "normal", "high", "unknown"}:
            status_val = "unknown"
        cleaned_tests.append(TestItem(
            name=str(test.get("name") or "Unknown Test"),
            value=test.get("value"),
            unit=test.get("unit"),
            reference_range=test.get("reference_range"),
            status=status_val,
        ))

    scan_payload = {
        "report_type": parsed_data.get("report_type"),
        "report_date": parsed_data.get("report_date"),
        "lab_name": parsed_data.get("lab_name"),
        "tests": [t.model_dump() for t in cleaned_tests],
    }

    # 6. Execute STW Analysis Engine
    try:
        analysis_result = analyzer.analyze(scan_payload)
    except Exception as e:
        print("\n" + "=" * 80)
        print("[ERROR] Analysis engine encountered an exception:")
        traceback.print_exc()
        print("=" * 80 + "\n")
        analysis_result = {
            "status": "error",
            "urgent_alert": None,
            "main_findings": [],
            "precautions": [],
            "medicines": [],
            "see_a_doctor_if": ["Consult your physician to review these laboratory results."],
            "tests_without_match": [t.name for t in cleaned_tests if t.status in {"low", "high"}]
        }

    return ScanReportResponse(
        report_type=scan_payload["report_type"],
        report_date=scan_payload["report_date"],
        lab_name=scan_payload["lab_name"],
        tests=cleaned_tests,
        analysis=analysis_result,
    )
