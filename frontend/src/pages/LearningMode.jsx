import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  BookOpen, Play, Pause, RotateCcw, ChevronRight, ChevronLeft, 
  HelpCircle, Code2, Cpu, Award, Zap, Sliders, ChevronDown
} from 'lucide-react';
import { algorithmService } from '../services/api';
import CustomNode from '../components/network/CustomNode';
import CustomEdge from '../components/network/CustomEdge';
import { useSimulation } from '../context/SimulationContext';
import { 
  QueueVisualizer, StackVisualizer, PriorityQueueVisualizer, DistanceTable, 
  TraversalJourney, ArrayVisualizer, MatrixVisualizer, UnionFindVisualizer, 
  MSTVisualizer, KnapsackVisualizer, ChessboardVisualizer
} from '../components/learning/Visualizers';

const nodeTypes = {
  Internet: CustomNode,
  Firewall: CustomNode,
  Router: CustomNode,
  'Core Switch': CustomNode,
  'Access Switch': CustomNode,
  PC: CustomNode,
  Laptop: CustomNode,
  Printer: CustomNode,
  'Application Server': CustomNode,
  'Database Server': CustomNode,
  'Backup Server': CustomNode,
  'Wireless Access Point': CustomNode,
  Cloud: CustomNode
};

const edgeTypes = {
  customEdge: CustomEdge
};

/**
 * File: LearningMode.jsx
 * Author: Antigravity AI
 * Purpose: Interactive textbook and laboratory visualizer for all 17 DAA algorithms.
 */

// Categorized directory of all 17 algorithms
const ALGORITHMS = [
  // Graph Traversals
  { id: 'bfs', name: 'Worm Propagation (BFS)', category: 'Graph Traversal', complexity: { time: 'O(V + E)', space: 'O(V)' }, isGraph: true,
    desc: 'Breadth-First Search (BFS) spreads level-by-level using a FIFO Queue. It models a worm replicating concurrently to adjacent devices.' },
  { id: 'dfs', name: 'Network Scanner (DFS)', category: 'Graph Traversal', complexity: { time: 'O(V + E)', space: 'O(V)' }, isGraph: true,
    desc: 'Depth-First Search (DFS) drills down a path as deep as possible using a LIFO Stack before backtracking. It models a subnet port scanner.' },
  // Path Planners
  { id: 'dijkstra', name: 'Dijkstra Shortest Path', category: 'Path Planning', complexity: { time: 'O((V+E) log V)', space: 'O(V)' }, isGraph: true,
    desc: "NETSHIELD uses a designated clean server as the source vertex and the selected infected device as the destination. Dijkstra's algorithm calculates the minimum-cost path between them, visualized as the blue recovery route on the network." },
  { id: 'prim', name: "Prim's Algorithm MST", category: 'Spanning Trees', complexity: { time: 'O(E log V)', space: 'O(V)' }, isGraph: true,
    desc: "Grows a Minimum Spanning Tree (MST) node-by-node, adding the cheapest adjacent connection linking to unvisited vertices." },
  { id: 'kruskal', name: "Kruskal's Algorithm MST", category: 'Spanning Trees', complexity: { time: 'O(E log E)', space: 'O(V)' }, isGraph: true,
    desc: "Constructs an MST by sorting all edges by weight and unioning components while preventing cycles using a Union-Find structure." },
  { id: 'floyd', name: 'Floyd-Warshall All-Pairs', category: 'Path Planning', complexity: { time: 'O(V³)', space: 'O(V²)' }, isGraph: true,
    desc: "Computes the shortest path between all pairs of vertices in a graph using dynamic programming intermediate-relaxation loops." },
  // Data Structures
  { id: 'connected_components', name: 'Connected Components', category: 'Data Structures', complexity: { time: 'O(V + E)', space: 'O(V)' }, isGraph: true,
    desc: "Groups disjoint subnetworks and isolated network islands using successive DFS traversals." },
  { id: 'union_find', name: 'Union-Find Operations', category: 'Data Structures', complexity: { time: 'O(α(V)) Amortized', space: 'O(V)' }, isGraph: true,
    desc: "Tracks disjoint set elements. Traces representatives, unions, finds, and algebraic path compressions." },
  { id: 'topological_sort', name: 'Topological Sort', category: 'Data Structures', complexity: { time: 'O(V + E)', space: 'O(V)' }, isGraph: true,
    desc: "Schedules directed dependencies linearly using Kahn's in-degree queue algorithm. Operates strictly on DAGs." },
  // Greedy / Optimization
  { id: 'knapsack', name: 'Fractional Knapsack', category: 'Greedy & DP', complexity: { time: 'O(N log N)', space: 'O(N)' }, isGraph: true,
    desc: "Greedily packs items (nodes) sorted by density (value-to-cost ratio), taking fractional slices when capacity bounds are breached." },
  { id: 'branch_bound', name: 'Branch and Bound', category: 'Greedy & DP', complexity: { time: 'O(2^N) Worst', space: 'O(2^N)' }, isGraph: true,
    desc: "Solves 0/1 binary decision Knapsack by building a state search tree, calculating fractional upper bounds, and pruning paths." },
  { id: 'tsp', name: 'Traveling Salesman Tour', category: 'Greedy & DP', complexity: { time: 'O(N!)', space: 'O(N)' }, isGraph: true,
    desc: "Finds the shortest inspection route visiting a list of devices once and returning to start using backtracking search." },
  // Restored sorting & chess algorithms
  { id: 'merge_sort', name: 'Merge Sort (Packet Size)', category: 'Sorting', complexity: { time: 'O(N log N)', space: 'O(N)' }, isGraph: false,
    desc: "Divide-and-conquer packet sorting. Recursively splits packets array in halves, sorts sub-arrays, and merges them.",
    pseudo: [
      "MergeSort(A, p, r):",
      "  if p < r:",
      "    q = (p + r) / 2",
      "    MergeSort(A, p, q)",
      "    MergeSort(A, q + 1, r)",
      "    Merge(A, p, q, r)"
    ] },
  { id: 'quick_sort', name: 'Quick Sort (Response Time)', category: 'Sorting', complexity: { time: 'O(N log N)', space: 'O(log N)' }, isGraph: false,
    desc: "Sorts packet delays using randomized pivoting. Recursively partitions elements around a pivot value.",
    pseudo: [
      "QuickSort(A, p, r):",
      "  if p < r:",
      "    q = Partition(A, p, r)",
      "    QuickSort(A, p, q - 1)",
      "    QuickSort(A, q + 1, r)"
    ] },
  { id: 'matrix_chain', name: 'Matrix Chain Order (DP)', category: 'Greedy & DP', complexity: { time: 'O(N³)', space: 'O(N²)' }, isGraph: false,
    desc: "Dynamic programming solution determining the most efficient matrix configuration order.",
    pseudo: [
      "MatrixChainOrder(p):",
      "  n = p.length - 1",
      "  for l = 2 to n:",
      "    for i = 1 to n - l + 1:",
      "      j = i + l - 1",
      "      m[i,j] = infinity",
      "      for k = i to j - 1:",
      "        q = m[i,k] + m[k+1,j] + p[i-1]*p[k]*p[j]",
      "        if q < m[i,j]: m[i,j] = q, s[i,j] = k"
    ] },
  { id: 'strassen', name: 'Strassen Multiplication', category: 'Divide & Conquer', complexity: { time: 'O(N^2.81)', space: 'O(N²)' }, isGraph: false,
    desc: "Divide-and-conquer matrix multiplication. Reduces standard sub-multiplications from 8 to 7 using algebraic sub-products.",
    pseudo: [
      "Strassen(A, B):",
      "  M1 = (A11 + A22) * (B11 + B22)",
      "  M2 = (A21 + A22) * B11",
      "  M3 = A11 * (B12 - B22)",
      "  C11 = M1 + M4 - M5 + M7",
      "  C12 = M3 + M5",
      "  C21 = M2 + M4",
      "  C22 = M1 - M2 + M3 + M6"
    ] },
  { id: 'nqueens', name: 'Firewall Placement (N-Queens)', category: 'Backtracking', complexity: { time: 'O(N!)', space: 'O(N)' }, isGraph: false,
    desc: "Backtracking puzzle placing security firewall devices on a grid so they do not interfere with each other.",
    pseudo: [
      "SolveNQueens(board, row):",
      "  if row == N: add solution; return",
      "  for col = 0 to N - 1:",
      "    if is_safe(board, row, col):",
      "      board[row] = col",
      "      SolveNQueens(board, row + 1)",
      "      board[row] = -1 // Backtrack"
    ] }
];

// Speed playback level selections
const SPEED_LEVELS = [
  { label: '0.5x', value: 0.5 },
  { label: '1.0x', value: 1.0 },
  { label: '1.5x', value: 1.5 },
  { label: '2.0x', value: 2.0 }
];

