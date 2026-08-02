import React from 'react';
import { Handle, Position } from 'reactflow';
import { 
  Globe, Shield, Network, Layers, Monitor, Laptop, Printer, Server, Database, Wifi, Cloud, ShieldAlert, Cpu
} from 'lucide-react';

/**
 * File: CustomNode.jsx
 * Author: Antigravity AI
 * Purpose: Custom React Flow Node component with NOC styles and status glow rings.
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

export default function CustomNode({ data, selected }) {
  const status = data.status || 'healthy';
  const label = data.label || 'Device';
  const type = data.type || 'PC';

  // Dynamic colors matching user specifications
  const getStatusClasses = () => {
    switch (status) {
      case 'infected':
        return {
          border: 'border-[#EF4444] shadow-[0_0_12px_rgba(239,68,68,0.5)]',
          bg: 'bg-[#EF4444]/10',
          text: 'text-[#EF4444]',
          glow: 'animate-pulse'
        };
      case 'recovered':
        return {
          border: 'border-[#3B82F6] shadow-[0_0_12px_rgba(59,130,246,0.5)]',
          bg: 'bg-[#3B82F6]/10',
          text: 'text-[#3B82F6]',
          glow: 'animate-pulse'
        };
      case 'queued':
        return {
          border: 'border-dashed border-2 border-[#FD802E] shadow-[0_0_8px_rgba(253,128,46,0.3)]',
          bg: 'bg-[#FD802E]/5',
          text: 'text-[#FD802E]',
          glow: 'animate-pulse'
        };
      case 'protected':
        return {
          border: 'border-[#FACC15] shadow-[0_0_12px_rgba(250,204,21,0.5)]',
          bg: 'bg-[#FACC15]/10',
          text: 'text-[#FACC15]',
          glow: ''
        };
      case 'healthy':
      default:
        return {
          border: 'border-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.2)]',
          bg: 'bg-[#22C55E]/5',
          text: 'text-[#22C55E]',
          glow: ''
        };
    }
  };

  const statusStyle = getStatusClasses();
  const activeBorder = selected ? 'ring-2 ring-[#FD802E]' : '';

  return (
    <div 
      className={`flex items-center gap-3 px-3 py-2 rounded-lg border bg-[#1B2838] transition-all duration-200 min-w-[140px] text-left select-none ${statusStyle.border} ${statusStyle.glow} ${activeBorder}`}
      style={{ pointerEvents: 'all' }}
    >
      {/* Target & Source Handles in 4 directions */}
      <Handle type="target" position={Position.Top} className="opacity-0 hover:opacity-100" id="t-top" />
      <Handle type="source" position={Position.Bottom} className="opacity-0 hover:opacity-100" id="s-bottom" />
      <Handle type="target" position={Position.Left} className="opacity-0 hover:opacity-100" id="t-left" />
      <Handle type="source" position={Position.Right} className="opacity-0 hover:opacity-100" id="s-right" />

      {/* Device Icon Panel */}
      <div className={`p-1.5 rounded bg-[#0F1720] ${statusStyle.text} border border-[#4B5563]/20`}>
        {getDeviceIcon(type)}
      </div>

      {/* Device Labels */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="text-xs font-bold text-[#F8FAFC] truncate leading-tight">{label}</div>
        <div className="text-[9px] text-[#94A3B8] uppercase tracking-wider truncate leading-tight mt-0.5">{type}</div>
      </div>
    </div>
  );
}
