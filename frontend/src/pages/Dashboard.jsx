import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Shield, Activity, Users, Layers, AlertCircle, Heart, RefreshCw } from 'lucide-react';
import { projectService } from '../services/api';

/**
 * File: Dashboard.jsx
 * Author: Antigravity AI
 * Purpose: Main dashboard landing page querying graph metrics and showing status pie charts.
 */

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalNodes: 0,
    totalEdges: 0,
    healthy: 0,
    infected: 0,
    recovered: 0,
    protectedCount: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchGraphStats = async () => {
    setLoading(true);
    try {
      // Try local storage autosave draft first
      const draftStr = localStorage.getItem('netshield_autosave');
      let nodes = [];
      let edges = [];
      
      if (draftStr) {
        const draft = JSON.parse(draftStr);
        nodes = draft.nodes || [];
        edges = draft.edges || [];
      } else {
        // Query backend if local draft is empty
        const response = await projectService.loadProject();
        if (response.success && response.project && response.project.network) {
          nodes = response.project.network.nodes || [];
          edges = response.project.network.edges || [];
        }
      }
      
      const healthy = nodes.filter(n => n.data?.status === 'healthy' || n.status === 'healthy').length;
      const infected = nodes.filter(n => n.data?.status === 'infected' || n.status === 'infected').length;
      const recovered = nodes.filter(n => n.data?.status === 'recovered' || n.status === 'recovered').length;
      const protectedCount = nodes.filter(n => n.data?.status === 'protected' || n.status === 'protected').length;

      setStats({
        totalNodes: nodes.length,
        totalEdges: edges.length,
        healthy,
        infected,
        recovered,
        protectedCount,
      });
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphStats();
  }, []);

  // Pie chart data structure
  const pieData = [
    { name: 'Healthy', value: stats.healthy + stats.protectedCount, color: '#22C55E' },
    { name: 'Infected', value: stats.infected, color: '#EF4444' },
    { name: 'Recovered', value: stats.recovered, color: '#3B82F6' },
  ].filter(item => item.value > 0); // Hide zero categories

  // Fallback data if empty graph
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
          onClick={fetchGraphStats}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#233D4C] border border-[#4B5563]/30 hover:border-[#FD802E]/40 text-[#CBD5E1] hover:text-[#FD802E] rounded-lg transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* Grid summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card: Total nodes */}
        <div className="bg-[#233D4C] p-4 rounded-xl border border-[#4B5563]/25 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">Total Devices</div>
            <div className="text-2xl font-black text-[#F8FAFC] mt-1">{stats.totalNodes}</div>
          </div>
          <div className="p-3 bg-[#0F1720]/50 rounded-lg text-[#FD802E] border border-[#4B5563]/10">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        {/* Card: Total Edges */}
        <div className="bg-[#233D4C] p-4 rounded-xl border border-[#4B5563]/25 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">Active Links</div>
            <div className="text-2xl font-black text-[#F8FAFC] mt-1">{stats.totalEdges}</div>
          </div>
          <div className="p-3 bg-[#0F1720]/50 rounded-lg text-emerald-400 border border-[#4B5563]/10">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        {/* Card: Healthy Nodes */}
        <div className="bg-[#233D4C] p-4 rounded-xl border border-[#4B5563]/25 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">Healthy / Safe</div>
            <div className="text-2xl font-black text-[#22C55E] mt-1">{stats.healthy + stats.protectedCount}</div>
          </div>
          <div className="p-3 bg-[#0F1720]/50 rounded-lg text-[#22C55E] border border-[#4B5563]/10">
            <Heart className="h-6 w-6" />
          </div>
        </div>

        {/* Card: Infected Nodes */}
        <div className="bg-[#233D4C] p-4 rounded-xl border border-[#4B5563]/25 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">Infected / Compromised</div>
            <div className="text-2xl font-black text-[#EF4444] mt-1">{stats.infected}</div>
          </div>
          <div className="p-3 bg-[#0F1720]/50 rounded-lg text-[#EF4444] border border-[#4B5563]/10">
            <AlertCircle className="h-6 w-6 animate-pulse" />
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
              <span>Healthy: {stats.healthy + stats.protectedCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#EF4444]"></span>
              <span>Infected: {stats.infected}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#3B82F6]"></span>
              <span>Recovered: {stats.recovered}</span>
            </div>
          </div>
        </div>

        {/* Informational NOC Log card */}
        <div className="lg:col-span-2 bg-[#233D4C] border border-[#4B5563]/25 rounded-xl p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold text-[#F8FAFC] tracking-wider border-b border-[#4B5563]/10 pb-2">
              System Operations Center Status
            </h3>
            
            <div className="space-y-4 font-sans text-sm text-[#CBD5E1] leading-relaxed pt-2">
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
                  <p className="text-[#94A3B8] text-[10px] mt-0.5">Model propagation of viruses (Worm, Scanner) running BFS/DFS transversals.</p>
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
            <span>Active Project: {stats.totalNodes > 0 ? 'Loaded Network Graph' : 'Empty'}</span>
            <span>Security Status: Nominal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
