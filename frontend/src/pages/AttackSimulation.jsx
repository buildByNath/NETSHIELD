import React from 'react';
import { Flame, Play, ShieldAlert, Cpu } from 'lucide-react';

/**
 * File: AttackSimulation.jsx
 * Author: Antigravity AI
 * Purpose: Baseline page placeholder for the Attack Simulation engine (Phase 3).
 */

export default function AttackSimulation() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0F1720] select-none text-sans text-xs">
      <div className="flex justify-between items-center pb-2 border-b border-[#4B5563]/25">
        <div>
          <h2 className="text-xl font-bold text-[#F8FAFC]">ATTACK SIMULATION ENGINE</h2>
          <p className="text-[#94A3B8] text-[11px] mt-0.5">Visualize virus propagation (BFS/DFS traversal) across the active network.</p>
        </div>
      </div>

      <div className="max-w-2xl bg-[#233D4C] border border-[#4B5563]/25 rounded-xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#EF4444]"></div>
        
        <div className="flex gap-4">
          <div className="p-3 bg-[#EF4444]/10 rounded-xl text-[#EF4444] border border-[#EF4444]/20 flex-shrink-0 h-12 w-12 flex items-center justify-center">
            <Flame className="h-6 w-6 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wide">Attack Simulator Module (Phase 3)</h3>
            <p className="text-[#CBD5E1] text-xs leading-relaxed">
              This module simulates cyber security attacks virtualized as graph search traversals. You will be able to select starting compromised nodes, choose attack profiles, and play the step-by-step infection timelines.
            </p>
          </div>
        </div>

        <div className="border-t border-[#4B5563]/15 pt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#0F1720]/40 rounded-lg border border-[#EF4444]/15 space-y-2">
            <span className="text-[#EF4444] font-bold block">1. Worm (BFS)</span>
            <p className="text-[#94A3B8] text-[10px] leading-relaxed">
              Simulates automated worms spreading in level-order search rings, infecting adjacent hubs at equal speeds.
            </p>
          </div>
          <div className="p-4 bg-[#0F1720]/40 rounded-lg border border-[#EF4444]/15 space-y-2">
            <span className="text-[#EF4444] font-bold block">2. Network Scanner (DFS)</span>
            <p className="text-[#94A3B8] text-[10px] leading-relaxed">
              Simulates a depth-first port scanner indexing through subnet chains, backtracking upon reaching terminal leaf PCs.
            </p>
          </div>
          <div className="p-4 bg-[#0F1720]/40 rounded-lg border border-[#EF4444]/15 space-y-2">
            <span className="text-[#EF4444] font-bold block">3. Multi-point Attack</span>
            <p className="text-[#94A3B8] text-[10px] leading-relaxed">
              Simulates multi-source coordinated attacks targeting high-value switches simultaneously via independent BFS fronts.
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <span className="text-[10px] font-mono bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/25 px-3 py-1 rounded">
            Scheduled for Implementation in Phase 3
          </span>
        </div>
      </div>
    </div>
  );
}
