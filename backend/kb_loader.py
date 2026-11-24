import json
from pathlib import Path
from typing import Dict, List, Optional

KB_DIR = Path(__file__).resolve().parent / "knowledge_base"

# In-memory storage for loaded STW conditions
_CONDITIONS: Dict[str, dict] = {}


def load_knowledge_base() -> Dict[str, dict]:
    """
    Loads all ICMR Standard Treatment Workflow JSON files from backend/knowledge_base/
    into memory.
    """
    global _CONDITIONS
    _CONDITIONS.clear()

    if not KB_DIR.exists():
        KB_DIR.mkdir(parents=True, exist_ok=True)
        return _CONDITIONS

    json_files = list(KB_DIR.glob("*.json"))
    for file_path in json_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                condition_id = data.get("id") or file_path.stem
                _CONDITIONS[condition_id] = data
        except Exception as e:
            print(f"[Warning] Failed to load STW JSON {file_path.name}: {e}")

    return _CONDITIONS


def get_all_conditions() -> List[dict]:
    """
    Returns high-level summary of all loaded conditions for listings.
    """
    if not _CONDITIONS:
        load_knowledge_base()

    summaries = []
    for cond_id, data in _CONDITIONS.items():
        summaries.append({
            "id": cond_id,
            "condition": data.get("condition", "Unknown Condition"),
            "specialty": data.get("specialty", "General"),
            "source_file": data.get("source_file", "ICMR STW Guidelines"),
            "marker_count": len(data.get("related_lab_markers", [])),
            "medicine_count": len(data.get("medicines", [])),
            "related_lab_markers": data.get("related_lab_markers", []),
        })

    # Sort alphabetically by condition name
    summaries.sort(key=lambda x: x["condition"].lower())
    return summaries


def get_condition_by_id(condition_id: str) -> Optional[dict]:
    """
    Returns full STW guideline record by condition ID.
    """
    if not _CONDITIONS:
        load_knowledge_base()
    return _CONDITIONS.get(condition_id)


def find_conditions_by_marker(marker_name: str) -> List[dict]:
    """
    Performs case-insensitive matching on related_lab_markers.
    Matches if marker_name is a substring of any marker, or vice-versa.
    """
    if not _CONDITIONS:
        load_knowledge_base()

    if not marker_name:
        return []

    query = marker_name.strip().lower()
    matches = []

    for _, cond in _CONDITIONS.items():
        markers = cond.get("related_lab_markers", [])
        matched = False
        for m in markers:
            m_lower = str(m).strip().lower()
            if query == m_lower or query in m_lower or m_lower in query:
                matched = True
                break
        if matched:
            matches.append(cond)

    return matches


# Load into memory on module import
load_knowledge_base()

