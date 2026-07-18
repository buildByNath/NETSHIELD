from typing import Dict, List, Any

"""
File: dfs.py
Author: Antigravity AI
Purpose: Depth-First Search (DFS) attack simulation engine modeling network port scanning.
"""

def run_dfs(graph: Dict[str, Any], start_node: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Run Depth-First Search on the graph starting from a node.
    Computes a path-drilling DFS with step-by-step backtracking frames.
    
    Args:
        graph: Dict containing 'nodes' and 'edges' lists.
        start_node: Starting node ID (str).
        options: Optional parameters.
        
    Returns:
        dict: Standard algorithm execution result.
    """
    timeline = []
    visited_list = []
    visited_set = set()
    stack = []
    
    nodes = graph.get("nodes", [])
    edges = graph.get("edges", [])
    
    # Verify starting node exists
    node_ids = {n["id"] for n in nodes}
    if not start_node or start_node not in node_ids:
        return {
            "success": False,
            "timeline": [],
            "statistics": {},
            "learning": {},
            "result": {"error": "Invalid starting node."}
        }

    # Build Undirected Adjacency List
    adj = {n["id"]: [] for n in nodes}
    for edge in edges:
        s = edge["source"]
        t = edge["target"]
        if s in adj and t in adj:
            adj[s].append((t, edge))
            adj[t].append((s, edge))
            
    # Sort neighbors by label/id to ensure deterministic traversal
    for node_id in adj:
        adj[node_id].sort(key=lambda x: x[0])

    frame_counter = 1
    
    # Setup Initial State
    stack.append(start_node)
    visited_set.add(start_node)
    visited_list.append(start_node)
    
    # Frame 1: Simulation started
    timeline.append({
        "frame": frame_counter,
        "currentNode": start_node,
        "visited": list(visited_list),
        "queue": [],
        "stack": list(stack),
        "currentEdge": None,
        "action": f"Infection scanner started at source: {start_node}"
    })
    frame_counter += 1

    # DFS Traversal Loop using explicit stack peeking for traversal/backtracking
    traversal_order = [start_node]
    edges_traversed = 0
    
    while stack:
        curr = stack[-1]  # Peek top of stack
        
        # Find unvisited neighbors of curr
        unvisited_neighbors = []
        for nbr, edge_data in adj[curr]:
            if nbr not in visited_set:
                unvisited_neighbors.append((nbr, edge_data))
                
        if unvisited_neighbors:
            # Pick first unvisited neighbor (drilling down)
            next_node, edge_data = unvisited_neighbors[0]
            edges_traversed += 1
            
            # Frame: Pulse link to next node
            timeline.append({
                "frame": frame_counter,
                "currentNode": curr,
                "visited": list(visited_list),
                "queue": [],
                "stack": list(stack),
                "currentEdge": [curr, next_node],
                "action": f"Scanner probing connection: {curr} → {next_node}"
            })
            frame_counter += 1
            
            # Move to next node
            stack.append(next_node)
            visited_set.add(next_node)
            visited_list.append(next_node)
            traversal_order.append(next_node)
            
            # Frame: Next node infected
            timeline.append({
                "frame": frame_counter,
                "currentNode": next_node,
                "visited": list(visited_list),
                "queue": [],
                "stack": list(stack),
                "currentEdge": [curr, next_node],
                "action": f"Device compromised: {next_node}"
            })
            frame_counter += 1
            
        else:
            # No unvisited neighbors: backtrack!
            backtracked_node = stack.pop()
            
            if stack:
                parent_node = stack[-1]
                # Frame: Backtracking action through link
                timeline.append({
                    "frame": frame_counter,
                    "currentNode": parent_node,
                    "visited": list(visited_list),
                    "queue": [],
                    "stack": list(stack),
                    "currentEdge": [backtracked_node, parent_node],
                    "action": f"Backtracking from dead-end: {backtracked_node} → {parent_node}"
                })
                frame_counter += 1
            else:
                # Stack is empty: backtrack completed
                timeline.append({
                    "frame": frame_counter,
                    "currentNode": None,
                    "visited": list(visited_list),
                    "queue": [],
                    "stack": [],
                    "currentEdge": None,
                    "action": "Backtrack completed back to root."
                })
                frame_counter += 1

    # Final timeline completion frame
    timeline.append({
        "frame": frame_counter,
        "currentNode": None,
        "visited": list(visited_list),
        "queue": [],
        "stack": [],
        "currentEdge": None,
        "action": "Simulation completed. Scanner scan finished."
    })

    # Compile Statistics & Learning metadata
    statistics = {
        "visitedNodes": len(visited_list),
        "edgesTraversed": edges_traversed,
        "totalNodes": len(nodes),
        "infectedPercent": round((len(visited_list) / len(nodes)) * 100, 1) if nodes else 0,
        "timeComplexity": "O(V + E)",
        "spaceComplexity": "O(V)"
    }
    
    learning = {
        "pseudoCode": [
            "DFS(Graph, node):",
            "  Push(Stack, node)",
            "  Mark node as Visited",
            "  while Stack is not empty:",
            "    current = Peek(Stack)",
            "    unvisited = get_first_unvisited_neighbor(current)",
            "    if unvisited exists:",
            "      Push(Stack, unvisited)",
            "      Mark unvisited as Visited",
            "    else:",
            "      Pop(Stack)  // Backtrack"
        ],
        "explanation": "Depth-First Search (DFS) drills down a path as deep as possible using a LIFO Stack before backtracking. In network simulations, this models a scanning agent indexing subnets sequentially. It backtracks when reaching a leaf node (e.g., workstation PC) to search alternate routes.",
        "advantages": "Requires less memory than BFS on wide graphs, as it only stores the active path route in stack.",
        "disadvantages": "Can get stuck in deep paths or infinite loops if not properly tracking visited flags.",
        "applications": "Solving puzzles (maze navigation), cycle detection, topological sorting, finding strongly connected components."
    }

    return {
        "success": True,
        "timeline": timeline,
        "statistics": statistics,
        "learning": learning,
        "result": {
            "traversalOrder": traversal_order,
            "infectedCount": len(visited_list)
        }
    }
