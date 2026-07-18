import random
from typing import Dict, List, Any

"""
File: randomized_quicksort.py
Author: Antigravity AI
Purpose: Randomized Quick Sort visualization detailing pivots, partitions, and swaps.
"""

def run_randomized_quicksort(options: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Run Randomized Quick Sort simulation on an array.
    
    Args:
        options: Dict containing 'array' (List[int]).
        
    Returns:
        dict: Standard algorithm execution result.
    """
    array = (options or {}).get("array", [29, 10, 14, 37, 13, 2, 7])
    
    if not isinstance(array, list):
        return {"success": False, "timeline": [], "statistics": {}, "learning": {}, "result": {"error": "Input must be an array."}}

    timeline = []
    frame_counter = 1
    swaps = 0
    comparisons = 0
    recursive_calls = 0
    
    arr = list(array)

    timeline.append({
        "frame": frame_counter,
        "action": f"Initialize Randomized Quick Sort with array: {arr}",
        "array": list(arr),
        "pivotIdx": -1,
        "pivotValue": None,
        "leftIdx": -1,
        "rightIdx": -1
    })
    frame_counter += 1

    def quicksort(low: int, high: int):
        nonlocal frame_counter, swaps, comparisons, recursive_calls
        
        if low >= high:
            return

        recursive_calls += 1
        
        # 1. Randomized Pivot Selection
        pivot_idx = random.randint(low, high)
        pivot_val = arr[pivot_idx]
        
        # Frame: Show selected pivot
        timeline.append({
            "frame": frame_counter,
            "action": f"Selected random pivot value {pivot_val} at index {pivot_idx} (range: [{low}, {high}])",
            "array": list(arr),
            "pivotIdx": pivot_idx,
            "pivotValue": pivot_val,
            "leftIdx": low,
            "rightIdx": high
        })
        frame_counter += 1

        # Swap pivot with high element
        arr[pivot_idx], arr[high] = arr[high], arr[pivot_idx]
        swaps += 1
        
        # 2. Partitioning (Lomuto Partition Scheme)
        pivot = arr[high]
        i = low - 1
        
        for j in range(low, high):
            comparisons += 1
            if arr[j] < pivot:
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
                swaps += 1
                
                # Frame: Partition swap
                timeline.append({
                    "frame": frame_counter,
                    "action": f"Swapped element {arr[i]} with {arr[j]} since {arr[j]} < pivot {pivot}",
                    "array": list(arr),
                    "pivotIdx": high,
                    "pivotValue": pivot,
                    "leftIdx": i,
                    "rightIdx": j
                })
                frame_counter += 1

        # Place pivot in correct index
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        swaps += 1
        p_idx = i + 1

        # Frame: Pivot placed
        timeline.append({
            "frame": frame_counter,
            "action": f"Placed pivot {pivot} in sorted position at index {p_idx}",
            "array": list(arr),
            "pivotIdx": p_idx,
            "pivotValue": pivot,
            "leftIdx": -1,
            "rightIdx": -1
        })
        frame_counter += 1

        # Recursive sort calls
        quicksort(low, p_idx - 1)
        quicksort(p_idx + 1, high)

    quicksort(0, len(arr) - 1)

    # Final frame
    timeline.append({
        "frame": frame_counter,
        "action": f"Sorting complete. Sorted array: {arr}",
        "array": list(arr),
        "pivotIdx": -1,
        "pivotValue": None,
        "leftIdx": -1,
        "rightIdx": -1
    })

    statistics = {
        "swaps": swaps,
        "comparisons": comparisons,
        "recursiveCalls": recursive_calls,
        "originalSize": len(array),
        "timeComplexity": "Average: O(N log N) | Worst: O(N²)",
        "spaceComplexity": "O(log N)"
    }
    
    learning = {
        "pseudoCode": [
            "RandomizedQuickSort(A, p, r):",
            "  if p < r:",
            "    q = RandomizedPartition(A, p, r)",
            "    RandomizedQuickSort(A, p, q - 1)",
            "    RandomizedQuickSort(A, q + 1, r)",
            "",
            "RandomizedPartition(A, p, r):",
            "  i = Random(p, r)",
            "  swap A[r] with A[i]",
            "  return Partition(A, p, r)"
        ],
        "explanation": "Randomized Quick Sort is a divide-and-conquer algorithm. It selects a random element as a pivot, partitions the array so smaller items fall left and larger right, then recurses. Randomizing the pivot selection prevents O(N²) worst-case regressions on already sorted lists.",
        "advantages": "Extremely fast in practice with tiny memory footprint and O(log N) stack overhead.",
        "disadvantages": "Unstable sorting algorithm whose worst-case O(N²) can be triggered if degenerate inputs occur (though highly improbable).",
        "applications": "Standard library sorting algorithms (e.g. C++ std::sort, Java Arrays.sort), cache-efficient systems."
    }

    return {
        "success": True,
        "timeline": timeline,
        "statistics": statistics,
        "learning": learning,
        "result": {
            "sortedArray": arr
        }
    }
