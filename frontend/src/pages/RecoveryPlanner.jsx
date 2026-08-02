import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background
} from 'reactflow';
import 'reactflow/dist/style.css';

import { 
  Play, Pause, RotateCcw, ChevronRight, ChevronLeft, ShieldCheck, 
  Settings, Layers, Cpu, Heart, CheckSquare, ShieldAlert
} from 'lucide-react';

import CustomNode from '../components/network/CustomNode';
import CustomEdge from '../components/network/CustomEdge';
import { useSimulation } from '../context/SimulationContext';

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
  { value: 0.5, label: '0.5x (Teaching)' },
  { value: 1.0, label: '1.0x (Normal)' },
  { value: 2.0, label: '2.0x (Fast)' },
  { value: 4.0, label: '4.0x (Demo)' }
];

function RecoveryWorkspace() {
  const {
    nodes,
    edges,
    originalNodes,
    mode,
    budget,
    setBudget,
    recoverySource,
    setRecoverySource,
    recoveryTarget,
    setRecoveryTarget,
    timeline,
    currentFrame,
    setCurrentFrame,
    isPlaying,
    speed,
    setSpeed,
    simulationStatus,
    statistics,
    learning,
    finalResult,
    errorMsg,
    triggerRecovery,
    pausePlayback,
    resumePlayback,
    resetPlayback,
    nextStep,
    prevStep,
    infectedNodes,
    nodeSimStates,
    stats,
    handleNodeIsolate,
    handleNodeRecover,
    handleNodeRestore,
    notification,
    triggerNotification
  } = useSimulation();

  const [selectedAlgo, setSelectedAlgo] = useState('dijkstra');
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Helper: run Dijkstra from recovery source to a specific infected device
  const recoverDeviceWithDijkstra = (targetNodeId) => {
    setSelectedAlgo('dijkstra');
    setRecoveryTarget(targetNodeId);
    const options = {
      source: recoverySource,
      destination: targetNodeId,
      budget: parseFloat(budget)
    };
    triggerRecovery('dijkstra', options);
  };

  // Auto-fill defaults when infectedNodes change
  useEffect(() => {
    if (infectedNodes.length > 0) {
      // Set target to first infected server, or first infected PC
      const server = infectedNodes.find(id => id.startsWith('SRV-'));
      if (server) {
        setRecoveryTarget(server);
      } else {
        setRecoveryTarget(infectedNodes[0]);
      }
    }
  }, [infectedNodes, setRecoveryTarget]);

  // Click handler to select target nodes (educational option override)
  const onNodeClick = useCallback((event, node) => {
    if (mode === 'recovery' && (simulationStatus === 'running' || simulationStatus === 'paused' || simulationStatus === 'completed')) return;
    
    // If the node is infected, allow setting it as target. Otherwise, set as source.
    if (infectedNodes.includes(node.id)) {
      setRecoveryTarget(node.id);
    } else {
      setRecoverySource(node.id);
    }
  }, [mode, simulationStatus, infectedNodes, setRecoverySource, setRecoveryTarget]);

  const handlePlayPause = () => {
    if (simulationStatus === 'idle') {
      const options = {
        source: recoverySource,
        destination: recoveryTarget,
        budget: parseFloat(budget)
      };
      triggerRecovery(selectedAlgo, options);
    } else if (simulationStatus === 'paused') {
      resumePlayback();
    } else {
      pausePlayback();
    }
  };

  const handleReset = () => {
    resetPlayback();
    if (reactFlowInstance) reactFlowInstance.fitView({ duration: 500 });
  };

  const activeFrameData = (mode === 'recovery' && timeline[currentFrame]) || { 
    visited: [], 
    queue: [], 
    stack: [], 
    action: 'Recovery planner idle. Click Run to start clean-up.' 
  };

  // Helper to safely round numbers in template
  const roundNumber = (num, places = 1) => {
    if (num === null || num === undefined) return 0;
    return parseFloat(num).toFixed(places);
  };

  return (
    <div className="flex-1 flex overflow-hidden h-full bg-[#0F1720]">
      {/* Sidebar: Controls, parameters, and variable logging */}
      <div className="w-80 bg-[#233D4C] border-r border-[#4B5563]/30 h-full flex flex-col select-none flex-shrink-0 text-xs font-sans overflow-y-auto">
        
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
              disabled={mode === 'recovery' && simulationStatus !== 'idle'}
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

          {/* Auto-detected infected nodes count badge panel */}
          <div className="bg-[#0F1720]/60 border border-[#4B5563]/20 rounded-lg p-3 space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              <span>Infected Nodes Detected</span>
              <span className={`px-2 py-0.5 rounded-full ${infectedNodes.length > 0 ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#22C55E]/20 text-[#22C55E]'}`}>
                {infectedNodes.length} devices
              </span>
            </div>
            {infectedNodes.length > 0 ? (
              <div className="max-h-16 overflow-y-auto flex flex-wrap gap-1 pt-1">
                {infectedNodes.slice(0, 8).map(id => (
                  <span key={id} className="bg-[#EF4444]/10 border border-[#EF4444]/25 text-[#EF4444] px-1 rounded text-[8px] font-mono">
                    {id}
                  </span>
                ))}
                {infectedNodes.length > 8 && (
                  <span className="text-[8px] text-[#94A3B8] italic pt-0.5">+{infectedNodes.length - 8} more</span>
                )}
              </div>
            ) : (
              <p className="text-[9px] text-[#94A3B8] leading-normal pt-1">
                No active compromise detected. System will simulate recovery on a default infected topology fallback.
              </p>
            )}
          </div>

          {/* Budget input field for Knapsack / Branch & Bound */}
          {['fractional_knapsack', 'branch_bound'].includes(selectedAlgo) && (
            <div className="space-y-1 animate-in fade-in duration-150">
              <label className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Recovery Budget (Max Cost)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value) || 10)}
                disabled={mode === 'recovery' && simulationStatus !== 'idle'}
                className="w-full bg-[#0F1720] border border-[#4B5563]/30 text-[#F8FAFC] px-3 py-2 rounded-lg outline-none font-mono text-xs"
              />
            </div>
          )}

          {/* Source and destination options selector */}
          {!['fractional_knapsack', 'branch_bound', 'connected_components', 'union_find', 'topological_sort', 'floyd', 'kruskal'].includes(selectedAlgo) && (
            <div className="bg-[#0F1720]/40 border border-[#4B5563]/15 rounded-lg p-3 space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-wider block">Recovery Source</label>

                {/* Show currently-selected server with default indicator */}
                {recoverySource && (
                  <div className="flex items-center gap-1.5 bg-[#0F1720]/80 border border-[#3B82F6]/40 rounded-lg px-2 py-1.5 mb-1">
                    <span className="text-[#3B82F6] text-[10px]">🛡️</span>
                    <span className="font-mono text-[11px] text-[#F8FAFC] font-bold flex-1 truncate">{recoverySource}</span>
                    <span className="text-[8px] bg-[#3B82F6]/20 text-[#3B82F6] px-1 rounded font-bold">DEFAULT</span>
                  </div>
                )}

                <select
                  value={recoverySource}
                  onChange={(e) => setRecoverySource(e.target.value)}
                  disabled={mode === 'recovery' && simulationStatus !== 'idle'}
                  className="w-full bg-[#0F1720] border border-[#4B5563]/35 text-[#F8FAFC] px-2 py-1.5 rounded outline-none text-[11px] font-mono cursor-pointer"
                >
                  {/* Only healthy servers can be recovery sources */}
                  {originalNodes
                    .filter(n => {
                      const SERVER_TYPES = ['Application Server', 'Database Server', 'Backup Server'];
                      return SERVER_TYPES.includes(n.type) && !infectedNodes.includes(n.id);
                    })
                    .map(n => (
                      <option key={n.id} value={n.id}>{n.id} — {n.type}</option>
                    ))}
                  {/* Fallback: if no healthy servers, show all healthy nodes */}
                  {originalNodes.filter(n => {
                    const SERVER_TYPES = ['Application Server', 'Database Server', 'Backup Server'];
                    return SERVER_TYPES.includes(n.type) && !infectedNodes.includes(n.id);
                  }).length === 0 && originalNodes
                    .filter(n => !infectedNodes.includes(n.id))
                    .map(n => (
                      <option key={n.id} value={n.id}>{n.id} ({n.type})</option>
                    ))
                  }
                </select>
              </div>

              {selectedAlgo === 'dijkstra' && (
                <div className="space-y-1 animate-in slide-in-from-top-1 duration-150">
                  <label className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-wider block">Target Infected Device</label>
                  <select
                    value={recoveryTarget}
                    onChange={(e) => setRecoveryTarget(e.target.value)}
                    disabled={mode === 'recovery' && simulationStatus !== 'idle'}
                    className="w-full bg-[#0F1720] border border-[#4B5563]/35 text-[#F8FAFC] px-2 py-1.5 rounded outline-none text-[11px] font-mono cursor-pointer"
                  >
                    {/* Prefer infected nodes, but fall back to all non-source nodes */}
                    {infectedNodes.length > 0
                      ? infectedNodes.filter(id => id !== recoverySource).map(id => (
                          <option key={id} value={id}>🔴 {id}</option>
                        ))
                      : originalNodes.filter(n => n.id !== recoverySource).map(n => (
                          <option key={n.id} value={n.id}>{n.id} ({n.type})</option>
                        ))
                    }
                  </select>
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] rounded text-[10px] font-mono leading-normal">
              {errorMsg}
            </div>
          )}

          {/* Action button */}
          {simulationStatus === 'idle' && (
            <button
              onClick={handlePlayPause}
              className="w-full py-2.5 bg-[#3B82F6] hover:bg-[#60A5FA] text-[#F8FAFC] font-bold rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition-colors uppercase"
            >
              <Play className="h-4 w-4" />
              Run Recovery Planner
            </button>
          )}
        </div>

        {/* Dynamic variable tracking structure dashboard */}
        {mode === 'recovery' && simulationStatus !== 'idle' && (
          <div className="p-4 space-y-4 flex flex-col flex-1 overflow-hidden">
            
            <div className="space-y-1">
              <label className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Active Action</label>
              <div className="bg-[#0F1720]/80 border border-[#4B5563]/30 rounded-lg p-3 text-[11px] font-mono text-[#F8FAFC] min-h-[44px] flex items-center leading-normal">
                {activeFrameData.action}
              </div>
            </div>

            {/* Display lists based on selected algorithm */}
            <div className="flex-1 flex flex-col overflow-hidden space-y-1.5">
              <label className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Algorithm Variables</label>
              <div className="flex-1 bg-[#0F1720]/40 border border-[#4B5563]/25 rounded-lg p-3 overflow-y-auto space-y-3 font-mono text-[10px]">
                
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

                {/* Connected Components groups */}
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
                    ) : <span className="text-[#94A3B8] italic">No components grouped yet</span>}
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

            {/* Infected Devices List */}
            <div className="flex-1 flex flex-col overflow-hidden space-y-1.5 border-t border-[#4B5563]/20 pt-3 min-h-[120px]">
              <label className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Infected Devices ({Object.keys(nodeSimStates).filter(id => nodeSimStates[id]?.status === 'infected' || nodeSimStates[id]?.status === 'compromising').length})</label>
              <div className="flex-1 bg-[#0F1720]/40 border border-[#4B5563]/25 rounded-lg p-2 overflow-y-auto space-y-1.5 scrollbar-thin">
                {Object.keys(nodeSimStates).filter(id => nodeSimStates[id]?.status === 'infected' || nodeSimStates[id]?.status === 'compromising').length > 0 ? (
                  Object.keys(nodeSimStates)
                    .filter(id => nodeSimStates[id]?.status === 'infected' || nodeSimStates[id]?.status === 'compromising')
                    .map(nodeId => {
                      const nodeState = nodeSimStates[nodeId] || {};
                      const isNodeIsolated = nodeState.isIsolated;
                      return (
                        <div 
                          key={nodeId}
                          onClick={() => {
                            if (reactFlowInstance) {
                              const nodeObj = nodes.find(n => n.id === nodeId);
                              if (nodeObj) {
                                reactFlowInstance.setCenter(nodeObj.position.x + 50, nodeObj.position.y + 20, { zoom: 1.6, duration: 800 });
                              }
                            }
                          }}
                          className="flex items-center justify-between bg-[#1B2838] border border-[#EF4444]/30 hover:border-[#FD802E] p-1.5 rounded cursor-pointer transition-all"
                        >
                          <div className="font-mono text-[9px] min-w-0 flex-1 pr-1.5">
                            <span className="text-[#F8FAFC] font-bold block truncate">{nodeId}</span>
                            <span className="text-[8px] text-[#EF4444] block truncate">{isNodeIsolated ? '🛡️ ISOLATED' : '🔴 INFECTED'}</span>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // One-click: run Dijkstra from recovery server to this infected device
                                recoverDeviceWithDijkstra(nodeId);
                              }}
                              title={`Run Dijkstra: ${recoverySource} → ${nodeId}`}
                              className="px-1.5 py-0.5 bg-[#3B82F6] hover:bg-[#60A5FA] text-[#F8FAFC] text-[8px] font-bold rounded uppercase"
                            >
                              Recover
                            </button>
                            {!isNodeIsolated ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleNodeIsolate(nodeId); }}
                                className="px-1.5 py-0.5 bg-[#EF4444] hover:bg-[#F87171] text-[#F8FAFC] text-[8px] font-bold rounded uppercase"
                              >
                                Isolate
                              </button>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleNodeRestore(nodeId); }}
                                className="px-1.5 py-0.5 bg-[#22C55E] hover:bg-[#4ADE80] text-[#0F1720] text-[8px] font-bold rounded uppercase"
                              >
                                Link
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-[#94A3B8] italic text-center my-auto text-[9px] py-4">No active threat payloads</div>
                )}
              </div>
            </div>

            {/* General metrics */}
            <div className="border-t border-[#4B5563]/20 pt-3 grid grid-cols-2 gap-2 text-center text-[9px] font-mono">
              <div className="bg-[#0F1720]/50 p-1.5 rounded border border-[#4B5563]/10">
                <span className="text-[#94A3B8] block text-[8px] uppercase tracking-wider mb-0.5">Healthy</span>
                <span className="text-emerald-400 font-black text-xs">{stats.healthy}</span>
              </div>
              <div className="bg-[#0F1720]/50 p-1.5 rounded border border-[#4B5563]/10">
                <span className="text-[#94A3B8] block text-[8px] uppercase tracking-wider mb-0.5">Infected</span>
                <span className="text-rose-500 font-black text-xs">{stats.infected}</span>
              </div>
              <div className="bg-[#0F1720]/50 p-1.5 rounded border border-[#4B5563]/10">
                <span className="text-[#94A3B8] block text-[8px] uppercase tracking-wider mb-0.5">Isolated</span>
                <span className="text-slate-300 font-black text-xs">{stats.isolated}</span>
              </div>
              <div className="bg-[#0F1720]/50 p-1.5 rounded border border-[#4B5563]/10">
                <span className="text-[#94A3B8] block text-[8px] uppercase tracking-wider mb-0.5">Blocked</span>
                <span className="text-rose-400 font-black text-xs">{stats.blocked}</span>
              </div>
              <div className="bg-[#0F1720]/50 p-1.5 rounded border border-[#4B5563]/10">
                <span className="text-[#94A3B8] block text-[8px] uppercase tracking-wider mb-0.5">Saved</span>
                <span className="text-cyan-400 font-black text-xs">{stats.saved}</span>
              </div>
              <div className="bg-[#0F1720]/50 p-1.5 rounded border border-[#4B5563]/10">
                <span className="text-[#94A3B8] block text-[8px] uppercase tracking-wider mb-0.5">Step</span>
                <span className="text-[#F8FAFC] font-black text-xs">{currentFrame + 1} / {timeline.length}</span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Auto-failover notification banner */}
        {notification && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-[#1B2838]/95 backdrop-blur border border-[#3B82F6]/50 text-[#CBD5E1] font-mono text-[10px] px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-[#3B82F6] text-sm">ℹ️</span>
            <span>{notification}</span>
          </div>
        )}
        
        {/* Playback timeline slider overlay */}
        {mode === 'recovery' && timeline.length > 0 && (
          <div className="h-12 bg-[#233D4C]/60 backdrop-blur-md border-b border-[#4B5563]/20 flex items-center justify-between px-6 z-10 select-none">
            <div className="flex items-center gap-1">
              <button
                onClick={prevStep}
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
                onClick={nextStep}
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
                  setCurrentFrame(parseInt(e.target.value) || 0);
                  pausePlayback();
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
        <div className="flex-1 h-full relative" style={{ pointerEvents: simulationStatus === 'loading' ? 'none' : 'auto' }}>
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
            <Controls className="react-flow__controls" />
          </ReactFlow>

          {/* Legend overlay card */}
          <div className="absolute bottom-4 left-4 bg-[#1B2838]/90 backdrop-blur border border-[#4B5563]/40 p-3 rounded-xl shadow-2xl z-20 font-sans text-[10px] text-[#CBD5E1] pointer-events-auto flex flex-col gap-1.5 min-w-[130px]">
            <div className="text-white font-bold mb-0.5 border-b border-[#4B5563]/25 pb-1 uppercase tracking-wider text-[8px] text-[#FD802E]">Status Legend</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#22C55E]/20 border border-[#22C55E]" /><span>🟢 Healthy</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#FD802E]/20 border border-[#FD802E]" /><span>🟠 Compromising</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#EF4444]/20 border border-[#EF4444]" /><span>🔴 Infected</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#3B82F6]/5 border border-[#3B82F6] border-dashed" /><span>🔵 Recovering</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#3B82F6]/20 border border-[#3B82F6]" /><span>🔵 Recovered</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#DFE3E6] border border-[#3B82F6]" /><span>🛡️ Isolated</span></div>
          </div>
        </div>

        {/* Pseudocode and learning bottom sheet details */}
        {mode === 'recovery' && timeline.length > 0 && learning.pseudoCode && (
          <div className="h-44 bg-[#233D4C] border-t border-[#4B5563]/30 p-4 flex gap-4 select-none z-10 flex-shrink-0 overflow-y-auto">
            {/* Pseudocode panel */}
            <div className="w-1/2 flex flex-col h-full overflow-hidden border border-[#4B5563]/20 rounded-lg bg-[#0F1720]/40">
              <div className="bg-[#1B2838] px-3 py-1.5 border-b border-[#4B5563]/25 text-[10px] font-bold text-[#FD802E] uppercase tracking-wider">
                Algorithm Tracing (Pseudocode)
              </div>
              <div className="flex-1 overflow-y-auto p-3 font-mono text-[9px] text-[#CBD5E1] space-y-0.5 leading-normal">
                {learning.pseudoCode.map((line, idx) => {
                  const isExtract = activeFrameData.action.includes('Inspecting device') && line.includes('ExtractMin');
                  const isRelax = activeFrameData.action.includes('Relaxed path cost') && line.includes('dist[u]');
                  const isUnion = activeFrameData.action.includes('Union') && line.includes('Union(');
                  const isCheck = activeFrameData.action.includes('Cycle detected') && line.includes('Find(');
                  const isHighlighted = isExtract || isRelax || isUnion || isCheck;
                  
                  return (
                    <div 
                      key={`code-${idx}`} 
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        isHighlighted ? 'bg-[#3B82F6]/20 text-[#3B82F6] font-bold border-l-2 border-[#3B82F6]' : ''
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
                    <span className="text-[#3B82F6] font-bold">{statistics.timeComplexity}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#4B5563]/10 pb-1">
                    <span className="text-[#94A3B8]">Space Complexity:</span>
                    <span className="text-[#3B82F6] font-bold">{statistics.spaceComplexity}</span>
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

export default function RecoveryPlanner() {
  return (
    <ReactFlowProvider>
      <RecoveryWorkspace />
    </ReactFlowProvider>
  );
}
