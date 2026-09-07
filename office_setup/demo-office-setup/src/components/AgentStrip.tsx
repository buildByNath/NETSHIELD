import React from 'react';
import { useStore } from '../store/store';

const statusColors: Record<string, string> = {
  idle: 'var(--cth-status-idle)',
  working: 'var(--cth-status-working)',
  thinking: 'var(--cth-status-thinking)',
  blocked: 'var(--cth-status-blocked)',
  success: 'var(--cth-status-success)',
};

export const AgentStrip: React.FC = () => {
  const { agents, selectedAgentId, selectAgent } = useStore();

  return (
    <div
      style={{
        height: '36px',
        background: 'var(--cth-ink-900)',
        borderTop: '2px solid var(--cth-ink-700)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: '8px',
        overflowX: 'auto',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--cth-font-display)',
          fontSize: '8px',
          color: 'var(--cth-cream-300)',
          marginRight: '8px',
          whiteSpace: 'nowrap',
        }}
      >
        FLOOR STATUS:
      </span>
      {agents.map((agent) => {
        const isSelected = agent.id === selectedAgentId;
        return (
          <button
            key={agent.id}
            onClick={() => selectAgent(agent.id)}
            style={{
              background: isSelected ? 'var(--cth-lemon)' : 'var(--cth-ink-700)',
              color: isSelected ? 'var(--cth-ink-900)' : 'var(--cth-cream-50)',
              border: `1px solid ${isSelected ? 'var(--cth-lemon)' : 'var(--cth-ink-500)'}`,
              padding: '2px 8px',
              fontFamily: 'var(--cth-font-display)',
              fontSize: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '2px',
              whiteSpace: 'nowrap',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: statusColors[agent.status] || 'var(--cth-status-idle)',
              }}
            />
            {agent.name}
          </button>
        );
      })}
    </div>
  );
};
