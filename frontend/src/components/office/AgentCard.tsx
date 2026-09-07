import React, { useRef, useEffect } from 'react';
import { Agent, useStore } from '../../store/store';
import { paintCastPortrait } from '../../scene/cast';

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
}

const statusColors: Record<string, string> = {
  idle: 'var(--cth-status-idle)',
  working: 'var(--cth-status-working)',
  thinking: 'var(--cth-status-thinking)',
  blocked: 'var(--cth-status-blocked)',
  success: 'var(--cth-status-success)',
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent, isSelected }) => {
  const selectAgent = useStore((s) => s.selectAgent);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 36;
    canvas.height = 56;
    ctx.imageSmoothingEnabled = false;
    paintCastPortrait(ctx, agent.character, 2);
  }, [agent.character]);

  return (
    <div
      onClick={() => selectAgent(agent.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px',
        marginBottom: '6px',
        background: isSelected ? 'var(--cth-lemon-light)' : 'var(--cth-paper-100)',
        border: `2px solid ${isSelected ? 'var(--cth-lemon)' : 'var(--cth-ink-300)'}`,
        boxShadow: isSelected ? '3px 3px 0 var(--cth-ink-900)' : '2px 2px 0 var(--cth-ink-100)',
        cursor: 'pointer',
        transition: 'all 0.1s ease',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '36px',
          height: '56px',
          background: 'var(--cth-cream-200)',
          border: '1px solid var(--cth-ink-900)',
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--cth-font-display)',
            fontSize: '9px',
            color: 'var(--cth-ink-900)',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {agent.name} {agent.isGod ? '👑' : ''}
          </span>
        </div>
        <div
          style={{
            fontFamily: 'var(--cth-font-ui)',
            fontSize: '11px',
            color: 'var(--cth-ink-700)',
            marginBottom: '4px',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {agent.description}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: statusColors[agent.status] || 'var(--cth-status-idle)',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--cth-font-display)',
              fontSize: '7px',
              color: 'var(--cth-ink-500)',
              textTransform: 'uppercase',
            }}
          >
            {agent.status}
          </span>
        </div>
      </div>
    </div>
  );
};
