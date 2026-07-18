from typing import Dict, List, Any

"""
File: nqueen.py
Author: Antigravity AI
Purpose: N-Queens backtracking solver and educational visualization.
"""

def is_safe(board: List[int], row: int, col: int) -> bool:
    """Helper to check if placing a queen at (row, col) is safe."""
    for i in range(row):
        # Check column conflict and diagonal conflicts
        if board[i] == col or \
           board[i] - i == col - row or \
           board[i] + i == col + row:
            return False
    return True

def run_nqueens(options: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Run N-Queens backtracking solver.
    
    Args:
        options: Dict containing 'N' (int).
        
    Returns:
        dict: Standard algorithm execution result.
    """
    N = int((options or {}).get("N", 4))
    
    if N < 1 or N > 8:
        return {"success": False, "timeline": [], "statistics": {}, "learning": {}, "result": {"error": "N must be between 1 and 8."}}

    timeline = []
    frame_counter = 1
    
    board = [-1] * N # board[r] stores column index for queen in row r
    solutions = []
    backtracks = 0

    def serialize_board(b_arr):
        # Convert 1D board positions array to a 2D matrix of 0s and 1s
        grid = [[0] * N for _ in range(N)]
        for r in range(N):
            c = b_arr[r]
            if c != -1:
                grid[r][c] = 1
        return grid

    # Frame 1: Initial state
    timeline.append({
        "frame": frame_counter,
        "action": f"Initialize N-Queens on {N}x{N} chessboard.",
        "board": serialize_board(board),
        "currentRow": 0,
        "currentCol": -1,
        "conflict": False
    })
    frame_counter += 1

    def solve(row: int):
        nonlocal frame_counter, backtracks
        
        if row == N:
            solutions.append(list(board))
            # Frame: Solution found
            timeline.append({
                "frame": frame_counter,
                "action": f"Solution found! Placed all {N} queens safely.",
                "board": serialize_board(board),
                "currentRow": row,
                "currentCol": -1,
                "conflict": False
            })
            frame_counter += 1
            return

        for col in range(N):
            board[row] = col
            
            # Frame: Attempt placement
            if frame_counter < 45:
                timeline.append({
                    "frame": frame_counter,
                    "action": f"Row {row}: Attempting placement at column {col}",
                    "board": serialize_board(board),
                    "currentRow": row,
                    "currentCol": col,
                    "conflict": False
                })
                frame_counter += 1
                
            if is_safe(board, row, col):
                # Safe path: recurse to next row
                solve(row + 1)
            else:
                # Conflict detected!
                backtracks += 1
                
                # Frame: Show conflict
                if frame_counter < 45:
                    timeline.append({
                        "frame": frame_counter,
                        "action": f"Row {row}, Column {col} has conflict! Backtracking...",
                        "board": serialize_board(board),
                        "currentRow": row,
                        "currentCol": col,
                        "conflict": True
                    })
                    frame_counter += 1
                    
            board[row] = -1 # backtrack reset

    solve(0)

    # Final frame
    timeline.append({
        "frame": frame_counter,
        "action": f"Backtracking complete. Found {len(solutions)} total solutions.",
        "board": serialize_board(board),
        "currentRow": -1,
        "currentCol": -1,
        "conflict": False
    })

    statistics = {
        "backtracks": backtracks,
        "solutionsFound": len(solutions),
        "boardSize": N,
        "timeComplexity": "O(N!)",
        "spaceComplexity": "O(N)"
    }
    
    learning = {
        "pseudoCode": [
            "SolveNQueens(board, row):",
            "  if row == N:",
            "    add board copy to Solutions",
            "    return",
            "  for col = 0 to N - 1:",
            "    if is_safe(board, row, col):",
            "      board[row] = col",
            "      SolveNQueens(board, row + 1)",
            "      board[row] = -1  // Backtrack"
        ],
        "explanation": "N-Queens places N non-attacking queens on an N x N chessboard. It places queens row-by-row, testing column and diagonal safety. If no conflict-free placement remains in a row, it backtracks, restoring the previous queen's position to explore alternative cells.",
        "advantages": "Backtracking avoids checking all N^N combinations by pruning search branches as soon as a conflict is found.",
        "disadvantages": "Exponential worst-case runtime complexity which triggers performance drops for board sizes N > 12.",
        "applications": "Combinatorial optimization, circuit board path routing, constraint satisfaction problems (CSPs)."
    }

    return {
        "success": True,
        "timeline": timeline,
        "statistics": statistics,
        "learning": learning,
        "result": {
            "solutions": [serialize_board(s) for s in solutions],
            "count": len(solutions)
        }
    }
