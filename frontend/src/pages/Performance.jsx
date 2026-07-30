import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Activity, Play, Pause, RotateCcw, Cpu, HardDrive, Clock, Layers, Shield, RefreshCw, ShieldAlert } from 'lucide-react';
import { projectService, algorithmService } from '../services/api';
import { useSimulation } from '../context/SimulationContext';

/**
 * File: Performance.jsx
 * Author: Antigravity AI
 * Purpose: Real-time telemetry dashboard for CPU runtimes, memory allocations, and active background algorithm runs.
 */

const ALGORITHMS_LIST = [
  { id: 'bfs', name: 'Worm Propagation (BFS)', category: 'Simulation' },
  { id: 'dfs', name: 'Network Scanner (DFS)', category: 'Simulation' },
  { id: 'multi_bfs', name: 'Coordinated Attack (Multi-BFS)', category: 'Simulation' },
  { id: 'dijkstra', name: 'Dijkstra Shortest Path', category: 'Recovery' },
  { id: 'prim', name: "Prim's MST", category: 'Recovery' },
  { id: 'kruskal', name: "Kruskal's MST", category: 'Recovery' },
  { id: 'floyd', name: 'Floyd-Warshall All-Pairs', category: 'Recovery' },
  { id: 'connected_components', name: 'Connected Components', category: 'Recovery' },
  { id: 'union_find', name: 'Union-Find Operations', category: 'Recovery' },
  { id: 'topological_sort', name: 'Topological Sort', category: 'Recovery' },
  { id: 'fractional_knapsack', name: 'Fractional Knapsack', category: 'Recovery' },
  { id: 'branch_bound', name: 'Branch & Bound Knapsack', category: 'Recovery' },
  { id: 'tsp', name: 'Traveling Salesman Tour', category: 'Recovery' },
  { id: 'merge_sort', name: 'Merge Sort', category: 'Educational' },
  { id: 'quick_sort', name: 'Randomized Quick Sort', category: 'Educational' },
  { id: 'matrix_chain', name: 'Matrix Chain DP', category: 'Educational' },
  { id: 'strassen', name: 'Strassen Multiplication', category: 'Educational' },
  { id: 'nqueens', name: 'N-Queens Backtracking', category: 'Educational' }
];

