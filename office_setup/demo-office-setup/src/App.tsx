import { useStore } from './store/store';
import { OfficeFloor } from './components/OfficeFloor';
import { AgentCard } from './components/AgentCard';
import { ControlPanel } from './components/ControlPanel';
import { AgentStrip } from './components/AgentStrip';
import { PixelPanel } from './components/PixelPanel';
import { PixelButton } from './components/PixelButton';
import { DeskMenuModal } from './components/DeskMenuModal';
import './design/tokens.css';

export function App() {
  const { agents, selectedAgentId, setAgentStatus } = useStore();

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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        background: 'var(--cth-cream-50)',
        overflow: 'hidden',
      }}
    >
      {/* Retro Header */}
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
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontFamily: 'var(--cth-font-display)',
              fontSize: '12px',
              color: 'var(--cth-lemon)',
              letterSpacing: '1px',
            }}
          >
            🏢 MUNDER DIFFLIN - RETRO OFFICE FLOOR
          </span>
          <span
            style={{
              fontFamily: 'var(--cth-font-display)',
              fontSize: '8px',
              background: 'var(--cth-mint)',
              color: 'var(--cth-ink-900)',
              padding: '2px 6px',
              borderRadius: '2px',
            }}
          >
            LIVE SIMULATION
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PixelButton size="sm" variant="primary" onClick={handleSimulateWork}>
            ⚡ Randomize Activity
          </PixelButton>
          <PixelButton size="sm" variant="success" onClick={handleAllWorking}>
            💻 All Work
          </PixelButton>
          <PixelButton size="sm" variant="secondary" onClick={handleAllIdle}>
            ☕ All Break
          </PixelButton>
        </div>
      </header>

      {/* Main Workspace */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar: Staff Roster */}
        <aside style={{ width: '260px', padding: '8px', display: 'flex', flexDirection: 'column' }}>
          <PixelPanel title={`STAFF ROSTER (${agents.length})`} style={{ height: '100%' }}>
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isSelected={agent.id === selectedAgentId}
              />
            ))}
          </PixelPanel>
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
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(26, 19, 32, 0.85)',
                color: '#fff',
                fontFamily: 'var(--cth-font-display)',
                fontSize: '8px',
                padding: '6px 10px',
                border: '1px solid var(--cth-ink-300)',
                pointerEvents: 'none',
              }}
            >
              Controls: Drag workers | Click desk for Desk Menu | Arrow keys move worker | Scroll zoom
            </div>
          </div>
        </main>

        {/* Right Panel: Control Inspector & Bench Candidates */}
        <aside style={{ width: '310px', padding: '8px', display: 'flex', flexDirection: 'column' }}>
          <ControlPanel />
        </aside>
      </div>

      {/* Bottom Status Bar */}
      <AgentStrip />

      {/* Retro Desk Menu Modal */}
      <DeskMenuModal />
    </div>
  );
}

export default App;
