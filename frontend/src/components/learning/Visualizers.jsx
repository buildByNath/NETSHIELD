import React, { useState } from 'react';
import { 
  ArrowRight, Shield, ShieldAlert, ChevronRight, HelpCircle, 
  ArrowUpRight, ListCollapse, ListStart, ArrowDown, Columns, Box
} from 'lucide-react';

/**
 * File: Visualizers.jsx
 * Author: Antigravity AI
 * Purpose: Reusable visual data structure components for NETSHIELD classroom board visualizer.
 */

// 1. FIFO Queue Visualizer with scroll/collapse support
export function QueueVisualizer({ items = [], activeNode = null }) {
  const [expanded, setExpanded] = useState(false);
  const rawItems = items || [];
  const displayItems = expanded ? rawItems : rawItems.slice(0, 6);
  const hasMore = rawItems.length > 6;

  return (
    <div className="flex flex-col gap-2 w-full select-none animate-in fade-in duration-200">
      <div className="flex items-center justify-between text-[9px] text-[#94A3B8] px-1 font-mono">
        <span className="flex items-center gap-1 font-bold text-emerald-400">FRONT ↓</span>
        <span className="flex items-center gap-1 font-bold text-amber-500">↑ REAR</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto min-h-[46px] py-1.5 border border-[#4B5563]/15 bg-[#0F1720]/45 rounded-xl px-4 w-full">
        {displayItems.length > 0 ? (
          displayItems.map((item, idx) => {
            const label = typeof item === 'string' ? item : (item.id || JSON.stringify(item));
            const isActive = label === activeNode;
            return (
              <div key={idx} className="flex items-center gap-2 flex-shrink-0">
                <span 
                  className={`px-3 py-1.5 rounded-lg font-mono text-[9.5px] font-bold shadow-md flex-shrink-0 transition-all ${
                    isActive 
                      ? 'bg-[#EF4444]/25 border border-[#EF4444] text-[#EF4444] animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.3)]' 
                      : 'bg-[#1B2838] border border-[#FD802E]/35 text-[#FD802E]'
                  }`}
                >
                  {label} {isActive && ' (Active)'}
                </span>
                {idx < displayItems.length - 1 && (
                  <span className="text-[#4B5563] text-[10px] font-bold">→</span>
                )}
              </div>
            );
          })
        ) : (
          <span className="text-[10px] text-[#94A3B8] italic">Queue is empty.</span>
        )}

        {hasMore && !expanded && (
          <button 
            onClick={() => setExpanded(true)}
            className="px-2 py-1 bg-[#FD802E]/10 border border-[#FD802E]/25 text-[#FD802E] rounded text-[8px] font-bold uppercase tracking-wider hover:bg-[#FD802E]/25 transition-colors ml-auto flex-shrink-0"
          >
            + {rawItems.length - 6} more
          </button>
        )}
        {expanded && (
          <button 
            onClick={() => setExpanded(false)}
            className="px-2 py-1 bg-[#4B5563]/20 border border-[#4B5563]/30 text-[#94A3B8] rounded text-[8px] font-bold uppercase tracking-wider hover:bg-[#4B5563]/30 transition-colors ml-auto flex-shrink-0"
          >
            Show Less
          </button>
        )}
      </div>
    </div>
  );
}

// 2. LIFO Stack Visualizer (Vertical stacked boxes with top collapse)
export function StackVisualizer({ items = [], activeNode = null }) {
  const [expanded, setExpanded] = useState(false);
  const rawItems = items || [];
  const displayItems = expanded ? rawItems : rawItems.slice(-4);
  const hasMore = rawItems.length > 4;

  return (
    <div className="flex gap-4 w-full select-none animate-in fade-in duration-200">
      <div className="flex-1 flex flex-col items-center bg-[#0F1720]/45 border border-[#4B5563]/15 rounded-xl p-3 max-h-[135px] overflow-y-auto min-h-[90px] w-full">
        {displayItems.length > 0 ? (
          <div className="flex flex-col-reverse gap-1.5 w-full max-w-[180px]">
            {displayItems.map((item, idx) => {
              const label = typeof item === 'string' ? item : (item.id || JSON.stringify(item));
              const isRealIndex = expanded ? idx : (rawItems.length - displayItems.length + idx);
              const isTop = isRealIndex === rawItems.length - 1;
              const isActive = label === activeNode && isTop;

              return (
                <div 
                  key={idx} 
                  className={`px-3 py-1.5 rounded-lg font-mono text-[9.5px] font-bold text-center border shadow transition-all ${
                    isActive
                      ? 'bg-[#EF4444]/25 border-[#EF4444] text-[#EF4444] animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.25)]'
                      : isTop
                      ? 'bg-[#FD802E]/25 border-[#FD802E] text-[#FD802E]'
                      : 'bg-[#1B2838] border-[#4B5563]/25 text-[#CBD5E1]'
                  }`}
                >
                  {isTop ? 'TOP ↓ ' : ''}{label}
                </div>
              );
            })}
          </div>
        ) : (
          <span className="text-[10px] text-[#94A3B8] italic my-auto">Stack is empty.</span>
        )}
      </div>

      <div className="w-40 flex flex-col justify-between text-[10px] font-mono text-[#94A3B8] border-l border-[#4B5563]/15 pl-4 flex-shrink-0">
        <div className="space-y-1">
          <div>Stack Size: <strong className="text-[#3B82F6]">{rawItems.length}</strong></div>
          <div className="text-[7.5px] leading-relaxed">
            Pushes unvisited neighbors to the top, popping immediately on dead-ends.
          </div>
        </div>

        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-2 py-1 bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] rounded text-[8px] font-bold uppercase tracking-wider hover:bg-[#3B82F6]/20 transition-colors"
          >
            {expanded ? 'Show Latest 4' : `Expand Stack (+${rawItems.length - 4})`}
          </button>
        )}
      </div>
    </div>
  );
}

