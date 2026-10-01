import React from 'react';
import { useStore } from '../../store/store';
import { useSimulation } from '../../context/SimulationContext';

/**
 * File: HoverDeskTooltip.tsx
 * Purpose: Lightweight hover tooltip shown when mousing over a desk in the OfficeFloor canvas.
 * Displays real-time device attack compromise %, CRT screen state, and worker status.
 */

const STATUS_COLORS: Record<string, string> = {
  working: '#22C55E',
  thinking: '#F59E0B',
  idle: '#6B7280',
  blocked: '#EF4444',
  success: '#3B82F6',
};

const getDeskNodeId = (deskIdx: number) => {
  if (deskIdx === 0) return 'SRV-1';
  if (deskIdx >= 1 && deskIdx <= 8) return `PC-${deskIdx}`;
  if (deskIdx === 9) return 'L-1';
  return null;
};

export const HoverDeskTooltip: React.FC = () => {
  const { hoverDeskInfo, agents } = useStore();
  const { nodeSimStates } = useSimulation();

  if (!hoverDeskInfo) return null;

  const { deskIndex, agentId, screenX, screenY } = hoverDeskInfo;
  const agent = agentId ? agents.find((a) => a.id === agentId) : undefined;
  const nodeId = getDeskNodeId(deskIndex);
  const simState = nodeId && nodeSimStates ? nodeSimStates[nodeId] : null;

  const simStatus = simState?.status || 'healthy';
  const simProgress = Math.round(simState?.progress ?? (simStatus === 'infected' ? 100 : 0));

  // Determine device state styling & description
  let deviceColor = '#22C55E';
  let deviceBadge = 'HEALTHY';
  let screenDesc = 'CRT: Active Code Stream';
  let isUnderAttack = false;

  const isServer = nodeId === 'SRV-1';

  if (simStatus === 'compromising') {
    deviceColor = '#F97316';
    deviceBadge = isServer ? `SRV BREACH ${simProgress}% [SOS]` : `BREACHING ${simProgress}%`;
    screenDesc = isServer ? `Server Rack: 🔴 SOS Morse Red LEDs (${simProgress}%)` : `CRT: Warming Red Tint (${simProgress}%)`;
    isUnderAttack = true;
  } else if (simStatus === 'infected') {
    deviceColor = '#EF4444';
    deviceBadge = isServer ? 'SRV COMPROMISED [SOS]' : 'INFECTED (100%)';
    screenDesc = isServer ? 'Server Rack: 🔴 SOS Morse Red Light + Beacon' : 'CRT: 🔴 Red Strobe Skull Alert';
    isUnderAttack = true;
  } else if (simStatus === 'recovering') {
    deviceColor = '#06B6D4';
    deviceBadge = isServer ? `SRV PATCHING ${simProgress}%` : `PATCHING ${simProgress}%`;
    screenDesc = isServer ? 'Server Rack: 🛡️ Antivirus Cyan Sweep' : 'CRT: 🛡️ Antivirus Matrix Sweep';
  } else if (simStatus === 'recovered') {
    deviceColor = '#10B981';
    deviceBadge = isServer ? 'SRV SECURED' : 'SECURED';
    screenDesc = isServer ? 'Server Rack: 🟢 Green & 🟡 Yellow LEDs Active' : 'CRT: Restored Code IDE';
  } else if (simStatus === 'offline') {
    deviceColor = '#6B7280';
    deviceBadge = 'OFFLINE / ISOLATED';
    screenDesc = 'CRT: Power Standby';
  } else if (isServer && simStatus === 'healthy') {
    deviceBadge = 'SRV ONLINE';
    screenDesc = 'Server Rack: 🟢 Green & 🟡 Yellow LEDs Active';
  }

  const TOOLTIP_WIDTH = 240;
  const TOOLTIP_HEIGHT = 160;
  const OFFSET = 14;

  // Position tooltip near cursor, flipping when close to viewport edges
  let left = screenX + OFFSET;
  let top = screenY + OFFSET;

  if (left + TOOLTIP_WIDTH > window.innerWidth - 8) {
    left = screenX - TOOLTIP_WIDTH - OFFSET;
  }
  left = Math.max(8, left);

  if (top + TOOLTIP_HEIGHT > window.innerHeight - 8) {
    top = screenY - TOOLTIP_HEIGHT - OFFSET;
  }
  top = Math.max(8, top);

  const statusColor = isUnderAttack ? '#EF4444' : agent ? (STATUS_COLORS[agent.status] || '#6B7280') : '#6B7280';

  return (
    <div
      style={{
        position: 'fixed',
        left: left + 'px',
        top: top + 'px',
        width: TOOLTIP_WIDTH + 'px',
        zIndex: 8888,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(17,24,39,0.96) 0%, rgba(15,23,42,0.98) 100%)',
          border: `1.5px solid ${deviceColor}66`,
          borderRadius: '10px',
          padding: '10px 12px',
          boxShadow: `0 8px 24px rgba(0,0,0,0.65), 0 0 12px ${deviceColor}33`,
          backdropFilter: 'blur(8px)',
          fontFamily: "'Courier New', monospace",
          animation: 'tooltipFadeIn 0.15s ease-out',
        }}
      >
        <style>{'@keyframes tooltipFadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }'}</style>

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '10px', color: '#94A3B8', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            DESK #{deskIndex + 1} {nodeId ? `[${nodeId}]` : ''}
          </span>
          <span
            style={{
              fontSize: '8px',
              background: deviceColor + '22',
              color: deviceColor,
              padding: '2px 6px',
              borderRadius: '4px',
              border: `1px solid ${deviceColor}66`,
              textTransform: 'uppercase',
              fontWeight: 'bold',
              letterSpacing: '0.5px'
            }}
          >
            {deviceBadge}
          </span>
        </div>

        {agent ? (
          <>
            <div style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#F8FAFC' }}>
                  {agent.name}
                </span>
                {isUnderAttack && (
                  <span style={{ fontSize: '9px', color: '#F87171', animation: 'pulse 1s infinite' }}>
                    😱 PANIC!
                  </span>
                )}
              </div>
              <div style={{ fontSize: '9px', color: '#94A3B8', lineHeight: '1.4' }}>
                {agent.description}
              </div>
            </div>

            {/* CRT Monitor & Device Telemetry card */}
            <div style={{ background: '#090D14', border: '1px solid #1E293B', borderRadius: '6px', padding: '6px 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                <span style={{ fontSize: '8px', color: '#FD802E', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  Hardware CRT & Virus State
                </span>
                <span style={{ fontSize: '8px', color: deviceColor, fontWeight: 'bold' }}>
                  {simStatus.toUpperCase()}
                </span>
              </div>

              {/* Progress bar for breach or patching */}
              {(simStatus === 'compromising' || simStatus === 'recovering') && (
                <div style={{ width: '100%', height: '4px', background: '#1E293B', borderRadius: '2px', overflow: 'hidden', margin: '4px 0' }}>
                  <div
                    style={{
                      width: `${simProgress}%`,
                      height: '100%',
                      background: simStatus === 'compromising' ? 'linear-gradient(90deg, #F97316, #EF4444)' : 'linear-gradient(90deg, #06B6D4, #10B981)',
                      transition: 'width 0.2s linear'
                    }}
                  />
                </div>
              )}

              <div style={{ fontSize: '8.5px', color: '#CBD5E1', marginTop: '2px' }}>
                {screenDesc}
              </div>
              <div style={{ fontSize: '7.5px', color: '#64748B', marginTop: '4px' }}>
                Hover = Status | Click = Seat Options
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '8px 0', color: '#6B7280', fontSize: '10px' }}>
            <div style={{ fontSize: '16px', marginBottom: '2px' }}>🖥️</div>
            <div style={{ color: '#E2E8F0', fontWeight: 'bold', fontSize: '9.5px' }}>{screenDesc}</div>
            <div style={{ fontSize: '8px', color: '#64748B', marginTop: '2px' }}>Click to assign a worker</div>
          </div>
        )}
      </div>
    </div>
  );
};
