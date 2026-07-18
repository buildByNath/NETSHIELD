from typing import Dict, List, Any

"""
File: strassen.py
Author: Antigravity AI
Purpose: Strassen's Matrix Multiplication divide-and-conquer educational visualization.
"""

def run_strassen(options: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Run Strassen's Matrix Multiplication 2x2 simulation.
    
    Args:
        options: Dict containing matrices 'A' (List[List[int]]) and 'B' (List[List[int]]).
        
    Returns:
        dict: Standard algorithm execution result.
    """
    A = (options or {}).get("A", [[1, 2], [3, 4]])
    B = (options or {}).get("B", [[5, 6], [7, 8]])
    
    # Validation checks
    if len(A) != 2 or len(A[0]) != 2 or len(B) != 2 or len(B[0]) != 2:
        return {"success": False, "timeline": [], "statistics": {}, "learning": {}, "result": {"error": "Strassen simulator only supports 2x2 matrices."}}

    timeline = []
    frame_counter = 1

    a, b = A[0][0], A[0][1]
    c, d = A[1][0], A[1][1]
    
    e, f = B[0][0], B[0][1]
    g, h = B[1][0], B[1][1]

    # Frame 1: Input Matrices
    timeline.append({
        "frame": frame_counter,
        "action": f"Initialize Strassen multiplication. Matrix A = {A}, Matrix B = {B}",
        "matrixA": A,
        "matrixB": B,
        "products": {}
    })
    frame_counter += 1

    # Calculate M1 to M7
    m1 = (a + d) * (e + h)
    # Frame for M1
    timeline.append({
        "frame": frame_counter,
        "action": f"Compute M1 = (a+d)*(e+h) = ({a}+{d})*({e}+{h}) = {m1}",
        "matrixA": A,
        "matrixB": B,
        "products": {"M1": m1}
    })
    frame_counter += 1

    m2 = (c + d) * e
    timeline.append({
        "frame": frame_counter,
        "action": f"Compute M2 = (c+d)*e = ({c}+{d})*{e} = {m2}",
        "matrixA": A,
        "matrixB": B,
        "products": {"M1": m1, "M2": m2}
    })
    frame_counter += 1

    m3 = a * (f - h)
    timeline.append({
        "frame": frame_counter,
        "action": f"Compute M3 = a*(f-h) = {a}*({f}-{h}) = {m3}",
        "matrixA": A,
        "matrixB": B,
        "products": {"M1": m1, "M2": m2, "M3": m3}
    })
    frame_counter += 1

    m4 = d * (g - e)
    timeline.append({
        "frame": frame_counter,
        "action": f"Compute M4 = d*(g-e) = {d}*({g}-{e}) = {m4}",
        "matrixA": A,
        "matrixB": B,
        "products": {"M1": m1, "M2": m2, "M3": m3, "M4": m4}
    })
    frame_counter += 1

    m5 = (a + b) * h
    timeline.append({
        "frame": frame_counter,
        "action": f"Compute M5 = (a+b)*h = ({a}+{b})*{h} = {m5}",
        "matrixA": A,
        "matrixB": B,
        "products": {"M1": m1, "M2": m2, "M3": m3, "M4": m4, "M5": m5}
    })
    frame_counter += 1

    m6 = (c - a) * (e + f)
    timeline.append({
        "frame": frame_counter,
        "action": f"Compute M6 = (c-a)*(e+f) = ({c}-{a})*({e}+{f}) = {m6}",
        "matrixA": A,
        "matrixB": B,
        "products": {"M1": m1, "M2": m2, "M3": m3, "M4": m4, "M5": m5, "M6": m6}
    })
    frame_counter += 1

    m7 = (b - d) * (g + h)
    timeline.append({
        "frame": frame_counter,
        "action": f"Compute M7 = (b-d)*(g+h) = ({b}-{d})*({g}+{h}) = {m7}",
        "matrixA": A,
        "matrixB": B,
        "products": {"M1": m1, "M2": m2, "M3": m3, "M4": m4, "M5": m5, "M6": m6, "M7": m7}
    })
    frame_counter += 1

    # Combine M sub-products into final C matrix cells
    c11 = m1 + m4 - m5 + m7
    c12 = m3 + m5
    c21 = m2 + m4
    c22 = m1 - m2 + m3 + m6
    
    C = [[c11, c12], [c21, c22]]

    # Frame: Final combinations
    timeline.append({
        "frame": frame_counter,
        "action": f"Combine products into C matrix: C11={c11}, C12={c12}, C21={c21}, C22={c22}",
        "matrixA": A,
        "matrixB": B,
        "matrixC": C,
        "products": {"M1": m1, "M2": m2, "M3": m3, "M4": m4, "M5": m5, "M6": m6, "M7": m7}
    })

    statistics = {
        "recursiveSubproblems": 7,
        "standardMultiplications": 8,
        "savedMultiplications": 1,
        "timeComplexity": "O(N^2.81)",
        "spaceComplexity": "O(N²)"
    }
    
    learning = {
        "pseudoCode": [
            "Strassen(A, B):",
            "  Divide matrices A and B into 4 submatrices A11..A22 and B11..B22",
            "  Calculate 7 recursive products:",
            "    M1 = (A11 + A22) * (B11 + B22)",
            "    M2 = (A21 + A22) * B11",
            "    M3 = A11 * (B12 - B22)",
            "    M4 = A22 * (B21 - B11)",
            "    M5 = (A11 + A12) * B22",
            "    M6 = (A21 - A11) * (B11 + B12)",
            "    M7 = (A12 - A22) * (B21 + B22)",
            "  Combine products to compute final submatrices:",
            "    C11 = M1 + M4 - M5 + M7",
            "    C12 = M3 + M5",
            "    C21 = M2 + M4",
            "    C22 = M1 - M2 + M3 + M6",
            "  Combine C11..C22 into matrix C and return"
        ],
        "explanation": "Strassen's algorithm is a divide-and-conquer strategy that computes matrix products. Standard matrix multiplication requires 8 recursive sub-multiplications. Strassen mathematically reduces this count to 7 multiplications using algebraic sub-products, bringing complexity down from cubic O(N³) to O(N^2.81).",
        "advantages": "Asymptotically faster than standard cubic matrix multiplication for large matrices.",
        "disadvantages": "High constant overhead for small matrices and less numerical precision due to many additions/subtractions.",
        "applications": "Large-scale linear algebra systems, machine learning weight updates, graphics shaders."
    }

    return {
        "success": True,
        "timeline": timeline,
        "statistics": statistics,
        "learning": learning,
        "result": {
            "matrixC": C
        }
    }