export default function Performance() {
  const {
    nodes,
    edges,
    mode,
    algoId,
    timeline,
    currentFrame,
    isPlaying,
    simulationStatus,
    statistics: activeStats,
    elapsedSeconds,
    pausePlayback,
    resumePlayback,
    resetPlayback
  } = useSimulation();

  const [localNodes, setLocalNodes] = useState([]);
  const [localEdges, setLocalEdges] = useState([]);
  const [selectedAlgo, setSelectedAlgo] = useState('dijkstra');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Real-time run stats
  const [runtime, setRuntime] = useState(0); // in ms
  const [memory, setMemory] = useState(0); // in KB
  const [complexity, setComplexity] = useState({ time: 'O(1)', space: 'O(1)' });
  
  // Historical run logs
  const [history, setHistory] = useState([]);

  // Load active graph
  const loadGraph = async () => {
    try {
      let loadedNodes = [];
      let loadedEdges = [];
      
      const draftStr = localStorage.getItem('netshield_autosave');
      if (draftStr) {
        const draft = JSON.parse(draftStr);
        loadedNodes = draft.nodes || [];
        loadedEdges = draft.edges || [];
      } else {
        const response = await projectService.loadProject();
        if (response.success && response.project && response.project.network) {
          loadedNodes = response.project.network.nodes || [];
          loadedEdges = response.project.network.edges || [];
        }
      }
      setLocalNodes(loadedNodes);
      setLocalEdges(loadedEdges);
    } catch (err) {
      console.error('Failed to load performance graph', err);
    }
  };

  useEffect(() => {
    loadGraph();
  }, []);

  // Trigger telemetry profiling
  const runProfiler = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      let response;
      const targetAlgo = ALGORITHMS_LIST.find(a => a.id === selectedAlgo);
      
      if (targetAlgo.category === 'Simulation') {
        const startNode = localNodes.length > 0 ? localNodes[0].id : 'NET-1';
        response = await algorithmService.simulateAttack(selectedAlgo, localNodes, localEdges, [startNode]);
      } else if (targetAlgo.category === 'Recovery') {
        const startNode = localNodes.length > 0 ? localNodes[0].id : 'NET-1';
        const targetNode = localNodes.length > 1 ? localNodes[localNodes.length - 1].id : 'SRV-1';
        const options = {
          source: startNode,
          destination: targetNode,
          budget: 100.0
        };
        response = await algorithmService.recoverNetwork(selectedAlgo, localNodes, localEdges, options);
      } else {
        if (selectedAlgo === 'merge_sort' || selectedAlgo === 'quick_sort') {
          response = await algorithmService.simulateSort(selectedAlgo, [12, 11, 13, 5, 6, 7]);
        } else if (selectedAlgo === 'matrix_chain') {
          response = await algorithmService.simulateDP([10, 20, 30, 40, 30]);
        } else if (selectedAlgo === 'strassen') {
          response = await algorithmService.simulateStrassen([[1, 2], [3, 4]], [[5, 6], [7, 8]]);
        } else if (selectedAlgo === 'nqueens') {
          response = await algorithmService.simulateNQueens(4);
        }
      }

      if (response && response.success) {
        const runTimeMs = response.statistics?.executionTimeMs || 0.1;
        const memoryKb = response.statistics?.peakMemoryKb || 0.05;
        const timeComp = response.statistics?.timeComplexity || response.learning?.pseudoCode?.[0]?.split('(')?.[0] || 'O(V+E)';
        const spaceComp = response.statistics?.spaceComplexity || 'O(V)';

        setRuntime(runTimeMs);
        setMemory(memoryKb);
        setComplexity({ time: timeComp, space: spaceComp });

        setHistory(prev => {
          const runNumber = prev.length + 1;
          const next = [
            ...prev,
            {
              run: `Run ${runNumber}`,
              algorithm: targetAlgo.name,
              runtime: runTimeMs,
              memory: memoryKb,
              nodesCount: localNodes.length,
              edgesCount: localEdges.length
            }
          ];
          return next.slice(-15);
        });

      } else {
        setErrorMsg('Calculation run returned failure state.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Telemetry API failed.');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setRuntime(0);
    setMemory(0);
    setComplexity({ time: 'O(1)', space: 'O(1)' });
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const activeFrameData = (timeline && timeline[currentFrame]) || null;
  const visitedList = activeFrameData?.visited || [];
  const currentEdge = activeFrameData?.currentEdge || null;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0F1720] select-none text-sans text-xs">
      
      {/* Page Header */}
      <div className="flex justify-between items-center pb-2 border-b border-[#4B5563]/25">
        <div>
          <h2 className="text-xl font-bold text-[#F8FAFC]">REAL-TIME PERFORMANCE TELEMETRY</h2>
          <p className="text-[#94A3B8] text-[11px] mt-0.5 font-sans">Track and evaluate low-level CPU execution runtimes, memory allocations, and background graph processing.</p>
        </div>
        <button
          onClick={loadGraph}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#233D4C] border border-[#4B5563]/30 hover:border-[#FD802E]/40 text-[#CBD5E1] rounded-lg transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Sync Builder Graph
        </button>
      </div>

      {/* Real-time background execution monitor */}
      <div className="bg-[#233D4C]/30 border border-[#4B5563]/25 rounded-xl p-5 space-y-4">
        <h3 className="text-xs uppercase font-bold text-[#F8FAFC] tracking-wider border-b border-[#4B5563]/10 pb-2 flex items-center justify-between">
          <span>Active Run Monitor (Background Simulation)</span>
          {mode !== 'idle' && (
            <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase">
              <span className={`h-2.5 w-2.5 rounded-full ${simulationStatus === 'running' ? 'bg-[#22C55E] animate-ping' : 'bg-amber-500'}`} />
              {simulationStatus}
            </span>
          )}
        </h3>

        {mode !== 'idle' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            
            {/* Run details */}
            <div className="space-y-3 p-4 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15">
              <div className="flex justify-between text-[11px] border-b border-[#4B5563]/10 pb-2">
                <span className="text-[#94A3B8] font-semibold">Active Mode:</span>
                <span className="text-[#FD802E] font-bold uppercase">{mode}</span>
              </div>
              <div className="flex justify-between text-[11px] border-b border-[#4B5563]/10 pb-2">
                <span className="text-[#94A3B8] font-semibold">Algorithm:</span>
                <span className="text-[#F8FAFC] font-mono">{algoId.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-[11px] border-b border-[#4B5563]/10 pb-2">
                <span className="text-[#94A3B8] font-semibold">Elapsed Duration:</span>
                <span className="text-cyan-400 font-bold font-mono">{formatTime(elapsedSeconds)}</span>
              </div>
              
              {/* Telemetry controls */}
              <div className="flex items-center gap-2 pt-1.5">
                {isPlaying ? (
                  <button onClick={pausePlayback} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#FD802E] text-white rounded font-bold uppercase text-[9px]">
                    <Pause className="h-3 w-3" /> Pause
                  </button>
                ) : (
                  <button onClick={resumePlayback} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#22C55E] text-white rounded font-bold uppercase text-[9px]">
                    <Play className="h-3 w-3" /> Resume
                  </button>
                )}
                <button onClick={resetPlayback} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#EF4444] text-white rounded font-bold uppercase text-[9px]">
                  <RotateCcw className="h-3 w-3" /> Stop
                </button>
              </div>
            </div>

            {/* Traversed nodes */}
            <div className="space-y-2 p-4 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center text-[11px] border-b border-[#4B5563]/10 pb-2">
                <span className="text-[#94A3B8] font-semibold">Visited/Recovered Nodes:</span>
                <span className="text-[#3B82F6] font-bold font-mono">
                  {visitedList.length} / {nodes.length} ({nodes.length > 0 ? ((visitedList.length / nodes.length) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className="flex-1 overflow-y-auto max-h-24 pt-1 flex flex-wrap gap-1 font-mono text-[9px] align-content-start">
                {visitedList.length > 0 ? (
                  visitedList.map(nodeId => (
                    <span key={nodeId} className="px-1.5 py-0.5 rounded bg-[#3B82F6]/10 border border-[#3B82F6]/25 text-[#3B82F6]">
                      {nodeId}
                    </span>
                  ))
                ) : (
                  <span className="text-[#94A3B8] italic">No nodes processed yet.</span>
                )}
              </div>
            </div>

            {/* Traversed edges */}
            <div className="space-y-2 p-4 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-[11px] border-b border-[#4B5563]/10 pb-2">
                  <span className="text-[#94A3B8] font-semibold">Currently Probing Edge:</span>
                  <span className="text-amber-400 font-bold font-mono">
                    {currentEdge ? `${currentEdge[0]} ↔ ${currentEdge[1]}` : 'None'}
                  </span>
                </div>
                <div className="mt-3 text-[10px] text-[#CBD5E1] font-mono leading-relaxed space-y-1">
                  <div>Time Complexity: <span className="text-emerald-400">{activeStats.timeComplexity || 'O(V + E)'}</span></div>
                  <div>Space Complexity: <span className="text-emerald-400">{activeStats.spaceComplexity || 'O(V)'}</span></div>
                  <div>Edges Traversed: <span className="text-amber-400">{activeStats.edgesTraversed ?? activeStats.priorityQueueOps ?? 0}</span></div>
                </div>
              </div>
              <div className="text-[10px] text-[#94A3B8] italic border-t border-[#4B5563]/10 pt-1.5">
                Note: Performance telemetry stats update at each frame duration of the network player.
              </div>
            </div>

          </div>
        ) : (
          <div className="p-6 text-center text-[#94A3B8] italic">
            No active background simulation running. Go to Attack Simulator or Recovery Planner and start a traversal run to inspect real-time metrics.
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="flex justify-between items-center bg-[#233D4C]/30 p-2 rounded-lg border border-[#4B5563]/15">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider pl-1">Target Algorithm:</span>
          <select
            value={selectedAlgo}
            onChange={(e) => setSelectedAlgo(e.target.value)}
            disabled={loading}
            className="bg-[#0F1720] border border-[#4B5563]/30 text-[#F8FAFC] px-3 py-1.5 rounded-lg outline-none cursor-pointer hover:border-[#FD802E]/30 transition-colors"
          >
            {ALGORITHMS_LIST.map(a => (
              <option key={a.id} value={a.id}>{a.name} ({a.category})</option>
            ))}
          </select>
          
          <button
            onClick={runProfiler}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#22C55E] hover:bg-[#4ADE80] text-[#F8FAFC] font-bold rounded-lg transition-colors uppercase shadow-md"
          >
            <Play className="h-3.5 w-3.5" />
            {loading ? 'Profiling...' : 'Run Telemetry'}
          </button>
        </div>

        <button
          onClick={clearHistory}
          className="px-3 py-1.5 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/20 text-[#EF4444] rounded-lg transition-colors font-bold uppercase text-[9px]"
        >
          Clear Run Log
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] rounded-lg font-mono flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Stats metrics panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric: CPU time */}
        <div className="bg-[#233D4C] p-4 rounded-xl border border-[#4B5563]/25 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">CPU Runtime</span>
            <div className="text-2xl font-black text-[#22C55E] font-mono mt-1">{runtime} <span className="text-xs">ms</span></div>
          </div>
          <div className="p-3 bg-[#0F1720]/50 rounded-lg text-[#22C55E] border border-[#4B5563]/10">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Metric: Peak heap memory */}
        <div className="bg-[#233D4C] p-4 rounded-xl border border-[#4B5563]/25 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Peak Memory</span>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{memory} <span className="text-xs">KB</span></div>
          </div>
          <div className="p-3 bg-[#0F1720]/50 rounded-lg text-cyan-400 border border-[#4B5563]/10">
            <HardDrive className="h-6 w-6" />
          </div>
        </div>

        {/* Metric: Complexity */}
        <div className="bg-[#233D4C] p-4 rounded-xl border border-[#4B5563]/25 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Asymptotic Time</span>
            <div className="text-xl font-bold text-amber-400 font-mono mt-1.5">{complexity.time}</div>
          </div>
          <div className="p-3 bg-[#0F1720]/50 rounded-lg text-amber-400 border border-[#4B5563]/10">
            <Cpu className="h-6 w-6" />
          </div>
        </div>

        {/* Metric: Topology Size */}
        <div className="bg-[#233D4C] p-4 rounded-xl border border-[#4B5563]/25 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Graph scale</span>
            <div className="text-sm font-black text-[#F8FAFC] font-mono mt-2 uppercase">
              V: {localNodes.length} | E: {localEdges.length}
            </div>
          </div>
          <div className="p-3 bg-[#0F1720]/50 rounded-lg text-[#F8FAFC] border border-[#4B5563]/10">
            <Layers className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Telemetry charts and logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Runtime Trend Line chart */}
        <div className="lg:col-span-2 bg-[#233D4C] border border-[#4B5563]/25 rounded-xl p-5 flex flex-col">
          <h3 className="text-xs uppercase font-bold text-[#F8FAFC] tracking-wider border-b border-[#4B5563]/10 pb-2 mb-6">
            Successive Runtime Profiling Curve (ms)
          </h3>
          <div className="h-72 w-full flex justify-center items-center">
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" opacity={0.15} />
                  <XAxis dataKey="run" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1B2838', border: '1px solid #4B5563', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px', pt: 10 }} />
                  <Line type="monotone" dataKey="runtime" stroke="#22C55E" strokeWidth={2} name="CPU Duration (ms)" activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-[#94A3B8] italic text-center font-sans">Trend lines will populate on running telemetry.</div>
            )}
          </div>
        </div>

        {/* Historical run list table */}
        <div className="lg:col-span-1 bg-[#233D4C] border border-[#4B5563]/25 rounded-xl p-5 flex flex-col overflow-hidden">
          <h3 className="text-xs uppercase font-bold text-[#F8FAFC] tracking-wider border-b border-[#4B5563]/10 pb-2 mb-4">
            Execution Log history
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            {history.length > 0 ? (
              [...history].reverse().map((run, idx) => (
                <div key={idx} className="p-3 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15 font-mono text-[9px] text-[#CBD5E1] space-y-1">
                  <div className="flex justify-between font-bold border-b border-[#4B5563]/10 pb-1">
                    <span className="text-[#FD802E]">{run.run}</span>
                    <span className="text-[#94A3B8]">{run.algorithm}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>CPU Time:</span>
                    <span className="text-[#22C55E] font-bold">{run.runtime} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Peak Heap:</span>
                    <span className="text-cyan-400 font-bold">{run.memory} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Graph scale:</span>
                    <span>{run.nodesCount} nodes, {run.edgesCount} edges</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-[#94A3B8] italic text-center font-sans">
                History is empty.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
