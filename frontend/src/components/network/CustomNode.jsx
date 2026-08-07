import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { 
  Globe, Shield, Network, Layers, Monitor, Laptop, Printer, Server, Database, Wifi, Cloud, ShieldAlert, Cpu, Check, ShieldX
} from 'lucide-react';

/**
 * File: CustomNode.jsx
 * Author: Antigravity AI
 * Purpose: Custom React Flow Node component with NOC styles, status glow rings, hover tooltip, progress trackers, and quick actions context overlay.
 */

// Device icon selector helper
const getDeviceIcon = (type) => {
  switch (type) {
    case 'Internet':
      return <Globe className="h-5 w-5" />;
    case 'Firewall':
      return <ShieldAlert className="h-5 w-5" />;
    case 'Router':
      return <Network className="h-5 w-5" />;
    case 'Core Switch':
      return <Layers className="h-5 w-5 text-amber-500" />;
    case 'Access Switch':
      return <Layers className="h-5 w-5" />;
    case 'PC':
      return <Monitor className="h-5 w-5" />;
    case 'Laptop':
      return <Laptop className="h-5 w-5" />;
    case 'Printer':
      return <Printer className="h-5 w-5" />;
    case 'Application Server':
      return <Cpu className="h-5 w-5 text-indigo-400" />;
    case 'Database Server':
      return <Database className="h-5 w-5 text-cyan-400" />;
    case 'Backup Server':
      return <Server className="h-5 w-5 text-rose-400" />;
    case 'Wireless Access Point':
      return <Wifi className="h-5 w-5" />;
    case 'Cloud':
      return <Cloud className="h-5 w-5" />;
    default:
      return <Monitor className="h-5 w-5" />;
  }
};

