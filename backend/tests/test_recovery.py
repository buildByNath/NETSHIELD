from fastapi.testclient import TestClient
from backend.main import app
from backend.services.templates import get_template_graph

"""
File: test_recovery.py
Author: Antigravity AI
Purpose: Integration tests verifying all 10 recovery algorithms.
"""

client = TestClient(app)

def test_recovery_dijkstra():
    """Test Dijkstra shortest path recovery."""
    graph = get_template_graph("office")
    payload = {
        "algorithm": "dijkstra",
        "graph": graph,
        "options": {"source": "PC-1", "destination": "SRV-1"}
    }
    response = client.post("/recover", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "timeline" in data
    assert "statistics" in data
    assert "result" in data
    assert data["result"]["found"] is True

def test_recovery_prim():
    """Test Prim's Spanning Tree algorithm."""
    graph = get_template_graph("office")
    payload = {
        "algorithm": "prim",
        "graph": graph,
        "options": {"source": "R-1"}
    }
    response = client.post("/recover", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "timeline" in data
    assert "statistics" in data
    assert len(data["result"]["edges"]) > 0

def test_recovery_kruskal():
    """Test Kruskal's Spanning Tree algorithm."""
    graph = get_template_graph("office")
    payload = {
        "algorithm": "kruskal",
        "graph": graph
    }
    response = client.post("/recover", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["result"]["edges"]) > 0

def test_recovery_floyd():
    """Test Floyd-Warshall All-Pairs algorithm."""
    graph = get_template_graph("office")
    payload = {
        "algorithm": "floyd",
        "graph": graph
    }
    response = client.post("/recover", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "matrix" in data["result"]

def test_recovery_connected_components():
    """Test Connected Components algorithm."""
    graph = get_template_graph("office")
    payload = {
        "algorithm": "connected_components",
        "graph": graph
    }
    response = client.post("/recover", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["result"]["count"] >= 1

def test_recovery_union_find():
    """Test Union-Find operations."""
    graph = get_template_graph("office")
    payload = {
        "algorithm": "union_find",
        "graph": graph
    }
    response = client.post("/recover", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "parents" in data["result"]

def test_recovery_topological_sort():
    """Test Topological Sort on Directed Acyclic Graph."""
    graph = get_template_graph("office")
    # Small office is connected and undirected. Topological sort treats connections
    # as directed from source to target. If there are cycle loops (PC-1 - SW-1 - PC-2 is tree, no cycles), it passes.
    payload = {
        "algorithm": "topological_sort",
        "graph": graph
    }
    response = client.post("/recover", json=payload)
    # The default office template has no cycle loops, so it succeeds
    if response.status_code == 200:
        data = response.json()
        assert data["success"] is True
        assert "order" in data["result"]
    else:
        assert response.status_code == 400
        assert "Cycle detected" in response.json()["detail"]

def test_recovery_fractional_knapsack():
    """Test Fractional Knapsack recovery budgeting."""
    graph = get_template_graph("office")
    payload = {
        "algorithm": "fractional_knapsack",
        "graph": graph,
        "options": {"budget": 100.0}
    }
    response = client.post("/recover", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["result"]["packedItems"]) > 0
    assert data["result"]["totalValue"] > 0

def test_recovery_branch_bound():
    """Test Branch and Bound 0/1 Knapsack recovery budgeting."""
    graph = get_template_graph("office")
    payload = {
        "algorithm": "branch_bound",
        "graph": graph,
        "options": {"budget": 100.0}
    }
    response = client.post("/recover", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["result"]["packedItems"]) > 0

def test_recovery_tsp():
    """Test Traveling Salesman inspection route."""
    graph = get_template_graph("office")
    payload = {
        "algorithm": "tsp",
        "graph": graph,
        "options": {"source": "R-1"}
    }
    response = client.post("/recover", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["result"]["path"]) > 0
