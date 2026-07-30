import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Shield, Activity, Layers, AlertCircle, Heart, RefreshCw, Clock, Flame } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

/**
 * File: Dashboard.jsx
 * Author: Antigravity AI
 * Purpose: Main dashboard landing page presenting real-time network health metrics, security ratings, and elapsed execution timers.
 */

export default function Dashboard() {
  const {
    nodes,
    edges,
    mode,
    simulationStatus,
    elapsedSeconds,
    syncGraph
  } = useSimulation();

  // Compute stats in real-time from the node/edge states
  const totalNodes = nodes.length;
  const totalEdges = edges.length;
  const healthy = nodes.filter(n => n.data?.status === 'healthy').length;
  const infected = nodes.filter(n => n.data?.status === 'infected').length;
  const recovered = nodes.filter(n => n.data?.status === 'recovered').length;
  const protectedCount = nodes.filter(n => n.data?.status === 'protected').length;

  const totalCompromised = infected;
  
  // Average propagation speed: infected count / elapsed seconds
  const propagationSpeed = elapsedSeconds > 0 ? (infected / elapsedSeconds).toFixed(2) : '0.00';

  // System security rating: (healthy + protected + recovered) / totalNodes
  const securityPercentage = totalNodes > 0 ? (((healthy + protectedCount + recovered) / totalNodes) * 100) : 100;
  
  const getSecurityGrade = (percent) => {
    if (percent >= 90) return { grade: 'A', status: 'Secure', color: 'text-emerald-400' };
    if (percent >= 80) return { grade: 'B', status: 'Good', color: 'text-green-400' };
    if (percent >= 70) return { grade: 'C', status: 'Warning', color: 'text-yellow-400' };
    if (percent >= 50) return { grade: 'D', status: 'Critical', color: 'text-amber-500' };
    return { grade: 'F', status: 'Compromised', color: 'text-red-500 animate-pulse' };
  };

  const gradeInfo = getSecurityGrade(securityPercentage);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Pie chart data structure
  const pieData = [
    { name: 'Healthy', value: healthy + protectedCount, color: '#22C55E' },
    { name: 'Infected', value: infected, color: '#EF4444' },
    { name: 'Recovered', value: recovered, color: '#3B82F6' },
  ].filter(item => item.value > 0);

  const finalPieData = pieData.length > 0 ? pieData : [
    { name: 'No Devices Connected', value: 1, color: '#4B5563' }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0F1720] select-none text-sans text-xs">
      
      {/* Page Title Header */}
      <div className="flex justify-between items-center pb-2 border-b border-[#4B5563]/25">
        <div>
          <h2 className="text-xl font-bold text-[#F8FAFC]">NOC OPERATIONS DASHBOARD</h2>
          <p className="text-[#94A3B8] text-[11px] mt-0.5">Real-time summary of network health status metrics.</p>
        </div>
        <button
          onClick={syncGraph}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#233D4C] border border-[#4B5563]/30 hover:border-[#FD802E]/40 text-[#CBD5E1] hover:text-[#FD802E] rounded-lg transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* Grid summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card: Total nodes */}
        <div className="bg-[#233D4C] p-4 rounded-xl border border-[#4B5563]/25 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider font-sans">Total Devices</div>
            <div className="text-2xl font-black text-[#F8FAFC] mt-1 font-mono">{totalNodes}</div>
          </div>
          <div className="p-3 bg-[#0F1720]/50 rounded-lg text-[#FD802E] border border-[#4B5563]/10">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        {/* Card: Total Edges */}
        <div className="bg-[#233D4C] p-4 rounded-xl border border-[#4B5563]/25 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider font-sans">Active Links</div>
            <div className="text-2xl font-black text-[#F8FAFC] mt-1 font-mono">{totalEdges}</div>
          </div>
          <div className="p-3 bg-[#0F1720]/50 rounded-lg text-emerald-400 border border-[#4B5563]/10">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        {/* Card: Healthy Nodes */}
        <div className="bg-[#233D4C] p-4 rounded-xl border border-[#4B5563]/25 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider font-sans">Healthy / Safe</div>
            <div className="text-2xl font-black text-[#22C55E] mt-1 font-mono">{healthy + protectedCount}</div>
          </div>
          <div className="p-3 bg-[#0F1720]/50 rounded-lg text-[#22C55E] border border-[#4B5563]/10">
            <Heart className="h-6 w-6" />
          </div>
        </div>

        {/* Card: Infected Nodes */}
        <div className="bg-[#233D4C] p-4 rounded-xl border border-[#4B5563]/25 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider font-sans">Infected / Compromised</div>
            <div className="text-2xl font-black text-[#EF4444] mt-1 font-mono">{infected}</div>
          </div>
          <div className="p-3 bg-[#0F1720]/50 rounded-lg text-[#EF4444] border border-[#4B5563]/10">
            <AlertCircle className="h-6 w-6 animate-pulse" />
          </div>
        </div>
      </div>

      {/* NOC Real-time Propagation & Security Metrics */}
      <div className="bg-[#233D4C]/30 border border-[#4B5563]/25 rounded-xl p-5 space-y-4">
        <h3 className="text-xs uppercase font-bold text-[#F8FAFC] tracking-wider border-b border-[#4B5563]/10 pb-2 flex items-center justify-between">
          <span>Real-time Attack Propagation & Security Analytics</span>
          {mode !== 'idle' && (
            <span className="text-[9px] font-mono bg-[#FD802E]/20 text-[#FD802E] px-2 py-0.5 rounded uppercase">
              {mode} active ({simulationStatus})
            </span>
          )}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          {/* Compromised Count */}
          <div className="bg-[#0F1720]/40 p-3 rounded-lg border border-[#4B5563]/15 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-[#94A3B8] uppercase block">Compromised nodes</span>
              <span className="text-lg font-bold text-red-500 mt-1 block">{totalCompromised} devices</span>
            </div>
            <Flame className="h-5 w-5 text-red-500" />
          </div>

          {/* Propagation Speed */}
          <div className="bg-[#0F1720]/40 p-3 rounded-lg border border-[#4B5563]/15 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-[#94A3B8] uppercase block">Infection Rate</span>
              <span className="text-lg font-bold text-amber-500 mt-1 block">{propagationSpeed} nodes/s</span>
            </div>
            <Activity className="h-5 w-5 text-amber-500" />
          </div>

          {/* Security Rating */}
          <div className="bg-[#0F1720]/40 p-3 rounded-lg border border-[#4B5563]/15 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-[#94A3B8] uppercase block">Security Rating</span>
              <span className={`text-lg font-bold mt-1 block ${gradeInfo.color}`}>
                {securityPercentage.toFixed(1)}% - Grade {gradeInfo.grade}
              </span>
            </div>
            <Shield className="h-5 w-5 text-[#3B82F6]" />
          </div>

          {/* Playback elapsed time */}
          <div className="bg-[#0F1720]/40 p-3 rounded-lg border border-[#4B5563]/15 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-[#94A3B8] uppercase block">Elapsed Duration</span>
              <span className="text-lg font-bold text-cyan-400 mt-1 block">{formatTime(elapsedSeconds)}</span>
            </div>
            <Clock className="h-5 w-5 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Charts Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart distribution */}
        <div className="lg:col-span-1 bg-[#233D4C] border border-[#4B5563]/25 rounded-xl p-5 flex flex-col items-center">
          <h3 className="text-xs uppercase font-bold text-[#F8FAFC] tracking-wider border-b border-[#4B5563]/10 pb-2 w-full text-left">
            Device Health Distribution
          </h3>
          <div className="h-64 w-full flex justify-center items-center mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finalPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {finalPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1B2838', border: '1px solid #4B5563', borderRadius: '8px' }}
                  itemStyle={{ color: '#F8FAFC', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="flex gap-4 text-[10px] font-mono text-[#CBD5E1] pt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#22C55E]"></span>
              <span>Healthy: {healthy + protectedCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#EF4444]"></span>
              <span>Infected: {infected}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#3B82F6]"></span>
              <span>Recovered: {recovered}</span>
            </div>
          </div>
        </div>

        {/* Informational NOC Log card */}
        <div className="lg:col-span-2 bg-[#233D4C] border border-[#4B5563]/25 rounded-xl p-5 flex flex-col justify-between">
          <div className="space-y-3 font-sans">
            <h3 className="text-xs uppercase font-bold text-[#F8FAFC] tracking-wider border-b border-[#4B5563]/10 pb-2">
              System Operations Center Status
            </h3>
            
            <div className="space-y-4 text-sm text-[#CBD5E1] leading-relaxed pt-2">
              <p>
                Welcome to <strong>NETSHIELD Network Operations Center</strong>. This workspace is customized for studying graph modeling and optimization. Use the left navigation panel to switch modules:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15">
                  <strong className="text-[#FD802E]">🖧 Network Builder</strong>
                  <p className="text-[#94A3B8] text-[10px] mt-0.5">Drag & drop connections, edit weights and latency variables on nodes.</p>
                </div>
                <div className="p-3 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15">
                  <strong className="text-[#FD802E]">🐛 Attack Simulation</strong>
                  <p className="text-[#94A3B8] text-[10px] mt-0.5">Model propagation of viruses (Worm, Scanner) running BFS/DFS traversals.</p>
                </div>
                <div className="p-3 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15">
                  <strong className="text-[#FD802E]">🛡 Recovery Planner</strong>
                  <p className="text-[#94A3B8] text-[10px] mt-0.5">Generate recovery routing using Dijkstra, Prim, Kruskal, and dynamic algorithms.</p>
                </div>
                <div className="p-3 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15">
                  <strong className="text-[#FD802E]">📘 Learning Mode</strong>
                  <p className="text-[#94A3B8] text-[10px] mt-0.5">Review data structures, pseudo-codes, and mathematical complexity charts.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-[#4B5563]/15 pt-3 mt-6 flex justify-between items-center text-[10px] font-mono text-[#94A3B8]">
            <span>Active Project: {totalNodes > 0 ? 'Loaded Network Graph' : 'Empty'}</span>
            <span>Security Status: {gradeInfo.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