export default function CustomNode({ id, data, selected }) {
  const status = data.status || 'healthy';
  const label = data.label || 'Device';
  const type = data.type || 'PC';
  const isIsolated = data.isIsolated ?? false;
  const progressVal = data.progress ?? 0;
  const mode = data.mode ?? 'idle';
  const isRecoverySource = data.isRecoverySource ?? false;

  const [hovered, setHovered] = useState(false);

  // Inline styles — immune to Tailwind JIT purging in Docker builds
  const getStatusStyles = () => {
    if (isIsolated) {
      return {
        bg: '#DFE3E6',
        border: '2px solid #3B82F6',
        boxShadow: '0 0 12px rgba(59,130,246,0.6)',
        iconColor: '#3B82F6',
        labelColor: '#0F1720',
        subColor: '#4A5568',
        pulse: false
      };
    }

    switch (status) {
      case 'infected':
        return {
          bg: 'rgba(239,68,68,0.15)',
          border: '1px solid #EF4444',
          boxShadow: '0 0 14px rgba(239,68,68,0.5)',
          iconColor: '#EF4444',
          labelColor: '#F8FAFC',
          subColor: '#94A3B8',
          pulse: true
        };
      case 'compromising':
      case 'reached':
        return {
          bg: 'rgba(253,128,46,0.10)',
          border: '1px solid #FD802E',
          boxShadow: '0 0 12px rgba(253,128,46,0.5)',
          iconColor: '#FD802E',
          labelColor: '#F8FAFC',
          subColor: '#94A3B8',
          pulse: true
        };
      case 'recovering':
        return {
          bg: 'rgba(59,130,246,0.05)',
          border: '2px dashed #3B82F6',
          boxShadow: '0 0 12px rgba(59,130,246,0.4)',
          iconColor: '#3B82F6',
          labelColor: '#F8FAFC',
          subColor: '#94A3B8',
          pulse: true
        };
      case 'recovered':
        return {
          bg: 'rgba(59,130,246,0.10)',
          border: '1px solid #3B82F6',
          boxShadow: '0 0 10px rgba(59,130,246,0.3)',
          iconColor: '#3B82F6',
          labelColor: '#F8FAFC',
          subColor: '#94A3B8',
          pulse: false
        };
      case 'protected':
        return {
          bg: 'rgba(250,204,21,0.10)',
          border: '1px solid #FACC15',
          boxShadow: '0 0 12px rgba(250,204,21,0.5)',
          iconColor: '#FACC15',
          labelColor: '#F8FAFC',
          subColor: '#94A3B8',
          pulse: false
        };
      case 'healthy':
      default:
        return {
          bg: '#1B2838',
          border: '1px solid rgba(34,197,94,0.4)',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          iconColor: '#22C55E',
          labelColor: '#F8FAFC',
          subColor: '#94A3B8',
          pulse: false
        };
    }
  };

  const ss = getStatusStyles();

  const handleIsolateClick = (e) => {
    e.stopPropagation();
    if (data.onIsolate) data.onIsolate(id);
  };
  const handleRecoverClick = (e) => {
    e.stopPropagation();
    if (data.onRecover) data.onRecover(id);
  };
  const handleRestoreClick = (e) => {
    e.stopPropagation();
    if (data.onRestore) data.onRestore(id);
  };

  const showProgress = status === 'compromising' || status === 'recovering';
  const showQuickActions = selected && mode !== 'idle';

  return (
    <div 
      className={`flex flex-col gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[150px] text-left select-none relative ${ss.pulse ? 'animate-pulse' : ''} ${selected ? 'ring-2 ring-[#FD802E]' : ''}`}
      style={{ pointerEvents: 'all', backgroundColor: ss.bg, border: ss.border, boxShadow: ss.boxShadow }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Target & Source Handles in 4 directions */}
      <Handle type="target" position={Position.Top} className="opacity-0 hover:opacity-100" id="t-top" />
      <Handle type="source" position={Position.Bottom} className="opacity-0 hover:opacity-100" id="s-bottom" />
      <Handle type="target" position={Position.Left} className="opacity-0 hover:opacity-100" id="t-left" />
      <Handle type="source" position={Position.Right} className="opacity-0 hover:opacity-100" id="s-right" />

      {/* Main Node Layout Body */}
      <div className="flex items-center gap-2.5">
        {/* Device Icon Panel */}
        <div className="p-1.5 rounded border border-[#4B5563]/20 flex-shrink-0" style={{ backgroundColor: '#0F1720', color: ss.iconColor }}>
          {isIsolated ? <Shield className="h-5 w-5" style={{ color: '#3B82F6' }} /> : getDeviceIcon(type)}
        </div>

        {/* Device Labels */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold truncate leading-tight" style={{ color: ss.labelColor }}>{label}</div>
          <div className="text-[9px] uppercase tracking-wider truncate leading-tight mt-0.5" style={{ color: ss.subColor }}>{type}</div>
        </div>
      </div>

      {/* Interactive progress bar */}
      {showProgress && (
        <div className="w-full mt-1.5 flex flex-col gap-0.5 border-t border-[#4B5563]/10 pt-1.5">
          <div className={`flex justify-between text-[8px] font-mono ${isIsolated ? 'text-[#0F1720]' : 'text-[#94A3B8]'}`}>
            <span className="capitalize">{status}...</span>
            <span>{Math.round(progressVal)}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#0F1720] rounded overflow-hidden border border-[#4B5563]/25">
            <div 
              className="h-full transition-all duration-100"
              style={{ width: `${progressVal}%`, backgroundColor: status === 'compromising' ? '#FD802E' : '#3B82F6' }}
            />
          </div>
        </div>
      )}

      {/* Status Badges */}
      {!showProgress && (
        <div className="flex gap-1 items-center mt-1 text-[8px] font-mono">
          {status === 'infected' && (
            <span className="text-[#EF4444] font-bold flex items-center gap-0.5">
              <span className="w-1 h-1 rounded-full bg-[#EF4444] animate-ping" />
              🔴 INFECTED
            </span>
          )}
          {status === 'recovered' && (
            <span className="text-[#3B82F6] font-bold flex items-center gap-0.5">
              <Check className="h-2.5 w-2.5" />
              🔵 RECOVERED
            </span>
          )}
          {isIsolated && (
            <span className="text-[#3B82F6] font-bold flex items-center gap-0.5">
              <Shield className="h-2.5 w-2.5 fill-[#3B82F6]/10" />
              🛡️ ISOLATED
            </span>
          )}
        </div>
      )}

      {/* Recovery Source Badge */}
      {isRecoverySource && !isIsolated && (
        <div className="flex items-center gap-0.5 mt-1 text-[7.5px] font-mono bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded px-1 py-0.5">
          <span className="text-[#3B82F6] font-black">🛡️</span>
          <span className="text-[#3B82F6] font-bold uppercase tracking-wider">RECOVERY SOURCE</span>
        </div>
      )}

      {/* Hover Tooltip Overlay */}
      {hovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 bg-[#0F1720]/95 border border-[#4B5563]/40 p-2.5 rounded-lg shadow-xl z-50 min-w-[160px] font-mono text-[9px] text-[#CBD5E1] pointer-events-none space-y-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-white font-bold border-b border-[#4B5563]/20 pb-0.5 mb-1">{label}</div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={status === 'infected' ? 'text-[#EF4444] font-bold' : status === 'recovered' ? 'text-[#3B82F6] font-bold' : 'text-emerald-400'}>
              {status.toUpperCase()}
            </span>
          </div>
          {status === 'compromising' && (
            <div className="flex justify-between">
              <span>Compromise:</span>
              <span className="text-[#FD802E] font-bold">{Math.round(progressVal)}%</span>
            </div>
          )}
          {status === 'recovering' && (
            <div className="flex justify-between">
              <span>Recovery:</span>
              <span className="text-[#3B82F6] font-bold">{Math.round(progressVal)}%</span>
            </div>
          )}
          {isIsolated && (
            <div className="text-[#3B82F6] font-bold text-center border-t border-[#4B5563]/15 pt-1 mt-1">
              🛡️ NETWORK ISOLATED
            </div>
          )}
        </div>
      )}

      {/* Floating Quick Action Overlay context cards */}
      {showQuickActions && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[#1B2838] border border-[#FD802E]/60 p-2 rounded-lg shadow-2xl flex flex-col gap-1.5 z-50 min-w-[130px] text-[10px] font-sans">
          <div className="text-[#94A3B8] font-bold text-center border-b border-[#4B5563]/20 pb-1 mb-1 truncate">
            {label} Options
          </div>
          {!isIsolated ? (
            <>
              {(status === 'infected' || status === 'compromising') && (
                <button
                  onClick={handleRecoverClick}
                  className="w-full py-1 bg-[#3B82F6] hover:bg-[#60A5FA] text-[#F8FAFC] font-bold rounded text-center transition-colors shadow"
                >
                  Recover Node
                </button>
              )}
              <button
                onClick={handleIsolateClick}
                className="w-full py-1 bg-[#EF4444] hover:bg-[#F87171] text-[#F8FAFC] font-bold rounded text-center transition-colors shadow"
              >
                Isolate Node
              </button>
            </>
          ) : (
            <>
              {(status === 'infected' || status === 'compromising') && (
                <button
                  onClick={handleRecoverClick}
                  className="w-full py-1 bg-[#3B82F6] hover:bg-[#60A5FA] text-[#F8FAFC] font-bold rounded text-center transition-colors shadow"
                >
                  Recover Node
                </button>
              )}
              <button
                onClick={handleRestoreClick}
                className="w-full py-1 bg-[#22C55E] hover:bg-[#4ADE80] text-[#0F1720] font-bold rounded text-center transition-colors shadow"
              >
                Restore Links
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
