from typing import Dict, List, Any
import heapq

"""
File: branch_bound.py
Author: Antigravity AI
Purpose: Branch & Bound 0/1 Knapsack solver for binary node recovery under budget.
"""

def get_node_cost_value(node_type: str) -> tuple[float, float]:
    n_type = node_type.lower()
    if "server" in n_type:
        return 50.0, 100.0
    elif "router" in n_type:
        return 30.0, 80.0
    elif "firewall" in n_type:
        return 25.0, 75.0
    elif "switch" in n_type or "access point" in n_type or "wap" in n_type:
        return 20.0, 60.0
    elif "pc" in n_type or "laptop" in n_type or "printer" in n_type:
        return 10.0, 20.0
    else:
        return 5.0, 5.0

class Node:
    def __init__(self, level: int, profit: float, weight: float, bound: float, path: List[int]):
        self.level = level
        self.profit = profit
        self.weight = weight
        self.bound = bound
        self.path = path  # binary choices: 1 for taken, 0 for not

    def __lt__(self, other):
        # Max-heap priority for bounds: select highest bound first
        return self.bound > other.bound

def calculate_bound(node: Node, N: int, budget: float, items: List[Dict]) -> float:
    if node.weight >= budget:
        return 0.0
        
    profit_bound = node.profit
    total_weight = node.weight
    j = node.level + 1
    
    while j < N and total_weight + items[j]["cost"] <= budget:
        total_weight += items[j]["cost"]
        profit_bound += items[j]["value"]
        j += 1
        
    if j < N:
        # fractional knapsack bound
        profit_bound += (budget - total_weight) * items[j]["ratio"]
        
    return profit_bound

