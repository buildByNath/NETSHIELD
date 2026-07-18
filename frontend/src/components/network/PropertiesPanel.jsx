import React from 'react';
import { X, Save, Info, Link2 } from 'lucide-react';

/**
 * File: PropertiesPanel.jsx
 * Author: Antigravity AI
 * Purpose: Floating panel enabling properties adjustments for selected nodes or edges.
 */

const DEVICE_TYPES = [
  'Internet', 'Firewall', 'Router', 'Core Switch', 'Access Switch', 
  'PC', 'Laptop', 'Printer', 'Application Server', 'Database Server', 
  'Backup Server', 'Wireless Access Point', 'Cloud'
];

export default function PropertiesPanel({ 
  selectedElement, onUpdate, onClose 
}) {
  if (!selectedElement) return null;

  const isNode = selectedElement.type !== undefined && selectedElement.source === undefined;
  const isEdge = selectedElement.source !== undefined;

  const handleNodeChange = (field, value) => {
    onUpdate({
      ...selectedElement,
      data: {
        ...selectedElement.data,
        [field]: value
      }
    });
  };

  const handleEdgeChange = (field, value) => {
    onUpdate({
      ...selectedElement,
      data: {
        ...selectedElement.data,
        [field]: value
      }
    });
  };

  return (
    <div className="w-80 bg-[#233D4C] border-l border-[#4B5563]/30 h-full flex flex-col select-none flex-shrink-0 animate-in slide-in-from-right duration-200">
      {/* Panel Header */}
      <div className="p-4 border-b border-[#4B5563]/25 bg-[#1B2838]/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-[#FD802E]" />
          <h2 className="text-sm font-bold text-[#FD802E] tracking-wider uppercase">
            {isNode ? 'Device Properties' : 'Link Properties'}
          </h2>
        </div>
        <button 
          onClick={onClose}
          className="text-[#94A3B8] hover:text-[#F8FAFC] p-1 rounded hover:bg-[#0F1720]/40 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {isNode && (
          <>
            {/* Node ID (Readonly) */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold">Node ID</label>
              <input
                type="text"
                value={selectedElement.id}
                disabled
                className="w-full bg-[#0F1720]/50 border border-[#4B5563]/30 text-[#94A3B8] px-3 py-2 rounded-lg cursor-not-allowed font-mono"
              />
            </div>

            {/* Device Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold">Device Name</label>
              <input
                type="text"
                value={selectedElement.data?.label || ''}
                onChange={(e) => handleNodeChange('label', e.target.value)}
                className="w-full bg-[#0F1720] border border-[#4B5563]/30 hover:border-[#FD802E]/30 focus:border-[#FD802E] text-[#F8FAFC] px-3 py-2 rounded-lg outline-none transition-colors"
              />
            </div>

            {/* Device Type */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold">Device Type</label>
              <select
                value={selectedElement.type || 'PC'}
                onChange={(e) => onUpdate({ ...selectedElement, type: e.target.value })}
                className="w-full bg-[#0F1720] border border-[#4B5563]/30 hover:border-[#FD802E]/30 focus:border-[#FD802E] text-[#F8FAFC] px-2 py-2 rounded-lg outline-none transition-colors cursor-pointer"
              >
                {DEVICE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Health Status */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold">Health Status</label>
              <select
                value={selectedElement.data?.status || 'healthy'}
                onChange={(e) => handleNodeChange('status', e.target.value)}
                className="w-full bg-[#0F1720] border border-[#4B5563]/30 hover:border-[#FD802E]/30 focus:border-[#FD802E] text-[#F8FAFC] px-2 py-2 rounded-lg outline-none transition-colors cursor-pointer font-bold"
              >
                <option value="healthy" className="text-[#22C55E]">Healthy</option>
                <option value="infected" className="text-[#EF4444]">Infected (Virus)</option>
                <option value="recovered" className="text-[#3B82F6]">Recovered (Cleaned)</option>
                <option value="protected" className="text-[#FACC15]">Protected (Firewalled)</option>
              </select>
            </div>
            
            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold">Notes</label>
              <textarea
                value={selectedElement.data?.notes || ''}
                onChange={(e) => handleNodeChange('notes', e.target.value)}
                rows={4}
                placeholder="Enter notes about this node..."
                className="w-full bg-[#0F1720] border border-[#4B5563]/30 hover:border-[#FD802E]/30 focus:border-[#FD802E] text-[#F8FAFC] px-3 py-2 rounded-lg outline-none transition-colors resize-none"
              />
            </div>
          </>
        )}

        {isEdge && (
          <>
            {/* Source & Target (Readonly info) */}
            <div className="border border-[#4B5563]/20 rounded-lg p-3 bg-[#0F1720]/30 space-y-2 mb-4">
              <div className="flex items-center gap-1.5 text-[#94A3B8]">
                <Link2 className="h-3.5 w-3.5" />
                <span className="font-bold text-[10px] uppercase tracking-wider">Connection Info</span>
              </div>
              <div className="flex justify-between items-center text-[11px] pt-1">
                <span className="text-[#CBD5E1] truncate max-w-[100px]">{selectedElement.source}</span>
                <span className="text-[#94A3B8]">↔</span>
                <span className="text-[#CBD5E1] truncate max-w-[100px]">{selectedElement.target}</span>
              </div>
            </div>

            {/* Edge Cost / Weight */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold">Link Cost / Weight</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={selectedElement.data?.weight ?? 1}
                onChange={(e) => handleEdgeChange('weight', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0F1720] border border-[#4B5563]/30 hover:border-[#FD802E]/30 focus:border-[#FD802E] text-[#F8FAFC] px-3 py-2 rounded-lg outline-none transition-colors"
              />
            </div>

            {/* Edge Latency */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold">Latency (ms)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={selectedElement.data?.latency ?? 10}
                onChange={(e) => handleEdgeChange('latency', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0F1720] border border-[#4B5563]/30 hover:border-[#FD802E]/30 focus:border-[#FD802E] text-[#F8FAFC] px-3 py-2 rounded-lg outline-none transition-colors"
              />
            </div>

            {/* Edge Bandwidth */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-bold">Bandwidth (Mbps)</label>
              <input
                type="number"
                min="1"
                step="10"
                value={selectedElement.data?.bandwidth ?? 100}
                onChange={(e) => handleEdgeChange('bandwidth', parseFloat(e.target.value) || 1)}
                className="w-full bg-[#0F1720] border border-[#4B5563]/30 hover:border-[#FD802E]/30 focus:border-[#FD802E] text-[#F8FAFC] px-3 py-2 rounded-lg outline-none transition-colors"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
