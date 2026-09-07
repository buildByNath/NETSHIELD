import React, { useState } from 'react';
import { useOfficeStore } from '../store/store';
import { OfficeFloor } from '../components/office/OfficeFloor';
import { AgentCard } from '../components/office/AgentCard';
import { AgentStrip } from '../components/office/AgentStrip';
import { ControlPanel } from '../components/office/ControlPanel';
import { PixelButton } from '../components/office/PixelButton';
import { DeskMenuModal } from '../components/office/DeskMenuModal';
import { useSimulation } from '../context/SimulationContext';

/**
 * File: NetworkBuilder.jsx
 * Purpose: Office Setup floor simulation replacing the React Flow canvas.
 * The pixel-art office floor visualizes the network topology — each character
 * at a desk represents a network device. Status maps:
 *   working  → device healthy
 *   blocked  → device infected
 *   idle     → device offline
 *   success  → device recovered
 */

export default function NetworkBuilder() {
  const { agents, selectedAgentId, setAgentStatus } = useOfficeStore();
  const { nodes, simulationStatus } = useSimulation();

  const [officeTheme, setOfficeTheme] = useState('office');
  const officeThemeSetter = useOfficeStore((s) => s.setOfficeTheme);

  const handleSimulateWork = () => {
    agents.forEach((a) => {
      if (a.isGod) return;
      const rand = Math.random();
      if (rand < 0.4) setAgentStatus(a.id, 'working');
      else if (rand < 0.7) setAgentStatus(a.id, 'thinking');
      else setAgentStatus(a.id, 'idle');
    });
  };

  const handleAllWorking = () => {
    agents.forEach((a) => setAgentStatus(a.id, 'working'));
  };

  const handleAllIdle = () => {
    agents.forEach((a) => setAgentStatus(a.id, 'idle'));
  };

  const handleThemeChange = (theme) => {
    setOfficeTheme(theme);
    officeThemeSetter(theme);
  };

  // Compute network stats from simulation context
  const totalDevices = agents.length;
  const healthyCount = agents.filter(a => a.status === 'working').length;
  const infectedCount = agents.filter(a => a.status === 'blocked').length;
  const offlineCount = agents.filter(a => a.status === 'idle').length;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: 'var(--cth-cream-50)',
        overflow: 'hidden',
      }}
    >
      {/* ── Retro Office Sub-Header ─────────────────────────────────── */}
      <header
        style={{
          height: '42px',
          background: 'var(--cth-ink-900)',
          color: 'var(--cth-cream-50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          borderBottom: '2px solid var(--cth-ink-700)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontFamily: 'var(--cth-font-display)',
              fontSize: '10px',
              color: 'var(--cth-lemon)',
              letterSpacing: '1px',
            }}
          >
            🏢 NETSHIELD — OFFICE NETWORK FLOOR
          </span>
          <span
            style={{
              fontFamily: 'var(--cth-font-display)',
              fontSize: '7px',
              background: 'var(--cth-mint)',
              color: 'var(--cth-ink-900)',
              padding: '2px 6px',
            }}
          >
            LIVE SIM
          </span>

          {/* Network Health Stats */}
          <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
            <span style={{ fontFamily: 'var(--cth-font-display)', fontSize: '7px', color: 'var(--cth-mint)' }}>
              🟢 {healthyCount} healthy
            </span>
            <span style={{ fontFamily: 'var(--cth-font-display)', fontSize: '7px', color: 'var(--cth-coral)' }}>
              🔴 {infectedCount} infected
            </span>
            <span style={{ fontFamily: 'var(--cth-font-display)', fontSize: '7px', color: 'var(--cth-ink-300)' }}>
              ⚫ {offlineCount} offline
            </span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Theme Switcher */}
          <select
            value={officeTheme}
            onChange={(e) => handleThemeChange(e.target.value)}
            style={{
              fontFamily: 'var(--cth-font-display)',
              fontSize: '8px',
              background: 'var(--cth-ink-700)',
              color: 'var(--cth-cream-50)',
              border: '1px solid var(--cth-ink-500)',
              padding: '2px 6px',
              cursor: 'pointer',
            }}
          >
            <option value="office">🏢 Office Floor</option>
            <option value="brooklyn99">🚔 Brooklyn 99</option>
          </select>

          <PixelButton size="sm" variant="primary" onClick={handleSimulateWork}>
            ⚡ Randomize
          </PixelButton>
          <PixelButton size="sm" variant="success" onClick={handleAllWorking}>
            💻 All Online
          </PixelButton>
          <PixelButton size="sm" variant="secondary" onClick={handleAllIdle}>
            ☕ All Offline
          </PixelButton>
        </div>
      </header>

      {/* ── Main Office Workspace ───────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar: Staff Roster / Network Devices */}
        <aside
          style={{
            width: '240px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--cth-paper-200)',
            borderRight: '2px solid var(--cth-ink-300)',
            flexShrink: 0,
          }}
        >
          {/* Roster Header */}
          <div
            style={{
              fontFamily: 'var(--cth-font-display)',
              fontSize: '8px',
              color: 'var(--cth-cream-50)',
              background: 'var(--cth-ink-900)',
              padding: '6px 10px',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            STAFF ROSTER ({agents.length})
          </div>

          {/* Device legend */}
          <div
            style={{
              fontFamily: 'var(--cth-font-display)',
              fontSize: '7px',
              color: 'var(--cth-ink-500)',
              marginBottom: '8px',
              padding: '4px 6px',
              background: 'var(--cth-cream-100)',
              border: '1px solid var(--cth-ink-100)',
            }}
          >
            Worker = Network Device
          </div>

          {/* Scrollable roster */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isSelected={agent.id === selectedAgentId}
              />
            ))}
          </div>
        </aside>

        {/* Center: PixiJS Office Canvas */}
        <main style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: '8px' }}>
          <div
            style={{
              width: '100%',
              height: '100%',
              border: '2px solid var(--cth-ink-900)',
              boxShadow: 'var(--cth-shadow-hard)',
              position: 'relative',
            }}
          >
            <OfficeFloor />

            {/* Controls hint overlay */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(26, 19, 32, 0.85)',
                color: 'var(--cth-cream-50)',
                fontFamily: 'var(--cth-font-display)',
                fontSize: '7px',
                padding: '6px 10px',
                border: '1px solid var(--cth-ink-300)',
                pointerEvents: 'none',
                lineHeight: '1.6',
              }}
            >
              Drag workers | Click desk for Device Config | Arrow keys move | Scroll zoom
            </div>
          </div>
        </main>

        {/* Right Panel: Control Inspector & Bench Candidates */}
        <aside
          style={{
            width: '290px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--cth-paper-200)',
            borderLeft: '2px solid var(--cth-ink-300)',
            flexShrink: 0,
          }}
        >
          <ControlPanel />
        </aside>
      </div>

      {/* Bottom Status Bar */}
      <AgentStrip />

      {/* Desk Click Modal */}
      <DeskMenuModal />
    </div>
  );
}
