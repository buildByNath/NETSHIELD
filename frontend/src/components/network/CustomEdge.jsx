import React from 'react';
import { getBezierPath, EdgeLabelRenderer } from 'reactflow';

/**
 * File: CustomEdge.jsx
 * Author: Antigravity AI
 * Purpose: Custom React Flow Edge showing weight and latency badges in the center of connection paths.
 */

export default function CustomEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const [reverseEdgePath] = getBezierPath({
    sourceX: targetX,
    sourceY: targetY,
    targetX: sourceX,
    targetY: sourceY,
    sourcePosition: targetPosition,
    targetPosition: sourcePosition,
  });

  const weight = data?.weight ?? 1;
  const latency = data?.latency ?? 10;
  
  // Visual states: normal wire, active pulse (bright red/blue), virus trail (dim red), recovery path
  const isSimulation = data?.isSimulation ?? false;  // active pulse travelling RIGHT NOW
  const isRecovery   = data?.isRecovery   ?? false;
  const isTraversed  = data?.isTraversed  ?? false;  // virus already passed through this wire
  
  let strokeColor = '#4B5563'; // default grey wire
  let strokeWidth = 2.0;
  let strokeDasharray = 'none';
  let strokeOpacity = 1;

  if (isSimulation) {
    // Bright red — virus is actively pulsing through this wire right now
    strokeColor = '#EF4444';
    strokeWidth = 3.5;
  } else if (isRecovery) {
    strokeColor = '#3B82F6';
    strokeWidth = 3.5;
  } else if (isTraversed) {
    // Dim red trail — virus already passed through, path stays visible
    strokeColor = '#C53030';
    strokeWidth = 2.5;
    strokeDasharray = '6 3';
    strokeOpacity = 0.85;
  } else if (selected) {
    strokeColor = '#FD802E';
    strokeWidth = 3.5;
  }

  const speed = data?.speed ?? 1.0;
  const dur = `${1.2 / speed}s`;
  const isReverse = data?.pulseSource === target;
  const pathForPulse = isReverse ? reverseEdgePath : edgePath;

  return (
    <>
      {/* Traversed trail glow underlay — wider, more transparent */}
      {isTraversed && !isSimulation && (
        <path
          d={edgePath}
          style={{
            stroke: '#991B1B',
            strokeWidth: 6,
            strokeOpacity: 0.25,
            fill: 'none',
            pointerEvents: 'none',
          }}
        />
      )}

      <path
        id={id}
        className={`react-flow__edge-path transition-all duration-300`}
        d={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray,
          strokeOpacity,
        }}
      />

      {/* Active attack pulse dot */}
      {isSimulation && (
        <circle r="4.5" fill="#EF4444" className="filter drop-shadow-[0_0_3px_rgba(239,68,68,0.8)]">
          <animateMotion dur={dur} repeatCount="indefinite" path={pathForPulse} />
        </circle>
      )}

      {/* Active recovery pulse dot */}
      {isRecovery && (
        <circle r="4.5" fill="#3B82F6" className="filter drop-shadow-[0_0_3px_rgba(59,130,246,0.8)]">
          <animateMotion dur={dur} repeatCount="indefinite" path={pathForPulse} />
        </circle>
      )}

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={`px-1.5 py-0.5 rounded text-[9px] font-mono text-[#CBD5E1] shadow-md flex items-center gap-1 select-none border border-[#4B5563]/40 ${
            selected ? 'bg-[#FD802E] text-[#0F1720] font-bold border-[#FD802E]' :
            isTraversed && !isSimulation ? 'bg-[#7F1D1D]/80 text-[#FCA5A5] border-[#991B1B]' :
            'bg-[#233D4C]'
          }`}
        >
          <span>w:{weight}</span>
          <span className={`${selected ? 'text-[#0F1720]/40' : 'text-[#94A3B8]'}`}>|</span>
          <span>{latency}ms</span>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