// 3. Dijkstra Priority Queue
export function PriorityQueueVisualizer({ items = [] }) {
  const [expanded, setExpanded] = useState(false);
  const rawItems = items || [];
  const displayItems = expanded ? rawItems : rawItems.slice(0, 4);
  const hasMore = rawItems.length > 4;

  return (
    <div className="flex flex-col gap-1 w-full font-mono text-[9px] select-none">
      <span className="text-[8.5px] uppercase tracking-widest text-[#94A3B8] block mb-1">Min Priority Queue</span>
      <div className="bg-[#0F1720]/45 border border-[#4B5563]/15 rounded-xl p-2.5 max-h-[110px] overflow-y-auto space-y-1 min-h-[70px]">
        {displayItems.length > 0 ? (
          displayItems.map((item, idx) => (
            <div key={idx} className="flex justify-between border-b border-[#4B5563]/10 pb-0.5 px-1 hover:bg-[#1B2838]/40 rounded">
              <span className="text-[#FD802E] font-bold">{item.split(' ')[0]}</span>
              <span className="text-cyan-400 font-bold">{item.split(' (d=')[1]?.replace(')', '') || '0'}</span>
            </div>
          ))
        ) : (
          <span className="text-[#94A3B8] italic block text-center py-4">PQ is empty</span>
        )}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[8px] text-[#FD802E] hover:underline font-bold uppercase tracking-wider self-end mt-1"
        >
          {expanded ? 'Show Less' : `Show All (+${rawItems.length - 4})`}
        </button>
      )}
    </div>
  );
}

// 4. Distance Estimator Table
export function DistanceTable({ distances = {}, prevDistances = {} }) {
  const [expanded, setExpanded] = useState(false);
  const keys = Object.keys(distances || {});
  const displayKeys = expanded ? keys : keys.slice(0, 4);
  const hasMore = keys.length > 4;

  return (
    <div className="flex flex-col gap-1 w-full font-mono text-[9px] select-none">
      <span className="text-[8.5px] uppercase tracking-widest text-[#94A3B8] block mb-1">Distance Estimates Table</span>
      <div className="bg-[#0F1720]/45 border border-[#4B5563]/15 rounded-xl p-2.5 max-h-[110px] overflow-y-auto space-y-1 min-h-[70px]">
        {displayKeys.map(nodeId => {
          const val = distances[nodeId];
          const prevVal = prevDistances[nodeId];
          const wasRelaxed = prevVal !== undefined && prevVal !== val;
          return (
            <div 
              key={nodeId} 
              className={`flex justify-between border-b border-[#4B5563]/10 pb-0.5 px-1 rounded transition-colors ${
                wasRelaxed ? 'bg-[#22C55E]/15 border border-[#22C55E]/30 text-emerald-400 font-bold' : 'text-[#CBD5E1]'
              }`}
            >
              <span>{nodeId}</span>
              <span className="font-bold">
                {wasRelaxed ? `${prevVal} → ${val}` : val}
              </span>
            </div>
          );
        })}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[8px] text-[#FD802E] hover:underline font-bold uppercase tracking-wider self-end mt-1"
        >
          {expanded ? 'Show Less' : `Show All (+${keys.length - 4})`}
        </button>
      )}
    </div>
  );
}

