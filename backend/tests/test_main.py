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




