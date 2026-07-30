import React, { useState, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background
} from 'reactflow';
import 'reactflow/dist/style.css';

import { 
  Play, Pause, RotateCcw, ChevronRight, ChevronLeft, 
  Flame, HelpCircle, Layers
} from 'lucide-react';

import CustomNode from '../components/network/CustomNode';
import CustomEdge from '../components/network/CustomEdge';
import { useSimulation } from '../context/SimulationContext';

/**
 * File: AttackSimulation.jsx
 * Author: Antigravity AI
 * Purpose: Attack simulation player integrated with the background SimulationContext.
 */

const nodeTypes = {
  Internet: CustomNode,
  Firewall: CustomNode,
  Router: CustomNode,
  'Core Switch': CustomNode,
  'Access Switch': CustomNode,
  PC: CustomNode,
  Laptop: CustomNode,
  Printer: CustomNode,
  'Application Server': CustomNode,
  'Database Server': CustomNode,
  'Backup Server': CustomNode,
  'Wireless Access Point': CustomNode,
  Cloud: CustomNode
};

const edgeTypes = {
  customEdge: CustomEdge
};

const SPEED_LEVELS = [
  { value: 0.25, label: '0.25x (2s)' },
  { value: 0.5, label: '0.5x (1s)' },
  { value: 1.0, label: '1.0x (0.5s)' },
  { value: 2.0, label: '2.0x (0.25s)' },
  { value: 5.0, label: '5.0x (0.1s)' }
];

