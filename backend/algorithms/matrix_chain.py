from typing import Dict, List, Any

"""
File: matrix_chain.py
Author: Antigravity AI
Purpose: Matrix Chain Multiplication dynamic programming solver.
"""

def run_matrix_chain(options: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Run Matrix Chain Multiplication DP simulation.
    
    Args:
        options: Dict containing 'dimensions' (List[int]).
        
    Returns:
        dict: Standard algorithm execution result.
    """
    dims = (options or {}).get("dimensions", [10, 20, 30, 40, 30])
    
    if not isinstance(dims, list) or len(dims) < 2:
        return {"success": False, "timeline": [], "statistics": {}, "learning": {}, "result": {"error": "Invalid matrix dimensions list."}}

    N = len(dims) - 1 # Number of matrices

    # DP tables: m[i][j] stores minimum cost, s[i][j] stores optimal split index
    m = [[0] * N for _ in range(N)]
    s = [[0] * N for _ in range(N)]

    timeline = []
    frame_counter = 1

    def serialize_table(table_2d):
        return {
            f"M{i+1}": {f"M{j+1}": table_2d[i][j] for j in range(N)}
            for i in range(N)
        }

    # Frame 1: Initialization
    timeline.append({
        "frame": frame_counter,
        "action": f"Matrix Chain initialized with dimensions: {dims}. Formed tables.",
        "costMatrix": serialize_table(m),
        "splitMatrix": serialize_table(s),
        "currentSplit": None
    })
    frame_counter += 1

    # Fill DP table chain-length by chain-length (l is chain length)
    for l in range(2, N + 1):
        for i in range(N - l + 1):
            j = i + l - 1
            m[i][j] = float("inf")
            
            for k in range(i, j):
                # cost = cost of left subchain + cost of right subchain + multiplication cost
                q = m[i][k] + m[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1]
                
                if q < m[i][j]:
                    m[i][j] = q
                    s[i][j] = k + 1
                    
                    # Frame: Update DP table cell
                    timeline.append({
                        "frame": frame_counter,
                        "action": f"Evaluating split of M{i+1}..M{j+1} at k={k+1}. Cost = {q}",
                        "costMatrix": serialize_table(m),
                        "splitMatrix": serialize_table(s),
                        "currentSplit": [i+1, k+1, j+1]
                    })
                    frame_counter += 1

    # Reconstruct parenthesization
    def get_parenthesis(split_arr, i, j):
        if i == j:
            return f"M{i+1}"
        else:
            k = split_arr[i][j] - 1
            return f"({get_parenthesis(split_arr, i, k)} x {get_parenthesis(split_arr, k + 1, j)})"

    optimal_order = get_parenthesis(s, 0, N - 1)
    min_cost = m[0][N - 1]

    # Calculate worst-case multiplications without optimization (multiplying left-to-right)
    brute_cost = 0
    temp_rows = dims[0]
    for i in range(1, len(dims) - 1):
        brute_cost += temp_rows * dims[i] * dims[i + 1]

    saved_ops = max(0, brute_cost - min_cost)

    # Final frame
    timeline.append({
        "frame": frame_counter,
        "action": f"Optimization complete. Minimum scalar multiplications: {min_cost}. Order: {optimal_order}",
        "costMatrix": serialize_table(m),
        "splitMatrix": serialize_table(s),
        "currentSplit": None
    })

    statistics = {
        "minMultiplications": min_cost,
        "savedOperations": saved_ops,
        "numMatrices": N,
        "timeComplexity": "O(N³)",
        "spaceComplexity": "O(N²)"
    }
    
    learning = {
        "pseudoCode": [
            "MatrixChainOrder(p):",
            "  n = p.length - 1",
            "  let m[1..n, 1..n] and s[1..n, 1..n] be new tables",
            "  for i = 1 to n: m[i, i] = 0",
            "  for l = 2 to n:           // l is chain length",
            "    for i = 1 to n - l + 1:",
            "      j = i + l - 1",
            "      m[i, j] = infinity",
            "      for k = i to j - 1:",
            "        q = m[i, k] + m[k+1, j] + p[i-1]*p[k]*p[j]",
            "        if q < m[i, j]: m[i, j] = q, s[i, j] = k"
        ],
        "explanation": "Matrix Chain Multiplication finds the most efficient way to multiply a chain of matrices. Since matrix multiplication is associative, different parenthesizations can yield wildly different numbers of scalar multiplications. It uses diagonal dynamic programming to find the optimal split indices.",
        "advantages": "Computes the absolute optimal multiplication sequence in cubic time, saving millions of calculations on large arrays.",
        "disadvantages": "High cubic time O(N³) complexity which scales slowly for very long chains of matrices.",
        "applications": "Query optimization in databases, computer graphics rendering pipelines, scientific computing libraries."
    }

    return {
        "success": True,
        "timeline": timeline,
        "statistics": statistics,
        "learning": learning,
        "result": {
            "optimalOrder": optimal_order,
            "minCost": min_cost
        }
    }
