from fastapi import APIRouter, HTTPException, Body
from backend.schemas.schemas import GraphData, ProjectState, ValidationResult
from backend.services.templates import get_template_graph
from backend.services.validation import validate_topology
import os
import json
from typing import Dict, Any

"""
File: routes.py
Author: Antigravity AI
Purpose: API router defining endpoints for templates, graph validation, and project save/load.
"""

router = APIRouter()

STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage")

@router.get("/templates")
async def get_templates():
    """
    Get all available topology templates.
    """
    return [
        {
            "id": "college",
            "name": "College Campus (Default)",
            "description": "Hierarchical department layout (~104 nodes) containing Core, Admin, CSE, ECE, Library subnets and servers."
        },
        {
            "id": "office",
            "name": "Small Office",
            "description": "Simple subnet (~10 nodes) containing a Router, Firewall, Switch, Workstations, Printer, and local NAS."
        },
        {
            "id": "hospital",
            "name": "Hospital Network",
            "description": "Segmented hospital network dividing ICU medical monitors, Billing administrative staff, and Guest Wifi APs."
        },
        {
            "id": "enterprise",
            "name": "Enterprise Redundancy",
            "description": "Enterprise-grade layout with dual-ISP connections, dual Firewalls, redundant routers, and database clusters."
        },
        {
            "id": "blank",
            "name": "Blank Canvas",
            "description": "Clean slate workspace allowing you to build custom topologies from scratch."
        }
    ]

@router.post("/template/load")
async def load_template(payload: Dict[str, str] = Body(...)):
    """
    Generate graph nodes and edges for the requested template.
    """
    template_id = payload.get("template")
    if not template_id:
        raise HTTPException(status_code=400, detail="Missing 'template' identifier in request body.")
    try:
        graph = get_template_graph(template_id)
        return {
            "success": True,
            "graph": graph
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate template: {str(e)}")

@router.get("/algorithms")
async def get_algorithms():
    """
    Get lists of supported attack simulation and recovery algorithms.
    """
    return {
        "simulation": [
            {"id": "bfs", "name": "Worm Propagation (BFS)"},
            {"id": "dfs", "name": "Network Scanner (DFS)"},
            {"id": "multi_bfs", "name": "Multi-Point Attack (Multi-Source BFS)"}
        ],
        "recovery": [
            {"id": "dijkstra", "name": "Dijkstra Shortest Path"},
            {"id": "prim", "name": "Prim's MST"},
            {"id": "kruskal", "name": "Kruskal's MST"},
            {"id": "floyd", "name": "Floyd-Warshall All-Pairs"},
            {"id": "connected_components", "name": "Connected Components"},
            {"id": "union_find", "name": "Union-Find Operations"},
            {"id": "topological_sort", "name": "Topological Sort"},
            {"id": "knapsack", "name": "Fractional Knapsack Resource Allocation"},
            {"id": "branch_bound", "name": "Branch & Bound Routing"},
            {"id": "tsp", "name": "Traveling Salesman Tour"}
        ]
    }

@router.post("/validate", response_model=ValidationResult)
async def validate_graph(graph: GraphData):
    """
    Validate the graph representation of the network topology.
    """
    try:
        nodes_list = [node.model_dump() for node in graph.nodes]
        edges_list = [edge.model_dump() for edge in graph.edges]
        result = validate_topology(nodes_list, edges_list)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")

@router.post("/save")
async def save_project(payload: ProjectState):
    """
    Save the project configuration JSON file to local disk storage.
    """
    try:
        os.makedirs(STORAGE_DIR, exist_ok=True)
        file_path = os.path.join(STORAGE_DIR, "project.json")
        with open(file_path, "w") as f:
            json.dump(payload.model_dump(), f, indent=2)
        return {
            "success": True,
            "message": "Project saved successfully."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save project: {str(e)}")

@router.post("/load")
async def load_project():
    """
    Load the project configuration JSON file from local disk. 
    If no file is found, returns default College Campus template setup.
    """
    file_path = os.path.join(STORAGE_DIR, "project.json")
    if not os.path.exists(file_path):
        # Fall back to college campus default
        college_graph = get_template_graph("college")
        default_project = {
            "project": {},
            "network": college_graph,
            "simulation": {},
            "recovery": {},
            "settings": {},
            "metadata": {
                "projectName": "College Campus",
                "author": "System Default",
                "createdDate": "2026-07-18",
                "lastModified": "2026-07-18",
                "version": "1.0"
            }
        }
        return {
            "success": True,
            "project": default_project,
            "message": "No existing project file found. Loaded default college template."
        }
        
    try:
        with open(file_path, "r") as f:
            data = json.load(f)
        return {
            "success": True,
            "project": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load project: {str(e)}")
