from typing import Dict, List, Any

"""
File: floyd.py
Author: Antigravity AI
Purpose: Floyd-Warshall All-Pairs Shortest Path algorithm with dynamic programming.
"""

def run_floyd(graph: Dict[str, Any], options: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Run Floyd-Warshall algorithm to compute all-pairs shortest paths.
    
    Args:
        graph: Dict containing 'nodes' and 'edges'.
        options: Optional settings.
        
    Returns:
        dict: Standard algorithm execution result.
    """
    nodes = graph.get("nodes", [])
    edges = graph.get("edges", [])
    node_ids = sorted([n["id"] for n in nodes])
    node_labels = {n["id"]: n.get("label", n["id"]) for n in nodes}
    
    V = len(node_ids)
    if V == 0:
        return {"success": False, "timeline": [], "statistics": {}, "learning": {}, "result": {"error": "Graph is empty."}}

    node_to_idx = {n_id: idx for idx, n_id in enumerate(node_ids)}

    # Initialize Distance Matrix
    dist = [[float("inf")] * V for _ in range(V)]
    next_node = [[None] * V for _ in range(V)] # for path reconstruction
    
    for i in range(V):
        dist[i][i] = 0.0
        
    for edge in edges:
        s = edge["source"]
        t = edge["target"]
        w = float(edge.get("weight", 1.0))
        if s in node_to_idx and t in node_to_idx:
            u_idx = node_to_idx[s]
            v_idx = node_to_idx[t]
            # Undirected links
            dist[u_idx][v_idx] = w
            dist[v_idx][u_idx] = w
            next_node[u_idx][v_idx] = t
            next_node[v_idx][u_idx] = s

    timeline = []
    frame_counter = 1
    
    # Helper to serialize matrix for timeline responses
    def serialize_matrix(d_mat):
        # Limit matrix size in timeline logs to first 10 nodes for readability if too large
        limit = min(V, 8)
        serialized = {}
        for i in range(limit):
            row_id = node_ids[i]
            serialized[row_id] = {}
            for j in range(limit):
                col_id = node_ids[j]
                val = d_mat[i][j]
                serialized[row_id][col_id] = "∞" if val == float("inf") else round(val, 1)
        return serialized

    # Frame 1: Initial state
    timeline.append({
        "frame": frame_counter,
        "currentNode": None,
        "visited": [],
        "queue": [],
        "stack": [],
        "currentEdge": None,
        "action": f"Floyd-Warshall initialized. Formed {V}x{V} distance matrix.",
        "matrix": serialize_matrix(dist),
        "intermediateNode": None
    })
    frame_counter += 1

    matrix_updates = 0
    paths_found = 0
    max_timeline_frames = 45 # prevent browser crash on large templates (V=104)

    # Floyd-Warshall V^3 dynamic programming loops
    for k in range(V):
        k_id = node_ids[k]
        
        # Only record frames for the first few intermediate steps to fit limits
        record_k = frame_counter < max_timeline_frames
        
        for i in range(V):
            for j in range(V):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
                    next_node[i][j] = next_node[i][k]
                    matrix_updates += 1
                    
                    if record_k and i != j and i != k and j != k:
                        # Append a frame highlighting the path update via intermediate k
                        u_id = node_ids[i]
                        v_id = node_ids[j]
                        timeline.append({
                            "frame": frame_counter,
                            "currentNode": k_id, # intermediate node highlighted
                            "visited": [u_id, v_id],
                            "queue": [],
                            "stack": [],
                            "currentEdge": [u_id, k_id], # show path leg
                            "action": f"Path cost between '{node_labels[u_id]}' and '{node_labels[v_id]}' improved to {round(dist[i][j], 1)} via intermediate '{node_labels[k_id]}'",
                            "matrix": serialize_matrix(dist),
                            "intermediateNode": k_id
                        })
                        frame_counter += 1

    # Calculate total paths found
    for i in range(V):
        for j in range(V):
            if i != j and dist[i][j] < float("inf"):
                paths_found += 1

    # Final timeline completion frame
    timeline.append({
        "frame": frame_counter,
        "currentNode": None,
        "visited": [],
        "queue": [],
        "stack": [],
        "currentEdge": None,
        "action": f"Floyd-Warshall completed. Solved shortest paths for all {V} devices. Total {paths_found} optimal links resolved.",
        "matrix": serialize_matrix(dist),
        "intermediateNode": None
    })

    statistics = {
        "matrixUpdates": matrix_updates,
        "shortestPathsFound": paths_found,
        "totalNodes": V,
        "timeComplexity": "O(V³)",
        "spaceComplexity": "O(V²)"
    }
    
    learning = {
        "pseudoCode": [
            "FloydWarshall(Graph):",
            "  initialize dist[u][v] = weight(u,v) if edge exists, else infinity",
            "  for i = 1 to V: dist[i][i] = 0",
            "  for k = 1 to V:          // intermediate node",
            "    for i = 1 to V:        // source node",
            "      for j = 1 to V:      // destination node",
            "        if dist[i][k] + dist[k][j] < dist[i][j]:",
            "          dist[i][j] = dist[i][k] + dist[k][j]"
        ],
        "explanation": "Floyd-Warshall is a dynamic programming algorithm that calculates the shortest path between all pairs of nodes. It loops through all nodes as candidate intermediate hops 'k', updating the path between 'i' and 'j' if going through 'k' is cheaper. This maps out routing tables across the entire network.",
        "advantages": "Computes shortest paths for all node pairs simultaneously and naturally handles dense connection routing.",
        "disadvantages": "High cubic time complexity O(V³), which makes it slow on graphs containing thousands of nodes.",
        "applications": "Routing table computations in routers, finding transitive closures, finding optimal routing links in WANs."
    }

    # Format result matrix for return
    flat_matrix = {}
    for i in range(V):
        u_id = node_ids[i]
        flat_matrix[u_id] = {}
        for j in range(V):
            v_id = node_ids[j]
            val = dist[i][j]
            flat_matrix[u_id][v_id] = -1 if val == float("inf") else val

    return {
        "success": True,
        "timeline": timeline,
        "statistics": statistics,
        "learning": learning,
        "result": {
            "matrix": flat_matrix,
            "totalPaths": paths_found
        }
    }
