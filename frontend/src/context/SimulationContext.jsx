import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { projectService, algorithmService } from '../services/api';

/**
 * File: SimulationContext.jsx
 * Author: Antigravity AI
 * Purpose: React Context managing background execution timelines for both attack simulations and recovery planning.
 */

const SimulationContext = createContext(null);

export function SimulationProvider({ children }) {
  const [originalNodes, setOriginalNodes] = useState([]);
  const [originalEdges, setOriginalEdges] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  
  // Simulation/Recovery States
  const [mode, setMode] = useState('idle'); // 'idle' | 'simulation' | 'recovery'
  const [algoId, setAlgoId] = useState('');
  const [selectedVirus, setSelectedVirus] = useState('bfs');
  const [startNodes, setStartNodes] = useState([]);
  const [recoverySource, setRecoverySource] = useState('');
  const [recoveryTarget, setRecoveryTarget] = useState('');
  const [budget, setBudget] = useState(100);
  const [infectedNodes, setInfectedNodes] = useState([]);

  // Playback Control States
  const [timeline, setTimeline] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [simulationStatus, setSimulationStatus] = useState('idle'); // 'idle' | 'loading' | 'running' | 'paused' | 'completed'
  const [statistics, setStatistics] = useState({});
  const [learning, setLearning] = useState({});
  const [finalResult, setFinalResult] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  
  // Telemetry elapsed timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  const playbackInterval = useRef(null);

  // Load baseline active graph
  const loadGraph = async () => {
    if (mode === 'simulation' || mode === 'recovery' || isPlaying) {
      return;
    }
    setSimulationStatus('loading');
    setErrorMsg('');
    try {
      let loadedNodes = [];
      let loadedEdges = [];
      
      const draftStr = localStorage.getItem('netshield_autosave');
      if (draftStr) {
        const draft = JSON.parse(draftStr);
        loadedNodes = draft.nodes || [];
        loadedEdges = draft.edges || [];
      } else {
        const response = await projectService.loadProject();
        if (response.success && response.project && response.project.network) {
          const net = response.project.network;
          loadedNodes = (net.nodes || []).map(n => ({
            id: n.id,
            type: n.type,
            position: n.position,
            data: { label: n.label, status: n.status || 'healthy' }
          }));
          
          loadedEdges = (net.edges || []).map(e => ({
            id: `e-${e.source}-${e.target}`,
            source: e.source,
            target: e.target,
            type: 'customEdge',
            data: { weight: e.weight, latency: e.latency, bandwidth: e.bandwidth }
          }));
        }
      }

      // Format healthy status
      const healthyNodes = loadedNodes.map(n => ({
        ...n,
        data: { ...n.data, status: 'healthy' }
      }));
      
      const formattedEdges = loadedEdges.map(e => ({
        ...e,
        type: 'customEdge',
        data: { ...e.data, isSimulation: false, isRecovery: false }
      }));

      setOriginalNodes(healthyNodes);
      setOriginalEdges(formattedEdges);
      setNodes(healthyNodes);
      setEdges(formattedEdges);

      // Pre-select default recovery source (Router or Core Switch)
      const coreNode = healthyNodes.find(n => n.type === 'Router' || n.type === 'Core Switch');
      if (coreNode) {
        setRecoverySource(coreNode.id);
      } else if (healthyNodes.length > 0) {
        setRecoverySource(healthyNodes[0].id);
      }

      setSimulationStatus('idle');
    } catch (err) {
      console.error('Failed to load global graph context', err);
      setErrorMsg('Failed to initialize active graph topology.');
      setSimulationStatus('idle');
    }
  };

  useEffect(() => {
    loadGraph();
  }, []);

  // Tick frames
  useEffect(() => {
    if (playbackInterval.current) clearInterval(playbackInterval.current);

    if (isPlaying && simulationStatus === 'running' && timeline.length > 0) {
      const stepDuration = 500 / speed;
      playbackInterval.current = setInterval(() => {
        setCurrentFrame(prev => {
          if (prev >= timeline.length - 1) {
            clearInterval(playbackInterval.current);
            setIsPlaying(false);
            setSimulationStatus('completed');
            return prev;
          }
          return prev + 1;
        });
      }, stepDuration);
    }

    return () => {
      if (playbackInterval.current) clearInterval(playbackInterval.current);
    };
  }, [isPlaying, simulationStatus, timeline, speed]);

  // Elapsed duration seconds tracker
  useEffect(() => {
    let timerInterval = null;
    if (isPlaying && simulationStatus === 'running') {
      timerInterval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isPlaying, simulationStatus]);

  // Apply visual styling dynamically on frame changes
  useEffect(() => {
    if (originalNodes.length === 0) return;

    if (mode === 'idle') {
      setNodes(originalNodes.map(n => {
        const isStart = startNodes.includes(n.id);
        const isSrc = n.id === recoverySource;
        const isDst = n.id === recoveryTarget;
        
        let status = 'healthy';
        if (isStart || isSrc || isDst) {
          status = 'protected'; // gold highlight
        }
        
        return {
          ...n,
          data: {
            ...n.data,
            status
          }
        };
      }));

      setEdges(originalEdges.map(e => ({
        ...e,
        selected: false,
        data: {
          ...e.data,
          isSimulation: false,
          isRecovery: false
        }
      })));
      return;
    }

    if (timeline.length === 0 || currentFrame >= timeline.length) return;
    const frame = timeline[currentFrame];
    const visitedSet = new Set(frame.visited || []);
    const activeNode = frame.currentNode;
    const activeEdge = frame.currentEdge;

    if (mode === 'simulation') {
      setNodes(originalNodes.map(n => {
        let status = 'healthy';
        if (visitedSet.has(n.id)) status = 'infected';
        if (activeNode === n.id) status = 'infected';
        
        const isStart = startNodes.includes(n.id);
        return {
          ...n,
          selected: activeNode === n.id,
          data: {
            ...n.data,
            status: status === 'infected' ? 'infected' : (isStart ? 'protected' : 'healthy')
          }
        };
      }));

      setEdges(originalEdges.map(e => {
        const isActive = activeEdge && (
          (e.source === activeEdge[0] && e.target === activeEdge[1]) ||
          (e.source === activeEdge[1] && e.target === activeEdge[0])
        );
        return {
          ...e,
          selected: !!isActive,
          data: {
            ...e.data,
            isSimulation: !!isActive,
            isRecovery: false
          }
        };
      }));
    } else if (mode === 'recovery') {
      setNodes(originalNodes.map(n => {
        let status = infectedNodes.includes(n.id) ? 'infected' : 'healthy';
        
        if (visitedSet.has(n.id)) status = 'recovered';
        if (activeNode === n.id) status = 'recovered';

        const isSrc = n.id === recoverySource;
        const isDst = n.id === recoveryTarget;
        if ((isSrc || isDst) && status !== 'recovered') {
          status = 'protected'; // gold highlight
        }

        return {
          ...n,
          selected: activeNode === n.id,
          data: {
            ...n.data,
            status
          }
        };
      }));

      setEdges(originalEdges.map(e => {
        const isActive = activeEdge && (
          (e.source === activeEdge[0] && e.target === activeEdge[1]) ||
          (e.source === activeEdge[1] && e.target === activeEdge[0])
        );
        return {
          ...e,
          selected: !!isActive,
          data: {
            ...e.data,
            isSimulation: false,
            isRecovery: !!isActive
          }
        };
      }));
    }
  }, [currentFrame, timeline, mode, originalNodes, originalEdges, startNodes, recoverySource, recoveryTarget, infectedNodes]);

  const [saveStatus, setSaveStatus] = useState(''); // '' | 'saving' | 'saved' | 'error'

  const saveActiveProject = async () => {
    setSaveStatus('saving');
    try {
      let nodesToSave = originalNodes;
      let edgesToSave = originalEdges;
      
      const draftStr = localStorage.getItem('netshield_autosave');
      if (draftStr) {
        const draft = JSON.parse(draftStr);
        nodesToSave = (draft.nodes || []).map(n => ({
          id: n.id,
          type: n.type || 'PC',
          position: n.position,
          data: { label: n.data?.label || n.label, status: n.data?.status || n.status || 'healthy' }
        }));
        edgesToSave = (draft.edges || []).map(e => ({
          id: e.id || `e-${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          type: 'customEdge',
          data: { weight: e.data?.weight ?? e.weight ?? 1.0, latency: e.data?.latency ?? e.latency ?? 10.0, bandwidth: e.data?.bandwidth ?? e.bandwidth ?? 100.0 }
        }));
      }

      const formattedNodes = nodesToSave.map(node => ({
        id: node.id,
        label: node.data?.label || node.id,
        type: node.type || 'PC',
        status: node.data?.status || 'healthy',
        position: node.position
      }));

      const formattedEdges = edgesToSave.map(edge => ({
        source: edge.source,
        target: edge.target,
        weight: parseFloat(edge.data?.weight ?? 1),
        latency: parseFloat(edge.data?.latency ?? 10),
        bandwidth: parseFloat(edge.data?.bandwidth ?? 100)
      }));

      const projectState = {
        project: {},
        network: { nodes: formattedNodes, edges: formattedEdges },
        simulation: {},
        recovery: {},
        settings: {},
        metadata: {
          projectName: 'My Network Builder Graph',
          author: 'KTU DAA Student',
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          version: '1.0'
        }
      };

      const response = await projectService.saveProject(projectState);
      if (response.success) {
        setSaveStatus('saved');
        setOriginalNodes(nodesToSave);
        setOriginalEdges(edgesToSave);
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (err) {
      setSaveStatus('error');
      console.error('Failed to save active project', err);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // API Trigger: Start Attack Infection
  const triggerAttack = async (virusType, initNodes) => {
    setMode('simulation');
    setAlgoId(virusType);
    setSelectedVirus(virusType);
    setStartNodes(initNodes);
    setSimulationStatus('loading');
    setErrorMsg('');
    
    try {
      const response = await algorithmService.simulateAttack(virusType, originalNodes, originalEdges, initNodes);
      if (response.success && response.timeline) {
        setTimeline(response.timeline);
        setStatistics(response.statistics || {});
        setLearning(response.learning || {});
        setCurrentFrame(0);
        setElapsedSeconds(0);
        setSimulationStatus('running');
        setIsPlaying(true);
      } else {
        setErrorMsg('Attack simulation calculation failed.');
        setSimulationStatus('idle');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Simulation API request failed.');
      setSimulationStatus('idle');
    }
  };

  // API Trigger: Start Recovery planner
  const triggerRecovery = async (recoveryAlgo, options = {}) => {
    let currentInfected = [];
    
    // Auto-detect infected nodes from previous simulation visited list
    if (timeline.length > 0 && mode === 'simulation') {
      const lastFrame = timeline[timeline.length - 1] || {};
      currentInfected = lastFrame.visited || [];
    }

    if (currentInfected.length === 0) {
      // Fallback default infected group
      originalNodes.forEach(n => {
        if (['PC', 'Laptop', 'Application Server', 'Database Server', 'Backup Server'].includes(n.type)) {
          currentInfected.push(n.id);
        }
      });
    }

    setInfectedNodes(currentInfected);

    // Auto-resolve Dijkstra destination target
    let src = options.source || recoverySource;
    let dest = options.destination || recoveryTarget;
    if (recoveryAlgo === 'dijkstra' && (!dest || dest === src)) {
      const serverNodes = currentInfected.filter(id => id.startsWith('SRV-'));
      if (serverNodes.length > 0) {
        dest = serverNodes[0];
      } else {
        const candidates = currentInfected.filter(id => id !== src);
        dest = candidates.length > 0 ? candidates[0] : (originalNodes.find(n => n.id !== src)?.id || '');
      }
      options.destination = dest;
      setRecoveryTarget(dest);
    }

    setMode('recovery');
    setAlgoId(recoveryAlgo);
    setSimulationStatus('loading');
    setErrorMsg('');
    
    try {
      const response = await algorithmService.recoverNetwork(recoveryAlgo, originalNodes, originalEdges, options);
      if (response.success && response.timeline) {
        setTimeline(response.timeline);
        setStatistics(response.statistics || {});
        setLearning(response.learning || {});
        setFinalResult(response.result || {});
        setCurrentFrame(0);
        setElapsedSeconds(0);
        setSimulationStatus('running');
        setIsPlaying(true);
      } else {
        setErrorMsg('Recovery planning computation failed.');
        setSimulationStatus('idle');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Recovery planner API request failed.');
      setSimulationStatus('idle');
    }
  };

  // Playback Control Actions
  const pausePlayback = () => {
    setIsPlaying(false);
    setSimulationStatus('paused');
  };

  const resumePlayback = () => {
    setIsPlaying(true);
    setSimulationStatus('running');
  };

  const resetPlayback = () => {
    if (playbackInterval.current) clearInterval(playbackInterval.current);
    setIsPlaying(false);
    setCurrentFrame(0);
    setTimeline([]);
    setStartNodes([]);
    setStatistics({});
    setLearning({});
    setFinalResult({});
    setErrorMsg('');
    setSimulationStatus('idle');
    setMode('idle');
    setElapsedSeconds(0);
    
    // reset canvas colors
    setNodes(originalNodes);
    setEdges(originalEdges);
  };

  const nextStep = () => {
    if (timeline.length === 0) return;
    setIsPlaying(false);
    setSimulationStatus('paused');
    setCurrentFrame(prev => Math.min(prev + 1, timeline.length - 1));
  };

  const prevStep = () => {
    if (timeline.length === 0) return;
    setIsPlaying(false);
    setSimulationStatus('paused');
    setCurrentFrame(prev => Math.max(prev - 1, 0));
  };

  const value = {
    nodes,
    edges,
    originalNodes,
    originalEdges,
    mode,
    algoId,
    selectedVirus,
    setSelectedVirus,
    startNodes,
    setStartNodes,
    recoverySource,
    setRecoverySource,
    recoveryTarget,
    setRecoveryTarget,
    budget,
    setBudget,
    timeline,
    currentFrame,
    setCurrentFrame,
    isPlaying,
    speed,
    setSpeed,
    simulationStatus,
    statistics,
    learning,
    finalResult,
    errorMsg,
    elapsedSeconds,
    infectedNodes,
    setInfectedNodes,
    saveActiveProject,
    saveStatus,
    triggerAttack,
    triggerRecovery,
    pausePlayback,
    resumePlayback,
    resetPlayback,
    nextStep,
    prevStep,
    syncGraph: loadGraph
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
