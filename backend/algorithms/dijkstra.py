import heapq
from typing import Dict, List, Any

"""
File: dijkstra.py
Author: Antigravity AI
Purpose: Dijkstra's Shortest Path algorithm for calculating optimal recovery routes.
"""

def run_dijkstra(graph: Dict[str, Any], start_node: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Compute Dijkstra's shortest path between a source and destination.
    
    Args:
        graph: Dict containing 'nodes' and 'edges'.
        start_node: Source node ID.
        options: Dict containing 'destination' node ID.
        
    Returns:
        dict: Standard algorithm execution result.
    """
    destination = (options or {}).get("destination")
    
    nodes = graph.get("nodes", [])
    edges = graph.get("edges", [])
    node_ids = {n["id"] for n in nodes}
    node_labels = {n["id"]: n.get("label", n["id"]) for n in nodes}
    
    # Validation checks
    if not start_node or start_node not in node_ids:
        return {"success": False, "timeline": [], "statistics": {}, "learning": {}, "result": {"error": "Invalid start node."}}
    if not destination or destination not in node_ids:
        return {"success": False, "timeline": [], "statistics": {}, "learning": {}, "result": {"error": "Invalid destination node."}}

    # Build Adjacency List
    adj = {n["id"]: [] for n in nodes}
    for edge in edges:
        s = edge["source"]
        t = edge["target"]
        w = float(edge.get("weight", 1.0))
        if s in adj and t in adj:
            adj[s].append((t, w, edge))
            adj[t].append((s, w, edge)) # undirected path

    timeline = []
    frame_counter = 1
    
    # Dijkstra State variables
    distances = {n_id: float("inf") for n_id in node_ids}
    distances[start_node] = 0.0
    predecessors = {n_id: None for n_id in node_ids}
    visited = set()
    
    # Priority Queue: storing tuples (distance, node_id)
    pq = []
    heapq.heappush(pq, (0.0, start_node))
    
    # Format PQ helper for timeline logs
    def format_pq(q_list):
        return [f"{item[1]} (d={item[0]})" for item in sorted(q_list)]

    # Frame 1: Initial state
    timeline.append({
        "frame": frame_counter,
        "currentNode": start_node,
        "visited": [],
        "queue": format_pq(pq),
        "stack": [],
        "currentEdge": None,
        "action": f"Dijkstra initialized at source '{node_labels[start_node]}'. Destination is '{node_labels[destination]}'.",
        "distances": {k: ("∞" if v == float("inf") else round(v, 1)) for k, v in distances.items()}
    })
    frame_counter += 1

    pq_ops = 1
    relaxations = 0
    path_found = False

    # Dijkstra computation loop
    while pq:
        curr_dist, u = heapq.heappop(pq)
        pq_ops += 1
        
        if u in visited:
            continue
        visited.add(u)
        
        # Frame: Dequeue node
        timeline.append({
            "frame": frame_counter,
            "currentNode": u,
            "visited": list(visited),
            "queue": format_pq(pq),
            "stack": [],
            "currentEdge": None,
            "action": f"Inspecting device '{node_labels[u]}' (extracted from priority queue with distance {round(curr_dist, 1)})",
            "distances": {k: ("∞" if v == float("inf") else round(v, 1)) for k, v in distances.items()}
        })
        frame_counter += 1
        
        # Check if destination is reached
        if u == destination:
            path_found = True
            break
            
        for nbr, weight, edge_data in adj[u]:
            if nbr in visited:
                continue
                
            new_dist = curr_dist + weight
            
            # Frame: Probe link to neighbor
            timeline.append({
                "frame": frame_counter,
                "currentNode": u,
                "visited": list(visited),
                "queue": format_pq(pq),
                "stack": [],
                "currentEdge": [u, nbr],
                "action": f"Probing link to '{node_labels[nbr]}' (weight {weight})",
                "distances": {k: ("∞" if v == float("inf") else round(v, 1)) for k, v in distances.items()}
            })
            frame_counter += 1
            
            if new_dist < distances[nbr]:
                distances[nbr] = new_dist
                predecessors[nbr] = u
                heapq.heappush(pq, (new_dist, nbr))
                pq_ops += 1
                relaxations += 1
                
                # Frame: Relax distance to neighbor
                timeline.append({
                    "frame": frame_counter,
                    "currentNode": nbr,
                    "visited": list(visited),
                    "queue": format_pq(pq),
                    "stack": [],
                    "currentEdge": [u, nbr],
                    "action": f"Relaxed path cost to '{node_labels[nbr]}' updated to {round(new_dist, 1)} via '{node_labels[u]}'",
                    "distances": {k: ("∞" if v == float("inf") else round(v, 1)) for k, v in distances.items()}
                })
                frame_counter += 1

    # Reconstruction of shortest path
    shortest_path = []
    cost = 0.0
    if path_found:
        curr = destination
        while curr:
            shortest_path.insert(0, curr)
            curr = predecessors[curr]
        cost = distances[destination]
        
        # Color final path nodes blue on the frontend via result
        timeline.append({
            "frame": frame_counter,
            "currentNode": None,
            "visited": list(visited),
            "queue": [],
            "stack": [],
            "currentEdge": None,
            "action": f"Optimal route found! Shortest Cost = {round(cost, 1)}. Route: {' → '.join([node_labels[n] for n in shortest_path])}",
            "distances": {k: ("∞" if v == float("inf") else round(v, 1)) for k, v in distances.items()}
        })
    else:
        timeline.append({
            "frame": frame_counter,
            "currentNode": None,
            "visited": list(visited),
            "queue": [],
            "stack": [],
            "currentEdge": None,
            "action": "No route could be found. Devices may belong to disconnected subgraphs.",
            "distances": {k: ("∞" if v == float("inf") else round(v, 1)) for k, v in distances.items()}
        })

    statistics = {
        "visitedNodes": len(visited),
        "priorityQueueOps": pq_ops,
        "relaxations": relaxations,
        "shortestCost": cost if path_found else -1,
        "timeComplexity": "O((V + E) log V)",
        "spaceComplexity": "O(V)"
    }
    
    learning = {
        "pseudoCode": [
            "Dijkstra(Graph, source):",
            "  initialize dist[v] = infinity, predecessor[v] = null for all v",
            "  dist[source] = 0",
            "  insert (0, source) into PriorityQueue",
            "  while PriorityQueue is not empty:",
            "    u = ExtractMin(PriorityQueue)",
            "    add u to Visited",
            "    for each neighbor v of u:",
            "      if dist[u] + weight(u,v) < dist[v]:",
            "        dist[v] = dist[u] + weight(u,v)",
            "        predecessor[v] = u",
            "        DecreaseKey/Insert(PriorityQueue, (dist[v], v))"
        ],
        "explanation": "Dijkstra's algorithm finds the shortest path between nodes in a weighted graph. Starting at a source, it iteratively relaxes neighbor estimates by extracting the node with the minimum tentative cost from a Priority Queue. This models routing network data through the fastest latency path.",
        "advantages": "Guarantees finding the absolute shortest path on graphs with non-negative edge costs.",
        "disabled_if": "Contains negative edge weights (which could create infinite loops in simple implementations).",
        "applications": "Routing protocols (OSPF), GPS navigation systems, finding routing constraints in logistics networks."
    }

    return {
        "success": True,
        "timeline": timeline,
        "statistics": statistics,
        "learning": learning,
        "result": {
            "path": shortest_path,
            "cost": cost,
            "found": path_found
        }
    }
