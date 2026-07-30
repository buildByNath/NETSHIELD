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
 * Purpose: Interactive textbook and laboratory visualizer for all 15 DAA algorithms.
 */

// Categorized directory of all 15 algorithms
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
  
  // Non-graph Educational Algorithms (Interactive Visualizers)
  { id: 'merge_sort', name: 'Merge Sort', category: 'Sorting', complexity: { time: 'O(N log N)', space: 'O(N)' }, isGraph: false,
    desc: "A stable divide-and-conquer sorting algorithm. Recursively splits arrays in half and merges sorted sub-lists.",
    pseudo: [
      "MergeSort(A, p, r):",
      "  if p < r:",
      "    q = (p + r) / 2",
      "    MergeSort(A, p, q)",
      "    MergeSort(A, q + 1, r)",
      "    Merge(A, p, q, r)"
    ] },
  { id: 'quick_sort', name: 'Randomized Quick Sort', category: 'Sorting', complexity: { time: 'O(N log N) Avg', space: 'O(log N)' }, isGraph: false,
    desc: "Divides arrays by selecting a randomized pivot element, partitioning smaller items left and larger right, and recursing.",
    pseudo: [
      "RandomizedQuickSort(A, p, r):",
      "  if p < r:",
      "    q = RandomizedPartition(A, p, r)",
      "    RandomizedQuickSort(A, p, q-1)",
      "    RandomizedQuickSort(A, q+1, r)"
    ] },
  { id: 'matrix_chain', name: 'Matrix Chain DP', category: 'Divide & Conquer', complexity: { time: 'O(N³)', space: 'O(N²)' }, isGraph: false,
    desc: "Dynamic programming optimization mapping matrix chain splits, minimizing total scalar multiplication operations.",
    pseudo: [
      "MatrixChainOrder(p):",
      "  for l = 2 to n:",
      "    for i = 1 to n - l + 1:",
      "      m[i, j] = infinity",
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
  { id: 'nqueens', name: 'N-Queens Backtracking', category: 'Backtracking', complexity: { time: 'O(N!)', space: 'O(N)' }, isGraph: false,
    desc: "Backtracking puzzle placing N non-attacking queens on an N x N chessboard. Backtracks immediately upon conflict detections.",
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
  const [activeAlgo, setActiveAlgo] = useState(ALGORITHMS.find(a => a.id === 'merge_sort'));
  
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

  // Custom Visualizer Inputs
  const [sortInput, setSortInput] = useState('29, 10, 14, 37, 13, 2, 7');
  const [matrixDimsInput, setMatrixDimsInput] = useState('10, 20, 30, 40, 30');
  const [queensSize, setQueensSize] = useState(4);

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
        return {
          ...n,
          selected: activeNode === n.id,
          data: {
            ...n.data,
            status: status === 'infected' ? 'infected' : (isStart ? 'protected' : 'healthy')
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
        if ((isSrc || isDst) && status !== 'recovered') {
          status = 'protected'; // gold highlight
        }
        
        return {
          ...n,
          selected: activeNode === n.id,
          data: {
            ...n.data,
            status
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
        // Non-graph algorithms
        if (activeAlgo.id === 'merge_sort') {
          const arr = sortInput.split(',').map(n => parseInt(n.trim()) || 0);
          response = await algorithmService.simulateSort('merge_sort', arr);
        } else if (activeAlgo.id === 'quick_sort') {
          const arr = sortInput.split(',').map(n => parseInt(n.trim()) || 0);
          response = await algorithmService.simulateSort('quick_sort', arr);
        } else if (activeAlgo.id === 'matrix_chain') {
          const dims = matrixDimsInput.split(',').map(n => parseInt(n.trim()) || 10);
          response = await algorithmService.simulateDP(dims);
        } else if (activeAlgo.id === 'strassen') {
          response = await algorithmService.simulateStrassen(
            [[1, 2], [3, 4]],
            [[5, 6], [7, 8]]
          );
        } else if (activeAlgo.id === 'nqueens') {
          response = await algorithmService.simulateNQueens(queensSize);
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
    fetchAlgorithmDetails();
  }, [activeAlgo]);

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

  // Render Visualizer panels based on algorithm type
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
          {/* React Flow Canvas */}
          <div className="flex-1 min-h-[300px] border border-[#4B5563]/25 rounded-xl overflow-hidden bg-[#0F1720]">
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
          {timeline.length > 0 && (() => {
            const rawQueue = activeFrame.queue || [];
            const displayQueue = [...rawQueue];
            const activeNode = activeFrame.currentNode;
            if (activeNode) {
              const rawQueueLabels = rawQueue.map(item => 
                typeof item === 'string' 
                  ? item 
                  : (item.node || item.id || (item.vertex !== undefined ? item.vertex : ''))
              );
              if (!rawQueueLabels.includes(activeNode)) {
                if (activeAlgo.id === 'dfs') {
                  displayQueue.push(activeNode);
                } else {
                  displayQueue.unshift(activeNode);
                }
              }
            }

            return (
              <div className="p-3 bg-[#0F1720]/60 border border-[#4B5563]/25 rounded-lg flex flex-col gap-2 font-sans select-none">
                <div className="flex items-center justify-between border-b border-[#4B5563]/15 pb-1">
                  <span className="text-[9px] uppercase tracking-widest text-[#94A3B8] font-bold">
                    {activeAlgo.id === 'dfs' ? 'LIFO Stack Trace' : activeAlgo.id === 'dijkstra' || activeAlgo.id === 'prim' ? 'Priority Queue Trace' : 'FIFO Queue Trace'}
                  </span>
                  <span className="text-[8px] bg-[#3B82F6]/20 text-[#3B82F6] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                    {activeAlgo.id === 'dfs' ? 'LIFO' : 'FIFO'}
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto min-h-[32px] py-1">
                  {displayQueue.length > 0 ? (
                    displayQueue.map((item, idx) => {
                      const label = typeof item === 'string' 
                        ? item 
                        : (item.node || item.id || (item.vertex !== undefined ? item.vertex : JSON.stringify(item)));
                      const isActive = label === activeNode;
                      return (
                        <div key={idx} className="flex items-center gap-1.5 flex-shrink-0">
                          <span 
                            className={`px-2.5 py-1 rounded font-mono text-[9px] font-bold shadow-md flex-shrink-0 transition-all ${
                              isActive 
                                ? 'bg-[#EF4444]/20 border-2 border-[#EF4444] text-[#EF4444] animate-pulse' 
                                : 'bg-[#1B2838] border border-[#FD802E]/35 text-[#FD802E]'
                            }`}
                            title={isActive ? 'Currently Dequeued / Processing Neighbor Devices' : 'Waiting in Queue'}
                          >
                            {label} {isActive && ' (Active)'}
                          </span>
                          {idx < displayQueue.length - 1 && (
                            <span className="text-[#4B5563] text-[10px] font-bold">→</span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-[10px] text-[#94A3B8] italic">No active elements in data structure.</span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Variable trace logs */}
          <div className="p-3 bg-[#0F1720]/60 border border-[#4B5563]/25 rounded-lg flex justify-between items-center font-sans text-[10px]">
            <div className="flex gap-4">
              <span className="text-[#94A3B8]">
                Start Node: <strong className="text-[#FD802E]">{activeStartNode}</strong>
              </span>
              {activeAlgo.id === 'dijkstra' && (
                <span className="text-[#94A3B8]">
                  Target Node: <strong className="text-[#FD802E]">{activeTargetNode}</strong>
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <span className="bg-[#FD802E]/10 text-[#FD802E] px-2 py-0.5 rounded border border-[#FD802E]/20">
                Steps: {timeline.length}
              </span>
            </div>
          </div>
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

    if (activeAlgo.id === 'merge_sort') {
      const activeArray = activeFrame.array || [];
      const subarrays = activeFrame.subarrays || [];
      return (
        <div className="flex-1 flex flex-col justify-between h-full space-y-6">
          <div className="flex-1 flex flex-col justify-center items-center space-y-8 p-4">
            {/* Primary array row */}
            <div className="flex gap-2">
              {activeArray.map((val, idx) => (
                <div key={idx} className="w-12 h-12 bg-[#233D4C] border border-[#3B82F6]/40 text-[#F8FAFC] font-black rounded-lg flex items-center justify-center text-xs shadow-md">
                  {val}
                </div>
              ))}
            </div>
            
            {/* Subarrays splitting display */}
            {subarrays.length > 0 && (
              <div className="flex gap-8 justify-center items-center animate-in slide-in-from-bottom-2 duration-200">
                {subarrays.map((sub, sIdx) => (
                  <div key={sIdx} className="flex gap-1.5 bg-[#0F1720]/80 p-2 rounded-lg border border-[#4B5563]/15">
                    {sub.map((v, vIdx) => (
                      <div key={vIdx} className="w-8 h-8 bg-[#1B2838] border border-[#FD802E]/40 text-[#FD802E] font-bold rounded flex items-center justify-center text-[10px]">
                        {v}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Operations controls input */}
          <div className="p-3 bg-[#0F1720]/60 border border-[#4B5563]/25 rounded-lg flex items-center gap-4">
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider font-sans flex-shrink-0">Custom Array:</span>
            <input 
              type="text" 
              value={sortInput}
              onChange={(e) => setSortInput(e.target.value)}
              className="flex-1 bg-[#0F1720] border border-[#4B5563]/30 text-[#F8FAFC] px-2 py-1.5 rounded outline-none font-mono"
            />
            <button 
              onClick={fetchAlgorithmDetails}
              className="px-3 py-1.5 bg-[#FD802E] hover:bg-[#FF9C4A] text-[#F8FAFC] rounded font-bold uppercase text-[9px] flex-shrink-0"
            >
              Reload Array
            </button>
          </div>
        </div>
      );
    }

    if (activeAlgo.id === 'quick_sort') {
      const activeArray = activeFrame.array || [];
      const pivotIdx = activeFrame.pivotIdx ?? -1;
      const leftIdx = activeFrame.leftIdx ?? -1;
      const rightIdx = activeFrame.rightIdx ?? -1;
      return (
        <div className="flex-1 flex flex-col justify-between h-full space-y-6">
          <div className="flex-1 flex items-end justify-center gap-3 p-4 min-h-[160px]">
            {activeArray.map((val, idx) => {
              const heightPercent = Math.min(100, Math.max(15, (val / Math.max(...activeArray, 1)) * 100));
              let color = 'bg-[#233D4C] border-[#4B5563]/30 text-[#CBD5E1]';
              if (idx === pivotIdx) color = 'bg-[#FD802E]/30 border-[#FD802E] text-[#FD802E] shadow-[0_0_8px_rgba(253,128,46,0.2)] font-bold';
              else if (idx === leftIdx || idx === rightIdx) color = 'bg-[#EF4444]/30 border-[#EF4444] text-[#EF4444] font-bold';
              
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <div 
                    style={{ height: `${heightPercent}px` }} 
                    className={`w-8 rounded-t transition-all ${color} border flex items-end justify-center pb-1 text-[9px] font-mono`}
                  >
                    {val}
                  </div>
                  <span className="text-[8px] font-mono text-[#94A3B8]">idx {idx}</span>
                </div>
              );
            })}
          </div>
          
          <div className="p-3 bg-[#0F1720]/60 border border-[#4B5563]/25 rounded-lg flex items-center gap-4">
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider font-sans flex-shrink-0">Custom Array:</span>
            <input 
              type="text" 
              value={sortInput}
              onChange={(e) => setSortInput(e.target.value)}
              className="flex-1 bg-[#0F1720] border border-[#4B5563]/30 text-[#F8FAFC] px-2 py-1.5 rounded outline-none font-mono"
            />
            <button 
              onClick={fetchAlgorithmDetails}
              className="px-3 py-1.5 bg-[#FD802E] hover:bg-[#FF9C4A] text-[#F8FAFC] rounded font-bold uppercase text-[9px] flex-shrink-0"
            >
              Reload Array
            </button>
          </div>
        </div>
      );
    }

    if (activeAlgo.id === 'matrix_chain') {
      const matrix = activeFrame.costMatrix || {};
      const currentSplit = activeFrame.currentSplit; // [i, k, j]
      return (
        <div className="flex-1 flex flex-col justify-between h-full space-y-6">
          <div className="flex-1 flex justify-center items-center p-4">
            {Object.keys(matrix).length > 0 ? (
              <div className="bg-[#0F1720]/40 p-4 border border-[#4B5563]/25 rounded-lg max-h-[190px] overflow-y-auto w-full max-w-sm">
                <table className="w-full text-left text-[9px] border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-[#4B5563]/20 pb-1">
                      <th className="text-[#94A3B8] pb-1">Matrix</th>
                      {Object.keys(matrix).map(k => <th key={k} className="text-[#CBD5E1] font-bold pb-1">{k}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(matrix).map(([rowKey, cols], rIdx) => (
                      <tr key={rowKey} className="border-b border-[#4B5563]/5">
                        <td className="font-bold text-[#CBD5E1] py-1.5">{rowKey}</td>
                        {Object.entries(cols).map(([colKey, val], cIdx) => {
                          const isHighlighted = currentSplit && 
                            (rIdx + 1 === currentSplit[0] && cIdx + 1 === currentSplit[2]);
                            
                          return (
                            <td 
                              key={colKey} 
                              className={`py-1.5 font-bold transition-all ${
                                isHighlighted 
                                  ? 'text-[#FD802E] bg-[#FD802E]/10 rounded'
                                  : 'text-cyan-400'
                              }`}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <span className="text-[#94A3B8] italic">No DP table data</span>}
          </div>
          
          <div className="p-3 bg-[#0F1720]/60 border border-[#4B5563]/25 rounded-lg flex items-center gap-4">
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider font-sans flex-shrink-0">Dimensions:</span>
            <input 
              type="text" 
              value={matrixDimsInput}
              onChange={(e) => setMatrixDimsInput(e.target.value)}
              className="flex-1 bg-[#0F1720] border border-[#4B5563]/30 text-[#F8FAFC] px-2 py-1.5 rounded outline-none font-mono"
            />
            <button 
              onClick={fetchAlgorithmDetails}
              className="px-3 py-1.5 bg-[#FD802E] hover:bg-[#FF9C4A] text-[#F8FAFC] rounded font-bold uppercase text-[9px] flex-shrink-0"
            >
              Reload Dims
            </button>
          </div>
        </div>
      );
    }

    if (activeAlgo.id === 'strassen') {
      const activeProducts = activeFrame.products || {};
      const matrixC = activeFrame.matrixC || [];
      return (
        <div className="flex-1 flex flex-col justify-between h-full space-y-4">
          <div className="flex-1 grid grid-cols-2 gap-4 p-4 items-center">
            
            {/* Strassen algebraic products list */}
            <div className="bg-[#0F1720]/40 p-3 border border-[#4B5563]/25 rounded-lg h-full overflow-y-auto space-y-1.5 font-mono text-[9px]">
              <span className="text-[#FD802E] font-bold block mb-1 uppercase text-[8px] tracking-wider">Sub-products (M1-M7):</span>
              {['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'].map(m => (
                <div key={m} className="flex justify-between border-b border-[#4B5563]/5 pb-0.5">
                  <span className="text-[#CBD5E1]">{m}:</span>
                  <span className="font-bold text-cyan-400">{activeProducts[m] !== undefined ? activeProducts[m] : 'Pending'}</span>
                </div>
              ))}
            </div>

            {/* Combined result matrix */}
            <div className="flex flex-col items-center justify-center bg-[#0F1720]/20 p-3 rounded-lg border border-[#4B5563]/15">
              <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider mb-3">Result Matrix C (2x2)</span>
              {matrixC.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 w-28 h-28 font-mono">
                  {matrixC.map((row, rIdx) => 
                    row.map((val, cIdx) => (
                      <div key={`${rIdx}-${cIdx}`} className="bg-[#233D4C] border border-[#3B82F6]/30 text-cyan-400 font-bold rounded-lg flex items-center justify-center text-xs shadow-md">
                        {val}
                      </div>
                    ))
                  )}
                </div>
              ) : <div className="w-28 h-28 border border-dashed border-[#4B5563]/30 rounded-lg flex items-center justify-center text-[9px] text-[#94A3B8] italic">Multiplying...</div>}
            </div>

          </div>
        </div>
      );
    }

    if (activeAlgo.id === 'nqueens') {
      const activeBoard = activeFrame.board || [];
      const currentRow = activeFrame.currentRow ?? -1;
      const currentCol = activeFrame.currentCol ?? -1;
      const isConflict = activeFrame.conflict ?? false;
      const size = activeBoard.length || 4;
      
      return (
        <div className="flex-1 flex flex-col justify-between h-full space-y-4">
          <div className="flex-1 flex justify-center items-center p-4">
            <div 
              style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
              className="grid gap-0.5 bg-[#4B5563]/20 p-1 rounded-lg border border-[#4B5563]/35 shadow-2xl"
            >
              {activeBoard.map((row, rIdx) => 
                row.map((cell, cIdx) => {
                  const isBlack = (rIdx + cIdx) % 2 === 1;
                  const hasQueen = cell === 1;
                  const isCurrentProbe = rIdx === currentRow && cIdx === currentCol;
                  
                  let cellBg = isBlack ? 'bg-[#1B2838]' : 'bg-[#233D4C]';
                  let border = 'border border-[#4B5563]/10';
                  
                  if (isCurrentProbe) {
                    cellBg = isConflict ? 'bg-[#EF4444]/30 animate-pulse' : 'bg-[#FD802E]/30';
                    border = isConflict ? 'border-2 border-[#EF4444]' : 'border-2 border-[#FD802E]';
                  }

                  return (
                    <div 
                      key={`${rIdx}-${cIdx}`} 
                      className={`w-8 h-8 flex items-center justify-center rounded transition-all duration-150 ${cellBg} ${border}`}
                    >
                      {hasQueen && (
                        <span className={`text-sm ${isCurrentProbe && isConflict ? 'text-[#EF4444]' : 'text-amber-400'} animate-bounce`}>
                          👑
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          <div className="p-3 bg-[#0F1720]/60 border border-[#4B5563]/25 rounded-lg flex items-center justify-between">
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider font-sans">Chess Board Dimension (N):</span>
            <div className="flex gap-2 font-sans text-[10px]">
              {[4, 8].map(sz => (
                <button
                  key={sz}
                  onClick={() => {
                    setQueensSize(sz);
                    // trigger refresh
                    setTimeout(() => fetchAlgorithmDetails(), 50);
                  }}
                  className={`px-3 py-1 rounded border transition-colors ${
                    queensSize === sz
                      ? 'bg-[#FD802E] text-[#F8FAFC] border-[#FD802E]'
                      : 'bg-[#0F1720] text-[#CBD5E1] border-[#4B5563]/30 hover:border-[#FD802E]/30'
                  }`}
                >
                  {sz} x {sz}
                </button>
              ))}
            </div>
          </div>
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
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Visualizer player canvas */}
        <div className="flex-1 flex flex-col overflow-hidden relative border-r border-[#4B5563]/20">
          {/* Simulation Header controls */}
          {timeline.length > 0 && (
            <div className="h-12 bg-[#233D4C]/60 backdrop-blur-md border-b border-[#4B5563]/20 flex items-center justify-between px-6 z-10 flex-shrink-0 select-none">
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevStep}
                  disabled={currentFrame === 0}
                  className="p-1.5 rounded bg-[#1B2838] border border-[#4B5563]/25 text-[#CBD5E1] hover:text-[#FD802E] disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <button
                  onClick={handlePlayPause}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#1B2838] border border-[#4B5563]/25 text-[#F8FAFC] hover:text-[#FD802E] rounded-lg transition-colors font-semibold"
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5 text-[#FD802E]" /> : <Play className="h-3.5 w-3.5 text-[#22C55E]" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  onClick={handleNextStep}
                  disabled={currentFrame === timeline.length - 1}
                  className="p-1.5 rounded bg-[#1B2838] border border-[#4B5563]/25 text-[#CBD5E1] hover:text-[#FD802E] disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={handleReset}
                  className="p-1.5 rounded bg-[#1B2838] border border-[#4B5563]/25 text-[#CBD5E1] hover:text-[#EF4444] transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              {/* Progress slider track */}
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

              {/* Speed controls */}
              <div className="flex items-center gap-1.5 bg-[#1B2838] px-2.5 py-1 rounded-lg border border-[#4B5563]/25">
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
          )}

          {/* Render Active visualizer */}
          <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
            {renderVisualizerContent()}
          </div>
          
          {/* Active step trace action log (bottom sheet log) */}
          {timeline.length > 0 && (
            <div className="h-16 bg-[#233D4C]/40 border-t border-[#4B5563]/25 px-6 flex items-center justify-between text-xs font-mono text-[#F8FAFC] flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FD802E] animate-pulse"></span>
                <span>{activeFrame.action}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Complexities and Pseudocode textbook panels */}
        <div className="w-96 bg-[#233D4C]/35 h-full flex flex-col overflow-y-auto p-6 space-y-6 flex-shrink-0 select-none text-xs">
          
          {/* Description header */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wide border-b border-[#4B5563]/10 pb-2 flex justify-between">
              <span>{activeAlgo.name}</span>
              <span className="text-[9px] bg-[#FD802E]/20 text-[#FD802E] px-2 py-0.5 rounded uppercase font-bold tracking-wider font-mono">
                {activeAlgo.category}
              </span>
            </h3>
            <p className="text-[#CBD5E1] leading-relaxed text-sans">{activeAlgo.desc}</p>
          </div>

          {/* Complexity telemetry cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#233D4C] p-3 rounded-lg border border-[#4B5563]/25 text-center">
              <span className="text-[9px] uppercase tracking-widest text-[#94A3B8] block font-bold font-sans">Time Complexity</span>
              <span className="text-sm font-black text-[#22C55E] mt-1 block font-mono">{activeAlgo.complexity.time}</span>
            </div>
            <div className="bg-[#233D4C] p-3 rounded-lg border border-[#4B5563]/25 text-center">
              <span className="text-[9px] uppercase tracking-widest text-[#94A3B8] block font-bold font-sans">Space Complexity</span>
              <span className="text-sm font-black text-[#22C55E] mt-1 block font-mono">{activeAlgo.complexity.space}</span>
            </div>
          </div>

          {/* Tracing details Log / Pseudocode card */}
          {(activeAlgo.pseudo || (learning && learning.pseudoCode)) && (
            <div className="flex-1 flex flex-col overflow-hidden border border-[#4B5563]/25 rounded-lg bg-[#0F1720]/40">
              <div className="bg-[#1B2838] px-3 py-1.5 border-b border-[#4B5563]/25 text-[10px] font-bold text-[#FD802E] uppercase tracking-wider flex items-center gap-1.5 font-sans flex-shrink-0">
                <Code2 className="h-4 w-4" />
                Algorithm Pseudocode
              </div>
              <div className="flex-1 overflow-y-auto p-3 font-mono text-[9px] text-[#CBD5E1] space-y-0.5 leading-normal">
                {(activeAlgo.pseudo || learning.pseudoCode).map((line, idx) => {
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
          )}

        </div>

      </div>
    </div>
  );
}
