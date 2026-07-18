from backend.services.templates import get_template_graph
from backend.services.validation import validate_topology
from fastapi.testclient import TestClient
from backend.main import app

"""
File: test_builder.py
Author: Antigravity AI
Purpose: Unit and integration tests for Network Builder API endpoints and logic.
"""

client = TestClient(app)

def test_templates_retrieval():
    """Test retrieving list of templates returns all 5 choices."""
    response = client.get("/templates")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5
    ids = [t["id"] for t in data]
    assert "college" in ids
    assert "office" in ids
    assert "hospital" in ids
    assert "enterprise" in ids
    assert "blank" in ids

def test_template_load_endpoint():
    """Test loading specific template returns successful status and graph structure."""
    response = client.post("/template/load", json={"template": "office"})
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    graph = res_data["graph"]
    assert len(graph["nodes"]) > 0
    assert len(graph["edges"]) > 0

def test_validation_rules():
    """Test graph validator handles empty lists, valid graphs, and violations."""
    # Empty Graph (Error)
    response = client.post("/validate", json={"nodes": [], "edges": []})
    assert response.status_code == 200
    res = response.json()
    assert res["valid"] is False
    assert len(res["errors"]) > 0

    # Valid Office Template Graph
    office_graph = get_template_graph("office")
    response = client.post("/validate", json=office_graph)
    assert response.status_code == 200
    res = response.json()
    assert res["valid"] is True
    assert len(res["errors"]) == 0

    # Security Violation: Client directly connected to Internet
    violation_graph = {
        "nodes": [
            {"id": "NET-1", "label": "Internet", "type": "Internet", "status": "healthy", "position": {"x": 0, "y": 0}},
            {"id": "PC-1", "label": "My PC", "type": "PC", "status": "healthy", "position": {"x": 100, "y": 100}}
        ],
        "edges": [
            {"source": "PC-1", "target": "NET-1", "weight": 1.0, "latency": 10.0, "bandwidth": 100.0}
        ]
    }
    response = client.post("/validate", json=violation_graph)
    assert response.status_code == 200
    res = response.json()
    assert res["valid"] is False
    assert any("Security Violation" in err for err in res["errors"])
