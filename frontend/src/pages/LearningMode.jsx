import React from 'react';
import { BookOpen, GraduationCap, Code2, Cpu } from 'lucide-react';

/**
 * File: LearningMode.jsx
 * Author: Antigravity AI
 * Purpose: Baseline page placeholder for the Learning Mode interface (Phase 5).
 */

export default function LearningMode() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0F1720] select-none text-sans text-xs">
      <div className="flex justify-between items-center pb-2 border-b border-[#4B5563]/25">
        <div>
          <h2 className="text-xl font-bold text-[#F8FAFC]">ALGORITHM LEARNING MODE</h2>
          <p className="text-[#94A3B8] text-[11px] mt-0.5">Explore algorithms data structure states, step-by-step code, and notes.</p>
        </div>
      </div>

      <div className="max-w-2xl bg-[#233D4C] border border-[#4B5563]/25 rounded-xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#FD802E]"></div>
        
        <div className="flex gap-4">
          <div className="p-3 bg-[#FD802E]/10 rounded-xl text-[#FD802E] border border-[#FD802E]/20 flex-shrink-0 h-12 w-12 flex items-center justify-center">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wide">Interactive Learning Module (Phase 5)</h3>
            <p className="text-[#CBD5E1] text-xs leading-relaxed">
              This module visualizes variables, data structures, and mathematical constraints in real-time. Students can step through code lines, review Stack/Queue evolutions, and play/pause traversals using speed sliders.
            </p>
          </div>
        </div>

        <div className="border-t border-[#4B5563]/15 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15 space-y-2">
            <span className="text-[#FD802E] font-bold flex items-center gap-1.5">
              <Code2 className="h-4 w-4" />
              Trace Pseudocode
            </span>
            <p className="text-[#94A3B8] text-[10px] leading-relaxed">
              Highlight the active code line execution dynamically linked to the node animations on the canvas.
            </p>
          </div>
          <div className="p-4 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15 space-y-2">
            <span className="text-[#FD802E] font-bold flex items-center gap-1.5">
              <Cpu className="h-4 w-4" />
              Render Data Structures
            </span>
            <p className="text-[#94A3B8] text-[10px] leading-relaxed">
              Expose the memory stack, circular queue elements, min-heap priority keys, or Union-Find parent tree pointers.
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <span className="text-[10px] font-mono bg-[#FD802E]/10 text-[#FD802E] border border-[#FD802E]/25 px-3 py-1 rounded">
            Scheduled for Implementation in Phase 5
          </span>
        </div>
      </div>
    </div>
  );
}
