import React from 'react';
import { BarChart3, TrendingUp, GitCompare } from 'lucide-react';

/**
 * File: Comparison.jsx
 * Author: Antigravity AI
 * Purpose: Baseline page placeholder for the Algorithms Comparison dashboard (Phase 6).
 */

export default function Comparison() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0F1720] select-none text-sans text-xs">
      <div className="flex justify-between items-center pb-2 border-b border-[#4B5563]/25">
        <div>
          <h2 className="text-xl font-bold text-[#F8FAFC]">ALGORITHMS COMPARISON</h2>
          <p className="text-[#94A3B8] text-[11px] mt-0.5">Compare execution times, memory, and path optimization efficiency side-by-side.</p>
        </div>
      </div>

      <div className="max-w-2xl bg-[#233D4C] border border-[#4B5563]/25 rounded-xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#3B82F6]"></div>
        
        <div className="flex gap-4">
          <div className="p-3 bg-[#3B82F6]/10 rounded-xl text-[#3B82F6] border border-[#3B82F6]/20 flex-shrink-0 h-12 w-12 flex items-center justify-center">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wide">Comparative Dashboard (Phase 6)</h3>
            <p className="text-[#CBD5E1] text-xs leading-relaxed">
              This panel runs comparative executions to plot side-by-side bar and line charts representing time/space complexity ratios, visited node margins, and spanning tree weight comparisons.
            </p>
          </div>
        </div>

        <div className="border-t border-[#4B5563]/15 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15 space-y-3">
            <div className="flex items-center gap-1.5 text-[#FD802E] font-bold">
              <GitCompare className="h-4 w-4" />
              <span>BFS vs DFS</span>
            </div>
            <p className="text-[#94A3B8] text-[10px] leading-relaxed">
              Compare worm level expansion (BFS) against depth scan propagation (DFS) over node count benchmarks.
            </p>
          </div>
          <div className="p-4 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15 space-y-3">
            <div className="flex items-center gap-1.5 text-[#FD802E] font-bold">
              <TrendingUp className="h-4 w-4" />
              <span>Prim vs Kruskal</span>
            </div>
            <p className="text-[#94A3B8] text-[10px] leading-relaxed">
              Compare priority queue dense growth against disjoint-set sorting edges to establish Spanning Trees.
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <span className="text-[10px] font-mono bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/25 px-3 py-1 rounded">
            Scheduled for Implementation in Phase 6
          </span>
        </div>
      </div>
    </div>
  );
}
