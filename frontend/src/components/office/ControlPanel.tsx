import React, { useState } from 'react';
import { useStore, AgentStatus } from '../../store/store';
import { PixelPanel } from './PixelPanel';
import { PixelButton } from './PixelButton';

export const ControlPanel: React.FC = () => {
  const {
    agents,
    benchCandidates,
    selectedAgentId,
    setAgentStatus,
    setAgentAction,
    removeAgent,
    hireFromBench,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'inspector' | 'bench'>('inspector');
  const [selectedBenchCandidate, setSelectedBenchCandidate] = useState<string | null>(
    benchCandidates[0]?.name || null
  );
  const [customRole, setCustomRole] = useState('');

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);
  const statuses: AgentStatus[] = ['working', 'thinking', 'idle', 'success', 'blocked'];

  const handleHireCandidate = (candidateName: string) => {
    const candidate = benchCandidates.find((c) => c.name === candidateName);
    const roleToAssign = customRole.trim() || candidate?.suggestedRole || 'Office Worker';
    hireFromBench(candidateName, roleToAssign);
    setCustomRole('');
    setSelectedBenchCandidate(benchCandidates[0]?.name || null);
  };

  return (
    <PixelPanel style={{ height: '100%' }}>
      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
        <PixelButton
          size="sm"
          variant={activeTab === 'inspector' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('inspector')}
        >
          🔍 Inspector
        </PixelButton>
        <PixelButton
          size="sm"
          variant={activeTab === 'bench' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('bench')}
        >
          🛋️ Bench ({benchCandidates.length})
        </PixelButton>
      </div>

      {activeTab === 'inspector' && (
        <>
          {selectedAgent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontFamily: 'var(--cth-font-display)', fontSize: '8px', color: 'var(--cth-ink-500)' }}>
                  WORKER NAME & GENDER
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--cth-ink-900)' }}>
                  {selectedAgent.name} ({selectedAgent.gender === 'female' ? 'Female ♀' : 'Male ♂'}) {selectedAgent.isGod ? '👑' : ''}
                </div>
              </div>

              <div>
                <div style={{ fontFamily: 'var(--cth-font-display)', fontSize: '8px', color: 'var(--cth-ink-500)' }}>
                  ROLE / TITLE
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--cth-ink-700)' }}>
                  {selectedAgent.description}
                </div>
              </div>

              <div>
                <div style={{ fontFamily: 'var(--cth-font-display)', fontSize: '8px', color: 'var(--cth-ink-500)', marginBottom: '4px' }}>
                  CURRENT STATUS
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {statuses.map((st) => (
                    <PixelButton
                      key={st}
                      size="sm"
                      variant={selectedAgent.status === st ? 'primary' : 'secondary'}
                      onClick={() => setAgentStatus(selectedAgent.id, st)}
                    >
                      {st}
                    </PixelButton>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontFamily: 'var(--cth-font-display)', fontSize: '8px', color: 'var(--cth-ink-500)', marginBottom: '4px' }}>
                  CURRENT ACTIVITY
                </div>
                <input
                  type="text"
                  value={selectedAgent.action || ''}
                  onChange={(e) => setAgentAction(selectedAgent.id, e.target.value)}
                  placeholder="What is this worker doing?"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '2px solid var(--cth-ink-900)',
                    fontFamily: 'var(--cth-font-ui)',
                    fontSize: '12px',
                    background: 'var(--cth-paper-100)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <PixelButton
                  variant="danger"
                  size="sm"
                  onClick={() => removeAgent(selectedAgent.id)}
                  disabled={selectedAgent.isGod}
                >
                  🔥 Move to Bench
                </PixelButton>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--cth-ink-500)', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>
              Click on any worker on the floor or desk to inspect and control.
            </div>
          )}
        </>
      )}

      {activeTab === 'bench' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontFamily: 'var(--cth-font-display)', fontSize: '9px', color: 'var(--cth-ink-900)' }}>
            BENCH CANDIDATES POOL
          </div>

          {benchCandidates.length === 0 ? (
            <div style={{ fontSize: '11px', color: 'var(--cth-ink-500)', padding: '12px', textAlign: 'center' }}>
              All available bench workers have been hired to the floor!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {benchCandidates.map((candidate) => {
                const isSelected = selectedBenchCandidate === candidate.name;
                return (
                  <div
                    key={candidate.name}
                    onClick={() => {
                      setSelectedBenchCandidate(candidate.name);
                      setCustomRole(candidate.suggestedRole);
                    }}
                    style={{
                      padding: '8px',
                      background: isSelected ? 'var(--cth-lemon-light)' : 'var(--cth-paper-100)',
                      border: `2px solid ${isSelected ? 'var(--cth-lemon)' : 'var(--cth-ink-300)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--cth-ink-900)' }}>
                        {candidate.name} {candidate.gender === 'female' ? '👧 (Female)' : '👦 (Male)'}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--cth-ink-500)' }}>
                        {candidate.suggestedRole}
                      </div>
                    </div>
                    {isSelected && (
                      <span style={{ fontSize: '12px', color: 'var(--cth-lemon)' }}>✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {selectedBenchCandidate && (
            <div style={{ marginTop: '8px', borderTop: '1px dashed var(--cth-ink-300)', paddingTop: '10px' }}>
              <div style={{ fontFamily: 'var(--cth-font-display)', fontSize: '8px', color: 'var(--cth-ink-500)', marginBottom: '4px' }}>
                ASSIGN JOB TITLE
              </div>
              <input
                type="text"
                placeholder="Job Role / Title"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px',
                  border: '1px solid var(--cth-ink-900)',
                  fontSize: '11px',
                  marginBottom: '8px',
                }}
              />
              <PixelButton
                variant="success"
                size="sm"
                style={{ width: '100%' }}
                onClick={() => handleHireCandidate(selectedBenchCandidate)}
              >
                + Hire {selectedBenchCandidate} to Floor
              </PixelButton>
            </div>
          )}
        </div>
      )}
    </PixelPanel>
  );
};