// ── Backend Data Flow step-by-step narration per algorithm ───────────────────
const BACKEND_FLOW_NARRATIONS = {
  bfs: [
    '📡 STEP 1 — INFECTION INJECTION: The worm payload is encoded into a malformed TCP packet and injected into the initial device (PC-1). The OS memory is corrupted through a buffer overflow, compromising the device.',
    '📦 STEP 2 — QUEUE INITIALIZATION: The infected device ID is placed at the rear of the FIFO (First-In-First-Out) Queue data structure. Memory address of the queue head pointer is set to this first entry.',
    '🔍 STEP 3 — NEIGHBOR DISCOVERY: BFS dequeues the front node. The NIC (Network Interface Card) scans the ARP table to list all directly connected neighbor MAC addresses via the switch CAM table.',
    '📤 STEP 4 — PACKET BROADCAST: For each unvisited neighbor, the worm crafts a copy of itself and sends it over the switch fabric. The Ethernet frame is forwarded to the target MAC through the access switch.',
    '🔴 STEP 5 — COMPROMISE: The target device receives the packet. The OS scheduler runs the malicious code, overwrites kernel memory, and the device status changes to INFECTED. It is now added to the queue.',
    '✅ STEP 6 — VISITED SET UPDATE: The source node is removed from the queue and added to the Visited hash set. This prevents re-infection loops in the network graph.',
    '🔁 STEP 7 — PROPAGATION REPEAT: BFS continues dequeuing, broadcasting to unvisited neighbors, and marking visited until the queue is empty — every reachable device is compromised.',
  ],
  dfs: [
    '🎯 STEP 1 — INITIAL PROBE: The network scanner pushes the starting device onto the LIFO (Last-In-First-Out) Stack. A SYN packet is sent to test if the host is online.',
    '📚 STEP 2 — STACK PUSH: DFS selects one unvisited neighbor and pushes it to the top of the stack. The scanner dives deep into this single network branch before exploring others.',
    '🔬 STEP 3 — DEEP TRAVERSAL: The scanner follows one path as far as possible — traversing PC → Switch → Router → next subnet. Each hop pushes the next node onto the stack.',
    '⚠️ STEP 4 — DEAD END DETECTION: When no unvisited neighbors exist at the current node, DFS backtracks. The current node is popped from the stack and the previous node resumes exploration.',
    '🔙 STEP 5 — BACKTRACK SIGNAL: The stack pop operation retrieves the previous device. Network flow returns to the parent node via the same Layer 2 path it arrived on.',
    '🗂️ STEP 6 — VISITED MARKING: Each explored node is marked in the Visited set (a hash map of device IDs). This prevents infinite loops in cyclic network topologies.',
    '🏁 STEP 7 — COMPLETION: DFS finishes when the stack is empty. Every device reachable from the start node has been discovered and analyzed.',
  ],
  dijkstra: [
    '🛡️ STEP 1 — SOURCE INITIALIZATION: The recovery server (SRV-1) is set as the source vertex. Distance[SRV-1] = 0; all other nodes set to ∞. A Min-Priority Queue is initialized with (0, SRV-1).',
    '📊 STEP 2 — PRIORITY QUEUE EXTRACTION: The node with minimum distance estimate is extracted from the Min-Heap. This is always the cheapest unvisited recovery path candidate.',
    '📡 STEP 3 — EDGE RELAXATION: For each neighbor of the extracted node, check: dist[u] + weight(u,v) < dist[v]. If TRUE, update dist[v] and insert (new_dist, v) into the priority queue.',
    '🔗 STEP 4 — NETWORK DATA FLOW: Recovery packets travel from the server through routers and switches. Each hop has a cost (latency + weight). Dijkstra finds the minimum total cost path.',
    '🔵 STEP 5 — PATH RECONSTRUCTION: Once the target device is reached, trace back through the previous[] array to reconstruct the recovery route: SRV-1 → R-1 → SW-1 → PC-target.',
    '💊 STEP 6 — RECOVERY SIGNAL: The recovery server sends a healing packet along the shortest path. Each intermediate device forwards it until the infected node receives the antivirus payload.',
    '✅ STEP 7 — NODE RECOVERY COMPLETE: The infected device processes the recovery packet, clears malicious processes, and its status changes from INFECTED → RECOVERED (shown in blue).',
  ],
  prim: [
    '🌱 STEP 1 — MST INIT: Prim starts at the server node. The minimum spanning tree (MST) set is initialized as empty. All edge weights to unvisited nodes are set to ∞.',
    '📡 STEP 2 — CHEAPEST EDGE SELECTION: Prim scans all edges crossing from the visited MST set to unvisited nodes. The edge with minimum weight is selected — this represents the cheapest cable/link to add.',
    '🔗 STEP 3 — SAFE EDGE ADDITION: The selected edge and its target node are added to the MST. This grows the spanning tree while always picking the minimum cost connection.',
    '📊 STEP 4 — KEY UPDATE: After adding a node, update all adjacent unvisited nodes: if edge weight < current key, update the key value. This tracks the cheapest way to reach each node.',
    '🏗️ STEP 5 — BACKBONE CONSTRUCTION: Prim builds the optimal network backbone — the minimum cost infrastructure to connect all devices without redundant cycles.',
    '✅ STEP 6 — MST COMPLETE: When all V nodes are included, the MST is complete. Total cost = sum of all selected edge weights. This is the minimum infrastructure cost for the office network.',
  ],
  kruskal: [
    '📋 STEP 1 — EDGE SORTING: All network edges are sorted by weight in ascending order. Edges represent network links (cables/WiFi). Lower weight = lower latency/cost.',
    '🔗 STEP 2 — UNION-FIND INIT: Each device starts as its own disjoint set. The Union-Find (DSU) data structure tracks which devices are already connected in the same component.',
    '✂️ STEP 3 — EDGE SELECTION: The cheapest remaining edge (u, v) is picked. Find(u) and Find(v) are called to check their set representatives.',
    '🔍 STEP 4 — CYCLE CHECK: If Find(u) == Find(v), adding this edge would create a cycle — SKIP IT. Cycles waste bandwidth and cause broadcast storms in real networks.',
    '✅ STEP 5 — UNION MERGE: If Find(u) ≠ Find(v), the edge is safe. Union(u, v) merges the two sets. The edge is added to the MST and physically represents a new network cable.',
    '🏁 STEP 6 — MST COMPLETION: Continue until V-1 edges are selected. The MST represents the minimum cost wiring plan to connect all office devices — ready for recovery traffic routing.',
  ],
  floyd: [
    '📊 STEP 1 — DISTANCE MATRIX INIT: A V×V matrix is initialized. dist[i][j] = direct edge weight if connected, else ∞. dist[i][i] = 0 for all diagonal entries.',
    '🔁 STEP 2 — INTERMEDIATE NODE LOOP: Floyd iterates through every possible intermediate node k from 0 to V-1. This considers every device as a potential relay hop.',
    '📐 STEP 3 — RELAXATION CHECK: For each pair (i,j): if dist[i][k] + dist[k][j] < dist[i][j] → update dist[i][j]. This checks if routing through device k is cheaper.',
    '📡 STEP 4 — MULTI-HOP ROUTING: This models real network routing — data may travel PC→Switch→Router→Switch→PC. Floyd finds the optimal multi-hop path for every source-destination pair.',
    '🗺️ STEP 5 — ALL-PAIRS RESULT: After V³ iterations, the matrix contains the shortest path between every pair of devices. This is used for network-wide traffic optimization.',
    '🔵 STEP 6 — RECOVERY APPLICATION: The computed shortest paths are used to route recovery signals from any healthy device to any infected device in the network.',
  ],
  default: [
    '⚙️ STEP 1 — Algorithm initializes data structures and sets initial state.',
    '🔍 STEP 2 — Explores nodes/edges according to the algorithm strategy.',
    '📊 STEP 3 — Updates internal state (queue/stack/table) based on each step.',
    '✅ STEP 4 — Marks processed elements and continues until termination condition.',
    '🏁 STEP 5 — Algorithm terminates when all reachable elements are processed.',
  ],
};

