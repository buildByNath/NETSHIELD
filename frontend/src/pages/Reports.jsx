import React from 'react';
import { FileText, Download, Shield } from 'lucide-react';

/**
 * File: Reports.jsx
 * Author: Antigravity AI
 * Purpose: Baseline page placeholder for exporting project reports (Phase 8).
 */

export default function Reports() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0F1720] select-none text-sans text-xs">
      <div className="flex justify-between items-center pb-2 border-b border-[#4B5563]/25">
        <div>
          <h2 className="text-xl font-bold text-[#F8FAFC]">PROJECT REPORT GENERATOR</h2>
          <p className="text-[#94A3B8] text-[11px] mt-0.5">Export structured PDF and HTML reports for lab submission.</p>
        </div>
      </div>

      <div className="max-w-2xl bg-[#233D4C] border border-[#4B5563]/25 rounded-xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#FD802E]"></div>
        
        <div className="flex gap-4">
          <div className="p-3 bg-[#FD802E]/10 rounded-xl text-[#FD802E] border border-[#FD802E]/20 flex-shrink-0 h-12 w-12 flex items-center justify-center">
            <FileText className="h-6 w-6 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wide">Report Generator Module (Phase 8)</h3>
            <p className="text-[#CBD5E1] text-xs leading-relaxed">
              This module compiles network layout summaries, attack propagation paths, recovery statistics, and complexity tables into a professionally structured report suitable for DAA laboratory viva submissions.
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <span className="text-[10px] font-mono bg-[#FD802E]/10 text-[#FD802E] border border-[#FD802E]/25 px-3 py-1 rounded">
            Scheduled for Implementation in Phase 8
          </span>
        </div>
      </div>
    </div>
  );
}
