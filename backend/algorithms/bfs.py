from typing import List, Dict, Any

"""
File: bfs.py
Author: Antigravity AI
Purpose: Breadth-First Search (BFS) attack simulation engine modeling worm propagation.
"""

def run_bfs(graph: Dict[str, Any], start_node: Any, options: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Run Breadth-First Search on the graph starting from one or more nodes.
    Supports single start node (str) or multiple start nodes (list).
    
    Args:
        graph: Dict containing 'nodes' and 'edges' lists.
        start_node: Starting node ID (str) or list of starting node IDs.
        options: Optional parameters.
        
    Returns:
        dict: Standard algorithm execution result.
    """
    timeline = []
    visited_list = []
    visited_set = set()
    queue = []
    
    nodes = graph.get("nodes", [])
    edges = graph.get("edges", [])
    
    # 1. Parse start nodes
    if isinstance(start_node, list):
        start_nodes = start_node
    else:
        start_nodes = [start_node] if start_node else []
        
    # Verify starting nodes exist
    node_ids = {n["id"] for n in nodes}
    start_nodes = [s for s in start_nodes if s in node_ids]
    
    if not start_nodes:
        return {
            "success": False,
            "timeline": [],
            "statistics": {},
            "learning": {},
            "result": {"error": "Invalid starting node(s)."}
        }

    # 2. Build Undirected Adjacency List
    adj = {n["id"]: [] for n in nodes}
    for edge in edges:
        s = edge["source"]
        t = edge["target"]
        if s in adj and t in adj:
            adj[s].append((t, edge))
            adj[t].append((s, edge))

    frame_counter = 1
    
    # 3. Setup Initial State
    for s_node in start_nodes:
        queue.append(s_node)
        visited_set.add(s_node)
        visited_list.append(s_node)
        
    # Frame 1: Simulation started
    timeline.append({
        "frame": frame_counter,
        "currentNode": None,
        "visited": list(visited_list),
        "queue": list(queue),
        "stack": [],
        "currentEdge": None,
        "action": f"Infection started at source: {', '.join(start_nodes)}"
    })
    frame_counter += 1

    # 4. BFS Traversal Loop
    traversal_order = list(start_nodes)
    edges_traversed = 0
    
    while queue:
        curr = queue.pop(0)
        
        # Frame: Dequeue and inspect node
        timeline.append({
            "frame": frame_counter,
            "currentNode": curr,
            "visited": list(visited_list),
            "queue": list(queue),
            "stack": [],
            "currentEdge": None,
            "action": f"Scanning from active device: {curr}"
        })
        frame_counter += 1
        
        # Scan all neighbors
        for neighbor, edge_data in adj[curr]:
            if neighbor not in visited_set:
                edges_traversed += 1
                
                # Frame: Pulse link to neighbor
                timeline.append({
                    "frame": frame_counter,
                    "currentNode": curr,
                    "visited": list(visited_list),
                    "queue": list(queue),
                    "stack": [],
                    "currentEdge": [curr, neighbor],
                    "action": f"Worm traversing connection: {curr} ↔ {neighbor}"
                })
                frame_counter += 1
                
                # Enqueue neighbor & mark infected
                queue.append(neighbor)
                visited_set.add(neighbor)
                visited_list.append(neighbor)
                traversal_order.append(neighbor)
                
                # Frame: Neighbor infected
                timeline.append({
                    "frame": frame_counter,
                    "currentNode": neighbor,
                    "visited": list(visited_list),
                    "queue": list(queue),
                    "stack": [],
                    "currentEdge": [curr, neighbor],
                    "action": f"Device compromised: {neighbor}"
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
        "action": "Simulation completed. All reachable nodes compromised."
    })

    # 5. Compile Statistics & Learning metadata
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
            "BFS(Graph, StartNodes):",
            "  initialize empty Queue and Visited set",
            "  for each node in StartNodes:",
            "    Enqueue(Queue, node)",
            "    Add node to Visited",
            "  while Queue is not empty:",
            "    current = Dequeue(Queue)",
            "    for each neighbor in adjacent(current):",
            "      if neighbor not in Visited:",
            "        Enqueue(Queue, neighbor)",
            "        Add neighbor to Visited"
        ],
        "explanation": "Breadth-First Search (BFS) spreads level-by-level using a FIFO Queue. In network propagation, this models a worm replicating concurrently to all adjacent devices. Its execution time scales linearly with the size of nodes (V) and edges (E).",
        "advantages": "Finds the shortest propagation path (minimum hops) to all other nodes from the source.",
        "disadvantages": "High memory consumption as it stores all frontier nodes at the current level.",
        "applications": "Routing protocols (OSPF link-state database sync), social network indexing, garbage collection."
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