export default function LearningMode() {
  const [activeAlgo, setActiveAlgo] = useState(ALGORITHMS.find(a => a.id === 'bfs'));
  const [rightPanelTab, setRightPanelTab] = useState('history'); // 'history' | 'why' | 'flow'
  
  // Simulation context hook
  const { 
    originalNodes, 
    originalEdges,
    startNodes,
    recoverySource,
    recoveryTarget
  } = useSimulation();

  // Local React Flow visualizer states
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Playback state
  const [timeline, setTimeline] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [learning, setLearning] = useState({});
  const [result, setResult] = useState(null); // Stores final algorithm result (e.g. Dijkstra path)
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const playbackInterval = useRef(null);

  // Effect to apply styling based on current playback timeline frame
  useEffect(() => {
    if (!activeAlgo.isGraph || originalNodes.length === 0) return;
    
    if (timeline.length === 0) {
      setNodes(originalNodes.map(n => ({
        ...n,
        data: { ...n.data, status: 'healthy' }
      })));
      setEdges(originalEdges.map(e => ({
        ...e,
        selected: false,
        data: { ...e.data, isSimulation: false, isRecovery: false }
      })));
      return;
    }

    const frame = timeline[currentFrame] || {};
    const visitedSet = new Set(frame.visited || []);
    const activeNode = frame.currentNode;
    const activeEdge = frame.currentEdge;    
    let startNodeId = '';
    if (activeAlgo.id === 'bfs' || activeAlgo.id === 'dfs') {
      startNodeId = startNodes.length > 0 ? startNodes[0] : (originalNodes[0]?.id || '');
    } else {
      startNodeId = recoverySource || (startNodes.length > 0 ? startNodes[0] : (originalNodes[0]?.id || ''));
    }
    const targetNodeId = recoveryTarget || '';
    const isAttack = activeAlgo.id === 'bfs' || activeAlgo.id === 'dfs';

    // On the final frame of Dijkstra, highlight the shortest path in blue
    const isFinalDijkstraFrame =
      activeAlgo.id === 'dijkstra' &&
      currentFrame === timeline.length - 1 &&
      result?.path?.length > 0;
    const shortestPathSet = isFinalDijkstraFrame ? new Set(result.path) : new Set();

    if (isAttack) {
      setNodes(originalNodes.map(n => {
        let status = 'healthy';
        if (visitedSet.has(n.id)) status = 'infected';
        if (activeNode === n.id) status = 'infected';
        
        const isStart = n.id === startNodeId;
        const isQueued = (
          (frame.queue && JSON.stringify(frame.queue).includes(n.id)) ||
          (frame.stack && JSON.stringify(frame.stack).includes(n.id))
        ) && n.id !== activeNode;

        let finalStatus = status;
        if (isQueued && status !== 'infected') {
          finalStatus = 'queued';
        } else if (status === 'healthy' && isStart) {
          finalStatus = 'protected';
        }

        return {
          ...n,
          selected: activeNode === n.id,
          data: {
            ...n.data,
            status: finalStatus
          }
        };
      }));

      setEdges(originalEdges.map(e => {
        const isActive = activeEdge && (
          (e.source === activeEdge[0] && e.target === activeEdge[1]) ||
          (e.source === activeEdge[1] && e.target === activeEdge[0])
        );
        return {
          ...e,
          selected: !!isActive,
          data: {
            ...e.data,
            isSimulation: !!isActive,
            isRecovery: false
          }
        };
      }));
    } else {
      // Recovery algorithm tracing
      setNodes(originalNodes.map(n => {
        let status = 'healthy';
        if (visitedSet.has(n.id)) status = 'recovered';
        if (activeNode === n.id) status = 'recovered';
        
        const isSrc = n.id === startNodeId;
        const isDst = n.id === targetNodeId;
        
        // On final Dijkstra frame, highlight path nodes distinctly
        if (isFinalDijkstraFrame && shortestPathSet.has(n.id)) {
          status = 'recovered'; // blue
        }

        const isQueued = (
          (frame.queue && JSON.stringify(frame.queue).includes(n.id)) ||
          (frame.stack && JSON.stringify(frame.stack).includes(n.id))
        ) && n.id !== activeNode;

        let finalStatus = status;
        if (isQueued && status !== 'recovered') {
          finalStatus = 'queued';
        } else if ((isSrc || isDst) && status !== 'recovered') {
          finalStatus = 'protected'; // gold highlight
        }
        
        return {
          ...n,
          selected: activeNode === n.id,
          data: {
            ...n.data,
            status: finalStatus
          }
        };
      }));

      setEdges(originalEdges.map(e => {
        const isActive = activeEdge && (
          (e.source === activeEdge[0] && e.target === activeEdge[1]) ||
          (e.source === activeEdge[1] && e.target === activeEdge[0])
        );
        // On final Dijkstra frame, colour path edges blue
        const isOnPath = isFinalDijkstraFrame && result.path && (() => {
          const path = result.path;
          for (let i = 0; i < path.length - 1; i++) {
            if ((e.source === path[i] && e.target === path[i + 1]) ||
                (e.source === path[i + 1] && e.target === path[i])) return true;
          }
          return false;
        })();
        return {
          ...e,
          selected: !!isActive || !!isOnPath,
          data: {
            ...e.data,
            isSimulation: false,
            isRecovery: !!isActive || !!isOnPath
          }
        };
      }));
    }
  }, [currentFrame, timeline, activeAlgo, originalNodes, originalEdges]);

  const handlePrevStep = () => {
    setIsPlaying(false);
    setCurrentFrame(prev => Math.max(0, prev - 1));
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    setCurrentFrame(prev => Math.min(timeline.length - 1, prev + 1));
  };

  // Trigger loading details of the chosen algorithm
  const fetchAlgorithmDetails = async () => {
    setLoading(true);
    setErrorMsg('');
    setIsPlaying(false);
    setCurrentFrame(0);
    setTimeline([]);
    setStatistics({});
    setLearning({});
    
    try {
      let response;
      if (activeAlgo.isGraph) {
        // Run graph algorithms on the current context graph topology
        const nodesToUse = originalNodes.length > 0 ? originalNodes : [];
        const edgesToUse = originalEdges.length > 0 ? originalEdges : [];
        
        if (nodesToUse.length === 0) {
          setErrorMsg('No active network topology loaded. Please open the Network Builder first.');
          setLoading(false);
          return;
        }

        let startNode = '';
        if (activeAlgo.id === 'bfs' || activeAlgo.id === 'dfs') {
          startNode = startNodes.length > 0 ? startNodes[0] : (nodesToUse[0]?.id || '');
        } else {
          startNode = recoverySource || (startNodes.length > 0 ? startNodes[0] : (nodesToUse[0]?.id || ''));
        }
        
        let targetNode = recoveryTarget;
        if (!targetNode) {
          const serverNodes = nodesToUse.filter(n => n.id.startsWith('SRV-'));
          if (serverNodes.length > 0) {
            targetNode = serverNodes[0].id;
          } else {
            targetNode = nodesToUse.find(n => n.id !== startNode)?.id || '';
          }
        }

        if (activeAlgo.id === 'bfs' || activeAlgo.id === 'dfs') {
          // Attack simulation request
          response = await algorithmService.simulateAttack(activeAlgo.id, nodesToUse, edgesToUse, [startNode]);
        } else {
          // Recovery request
          const options = {
            source: startNode,
            destination: targetNode,
            budget: 1000
          };
          response = await algorithmService.recoverNetwork(activeAlgo.id, nodesToUse, edgesToUse, options);
        }
      } else {
        // Run non-graph algorithms
        if (activeAlgo.id === 'merge_sort' || activeAlgo.id === 'quick_sort') {
          response = await algorithmService.simulateSort(activeAlgo.id, [8, 3, 7, 2, 5]);
        } else if (activeAlgo.id === 'matrix_chain') {
          response = await algorithmService.simulateDP([10, 20, 30, 40]);
        } else if (activeAlgo.id === 'strassen') {
          response = await algorithmService.simulateStrassen([[1, 0], [0, 1]], [[5, 6], [7, 8]]);
        } else if (activeAlgo.id === 'nqueens') {
          response = await algorithmService.simulateNQueens(4);
        }
      }
      if (response && response.success) {
        setTimeline(response.timeline || []);
        setStatistics(response.statistics || {});
        setLearning(response.learning || {});
        setResult(response.result || null);
      } else {
        setErrorMsg('Failed to run computation timeline.');
      }
    } catch (err) {
      console.error('Learning Mode fetch error', err);
      setErrorMsg(err.response?.data?.detail || 'API connection error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (originalNodes.length > 0) {
      fetchAlgorithmDetails();
    }
  }, [activeAlgo, originalNodes, startNodes, recoverySource, recoveryTarget]);

  // Handle Playback ticker
  useEffect(() => {
    if (playbackInterval.current) clearInterval(playbackInterval.current);

    if (isPlaying && timeline.length > 0) {
      const stepDuration = 600 / speed;
      playbackInterval.current = setInterval(() => {
        setCurrentFrame(prev => {
          if (prev >= timeline.length - 1) {
            clearInterval(playbackInterval.current);
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, stepDuration);
    }

    return () => {
      if (playbackInterval.current) clearInterval(playbackInterval.current);
    };
  }, [isPlaying, timeline, speed]);

  const handlePlayPause = () => {
    if (timeline.length === 0) return;
    if (currentFrame === timeline.length - 1) {
      setCurrentFrame(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentFrame(0);
  };

  const activeFrame = timeline[currentFrame] || { action: 'Simulator ready.' };

  const renderHistoryCardSnapshot = (frame, prevFrame) => {
    const qBefore = prevFrame.queue || [];
    const qAfter = frame.queue || [];
    const sBefore = prevFrame.stack || [];
    const sAfter = frame.stack || [];

    const formatShortList = (list) => {
      if (list.length === 0) return '[ Empty ]';
      const items = list.map(item => typeof item === 'string' ? item.split(' ')[0] : (item.node || item.id || ''));
      return `[${items.slice(0, 3).join(', ')}${items.length > 3 ? '...' : ''}]`;
    };

    if (activeAlgo.id === 'bfs') {
      return (
        <div className="grid grid-cols-2 gap-2 text-[8px] font-mono border-t border-[#4B5563]/10 pt-1.5 mt-1.5">
          <div>
            <span className="text-[#94A3B8] block mb-0.5">QUEUE BEFORE:</span>
            <span className="text-[#CBD5E1] block truncate">{formatShortList(qBefore)}</span>
          </div>
          <div>
            <span className="text-[#94A3B8] block mb-0.5">QUEUE AFTER:</span>
            <span className="text-[#FD802E] block truncate font-bold">{formatShortList(qAfter)}</span>
          </div>
        </div>
      );
    }

    if (activeAlgo.id === 'dfs') {
      return (
        <div className="grid grid-cols-2 gap-2 text-[8px] font-mono border-t border-[#4B5563]/10 pt-1.5 mt-1.5">
          <div>
            <span className="text-[#94A3B8] block mb-0.5">STACK BEFORE:</span>
            <span className="text-[#CBD5E1] block truncate">{formatShortList(sBefore)}</span>
          </div>
          <div>
            <span className="text-[#94A3B8] block mb-0.5">STACK AFTER:</span>
            <span className="text-[#FD802E] block truncate font-bold">{formatShortList(sAfter)}</span>
          </div>
        </div>
      );
    }

    if (activeAlgo.id === 'dijkstra' || activeAlgo.id === 'prim') {
      return (
        <div className="grid grid-cols-2 gap-2 text-[8px] font-mono border-t border-[#4B5563]/10 pt-1.5 mt-1.5">
          <div>
            <span className="text-[#94A3B8] block mb-0.5">PQ BEFORE:</span>
            <span className="text-[#CBD5E1] block truncate">{formatShortList(qBefore)}</span>
          </div>
          <div>
            <span className="text-[#94A3B8] block mb-0.5">PQ AFTER:</span>
            <span className="text-[#FD802E] block truncate font-bold">{formatShortList(qAfter)}</span>
          </div>
        </div>
      );
    }

    if (activeAlgo.id === 'kruskal') {
      const wBefore = prevFrame.mstWeight ?? 0;
      const wAfter = frame.mstWeight ?? 0;
      return (
        <div className="grid grid-cols-2 gap-2 text-[8px] font-mono border-t border-[#4B5563]/10 pt-1.5 mt-1.5">
          <div>
            <span className="text-[#94A3B8] block mb-0.5">MST COST BEFORE:</span>
            <span className="text-[#CBD5E1] block">{wBefore}</span>
          </div>
          <div>
            <span className="text-[#94A3B8] block mb-0.5">MST COST AFTER:</span>
            <span className="text-[#22C55E] block font-bold">{wAfter}</span>
          </div>
        </div>
      );
    }

    return null;
  };

  const getExplanationWhy = (algoId, frame, prevFrame) => {
    if (!frame) return "Algorithm initialized.";
    const q = frame.queue || [];
    const s = frame.stack || [];
    const node = frame.currentNode;
    const edge = frame.currentEdge;
    
    switch (algoId) {
      case 'bfs':
        if (edge) return `📡 WORM PROPAGATION: Malicious payload packet is sent from ${edge[0]} across the network link to ${edge[1]}. The switch forwards the Ethernet frame through the CAM table. Queue size: ${q.length} pending devices.`;
        if (node) return `📦 QUEUE DEQUEUE: Device "${node}" is extracted from the FRONT of the FIFO Queue (DEQUEUE operation). BFS now broadcasts infection packets to all of ${node}'s unvisited neighbors. Visited count: ${(frame.visited||[]).length} devices.`;
        if (q.length > 0) return `🔴 ENQUEUE: Newly discovered neighbor devices are appended to the REAR of the FIFO Queue. Data structure state: Queue[0]="${q[0]}" is next to be processed. Queue length = ${q.length}.`;
        return `✅ BFS COMPLETE: All reachable devices have been compromised. Total infected = ${(frame.visited||[]).length}. Queue is empty — algorithm terminates.`;
      case 'dfs':
        if (frame.action?.includes('Backtrack') || frame.action?.includes('dead-end')) return `🔙 BACKTRACK: No unvisited neighbors remain at "${node}". DFS performs STACK POP — removing "${node}" from top. Network scanner returns along the same path it came. Stack depth: ${s.length}.`;
        if (edge) return `🔬 DEEP SCAN: Scanner drills deeper — traversing link ${edge[0]} → ${edge[1]}. This network hop is recorded in the LIFO Stack (PUSH). The stack tracks our current path through the network.`;
        if (node) return `📚 STACK PUSH: Device "${node}" is PUSHED onto the top of the LIFO Stack. DFS commits to exploring this branch fully before backtracking. Stack depth = ${s.length}.`;
        return `🏁 DFS COMPLETE: All reachable paths explored. Total discovered = ${(frame.visited||[]).length} devices. Stack is empty.`;
      case 'dijkstra':
        if (edge) return `📡 EDGE RELAXATION: Checking if routing through link ${edge[0]}→${edge[1]} gives a shorter recovery path. Formula: dist[${edge[0]}] + weight(${edge[0]},${edge[1]}) vs current dist[${edge[1]}]. If cheaper → update distance table and re-insert into Min-Heap.`;
        if (node) return `⬇️ MIN-HEAP EXTRACT: Device "${node}" has the MINIMUM distance estimate in the Priority Queue. It is extracted (DEQUEUE_MIN) and its shortest path from the server is now FINALIZED. Recovery signal is routed toward this device.`;
        if (q.length > 0) return `📊 PRIORITY QUEUE STATE: ${q.length} candidate nodes remain in the Min-Heap. The next extraction will be the cheapest unprocessed device. Dijkstra guarantees the globally optimal recovery route.`;
        return `✅ RECOVERY PATH FOUND: Dijkstra has computed the minimum cost path from the recovery server to the infected device. The recovery packet now travels this optimal route through the network.`;
      case 'prim':
        if (edge) return `🌱 MST EDGE ADDED: Cable link ${edge[0]}↔${edge[1]} is the cheapest connection from MST to unvisited nodes. It is added to the Minimum Spanning Tree — representing an optimal network backbone link.`;
        if (node) return `📡 NODE JOINED MST: Device "${node}" is now part of the MST. Its adjacent edges are evaluated to update the min-key values of neighboring unvisited nodes.`;
        return `🏗️ MST GROWING: Prim's algorithm grows the network backbone one minimum-cost edge at a time. Total MST cost so far: ${frame.mstWeight ?? 0} units.`;
      case 'kruskal':
        if (frame.action?.includes('Skipping') || frame.action?.includes('cycle')) return `🔄 CYCLE DETECTED: Edge would connect two nodes already in the same Union-Find set (Find(u) == Find(v)). Adding this edge would create a network loop — SKIPPED to avoid broadcast storms.`;
        if (edge) return `✅ UNION MERGE: Find(${edge[0]}) ≠ Find(${edge[1]}) — no cycle! Union(${edge[0]}, ${edge[1]}) merges the two network segments. Edge weight = ${frame.currentWeight ?? '?'} added to MST backbone.`;
        return `📋 EDGE PROCESSING: Sorted edge list is processed in ascending weight order. Each edge is tested for the cycle condition using Union-Find path compression.`;
      case 'floyd':
        if (node) return `📐 FLOYD RELAXATION via k="${node}": Testing if routing all traffic through "${node}" as intermediate hop reduces the path cost for any pair (i,j). Formula: dist[i][${node}] + dist[${node}][j] < dist[i][j] ?`;
        return `🗺️ ALL-PAIRS SHORTEST PATH: Floyd-Warshall fills the distance matrix step by step. Each outer iteration adds one more possible relay device (k). After V iterations, every pair has its optimal route.`;
      case 'topological_sort':
        if (node) return `📋 KAHN'S ALGORITHM: Node "${node}" has in-degree 0 — all its dependencies are satisfied. It is dequeued and added to the topological order. All its successors have their in-degree decremented by 1.`;
        return `🔗 DEPENDENCY RESOLUTION: Topological sort models task scheduling in a network (e.g., which devices must come online before others). Nodes with zero in-degree (no pending dependencies) are processed first.`;
      case 'connected_components':
        if (node) return `🔍 DFS COMPONENT SCAN: Starting DFS from unvisited node "${node}" to discover all devices in this connected subnet. Every node reachable from here belongs to the same network island.`;
        return `🏝️ NETWORK ISLANDS: Connected Components finds isolated subnets — groups of devices that can reach each other but not other groups. Each component is a separate network island.`;
      case 'union_find':
        if (frame.action?.includes('Union')) return `🔗 UNION OPERATION: Two network devices are being merged into the same logical group. Path compression optimizes future Find() lookups to O(α(N)) amortized time.`;
        if (frame.action?.includes('Find')) return `🔍 FIND OPERATION: Tracing the parent pointer chain to locate the root representative of this device's network group. Path compression flattens the tree for future queries.`;
        return `📊 DISJOINT SET TRACKING: Union-Find tracks which devices belong to the same network segment using a parent array and rank heuristic.`;
      case 'knapsack':
        return `📦 GREEDY PACKING: Items (network devices/resources) are sorted by value-per-cost ratio (density). The highest density item is always packed first. If it exceeds capacity, a FRACTIONAL slice is taken.`;
      case 'branch_bound':
        if (frame.action?.includes('Prune') || frame.action?.includes('pruned')) return `✂️ BRANCH PRUNED: The upper bound estimate for this partial solution EXCEEDS the current best known cost. This branch cannot lead to an optimal solution — it is pruned from the search tree.`;
        return `🌳 STATE SPACE SEARCH: Branch and Bound explores the 0/1 knapsack decision tree. At each node: include item (branch left) or exclude item (branch right). Upper bound = fractional relaxation of remaining items.`;
      case 'tsp':
        return `🗺️ ROUTE OPTIMIZATION: TSP finds the minimum cost inspection tour visiting all ${(frame.currentRoute||[]).length} office devices exactly once and returning to start. Current best tour cost: ${frame.bestCost ?? 'computing...'}.`;
      case 'merge_sort':
        return `📊 DIVIDE & CONQUER: Array is recursively split into halves until single elements. Then sub-arrays are MERGED in sorted order. This models network packet reordering — packets arrive out-of-order and must be reassembled by sequence number.`;
      case 'quick_sort':
        return `⚡ PIVOT PARTITIONING: A random pivot is chosen. Elements < pivot move left, elements > pivot move right. This models sorting network response times — identifying outliers (slowest/fastest nodes) efficiently.`;
      case 'nqueens':
        if (frame.action?.includes('Backtrack')) return `🔙 CONSTRAINT VIOLATION: Placing a firewall at this position conflicts with an existing firewall (same row/column/diagonal). BACKTRACK — remove this placement and try the next column.`;
        return `♟️ FIREWALL PLACEMENT: Attempting to place a security device at position (row ${frame.row}, col ${frame.col}). Checking: no two firewalls share the same row, column, or diagonal coverage zone.`;
      case 'strassen':
        return `⚡ STRASSEN TRICK: Standard matrix multiplication uses 8 sub-multiplications. Strassen reduces this to 7 using algebraic identities (M1-M7). This models efficient data routing table computation in high-speed switches.`;
      case 'matrix_chain':
        return `📐 DP OPTIMAL PARENTHESIZATION: Computing the minimum number of scalar multiplications to evaluate a chain of network transformation matrices. Dynamic programming fills the cost table m[i,j] bottom-up.`;
      default:
        return frame.action || "Algorithm is processing elements in chronological execution ticks.";
    }
  };

  // Backend flow narration for the current step
  const getBackendFlowStep = (algoId, frame, frameIdx) => {
    const narrations = BACKEND_FLOW_NARRATIONS[algoId] || BACKEND_FLOW_NARRATIONS.default;
    // Map frame index to narration bucket
    const visited = (frame?.visited || []).length;
    const total = originalNodes.length || 18;
    const progress = total > 0 ? visited / total : 0;
    const narrationIdx = Math.min(
      Math.floor(progress * narrations.length) + (frameIdx < 2 ? 0 : 1),
      narrations.length - 1
    );
    return narrations[narrationIdx] || narrations[narrations.length - 1];
  };

  const renderNonGraphVisualizer = () => {
    if (!activeFrame) return null;
    
    switch (activeAlgo.id) {
      case 'merge_sort':
      case 'quick_sort':
        return (
          <ArrayVisualizer 
            array={activeFrame.array || activeFrame.state || []} 
            activeIndices={activeFrame.activeIndices || []} 
            pivotIndex={activeFrame.pivotIndex ?? -1} 
          />
        );
      case 'nqueens':
        return (
          <ChessboardVisualizer 
            board={activeFrame.board || []} 
            activeRow={activeFrame.row ?? -1} 
            activeCol={activeFrame.col ?? -1} 
          />
        );
      case 'matrix_chain':
        return (
          <MatrixVisualizer 
            matrix={activeFrame.costMatrix || activeFrame.m || []} 
            changedCell={activeFrame.changedCell || null} 
          />
        );
      case 'strassen':
        return (
          <div className="flex flex-col items-center gap-3 w-full font-mono text-[9px] select-none">
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-[#0F1720]/45 border border-[#4B5563]/15 rounded-xl p-2.5 max-h-[160px] overflow-y-auto">
                <span className="text-[8.5px] text-[#94A3B8] uppercase block mb-1">Matrix Product Outputs</span>
                <div className="space-y-1.5">
                  <div>M1 = <span className="text-cyan-400">{(activeFrame.M?.M1 ?? 0).toFixed(1)}</span></div>
                  <div>M2 = <span className="text-cyan-400">{(activeFrame.M?.M2 ?? 0).toFixed(1)}</span></div>
                  <div>M3 = <span className="text-cyan-400">{(activeFrame.M?.M3 ?? 0).toFixed(1)}</span></div>
                  <div>M4 = <span className="text-cyan-400">{(activeFrame.M?.M4 ?? 0).toFixed(1)}</span></div>
                  <div>M5 = <span className="text-cyan-400">{(activeFrame.M?.M5 ?? 0).toFixed(1)}</span></div>
                  <div>M6 = <span className="text-cyan-400">{(activeFrame.M?.M6 ?? 0).toFixed(1)}</span></div>
                  <div>M7 = <span className="text-cyan-400">{(activeFrame.M?.M7 ?? 0).toFixed(1)}</span></div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[8.5px] text-[#94A3B8] uppercase block">Computed Result C</span>
                <MatrixVisualizer matrix={activeFrame.matrixC || activeFrame.C || []} />
              </div>
            </div>
          </div>
        );
      default:
        return <div className="text-[#94A3B8] italic text-[10px]">No visual states for non-graph active simulation.</div>;
    }
  };

  const renderVisualDataStructureComponent = () => {
    if (!activeFrame) return null;
    
    switch (activeAlgo.id) {
      case 'bfs':
        return <QueueVisualizer items={activeFrame.queue || []} activeNode={activeFrame.currentNode} />;
      case 'dfs':
        return <StackVisualizer items={activeFrame.stack || []} activeNode={activeFrame.currentNode} />;
      case 'dijkstra':
        return (
          <div className="grid grid-cols-2 gap-4 w-full">
            <PriorityQueueVisualizer items={activeFrame.queue || []} />
            <DistanceTable distances={activeFrame.distances || {}} prevDistances={(timeline[currentFrame - 1] || {}).distances || {}} />
          </div>
        );
      case 'prim':
        return <MSTVisualizer mstWeight={activeFrame.mstWeight ?? 0} candidateEdges={activeFrame.queue || []} />;
      case 'kruskal':
        return (
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[8.5px] uppercase tracking-widest text-[#94A3B8] font-bold">Sorted Edges (Remaining)</span>
              <div className="bg-[#0F1720]/45 border border-[#4B5563]/15 rounded-xl p-2 max-h-[110px] overflow-y-auto space-y-1 min-h-[70px] font-mono text-[8.5px] text-[#CBD5E1]">
                {(activeFrame.queue || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between border-b border-[#4B5563]/10 pb-0.5 px-1">
                    <span>{item.split(' ')[0]}</span>
                    <span className="text-cyan-400 font-bold">{item.split(' (w=')[1]?.replace(')', '') || ''}</span>
                  </div>
                ))}
              </div>
            </div>
            <UnionFindVisualizer parents={activeFrame.parentArray || {}} />
          </div>
        );
      case 'floyd':
        return <MatrixVisualizer matrix={activeFrame.matrix || activeFrame.distances || []} changedCell={activeFrame.changedCell || null} />;
      case 'union_find':
        return <UnionFindVisualizer parents={activeFrame.parentArray || {}} />;
      case 'topological_sort':
        return (
          <div className="grid grid-cols-2 gap-4 w-full font-mono text-[9px]">
            <QueueVisualizer items={activeFrame.queue || []} activeNode={activeFrame.currentNode} />
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[8.5px] uppercase tracking-widest text-[#94A3B8] font-bold">In-Degrees Table</span>
              <div className="bg-[#0F1720]/45 border border-[#4B5563]/15 rounded-xl p-2.5 max-h-[110px] overflow-y-auto space-y-1 min-h-[70px] text-[#CBD5E1]">
                {Object.entries(activeFrame.inDegrees || {}).map(([nodeId, val]) => (
                  <div key={nodeId} className="flex justify-between border-b border-[#4B5563]/10 pb-0.5 px-1">
                    <span>{nodeId}</span>
                    <span className="font-bold text-[#FD802E]">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'knapsack':
        return <KnapsackVisualizer capacity={activeFrame.capacity ?? 10} used={activeFrame.usedWeight ?? 0} items={activeFrame.packedItems || []} />;
      case 'branch_bound':
      case 'tsp':
        return (
          <div className="grid grid-cols-2 gap-4 w-full font-mono text-[9px]">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[8.5px] uppercase tracking-widest text-[#94A3B8] font-bold">Active Branch Search Space</span>
              <div className="bg-[#0F1720]/45 border border-[#4B5563]/15 rounded-xl p-2.5 max-h-[110px] overflow-y-auto space-y-1.5 min-h-[70px] text-[#CBD5E1]">
                <div>Current Route: <strong className="text-[#FD802E]">{activeFrame.currentRoute ? JSON.stringify(activeFrame.currentRoute) : '[]'}</strong></div>
                <div>Best Tour Cost: <strong className="text-emerald-400">{activeFrame.bestCost ?? '─'}</strong></div>
              </div>
            </div>
            <div className="flex flex-col justify-center text-[10px] text-[#94A3B8] pl-4 border-l border-[#4B5563]/15">
              <div>Bound Estimate: <strong className="text-cyan-400">{activeFrame.bound ?? 'None'}</strong></div>
              <div className="text-[7.5px] leading-relaxed mt-1">Prunes decision branches that exceed the current optimal path bound.</div>
            </div>
          </div>
        );
      case 'merge_sort':
      case 'quick_sort':
        return (
          <ArrayVisualizer 
            array={activeFrame.array || activeFrame.state || []} 
            activeIndices={activeFrame.activeIndices || []} 
            pivotIndex={activeFrame.pivotIndex ?? -1} 
          />
        );
      case 'nqueens':
        return <StackVisualizer items={activeFrame.stack || []} activeNode={activeFrame.currentNode} />;
      default:
        return <QueueVisualizer items={activeFrame.queue || []} activeNode={activeFrame.currentNode} />;
    }
  };

  const renderVisualizerContent = () => {
    if (activeAlgo.isGraph) {
      if (originalNodes.length === 0) {
        return (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-8 bg-[#0F1720]/30 rounded-xl border border-[#4B5563]/15 font-sans">
            <BookOpen className="h-16 w-16 text-[#3B82F6] mb-4 animate-pulse" />
            <h4 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider mb-2">No Active Graph Loaded</h4>
            <p className="text-[#94A3B8] max-w-sm mb-6 leading-relaxed">
              Please open the Network Builder first and save a default topology.
            </p>
          </div>
        );
      }

      const activeStartNode = activeAlgo.id === 'bfs' || activeAlgo.id === 'dfs'
        ? (startNodes.length > 0 ? startNodes[0] : (originalNodes[0]?.id || 'None'))
        : (recoverySource || (startNodes.length > 0 ? startNodes[0] : (originalNodes[0]?.id || 'None')));

      const activeTargetNode = recoveryTarget || (originalNodes.filter(n => n.id.startsWith('SRV-'))[0]?.id || originalNodes[originalNodes.length - 1]?.id || 'None');

      return (
        <div className="flex-1 flex flex-col justify-between h-full space-y-4 relative">
          {/* React Flow Canvas Wrapper */}
          <div className="flex-1 min-h-[300px] border border-[#4B5563]/25 rounded-xl overflow-hidden bg-[#0F1720] relative">
            {/* Dijkstra info panel: source → target overview */}
            {activeAlgo.id === 'dijkstra' && (
              <div className="absolute top-4 left-4 z-10 bg-[#0F1720]/90 border border-[#3B82F6]/40 px-3 py-2 rounded-lg font-sans text-[8px] text-[#CBD5E1] shadow-lg space-y-1 max-w-[190px]">
                <div className="font-bold uppercase tracking-wider text-[#3B82F6] border-b border-[#3B82F6]/15 pb-0.5 mb-0.5 text-[7.5px]">Dijkstra Context</div>
                <div className="flex items-center gap-1">
                  <span className="text-[#3B82F6]">🛡️</span>
                  <div>
                    <span className="text-[#94A3B8] block text-[7px] uppercase">Source (Recovery Server)</span>
                    <span className="font-bold text-[#F8FAFC] font-mono">{recoverySource || 'Not set'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#EF4444]">🔴</span>
                  <div>
                    <span className="text-[#94A3B8] block text-[7px] uppercase">Target (Infected Device)</span>
                    <span className="font-bold text-[#F8FAFC] font-mono">{recoveryTarget || 'Not set'}</span>
                  </div>
                </div>
                {result?.found && currentFrame === timeline.length - 1 && (
                  <div className="pt-0.5 border-t border-[#3B82F6]/15">
                    <span className="text-[#22C55E] font-bold">Total Cost: {result.cost}</span>
                    <div className="text-[#CBD5E1] font-mono mt-0.5 leading-tight">
                      {result.path?.join(' → ')}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Status Indicators Legend */}
            <div className="absolute top-4 right-4 z-10 bg-[#0F1720]/90 border border-[#4B5563]/30 px-3 py-2 rounded-lg flex flex-col gap-1.5 font-sans text-[8px] text-[#CBD5E1] shadow-lg">
              <span className="font-bold uppercase tracking-wider text-[#94A3B8] border-b border-[#4B5563]/10 pb-0.5 mb-0.5">Status Legend</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FD802E] animate-pulse"></span>
                <span>🟠 Active Node</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
                <span>🔴 Infected / Visited</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]"></span>
                <span>🔵 Recovered / Secured</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded border border-dashed border-[#FD802E] bg-[#FD802E]/20"></span>
                <span>🟡 Queued / Discovered</span>
              </div>
            </div>

            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={true}
              fitView
              minZoom={0.1}
              maxZoom={4}
            >
              <Background color="#4B5563" gap={16} size={1} />
              <Controls />
            </ReactFlow>
          </div>
          
          {/* Data Structure Visualizer Trace */}
          {timeline.length > 0 && renderDataStructureVisualizer()}

          {/* Live DAA State Panel */}
          {timeline.length > 0 && (
            <div className="p-3.5 bg-[#0F1720]/80 border border-[#4B5563]/25 rounded-xl grid grid-cols-4 gap-4 font-sans text-[10px] items-center">
              <div>
                <span className="text-[#94A3B8] uppercase tracking-wider block text-[8px] mb-1 font-bold">Current Node</span>
                <span className="text-[#F8FAFC] font-mono font-bold bg-[#FD802E]/10 border border-[#FD802E]/20 px-2.5 py-1 rounded text-[9.5px] block truncate">
                  🟠 {activeFrame.currentNode || 'None / Finished'}
                </span>
              </div>
              
              <div className="col-span-2">
                <span className="text-[#94A3B8] uppercase tracking-wider block text-[8px] mb-1 font-bold">Current Action</span>
                <span className="text-[#CBD5E1] font-mono font-bold text-[9.5px] leading-relaxed block truncate">
                  {activeFrame.action}
                </span>
              </div>

              <div>
                <span className="text-[#94A3B8] uppercase tracking-wider block text-[8px] mb-1 font-bold">Next Expected Node</span>
                <span className="text-[#FD802E] font-mono font-bold bg-[#FD802E]/10 border border-[#FD802E]/20 px-2.5 py-1 rounded text-[9.5px] block truncate">
                  {(() => {
                    if (activeAlgo.id === 'dfs') {
                      const st = activeFrame.stack || [];
                      return st.length > 0 ? st[st.length - 1] : 'None';
                    }
                    const q = activeFrame.queue || [];
                    if (q.length === 0) return 'None';
                    return typeof q[0] === 'string' ? q[0].split(' ')[0] : (q[0].node || q[0].id || 'None');
                  })()}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex-1 flex justify-center items-center text-[#94A3B8] italic font-sans">
          Computing algorithm state space...
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex-1 flex overflow-hidden h-full bg-[#0F1720]">
      {/* Sidebar: Algorithm Directory list */}
      <div className="w-80 bg-[#233D4C] border-r border-[#4B5563]/30 h-full flex flex-col select-none flex-shrink-0 text-xs font-sans">
        <div className="p-4 border-b border-[#4B5563]/25 bg-[#1B2838]/40 space-y-1.5 flex-shrink-0">
          <h2 className="text-sm font-bold text-[#FD802E] tracking-wider uppercase flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-[#FD802E]" />
            Learning Directory
          </h2>
          <p className="text-[10px] text-[#94A3B8] leading-normal">
            Select any algorithm below to trace its complexities and pseudocode.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Categories */}
          {['Graph Traversal', 'Path Planning', 'Spanning Trees', 'Data Structures', 'Greedy & DP', 'Sorting', 'Divide & Conquer', 'Backtracking'].map(cat => {
            const algos = ALGORITHMS.filter(a => a.category === cat);
            if (algos.length === 0) return null;
            
            return (
              <div key={cat} className="space-y-1.5">
                <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-wider pl-1.5">{cat}</span>
                <div className="flex flex-col gap-1">
                  {algos.map(algo => {
                    const isActive = activeAlgo.id === algo.id;
                    return (
                      <button
                        key={algo.id}
                        onClick={() => {
                          setActiveAlgo(algo);
                          handleReset();
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg border transition-all text-[11px] font-medium ${
                          isActive 
                            ? 'bg-[#FD802E]/10 border-[#FD802E]/40 text-[#FD802E] shadow-sm font-bold'
                            : 'bg-[#0F1720]/30 border-[#4B5563]/15 text-[#CBD5E1] hover:border-[#FD802E]/25 hover:text-[#FD802E]'
                        }`}
                      >
                        {algo.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Learning Content Workspace — flex column: scrollable content + pinned controls */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0F1720] text-[#F8FAFC]">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
        {/* Header banner */}
        <div className="bg-[#1B2838] border border-[#4B5563]/30 rounded-xl p-4 flex justify-between items-center shadow-lg">
          <div>
            <h2 className="text-base font-black tracking-wider text-[#F8FAFC] flex items-center gap-2">
              {activeAlgo.name}
              <span className="text-[9px] uppercase font-mono tracking-widest bg-[#FD802E]/20 text-[#FD802E] px-2 py-0.5 rounded border border-[#FD802E]/30 font-bold">
                {activeAlgo.category}
              </span>
            </h2>
            <p className="text-[10px] text-[#94A3B8] mt-1">{activeAlgo.desc}</p>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-[#94A3B8]">Status: </span>
              <span className="text-[#22C55E] uppercase font-bold animate-pulse">{timeline.length > 0 ? 'ACTIVE' : 'IDLE'}</span>
            </div>
            <div>
              <span className="text-[#94A3B8]">Step: </span>
              <span className="text-[#FD802E] font-bold">{currentFrame + 1} / {timeline.length || 1}</span>
            </div>
          </div>
        </div>

        {/* Main Board Grid */}
        <div className="grid grid-cols-3 gap-4 flex-1 min-h-[500px]">
          {/* Col 1 & 2: Main visualization area (Graph/Array/Chessboard + Data Structure) */}
          <div className="col-span-2 flex flex-col space-y-4">
            {/* Top half: The actual network or sort array */}
            <div className="bg-[#1B2838]/60 border border-[#4B5563]/25 rounded-xl h-[340px] relative overflow-hidden flex flex-col">
              <div className="bg-[#111C2A] px-3 py-1.5 border-b border-[#4B5563]/25 text-[9px] font-bold text-[#FD802E] uppercase tracking-wider">
                {activeAlgo.isGraph ? 'Live Network Topology Graph' : 'Primary Visual State'}
              </div>
              <div className="flex-1 relative min-h-0">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center text-[#94A3B8] italic font-mono text-[10px]">
                    Computing algorithm state space...
                  </div>
                ) : errorMsg ? (
                  <div className="w-full h-full flex flex-col justify-center items-center text-center p-6 text-rose-400 font-mono text-[10px]">
                    <div>Simulation calculation failed:</div>
                    <div className="mt-1 font-bold">{errorMsg}</div>
                  </div>
                ) : activeAlgo.isGraph ? (
                  <>
                    {/* Status Indicators Legend */}
                    <div className="absolute top-3 right-3 z-10 bg-[#0F1720]/90 border border-[#4B5563]/30 px-2.5 py-1.5 rounded-lg flex flex-col gap-1 font-sans text-[7.5px] text-[#CBD5E1] shadow-lg">
                      <span className="font-bold uppercase tracking-wider text-[#94A3B8] border-b border-[#4B5563]/10 pb-0.5 mb-0.5">Status Legend</span>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FD802E] animate-pulse"></span>
                        <span>Active Node</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
                        <span>Infected / Visited</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></span>
                        <span>Recovered / Secured</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded border border-dashed border-[#FD802E] bg-[#FD802E]/20"></span>
                        <span>Queued / Discovered</span>
                      </div>
                    </div>

                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      nodeTypes={nodeTypes}
                      edgeTypes={edgeTypes}
                      nodesDraggable={false}
                      nodesConnectable={false}
                      elementsSelectable={true}
                      fitView
                      minZoom={0.1}
                      maxZoom={4}
                    >
                      <Background color="#4B5563" gap={16} size={1} />
                      <Controls />
                    </ReactFlow>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-6 overflow-y-auto">
                    {renderNonGraphVisualizer()}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom half: Visual Data Structure */}
            <div className="bg-[#1B2838]/60 border border-[#4B5563]/25 rounded-xl flex-1 p-4 flex flex-col min-h-[160px] justify-between">
              <div className="bg-[#111C2A] -mx-4 -mt-4 px-3 py-1.5 border-b border-[#4B5563]/25 text-[9px] font-bold text-[#FD802E] uppercase tracking-wider rounded-t-xl mb-3 flex justify-between items-center">
                <span>Visual Data Structure Component</span>
                <span className="text-[8px] bg-[#FD802E]/10 text-[#FD802E] px-1.5 rounded uppercase font-mono font-bold">{activeAlgo.id === 'dfs' ? 'LIFO' : 'FIFO'}</span>
              </div>
              <div className="flex-1 flex flex-col justify-center min-h-0">
                {timeline.length > 0 ? renderVisualDataStructureComponent() : (
                  <div className="text-[10px] text-[#94A3B8] italic text-center py-8">Initialize simulation to view internal structural states.</div>
                )}
              </div>
            </div>
          </div>

          {/* Col 3: Details area (Journey, Pseudocode, Replay List, Explain Panel) */}
          <div className="flex flex-col space-y-4">
            {/* Traversal Journey Panel */}
            <div className="bg-[#1B2838]/60 border border-[#4B5563]/25 rounded-xl h-[120px] p-4 flex flex-col min-h-0">
              <div className="bg-[#111C2A] -mx-4 -mt-4 px-3 py-1.5 border-b border-[#4B5563]/25 text-[9px] font-bold text-[#FD802E] uppercase tracking-wider rounded-t-xl mb-3">
                Traversal Journey
              </div>
              <div className="flex-1 overflow-y-auto min-h-0">
                {timeline.length > 0 ? (
                  <TraversalJourney timeline={timeline} currentFrame={currentFrame} />
                ) : (
                  <span className="text-[10px] text-[#94A3B8] italic">No active path.</span>
                )}
              </div>
            </div>

            {/* Live Pseudocode Highlight Panel */}
            <div className="bg-[#1B2838]/60 border border-[#4B5563]/25 rounded-xl h-[180px] p-4 flex flex-col min-h-0">
              <div className="bg-[#111C2A] -mx-4 -mt-4 px-3 py-1.5 border-b border-[#4B5563]/25 text-[9px] font-bold text-[#FD802E] uppercase tracking-wider rounded-t-xl mb-2 flex justify-between">
                <span>Live Pseudocode Tracker</span>
                <span className="text-[8px] text-[#94A3B8] font-mono">Line: {learning?.activeLine ?? 0}</span>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[9px] text-[#CBD5E1] space-y-0.5 leading-normal min-h-0">
                {(activeAlgo.pseudo || learning?.pseudoCode || []).map((line, idx) => {
                  const isActiveLine = learning && learning.activeLine === idx;
                  return (
                    <div 
                      key={idx} 
                      className={`px-1.5 py-0.5 rounded transition-all ${
                        isActiveLine 
                          ? 'bg-[#FD802E]/25 text-[#FD802E] font-bold border-l-2 border-[#FD802E]' 
                          : ''
                      }`}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* "Why?" Explanatory Panel & What Happened step list & Backend Flow */}
            <div className="bg-[#1B2838]/60 border border-[#4B5563]/25 rounded-xl flex-1 p-4 flex flex-col min-h-0 justify-between">
              <div className="flex gap-1.5 border-b border-[#4B5563]/15 pb-2 mb-3 flex-shrink-0 flex-wrap">
                <button
                  onClick={() => setRightPanelTab('history')}
                  className={`px-2 py-1 rounded font-bold text-[8.5px] uppercase tracking-wider transition-colors ${
                    rightPanelTab === 'history' ? 'bg-[#FD802E] text-[#0F1720]' : 'bg-[#111C2A] text-[#94A3B8]'
                  }`}
                >
                  📋 Steps
                </button>
                <button
                  onClick={() => setRightPanelTab('why')}
                  className={`px-2 py-1 rounded font-bold text-[8.5px] uppercase tracking-wider transition-colors ${
                    rightPanelTab === 'why' ? 'bg-[#FD802E] text-[#0F1720]' : 'bg-[#111C2A] text-[#94A3B8]'
                  }`}
                >
                  🔍 Why?
                </button>
                <button
                  onClick={() => setRightPanelTab('flow')}
                  className={`px-2 py-1 rounded font-bold text-[8.5px] uppercase tracking-wider transition-colors ${
                    rightPanelTab === 'flow' ? 'bg-[#22C55E] text-[#0F1720]' : 'bg-[#111C2A] text-[#94A3B8]'
                  }`}
                >
                  🖧 Backend Flow
                </button>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
                {rightPanelTab === 'history' ? (
                  <div className="space-y-2 pr-1">
                    {timeline.length > 0 ? (
                      timeline.map((frame, idx) => {
                        const prevFrame = timeline[idx - 1] || {};
                        const isActive = idx === currentFrame;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setCurrentFrame(idx);
                              setIsPlaying(false);
                            }}
                            className={`p-2.5 bg-[#0F1720]/50 border rounded-lg cursor-pointer transition-all ${
                              isActive ? 'border-[#FD802E] bg-[#FD802E]/5 shadow-md' : 'border-[#4B5563]/15 hover:border-[#FD802E]/25'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1 text-[8.5px] font-mono text-[#FD802E]">
                              <span>STEP {idx + 1}</span>
                              {isActive && <span className="bg-[#FD802E]/20 px-1 rounded text-[7px] uppercase font-bold">Active</span>}
                            </div>
                            <p className="text-[9px] text-[#F8FAFC] leading-normal font-mono mb-1">{frame.action}</p>
                            {renderHistoryCardSnapshot(frame, prevFrame)}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-[#94A3B8] italic text-center py-8">No steps calculated.</div>
                    )}
                  </div>
                ) : rightPanelTab === 'why' ? (
                  <div className="space-y-3 pr-1 text-[10px] leading-relaxed text-[#CBD5E1] font-mono">
                    <div className="text-[#FD802E] font-bold uppercase tracking-wider">Step {currentFrame + 1} Explanation:</div>
                    <div className="text-[#F8FAFC] text-[9.5px]">{activeFrame.action}</div>
                    <div className="bg-[#111C2A] p-2.5 rounded-lg border border-[#4B5563]/15 text-[9.5px] leading-relaxed">
                      <strong className="text-[#22C55E] block mb-1">DAA Insight:</strong>
                      {getExplanationWhy(activeAlgo.id, activeFrame, timeline[currentFrame - 1])}
                    </div>
                    <div className="bg-[#0F1720]/60 p-2 rounded-lg border border-[#4B5563]/10 text-[8.5px] text-[#94A3B8]">
                      <div className="text-[#FD802E] font-bold mb-1 text-[8px] uppercase">Complexity at this step:</div>
                      <div>Time: <span className="text-[#22C55E] font-bold">{activeAlgo.complexity?.time || 'O(V+E)'}</span></div>
                      <div>Space: <span className="text-cyan-400 font-bold">{activeAlgo.complexity?.space || 'O(V)'}</span></div>
                    </div>
                  </div>
                ) : (
                  // Backend Data Flow narration panel
                  <div className="space-y-2.5 pr-1">
                    <div className="text-[#22C55E] font-bold uppercase tracking-wider text-[8.5px] border-b border-[#22C55E]/20 pb-1.5 mb-2">🖧 Backend Network Data Flow</div>
                    <div className="text-[9px] text-[#94A3B8] mb-2 leading-normal">
                      How data physically moves through the office network at each algorithm step:
                    </div>
                    {(BACKEND_FLOW_NARRATIONS[activeAlgo.id] || BACKEND_FLOW_NARRATIONS.default).map((step, idx) => {
                      const visited = (activeFrame?.visited || []).length;
                      const total = originalNodes.length || 18;
                      const progress = total > 0 ? visited / total : 0;
                      const activeNarrationIdx = Math.min(
                        Math.floor(progress * (BACKEND_FLOW_NARRATIONS[activeAlgo.id] || BACKEND_FLOW_NARRATIONS.default).length) + (currentFrame < 2 ? 0 : 1),
                        (BACKEND_FLOW_NARRATIONS[activeAlgo.id] || BACKEND_FLOW_NARRATIONS.default).length - 1
                      );
                      const isCurrentStep = idx === activeNarrationIdx;
                      const isPastStep = idx < activeNarrationIdx;
                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg border text-[9px] leading-relaxed transition-all ${
                            isCurrentStep
                              ? 'border-[#22C55E]/60 bg-[#22C55E]/8 text-[#F8FAFC] shadow-md shadow-[#22C55E]/10'
                              : isPastStep
                              ? 'border-[#4B5563]/20 bg-[#111C2A]/50 text-[#6B7280] line-through decoration-[#4B5563]'
                              : 'border-[#4B5563]/10 bg-[#111C2A]/30 text-[#4B5563]'
                          }`}
                        >
                          <div className={`flex items-start gap-1.5`}>
                            <span className={`font-mono font-black text-[8px] flex-shrink-0 mt-0.5 ${
                              isCurrentStep ? 'text-[#22C55E]' : isPastStep ? 'text-[#4B5563]' : 'text-[#374151]'
                            }`}>{isPastStep ? '✓' : isCurrentStep ? '▶' : String(idx + 1).padStart(2, '0')}</span>
                            <span>{step}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div className="mt-3 p-2 bg-[#1B2838] border border-[#3B82F6]/20 rounded-lg text-[8.5px] text-[#3B82F6] leading-relaxed">
                      <strong className="block mb-1">📖 Network Topology Context:</strong>
                      Office Setup: 1 Server (SRV-1) → 1 Router (R-1) → 2 Switches (SW-1, SW-2) → 12 Workstations (PC-1 to PC-12)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div> {/* end scrollable content area */}

        {/* Playback controls row — always pinned at the bottom */}
        <div className="bg-[#1B2838] border-t border-[#4B5563]/30 px-4 py-2.5 flex items-center justify-between shadow-md flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevStep}
              disabled={currentFrame === 0 || timeline.length === 0}
              className="p-1.5 bg-[#111C2A] border border-[#4B5563]/30 rounded hover:bg-[#FD802E]/20 text-[#FD802E] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Previous Step"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              onClick={handlePlayPause}
              disabled={timeline.length === 0}
              className="p-2 bg-[#FD802E] hover:bg-[#FF9C4A] text-[#0F1720] rounded-full transition-colors flex items-center justify-center font-bold disabled:opacity-30"
              title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
            </button>

            <button
              onClick={handleNextStep}
              disabled={currentFrame === timeline.length - 1 || timeline.length === 0}
              className="p-1.5 bg-[#111C2A] border border-[#4B5563]/30 rounded hover:bg-[#FD802E]/20 text-[#FD802E] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Next Step"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={handleReset}
              disabled={timeline.length === 0}
              className="p-1.5 bg-[#111C2A] border border-[#4B5563]/30 rounded hover:bg-[#FD802E]/20 text-[#FD802E] transition-colors flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider disabled:opacity-30"
              title="Reset to frame 0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          {/* Progress slider track */}
          {timeline.length > 0 && (
            <div className="flex-1 mx-6 flex items-center gap-3">
              <input
                type="range"
                min="0"
                max={timeline.length - 1}
                value={currentFrame}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentFrame(parseInt(e.target.value) || 0);
                }}
                className="flex-1 accent-[#FD802E] h-1 bg-[#0F1720] rounded-lg cursor-pointer appearance-none"
              />
              <span className="text-[10px] font-mono text-[#94A3B8]">{currentFrame + 1} / {timeline.length}</span>
            </div>
          )}

          {/* Speed controls */}
          <div className="flex items-center gap-1.5 bg-[#111C2A] px-3 py-1.5 rounded-lg border border-[#4B5563]/25">
            <span className="text-[9px] text-[#94A3B8] font-bold uppercase font-mono">Speed:</span>
            <select
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="bg-transparent text-[10px] font-bold text-[#FD802E] outline-none cursor-pointer"
            >
              {SPEED_LEVELS.map(lvl => (
                <option key={lvl.value} value={lvl.value} className="bg-[#233D4C] text-[#F8FAFC]">{lvl.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
