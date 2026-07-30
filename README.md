# NETSHIELD - Network Attack Simulation & Response Planner

NETSHIELD is a complete, production-quality educational web application designed for B.Tech Computer Science curricula under the Design and Analysis of Algorithms (DAA) syllabus. It models network topologies as graphs and visualizes algorithms for traversal, routing, and optimization.

---

## 🌟 Key Features

1. **CAD-Style Network Builder (Phase 2)**:
   - Drag-and-drop node library (13 device types including routers, switches, PCs, and firewalls).
   - Weighted links with custom latency and bandwidth controls.
   - NetworkX-powered visual validation engine detecting bridges, isolated devices, and security policy breaches.

2. **Attack Propagation Simulator (Phase 3)**:
   - **BFS (Worm)**: Visually simulates level-by-level ring virus spreading.
   - **DFS (Network Scanner)**: Visually simulates deep-drilling sequential IP probes.
   - **Multi-Source BFS**: Simulates multi-point coordinated botnet infections.

3. **Network Recovery Planners (Phase 4)**:
   - **Shortest Recovery Path**: Dijkstra's algorithm.
   - **Optimal MST Cabling**: Prim's and Kruskal's algorithms.
   - **All-Pairs Distances**: Floyd-Warshall DP.
   - **Partition Solver**: Connected Components.
   - **Kahn's Scheduling**: Topological Sort.
   - **Greedy Priority packing**: Fractional Knapsack.
   - **Optimal Decision Branching**: Branch & Bound 0/1 Knapsack.
   - **Tour Maintenance**: Traveling Salesman Problem (TSP).

4. **Educational Laboratory Workspace (Phase 5)**:
   - Interactive tracing for Merge Sort, Quick Sort, Matrix Chain DP, Strassen multiplication, and N-Queens backtracking chessboards.

5. **Performance Comparison Dashboard (Phase 6)**:
   - Side-by-side Recharts charts comparing visited nodes and edge traversals.

6. **Real-time Telemetry Dashboard (Phase 7)**:
   - Microsecond precision timer and `tracemalloc` peak memory profiling.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Python 3.11+

### Docker Startup (Containerized)
If you have Docker and Docker Compose installed, you can spin up the entire stack with a single command:
```bash
docker compose up --build
```
- **Frontend Console**: [http://localhost:5173/](http://localhost:5173/)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Local Concurrent Startup
To launch the FastAPI backend and Vite frontend concurrently on your local machine:
```bash
npm install
npm run dev
```

### Manual Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

### Manual Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Running Tests

Validate all 23 integration and unit tests:
```bash
# Run backend pytest suite
npm run test:backend
```
Expected output:
```text
======================== 23 passed, 1 warning in 0.67s ========================
```
