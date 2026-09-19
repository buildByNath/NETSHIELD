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
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--cth-ink-900, #141923)', color: 'var(--cth-cream-50, #F8FAFC)', fontFamily: 'var(--cth-font-ui)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '2px solid var(--cth-ink-700, #2D3748)' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--cth-font-display)', fontSize: '13px', color: 'var(--cth-lemon, #FFE066)', margin: 0, letterSpacing: '1px' }}>NOC OPERATIONS DASHBOARD</h2>
          <p style={{ fontFamily: 'var(--cth-font-ui)', color: 'var(--cth-ink-300, #CBD5E0)', fontSize: '12px', marginTop: '4px' }}>Real-time summary of network health status metrics.</p>
        </div>
        <button
          onClick={syncGraph}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--cth-ink-800, #1E2538)', border: '1px solid var(--cth-ink-700, #2D3748)', boxShadow: '2px 2px 0 var(--cth-ink-900)', cursor: 'pointer', fontFamily: 'var(--cth-font-display)', fontSize: '8px', color: 'var(--cth-lemon, #FFE066)' }}
        >
          <RefreshCw size={12} />
          Refresh Stats
        </button>
      </div>

      {/* Grid summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Total Devices',       value: totalNodes,            color: 'var(--cth-lemon)',  icon: <Layers size={22} />,     bg: 'rgba(255, 224, 102, 0.12)' },
          { label: 'Active Links',         value: totalEdges,            color: 'var(--cth-sky)',    icon: <Activity size={22} />,   bg: 'rgba(96, 165, 250, 0.12)' },
          { label: 'Healthy / Safe',       value: healthy + protectedCount, color: 'var(--cth-mint)', icon: <Heart size={22} />,   bg: 'rgba(122, 229, 130, 0.12)' },
          { label: 'Infected / Compromised', value: infected,            color: 'var(--cth-coral)', icon: <AlertCircle size={22} />, bg: 'rgba(248, 113, 113, 0.12)' },
        ].map((card) => (
          <div key={card.label} className="retro-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div style={{ fontFamily: 'var(--cth-font-display)', fontSize: '7px', color: 'var(--cth-ink-400, #A0AEC0)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{card.label}</div>
              <div style={{ fontFamily: 'var(--cth-font-mono)', fontSize: '28px', fontWeight: 900, color: card.color, lineHeight: 1 }}>{card.value}</div>
            </div>
            <div style={{ padding: '10px', background: card.bg, border: '1px solid var(--cth-ink-700, #2D3748)', color: card.color, flexShrink: 0, borderRadius: '4px' }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Attack Propagation & Security Metrics */}
      <div className="retro-card">
        <div style={{ fontFamily: 'var(--cth-font-display)', fontSize: '9px', color: 'var(--cth-lemon, #FFE066)', textTransform: 'uppercase', letterSpacing: '1px', paddingBottom: '10px', borderBottom: '1px solid var(--cth-ink-700, #2D3748)', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Real-time Attack Propagation & Security Analytics</span>
          {mode !== 'idle' && (
            <span style={{ fontFamily: 'var(--cth-font-display)', fontSize: '7px', background: 'rgba(248, 113, 113, 0.15)', color: 'var(--cth-coral)', padding: '2px 8px', border: '1px solid var(--cth-coral)' }}>
              {mode} active ({simulationStatus})
            </span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { label: 'Compromised Nodes', value: `${totalCompromised} devices`, color: 'var(--cth-coral)', icon: <Flame size={18} /> },
            { label: 'Infection Rate',    value: `${propagationSpeed} nodes/s`, color: 'var(--cth-peach, #FB923C)', icon: <Activity size={18} /> },
            { label: 'Security Rating',   value: `${securityPercentage.toFixed(1)}% — ${gradeInfo.grade}`, color: 'var(--cth-sky)', icon: <Shield size={18} /> },
            { label: 'Elapsed Duration',  value: formatTime(elapsedSeconds),    color: 'var(--cth-mint)', icon: <Clock size={18} /> },
          ].map((m) => (
            <div key={m.label} style={{ padding: '10px', background: 'var(--cth-ink-900, #141923)', border: '1px solid var(--cth-ink-700, #2D3748)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '4px' }}>
              <div>
                <div style={{ fontFamily: 'var(--cth-font-display)', fontSize: '7px', color: 'var(--cth-ink-400, #A0AEC0)', textTransform: 'uppercase', marginBottom: '4px' }}>{m.label}</div>
                <div style={{ fontFamily: 'var(--cth-font-mono)', fontSize: '15px', fontWeight: 700, color: m.color }}>{m.value}</div>
              </div>
              <span style={{ color: m.color, opacity: 0.85 }}>{m.icon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts & Info Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
        {/* Pie Chart */}
        <div className="retro-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--cth-font-display)', fontSize: '8px', color: 'var(--cth-lemon, #FFE066)', textTransform: 'uppercase', letterSpacing: '1px', paddingBottom: '10px', borderBottom: '1px solid var(--cth-ink-700, #2D3748)', marginBottom: '12px', width: '100%' }}>
            Device Health Distribution
          </div>
          <div style={{ height: '220px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={finalPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {finalPieData.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--cth-ink-900, #141923)', border: '1px solid var(--cth-ink-700, #2D3748)', borderRadius: '4px', fontFamily: 'var(--cth-font-ui)', fontSize: '11px', color: '#F8FAFC' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: '12px', fontFamily: 'var(--cth-font-mono)', fontSize: '10px', color: 'var(--cth-ink-300, #CBD5E0)', paddingTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 10, height: 10, background: 'var(--cth-mint)', display: 'inline-block', borderRadius: '2px' }} />Healthy: {healthy + protectedCount}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 10, height: 10, background: 'var(--cth-coral)', display: 'inline-block', borderRadius: '2px' }} />Infected: {infected}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 10, height: 10, background: 'var(--cth-sky)', display: 'inline-block', borderRadius: '2px' }} />Recovered: {recovered}</span>
          </div>
        </div>

        {/* NOC Info card */}
        <div className="retro-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--cth-font-display)', fontSize: '9px', color: 'var(--cth-lemon, #FFE066)', textTransform: 'uppercase', letterSpacing: '1px', paddingBottom: '10px', borderBottom: '1px solid var(--cth-ink-700, #2D3748)', marginBottom: '14px' }}>
              System Operations Center Status
            </div>
            <p style={{ fontFamily: 'var(--cth-font-ui)', fontSize: '13px', color: 'var(--cth-ink-200, #E2E8F0)', lineHeight: '1.6', marginBottom: '14px' }}>
              Welcome to <strong style={{ color: 'var(--cth-lemon, #FFE066)' }}>NETSHIELD Network Operations Center</strong>. This workspace models network attacks and recovery using graph algorithms.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { icon: '🏢', title: 'Network Builder', desc: 'Pixel-art office floor — each worker = a network device. Click desks to configure nodes.' },
                { icon: '🔥', title: 'Attack Simulation', desc: 'Model virus propagation (Worm, Scanner) using BFS/DFS graph traversals.' },
                { icon: '🛡️', title: 'Recovery Planner', desc: 'Generate recovery routing using Dijkstra, Prim, Kruskal, and dynamic programming.' },
                { icon: '📚', title: 'Learning Mode', desc: 'Review data structures, pseudo-codes, and mathematical complexity charts.' },
              ].map((item) => (
                <div key={item.title} style={{ padding: '10px', background: 'var(--cth-ink-900, #141923)', border: '1px solid var(--cth-ink-700, #2D3748)', borderLeft: '3px solid var(--cth-lemon)', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--cth-font-display)', fontSize: '8px', color: 'var(--cth-lemon, #FFE066)', marginBottom: '4px' }}>{item.icon} {item.title}</div>
                  <div style={{ fontFamily: 'var(--cth-font-ui)', fontSize: '11px', color: 'var(--cth-ink-300, #CBD5E0)' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px dashed var(--cth-ink-700, #2D3748)', paddingTop: '10px', marginTop: '14px', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--cth-font-display)', fontSize: '7px', color: 'var(--cth-ink-400, #A0AEC0)' }}>
            <span>Active Project: {totalNodes > 0 ? 'Office Setup Network (18 Devices)' : 'Office Setup'}</span>
            <span>Security Status: {gradeInfo.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
