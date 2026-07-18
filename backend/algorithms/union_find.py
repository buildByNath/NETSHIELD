from typing import Dict, List, Any

"""
File: union_find.py
Author: Antigravity AI
Purpose: Union-Find disjoint-set operations simulation on edge additions.
"""

class TraceableUnionFind:
    def __init__(self, elements: List[str]):
        self.parent = {el: el for el in elements}
        self.rank = {el: 0 for el in elements}
        self.find_ops = 0
        self.union_ops = 0
        self.compressions = 0
        self.log = []

    def find(self, i: str) -> str:
        self.find_ops += 1
        if self.parent[i] == i:
            return i
            
        old_parent = self.parent[i]
        # Path compression
        self.parent[i] = self.find(self.parent[i])
        if self.parent[i] != old_parent:
            self.compressions += 1
            self.log.append(f"Compressed path: Parent of '{i}' updated directly to root '{self.parent[i]}'")
            
        return self.parent[i]

    def union(self, i: str, j: str) -> bool:
        root_i = self.find(i)
        root_j = self.find(j)
        
        if root_i == root_j:
            return False  # Same set (cycle)
            
        self.union_ops += 1
        # Union by rank
        if self.rank[root_i] < self.rank[root_j]:
            self.parent[root_i] = root_j
            self.log.append(f"Union: Root '{root_i}' linked under root '{root_j}'")
        elif self.rank[root_i] > self.rank[root_j]:
            self.parent[root_j] = root_i
            self.log.append(f"Union: Root '{root_j}' linked under root '{root_i}'")
        else:
            self.parent[root_j] = root_i
            self.rank[root_i] += 1
            self.log.append(f"Union: Root '{root_j}' linked under root '{root_i}' (rank increased to {self.rank[root_i]})")
            
        return True

def run_union_find(graph: Dict[str, Any], options: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Run Union-Find simulation, processing each link to build disjoint-set forests.
    
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

    uf = TraceableUnionFind(node_ids)
    timeline = []
    frame_counter = 1
    
    # Frame 1: Initialization
    timeline.append({
        "frame": frame_counter,
        "currentNode": None,
        "visited": [],
        "queue": [],
        "stack": [],
        "currentEdge": None,
        "action": "Disjoint set initialized. Every node starts as its own representative root.",
        "parentArray": dict(uf.parent),
        "ranks": dict(uf.rank),
        "log": list(uf.log)
    })
    frame_counter += 1

    cycles_detected = 0
    active_sets = len(node_ids)

    # Process each edge to demonstrate Union-Find merging
    for edge in edges:
        u = edge["source"]
        v = edge["target"]
        
        uf.log = [] # clear logs for this frame
        
        # Frame: Find root of u
        root_u = uf.find(u)
        u_find_logs = list(uf.log)
        uf.log = []
        
        # Frame: Find root of v
        root_v = uf.find(v)
        v_find_logs = list(uf.log)
        uf.log = []
        
        # Combine find logs for display
        find_action = f"Find: root({node_labels[u]}) = {node_labels[root_u]} | root({node_labels[v]}) = {node_labels[root_v]}"
        all_find_logs = u_find_logs + v_find_logs
        
        timeline.append({
            "frame": frame_counter,
            "currentNode": u,
            "visited": [u, v],
            "queue": [],
            "stack": [],
            "currentEdge": [u, v],
            "action": find_action + (f" | Logs: {', '.join(all_find_logs)}" if all_find_logs else ""),
            "parentArray": dict(uf.parent),
            "ranks": dict(uf.rank)
        })
        frame_counter += 1

        # Attempt Union
        union_success = uf.union(u, v)
        union_logs = list(uf.log)
        
        if union_success:
            active_sets -= 1
            action_desc = f"Union Success: Merged sets for '{node_labels[u]}' and '{node_labels[v]}'. " + ", ".join(union_logs)
        else:
            cycles_detected += 1
            action_desc = f"Union Failed: '{node_labels[u]}' and '{node_labels[v]}' already belong to the same set (root '{node_labels[root_u]}'). Cycle detected!"

        timeline.append({
            "frame": frame_counter,
            "currentNode": v,
            "visited": [u, v],
            "queue": [],
            "stack": [],
            "currentEdge": [u, v],
            "action": action_desc,
            "parentArray": dict(uf.parent),
            "ranks": dict(uf.rank)
        })
        frame_counter += 1

    # Final frame
    timeline.append({
        "frame": frame_counter,
        "currentNode": None,
        "visited": [],
        "queue": [],
        "stack": [],
        "currentEdge": None,
        "action": f"Union-Find finished. Disjoint sets merged. Total components remaining: {active_sets}.",
        "parentArray": dict(uf.parent),
        "ranks": dict(uf.rank)
    })

    statistics = {
        "findOperations": uf.find_ops,
        "unionOperations": uf.union_ops,
        "pathCompressions": uf.compressions,
        "cyclesDetected": cycles_detected,
        "remainingComponents": active_sets,
        "timeComplexity": "O(α(V)) Amortized",
        "spaceComplexity": "O(V)"
    }
    
    learning = {
        "pseudoCode": [
            "Find(i):",
            "  if parent[i] == i:",
            "    return i",
            "  else:",
            "    parent[i] = Find(parent[i])  // Path compression",
            "    return parent[i]",
            "",
            "Union(i, j):",
            "  root_i = Find(i), root_j = Find(j)",
            "  if root_i != root_j:",
            "    if rank[root_i] < rank[root_j]: parent[root_i] = root_j",
            "    else if rank[root_i] > rank[root_j]: parent[root_j] = root_i",
            "    else: parent[root_j] = root_i, rank[root_i]++"
        ],
        "explanation": "Union-Find (Disjoint-Set) maintains partition details for elements. It supports fast Find (identifying representing roots) and Union (merging subsets) operations. Path Compression flattens the pointer structure during searches, resulting in near-constant amortized time complexity O(α(V)).",
        "advantages": "Incredibly fast operations that bypass recursion bottlenecks on huge data sizes.",
        "disadvantages": "Only maintains connectedness structure; does not calculate shortest routing paths natively.",
        "applications": "Cycle detection in Kruskal's MST, network connection component tracking, equivalence relation sorting."
    }

    return {
        "success": True,
        "timeline": timeline,
        "statistics": statistics,
        "learning": learning,
        "result": {
            "parents": uf.parent,
            "ranks": uf.rank,
            "components": active_sets
        }
    }
