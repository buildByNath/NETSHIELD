import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';

import { 
  Play, Pause, RotateCcw, ChevronRight, ChevronLeft, ShieldCheck, 
  Settings, Layers, Clock, ShieldAlert, Cpu, Heart, CheckSquare
} from 'lucide-react';

import CustomNode from '../components/network/CustomNode';
import CustomEdge from '../components/network/CustomEdge';
import { projectService, algorithmService } from '../services/api';

/**
 * File: RecoveryPlanner.jsx
 * Author: Antigravity AI
 * Purpose: Interactive recovery planner running 10 core path optimization algorithms.
 */

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

const SPEED_LEVELS = [
  { value: 0.25, label: '0.25x (2s)' },
  { value: 0.5, label: '0.5x (1s)' },
  { value: 1.0, label: '1.0x (0.5s)' },
  { value: 2.0, label: '2.0x (0.25s)' },
  { value: 5.0, label: '5.0x (0.1s)' }
];

function RecoveryWorkspace() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Recovery Parameters
  const [selectedAlgo, setSelectedAlgo] = useState('dijkstra');
  const [sourceNode, setSourceNode] = useState('');
  const [destNode, setDestNode] = useState('');
  const [budget, setBudget] = useState(100);
  
  // Simulation results
  const [timeline, setTimeline] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [learning, setLearning] = useState({});
  const [finalResult, setFinalResult] = useState({});
  
  // Playback Control States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [plannerStatus, setPlannerStatus] = useState('idle'); // 'idle' | 'loading' | 'running' | 'paused' | 'completed'
  const [errorMsg, setErrorMsg] = useState('');
  
  // Original graph store
  const originalGraph = useRef({ nodes: [], edges: [] });
  const playbackInterval = useRef(null);

  // Load the network graph
  useEffect(() => {
    const loadGraph = async () => {
      setPlannerStatus('loading');
      try {
        let loadedNodes = [];
        let loadedEdges = [];
        
        // Local storage autosave draft
        const draftStr = localStorage.getItem('netshield_autosave');
        if (draftStr) {
          const draft = JSON.parse(draftStr);
          loadedNodes = draft.nodes || [];
          loadedEdges = draft.edges || [];
        } else {
          // Backend project load
          const response = await projectService.loadProject();
          if (response.success && response.project && response.project.network) {
            const net = response.project.network;
            loadedNodes = (net.nodes || []).map(n => ({
              id: n.id,
              type: n.type,
              position: n.position,
              data: { label: n.label, status: n.status || 'healthy' }
            }));
            
            loadedEdges = (net.edges || []).map(e => ({
              id: `e-${e.source}-${e.target}`,
              source: e.source,
              target: e.target,
              type: 'customEdge',
              data: { weight: e.weight, latency: e.latency, bandwidth: e.bandwidth }
            }));
          }
        }

        // Set initial nodes as compromised/infected so we can recover them to blue!
        // This is a great visual effect: recovering an infected network!
        const infectedNodes = loadedNodes.map(n => ({
          ...n,
          data: { ...n.data, status: 'infected' } // start all infected so recovery works visually
        }));
        
        const formattedEdges = loadedEdges.map(e => ({
          ...e,
          type: 'customEdge',
          data: { ...e.data, isSimulation: false, isRecovery: false }
        }));

        setNodes(infectedNodes);
        setEdges(formattedEdges);
        originalGraph.current = { nodes: infectedNodes, edges: formattedEdges };
        setPlannerStatus('idle');
      } catch (err) {
        console.error('Failed to load recovery graph', err);
        setErrorMsg('Failed to initialize active graph topology.');
        setPlannerStatus('idle');
      }
    };
    
    loadGraph();
  }, [setNodes, setEdges]);

  // Click node handler to configure source/destination options
  const onNodeClick = useCallback((event, node) => {
    if (plannerStatus === 'running' || plannerStatus === 'paused' || plannerStatus === 'completed') return;
    setErrorMsg('');

    const requiresSource = ['dijkstra', 'prim', 'tsp'].includes(selectedAlgo);
    const requiresDest = ['dijkstra'].includes(selectedAlgo);

    if (requiresDest) {
      if (!sourceNode) {
        setSourceNode(node.id);
      } else if (sourceNode === node.id) {
        setSourceNode('');
      } else if (!destNode) {
        setDestNode(node.id);
      } else if (destNode === node.id) {
        setDestNode('');
      } else {
        // Reset both and set source
        setSourceNode(node.id);
        setDestNode('');
      }
    } else if (requiresSource) {
      if (sourceNode === node.id) {
        setSourceNode('');
      } else {
        setSourceNode(node.id);
      }
    }
  }, [selectedAlgo, sourceNode, destNode, plannerStatus]);

  // Visual selection borders for source/destination nodes
  useEffect(() => {
    setNodes(nds => nds.map(n => {
      const isSrc = n.id === sourceNode;
      const isDst = n.id === destNode;
      
      let status = 'infected'; // keep base as infected
      if (isSrc || isDst) {
        status = 'protected'; // gold highlight
      }

      return {
        ...n,
        data: {
          ...n.data,
          status
        }
      };
    }));
  }, [sourceNode, destNode, setNodes]);

  // Clear intervals on unmount
  useEffect(() => {
    return () => {
      if (playbackInterval.current) clearInterval(playbackInterval.current);
    };
  }, []);

  // Request recovery timeline computation
  const handleStartRecovery = async () => {
    const requiresSource = ['dijkstra', 'prim', 'tsp'].includes(selectedAlgo);
    const requiresDest = ['dijkstra'].includes(selectedAlgo);

    if (requiresSource && !sourceNode) {
      setErrorMsg('Choose a starting recovery node on the canvas.');
      return;
    }
    if (requiresDest && !destNode) {
      setErrorMsg('Choose a destination target node on the canvas.');
      return;
    }

    setPlannerStatus('loading');
    setErrorMsg('');
    try {
      const options = {
        source: sourceNode,
        destination: destNode,
        budget: parseFloat(budget)
      };

      const response = await algorithmService.recoverNetwork(
        selectedAlgo,
        originalGraph.current.nodes,
        originalGraph.current.edges,
        options
      );

      if (response.success && response.timeline) {
        setTimeline(response.timeline);
        setStatistics(response.statistics || {});
        setLearning(response.learning || {});
        setFinalResult(response.result || {});
        setCurrentFrame(0);
        setPlannerStatus('running');
        setIsPlaying(true);
      } else {
        setErrorMsg('Recovery computation failed.');
        setPlannerStatus('idle');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Recovery planner request failed.');
      setPlannerStatus('idle');
    }
  };

  // Playback loop
  useEffect(() => {
    if (playbackInterval.current) clearInterval(playbackInterval.current);

    if (isPlaying && plannerStatus === 'running' && timeline.length > 0) {
      const stepDuration = 500 / speed;
      
      playbackInterval.current = setInterval(() => {
        setCurrentFrame(prev => {
          if (prev >= timeline.length - 1) {
            clearInterval(playbackInterval.current);
            setIsPlaying(false);
            setPlannerStatus('completed');
            return prev;
          }
          return prev + 1;
        });
      }, stepDuration);
    }

    return () => {
      if (playbackInterval.current) clearInterval(playbackInterval.current);
    };
  }, [isPlaying, plannerStatus, timeline, speed]);

  // Animate nodes and edges based on the current frame
  const applyFrameState = useCallback((frameIndex) => {
    if (timeline.length === 0 || frameIndex >= timeline.length) return;
    const frame = timeline[frameIndex];
    const visitedSet = new Set(frame.visited || []);
    const activeNode = frame.currentNode;
    const activeEdge = frame.currentEdge;

    // 1. Recover nodes: visited nodes become blue ('recovered'), active node glows, source/destination keep highlight
    setNodes(nds => nds.map(n => {
      let status = 'infected';
      if (visitedSet.has(n.id)) status = 'recovered';
      if (activeNode === n.id) status = 'recovered';
      
      // Override for selected options
      const isSrc = n.id === sourceNode;
      const isDst = n.id === destNode;
      if ((isSrc || isDst) && status !== 'recovered') {
        status = 'protected';
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

    // 2. Recover edges: highlight active edge with isRecovery=true (pulses blue)
    setEdges(eds => eds.map(e => {
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
  }, [timeline, sourceNode, destNode, setNodes, setEdges]);

  // Apply frame changes
  useEffect(() => {
    if (timeline.length > 0) {
      applyFrameState(currentFrame);
    }
  }, [currentFrame, timeline, applyFrameState]);

  // Playback Control Button Functions
  const handlePlayPause = () => {
    if (plannerStatus === 'idle') {
      handleStartRecovery();
    } else if (plannerStatus === 'completed') {
      setCurrentFrame(0);
      setPlannerStatus('running');
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
      setPlannerStatus(isPlaying ? 'paused' : 'running');
    }
  };

  const handleReset = () => {
    if (playbackInterval.current) clearInterval(playbackInterval.current);
    setIsPlaying(false);
    setCurrentFrame(0);
    setTimeline([]);
    setSourceNode('');
    setDestNode('');
    setStatistics({});
    setLearning({});
    setFinalResult({});
    setErrorMsg('');
    setPlannerStatus('idle');
    
    // Reset canvas to original state (infected red colors)
    setNodes(originalGraph.current.nodes);
    setEdges(originalGraph.current.edges);
    if (reactFlowInstance) reactFlowInstance.fitView({ duration: 500 });
  };

  const handleNextStep = () => {
    if (timeline.length === 0) return;
    setIsPlaying(false);
    setPlannerStatus('paused');
    setCurrentFrame(prev => Math.min(prev + 1, timeline.length - 1));
  };

  const handlePrevStep = () => {
    if (timeline.length === 0) return;
    setIsPlaying(false);
    setPlannerStatus('paused');
    setCurrentFrame(prev => Math.max(prev - 1, 0));
  };

  const activeFrameData = timeline[currentFrame] || { visited: [], queue: [], stack: [], action: 'Planner idle. Click play to begin recovery.' };

  return (
    <div className="flex-1 flex overflow-hidden h-full bg-[#0F1720]">
      {/* Sidebar: Controls, parameters, and variable logging */}
      <div className="w-80 bg-[#233D4C] border-r border-[#4B5563]/30 h-full flex flex-col select-none flex-shrink-0 text-xs font-sans">
        
        <div className="p-4 border-b border-[#4B5563]/25 bg-[#1B2838]/40 space-y-4">
          <h2 className="text-sm font-bold text-[#FD802E] tracking-wider uppercase flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#3B82F6] animate-pulse" />
            Recovery Planner
          </h2>

          {/* Algorithm selector */}
          <div className="space-y-1">
            <label className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Choose Planner Algorithm</label>
            <select
              value={selectedAlgo}
              onChange={(e) => {
                setSelectedAlgo(e.target.value);
                handleReset();
              }}
              disabled={plannerStatus !== 'idle'}
              className="w-full bg-[#0F1720] border border-[#4B5563]/30 hover:border-[#FD802E]/30 text-[#F8FAFC] px-2 py-2 rounded-lg outline-none cursor-pointer transition-colors"
            >
              <option value="dijkstra">Dijkstra Shortest Path</option>
              <option value="prim">Prim's Spanning Tree</option>
              <option value="kruskal">Kruskal's Spanning Tree</option>
              <option value="floyd">Floyd-Warshall Routing</option>
              <option value="connected_components">Connected Components</option>
              <option value="union_find">Union-Find Operations</option>
              <option value="topological_sort">Topological Sort</option>
              <option value="fractional_knapsack">Fractional Knapsack</option>
              <option value="branch_bound">Branch & Bound 0/1 Knapsack</option>
              <option value="tsp">Traveling Salesman Tour</option>
            </select>
          </div>

          {/* Budget input field for Knapsack / Branch & Bound */}
          {['fractional_knapsack', 'branch_bound'].includes(selectedAlgo) && (
            <div className="space-y-1 animate-in fade-in duration-150">
              <label className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Recovery Budget (Max Cost)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value) || 10)}
                disabled={plannerStatus !== 'idle'}
                className="w-full bg-[#0F1720] border border-[#4B5563]/30 text-[#F8FAFC] px-3 py-2 rounded-lg outline-none font-mono"
              />
            </div>
          )}

          {/* Source and destination instructions */}
          {!['fractional_knapsack', 'branch_bound', 'connected_components', 'union_find', 'topological_sort', 'floyd', 'kruskal'].includes(selectedAlgo) && (
            <div className="bg-[#0F1720]/50 border border-[#4B5563]/20 rounded-lg p-3 space-y-1 text-[11px] text-[#CBD5E1]">
              <strong className="text-[#3B82F6]">Node Selection:</strong>
              <p className="text-[10px] text-[#94A3B8] leading-normal">
                {selectedAlgo === 'dijkstra' 
                  ? 'Click two nodes on the canvas to set recovery Source and Destination.'
                  : 'Click any node on the canvas to set the starting recovery point.'}
              </p>
              <div className="space-y-1.5 mt-2 font-mono text-[9px]">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Source:</span>
                  <span className={sourceNode ? 'text-[#3B82F6] font-bold' : 'text-[#EF4444]'}>{sourceNode || 'Not Selected'}</span>
                </div>
                {selectedAlgo === 'dijkstra' && (
                  <div className="flex justify-between">
                    <span className="text-[#94A3B8]">Destination:</span>
                    <span className={destNode ? 'text-[#3B82F6] font-bold' : 'text-[#EF4444]'}>{destNode || 'Not Selected'}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] rounded text-[10px] font-mono leading-normal">
              {errorMsg}
            </div>
          )}

          {/* Action button */}
          {plannerStatus === 'idle' && (
            <button
              onClick={handleStartRecovery}
              className="w-full py-2.5 bg-[#3B82F6] hover:bg-[#60A5FA] text-[#F8FAFC] font-bold rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition-colors uppercase"
            >
              <Play className="h-4 w-4" />
              Run Recovery Planner
            </button>
          )}
        </div>

        {/* Dynamic variable tracking structure dashboard */}
        {plannerStatus !== 'idle' && (
          <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-4">
            
            <div className="space-y-1">
              <label className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Active Action</label>
              <div className="bg-[#0F1720]/80 border border-[#4B5563]/30 rounded-lg p-3 text-[11px] font-mono text-[#F8FAFC] min-h-[44px] flex items-center leading-normal">
                {activeFrameData.action}
              </div>
            </div>

            {/* Display list based on selected algorithm */}
            <div className="flex-1 flex flex-col overflow-hidden space-y-1.5">
              <label className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Algorithm Variables</label>
              <div className="flex-1 bg-[#0F1720]/40 border border-[#4B5563]/25 rounded-lg p-3 overflow-y-auto space-y-2 font-mono text-[10px]">
                
                {/* Dijkstra / Prim priority queues */}
                {['dijkstra', 'prim'].includes(selectedAlgo) && activeFrameData.queue && (
                  <div className="space-y-1">
                    <span className="text-[#3B82F6] font-bold block">Priority Queue (Min Heap):</span>
                    {activeFrameData.queue.length > 0 ? (
                      <div className="flex flex-col gap-1 pt-1">
                        {activeFrameData.queue.map((item, idx) => (
                          <div key={idx} className="p-1.5 bg-[#0F1720] border border-[#4B5563]/15 rounded flex justify-between">
                            <span>{item}</span>
                            {idx === 0 && <span className="text-[#3B82F6] font-bold text-[8px] uppercase">Min</span>}
                          </div>
                        ))}
                      </div>
                    ) : <span className="text-[#94A3B8] italic">Empty Heap</span>}
                  </div>
                )}

                {/* Dijkstra distance tables */}
                {selectedAlgo === 'dijkstra' && activeFrameData.distances && (
                  <div className="space-y-1 pt-2 border-t border-[#4B5563]/10">
                    <span className="text-[#3B82F6] font-bold block">Distance Table:</span>
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {Object.entries(activeFrameData.distances).map(([k, v]) => (
                        <div key={k} className="flex justify-between border-b border-[#4B5563]/5 pb-0.5">
                          <span className="text-[#CBD5E1]">{k}:</span>
                          <span className="text-cyan-400 font-bold">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Union-Find / Kruskal parent arrays */}
                {['kruskal', 'union_find'].includes(selectedAlgo) && activeFrameData.parentArray && (
                  <div className="space-y-1">
                    <span className="text-[#3B82F6] font-bold block">Union-Find Parent Array:</span>
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {Object.entries(activeFrameData.parentArray).map(([k, v]) => (
                        <div key={k} className="flex justify-between border-b border-[#4B5563]/5 pb-0.5">
                          <span className="text-[#CBD5E1]">{k}</span>
                          <span className="text-emerald-400 font-bold">→ {v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Floyd-Warshall distance sub-matrix */}
                {selectedAlgo === 'floyd' && activeFrameData.matrix && (
                  <div className="space-y-1">
                    <span className="text-[#3B82F6] font-bold block">Floyd Distance Matrix (8x8):</span>
                    <div className="overflow-x-auto pt-1">
                      <table className="w-full text-left border-collapse text-[8px]">
                        <thead>
                          <tr>
                            <th className="border-b border-[#4B5563]/20 pb-1 text-[#94A3B8]">Node</th>
                            {Object.keys(activeFrameData.matrix).map(k => (
                              <th key={k} className="border-b border-[#4B5563]/20 pb-1 font-bold text-[#CBD5E1]">{k}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(activeFrameData.matrix).map(([row, cols]) => (
                            <tr key={row} className="border-b border-[#4B5563]/5">
                              <td className="font-bold py-1 text-[#CBD5E1]">{row}</td>
                              {Object.entries(cols).map(([col, val]) => (
                                <td key={col} className={`py-1 ${val === '∞' ? 'text-[#EF4444]' : 'text-cyan-400'}`}>{val}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Connected Components color code indexes */}
                {selectedAlgo === 'connected_components' && activeFrameData.components && (
                  <div className="space-y-1">
                    <span className="text-[#3B82F6] font-bold block">Discovered Component Groups:</span>
                    {Object.keys(activeFrameData.components).length > 0 ? (
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {Object.entries(activeFrameData.components).map(([k, v]) => (
                          <div key={k} className="flex justify-between border-b border-[#4B5563]/5 pb-0.5">
                            <span className="text-[#CBD5E1]">{k}:</span>
                            <span className="px-1.5 py-0.5 rounded font-bold text-[9px] bg-[#3B82F6]/20 text-[#3B82F6]">
                              Subnet {v}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : <span className="text-[#94A3B8] italic">No component nodes categorized yet</span>}
                  </div>
                )}

                {/* Topological Sort order queue */}
                {selectedAlgo === 'topological_sort' && activeFrameData.inDegrees && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <span className="text-[#3B82F6] font-bold block">In-Degrees Map:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {Object.entries(activeFrameData.inDegrees).map(([k, v]) => (
                          <div key={k} className="flex justify-between border-b border-[#4B5563]/5 pb-0.5">
                            <span className="text-[#CBD5E1]">{k}:</span>
                            <span className={`font-bold ${v === 0 ? 'text-[#22C55E]' : 'text-amber-400'}`}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {activeFrameData.sortedList && (
                      <div className="space-y-1 pt-2 border-t border-[#4B5563]/10">
                        <span className="text-[#3B82F6] font-bold block">Scheduled Output:</span>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {activeFrameData.sortedList.map((item, idx) => (
                            <span key={idx} className="bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20 px-1 rounded text-[9px]">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Knapsack dynamic list */}
                {['fractional_knapsack', 'branch_bound'].includes(selectedAlgo) && activeFrameData.packedItems && (
                  <div className="space-y-2">
                    <div className="flex justify-between font-bold text-[#CBD5E1]">
                      <span>Packed Value:</span>
                      <span className="text-[#22C55E]">{roundNumber(activeFrameData.value || activeFrameData.maxProfit || 0, 1)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#CBD5E1]">
                      <span>Capacity Limit:</span>
                      <span className="text-cyan-400">{roundNumber(activeFrameData.capacity ?? budget, 1)}</span>
                    </div>
                    
                    <div className="space-y-1 pt-2 border-t border-[#4B5563]/10">
                      <span className="text-[#3B82F6] font-bold block">Selected recovery list:</span>
                      {activeFrameData.packedItems.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {activeFrameData.packedItems.map((item, idx) => (
                            <div key={idx} className="p-1 bg-[#0F1720]/80 rounded border border-[#4B5563]/10 flex justify-between items-center text-[9px]">
                              <span className="font-bold text-[#CBD5E1]">{item.label}</span>
                              <span className="text-amber-400">
                                {item.fraction ? `${Math.round(item.fraction * 100)}%` : '100%'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : <span className="text-[#94A3B8] italic text-[9px]">Knapsack empty</span>}
                    </div>
                  </div>
                )}

                {/* TSP backtracking tour */}
                {selectedAlgo === 'tsp' && (
                  <div className="space-y-2">
                    <div className="flex justify-between font-bold text-[#CBD5E1]">
                      <span>Current Best Cost:</span>
                      <span className="text-[#22C55E]">{activeFrameData.bestCost}</span>
                    </div>
                    {activeFrameData.visited && (
                      <div className="space-y-1 pt-2 border-t border-[#4B5563]/10">
                        <span className="text-[#3B82F6] font-bold block">Current Tour Path:</span>
                        <div className="text-[9px] text-[#CBD5E1] leading-relaxed">
                          {activeFrameData.visited.join(' → ')}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* General metrics */}
            <div className="border-t border-[#4B5563]/20 pt-4 grid grid-cols-2 gap-3 text-center text-[10px] font-mono">
              <div className="bg-[#0F1720]/50 p-2 rounded border border-[#4B5563]/10">
                <span className="text-[#94A3B8] block text-[9px] uppercase tracking-wider mb-0.5">Recovered</span>
                <span className="text-[#3B82F6] font-black text-sm">{activeFrameData.visited.length} / {nodes.length}</span>
              </div>
              <div className="bg-[#0F1720]/50 p-2 rounded border border-[#4B5563]/10">
                <span className="text-[#94A3B8] block text-[9px] uppercase tracking-wider mb-0.5">Step Index</span>
                <span className="text-[#F8FAFC] font-black text-sm">{currentFrame + 1} / {timeline.length}</span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Playback timeline slider overlay */}
        {timeline.length > 0 && (
          <div className="h-12 bg-[#233D4C]/60 backdrop-blur-md border-b border-[#4B5563]/20 flex items-center justify-between px-6 z-10 select-none">
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevStep}
                disabled={currentFrame === 0}
                className="p-1.5 rounded bg-[#1B2838] border border-[#4B5563]/25 text-[#CBD5E1] hover:text-[#FD802E] disabled:opacity-30 transition-colors"
                title="Previous step"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <button
                onClick={handlePlayPause}
                className={`flex items-center gap-1.5 px-3 py-1 bg-[#1B2838] border border-[#4B5563]/25 text-[#F8FAFC] hover:text-[#FD802E] rounded-lg transition-colors font-semibold`}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5 text-[#FD802E]" /> : <Play className="h-3.5 w-3.5 text-[#22C55E]" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={handleNextStep}
                disabled={currentFrame === timeline.length - 1}
                className="p-1.5 rounded bg-[#1B2838] border border-[#4B5563]/25 text-[#CBD5E1] hover:text-[#FD802E] disabled:opacity-30 transition-colors"
                title="Next step"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                onClick={handleReset}
                className="p-1.5 rounded bg-[#1B2838] border border-[#4B5563]/25 text-[#CBD5E1] hover:text-[#EF4444] transition-colors"
                title="Reset recovery"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 mx-6 flex items-center gap-3">
              <span className="text-[10px] font-mono text-[#94A3B8]">0</span>
              <input
                type="range"
                min="0"
                max={timeline.length - 1}
                value={currentFrame}
                onChange={(e) => {
                  setIsPlaying(false);
                  setPlannerStatus('paused');
                  setCurrentFrame(parseInt(e.target.value) || 0);
                }}
                className="flex-1 accent-[#FD802E] h-1 bg-[#0F1720] rounded-lg cursor-pointer appearance-none"
              />
              <span className="text-[10px] font-mono text-[#94A3B8]">{timeline.length - 1}</span>
            </div>

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

        {/* React Flow canvas */}
        <div className="flex-1 h-full relative" style={{ pointerEvents: plannerStatus === 'loading' ? 'none' : 'auto' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={onNodeClick}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            fitView
            minZoom={0.1}
            maxZoom={4}
          >
            <Background color="#4B5563" gap={16} size={1} />
            <Controls />
            <MiniMap nodeColor={() => '#233D4C'} />
          </ReactFlow>
        </div>

        {/* Pseudocode and learning bottom sheet details */}
        {timeline.length > 0 && learning.pseudoCode && (
          <div className="h-44 bg-[#233D4C] border-t border-[#4B5563]/30 p-4 flex gap-4 select-none z-10 flex-shrink-0 overflow-y-auto">
            {/* Pseudocode panel */}
            <div className="w-1/2 flex flex-col h-full overflow-hidden border border-[#4B5563]/20 rounded-lg bg-[#0F1720]/40">
              <div className="bg-[#1B2838] px-3 py-1.5 border-b border-[#4B5563]/25 text-[10px] font-bold text-[#FD802E] uppercase tracking-wider">
                Algorithm Tracing (Pseudocode)
              </div>
              <div className="flex-1 overflow-y-auto p-3 font-mono text-[9px] text-[#CBD5E1] space-y-0.5 leading-normal">
                {learning.pseudoCode.map((line, idx) => {
                  // highlight matches based on action string triggers
                  const isExtract = activeFrameData.action.includes('Inspecting device') && line.includes('ExtractMin');
                  const isRelax = activeFrameData.action.includes('Relaxed path cost') && line.includes('dist[u]');
                  const isUnion = activeFrameData.action.includes('Union') && line.includes('Union(');
                  const isCheck = activeFrameData.action.includes('Cycle detected') && line.includes('Find(');
                  const isHighlighted = isExtract || isRelax || isUnion || isCheck;
                  
                  return (
                    <div 
                      key={`code-${idx}`} 
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        isHighlighted ? 'bg-[#FD802E]/20 text-[#FD802E] font-bold border-l-2 border-[#FD802E]' : ''
                      }`}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation panel */}
            <div className="w-1/2 flex flex-col h-full overflow-hidden border border-[#4B5563]/20 rounded-lg bg-[#0F1720]/40">
              <div className="bg-[#1B2838] px-3 py-1.5 border-b border-[#4B5563]/25 text-[10px] font-bold text-[#FD802E] uppercase tracking-wider">
                Explanation & Telemetry Complexities
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 text-[#CBD5E1] text-[11px] leading-relaxed">
                <p>{learning.explanation}</p>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
                  <div className="flex justify-between border-b border-[#4B5563]/10 pb-1">
                    <span className="text-[#94A3B8]">Time Complexity:</span>
                    <span className="text-[#22C55E] font-bold">{statistics.timeComplexity}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#4B5563]/10 pb-1">
                    <span className="text-[#94A3B8]">Space Complexity:</span>
                    <span className="text-[#22C55E] font-bold">{statistics.spaceComplexity}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Utility to round numbers safely
function roundNumber(num, decs) {
  if (num === null || num === undefined) return 0;
  return Number(Math.round(num + 'e' + decs) + 'e-' + decs);
}

export default function RecoveryPlanner() {
  return (
    <ReactFlowProvider>
      <RecoveryWorkspace />
    </ReactFlowProvider>
  );
}
