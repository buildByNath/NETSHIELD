from fastapi.testclient import TestClient
from backend.main import app
from backend.services.templates import get_template_graph

"""
File: test_simulation.py
Author: Antigravity AI
Purpose: Integration tests verifying attack simulation routing and responses.
"""

client = TestClient(app)

def test_simulation_bfs_worm():
    """Test standard BFS Worm simulation endpoint."""
    office_graph = get_template_graph("office")
    
    # Request simulation using BFS from Router (R-1)
    payload = {
      "algorithm": "bfs",
      "graph": office_graph,
      "startNodes": ["R-1"]
    }
    
    response = client.post("/simulate", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["success"] is True
    assert "timeline" in data
    assert "statistics" in data
    assert "learning" in data
    
    # Verify timeline frames structure
    timeline = data["timeline"]
    assert len(timeline) > 0
    first_frame = timeline[0]
    assert "frame" in first_frame
    assert "currentNode" in first_frame
    assert "visited" in first_frame
    assert "queue" in first_frame
    assert "stack" in first_frame
    assert "action" in first_frame
    assert "R-1" in first_frame["visited"]

def test_simulation_dfs_scanner():
    """Test standard DFS port scanner simulation endpoint."""
    office_graph = get_template_graph("office")
    
    # Request simulation using DFS from Switch (SW-1)
    payload = {
      "algorithm": "dfs",
      "graph": office_graph,
      "startNodes": ["SW-1"]
    }
    
    response = client.post("/simulate", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["success"] is True
    assert "timeline" in data
    assert "statistics" in data
    
    timeline = data["timeline"]
    assert len(timeline) > 0
    # Stack should be used for DFS
    has_stack_items = any(len(frame["stack"]) > 0 for frame in timeline)
    assert has_stack_items is True

def test_simulation_multi_bfs():
    """Test multi-source BFS simulation endpoint."""
    office_graph = get_template_graph("office")
    
    # Request simulation starting from PC-1 and AP-1 simultaneously
    payload = {
      "algorithm": "multi_bfs",
      "graph": office_graph,
      "startNodes": ["PC-1", "AP-1"]
    }
    
    response = client.post("/simulate", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["success"] is True
    timeline = data["timeline"]
    assert len(timeline) > 0
    first_frame = timeline[0]
    assert "PC-1" in first_frame["visited"]
    assert "AP-1" in first_frame["visited"]
    assert len(first_frame["visited"]) >= 2
