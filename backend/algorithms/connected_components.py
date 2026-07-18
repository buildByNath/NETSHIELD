from typing import Dict, List, Any

"""
File: connected_components.py
Author: Antigravity AI
Purpose: Connected Components algorithm to find isolated subnetworks.
"""

def run_connected_components(graph: Dict[str, Any], options: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Compute connected components of the graph.
    
    Args:
        graph: Dict containing 'nodes' and 'edges'.
        options: Optional settings.
        
    Returns:
        dict: Standard algorithm execution result.
    """
    nodes = graph.get("nodes", [])
    edges = graph.get("edges", [])
    node_ids = [n["id"] for n in nodes]
    node_labels = {n["id"]: n.get("label", n["id"]) for n in nodes}
    
    if not nodes:
        return {"success": False, "timeline": [], "statistics": {}, "learning": {}, "result": {"error": "Graph is empty."}}

    # Build Undirected Adjacency List
    adj = {n["id"]: [] for n in nodes}
    for edge in edges:
        s = edge["source"]
        t = edge["target"]
        if s in adj and t in adj:
            adj[s].append(t)
            adj[t].append(s)

    timeline = []
    frame_counter = 1
    
    visited_set = set()
    components = []
    
    # Frame 1: Initial state
    timeline.append({
        "frame": frame_counter,
        "currentNode": None,
        "visited": [],
        "queue": [],
        "stack": [],
        "currentEdge": None,
        "action": f"Connected components execution initialized for {len(nodes)} devices.",
        "components": {}
    })
    frame_counter += 1

    # Map of node_id to component index for visual styling
    node_components = {}

    # Traverse all nodes to find disjoint components
    comp_idx = 0
    for start_node in node_ids:
        if start_node not in visited_set:
            comp_idx += 1
            current_component = []
            
            # Start local component DFS traversal
            stack = [start_node]
            
            # Frame: Start new component search
            timeline.append({
                "frame": frame_counter,
                "currentNode": start_node,
                "visited": list(visited_set),
                "queue": [],
                "stack": list(stack),
                "currentEdge": None,
                "action": f"Discovered new subnetwork. Starting component {comp_idx} search at '{node_labels[start_node]}'",
                "components": dict(node_components)
            })
            frame_counter += 1
            
            while stack:
                curr = stack.pop()
                if curr not in visited_set:
                    visited_set.add(curr)
                    current_component.append(curr)
                    node_components[curr] = comp_idx
                    
                    # Frame: Node added to component
                    timeline.append({
                        "frame": frame_counter,
                        "currentNode": curr,
                        "visited": list(visited_set),
                        "queue": [],
                        "stack": list(stack),
                        "currentEdge": None,
                        "action": f"Device '{node_labels[curr]}' grouped into subnetwork component {comp_idx}.",
                        "components": dict(node_components)
                    })
                    frame_counter += 1
                    
                    for nbr in adj[curr]:
                        if nbr not in visited_set:
                            stack.append(nbr)
                            
            components.append(current_component)

    # Final timeline completion frame
    timeline.append({
        "frame": frame_counter,
        "currentNode": None,
        "visited": list(visited_set),
        "queue": [],
        "stack": [],
        "currentEdge": None,
        "action": f"Components analysis finished. Found {len(components)} isolated subnetworks.",
        "components": dict(node_components)
    })

    # Compile Statistics
    comp_sizes = [len(c) for c in components]
    largest = max(comp_sizes) if comp_sizes else 0
    smallest = min(comp_sizes) if comp_sizes else 0
    
    statistics = {
        "numComponents": len(components),
        "largestComponentSize": largest,
        "smallestComponentSize": smallest,
        "disjointSubnetworks": len(components) > 1,
        "timeComplexity": "O(V + E)",
        "spaceComplexity": "O(V)"
    }
    
    learning = {
        "pseudoCode": [
            "ConnectedComponents(Graph):",
            "  initialize Visited set, count = 0, components = list",
            "  for each node in Graph:",
            "    if node not in Visited:",
            "      count = count + 1",
            "      component = launch_dfs_search(Graph, node, Visited)",
            "      add component to components",
            "  return components"
        ],
        "explanation": "Connected Components searches for disconnected network sub-graphs. Starting at an unvisited device, it runs a full depth/breadth traversal. All nodes reached are clustered into a single subnetwork. It repeats until every node has been visited. This detects if physical network breaks have occurred.",
        "advantages": "Quickly indexes isolates and identifies separated hardware structures in linear time.",
        "disadvantages": "Only outlines structures without optimizing path weights or routing cables.",
        "applications": "Network partition detection, image segment indexing, computing social media connection groups."
    }

    return {
        "success": True,
        "timeline": timeline,
        "statistics": statistics,
        "learning": learning,
        "result": {
            "components": components,
            "count": len(components),
            "nodeComponents": node_components
        }
    }
