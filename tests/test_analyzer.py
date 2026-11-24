import sys
import pytest
from pathlib import Path
from unittest.mock import MagicMock, patch

# Add project root and backend dir to sys.path
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / "backend"))

from backend import analyzer
from backend.critical_thresholds import evaluate_critical_values


class TestAnalyzerSafetyAndMatching:

    def test_all_normal_values_returns_clean_baseline(self):
        """When all tests are within normal biological ranges, returns routine baseline without medicines."""
        payload = {
            "tests": [
                {"name": "Hemoglobin", "value": 14.2, "unit": "g/dL", "reference_range": "13.0 - 17.0", "status": "normal"},
                {"name": "Fasting Blood Glucose", "value": 88, "unit": "mg/dL", "reference_range": "70 - 100", "status": "normal"},
                {"name": "Serum Creatinine", "value": 0.9, "unit": "mg/dL", "reference_range": "0.7 - 1.3", "status": "normal"}
            ]
        }
        result = analyzer.analyze(payload)
        
        assert result["status"] == "all_normal"
        assert result["urgent_alert"] is None
        assert len(result["medicines"]) == 0
        assert len(result["main_findings"]) >= 1
        assert "within standard physiological" in result["main_findings"][0]["summary"]
        assert result["tests_without_match"] == []

    def test_no_stw_match_returns_graceful_guidance(self):
        """When abnormal tests do not match any active ICMR STW in the knowledge base, do NOT invent advice."""
        payload = {
            "tests": [
                {"name": "Serum Uric Acid", "value": 9.5, "unit": "mg/dL", "reference_range": "3.5 - 7.2", "status": "high"},
                {"name": "Serum Amylase", "value": 180, "unit": "U/L", "reference_range": "30 - 110", "status": "high"}
            ]
        }
        result = analyzer.analyze(payload)

        assert result["status"] == "no_guideline_match"
        assert result["urgent_alert"] is None
        assert len(result["medicines"]) == 0
        assert "Serum Uric Acid" in result["tests_without_match"]
        assert "Serum Amylase" in result["tests_without_match"]
        assert len(result["main_findings"]) >= 1
        assert "Guideline Match Not Found" in result["main_findings"][0]["possible_condition"]

    def test_urgent_alert_glucose_panic_value(self):
        """Glucose >= 300 mg/dL triggers deterministic code-level urgent alert."""
        payload = {
            "tests": [
                {"name": "Fasting Blood Glucose", "value": 340, "unit": "mg/dL", "reference_range": "70 - 100", "status": "high"}
            ]
        }
        alert = evaluate_critical_values(payload["tests"])
        assert alert is not None
        assert "Critically elevated blood glucose (>= 300 mg/dL)" in alert
        assert "High risk of acute diabetic ketoacidosis" in alert

        # Confirm analyzer carries the urgent_alert
        result = analyzer.analyze(payload)
        assert result["urgent_alert"] == alert

    def test_urgent_alert_hemoglobin_critical_value(self):
        """Hemoglobin <= 7.0 g/dL triggers severe anemia emergency review alert."""
        payload = {
            "tests": [
                {"name": "Hemoglobin", "value": 5.8, "unit": "g/dL", "reference_range": "12.0 - 15.0", "status": "low"}
            ]
        }
        alert = evaluate_critical_values(payload["tests"])
        assert alert is not None
        assert "Critically low hemoglobin (<= 7.0 g/dL)" in alert
        assert "Severe anemia with risk of cardiac strain" in alert

        result = analyzer.analyze(payload)
        assert result["urgent_alert"] == alert

    def test_urgent_alert_creatinine_panic_value(self):
        """Creatinine >= 4.0 mg/dL triggers acute/chronic renal impairment alert."""
        payload = {
            "tests": [
                {"name": "Serum Creatinine", "value": 4.5, "unit": "mg/dL", "reference_range": "0.6 - 1.2", "status": "high"}
            ]
        }
        alert = evaluate_critical_values(payload["tests"])
        assert alert is not None
        assert "Critically elevated serum creatinine (>= 4.0 mg/dL)" in alert
        assert "acute kidney injury" in alert

    def test_matched_condition_with_mocked_ai(self):
        """Verifies matched condition formatting, source attribution, and non-diagnostic language with mocked Gemini."""
        payload = {
            "tests": [
                {"name": "Fasting Blood Glucose", "value": 180, "unit": "mg/dL", "reference_range": "70 - 100", "status": "high"},
                {"name": "HbA1c", "value": 8.4, "unit": "%", "reference_range": "4.0 - 5.6", "status": "high"}
            ]
        }

        mock_ai_json = {
            "main_findings": [
                {
                    "summary": "These elevated glucose and HbA1c values are frequently observed in patterns evaluated under the ICMR guideline for Type 2 Diabetes Mellitus.",
                    "related_tests": ["Fasting Blood Glucose", "HbA1c"],
                    "possible_condition": "Type 2 Diabetes Mellitus",
                    "confidence_note": "Matched based on elevated glycemic markers.",
                    "source": {"stw_id": "diabetes-type-2", "source_file": "Type 2 Diabetes Mellitus.pdf"}
                }
            ],
            "precautions": [
                {"text": "Engage in moderate-intensity physical activity for at least 150 minutes per week.", "source_stw_id": "diabetes-type-2"}
            ],
            "medicines": [
                {"name": "Metformin", "purpose": "First-line oral anti-hyperglycemic", "notes": "Administered with meals", "source_stw_id": "diabetes-type-2"}
            ],
            "see_a_doctor_if": ["Persistent blood glucose > 250 mg/dL", "Ketonuria or recurrent vomiting"],
            "tests_without_match": []
        }

        with patch("backend.analyzer.get_gemini_client") as mock_get_client:
            mock_client = MagicMock()
            mock_resp = MagicMock()
            import json
            mock_resp.text = json.dumps(mock_ai_json)
            mock_client.models.generate_content.return_value = mock_resp
            mock_get_client.return_value = mock_client

            result = analyzer.analyze(payload)

            assert len(result["main_findings"]) == 1
            finding = result["main_findings"][0]
            assert finding["possible_condition"] == "Type 2 Diabetes Mellitus"
            assert finding["source"]["stw_id"] == "diabetes-type-2"
            
            # Check medicines non-dosing and source citation
            assert len(result["medicines"]) >= 1
            med = result["medicines"][0]
            assert med["name"] == "Metformin"
            assert med["source_stw_id"] == "diabetes-type-2"
            # Verify no dosage units in notes
            assert "mg/day" not in med["notes"]
