# MedScan AI — Quality Assurance & Test Verification Plan

This document establishes the comprehensive test plan and manual verification procedures for MedScan AI, covering clinical biomarker extraction, ICMR guideline mapping, critical alert generation, safety rules, and boundary/error conditions.

---

## Test Execution Matrix

| ID | Test Scenario | Description / Input Type | Expected System Behavior | Verification Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-01** | **Normal Report** | Laboratory panel where all extracted parameters fall within normal physiological reference ranges. | Returns `"status": "all_normal"`. UI shows green "Normal" badges, routine wellness lifestyle advice, no medication recommendations, and confirms all values are in range. | **PASS** |
| **TC-02** | **Abnormal Diabetes Report** | Fasting Blood Sugar $\ge 160$ mg/dL and/or HbA1c $\ge 8.0\%$. | Extracts high status flags. Matches ICMR STW `diabetes-type-2`. Generates non-diagnostic 8th-grade summary, dietary precautions, first-line generic medicines (Metformin) with STW source citations, and follow-up criteria. | **PASS** |
| **TC-03** | **Low Hemoglobin Report** | Hemoglobin $< 10.0$ g/dL (e.g., $9.2$ g/dL) or low ferritin/MCV. | Flags low status. Correlates with ICMR STW `nutritional-anemia`. Displays dietary iron guidance, oral iron/folic acid therapies with source badges, and red flag warnings. | **PASS** |
| **TC-04** | **Critical Panic Values (Urgent Alert)** | Critical threshold triggered: Blood Glucose $\ge 300$ mg/dL, Hemoglobin $\le 7.0$ g/dL, or Creatinine $\ge 4.0$ mg/dL. | Deterministic `critical_thresholds.py` rule triggers immediately. Displays prominent red **Urgent Alert** banner at top of Results page and in downloadable PDF. | **PASS** |
| **TC-05** | **Abnormal Test with No STW Match** | Biomarkers outside standard range that have no corresponding protocol in the loaded ICMR KB (e.g., elevated Uric Acid, Amylase, Alkaline Phosphatase). | Returns `"status": "no_guideline_match"`. Does NOT invent medicines or hallucinate diagnoses. Displays an un-matched guidelines notice directing the user to discuss these specific tests with their doctor. | **PASS** |
| **TC-06** | **Non-Medical Image** | Upload of an arbitrary photo (e.g. landscape, receipt, pet, document with no clinical lab markers). | Multimodal vision validation detects no laboratory parameters. Endpoint rejects request with `422 Unprocessable Content` and friendly error prompt. | **PASS** |
| **TC-07** | **Corrupted PDF / Empty File** | Empty 0-byte file or corrupted binary file pretending to be `.pdf`. | Backend detects 0-byte stream or invalid syntax and immediately raises `400 Bad Request` without executing Gemini AI calls. | **PASS** |
| **TC-08** | **Oversized File (> 10 MB)** | File payload exceeding the 10 MB maximum upload ceiling (e.g., 12 MB scan). | Rejected with `400 Bad Request` informing user that file exceeds the 10 MB boundary. | **PASS** |
| **TC-09** | **Rate Limiter (10 req/min)** | Sending $> 10$ scan requests within a 60-second window from the same client IP. | Backend rate limiter responds with `429 Too Many Requests` (`"Rate limit exceeded (maximum 10 scans per minute)"`). | **PASS** |
| **TC-10** | **Backend Offline Graceful Recovery** | User accesses frontend when FastAPI backend on port 8000 is stopped or unreachable. | Frontend shows amber "Backend Service Unreachable" banner with an active "Retry Connection" button. Prevents hang at 92%. | **PASS** |

---

## Detailed Test Procedures

### 1. TC-01: Normal Report
- **Payload:**
  ```json
  {
    "tests": [
      {"name": "Hemoglobin", "value": 14.5, "unit": "g/dL", "reference_range": "13.0 - 17.0", "status": "normal"},
      {"name": "Fasting Blood Glucose", "value": 85, "unit": "mg/dL", "reference_range": "70 - 100", "status": "normal"},
      {"name": "Serum Creatinine", "value": 0.9, "unit": "mg/dL", "reference_range": "0.7 - 1.3", "status": "normal"}
    ]
  }
  ```
- **Verification:**
  1. `analyzer.analyze()` returns `"status": "all_normal"`.
  2. `urgent_alert` is `null`.
  3. No prescription medicines are suggested.

### 2. TC-02: Abnormal Diabetes Report
- **Payload:**
  ```json
  {
    "tests": [
      {"name": "Fasting Blood Glucose", "value": 185, "unit": "mg/dL", "reference_range": "70 - 100", "status": "high"},
      {"name": "HbA1c", "value": 8.5, "unit": "%", "reference_range": "4.0 - 5.6", "status": "high"}
    ]
  }
  ```
- **Verification:**
  1. Matches condition `diabetes-type-2`.
  2. Summary uses non-diagnostic phrasing ("these patterns are commonly evaluated under...").
  3. All medications cite `source_stw_id: "diabetes-type-2"`.
  4. No dosage numbers (e.g., mg/day) are included.

### 3. TC-04: Critical Panic Value Alert
- **Payload:**
  ```json
  {
    "tests": [
      {"name": "Hemoglobin", "value": 6.2, "unit": "g/dL", "reference_range": "12.0 - 15.0", "status": "low"}
    ]
  }
  ```
- **Verification:**
  1. Triggers `urgent_alert`: `"CRITICAL LAB VALUE DETECTED: Hemoglobin (6.2 g/dL) is severely low (< 7.0 g/dL)..."`.
  2. UI displays red warning alert at the top of the Results screen.

### 4. TC-05: Abnormal Marker with No STW Match
- **Payload:**
  ```json
  {
    "tests": [
      {"name": "Serum Uric Acid", "value": 9.8, "unit": "mg/dL", "reference_range": "3.5 - 7.2", "status": "high"}
    ]
  }
  ```
- **Verification:**
  1. Returns `"status": "no_guideline_match"`.
  2. `tests_without_match` contains `["Serum Uric Acid"]`.
  3. Does not invent non-existent ICMR workflows.

### 5. TC-09: Rate Limiting
- **Procedure:** Execute 11 rapid requests to `POST /api/scan`.
- **Verification:**
  - Requests 1–10 return normal HTTP response.
  - Request 11 returns `429 Too Many Requests`.

