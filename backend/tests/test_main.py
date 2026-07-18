from fastapi.testclient import TestClient
from backend.main import app

"""
File: test_main.py
Author: Antigravity AI
Purpose: Integration tests verifying baseline API functionality.
"""

client = TestClient(app)

def test_health_check():
    """
    Test the health check endpoint returns 200 and the online status json.
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "online"}

def test_report_compilation():
    """Test report compilation endpoint."""
    payload = {
        "graph": {"nodes": [], "edges": []},
        "metadata": {"projectName": "Lab Test", "author": "Student-1"},
        "runs": []
    }
    response = client.post("/report", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["report"]["projectName"] == "Lab Test"

