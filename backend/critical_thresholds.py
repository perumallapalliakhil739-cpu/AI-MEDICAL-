"""
========================================================================================
CRITICAL THRESHOLDS CONFIGURATION - MEDSCAN AI SAFETY SYSTEM
========================================================================================

IMPORTANT MEDICAL NOTICE:
These thresholds represent initial high-acuity laboratory "panic value" benchmarks.
THEY MUST BE FORMALLY REVIEWED, CALIBRATED, AND SIGNED OFF BY A QUALIFIED
MEDICAL BOARD OR REGISTERED PATHOLOGIST BEFORE ANY REAL-WORLD CLINICAL OR PRODUCTION USE.

Rules are evaluated deterministically in Python code (NOT by generative AI) to guarantee
zero hallucination for urgent medical triage alerts.
========================================================================================
"""

import re
from typing import List, Dict, Optional, Any

# Critical Rule Definitions
# Each rule specifies parameter matching tokens, critical numeric triggers, and emergency advisories.
CRITICAL_RULES = [
    {
        "id": "critical-glucose-high",
        "name": "Severe Hyperglycemia",
        "keywords": ["glucose", "fbs", "ppbs", "rbs", "blood sugar", "fasting glucose", "postprandial glucose"],
        "unit_hints": ["mg/dl"],
        "operator": ">=",
        "threshold": 300.0,
        "message": "Critically elevated blood glucose (>= 300 mg/dL). High risk of acute diabetic ketoacidosis (DKA) or hyperosmolar crisis. Seek emergency medical care immediately.",
    },
    {
        "id": "critical-glucose-low",
        "name": "Severe Hypoglycemia",
        "keywords": ["glucose", "fbs", "rbs", "blood sugar", "fasting glucose"],
        "unit_hints": ["mg/dl"],
        "operator": "<=",
        "threshold": 50.0,
        "message": "Critically low blood glucose (<= 50 mg/dL). Severe neuroglycopenia risk. Take fast-acting oral glucose and seek emergency clinical attention if symptomatic.",
    },
    {
        "id": "critical-hemoglobin-low",
        "name": "Severe Anemia",
        "keywords": ["hemoglobin", "hb", "haemoglobin"],
        "unit_hints": ["g/dl", "gm/dl"],
        "operator": "<=",
        "threshold": 7.0,
        "message": "Critically low hemoglobin (<= 7.0 g/dL). Severe anemia with risk of cardiac strain and tissue hypoxia. Prompt emergency in-person medical evaluation is advised.",
    },
    {
        "id": "critical-creatinine-high",
        "name": "Severe Renal Impairment",
        "keywords": ["creatinine", "serum creatinine"],
        "unit_hints": ["mg/dl"],
        "operator": ">=",
        "threshold": 4.0,
        "message": "Critically elevated serum creatinine (>= 4.0 mg/dL). Indicates potential acute kidney injury or severe renal decompensation. Urgent nephrology consultation is required.",
    },
    {
        "id": "critical-potassium-high",
        "name": "Severe Hyperkalemia",
        "keywords": ["potassium", "k+", "serum potassium"],
        "unit_hints": ["mmol/l", "meq/l"],
        "operator": ">=",
        "threshold": 6.0,
        "message": "Critically high potassium (>= 6.0 mmol/L). Severe danger of life-threatening cardiac arrhythmias. Immediate emergency room attendance is required.",
    },
    {
        "id": "critical-potassium-low",
        "name": "Severe Hypokalemia",
        "keywords": ["potassium", "k+", "serum potassium"],
        "unit_hints": ["mmol/l", "meq/l"],
        "operator": "<=",
        "threshold": 2.8,
        "message": "Critically low potassium (<= 2.8 mmol/L). Danger of muscle paralysis and cardiac conduction abnormalities. Immediate medical evaluation needed.",
    },
    {
        "id": "critical-platelets-low",
        "name": "Severe Thrombocytopenia",
        "keywords": ["platelet", "platelets", "plt count", "platelet count"],
        "unit_hints": ["thou/cumm", "x10^3/ul", "/ul", "cumm", "lakh"],
        "operator": "<=",
        "threshold": 30.0,  # Note: handles normalized scale <= 30k or <= 30 (thousands)
        "message": "Critically low platelet count (<= 30,000 /µL). Severe spontaneous bleeding risk. Seek urgent hematology or emergency evaluation.",
    },
    {
        "id": "critical-troponin-high",
        "name": "Myocardial Injury",
        "keywords": ["troponin", "trop i", "trop t", "high sensitivity troponin", "hs-ctni"],
        "unit_hints": ["ng/ml", "pg/ml"],
        "operator": ">=",
        "threshold": 0.05,
        "message": "Elevated cardiac troponin. Highly suggestive of acute myocardial ischemia/injury. Proceed to the nearest cardiac emergency center immediately.",
    },
]


def extract_numeric_value(raw_val: Any) -> Optional[float]:
    """
    Attempts to extract a clean floating-point number from numeric, string, or mixed inputs.
    e.g., "164 mg/dL" -> 164.0, "> 350" -> 350.0, 10.2 -> 10.2
    """
    if raw_val is None:
        return None
    if isinstance(raw_val, (int, float)):
        return float(raw_val)

    val_str = str(raw_val).strip().replace(",", "")
    match = re.search(r"[-+]?\d*\.?\d+", val_str)
    if match:
        try:
            return float(match.group(0))
        except ValueError:
            return None
    return None


def evaluate_critical_values(tests: List[Dict[str, Any]]) -> Optional[str]:
    """
    Scans a list of tests against the critical-value safety rules.
    Returns a unified urgent_alert message if any critical threshold is breached,
    or None if no critical panic values are triggered.
    """
    triggered_alerts = []

    for test in tests:
        test_name = str(test.get("name", "")).strip().lower()
        test_val = extract_numeric_value(test.get("value"))

        if test_val is None:
            continue

        for rule in CRITICAL_RULES:
            # Check if test name matches any rule keywords
            matched_keyword = any(kw in test_name for kw in rule["keywords"])
            if not matched_keyword:
                continue

            op = rule["operator"]
            thresh = rule["threshold"]
            breached = False

            # Special case for platelets (scaled in thousands or raw counts)
            if "platelet" in rule["id"]:
                if test_val > 1000 and test_val <= 30000:
                    breached = True
                elif test_val <= 30.0:
                    breached = True
            elif op == ">=" and test_val >= thresh:
                breached = True
            elif op == "<=" and test_val <= thresh:
                breached = True

            if breached:
                triggered_alerts.append(
                    f"{rule['name']} ({test.get('name')}: {test.get('value')} {test.get('unit') or ''}). {rule['message']}"
                )

    if not triggered_alerts:
        return None

    # Join alerts into a prominent safety advisory
    return "URGENT MEDICAL ATTENTION ADVISED: " + " | ".join(triggered_alerts)

