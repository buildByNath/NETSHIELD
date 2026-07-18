from typing import Dict, List, Any

"""
File: topological_sort.py
Author: Antigravity AI
Purpose: Kahn's algorithm for topological sorting of dependency graphs.
"""

def run_topological_sort(graph: Dict[str, Any], options: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Run Kahn's topological sort algorithm treating edges as directed from source to target.
    
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

    # Build Directed Adjacency List and Calculate In-Degrees
    adj = {n_id: [] for n_id in node_ids}
    in_degree = {n_id: 0 for n_id in node_ids}
    
    for edge in edges:
        s = edge["source"]
        t = edge["target"]
        if s in adj and t in adj:
            adj[s].append(t)
            in_degree[t] += 1

    timeline = []
    frame_counter = 1
    
    # Initialize Queue with in-degree = 0 nodes
    queue = [n_id for n_id in node_ids if in_degree[n_id] == 0]
    sorted_list = []
    
    # Frame 1: Initialization
    timeline.append({
        "frame": frame_counter,
        "currentNode": None,
        "visited": [],
        "queue": list(queue),
        "stack": [],
        "currentEdge": None,
        "action": f"Topological sort initialized. Found {len(queue)} root nodes with 0 in-degree dependencies.",
        "inDegrees": dict(in_degree),
        "sortedList": list(sorted_list)
    })
    frame_counter += 1

    # Kahn's algorithm loop
    while queue:
        curr = queue.pop(0)
        sorted_list.append(curr)
        
        # Frame: Dequeue and add to order
        timeline.append({
            "frame": frame_counter,
            "currentNode": curr,
            "visited": list(sorted_list),
            "queue": list(queue),
            "stack": [],
            "currentEdge": None,
            "action": f"Processing '{node_labels[curr]}'. Adding to topological scheduling order.",
            "inDegrees": dict(in_degree),
            "sortedList": list(sorted_list)
        })
        frame_counter += 1

        # Decrement neighbor degrees
        for neighbor in adj[curr]:
            in_degree[neighbor] -= 1
            
            # Frame: Relax dependency edge
            timeline.append({
                "frame": frame_counter,
                "currentNode": curr,
                "visited": list(sorted_list),
                "queue": list(queue),
                "stack": [],
                "currentEdge": [curr, neighbor],
                "action": f"Satisfied dependency: '{node_labels[curr]}' → '{node_labels[neighbor]}'. Decremented '{node_labels[neighbor]}' in-degree to {in_degree[neighbor]}.",
                "inDegrees": dict(in_degree),
                "sortedList": list(sorted_list)
            })
            frame_counter += 1

            if in_degree[neighbor] == 0:
                queue.append(neighbor)
                
                # Frame: Neighbor added to queue
                timeline.append({
                    "frame": frame_counter,
                    "currentNode": neighbor,
                    "visited": list(sorted_list),
                    "queue": list(queue),
                    "stack": [],
                    "currentEdge": [curr, neighbor],
                    "action": f"Device '{node_labels[neighbor]}' has 0 remaining dependencies. Enqueued for scheduling.",
                    "inDegrees": dict(in_degree),
                    "sortedList": list(sorted_list)
                })
                frame_counter += 1

    # Check for cycles
    has_cycle = len(sorted_list) < len(node_ids)
    
    if has_cycle:
        return {
            "success": False,
            "timeline": [],
            "statistics": {},
            "learning": {},
            "result": {
                "error": "Cycle detected in dependency graph. Topological Sort only operates on Directed Acyclic Graphs (DAGs). Ensure there are no loop connections."
            }
        }

    # Final frame
    timeline.append({
        "frame": frame_counter,
        "currentNode": None,
        "visited": list(sorted_list),
        "queue": [],
        "stack": [],
        "currentEdge": None,
        "action": f"Topological sort completed. Scheduled {len(sorted_list)} devices.",
        "inDegrees": dict(in_degree),
        "sortedList": list(sorted_list)
    })

    statistics = {
        "processedNodes": len(sorted_list),
        "remainingNodes": len(node_ids) - len(sorted_list),
        "hasCycle": has_cycle,
        "timeComplexity": "O(V + E)",
        "spaceComplexity": "O(V)"
    }
    
    learning = {
        "pseudoCode": [
            "TopologicalSort(Graph):",
            "  calculate in-degree for all nodes",
            "  initialize Queue with all nodes of in-degree = 0",
            "  initialize empty list SortedList",
            "  while Queue is not empty:",
            "    u = Dequeue(Queue)",
            "    add u to SortedList",
            "    for each neighbor v of u:",
            "      in-degree[v] = in-degree[v] - 1",
            "      if in-degree[v] == 0:",
            "        Enqueue(Queue, v)",
            "  if len(SortedList) < V: return 'Cycle Detected'",
            "  return SortedList"
        ],
        "explanation": "Topological Sort schedules tasks based on directed dependencies. It counts incoming links (in-degrees) and processes nodes with 0 dependencies, stripping away completed edges. If a loop cycle is encountered, Kahn's algorithm gets stuck, revealing that the dependencies cannot be resolved.",
        "advantages": "Ideal for resolving dependency graphs and ordering installation tasks sequentially.",
        "disadvantages": "Only runs on Directed Acyclic Graphs (DAGs); fails on undirected or cyclic connection configurations.",
        "applications": "Server startup sequence ordering, compiler file build systems, package installer link trees, project task schedulers."
    }

    return {
        "success": True,
        "timeline": timeline,
        "statistics": statistics,
        "learning": learning,
        "result": {
            "order": sorted_list,
            "success": True
        }
    }
