from typing import Dict, List, Any

"""
File: kruskal.py
Author: Antigravity AI
Purpose: Kruskal's Minimum Spanning Tree (MST) algorithm with Union-Find operations.
"""

class DisjointSet:
    def __init__(self, elements: List[str]):
        self.parent = {el: el for el in elements}
        self.rank = {el: 0 for el in elements}
        self.find_ops = 0
        self.union_ops = 0
        self.compressions = 0

    def find(self, i: str) -> str:
        self.find_ops += 1
        if self.parent[i] == i:
            return i
        
        # Path compression
        old_parent = self.parent[i]
        self.parent[i] = self.find(self.parent[i])
        if self.parent[i] != old_parent:
            self.compressions += 1
            
        return self.parent[i]

    def union(self, i: str, j: str) -> bool:
        root_i = self.find(i)
        root_j = self.find(j)
        
        if root_i == root_j:
            return False  # Already in same set
            
        self.union_ops += 1
        # Union by rank
        if self.rank[root_i] < self.rank[root_j]:
            self.parent[root_i] = root_j
        elif self.rank[root_i] > self.rank[root_j]:
            self.parent[root_j] = root_i
        else:
            self.parent[root_j] = root_i
            self.rank[root_i] += 1
            
        return True

def run_kruskal(graph: Dict[str, Any], options: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Run Kruskal's algorithm to compute the Minimum Spanning Tree.
    
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

    # Sort all edges by weight
    sorted_edges = sorted(edges, key=lambda e: float(e.get("weight", 1.0)))
    
    # Initialize Disjoint Set
    ds = DisjointSet(node_ids)
    
    timeline = []
    frame_counter = 1
    mst_edges = []
    total_weight = 0.0
    cycles_prevented = 0
    visited_nodes = set()

    def format_sorted_edges(edges_list, current_idx):
        # Format remaining edges for timeline display
        return [
            f"{e['source']}↔{e['target']} (w={e.get('weight', 1.0)})"
            for idx, e in enumerate(edges_list)
            if idx >= current_idx
        ]

    # Frame 1: Initial state
    timeline.append({
        "frame": frame_counter,
        "currentNode": None,
        "visited": [],
        "queue": format_sorted_edges(sorted_edges, 0),
        "stack": [],
        "currentEdge": None,
        "action": f"Kruskal's MST initialized. Sorted {len(sorted_edges)} edges by weight. Union-Find parents established.",
        "parentArray": dict(ds.parent),
        "mstWeight": total_weight
    })
    frame_counter += 1

    # Kruskal loop over sorted edges
    for idx, edge in enumerate(sorted_edges):
        u = edge["source"]
        v = edge["target"]
        w = float(edge.get("weight", 1.0))
        
        # Call Find on both ends
        root_u = ds.find(u)
        root_v = ds.find(v)
        
        if root_u != root_v:
            # No cycle: union components
            ds.union(u, v)
            mst_edges.append(edge)
            total_weight += w
            visited_nodes.add(u)
            visited_nodes.add(v)
            
            # Frame: Edge accepted
            timeline.append({
                "frame": frame_counter,
                "currentNode": None,
                "visited": list(visited_nodes),
                "queue": format_sorted_edges(sorted_edges, idx + 1),
                "stack": [],
                "currentEdge": [u, v],
                "action": f"Accepted link '{node_labels[u]} ↔ {node_labels[v]}' (weight {w}). Disjoint sets merged.",
                "parentArray": dict(ds.parent),
                "mstWeight": round(total_weight, 1)
            })
            frame_counter += 1
        else:
            # Cycle detected
            cycles_prevented += 1
            
            # Frame: Edge rejected (cycle)
            timeline.append({
                "frame": frame_counter,
                "currentNode": None,
                "visited": list(visited_nodes),
                "queue": format_sorted_edges(sorted_edges, idx + 1),
                "stack": [],
                "currentEdge": [u, v],
                "action": f"REJECTED link '{node_labels[u]} ↔ {node_labels[v]}' (weight {w}) to prevent cycle. Same set parent: '{node_labels[root_u]}'.",
                "parentArray": dict(ds.parent),
                "mstWeight": round(total_weight, 1)
            })
            frame_counter += 1

    # Check if spanning tree spans all components
    connected = len(visited_nodes) == len(nodes)
    if len(nodes) == 1:
        connected = True

    timeline.append({
        "frame": frame_counter,
        "currentNode": None,
        "visited": list(visited_nodes),
        "queue": [],
        "stack": [],
        "currentEdge": None,
        "action": f"Kruskal's algorithm finished. MST total weight = {round(total_weight, 1)}.",
        "parentArray": dict(ds.parent),
        "mstWeight": round(total_weight, 1)
    })

    statistics = {
        "edgesSelected": len(mst_edges),
        "edgesRejected": cycles_prevented,
        "totalWeight": total_weight,
        "findOperations": ds.find_ops,
        "unionOperations": ds.union_ops,
        "pathCompressions": ds.compressions,
        "graphConnected": connected,
        "timeComplexity": "O(E log E)",
        "spaceComplexity": "O(V)"
    }
    
    learning = {
        "pseudoCode": [
            "Kruskal(Graph):",
            "  initialize empty list MST_Edges",
            "  initialize UnionFind disjoint-set for all V",
            "  sort all edges in Graph by weight ascending",
            "  for each edge (u, v) in sorted_edges:",
            "    if Find(u) != Find(v):",
            "      add edge to MST_Edges",
            "      Union(u, v)",
            "  return MST_Edges"
        ],
        "explanation": "Kruskal's algorithm finds the Minimum Spanning Tree by sorting all edges from cheapest to most expensive and adding them if they do not create a loop (cycle). Cycle detection is performed in almost O(1) time using a Union-Find data structure with Path Compression.",
        "advantages": "Ideal for sparse graphs and operates natively on disconnected components (producing a Spanning Forest).",
        "disadvantages": "Requires sorting all edges, which is expensive on very dense graphs with many links.",
        "applications": "Cable layouts for nationwide telecommunications networks, building pipeline routing networks, cluster categorization."
    }

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
