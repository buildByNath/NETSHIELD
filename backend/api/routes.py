from fastapi import APIRouter, HTTPException, Body
from backend.schemas.schemas import GraphData, ProjectState, ValidationResult, SimulationRequest, RecoveryRequest
from backend.services.templates import get_template_graph
from backend.services.validation import validate_topology
from backend.algorithms.bfs import run_bfs
from backend.algorithms.dfs import run_dfs
from backend.algorithms.dijkstra import run_dijkstra
from backend.algorithms.prim import run_prim
from backend.algorithms.kruskal import run_kruskal
from backend.algorithms.floyd import run_floyd
from backend.algorithms.connected_components import run_connected_components
from backend.algorithms.union_find import run_union_find
from backend.algorithms.topological_sort import run_topological_sort
from backend.algorithms.fractional_knapsack import run_fractional_knapsack
from backend.algorithms.branch_bound import run_branch_bound
from backend.algorithms.tsp import run_tsp
from backend.algorithms.merge_sort import run_merge_sort
from backend.algorithms.randomized_quicksort import run_randomized_quicksort
from backend.algorithms.matrix_chain import run_matrix_chain
from backend.algorithms.strassen import run_strassen
from backend.algorithms.nqueen import run_nqueens
import os
import json
import time
import tracemalloc
from typing import Dict, Any

"""
File: routes.py
Author: Antigravity AI
Purpose: API router defining endpoints for templates, graph validation, and project save/load.
"""

router = APIRouter()

STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage")

def profile_call(func, *args, **kwargs):
    tracemalloc.start()
    start_time = time.perf_counter()
    
    result = func(*args, **kwargs)
    
    end_time = time.perf_counter()
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    
    duration_ms = (end_time - start_time) * 1000
    peak_mem_kb = peak / 1024
    
    # Inject metrics into statistics
    if isinstance(result, dict):
        if "statistics" not in result:
            result["statistics"] = {}
        result["statistics"]["executionTimeMs"] = max(0.001, round(duration_ms, 3))
        result["statistics"]["peakMemoryKb"] = max(0.01, round(peak_mem_kb, 2))
        
    return result

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

@router.post("/simulate")
async def simulate_attack(request: SimulationRequest):
    """
    Simulate a network virus attack propagation.
    """
    algorithm = request.algorithm
    graph_dict = request.graph.model_dump()
    start_nodes = request.startNodes

    if not start_nodes:
        raise HTTPException(status_code=400, detail="Attack simulation requires at least one starting node.")

    if algorithm == "bfs":
        # BFS Worm takes a single start node
        result = profile_call(run_bfs, graph_dict, start_nodes[0])
    elif algorithm == "multi_bfs":
        # Multi-Source BFS takes multiple start nodes
        result = profile_call(run_bfs, graph_dict, start_nodes)
    elif algorithm == "dfs":
        # DFS Scanner takes a single start node
        result = profile_call(run_dfs, graph_dict, start_nodes[0])
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported simulation algorithm '{algorithm}'.")

    if not result.get("success", False):
        raise HTTPException(
            status_code=400,
            detail=result.get("result", {}).get("error", "Simulation computation failed.")
        )

    return result

