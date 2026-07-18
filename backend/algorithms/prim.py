import heapq
from typing import Dict, List, Any

"""
File: prim.py
Author: Antigravity AI
Purpose: Prim's Minimum Spanning Tree (MST) algorithm for cable-cost recovery optimizations.
"""

def run_prim(graph: Dict[str, Any], start_node: str = None, options: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Run Prim's algorithm to compute the Minimum Spanning Tree.
    
    Args:
        graph: Dict containing 'nodes' and 'edges'.
        start_node: Optional starting node ID (defaults to first node).
        options: Optional settings.
        
    Returns:
        dict: Standard algorithm execution result.
    """
    nodes = graph.get("nodes", [])
    edges = graph.get("edges", [])
    node_ids = {n["id"] for n in nodes}
    node_labels = {n["id"]: n.get("label", n["id"]) for n in nodes}
    
    if not nodes:
        return {"success": False, "timeline": [], "statistics": {}, "learning": {}, "result": {"error": "Graph is empty."}}

    # Pick default start node if none is selected
    if not start_node or start_node not in node_ids:
        start_node = nodes[0]["id"]

    # Build Adjacency List
    adj = {n["id"]: [] for n in nodes}
    for edge in edges:
        s = edge["source"]
        t = edge["target"]
        w = float(edge.get("weight", 1.0))
        if s in adj and t in adj:
            adj[s].append((t, w, edge))
            adj[t].append((s, w, edge))

    timeline = []
    frame_counter = 1
    
    visited = set()
    mst_edges = []
    total_weight = 0.0
    
    # Priority Queue: storing tuples (weight, current_node, parent_node, edge_dict)
    pq = []
    visited.add(start_node)
    
    # Push all initial adjacent edges of start node to Priority Queue
    for nbr, weight, edge_data in adj[start_node]:
        heapq.heappush(pq, (weight, nbr, start_node, edge_data))

    def format_candidates(q_list):
        return [f"{item[2]}↔{item[1]} (w={item[0]})" for item in sorted(q_list)]

    # Frame 1: Initial state
    timeline.append({
        "frame": frame_counter,
        "currentNode": start_node,
        "visited": list(visited),
        "queue": format_candidates(pq),
        "stack": [],
        "currentEdge": None,
        "action": f"Prim's MST initialized at start node '{node_labels[start_node]}'. Adding adjacent links to candidates.",
        "mstWeight": total_weight
    })
    frame_counter += 1

    edges_selected = 0
    edges_rejected = 0
    pq_ops = len(pq)

    # MST processing loop
    while pq and len(visited) < len(nodes):
        weight, u, parent, edge_data = heapq.heappop(pq)
        pq_ops += 1
        
        # If node already in MST, this edge creates a cycle (rejected)
        if u in visited:
            edges_rejected += 1
            continue
            
        # Add node and edge to MST
        visited.add(u)
        mst_edges.append(edge_data)
        total_weight += weight
        edges_selected += 1
        
        # Frame: Add edge to MST
        timeline.append({
            "frame": frame_counter,
            "currentNode": u,
            "visited": list(visited),
            "queue": format_candidates(pq),
            "stack": [],
            "currentEdge": [parent, u],
            "action": f"Adding link '{node_labels[parent]} ↔ {node_labels[u]}' to MST (cost: {weight})",
            "mstWeight": round(total_weight, 1)
        })
        frame_counter += 1
        
        # Push new adjacent edges to PQ
        for nbr, nbr_weight, nbr_edge_data in adj[u]:
            if nbr not in visited:
                heapq.heappush(pq, (nbr_weight, nbr, u, nbr_edge_data))
                pq_ops += 1

    # Check if spanning tree is complete or disjoint
    connected = len(visited) == len(nodes)
    
    timeline.append({
        "frame": frame_counter,
        "currentNode": None,
        "visited": list(visited),
        "queue": [],
        "stack": [],
        "currentEdge": None,
        "action": f"Prim's algorithm finished. MST total weight = {round(total_weight, 1)}." + 
                  ("" if connected else " WARNING: Graph is disconnected, MST only spans one component."),
        "mstWeight": round(total_weight, 1)
    })

    statistics = {
        "edgesSelected": edges_selected,
        "edgesRejected": edges_rejected,
        "totalWeight": total_weight,
        "pqOperations": pq_ops,
        "graphConnected": connected,
        "timeComplexity": "O(E log V)",
        "spaceComplexity": "O(V)"
    }
    
    learning = {
        "pseudoCode": [
            "Prim(Graph, startNode):",
            "  initialize empty Set Visited, list MST_Edges",
            "  add startNode to Visited",
            "  insert all adjacent edges of startNode into PriorityQueue",
            "  while PriorityQueue is not empty and count(Visited) < V:",
            "    (weight, u, parent, edge) = ExtractMin(PriorityQueue)",
            "    if u not in Visited:",
            "      add u to Visited",
            "      add edge to MST_Edges",
            "      for each neighbor v of u with edge_weight w:",
            "        if v not in Visited:",
            "          insert (w, v, u, edge_v_u) into PriorityQueue"
        ],
        "explanation": "Prim's algorithm grows a Minimum Spanning Tree (MST) starting from a single node. In every step, it extracts the cheapest edge connecting our active tree (Visited set) to any unvisited node outside the tree. It is ideal for finding the minimum wiring layout for a localized hub layout.",
        "advantages": "Performs extremely well and is faster on dense graphs with many edges.",
        "disadvantages": "Requires priority queue state maintenance and does not operate natively on disconnected components.",
        "applications": "Local telecommunication cable layouts, electrical grids, cluster analysis, image segmentation."
    }

    # Format result tree edges list
    result_edges = [{"source": e["source"], "target": e["target"], "weight": e.get("weight", 1.0)} for e in mst_edges]

    return {
        "success": True,
        "timeline": timeline,
        "statistics": statistics,
        "learning": learning,
        "result": {
            "edges": result_edges,
            "totalWeight": total_weight,
            "connected": connected
        }
    }