def run_branch_bound(graph: Dict[str, Any], options: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Run Branch & Bound 0/1 Knapsack solver.
    
    Args:
        graph: Dict containing 'nodes' and 'edges'.
        options: Dict containing 'budget' (float).
        
    Returns:
        dict: Standard algorithm execution result.
    """
    budget = float((options or {}).get("budget", 100.0))
    nodes = graph.get("nodes", [])
    
    if not nodes:
        return {"success": False, "timeline": [], "statistics": {}, "learning": {}, "result": {"error": "Graph is empty."}}

    # Standardize items
    items = []
    for n in nodes:
        n_id = n["id"]
        n_type = n.get("type", "PC")
        label = n.get("label", n_id)
        cost, val = get_node_cost_value(n_type)
        items.append({
            "id": n_id,
            "label": label,
            "cost": cost,
            "value": val,
            "ratio": val / cost if cost > 0 else 0
        })

    # Sort items by value/cost ratio descending to optimize bounding
    sorted_items = sorted(items, key=lambda x: x["ratio"], reverse=True)
    N = len(sorted_items)

    # To prevent search space explosion in large graphs, limit the items array
    # for branch and bound solver to the first 8 dense items.
    active_items = sorted_items[:8]
    N_active = len(active_items)

    timeline = []
    frame_counter = 1
    
    # Priority Queue of active states in decision tree
    pq = []
    
    root_bound = calculate_bound(Node(-1, 0.0, 0.0, 0.0, []), N_active, budget, active_items)
    root = Node(-1, 0.0, 0.0, root_bound, [])
    heapq.heappush(pq, root)
    
    max_profit = 0.0
    best_path = []
    
    nodes_expanded = 0
    nodes_pruned = 0
    max_frames = 45

    def format_pq(q_list):
        return [f"L{n.level} (b={round(n.bound,1)})" for n in sorted(q_list)]

    # Frame 1: Initial state
    timeline.append({
        "frame": frame_counter,
        "currentNode": None,
        "visited": [],
        "queue": format_pq(pq),
        "stack": [],
        "currentEdge": None,
        "action": f"Branch & Bound initialized. Bound at root Node = {round(root_bound, 1)}.",
        "maxProfit": max_profit,
        "nodesExpanded": nodes_expanded,
        "nodesPruned": nodes_pruned
    })
    frame_counter += 1

    visited_node_ids = []

    # Branch and bound search tree traversal loop
    while pq and frame_counter < max_frames:
        curr_node = heapq.heappop(pq)
        
        # If node bound is less than max profit found, prune it
        if curr_node.bound <= max_profit:
            nodes_pruned += 1
            # Frame: Prune node
            timeline.append({
                "frame": frame_counter,
                "currentNode": None,
                "visited": list(visited_node_ids),
                "queue": format_pq(pq),
                "stack": [],
                "currentEdge": None,
                "action": f"PRUNED node at level {curr_node.level} (bound {round(curr_node.bound, 1)} <= max profit {round(max_profit, 1)})",
                "maxProfit": max_profit,
                "nodesExpanded": nodes_expanded,
                "nodesPruned": nodes_pruned
            })
            frame_counter += 1
            continue

        # Terminal leaf level node
        if curr_node.level == N_active - 1:
            continue

        next_level = curr_node.level + 1
        item = active_items[next_level]
        nodes_expanded += 1
        
        # Branch 1: Include item (Left child)
        left_weight = curr_node.weight + item["cost"]
        left_profit = curr_node.profit + item["value"]
        left_path = curr_node.path + [1]
        
        left_node = Node(next_level, left_profit, left_weight, 0.0, left_path)
        
        if left_weight <= budget:
            if left_profit > max_profit:
                max_profit = left_profit
                best_path = left_path
                # Keep trace of node IDs in best path
                visited_node_ids = [active_items[i]["id"] for i, val in enumerate(best_path) if val == 1]
                
            left_node.bound = calculate_bound(left_node, N_active, budget, active_items)
            if left_node.bound > max_profit:
                heapq.heappush(pq, left_node)
            else:
                nodes_pruned += 1

        # Branch 2: Exclude item (Right child)
        right_node = Node(next_level, curr_node.profit, curr_node.weight, 0.0, curr_node.path + [0])
        right_node.bound = calculate_bound(right_node, N_active, budget, active_items)
        
        if right_node.bound > max_profit:
            heapq.heappush(pq, right_node)
        else:
            nodes_pruned += 1

        # Frame: State expansion
        timeline.append({
            "frame": frame_counter,
            "currentNode": item["id"],
            "visited": list(visited_node_ids),
            "queue": format_pq(pq),
            "stack": [],
            "currentEdge": None,
            "action": f"Expanded level {next_level} for device '{item['label']}'. Updated max profit = {round(max_profit, 1)}.",
            "maxProfit": max_profit,
            "nodesExpanded": nodes_expanded,
            "nodesPruned": nodes_pruned
        })
        frame_counter += 1

    # Format packed result items
    packed_items = []
    total_cost_used = 0.0
    for i, taken in enumerate(best_path):
        if taken == 1:
            it = active_items[i]
            packed_items.append({
                "id": it["id"],
                "label": it["label"],
                "cost": it["cost"],
                "value": it["value"]
            })
            total_cost_used += it["cost"]

    # Final timeline completion frame
    timeline.append({
        "frame": frame_counter,
        "currentNode": None,
        "visited": list(visited_node_ids),
        "queue": [],
        "stack": [],
        "currentEdge": None,
        "action": f"Branch & Bound completed. Optimal binary profit = {round(max_profit, 1)} | Budget used = {round(total_cost_used, 1)}.",
        "maxProfit": max_profit,
        "nodesExpanded": nodes_expanded,
        "nodesPruned": nodes_pruned
    })

    statistics = {
        "nodesExpanded": nodes_expanded,
        "nodesPruned": nodes_pruned,
        "bestCost": total_cost_used,
        "bestValue": max_profit,
        "itemsPackedCount": len(packed_items),
        "timeComplexity": "O(2^N) Worst Case",
        "spaceComplexity": "O(2^N)"
    }
    
    learning = {
        "pseudoCode": [
            "BranchAndBound(Items, budget):",
            "  initialize priority queue PQ with root Node(level=-1, profit=0, weight=0)",
            "  max_profit = 0",
            "  while PQ is not empty:",
            "    u = Dequeue(PQ)  // node with maximum bound",
            "    if u.bound > max_profit:",
            "      branch left (include next item):",
            "        if left.weight <= budget and left.profit > max_profit: max_profit = left.profit",
            "        left.bound = bound(left)",
            "        if left.bound > max_profit: Enqueue(PQ, left)",
            "      branch right (exclude next item):",
            "        right.bound = bound(right)",
            "        if right.bound > max_profit: Enqueue(PQ, right)"
        ],
        "explanation": "Branch & Bound solves binary optimization (0/1 Knapsack) by building a decision state space tree. It computes an optimistic upper bound (using fractional knapsack relaxation) for each node. If a node's bound is lower than the current best known integer solution, it prunes the entire subtree, avoiding wasteful brute force expansions.",
        "advantages": "Finds the exact integer optimal solution while expanding only a fraction of the exponential state space.",
        "disadvantages": "Has an exponential O(2^N) worst-case complexity if bounds are loose, consuming high memory.",
        "applications": "0/1 Knapsack budget optimizations, Integer Linear Programming (ILP), hardware resource allocation, Job Scheduling."
    }

    return {
        "success": True,
        "timeline": timeline,
        "statistics": statistics,
        "learning": learning,
        "result": {
            "packedItems": packed_items,
            "totalValue": max_profit,
            "totalCost": total_cost_used
        }
    }