// 5. Traversal Journey Link Sequence (Visual arrow trail)
export function TraversalJourney({ timeline = [], currentFrame = 0 }) {
  const journey = [];
  timeline.slice(0, currentFrame + 1).forEach((frame) => {
    if (frame.currentNode) {
      if (journey.length === 0 || journey[journey.length - 1] !== frame.currentNode) {
        journey.push(frame.currentNode);
      }
    }
  });

  return (
    <div className="flex items-center gap-1.5 flex-wrap py-2 font-mono text-[9.5px] select-none">
      {journey.length > 0 ? (
        journey.map((nodeId, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <span className="px-2 py-1 rounded bg-[#1B2838] border border-[#FD802E]/25 text-[#F8FAFC] font-bold shadow shadow-[#FD802E]/5">
              {nodeId}
            </span>
            {idx < journey.length - 1 && (
              <span className="text-[#FD802E] font-bold font-sans">→</span>
            )}
          </div>
        ))
      ) : (
        <span className="text-[#94A3B8] italic">No traversal path established.</span>
      )}
    </div>
  );
}

// 6. Array Visualizer (For Merge / Quick Sort array partitions)
export function ArrayVisualizer({ array = [], activeIndices = [], pivotIndex = -1 }) {
  return (
    <div className="flex flex-col items-center gap-3 w-full font-mono select-none animate-in fade-in duration-200">
      <div className="flex items-center gap-2 overflow-x-auto max-w-full py-2 bg-[#0F1720]/45 border border-[#4B5563]/15 rounded-xl px-4">
        {array.length > 0 ? (
          array.map((val, idx) => {
            const isPivot = idx === pivotIndex;
            const isActive = activeIndices.includes(idx);
            
            return (
              <div 
                key={idx}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs border shadow transition-all duration-300 ${
                  isPivot
                    ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444] scale-105 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                    : isActive
                    ? 'bg-[#FD802E]/20 border-[#FD802E] text-[#FD802E] scale-105 shadow-[0_0_8px_rgba(253,128,46,0.3)]'
                    : 'bg-[#1B2838] border-[#4B5563]/30 text-[#CBD5E1]'
                }`}
              >
                {val}
              </div>
            );
          })
        ) : (
          <span className="text-[#94A3B8] italic py-2">No array loaded.</span>
        )}
      </div>
      
      <div className="flex gap-4 text-[8px] text-[#94A3B8] font-sans">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-[#FD802E]"></span>
          <span>Comparing / Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-[#EF4444]"></span>
          <span>Random Pivot</span>
        </div>
      </div>
    </div>
  );
}

// 7. Matrix Visualizer (Floyd-Warshall distance matrices)
export function MatrixVisualizer({ matrix = [], changedCell = null }) {
  const [expanded, setExpanded] = useState(false);
  if (!matrix || matrix.length === 0) return <div className="text-[#94A3B8] italic font-mono text-[9px]">Empty Matrix</div>;

  const size = matrix.length;
  const displaySize = expanded ? size : Math.min(size, 4);
  const hasMore = size > 4;

  return (
    <div className="flex flex-col gap-1.5 w-full select-none font-mono text-[9px]">
      <div className="overflow-x-auto w-full border border-[#4B5563]/15 rounded-xl bg-[#0F1720]/45 p-2 max-h-[140px] overflow-y-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="p-1 text-[#94A3B8] border-b border-[#4B5563]/15"></th>
              {Array.from({ length: displaySize }).map((_, col) => (
                <th key={col} className="p-1.5 text-[#94A3B8] border-b border-[#4B5563]/15 font-bold">N{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.slice(0, displaySize).map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-[#1B2838]/20">
                <td className="p-1.5 text-[#94A3B8] border-r border-[#4B5563]/15 font-bold">N{rIdx}</td>
                {row.slice(0, displaySize).map((val, cIdx) => {
                  const isChanged = changedCell && changedCell[0] === rIdx && changedCell[1] === cIdx;
                  return (
                    <td 
                      key={cIdx} 
                      className={`p-1.5 border border-[#4B5563]/10 font-bold transition-all duration-300 ${
                        isChanged ? 'bg-[#22C55E]/15 text-emerald-400 font-extrabold shadow' : 'text-[#CBD5E1]'
                      }`}
                    >
                      {val === 999999 || val === "inf" || val === floatInfinity() ? '∞' : val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[8px] text-[#FD802E] hover:underline font-bold uppercase tracking-wider self-end"
        >
          {expanded ? 'Show Less' : `Show Full Matrix (${size}x${size})`}
        </button>
      )}
    </div>
  );
}

function floatInfinity() {
  return 1/0;
}

// 8. Union-Find Disjoint Set Visualizer
export function UnionFindVisualizer({ parents = {} }) {
  const [expanded, setExpanded] = useState(false);
  const keys = Object.keys(parents || {});
  const displayKeys = expanded ? keys : keys.slice(0, 4);
  const hasMore = keys.length > 4;

  return (
    <div className="flex flex-col gap-1 w-full font-mono text-[9px] select-none animate-in fade-in duration-200">
      <span className="text-[8.5px] uppercase tracking-widest text-[#94A3B8] block mb-1">Union-Find Representative Mapping</span>
      <div className="bg-[#0F1720]/45 border border-[#4B5563]/15 rounded-xl p-2.5 max-h-[110px] overflow-y-auto space-y-1 min-h-[70px]">
        {displayKeys.length > 0 ? (
          displayKeys.map(nodeId => (
            <div key={nodeId} className="flex justify-between border-b border-[#4B5563]/10 pb-0.5 px-1 hover:bg-[#1B2838]/40 rounded">
              <span className="text-[#CBD5E1]">{nodeId}</span>
              <span className="text-amber-500 font-bold">→ {parents[nodeId]}</span>
            </div>
          ))
        ) : (
          <span className="text-[#94A3B8] italic block text-center py-4">No disjoint sets active</span>
        )}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[8px] text-[#FD802E] hover:underline font-bold uppercase tracking-wider self-end mt-1"
        >
          {expanded ? 'Show Less' : `Show All (+${keys.length - 4})`}
        </button>
      )}
    </div>
  );
}

// 9. MST Visualizer (Cumulative tree cost + Candidate list)
export function MSTVisualizer({ mstWeight = 0, candidateEdges = [] }) {
  const [expanded, setExpanded] = useState(false);
  const rawItems = candidateEdges || [];
  const displayItems = expanded ? rawItems : rawItems.slice(0, 4);
  const hasMore = rawItems.length > 4;

  return (
    <div className="flex gap-4 w-full select-none font-mono text-[9px] animate-in fade-in duration-200">
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <span className="text-[8.5px] uppercase tracking-widest text-[#94A3B8] font-bold">Candidate Edges Queue</span>
        <div className="bg-[#0F1720]/45 border border-[#4B5563]/15 rounded-xl p-2 max-h-[110px] overflow-y-auto space-y-1 min-h-[70px]">
          {displayItems.length > 0 ? (
            displayItems.map((item, idx) => {
              const isMin = idx === 0;
              return (
                <div 
                  key={idx} 
                  className={`flex justify-between border-b border-[#4B5563]/10 pb-0.5 px-1.5 rounded transition-all ${
                    isMin ? 'bg-[#22C55E]/15 border border-[#22C55E]/20 text-[#22C55E] font-bold' : 'text-[#CBD5E1]'
                  }`}
                >
                  <span className="truncate">{item.split(' ')[0]}</span>
                  <span className="text-cyan-400 font-bold ml-2">{item.split(' (w=')[1]?.replace(')', '') || ''}</span>
                </div>
              );
            })
          ) : (
            <span className="text-[#94A3B8] italic block text-center py-4">No candidates</span>
          )}
        </div>
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[8px] text-[#FD802E] hover:underline font-bold uppercase tracking-wider self-end mt-1"
          >
            {expanded ? 'Show Less' : `Show All (+${rawItems.length - 4})`}
          </button>
        )}
      </div>

      <div className="w-40 flex flex-col justify-center gap-2 pl-4 border-l border-[#4B5563]/15 text-[10px] text-[#94A3B8] flex-shrink-0">
        <div className="space-y-0.5">
          <span>Current MST Weight:</span>
          <span className="text-base font-black text-[#22C55E] block font-mono">{mstWeight}</span>
        </div>
        <div className="text-[7.5px] leading-relaxed">
          Selects cheapest candidate edge connecting to any unvisited device component.
        </div>
      </div>
    </div>
  );
}

// 10. Knapsack capacity + Backpack density items
export function KnapsackVisualizer({ capacity = 10, used = 0, items = [] }) {
  const percentage = Math.min(100, (used / capacity) * 100);

  return (
    <div className="flex gap-4 w-full select-none font-sans text-[9px] animate-in fade-in duration-200">
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <span className="text-[8.5px] uppercase tracking-widest text-[#94A3B8] font-bold">Backpack Density Table</span>
        <div className="bg-[#0F1720]/45 border border-[#4B5563]/15 rounded-xl p-2 max-h-[110px] overflow-y-auto min-h-[70px]">
          <table className="w-full text-[8.5px] text-left border-collapse">
            <thead>
              <tr className="border-b border-[#4B5563]/15 text-[#94A3B8]">
                <th className="pb-1 font-bold">Item ID</th>
                <th className="pb-1 font-bold">Weight</th>
                <th className="pb-1 font-bold">Value</th>
                <th className="pb-1 font-bold">V/W</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-[#4B5563]/5 hover:bg-[#1B2838]/20">
                  <td className="py-1 font-bold text-[#FD802E] font-mono">{item.id || item.node || `Item-${idx}`}</td>
                  <td className="py-1 text-[#CBD5E1]">{item.weight ?? 0}</td>
                  <td className="py-1 text-[#CBD5E1]">{item.value ?? 0}</td>
                  <td className="py-1 text-cyan-400 font-bold font-mono">{(item.vw ?? ((item.value || 0) / (item.weight || 1))).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="w-40 flex flex-col justify-center gap-2 pl-4 border-l border-[#4B5563]/15 flex-shrink-0">
        <span className="text-[8.5px] uppercase tracking-widest text-[#94A3B8] font-bold">Backpack Capacity</span>
        <div className="h-4 bg-[#0F1720] border border-[#4B5563]/30 rounded-lg overflow-hidden relative shadow">
          <div 
            className="h-full bg-gradient-to-r from-[#FD802E]/60 to-[#22C55E]/60 transition-all duration-500 shadow" 
            style={{ width: `${percentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[8.5px] font-bold text-[#F8FAFC]">
            {used.toFixed(1)} / {capacity} kg
          </div>
        </div>
        <div className="text-[7.5px] leading-relaxed text-[#94A3B8] font-mono">
          Used: {used.toFixed(1)} kg | Remaining: {(capacity - used).toFixed(1)} kg
        </div>
      </div>
    </div>
  );
}

// 11. Chessboard placement visualizer (Firewall Placement / N-Queens)
export function ChessboardVisualizer({ board = [], activeRow = -1, activeCol = -1 }) {
  const size = 4; // Use N=4 from payload

  return (
    <div className="flex flex-col items-center gap-3 select-none animate-in fade-in duration-200">
      <div className="bg-[#1B2838] border-2 border-[#4B5563]/40 rounded-xl p-1.5 shadow-lg">
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: size }).map((_, r) => (
            <React.Fragment key={r}>
              {Array.from({ length: size }).map((_, c) => {
                const isQueen = board[r] === c;
                const isActive = r === activeRow && c === activeCol;
                const isDark = (r + c) % 2 === 1;

                return (
                  <div 
                    key={c}
                    className={`w-11 h-11 rounded-lg flex items-center justify-center border transition-all duration-300 ${
                      isActive 
                        ? 'bg-[#FD802E]/25 border-[#FD802E] text-[#FD802E] scale-105 shadow-[0_0_8px_rgba(253,128,46,0.3)] animate-pulse'
                        : isQueen
                        ? 'bg-[#22C55E]/20 border-[#22C55E] text-[#22C55E] scale-105 shadow-[0_0_8px_rgba(34,197,94,0.3)]'
                        : isDark
                        ? 'bg-[#111C2A] border-[#4B5563]/10 text-[#CBD5E1]'
                        : 'bg-[#1B2838] border-[#4B5563]/10 text-[#CBD5E1]'
                    }`}
                  >
                    {isQueen ? (
                      <Shield className="h-5 w-5 text-emerald-400 fill-emerald-400/20" />
                    ) : isActive ? (
                      <ShieldAlert className="h-5 w-5 text-amber-500 fill-amber-500/20" />
                    ) : null}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      <div className="flex gap-4 text-[8px] text-[#94A3B8]">
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3 text-emerald-400" />
          <span>Placed Firewall</span>
        </div>
        <div className="flex items-center gap-1">
          <ShieldAlert className="h-3 w-3 text-amber-500" />
          <span>Active Trial</span>
        </div>
      </div>
    </div>
  );
}
