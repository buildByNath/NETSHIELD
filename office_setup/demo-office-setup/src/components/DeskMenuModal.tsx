import React, { useState } from 'react';
import { useStore } from '../store/store';
import { PixelPanel } from './PixelPanel';
import { PixelButton } from './PixelButton';

export const DeskMenuModal: React.FC = () => {
  const {
    activeDeskMenu,
    closeDeskMenu,
    agents,
    setAgentStatus,
    setAgentSeated,
    removeAgent,
    selectAgent,
  } = useStore();

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(agents[0]?.id || '');

  if (!activeDeskMenu) return null;

  const currentAgent = activeDeskMenu.agentId
    ? agents.find((a) => a.id === activeDeskMenu.agentId)
    : undefined;

  const handleAssignWorkerToDesk = (agentIdToAssign: string) => {
    const targetAgent = agents.find((a) => a.id === agentIdToAssign);
    if (!targetAgent) return;
    selectAgent(targetAgent.id);
    setAgentSeated(targetAgent.id, true);
    closeDeskMenu();
  };

  const handleToggleSit = () => {
    if (!currentAgent) return;
    selectAgent(currentAgent.id);
    const newSeated = currentAgent.isSeated === false;
    setAgentSeated(currentAgent.id, newSeated);
    closeDeskMenu();
  };

  const handleToggleWorkStatus = (newStatus: 'working' | 'thinking' | 'idle') => {
    if (!currentAgent) return;
    setAgentStatus(currentAgent.id, newStatus);
    closeDeskMenu();
  };

  const handleFireWorker = () => {
    if (!currentAgent || currentAgent.isGod) return;
    if (confirm(`Fire ${currentAgent.name}? Worker will be moved to the bench pool.`)) {
      removeAgent(currentAgent.id);
      closeDeskMenu();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(26, 19, 32, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={closeDeskMenu}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '340px',
        }}
      >
        <PixelPanel title={`DESK #${activeDeskMenu.deskIndex + 1} CONTROLS`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {currentAgent ? (
              <>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--cth-font-display)',
                      fontSize: '9px',
                      color: 'var(--cth-lemon)',
                      marginBottom: '4px',
                    }}
                  >
                    CURRENT OCCUPANT
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--cth-ink-900)' }}>
                    {currentAgent.name} {currentAgent.isGod ? '👑 (Boss)' : ''} ({currentAgent.gender === 'female' ? 'Female ♀' : 'Male ♂'})
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--cth-ink-700)' }}>
                    {currentAgent.description}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Sit vs Stand Toggle */}
                  <PixelButton
                    variant={currentAgent.isSeated === false ? 'success' : 'primary'}
                    onClick={handleToggleSit}
                  >
                    {currentAgent.isSeated === false ? '🪑 Sit at Desk' : '🚶 Stand Up from Desk'}
                  </PixelButton>

                  {/* Status Selection Buttons */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <PixelButton
                      size="sm"
                      style={{ flex: 1 }}
                      variant={currentAgent.status === 'working' ? 'primary' : 'secondary'}
                      onClick={() => handleToggleWorkStatus('working')}
                    >
                      💻 Work
                    </PixelButton>
                    <PixelButton
                      size="sm"
                      style={{ flex: 1 }}
                      variant={currentAgent.status === 'thinking' ? 'primary' : 'secondary'}
                      onClick={() => handleToggleWorkStatus('thinking')}
                    >
                      💡 Think
                    </PixelButton>
                    <PixelButton
                      size="sm"
                      style={{ flex: 1 }}
                      variant={currentAgent.status === 'idle' ? 'primary' : 'secondary'}
                      onClick={() => handleToggleWorkStatus('idle')}
                    >
                      ☕ Break
                    </PixelButton>
                  </div>

                  <PixelButton
                    variant="danger"
                    size="sm"
                    onClick={handleFireWorker}
                    disabled={currentAgent.isGod}
                  >
                    🔥 Fire Worker (To Bench)
                  </PixelButton>
                </div>
              </>
            ) : (
              <div>
                <div
                  style={{
                    fontFamily: 'var(--cth-font-display)',
                    fontSize: '9px',
                    color: 'var(--cth-lemon)',
                    marginBottom: '6px',
                  }}
                >
                  DESK STATUS: UNASSIGNED
                </div>
                <div style={{ fontSize: '11px', color: 'var(--cth-ink-700)', marginBottom: '12px' }}>
                  This desk is currently empty. Select a staff member to sit and work at this desk:
                </div>

                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '2px solid var(--cth-ink-900)',
                    fontFamily: 'var(--cth-font-ui)',
                    fontSize: '12px',
                    marginBottom: '10px',
                    background: 'var(--cth-paper-100)',
                  }}
                >
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.description})
                    </option>
                  ))}
                </select>

                <PixelButton
                  variant="success"
                  style={{ width: '100%' }}
                  onClick={() => handleAssignWorkerToDesk(selectedWorkerId)}
                >
                  🪑 Assign & Sit Worker Here
                </PixelButton>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <PixelButton variant="secondary" size="sm" onClick={closeDeskMenu}>
                Close
              </PixelButton>
            </div>
          </div>
        </PixelPanel>
      </div>
    </div>
  );
};
