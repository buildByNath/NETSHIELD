import React from 'react';
import { useStore } from '../../store/store';

/**
 * File: HoverDeskTooltip.tsx
 * Purpose: Lightweight hover tooltip shown when mousing over a desk in the OfficeFloor canvas.
 * Unlike DeskMenuModal (full modal), this is a small non-blocking info card.
 */

const STATUS_COLORS: Record<string, string> = {
  working: '#22C55E',
  thinking: '#F59E0B',
  idle: '#6B7280',
  blocked: '#EF4444',
  success: '#3B82F6',
};

const STATUS_LABELS: Record<string, string> = {
  working: 'Online — Working',
  thinking: 'Thinking...',
  idle: 'On Break',
  blocked: 'Compromised / Blocked',
  success: 'Recovered',
};

const DEVICE_ICONS: Record<string, string> = {
  working: '??',
  thinking: '??',
  idle: '?',
  blocked: '?',
  success: '?',
};

export const HoverDeskTooltip: React.FC = () => {
  const { hoverDeskInfo, agents } = useStore();

  if (!hoverDeskInfo) return null;

  const { deskIndex, agentId, screenX, screenY } = hoverDeskInfo;
  const agent = agentId ? agents.find((a) => a.id === agentId) : undefined;

  const TOOLTIP_WIDTH = 220;
  const TOOLTIP_HEIGHT = 130;

  const left = Math.min(screenX - TOOLTIP_WIDTH / 2, window.innerWidth - TOOLTIP_WIDTH - 16);
  const top = Math.max(screenY - TOOLTIP_HEIGHT - 16, 8);

  const statusColor = agent ? (STATUS_COLORS[agent.status] ?? '#6B7280') : '#6B7280';

  return (
    <div
      style={{
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        width: `${TOOLTIP_WIDTH}px`,
        zIndex: 8888,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1B2838 0%, #0F1720 100%)',
          border: `1.5px solid ${statusColor}55`,
          borderRadius: '10px',
          padding: '10px 12px',
          boxShadow: `0 8px 24px rgba(0,0,0,0.55), 0 0 0 1px ${statusColor}20`,
          fontFamily: "'Courier New', monospace",
          animation: 'tooltipFadeIn 0.15s ease-out',
        }}
      >
        <style>{`@keyframes tooltipFadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }`}</style>

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '9px', color: '#94A3B8', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            DESK #{deskIndex + 1}
          </span>
          {agent && (
            <span style={{ fontSize: '8px', background: `${statusColor}20`, color: statusColor, padding: '1px 6px', borderRadius: '4px', border: `1px solid ${statusColor}40`, textTransform: 'uppercase', fontWeight: 'bold' }}>
              {agent.status}
            </span>
          )}
        </div>

        {agent ? (
          <>
            <div style={{ marginBottom: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#F8FAFC', marginBottom: '2px' }}>
                {DEVICE_ICONS[agent.status]} {agent.name}
              </div>
              <div style={{ fontSize: '9px', color: '#94A3B8', lineHeight: '1.5' }}>
                {agent.description}
              </div>
            </div>

            <div style={{ background: '#0F1720', border: '1px solid #374151', borderRadius: '6px', padding: '5px 8px' }}>
              <div style={{ fontSize: '8px', color: '#FD802E', fontWeight: 'bold', marginBottom: '2px', textTransform: 'uppercase' }}>Network Device Status</div>
              <div style={{ fontSize: '9px', color: statusColor, fontWeight: 'bold' }}>{STATUS_LABELS[agent.status]}</div>
              <div style={{ fontSize: '8px', color: '#6B7280', marginTop: '3px' }}>Hover = Info · Click = Full Controls</div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '8px 0', color: '#6B7280', fontSize: '10px' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>??</div>
            <div>Empty Desk</div>
            <div style={{ fontSize: '8px', color: '#4B5563', marginTop: '2px' }}>Click to assign a worker</div>
          </div>
        )}
      </div>
    </div>
  );
};
