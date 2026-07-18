from typing import Dict, List, Any

"""
File: fractional_knapsack.py
Author: Antigravity AI
Purpose: Fractional Knapsack algorithm prioritizing node recovery under a budget.
"""

def get_node_cost_value(node_type: str) -> tuple[float, float]:
    """
    Return (cost, value) mapping for a node device type.
    """
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

def run_fractional_knapsack(graph: Dict[str, Any], options: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Run Fractional Knapsack to determine optimal recovery order.
    
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

    # Map nodes to items: id, type, label, cost, value, ratio
    items = []
    for n in nodes:
        n_id = n["id"]
        n_type = n.get("type", "PC")
        label = n.get("label", n_id)
        cost, val = get_node_cost_value(n_type)
        ratio = val / cost if cost > 0 else 0
        items.append({
            "id": n_id,
            "label": label,
            "type": n_type,
            "cost": cost,
            "value": val,
            "ratio": ratio
        })

    # Sort items by value/cost ratio descending
    sorted_items = sorted(items, key=lambda x: x["ratio"], reverse=True)

    timeline = []
    frame_counter = 1
    
    remaining_capacity = budget
    total_value = 0.0
    chosen_items = []
    
    def format_candidates(items_list, idx):
        return [
            f"{it['label']} (v/c={round(it['ratio'],1)})"
            for i, it in enumerate(items_list) if i >= idx
        ]

    # Frame 1: Initial state
    timeline.append({
        "frame": frame_counter,
        "currentNode": None,
        "visited": [],
        "queue": format_candidates(sorted_items, 0),
        "stack": [],
        "currentEdge": None,
        "action": f"Fractional Knapsack initialized with budget capacity = {budget}. Sorted items by density (value/cost).",
        "capacity": remaining_capacity,
        "value": total_value,
        "packedItems": []
    })
    frame_counter += 1

    visited_node_ids = []

    # Greedy knapsack selection loop
    for idx, item in enumerate(sorted_items):
        if remaining_capacity <= 0:
            break
            
        cost = item["cost"]
        val = item["value"]
        
        # Frame: Inspecting item
        timeline.append({
            "frame": frame_counter,
            "currentNode": item["id"],
            "visited": list(visited_node_ids),
            "queue": format_candidates(sorted_items, idx),
            "stack": [],
            "currentEdge": None,
            "action": f"Evaluating '{item['label']}' (cost={cost}, value={val}, ratio={round(item['ratio'], 1)})",
            "capacity": remaining_capacity,
            "value": total_value,
            "packedItems": list(chosen_items)
        })
        frame_counter += 1

        if cost <= remaining_capacity:
            # Add item fully
            remaining_capacity -= cost
            total_value += val
            chosen_items.append({
                "id": item["id"],
                "label": item["label"],
                "fraction": 1.0,
                "cost_used": cost,
                "value_gained": val
            })
            visited_node_ids.append(item["id"])
            
            # Frame: Added fully
            timeline.append({
                "frame": frame_counter,
                "currentNode": item["id"],
                "visited": list(visited_node_ids),
                "queue": format_candidates(sorted_items, idx + 1),
                "stack": [],
                "currentEdge": None,
                "action": f"Added 100% of device '{item['label']}' to recovery list. Deducted cost {cost}.",
                "capacity": remaining_capacity,
                "value": total_value,
                "packedItems": list(chosen_items)
            })
            frame_counter += 1
        else:
            # Add fractional part
            fraction = remaining_capacity / cost
            val_gained = fraction * val
            cost_used = remaining_capacity
            
            total_value += val_gained
            remaining_capacity = 0.0
            
            chosen_items.append({
                "id": item["id"],
                "label": item["label"],
                "fraction": fraction,
                "cost_used": cost_used,
                "value_gained": val_gained
            })
            visited_node_ids.append(item["id"])
            
            # Frame: Added fraction
            timeline.append({
                "frame": frame_counter,
                "currentNode": item["id"],
                "visited": list(visited_node_ids),
                "queue": format_candidates(sorted_items, idx + 1),
                "stack": [],
                "currentEdge": None,
                "action": f"Added fraction {round(fraction*100, 1)}% of device '{item['label']}' using remaining budget {round(cost_used, 1)}.",
                "capacity": remaining_capacity,
                "value": total_value,
                "packedItems": list(chosen_items)
            })
            frame_counter += 1
            break

    # Final frame
    timeline.append({
        "frame": frame_counter,
        "currentNode": None,
        "visited": list(visited_node_ids),
        "queue": [],
        "stack": [],
        "currentEdge": None,
        "action": f"Knapsack finished. Total value packed = {round(total_value, 1)} | Budget remaining = {round(remaining_capacity, 1)}.",
        "capacity": remaining_capacity,
        "value": total_value,
        "packedItems": list(chosen_items)
    })

    statistics = {
        "capacityUsed": budget - remaining_capacity,
        "capacityRemaining": remaining_capacity,
        "valueObtained": total_value,
        "efficiency": round((total_value / budget) * 100, 1) if budget > 0 else 0.0,
        "itemsPackedCount": len(chosen_items),
        "timeComplexity": "O(N log N)",
        "spaceComplexity": "O(N)"
    }
    
    learning = {
        "pseudoCode": [
            "FractionalKnapsack(Items, capacity):",
            "  calculate value/weight ratio for each item",
            "  sort items by ratio descending",
            "  total_value = 0",
            "  for each item in sorted_items:",
            "    if capacity >= item.weight:",
            "      capacity = capacity - item.weight",
            "      total_value = total_value + item.value",
            "    else:",
            "      fraction = capacity / item.weight",
            "      total_value = total_value + fraction * item.value",
            "      capacity = 0",
            "      break",
            "  return total_value"
        ],
        "explanation": "Fractional Knapsack prioritizes items by value-to-weight density ratios, greedily selecting elements to maximize value. It allows cutting items into fractions when the remaining weight limit is breached. In networks, it prioritizes high-value servers under budget limits.",
        "advantages": "Solves optimal recovery ordering in fast O(N log N) sorting time and finds the absolute optimal selection.",
        "disadvantages": "Only works if items can be fractionally recovered (e.g. partial bandwidth/disk allocations). Doesn't operate on pure binary states.",
        "applications": "Bandwidth channel slice allocation, cloud compute CPU core budgeting, resource supply chain prioritization."
    }

    return {
        "success": True,
        "timeline": timeline,
        "statistics": statistics,
        "learning": learning,
        "result": {
            "packedItems": chosen_items,
            "totalValue": total_value,
            "remainingBudget": remaining_capacity
        }
    }
