import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { GitCompare, Play, Layers, Activity, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { projectService, algorithmService, templateService } from '../services/api';

/**
 * File: Comparison.jsx
 * Author: Antigravity AI
 * Purpose: Side-by-side performance profiling comparison dashboard.
 */

export default function Comparison() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [sourceNode, setSourceNode] = useState('');
  
  // Tab control: 'traversal' (BFS vs DFS) | 'mst' (Prim vs Kruskal)
  const [activeTab, setActiveTab] = useState('traversal');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Stats store
  const [bfsStats, setBfsStats] = useState(null);
  const [dfsStats, setDfsStats] = useState(null);
  const [primStats, setPrimStats] = useState(null);
  const [kruskalStats, setKruskalStats] = useState(null);

  // Load active graph configuration
  const loadGraph = async () => {
    setErrorMsg('');
    try {
      let loadedNodes = [];
      let loadedEdges = [];
      
      const draftStr = localStorage.getItem('netshield_autosave');
      if (draftStr) {
        try {
          const draft = JSON.parse(draftStr);
          if (draft.nodes && Array.isArray(draft.nodes) && draft.nodes.length > 0) {
            loadedNodes = draft.nodes;
            loadedEdges = draft.edges || [];
          }
        } catch (e) {
          console.error(e);
        }
      }
      
      if (loadedNodes.length === 0) {
        const response = await projectService.loadProject();
        if (response.success && response.project && response.project.network) {
          loadedNodes = response.project.network.nodes || [];
          loadedEdges = response.project.network.edges || [];
        }
      }

      if (loadedNodes.length === 0) {
        const tmpl = await templateService.loadTemplate('office');
        if (tmpl.success && tmpl.graph) {
          loadedNodes = tmpl.graph.nodes || [];
          loadedEdges = tmpl.graph.edges || [];
        }
      }
      
      setNodes(loadedNodes);
      setEdges(loadedEdges);

      // Default start node
      if (loadedNodes.length > 0) {
        // Try to pick a Router or Switch first
        const core = loadedNodes.find(n => n.type === 'Router' || n.type === 'Core Switch');
        setSourceNode(core ? core.id : loadedNodes[0].id);
      }
    } catch (err) {
      console.error('Failed to load comparison graph', err);
      setErrorMsg('Failed to load active network topology.');
    }
  };

  useEffect(() => {
    loadGraph();
  }, []);

  // Run profiling simulations in parallel
  const runProfiling = async () => {
    if (nodes.length === 0) {
      setErrorMsg('No network topology loaded. Please build a network first.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      if (activeTab === 'traversal') {
        if (!sourceNode) {
          setErrorMsg('Please select a starting node for traversals.');
          setLoading(false);
          return;
        }

        // Run BFS and DFS in parallel
        const [bfsRes, dfsRes] = await Promise.all([
          algorithmService.simulateAttack('bfs', nodes, edges, [sourceNode]),
          algorithmService.simulateAttack('dfs', nodes, edges, [sourceNode])
        ]);

        if (bfsRes.success && dfsRes.success) {
          setBfsStats(bfsRes.statistics);
          setDfsStats(dfsRes.statistics);
        } else {
          setErrorMsg('Profiling failed. Ensure the graph is valid.');
        }
      } else {
        // Run Prim and Kruskal in parallel
        const [primRes, kruskalRes] = await Promise.all([
          algorithmService.recoverNetwork('prim', nodes, edges, { source: sourceNode || nodes[0].id }),
          algorithmService.recoverNetwork('kruskal', nodes, edges)
        ]);

        if (primRes.success && kruskalRes.success) {
          setPrimStats(primRes.statistics);
          setKruskalStats(kruskalRes.statistics);
        } else {
          setErrorMsg('Spanning Tree profiling failed. Ensure the graph has connections.');
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Parallel profiling API failed.');
    } finally {
      setLoading(false);
    }
  };

  // Recharts Traversal Chart Data
  const getTraversalChartData = () => {
    if (!bfsStats || !dfsStats) return [];
    return [
      {
        name: 'Infected Devices',
        Worm_BFS: bfsStats.visitedNodes,
        Scanner_DFS: dfsStats.visitedNodes
      },
      {
        name: 'Links Traversed',
        Worm_BFS: bfsStats.edgesTraversed,
        Scanner_DFS: dfsStats.edgesTraversed
      }
    ];
  };

  // Recharts MST Chart Data
  const getMstChartData = () => {
    if (!primStats || !kruskalStats) return [];
    return [
      {
        name: 'Selected Edges',
        Prim_MST: primStats.edgesSelected,
        Kruskal_MST: kruskalStats.edgesSelected
      },
      {
        name: 'Rejected Edges',
        Prim_MST: primStats.edgesRejected,
        Kruskal_MST: kruskalStats.edgesRejected
      }
    ];
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0F1720] select-none text-sans text-xs">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center pb-2 border-b border-[#4B5563]/25">
        <div>
          <h2 className="text-xl font-bold text-[#F8FAFC]">ALGORITHMS COMPARATIVE PROFILER</h2>
          <p className="text-[#94A3B8] text-[11px] mt-0.5">Evaluate and profile performance ratios of alternative algorithms side-by-side.</p>
        </div>
        <button
          onClick={loadGraph}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#233D4C] border border-[#4B5563]/30 hover:border-[#FD802E]/40 text-[#CBD5E1] rounded-lg transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Sync Builder Graph
        </button>
      </div>

      {/* Tabs selectors */}
      <div className="flex justify-between items-center bg-[#233D4C]/30 p-1.5 rounded-lg border border-[#4B5563]/15">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveTab('traversal');
              setBfsStats(null);
              setDfsStats(null);
            }}
            className={`px-4 py-2 rounded-lg font-bold border transition-colors ${
              activeTab === 'traversal'
                ? 'bg-[#FD802E] text-[#F8FAFC] border-[#FD802E]'
                : 'bg-[#0F1720]/40 text-[#CBD5E1] border-transparent hover:border-[#4B5563]/35'
            }`}
          >
            BFS vs DFS Traversal
          </button>
          <button
            onClick={() => {
              setActiveTab('mst');
              setPrimStats(null);
              setKruskalStats(null);
            }}
            className={`px-4 py-2 rounded-lg font-bold border transition-colors ${
              activeTab === 'mst'
                ? 'bg-[#FD802E] text-[#F8FAFC] border-[#FD802E]'
                : 'bg-[#0F1720]/40 text-[#CBD5E1] border-transparent hover:border-[#4B5563]/35'
            }`}
          >
            Prim vs Kruskal MST
          </button>
        </div>

        {/* Start Node selector configuration */}
        <div className="flex items-center gap-3">
          {activeTab === 'traversal' && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#94A3B8] font-bold uppercase">Start Node:</span>
              <select
                value={sourceNode}
                onChange={(e) => setSourceNode(e.target.value)}
                className="bg-[#0F1720] border border-[#4B5563]/30 text-[#F8FAFC] px-2 py-1 rounded outline-none cursor-pointer"
              >
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>{n.label || n.id}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={runProfiling}
            disabled={loading || nodes.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#22C55E] hover:bg-[#4ADE80] text-[#F8FAFC] font-bold rounded-lg transition-colors uppercase shadow-md"
          >
            <Play className="h-3.5 w-3.5" />
            {loading ? 'Profiling...' : 'Run Profiler'}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] rounded-lg font-mono flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Traversal profiling panels */}
      {activeTab === 'traversal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Metrics summary list column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#233D4C] border border-[#4B5563]/25 rounded-xl p-5 space-y-4">
              <h3 className="text-xs uppercase font-bold text-[#F8FAFC] tracking-wider border-b border-[#4B5563]/10 pb-2">
                Comparative Metrics
              </h3>
              
              {bfsStats && dfsStats ? (
                <div className="space-y-4 font-mono text-[10px]">
                  {/* Visited */}
                  <div className="p-3 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15 space-y-1.5">
                    <span className="text-[#94A3B8] uppercase block">Infected Devices (BFS vs DFS):</span>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#FD802E] font-black">{bfsStats.visitedNodes} ({bfsStats.infectedPercent}%)</span>
                      <span className="text-cyan-400 font-black">{dfsStats.visitedNodes} ({dfsStats.infectedPercent}%)</span>
                    </div>
                  </div>
                  {/* Edges */}
                  <div className="p-3 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15 space-y-1.5">
                    <span className="text-[#94A3B8] uppercase block">Connection Links Traversed:</span>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#FD802E] font-black">{bfsStats.edgesTraversed}</span>
                      <span className="text-cyan-400 font-black">{dfsStats.edgesTraversed}</span>
                    </div>
                  </div>
                  {/* Time Complexity */}
                  <div className="p-3 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15 space-y-1.5 font-sans">
                    <span className="text-[#94A3B8] uppercase block text-[9px] font-mono">Asymptotic Bounds:</span>
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="border-r border-[#4B5563]/15">
                        <strong className="text-[#FD802E] block">Worm BFS</strong>
                        <span className="text-emerald-400 font-mono mt-0.5 block">{bfsStats.timeComplexity}</span>
                      </div>
                      <div>
                        <strong className="text-cyan-400 block">Scanner DFS</strong>
                        <span className="text-emerald-400 font-mono mt-0.5 block">{dfsStats.timeComplexity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-[#94A3B8] italic py-8">
                  Click 'Run Profiler' to execute traversal comparisons.
                </div>
              )}
            </div>
          </div>

          {/* Chart visual column */}
          <div className="lg:col-span-2 bg-[#233D4C] border border-[#4B5563]/25 rounded-xl p-5 flex flex-col">
            <h3 className="text-xs uppercase font-bold text-[#F8FAFC] tracking-wider border-b border-[#4B5563]/10 pb-2 mb-6">
              Traversal Graph Performance
            </h3>
            <div className="h-80 w-full flex justify-center items-center">
              {bfsStats && dfsStats ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTraversalChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" opacity={0.15} />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1B2838', border: '1px solid #4B5563', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', pt: 10 }} />
                    <Bar dataKey="Worm_BFS" fill="#FD802E" radius={[4, 4, 0, 0]} name="Worm (BFS)" />
                    <Bar dataKey="Scanner_DFS" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Scanner (DFS)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-[#94A3B8] italic text-center">Charts will populate after running.</div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* MST Spanning tree comparative panels */}
      {activeTab === 'mst' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Metrics Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#233D4C] border border-[#4B5563]/25 rounded-xl p-5 space-y-4">
              <h3 className="text-xs uppercase font-bold text-[#F8FAFC] tracking-wider border-b border-[#4B5563]/10 pb-2">
                Comparative Metrics
              </h3>
              
              {primStats && kruskalStats ? (
                <div className="space-y-4 font-mono text-[10px]">
                  {/* Weight */}
                  <div className="p-3 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15 space-y-1.5">
                    <span className="text-[#94A3B8] uppercase block">Total MST Cable Cost:</span>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#FD802E] font-black">Prim: {roundNumber(primStats.totalWeight, 1)}</span>
                      <span className="text-cyan-400 font-black">Kruskal: {roundNumber(kruskalStats.totalWeight, 1)}</span>
                    </div>
                    <p className="text-[9px] text-[#94A3B8] font-sans leading-normal mt-1">
                      Both algorithms find the optimal minimum spanning cost, proving mathematical correctness.
                    </p>
                  </div>
                  {/* Ops Count */}
                  <div className="p-3 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15 space-y-1.5">
                    <span className="text-[#94A3B8] uppercase block">Queue Pushes vs Union Lookups:</span>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#FD802E] font-black">Heap Ops: {primStats.pqOperations}</span>
                      <span className="text-cyan-400 font-black">Union-Find: {kruskalStats.findOperations + kruskalStats.unionOperations}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-[#94A3B8] italic py-8">
                  Click 'Run Profiler' to execute spanning tree comparisons.
                </div>
              )}
            </div>
          </div>

          {/* Charts Column */}
          <div className="lg:col-span-2 bg-[#233D4C] border border-[#4B5563]/25 rounded-xl p-5 flex flex-col">
            <h3 className="text-xs uppercase font-bold text-[#F8FAFC] tracking-wider border-b border-[#4B5563]/10 pb-2 mb-6">
              MST Selection Overhead
            </h3>
            <div className="h-80 w-full flex justify-center items-center">
              {primStats && kruskalStats ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getMstChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" opacity={0.15} />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1B2838', border: '1px solid #4B5563', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', pt: 10 }} />
                    <Bar dataKey="Prim_MST" fill="#FD802E" radius={[4, 4, 0, 0]} name="Prim's MST" />
                    <Bar dataKey="Kruskal_MST" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Kruskal's MST" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-[#94A3B8] italic text-center">Charts will populate after running.</div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

function roundNumber(num, decs) {
  if (num === null || num === undefined) return 0;
  return Number(Math.round(num + 'e' + decs) + 'e-' + decs);
}
