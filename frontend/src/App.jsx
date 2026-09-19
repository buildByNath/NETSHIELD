import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import NetworkBuilder from './pages/NetworkBuilder';
import AttackSimulation from './pages/AttackSimulation';
import RecoveryPlanner from './pages/RecoveryPlanner';
import LearningMode from './pages/LearningMode';
import Comparison from './pages/Comparison';
import Performance from './pages/Performance';
import Settings from './pages/Settings';
import { useSimulation } from './context/SimulationContext';

/**
 * File: App.jsx
 * Purpose: Main application framework — retro office theme applied globally.
 */

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { syncGraph, saveActiveProject, saveStatus } = useSimulation();

  useEffect(() => {
    syncGraph();
  }, [activePage]);

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':  return <Dashboard />;
      case 'builder':    return <NetworkBuilder />;
      case 'attack':     return <AttackSimulation />;
      case 'recovery':   return <RecoveryPlanner />;
      case 'learning':   return <LearningMode />;
      case 'comparison': return <Comparison />;
      case 'performance':return <Performance />;
      case 'settings':   return <Settings />;
      default:           return <Dashboard />;
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        background: 'var(--cth-ink-900)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--cth-font-ui)',
        color: 'var(--cth-cream-50)',
        userSelect: 'none',
      }}
    >
      {/* ── Retro Office Header Bar ────────────────────────────────── */}
      <header
        style={{
          height: '48px',
          background: 'var(--cth-ink-900)',
          color: 'var(--cth-cream-50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '3px solid var(--cth-lemon)',
          flexShrink: 0,
          zIndex: 100,
        }}
      >
        {/* Left: Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '18px' }}>🛡️</span>
          <div>
            <div
              style={{
                fontFamily: 'var(--cth-font-display)',
                fontSize: '11px',
                color: 'var(--cth-lemon)',
                letterSpacing: '2px',
                lineHeight: '1.2',
              }}
            >
              NETSHIELD
            </div>
            <div
              style={{
                fontFamily: 'var(--cth-font-display)',
                fontSize: '6px',
                color: 'var(--cth-ink-300)',
                letterSpacing: '1px',
                marginTop: '2px',
              }}
            >
              Network Attack Simulation & Response
            </div>
          </div>

          {/* NOC Badge */}
          <span
            style={{
              fontFamily: 'var(--cth-font-display)',
              fontSize: '7px',
              background: 'var(--cth-mint)',
              color: 'var(--cth-ink-900)',
              padding: '2px 8px',
              border: '1px solid var(--cth-ink-700)',
            }}
          >
            NOC CONSOLE
          </span>
        </div>

        {/* Right: Active module + Save */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontFamily: 'var(--cth-font-display)',
              fontSize: '7px',
              color: 'var(--cth-ink-300)',
            }}
          >
            ACTIVE:
          </span>
          <span
            style={{
              fontFamily: 'var(--cth-font-display)',
              fontSize: '8px',
              color: 'var(--cth-lemon)',
              background: 'var(--cth-ink-700)',
              padding: '2px 8px',
              border: '1px solid var(--cth-ink-500)',
              textTransform: 'uppercase',
            }}
          >
            {activePage === 'builder' ? 'Network Builder' : activePage}
          </span>

          <div style={{ width: '1px', height: '20px', background: 'var(--cth-ink-500)' }} />

          <button
            onClick={saveActiveProject}
            disabled={saveStatus === 'saving'}
            style={{
              fontFamily: 'var(--cth-font-display)',
              fontSize: '8px',
              background: saveStatus === 'saved' ? 'var(--cth-mint)' : saveStatus === 'error' ? 'var(--cth-coral)' : 'var(--cth-lemon)',
              color: 'var(--cth-ink-900)',
              border: '2px solid var(--cth-ink-900)',
              boxShadow: '2px 2px 0 var(--cth-ink-900)',
              padding: '4px 12px',
              cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
              opacity: saveStatus === 'saving' ? 0.6 : 1,
              transition: 'all 0.1s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Save changes to backend database"
          >
            💾 {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Error!' : 'Save Project'}
          </button>
        </div>
      </header>

      {/* ── Main Layout ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {renderActivePage()}
        </div>
      </div>
    </div>
  );
}
