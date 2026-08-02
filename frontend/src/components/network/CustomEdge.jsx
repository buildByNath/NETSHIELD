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
  
  // Visual states: normal wire, simulation attack pulse (red), recovery path pulse (blue)
  const isSimulation = data?.isSimulation ?? false;
  const isRecovery = data?.isRecovery ?? false;
  
  let strokeColor = '#4B5563'; // default wire color
  if (isSimulation) strokeColor = '#EF4444'; // virus red
  else if (isRecovery) strokeColor = '#3B82F6'; // recovery blue
  else if (selected) strokeColor = '#FD802E'; // selected accent orange

  const speed = data?.speed ?? 1.0;
  const dur = `${1.2 / speed}s`;
  const isReverse = data?.pulseSource === target;
  const pathForPulse = isReverse ? reverseEdgePath : edgePath;

  return (
    <>
      <path
        id={id}
        className={`react-flow__edge-path transition-all duration-300 ${isSimulation || isRecovery ? 'stroke-dasharray-anim' : ''}`}
        d={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth: isSimulation || isRecovery || selected ? 3.5 : 2.0,
        }}
      />
      {isSimulation && (
        <circle r="4.5" fill="#EF4444" className="filter drop-shadow-[0_0_3px_rgba(239,68,68,0.8)]">
          <animateMotion dur={dur} repeatCount="indefinite" path={pathForPulse} />
        </circle>
      )}
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
            selected ? 'bg-[#FD802E] text-[#0F1720] font-bold border-[#FD802E]' : 'bg-[#233D4C]'
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