function SimulationWorkspace() {
  const {
    nodes,
    edges,
    mode,
    selectedVirus,
    setSelectedVirus,
    startNodes,
    setStartNodes,
    timeline,
    currentFrame,
    setCurrentFrame,
    isPlaying,
    speed,
    setSpeed,
    simulationStatus,
    statistics,
    learning,
    errorMsg,
    triggerAttack,
    pausePlayback,
    resumePlayback,
    resetPlayback,
    nextStep,
    prevStep
  } = useSimulation();

  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Click handler to select starting nodes (disabled if simulation running)
  const onNodeClick = useCallback((event, node) => {
    if (mode === 'simulation' && (simulationStatus === 'running' || simulationStatus === 'paused' || simulationStatus === 'completed')) return;

    const isMultiSelect = selectedVirus === 'multi_bfs';

    if (isMultiSelect) {
      setStartNodes(prev => {
        const index = prev.indexOf(node.id);
        if (index > -1) {
          const next = [...prev];
          next.splice(index, 1);
          return next;
        } else {
          return [...prev, node.id];
        }
      });
    } else {
      setStartNodes([node.id]);
    }
  }, [selectedVirus, simulationStatus, mode, setStartNodes]);

  // Playback Control Button Functions
  const handlePlayPause = () => {
    if (simulationStatus === 'idle') {
      if (startNodes.length === 0) {
        return;
      }
      triggerAttack(selectedVirus, startNodes);
    } else if (simulationStatus === 'paused') {
      resumePlayback();
    } else {
      pausePlayback();
    }
  };

  const handleReset = () => {
    resetPlayback();
    if (reactFlowInstance) reactFlowInstance.fitView({ duration: 500 });
  };

  const activeFrameData = (mode === 'simulation' && timeline[currentFrame]) || { 
    visited: [], 
    queue: [], 
    stack: [], 
    action: startNodes.length > 0 
      ? `Click "Infect Network" to begin propagation from ${startNodes.join(', ')}.` 
      : 'Select a starting device on the canvas to inject the infection.' 
  };

  return (
    <div className="flex-1 flex overflow-hidden h-full bg-[#0F1720]">
      {/* Sidebar: Simulation controls and traversal log */}
      <div className="w-80 bg-[#233D4C] border-r border-[#4B5563]/30 h-full flex flex-col select-none flex-shrink-0 text-xs font-sans">
        
        {/* Setup and configuration section */}
        <div className="p-4 border-b border-[#4B5563]/25 bg-[#1B2838]/40 space-y-4">
          <h2 className="text-sm font-bold text-[#FD802E] tracking-wider uppercase flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-[#EF4444] animate-pulse" />
            Attack Simulator
          </h2>

          {/* Virus selector */}
          <div className="space-y-1">
            <label className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Choose Virus Type</label>
            <select
              value={selectedVirus}
              onChange={(e) => {
                setSelectedVirus(e.target.value);
                handleReset();
              }}
              disabled={mode === 'simulation' && simulationStatus !== 'idle'}
              className="w-full bg-[#0F1720] border border-[#4B5563]/30 hover:border-[#FD802E]/30 text-[#F8FAFC] px-2 py-2 rounded-lg outline-none cursor-pointer transition-colors"
            >
              <option value="bfs">Worm Propagation (BFS)</option>
              <option value="dfs">Network Scanner (DFS)</option>
              <option value="multi_bfs">Coordinated Attack (Multi-BFS)</option>
            </select>
          </div>

          {/* Starting node selection info */}
          <div className="bg-[#0F1720]/50 border border-[#4B5563]/20 rounded-lg p-3 space-y-1.5 text-[11px] text-[#CBD5E1]">
            <strong className="text-[#FD802E]">Target Selection:</strong>
            <p className="text-[10px] text-[#94A3B8] leading-normal">
              {selectedVirus === 'multi_bfs' 
                ? 'Click multiple devices on the canvas as initial infection points.'
                : 'Click any device on the canvas to set it as the starting target.'}
            </p>
            {startNodes.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-2">
                {startNodes.map(id => (
                  <span key={id} className="bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/25 px-1.5 py-0.5 rounded font-mono text-[9px]">
                    {id}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[#EF4444] font-semibold block mt-1.5">No node selected.</span>
            )}
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] rounded text-[10px] font-mono leading-normal">
              {errorMsg}
            </div>
          )}

          {/* Start simulation button */}
          {simulationStatus === 'idle' && (
            <button
              onClick={handlePlayPause}
              disabled={startNodes.length === 0}
              className="w-full py-2.5 bg-[#EF4444] hover:bg-[#F87171] text-[#F8FAFC] font-bold rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4" />
              Infect Network
            </button>
          )}
        </div>

        {/* Dynamic Queue/Stack tracking section */}
        {mode === 'simulation' && simulationStatus !== 'idle' && (
          <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-4">
            
            {/* Playback action display panel */}
            <div className="space-y-1">
              <label className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Active Operation</label>
              <div className="bg-[#0F1720]/80 border border-[#4B5563]/30 rounded-lg p-3 text-[11px] font-mono text-[#F8FAFC] min-h-[44px] flex items-center leading-normal">
                {activeFrameData.action}
              </div>
            </div>

            {/* Traversal Data Structure Display */}
            {selectedVirus === 'dfs' ? (
              // DFS Stack Visual widget
              <div className="flex-1 flex flex-col overflow-hidden space-y-1.5">
                <label className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Memory Stack (LIFO)</label>
                <div className="flex-1 bg-[#0F1720]/40 border border-[#4B5563]/25 rounded-lg p-3 flex flex-col-reverse justify-start overflow-y-auto gap-1">
                  {activeFrameData.stack && activeFrameData.stack.length > 0 ? (
                    activeFrameData.stack.map((item, idx) => (
                      <div 
                        key={`${item}-${idx}`} 
                        className={`p-2 rounded border text-center font-mono text-[10px] transition-all ${
                          idx === activeFrameData.stack.length - 1
                            ? 'bg-[#FD802E]/25 border-[#FD802E] text-[#FD802E] font-bold shadow-[0_0_8px_rgba(253,128,46,0.2)]'
                            : 'bg-[#1B2838] border-[#4B5563]/20 text-[#CBD5E1]'
                        }`}
                      >
                        {item} {idx === activeFrameData.stack.length - 1 && '← Top'}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-[#94A3B8] italic my-auto">Stack is empty</div>
                  )}
                </div>
              </div>
            ) : (
              // BFS Queue Visual widget
              <div className="flex-1 flex flex-col overflow-hidden space-y-1.5">
                <label className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider font-sans">Frontier Queue (FIFO)</label>
                <div className="flex-1 bg-[#0F1720]/40 border border-[#4B5563]/25 rounded-lg p-3 flex flex-col justify-start overflow-y-auto gap-1">
                  {activeFrameData.queue && activeFrameData.queue.length > 0 ? (
                    activeFrameData.queue.map((item, idx) => (
                      <div 
                        key={`${item}-${idx}`} 
                        className={`p-2 rounded border text-center font-mono text-[10px] transition-all ${
                          idx === 0
                            ? 'bg-[#FD802E]/25 border-[#FD802E] text-[#FD802E] font-bold shadow-[0_0_8px_rgba(253,128,46,0.2)]'
                            : 'bg-[#1B2838] border-[#4B5563]/20 text-[#CBD5E1]'
                        }`}
                      >
                        {item} {idx === 0 && '← Head'}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-[#94A3B8] italic my-auto">Queue is empty</div>
                  )}
                </div>
              </div>
            )}

            {/* General metrics */}
            <div className="border-t border-[#4B5563]/20 pt-4 grid grid-cols-2 gap-3 text-center text-[10px] font-mono">
              <div className="bg-[#0F1720]/50 p-2 rounded border border-[#4B5563]/10">
                <span className="text-[#94A3B8] block text-[9px] uppercase tracking-wider mb-0.5">Infected</span>
                <span className="text-[#EF4444] font-black text-sm">{activeFrameData.visited?.length || 0} / {nodes.length}</span>
              </div>
              <div className="bg-[#0F1720]/50 p-2 rounded border border-[#4B5563]/10">
                <span className="text-[#94A3B8] block text-[9px] uppercase tracking-wider mb-0.5">Timeline Step</span>
                <span className="text-[#F8FAFC] font-black text-sm">{currentFrame + 1} / {timeline.length}</span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Main Canvas Work Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Playback timeline slider bar overlay (Header on Canvas) */}
        {mode === 'simulation' && timeline.length > 0 && (
          <div className="h-12 bg-[#233D4C]/60 backdrop-blur-md border-b border-[#4B5563]/20 flex items-center justify-between px-6 z-10 select-none">
            {/* Playback buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={prevStep}
                disabled={currentFrame === 0}
                className="p-1.5 rounded bg-[#1B2838] border border-[#4B5563]/25 text-[#CBD5E1] hover:text-[#FD802E] disabled:opacity-30 transition-colors"
                title="Previous step"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <button
                onClick={handlePlayPause}
                className={`flex items-center gap-1.5 px-3 py-1 bg-[#1B2838] border border-[#4B5563]/25 text-[#F8FAFC] hover:text-[#FD802E] rounded-lg transition-colors font-semibold`}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5 text-[#FD802E]" /> : <Play className="h-3.5 w-3.5 text-[#22C55E]" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={nextStep}
                disabled={currentFrame === timeline.length - 1}
                className="p-1.5 rounded bg-[#1B2838] border border-[#4B5563]/25 text-[#CBD5E1] hover:text-[#FD802E] disabled:opacity-30 transition-colors"
                title="Next step"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                onClick={handleReset}
                className="p-1.5 rounded bg-[#1B2838] border border-[#4B5563]/25 text-[#CBD5E1] hover:text-[#EF4444] transition-colors"
                title="Reset simulation"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Slider track bar */}
            <div className="flex-1 mx-6 flex items-center gap-3">
              <span className="text-[10px] font-mono text-[#94A3B8]">0</span>
              <input
                type="range"
                min="0"
                max={timeline.length - 1}
                value={currentFrame}
                onChange={(e) => {
                  setCurrentFrame(parseInt(e.target.value) || 0);
                  pausePlayback();
                }}
                className="flex-1 accent-[#FD802E] h-1 bg-[#0F1720] rounded-lg cursor-pointer appearance-none"
              />
              <span className="text-[10px] font-mono text-[#94A3B8]">{timeline.length - 1}</span>
            </div>

            {/* Speed slider */}
            <div className="flex items-center gap-1.5 bg-[#1B2838] px-2.5 py-1 rounded-lg border border-[#4B5563]/25">
              <span className="text-[9px] text-[#94A3B8] font-bold uppercase font-mono">Speed:</span>
              <select
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="bg-transparent text-[10px] font-bold text-[#FD802E] outline-none cursor-pointer"
              >
                {SPEED_LEVELS.map(lvl => (
                  <option key={lvl.value} value={lvl.value} className="bg-[#233D4C] text-[#F8FAFC]">{lvl.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* React Flow canvas */}
        <div className="flex-1 h-full relative" style={{ pointerEvents: simulationStatus === 'loading' ? 'none' : 'auto' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={onNodeClick}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            fitView
            minZoom={0.1}
            maxZoom={4}
          >
            <Background color="#4B5563" gap={16} size={1} />
            <Controls className="react-flow__controls" />
          </ReactFlow>
        </div>

        {/* Display details on complexity variables inside bottom sheet overlay (Learning Mode details) */}
        {mode === 'simulation' && timeline.length > 0 && learning.pseudoCode && (
          <div className="h-44 bg-[#233D4C] border-t border-[#4B5563]/30 p-4 flex gap-4 select-none z-10 flex-shrink-0 overflow-y-auto">
            {/* Pseudocode panel */}
            <div className="w-1/2 flex flex-col h-full overflow-hidden border border-[#4B5563]/20 rounded-lg bg-[#0F1720]/40">
              <div className="bg-[#1B2838] px-3 py-1.5 border-b border-[#4B5563]/25 text-[10px] font-bold text-[#FD802E] uppercase tracking-wider">
                Algorithm Tracing (Pseudocode)
              </div>
              <div className="flex-1 overflow-y-auto p-3 font-mono text-[9px] text-[#CBD5E1] space-y-0.5 leading-normal">
                {learning.pseudoCode.map((line, idx) => {
                  const isEnqueue = (activeFrameData.action.includes('Infection started') || activeFrameData.action.includes('compromised')) && line.includes('Enqueue');
                  const isDequeue = activeFrameData.action.includes('Scanning from active') && line.includes('Dequeue');
                  const isCheck = activeFrameData.action.includes('traversing') && line.includes('neighbor not in Visited');
                  const isBacktrack = activeFrameData.action.includes('Backtracking') && line.includes('Pop');
                  
                  const isHighlighted = isEnqueue || isDequeue || isCheck || isBacktrack;
                  
                  return (
                    <div 
                       key={`code-${idx}`} 
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        isHighlighted ? 'bg-[#FD802E]/20 text-[#FD802E] font-bold border-l-2 border-[#FD802E]' : ''
                      }`}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation panel */}
            <div className="w-1/2 flex flex-col h-full overflow-hidden border border-[#4B5563]/20 rounded-lg bg-[#0F1720]/40">
              <div className="bg-[#1B2838] px-3 py-1.5 border-b border-[#4B5563]/25 text-[10px] font-bold text-[#FD802E] uppercase tracking-wider">
                Explanation & Telemetry Complexities
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 text-[#CBD5E1] text-[11px] leading-relaxed">
                <p>{learning.explanation}</p>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
                  <div className="flex justify-between border-b border-[#4B5563]/10 pb-1">
                    <span className="text-[#94A3B8]">Time Complexity:</span>
                    <span className="text-[#22C55E] font-bold">{statistics.timeComplexity}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#4B5563]/10 pb-1">
                    <span className="text-[#94A3B8]">Space Complexity:</span>
                    <span className="text-[#22C55E] font-bold">{statistics.spaceComplexity}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AttackSimulation() {
  return (
    <ReactFlowProvider>
      <SimulationWorkspace />
    </ReactFlowProvider>
  );
}
