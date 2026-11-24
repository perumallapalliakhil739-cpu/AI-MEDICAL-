import sys
from pathlib import Path
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / "backend"))

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_rate_limiter_blocks_eleventh_request():
    """Verify that more than 10 requests within a minute triggers 429 Too Many Requests."""
    # Send 10 fast requests (even empty/invalid ones will hit rate limiter before validation)
    for i in range(10):
        resp = client.post("/api/scan", data={})
        # Could be 422 (validation error) or 200, but NOT 429
        assert resp.status_code != 429

    # 11th request must be 429 Too Many Requests
    resp11 = client.post("/api/scan", data={})
    assert resp11.status_code == 429
    data = resp11.json()
    assert "Rate limit exceeded" in data["error"]
