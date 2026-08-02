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
    desc: "Calculates the minimum recovery path between two nodes on a weighted graph using a priority queue, relaxing distance estimates." },
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

export default function LearningMode() {
  const [activeAlgo, setActiveAlgo] = useState(ALGORITHMS.find(a => a.id === 'bfs'));
  const [rightPanelTab, setRightPanelTab] = useState('history'); // 'guide' | 'history'
  
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
        return {
          ...e,
          selected: !!isActive,
          data: {
            ...e.data,
            isSimulation: false,
            isRecovery: !!isActive
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
    
    switch (algoId) {
      case 'bfs':
        if (frame.currentEdge) return `Worm traverses link ${frame.currentEdge[0]} ── ${frame.currentEdge[1]} to compromise adjacent devices.`;
        if (frame.currentNode) return `Extracting front node ${frame.currentNode} from FIFO Queue to examine unvisited adjacent neighbor nodes.`;
        return "Discovered neighbors are enqueued to the rear of the FIFO Queue.";
      case 'dfs':
        if (frame.action?.includes('backtrack') || frame.action?.includes('dead-end')) return `Backtracking through previous link since no unvisited adjacent nodes remain.`;
        if (frame.currentNode) return `Exploring deeper from node ${frame.currentNode} and pushing it onto the LIFO stack.`;
        return "DFS traverses deep into tree branch paths using LIFO ordering.";
      case 'dijkstra':
        return "Dijkstra extracts the minimum path cost estimate from the priority queue and relaxes adjacent neighbors.";
      case 'prim':
        return "Prim's selects the minimum weight candidate edge connected to our active MST vertices to grow the tree.";
      case 'kruskal':
        return "Kruskal sorts all graph edges by weight and union-finds parent sets to add edges without cycles.";
      case 'nqueens':
        if (frame.action?.includes('Backtrack')) return "Queen configuration conflict detected! Backtracking to the previous row.";
        return "Placing a new Queen on the chessboard row cell, checking safety status against existing queens.";
      default:
        return frame.action || "Algorithm is processing elements in chronological execution ticks.";
    }
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

      {/* Main Learning Content Workspace */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-[#0F1720] text-[#F8FAFC] p-6 space-y-4">
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

            {/* "Why?" Explanatory Panel & What Happened step list */}
            <div className="bg-[#1B2838]/60 border border-[#4B5563]/25 rounded-xl flex-1 p-4 flex flex-col min-h-0 justify-between">
              <div className="flex gap-2 border-b border-[#4B5563]/15 pb-2 mb-3 flex-shrink-0">
                <button
                  onClick={() => setRightPanelTab('history')}
                  className={`px-2.5 py-1 rounded font-bold text-[9px] uppercase tracking-wider transition-colors ${
                    rightPanelTab === 'history' ? 'bg-[#FD802E] text-[#0F1720]' : 'bg-[#111C2A] text-[#94A3B8]'
                  }`}
                >
                  What Happened?
                </button>
                <button
                  onClick={() => setRightPanelTab('why')}
                  className={`px-2.5 py-1 rounded font-bold text-[9px] uppercase tracking-wider transition-colors ${
                    rightPanelTab === 'why' ? 'bg-[#FD802E] text-[#0F1720]' : 'bg-[#111C2A] text-[#94A3B8]'
                  }`}
                >
                  Active Step Why?
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
                ) : (
                  <div className="space-y-3 pr-1 text-[10px] leading-relaxed text-[#CBD5E1] font-mono">
                    <div className="text-[#FD802E] font-bold uppercase tracking-wider">Step {currentFrame + 1} Explanation:</div>
                    <div className="text-[#F8FAFC]">{activeFrame.action}</div>
                    <div className="bg-[#111C2A] p-2.5 rounded-lg border border-[#4B5563]/15 text-[9.5px]">
                      <strong className="text-[#22C55E] block mb-1">DAA Insight:</strong>
                      {getExplanationWhy(activeAlgo.id, activeFrame, timeline[currentFrame - 1])}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Playback controls row */}
        <div className="bg-[#1B2838] border border-[#4B5563]/30 rounded-xl p-3 flex items-center justify-between shadow-md flex-shrink-0">
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
