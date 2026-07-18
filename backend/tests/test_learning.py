from fastapi.testclient import TestClient
from backend.main import app

"""
File: test_learning.py
Author: Antigravity AI
Purpose: Integration tests verifying educational algorithms endpoints.
"""

client = TestClient(app)

def test_simulate_sort_merge():
    """Test Merge Sort simulation endpoint."""
    payload = {
        "algorithm": "merge_sort",
        "options": {"array": [5, 2, 9, 1, 5, 6]}
    }
    response = client.post("/simulate/sort", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "timeline" in data
    assert "statistics" in data
    assert data["result"]["sortedArray"] == [1, 2, 5, 5, 6, 9]

def test_simulate_sort_quicksort():
    """Test Randomized Quick Sort simulation endpoint."""
    payload = {
        "algorithm": "quick_sort",
        "options": {"array": [10, -2, 5, 8, 1]}
    }
    response = client.post("/simulate/sort", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["result"]["sortedArray"] == [-2, 1, 5, 8, 10]

def test_simulate_dp_matrix_chain():
    """Test Matrix Chain DP simulation endpoint."""
    payload = {
        "options": {"dimensions": [10, 20, 30, 40]}
    }
    response = client.post("/simulate/dp", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "optimalOrder" in data["result"]
    assert "costMatrix" in data["timeline"][0]

def test_simulate_strassen():
    """Test Strassen 2x2 simulation endpoint."""
    payload = {
        "options": {
            "A": [[1, 0], [0, 1]],
            "B": [[5, 6], [7, 8]]
        }
    }
    response = client.post("/simulate/strassen", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["result"]["matrixC"] == [[5, 6], [7, 8]]

def test_simulate_nqueens():
    """Test N-Queens backtracking simulation endpoint."""
    payload = {
        "options": {"N": 4}
    }
    response = client.post("/simulate/nqueens", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["result"]["count"] == 2 # 4x4 has exactly 2 solutions