@router.post("/recover")
async def recover_network(request: RecoveryRequest):
    """
    Simulate network recovery path planners.
    """
    algorithm = request.algorithm
    graph_dict = request.graph.model_dump()
    options = request.options or {}

    if algorithm == "dijkstra":
        start_node = options.get("source")
        result = profile_call(run_dijkstra, graph_dict, start_node, options)
    elif algorithm == "prim":
        start_node = options.get("source")
        result = profile_call(run_prim, graph_dict, start_node, options)
    elif algorithm == "kruskal":
        result = profile_call(run_kruskal, graph_dict, options)
    elif algorithm == "floyd":
        result = profile_call(run_floyd, graph_dict, options)
    elif algorithm == "connected_components":
        result = profile_call(run_connected_components, graph_dict, options)
    elif algorithm == "union_find":
        result = profile_call(run_union_find, graph_dict, options)
    elif algorithm == "topological_sort":
        result = profile_call(run_topological_sort, graph_dict, options)
    elif algorithm == "fractional_knapsack" or algorithm == "knapsack":
        result = profile_call(run_fractional_knapsack, graph_dict, options)
    elif algorithm == "branch_bound":
        result = profile_call(run_branch_bound, graph_dict, options)
    elif algorithm == "tsp":
        start_node = options.get("source")
        result = profile_call(run_tsp, graph_dict, start_node, options)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported recovery algorithm '{algorithm}'.")

    if not result.get("success", False):
        raise HTTPException(
            status_code=400,
            detail=result.get("result", {}).get("error", "Recovery calculation failed.")
        )

    return result

@router.post("/simulate/sort")
async def simulate_sort(payload: Dict[str, Any] = Body(...)):
    """
    Simulate sorting algorithms (Merge Sort or Randomized Quick Sort).
    """
    algorithm = payload.get("algorithm", "merge_sort")
    options = payload.get("options", {})
    if algorithm == "merge_sort":
        result = profile_call(run_merge_sort, options)
    elif algorithm == "quick_sort" or algorithm == "randomized_quicksort":
        result = profile_call(run_randomized_quicksort, options)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported sorting algorithm '{algorithm}'.")

    if not result.get("success", False):
        raise HTTPException(
            status_code=400,
            detail=result.get("result", {}).get("error", "Sorting calculation failed.")
        )
    return result

@router.post("/simulate/dp")
async def simulate_dp(payload: Dict[str, Any] = Body(...)):
    """
    Simulate Matrix Chain Multiplication dynamic programming.
    """
    options = payload.get("options", {})
    result = profile_call(run_matrix_chain, options)
    if not result.get("success", False):
        raise HTTPException(
            status_code=400,
            detail=result.get("result", {}).get("error", "DP calculation failed.")
        )
    return result

@router.post("/simulate/strassen")
async def simulate_strassen(payload: Dict[str, Any] = Body(...)):
    """
    Simulate Strassen Matrix Multiplication.
    """
    options = payload.get("options", {})
    result = profile_call(run_strassen, options)
    if not result.get("success", False):
        raise HTTPException(
            status_code=400,
            detail=result.get("result", {}).get("error", "Strassen calculation failed.")
        )
    return result

@router.post("/simulate/nqueens")
async def simulate_nqueens(payload: Dict[str, Any] = Body(...)):
    """
    Simulate N-Queens backtracking chess placement.
    """
    options = payload.get("options", {})
    result = profile_call(run_nqueens, options)
    if not result.get("success", False):
        raise HTTPException(
            status_code=400,
            detail=result.get("result", {}).get("error", "N-Queens calculation failed.")
        )
    return result

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
    If no file is found or if the network has 0 nodes, returns default Office Setup template.
    """
    file_path = os.path.join(STORAGE_DIR, "project.json")
    if os.path.exists(file_path):
        try:
            with open(file_path, "r") as f:
                data = json.load(f)
            nodes = data.get("network", {}).get("nodes", [])
            if nodes and len(nodes) > 0:
                return {
                    "success": True,
                    "project": data
                }
        except Exception:
            pass
            
    # Fall back to office setup default
    office_graph = get_template_graph("office")
    default_project = {
        "project": {},
        "network": office_graph,
        "simulation": {},
        "recovery": {},
        "settings": {},
        "metadata": {
            "projectName": "Office Setup Network",
            "author": "System Default",
            "createdDate": "2026-09-18",
            "lastModified": "2026-09-18",
            "version": "1.0"
        }
    }
    try:
        os.makedirs(STORAGE_DIR, exist_ok=True)
        with open(file_path, "w") as f:
            json.dump(default_project, f, indent=2)
    except Exception:
        pass

    return {
        "success": True,
        "project": default_project,
        "message": "Loaded default office setup template."
    }



