from typing import Dict, List, Any
import heapq

"""
File: tsp.py
Author: Antigravity AI
Purpose: Traveling Salesman Problem (TSP) inspection route optimization on network graphs.
"""

def compute_dijkstra_distance(adj: Dict[str, List], start: str, end: str) -> float:
    """Helper to calculate distance between two nodes using Dijkstra."""
    if start == end:
        return 0.0
    pq = [(0.0, start)]
    visited = set()
    while pq:
        d, u = heapq.heappop(pq)
        if u == end:
            return d
        if u in visited:
            continue
        visited.add(u)
        for v, w, _ in adj[u]:
            if v not in visited:
                heapq.heappush(pq, (d + w, v))
    return float("inf")

def run_tsp(graph: Dict[str, Any], start_node: str = None, options: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Run TSP to compute the optimal inspection route starting and ending at a node.
    
    Args:
        graph: Dict containing 'nodes' and 'edges'.
        start_node: Starting node ID.
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

    if not start_node or start_node not in node_ids:
        start_node = nodes[0]["id"]

    # Build Adjacency List for Dijkstra distance checks
    adj = {n["id"]: [] for n in nodes}
    for edge in edges:
        s = edge["source"]
        t = edge["target"]
        w = float(edge.get("weight", 1.0))
        if s in adj and t in adj:
            adj[s].append((t, w, edge))
            adj[t].append((s, w, edge))

    # Select target nodes to visit (limit to start_node + up to 5 servers/routers/switches for speed)
    targets = [start_node]
    key_types = {"server", "router", "core switch", "firewall"}
    for n in nodes:
        n_id = n["id"]
        n_type = n.get("type", "PC").lower()
        if n_id != start_node and any(kt in n_type for kt in key_types):
            targets.append(n_id)
            if len(targets) >= 6: # limit size to N=6 targets (6! = 720 states maximum)
                break
                
    # If no key nodes, just take up to 5 arbitrary nodes
    if len(targets) < 2:
        for n in nodes:
            n_id = n["id"]
            if n_id != start_node:
                targets.append(n_id)
                if len(targets) >= 5:
                    break

    N = len(targets)
    if N < 2:
        return {
            "success": False,
            "timeline": [],
            "statistics": {},
            "learning": {},
            "result": {"error": "Graph must contain at least 2 reachable devices to schedule a tour."}
        }

    # Build dense distance matrix between target nodes using Dijkstra
    dist_matrix = {}
    for i in range(N):
        u = targets[i]
        dist_matrix[u] = {}
        for j in range(N):
            v = targets[j]
            if i == j:
                dist_matrix[u][v] = 0.0
            else:
                dist_matrix[u][v] = compute_dijkstra_distance(adj, u, v)

    # Filter out unreachable nodes from target list
    targets = [t for t in targets if dist_matrix[start_node][t] < float("inf")]
    N = len(targets)

    if N < 2:
        return {
            "success": False,
            "timeline": [],
            "statistics": {},
            "learning": {},
            "result": {"error": "No other nodes are reachable from the starting inspection device."}
        }

    timeline = []
    frame_counter = 1
    
    # Format distance matrix helper for timeline logs
    def serialize_distances():
        serialized = {}
        for u in targets:
            serialized[u] = {}
            for v in targets:
                val = dist_matrix[u][v]
                serialized[u][v] = "∞" if val == float("inf") else round(val, 1)
        return serialized

    # Frame 1: Initialization
    timeline.append({
        "frame": frame_counter,
        "currentNode": start_node,
        "visited": [start_node],
        "queue": list(targets),
        "stack": [],
        "currentEdge": None,
        "action": f"Traveling Salesman inspection initialized at start device '{node_labels[start_node]}'. Targets selection: {', '.join([node_labels[t] for t in targets])}",
        "matrix": serialize_distances(),
        "bestCost": "inf"
    })
    frame_counter += 1

    # Backtracking search variables
    best_cost = float("inf")
    best_path = []
    routes_tested = 0

    # Recursive backtracking solver
    def tsp_solve(curr_node: str, visited_set: set, path: List[str], current_cost: float):
        nonlocal best_cost, best_path, routes_tested, frame_counter
        
        if len(visited_set) == N:
            # Add return leg to start_node
            return_dist = dist_matrix[curr_node][start_node]
            if return_dist < float("inf"):
                routes_tested += 1
                total_tour_cost = current_cost + return_dist
                
                # Frame: Completed tour candidate check
                action_desc = f"Formed full tour: {' → '.join([node_labels[p] for p in path])} → {node_labels[start_node]} (Cost = {round(total_tour_cost, 1)})"
                
                if total_tour_cost < best_cost:
                    best_cost = total_tour_cost
                    best_path = path + [start_node]
                    action_desc += f" [NEW BEST TOUR FOUND!]"
                    
                if frame_counter < 45: # cap frames
                    timeline.append({
                        "frame": frame_counter,
                        "currentNode": curr_node,
                        "visited": list(path),
                        "queue": [],
                        "stack": list(path),
                        "currentEdge": [curr_node, start_node],
                        "action": action_desc,
                        "bestCost": round(best_cost, 1)
                    })
                    frame_counter += 1
            return

        for next_node in targets:
            if next_node not in visited_set:
                leg_dist = dist_matrix[curr_node][next_node]
                if leg_dist < float("inf") and current_cost + leg_dist < best_cost:
                    
                    # Frame: Probing leg
                    if frame_counter < 45:
                        timeline.append({
                            "frame": frame_counter,
                            "currentNode": next_node,
                            "visited": list(path),
                            "queue": [],
                            "stack": list(path),
                            "currentEdge": [curr_node, next_node],
                            "action": f"TSP testing path segment: '{node_labels[curr_node]}' → '{node_labels[next_node]}' (leg cost: {round(leg_dist, 1)})",
                            "bestCost": ("∞" if best_cost == float("inf") else round(best_cost, 1))
                        })
                        frame_counter += 1
                        
                    visited_set.add(next_node)
                    tsp_solve(next_node, visited_set, path + [next_node], current_cost + leg_dist)
                    visited_set.remove(next_node)

    # Launch backtracking solver
    visited_set = {start_node}
    tsp_solve(start_node, visited_set, [start_node], 0.0)

    # Final timeline completion frame
    timeline.append({
        "frame": frame_counter,
        "currentNode": None,
        "visited": list(best_path),
        "queue": [],
        "stack": [],
        "currentEdge": None,
        "action": f"TSP completed. Shortest inspection route cost = {round(best_cost, 1)} | Tour: {' → '.join([node_labels[p] for p in best_path])}",
        "bestCost": round(best_cost, 1)
    })

    statistics = {
        "routesTested": routes_tested,
        "bestCost": best_cost if best_cost < float("inf") else -1,
        "targetsCount": N,
        "timeComplexity": "O(N!)",
        "spaceComplexity": "O(N)"
    }
    
    learning = {
        "pseudoCode": [
            "TSP(Graph, startNode):",
            "  targets = select_critical_nodes(Graph)",
            "  dist[][] = compute_shortest_paths_between_targets(targets)",
            "  best_cost = infinity, best_path = []",
            "  solve_backtrack(startNode, visited = {startNode}, path = [startNode], cost = 0)",
            "  return best_path, best_cost",
            "",
            "solve_backtrack(curr, visited, path, cost):",
            "  if len(visited) == N:",
            "    total = cost + dist[curr][startNode]",
            "    if total < best_cost: best_cost = total, best_path = path + [startNode]",
            "  for next in targets:",
            "    if next not in visited and cost + dist[curr][next] < best_cost:",
            "      solve_backtrack(next, visited + {next}, path + [next], cost + dist[curr][next])"
        ],
        "explanation": "The Traveling Salesman Problem (TSP) optimization finds the shortest route visiting all target devices exactly once and returning to the start node. The algorithm computes a dense distance matrix using Dijkstra's shortest paths between targets and uses backtracking to find the optimal global loop tour.",
        "advantages": "Computes the exact globally optimal routing tour visiting all targets.",
        "disabled_if": "Some target servers belong to disconnected subgraphs (unreachable paths).",
        "applications": "Server cluster diagnostic tours, delivery vehicle dispatch routes, drilling printed circuit boards."
    }

    return {
        "success": True,
        "timeline": timeline,
        "statistics": statistics,
        "learning": learning,
        "result": {
            "path": best_path,
            "cost": best_cost,
            "targets": targets
        }
    }
