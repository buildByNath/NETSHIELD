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

// Categorized directory of all 12 graph algorithms
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
    desc: "Finds the shortest inspection route visiting a list of devices once and returning to start using backtracking search." }
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

  const renderDataStructureVisualizer = () => {
    if (!activeFrame) return null;
    const rawQueue = activeFrame.queue || [];
    const activeNode = activeFrame.currentNode;

    const formatLabel = (item) => {
      if (typeof item === 'string') return item;
      return item.node || item.id || JSON.stringify(item);
    };

    switch (activeAlgo.id) {
      case 'bfs': {
        const displayQueue = [...rawQueue];
        if (activeNode) {
          const rawQueueLabels = rawQueue.map(item => formatLabel(item));
          if (!rawQueueLabels.includes(activeNode)) {
            displayQueue.unshift(activeNode);
          }
        }
        const maxQ = timeline.reduce((max, f) => Math.max(max, (f.queue || []).length), 0) + 1;

        return (
          <div className="p-4 bg-[#1B2838]/80 border border-[#4B5563]/30 rounded-xl flex flex-col gap-3 font-sans select-none animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-[#4B5563]/25 pb-1.5">
              <span className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-black">FIFO Queue (Breadth-First Search)</span>
              <span className="text-[9px] bg-[#22C55E]/15 text-[#22C55E] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider border border-[#22C55E]/20">FIFO</span>
            </div>
            
            <div className="flex items-center justify-between text-[9px] text-[#94A3B8] px-1 font-mono">
              <span className="flex items-center gap-1 font-bold text-emerald-400">FRONT ↓</span>
              <span className="flex items-center gap-1 font-bold text-amber-500">↑ REAR</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto min-h-[44px] py-1 border border-[#4B5563]/10 bg-[#0F1720]/40 rounded-lg px-3">
              {displayQueue.length > 0 ? (
                displayQueue.map((item, idx) => {
                  const label = formatLabel(item);
                  const isActive = label === activeNode;
                  return (
                    <div key={idx} className="flex items-center gap-1.5 flex-shrink-0">
                      <span 
                        className={`px-3 py-1.5 rounded font-mono text-[9px] font-bold shadow-md flex-shrink-0 transition-all ${
                          isActive 
                            ? 'bg-[#EF4444]/25 border-2 border-[#EF4444] text-[#EF4444] animate-pulse' 
                            : 'bg-[#1B2838] border border-[#FD802E]/35 text-[#FD802E]'
                        }`}
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
                <span className="text-[10px] text-[#94A3B8] italic">Queue is empty.</span>
              )}
            </div>

            <div className="flex justify-between items-center text-[9px] text-[#94A3B8] font-mono border-t border-[#4B5563]/10 pt-2">
              <span>Queue Size: <strong className="text-[#22C55E]">{displayQueue.length}</strong></span>
              <span>Max Queue Size: <strong className="text-[#FD802E]">{maxQ}</strong></span>
            </div>
          </div>
        );
      }

      case 'dfs': {
        const displayStack = [...(activeFrame.stack || [])];
        if (activeNode && !displayStack.includes(activeNode)) {
          displayStack.push(activeNode);
        }

        return (
          <div className="p-4 bg-[#1B2838]/80 border border-[#4B5563]/30 rounded-xl flex flex-col gap-3 font-sans select-none animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-[#4B5563]/25 pb-1.5">
              <span className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-black">LIFO Stack (Depth-First Search)</span>
              <span className="text-[9px] bg-[#3B82F6]/15 text-[#3B82F6] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider border border-[#3B82F6]/20">LIFO</span>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 flex flex-col items-center bg-[#0F1720]/40 border border-[#4B5563]/10 rounded-lg p-3 max-h-[140px] overflow-y-auto">
                {displayStack.length > 0 ? (
                  <div className="flex flex-col-reverse gap-1.5 w-full max-w-[160px]">
                    {displayStack.map((item, idx) => {
                      const label = formatLabel(item);
                      const isTop = idx === displayStack.length - 1;
                      const isActive = label === activeNode && isTop;
                      
                      return (
                        <div 
                          key={idx} 
                          className={`px-3 py-1.5 rounded font-mono text-[9px] font-bold text-center border shadow transition-all ${
                            isActive
                              ? 'bg-[#EF4444]/25 border-[#EF4444] text-[#EF4444] animate-pulse'
                              : isTop
                              ? 'bg-[#FD802E]/25 border-[#FD802E] text-[#FD802E]'
                              : 'bg-[#1B2838] border-[#4B5563]/35 text-[#CBD5E1]'
                          }`}
                        >
                          {isTop ? 'TOP ↓ ' : ''}{label}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-[10px] text-[#94A3B8] italic my-4">Stack is empty.</span>
                )}
              </div>

              <div className="w-36 flex flex-col justify-center text-[9.5px] font-mono text-[#94A3B8] space-y-2 border-l border-[#4B5563]/15 pl-4">
                <div>Stack Size: <strong className="text-[#3B82F6]">{displayStack.length}</strong></div>
                <div className="text-[8px] leading-relaxed">
                  DFS runs recursively by pushing neighbors onto a LIFO stack to probe deeply before backtracking.
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'dijkstra': {
        const distances = activeFrame.distances || {};
        const prevFrame = timeline[currentFrame - 1] || {};
        const prevDistances = prevFrame.distances || {};

        return (
          <div className="p-4 bg-[#1B2838]/80 border border-[#4B5563]/30 rounded-xl flex flex-col gap-3 font-sans select-none animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-[#4B5563]/25 pb-1.5">
              <span className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-black">Dijkstra Distance Estimator</span>
              <span className="text-[9px] bg-amber-500/15 text-amber-500 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider border border-amber-500/20">RELAX</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-widest text-[#94A3B8] font-bold">Min Priority Queue</span>
                <div className="bg-[#0F1720]/40 border border-[#4B5563]/15 rounded-lg p-2 max-h-[110px] overflow-y-auto space-y-1 font-mono text-[9px]">
                  {rawQueue.length > 0 ? (
                    rawQueue.map((item, idx) => (
                      <div key={idx} className="flex justify-between border-b border-[#4B5563]/5 pb-0.5 px-1">
                        <span className="text-[#FD802E]">{item.split(' ')[0]}</span>
                        <span className="text-cyan-400 font-bold">{item.split(' (d=')[1]?.replace(')', '') || '0'}</span>
                      </div>
                    ))
                  ) : <span className="text-[#94A3B8] italic block text-center py-4">PQ is empty</span>}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-widest text-[#94A3B8] font-bold">Distance Estimates Table</span>
                <div className="bg-[#0F1720]/40 border border-[#4B5563]/15 rounded-lg p-2 max-h-[110px] overflow-y-auto space-y-1 font-mono text-[9px]">
                  {Object.entries(distances).map(([nodeId, val]) => {
                    const prevVal = prevDistances[nodeId];
                    const wasRelaxed = prevVal !== undefined && prevVal !== val;
                    return (
                      <div key={nodeId} className={`flex justify-between border-b border-[#4B5563]/5 pb-0.5 px-1 rounded ${wasRelaxed ? 'bg-[#22C55E]/15 border border-[#22C55E]/30' : ''}`}>
                        <span className="text-[#CBD5E1]">{nodeId}</span>
                        <span className="font-bold text-cyan-400">
                          {wasRelaxed ? `${prevVal} → ${val}` : val}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'prim': {
        const mstWeight = activeFrame.mstWeight ?? 0;
        return (
          <div className="p-4 bg-[#1B2838]/80 border border-[#4B5563]/30 rounded-xl flex flex-col gap-3 font-sans select-none animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-[#4B5563]/25 pb-1.5">
              <span className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-black">Prim's Candidate Edges & MST</span>
              <span className="text-[9px] bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider border border-indigo-500/20">MST</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-widest text-[#94A3B8] font-bold">Candidate Edges Queue</span>
                <div className="bg-[#0F1720]/40 border border-[#4B5563]/15 rounded-lg p-2 max-h-[110px] overflow-y-auto space-y-1.5 font-mono text-[9px]">
                  {rawQueue.length > 0 ? (
                    rawQueue.map((item, idx) => {
                      const isMin = idx === 0;
                      return (
                        <div key={idx} className={`flex justify-between border-b border-[#4B5563]/5 pb-0.5 px-1 rounded ${isMin ? 'bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] font-bold' : 'text-[#CBD5E1]'}`}>
                          <span>{item.split(' ')[0]}</span>
                          <span className="text-cyan-400">{item.split(' (w=')[1]?.replace(')', '') || ''}</span>
                        </div>
                      );
                    })
                  ) : <span className="text-[#94A3B8] italic block text-center py-4">No candidates</span>}
                </div>
              </div>

              <div className="flex flex-col justify-center gap-3 pl-4 border-l border-[#4B5563]/15 text-[10px] font-mono text-[#94A3B8]">
                <div>Current MST Weight: <strong className="text-[#22C55E]">{mstWeight}</strong></div>
                <div className="text-[8.5px] leading-relaxed">Adjacent candidates are sorted. At each step, Prim's selects the minimum weight candidate edge to grow the tree.</div>
              </div>
            </div>
          </div>
        );
      }

      case 'kruskal': {
        const mstWeight = activeFrame.mstWeight ?? 0;
        const parents = activeFrame.parentArray || {};
        return (
          <div className="p-4 bg-[#1B2838]/80 border border-[#4B5563]/30 rounded-xl flex flex-col gap-3 font-sans select-none animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-[#4B5563]/25 pb-1.5">
              <span className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-black">Kruskal Sorted Edges & Union-Find</span>
              <span className="text-[9px] bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider border border-indigo-500/20">MST</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-widest text-[#94A3B8] font-bold">Sorted Edges (Remaining)</span>
                <div className="bg-[#0F1720]/40 border border-[#4B5563]/15 rounded-lg p-2 max-h-[110px] overflow-y-auto space-y-1 font-mono text-[9px]">
                  {rawQueue.length > 0 ? (
                    rawQueue.map((item, idx) => (
                      <div key={idx} className="flex justify-between border-b border-[#4B5563]/5 pb-0.5 px-1 text-[#CBD5E1]">
                        <span>{item.split(' ')[0]}</span>
                        <span className="text-cyan-400">{item.split(' (w=')[1]?.replace(')', '') || ''}</span>
                      </div>
                    ))
                  ) : <span className="text-[#94A3B8] italic block text-center py-4">No sorted edges left</span>}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[9px] uppercase tracking-widest text-[#94A3B8] font-bold">
                  <span>Union-Find Representatives</span>
                  <span className="text-amber-500">MST Cost: {mstWeight}</span>
                </div>
                <div className="bg-[#0F1720]/40 border border-[#4B5563]/15 rounded-lg p-2 max-h-[110px] overflow-y-auto space-y-1 font-mono text-[9px]">
                  {Object.entries(parents).map(([nodeId, parentId]) => (
                    <div key={nodeId} className="flex justify-between border-b border-[#4B5563]/5 pb-0.5 px-1 text-[#CBD5E1]">
                      <span>{nodeId}</span>
                      <span>→ <strong className="text-amber-500">{parentId}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }

      default: {
        return (
          <div className="p-4 bg-[#1B2838]/80 border border-[#4B5563]/30 rounded-xl flex flex-col gap-3 font-sans select-none animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-[#4B5563]/25 pb-1.5">
              <span className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-black">Active Data Structure</span>
              <span className="text-[9px] bg-[#3B82F6]/15 text-[#3B82F6] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider border border-[#3B82F6]/20">DATA</span>
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto min-h-[32px] py-1 border border-[#4B5563]/10 bg-[#0F1720]/40 rounded-lg px-3">
              {rawQueue.length > 0 ? (
                rawQueue.map((item, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-[#1B2838] border border-[#FD802E]/35 text-[#FD802E] rounded font-mono text-[9px] font-bold shadow-md flex-shrink-0">
                    {formatLabel(item)}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-[#94A3B8] italic">No active structural states.</span>
              )}
            </div>
          </div>
        );
      }
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
          
        </div>

        {/* Right Column: Complexities, Pseudocode, and What Happened step list */}
        <div className="w-96 bg-[#233D4C]/35 h-full flex flex-col overflow-hidden p-6 space-y-6 flex-shrink-0 select-none text-xs border-l border-[#4B5563]/30">
          
          {/* Tabs for Study Guide vs Live History */}
          <div className="flex gap-2 border-b border-[#4B5563]/15 pb-2 flex-shrink-0">
            <button
              onClick={() => setRightPanelTab('guide')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors ${
                rightPanelTab === 'guide'
                  ? 'bg-[#FD802E] text-[#0F1720]'
                  : 'bg-[#1B2838] text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              Study Guide
            </button>
            <button
              onClick={() => setRightPanelTab('history')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors ${
                rightPanelTab === 'history'
                  ? 'bg-[#FD802E] text-[#0F1720]'
                  : 'bg-[#1B2838] text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              What Happened?
            </button>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {rightPanelTab === 'guide' ? (
              <div className="flex-1 flex flex-col overflow-y-auto space-y-6">
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
                <div className="grid grid-cols-2 gap-4 flex-shrink-0">
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
                  <div className="flex-1 flex flex-col overflow-hidden border border-[#4B5563]/25 rounded-lg bg-[#0F1720]/40 min-h-[220px]">
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
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden min-h-0 space-y-3">
                {/* Replay Controls & History Header */}
                <div className="flex items-center justify-between border-b border-[#4B5563]/15 pb-2 flex-shrink-0">
                  <span className="text-[10px] font-bold uppercase text-[#94A3B8]">Execution Replay</span>
                  <button
                    onClick={() => {
                      setIsPlaying(true);
                      setSimulationStatus('running');
                    }}
                    className="text-[9px] bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 px-2 py-0.5 rounded font-mono font-bold hover:bg-[#22C55E]/30 transition-all"
                  >
                    Return to Live Play
                  </button>
                </div>

                {/* History cards list */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-3">
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
                          className={`p-3 bg-[#1B2838]/60 border rounded-lg cursor-pointer transition-all ${
                            isActive 
                              ? 'border-[#FD802E] bg-[#FD802E]/10 shadow-[0_0_8px_rgba(253,128,46,0.15)]' 
                              : 'border-[#4B5563]/25 hover:border-[#FD802E]/35'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-bold text-[#FD802E] uppercase font-mono">Step {idx + 1}</span>
                            {isActive && (
                              <span className="text-[8px] bg-[#FD802E]/20 text-[#FD802E] px-1 rounded uppercase font-bold tracking-wider font-mono">Active</span>
                            )}
                          </div>
                          
                          <p className="text-[9.5px] text-[#F8FAFC] leading-relaxed mb-2 font-mono">{frame.action}</p>
                          
                          {/* Render step card before/after data structure snapshot */}
                          {renderHistoryCardSnapshot(frame, prevFrame)}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-[#94A3B8] italic">No active timeline history to trace.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
