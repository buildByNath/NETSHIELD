import React from 'react';
import { 
  Globe, ShieldAlert, Network, Layers, Monitor, Laptop, Printer, Server, Database, Wifi, Cloud, Cpu
} from 'lucide-react';

/**
 * File: DeviceLibrary.jsx
 * Author: Antigravity AI
 * Purpose: Draggable sidebar list of network devices categorized by functional layers.
 */

const DEVICES = [
  {
    category: 'Core & Routing',
    items: [
      { type: 'Internet', label: 'Internet', icon: <Globe className="h-4 w-4 text-sky-400" /> },
      { type: 'Firewall', label: 'Firewall', icon: <ShieldAlert className="h-4 w-4 text-rose-500" /> },
      { type: 'Router', label: 'Router', icon: <Network className="h-4 w-4 text-emerald-400" /> }
    ]
  },
  {
    category: 'Switching',
    items: [
      { type: 'Core Switch', label: 'Core Switch', icon: <Layers className="h-4 w-4 text-amber-500" /> },
      { type: 'Access Switch', label: 'Access Switch', icon: <Layers className="h-4 w-4 text-cyan-500" /> }
    ]
  },
  {
    category: 'Endpoints',
    items: [
      { type: 'PC', label: 'Workstation', icon: <Monitor className="h-4 w-4 text-indigo-400" /> },
      { type: 'Laptop', label: 'Laptop', icon: <Laptop className="h-4 w-4 text-indigo-400" /> },
      { type: 'Printer', label: 'Printer', icon: <Printer className="h-4 w-4 text-gray-400" /> }
    ]
  },
  {
    category: 'Servers',
    items: [
      { type: 'Application Server', label: 'App Server', icon: <Cpu className="h-4 w-4 text-purple-400" /> },
      { type: 'Database Server', label: 'Database Server', icon: <Database className="h-4 w-4 text-cyan-400" /> },
      { type: 'Backup Server', label: 'Backup Server', icon: <Server className="h-4 w-4 text-rose-400" /> }
    ]
  },
  {
    category: 'Wireless & External',
    items: [
      { type: 'Wireless Access Point', label: 'Wireless AP', icon: <Wifi className="h-4 w-4 text-teal-400" /> },
      { type: 'Cloud', label: 'Cloud Network', icon: <Cloud className="h-4 w-4 text-sky-300" /> }
    ]
  }
];

export default function DeviceLibrary() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-60 bg-[#233D4C] border-l border-[#4B5563]/30 h-full flex flex-col select-none flex-shrink-0">
      <div className="p-4 border-b border-[#4B5563]/25 bg-[#1B2838]/40">
        <h2 className="text-sm font-bold text-[#FD802E] tracking-wider uppercase">Device Library</h2>
        <p className="text-[10px] text-[#94A3B8] mt-1">Drag and drop components to canvas</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {DEVICES.map((cat) => (
          <div key={cat.category} className="space-y-1.5">
            <h3 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest pl-1">
              {cat.category}
            </h3>
            <div className="grid grid-cols-1 gap-1">
              {cat.items.map((item) => (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type)}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-[#1B2838]/60 border border-[#4B5563]/20 hover:border-[#FD802E]/40 hover:bg-[#1B2838] text-xs font-semibold text-[#CBD5E1] hover:text-[#F8FAFC] cursor-grab active:cursor-grabbing transition-all duration-150 shadow-sm"
                >
                  <div className="p-1 rounded bg-[#0F1720] border border-[#4B5563]/10">
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
