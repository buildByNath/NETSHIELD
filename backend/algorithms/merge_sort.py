from typing import Dict, List, Any

"""
File: merge_sort.py
Author: Antigravity AI
Purpose: Merge Sort visualization detailing dividing and merging phases.
"""

def run_merge_sort(options: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Run Merge Sort simulation on a list of numbers.
    
    Args:
        options: Dict containing 'array' (List[int]).
        
    Returns:
        dict: Standard algorithm execution result.
    """
    array = (options or {}).get("array", [12, 11, 13, 5, 6, 7])
    
    if not isinstance(array, list):
        return {"success": False, "timeline": [], "statistics": {}, "learning": {}, "result": {"error": "Input must be an array."}}

    timeline = []
    frame_counter = 1
    comparisons = 0
    merge_ops = 0

    # Capture initial frame
    timeline.append({
        "frame": frame_counter,
        "action": f"Initialize Merge Sort with array: {array}",
        "array": list(array),
        "subarrays": [],
        "currentNode": None
    })
    frame_counter += 1

    # Recursive helper to track divisions and merges
    def merge_sort_helper(arr: List[int], start_idx: int) -> List[int]:
        nonlocal frame_counter, comparisons, merge_ops
        
        n = len(arr)
        if n <= 1:
            return arr
            
        mid = n // 2
        left_half = arr[:mid]
        right_half = arr[mid:]
        
        # Frame: Divide array
        timeline.append({
            "frame": frame_counter,
            "action": f"Divide array of size {n} into left half {left_half} and right half {right_half}",
            "array": list(array),
            "subarrays": [left_half, right_half],
            "currentNode": None
        })
        frame_counter += 1

        left_sorted = merge_sort_helper(left_half, start_idx)
        right_sorted = merge_sort_helper(right_half, start_idx + mid)
        
        # Merge operation
        merged = []
        i = j = 0
        
        while i < len(left_sorted) and j < len(right_sorted):
            comparisons += 1
            if left_sorted[i] <= right_sorted[j]:
                merged.append(left_sorted[i])
                i += 1
            else:
                merged.append(right_sorted[j])
                j += 1
                
        while i < len(left_sorted):
            merged.append(left_sorted[i])
            i += 1
            
        while j < len(right_sorted):
            merged.append(right_sorted[j])
            j += 1

        merge_ops += 1
        
        # Reflect merge in parent/original array
        # Note: This is an educational visual state approximation
        timeline.append({
            "frame": frame_counter,
            "action": f"Merged sorted halves {left_sorted} and {right_sorted} → {merged}",
            "array": list(array),
            "subarrays": [merged],
            "currentNode": None
        })
        frame_counter += 1
        
        return merged

    sorted_array = merge_sort_helper(list(array), 0)
    
    # Final frame
    timeline.append({
        "frame": frame_counter,
        "action": f"Sorting complete. Sorted array: {sorted_array}",
        "array": sorted_array,
        "subarrays": [],
        "currentNode": None
    })

    statistics = {
        "comparisons": comparisons,
        "mergeOperations": merge_ops,
        "originalSize": len(array),
        "timeComplexity": "O(N log N)",
        "spaceComplexity": "O(N)"
    }
    
    learning = {
        "pseudoCode": [
            "MergeSort(A, p, r):",
            "  if p < r:",
            "    q = (p + r) / 2",
            "    MergeSort(A, p, q)",
            "    MergeSort(A, q + 1, r)",
            "    Merge(A, p, q, r)",
            "",
            "Merge(A, p, q, r):",
            "  n1 = q - p + 1, n2 = r - q",
            "  create arrays L[1..n1+1] and R[1..n2+1]",
            "  copy A[p..q] to L and A[q+1..r] to R",
            "  L[n1+1] = infinity, R[n2+1] = infinity",
            "  i = 1, j = 1",
            "  for k = p to r:",
            "    if L[i] <= R[j]: A[k] = L[i], i = i + 1",
            "    else: A[k] = R[j], j = j + 1"
        ],
        "explanation": "Merge Sort is a classic Divide-and-Conquer sorting algorithm. It recursively splits an array in half until it reaches single-element subarrays, then merges these sub-lists back in sorted order. Its O(N log N) runtime complexity is highly stable and does not degrade.",
        "advantages": "Stable sorting algorithm with guaranteed O(N log N) execution in all worst/average cases.",
        "disadvantages": "Requires extra O(N) temporary space to execute array merges.",
        "applications": "External sorting of massive databases, sorting linked lists, inversion counting."
    }

    return {
        "success": True,
        "timeline": timeline,
        "statistics": statistics,
        "learning": learning,
        "result": {
            "sortedArray": sorted_array
        }
    }
