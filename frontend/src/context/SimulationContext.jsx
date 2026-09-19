import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { projectService, algorithmService, templateService } from '../services/api';

// ── Office network template v2 — 1 Server · 2 Routers · 2 Switches · 8 named desks ──
const OFFICE_TEMPLATE_VERSION = 'office_v2';
const OFFICE_TEMPLATE_NODES = [
  // ── Core Internet & Security ──────────────────────────────────────────────────
  { id: 'NET-1',  type: 'Internet',          position: { x: 500, y: 30  }, data: { label: 'Internet Gateway',          status: 'healthy' } },
  { id: 'FW-1',   type: 'Firewall',           position: { x: 500, y: 130 }, data: { label: 'Office Firewall',           status: 'healthy' } },
  // ── Routing Layer (2 Routers) ─────────────────────────────────────────────────
  { id: 'R-1',    type: 'Router',             position: { x: 200, y: 260 }, data: { label: 'Router A (Floor 1)',        status: 'healthy' } },
  { id: 'R-2',    type: 'Router',             position: { x: 800, y: 260 }, data: { label: 'Router B (Floor 2)',        status: 'healthy' } },
  // ── Server ───────────────────────────────────────────────────────────────────
  { id: 'SRV-1',  type: 'Application Server', position: { x: 500, y: 260 }, data: { label: 'Main Server',               status: 'healthy' } },
  // ── Switching Layer (2 Switches) ──────────────────────────────────────────────
  { id: 'SW-1',   type: 'Access Switch',      position: { x: 100, y: 400 }, data: { label: 'Switch 1 (Dev & Design)',   status: 'healthy' } },
  { id: 'SW-2',   type: 'Access Switch',      position: { x: 700, y: 400 }, data: { label: 'Switch 2 (Ops & Admin)',    status: 'healthy' } },
  // ── Workstations — Floor 1 (Switch 1) ────────────────────────────────────────
  { id: 'PC-1',   type: 'PC',                 position: { x: 0,   y: 540 }, data: { label: "Aarav's Desk",             status: 'healthy' } },
  { id: 'PC-2',   type: 'PC',                 position: { x: 120, y: 540 }, data: { label: "Arjun's Desk",             status: 'healthy' } },
  { id: 'PC-3',   type: 'Laptop',             position: { x: 240, y: 540 }, data: { label: "Ananya's Desk",            status: 'healthy' } },
  { id: 'PC-4',   type: 'PC',                 position: { x: 360, y: 540 }, data: { label: "Rahul's Desk",             status: 'healthy' } },
  // ── Workstations — Floor 2 (Switch 2) ────────────────────────────────────────
  { id: 'PC-5',   type: 'PC',                 position: { x: 580, y: 540 }, data: { label: "Rohan's Desk",             status: 'healthy' } },
  { id: 'PC-6',   type: 'PC',                 position: { x: 700, y: 540 }, data: { label: "Aadhya's Desk",            status: 'healthy' } },
  { id: 'PC-7',   type: 'PC',                 position: { x: 820, y: 540 }, data: { label: "Aditya's Desk",            status: 'healthy' } },
  { id: 'PC-8',   type: 'Laptop',             position: { x: 940, y: 540 }, data: { label: "Dhruv's Desk",             status: 'healthy' } },
];
const OFFICE_TEMPLATE_EDGES = [
  // Internet → Firewall
  { id: 'e-NET-1-FW-1',  source: 'NET-1', target: 'FW-1',  type: 'customEdge', data: { weight: 1, latency: 1,  bandwidth: 1000, isSimulation: false, isRecovery: false } },
  // Firewall → Both Routers
  { id: 'e-FW-1-R-1',    source: 'FW-1',  target: 'R-1',   type: 'customEdge', data: { weight: 1, latency: 2,  bandwidth: 1000, isSimulation: false, isRecovery: false } },
  { id: 'e-FW-1-R-2',    source: 'FW-1',  target: 'R-2',   type: 'customEdge', data: { weight: 1, latency: 2,  bandwidth: 1000, isSimulation: false, isRecovery: false } },
  // Both Routers → Main Server
  { id: 'e-R-1-SRV-1',   source: 'R-1',   target: 'SRV-1', type: 'customEdge', data: { weight: 2, latency: 3,  bandwidth: 1000, isSimulation: false, isRecovery: false } },
  { id: 'e-R-2-SRV-1',   source: 'R-2',   target: 'SRV-1', type: 'customEdge', data: { weight: 2, latency: 3,  bandwidth: 1000, isSimulation: false, isRecovery: false } },
  // Inter-Router redundancy link
  { id: 'e-R-1-R-2',     source: 'R-1',   target: 'R-2',   type: 'customEdge', data: { weight: 3, latency: 4,  bandwidth: 1000, isSimulation: false, isRecovery: false } },
  // Routers → Switches
  { id: 'e-R-1-SW-1',    source: 'R-1',   target: 'SW-1',  type: 'customEdge', data: { weight: 1, latency: 3,  bandwidth: 1000, isSimulation: false, isRecovery: false } },
  { id: 'e-R-2-SW-2',    source: 'R-2',   target: 'SW-2',  type: 'customEdge', data: { weight: 1, latency: 3,  bandwidth: 1000, isSimulation: false, isRecovery: false } },
  // Switch 1 → Floor 1 Desks
  { id: 'e-SW-1-PC-1',   source: 'SW-1',  target: 'PC-1',  type: 'customEdge', data: { weight: 1, latency: 5,  bandwidth: 100,  isSimulation: false, isRecovery: false } },
  { id: 'e-SW-1-PC-2',   source: 'SW-1',  target: 'PC-2',  type: 'customEdge', data: { weight: 1, latency: 5,  bandwidth: 100,  isSimulation: false, isRecovery: false } },
  { id: 'e-SW-1-PC-3',   source: 'SW-1',  target: 'PC-3',  type: 'customEdge', data: { weight: 1, latency: 6,  bandwidth: 100,  isSimulation: false, isRecovery: false } },
  { id: 'e-SW-1-PC-4',   source: 'SW-1',  target: 'PC-4',  type: 'customEdge', data: { weight: 1, latency: 5,  bandwidth: 100,  isSimulation: false, isRecovery: false } },
  // Switch 2 → Floor 2 Desks
  { id: 'e-SW-2-PC-5',   source: 'SW-2',  target: 'PC-5',  type: 'customEdge', data: { weight: 1, latency: 5,  bandwidth: 100,  isSimulation: false, isRecovery: false } },
  { id: 'e-SW-2-PC-6',   source: 'SW-2',  target: 'PC-6',  type: 'customEdge', data: { weight: 1, latency: 5,  bandwidth: 100,  isSimulation: false, isRecovery: false } },
  { id: 'e-SW-2-PC-7',   source: 'SW-2',  target: 'PC-7',  type: 'customEdge', data: { weight: 1, latency: 5,  bandwidth: 100,  isSimulation: false, isRecovery: false } },
  { id: 'e-SW-2-PC-8',   source: 'SW-2',  target: 'PC-8',  type: 'customEdge', data: { weight: 1, latency: 6,  bandwidth: 100,  isSimulation: false, isRecovery: false } },
];

/**
 * File: SimulationContext.jsx
 * Author: Antigravity AI
 * Purpose: React Context managing background execution timelines for both attack simulations and recovery planning.
 */

const SimulationContext = createContext(null);

// Helper to restore initial canvas coordinates on page mounts
const getInitialNodes = () => {
  try {
    const draftStr = localStorage.getItem('netshield_autosave');
    if (draftStr) {
      const draft = JSON.parse(draftStr);
      if (draft.nodes && draft.nodes.length > 0) {
        return draft.nodes;
      }
    }
  } catch (e) {
    console.error('Failed to parse autosave nodes draft in context', e);
  }
  return [];
};

const getInitialEdges = () => {
  try {
    const draftStr = localStorage.getItem('netshield_autosave');
    if (draftStr) {
      const draft = JSON.parse(draftStr);
      if (draft.edges) {
        return draft.edges;
      }
    }
  } catch (e) {
    console.error('Failed to parse autosave edges draft in context', e);
  }
  return [];
};

export function SimulationProvider({ children }) {
  const [originalNodes, setOriginalNodes] = useState(getInitialNodes());
  const [originalEdges, setOriginalEdges] = useState(getInitialEdges());
  const [nodes, setNodes] = useState(getInitialNodes());
  const [edges, setEdges] = useState(getInitialEdges());
  
  // Simulation/Recovery States
  const [mode, setMode] = useState('idle'); // 'idle' | 'simulation' | 'recovery'
  const [algoId, setAlgoId] = useState('');
  const [selectedVirus, setSelectedVirus] = useState('bfs');
  const [startNodes, setStartNodes] = useState([]);
  const [recoverySource, setRecoverySource] = useState('');
  const [recoveryTarget, setRecoveryTarget] = useState('');

  // Notification banner for auto-failover and informational alerts
  const [notification, setNotification] = useState(''); // transient text message
  const notificationTimeoutRef = useRef(null);

  const triggerNotification = (msg, durationMs = 4000) => {
    setNotification(msg);
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    notificationTimeoutRef.current = setTimeout(() => setNotification(''), durationMs);
  };
  const [budget, setBudget] = useState(100);
  const [infectedNodes, setInfectedNodes] = useState([]);

  // Configurable Sim settings
  const [compromiseTime, setCompromiseTime] = useState(2000); // default 2s
  const [recoveryTime, setRecoveryTime] = useState(800); // default 0.8s
  const [propagationDelay, setPropagationDelay] = useState(500); // default 0.5s

  // Live simulation states
  const [nodeSimStates, setNodeSimStates] = useState({});
  const [activePulses, setActivePulses] = useState([]);
  const [isolatedEdges, setIsolatedEdges] = useState({});
  // Set of edge keys "source->target" that the virus has already traversed — persistent trail
  const [traversedEdges, setTraversedEdges] = useState(new Set());
  const [blockedCount, setBlockedCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);

  const simQueueRef = useRef([]);
  const simStackRef = useRef([]);
  // Ref that always holds the latest nodeSimStates — prevents stale closures in setTimeout/setInterval callbacks
  const nodeSimStatesRef = useRef({});
  // Ref that always holds the latest finalResult for recovery propagation
  const finalResultRef = useRef({});
  // Visited Set for DFS — tracks which nodes have been pushed to stack (separate from React state)
  const dfsVisitedRef = useRef(new Set());

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

  // Keep nodeSimStatesRef in sync so setTimeout/setInterval callbacks always read current state
  useEffect(() => {
    nodeSimStatesRef.current = nodeSimStates;
  }, [nodeSimStates]);

  // Keep finalResultRef in sync
  useEffect(() => {
    finalResultRef.current = finalResult;
  }, [finalResult]);

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
        try {
          const draft = JSON.parse(draftStr);

          // College template fingerprint — node IDs that only appear in the college topology
          const COLLEGE_NODE_IDS = new Set(['CSW-A', 'CSW-B', 'SW-ADMIN', 'SW-CSE', 'SW-ECE', 'SW-LIB', 'SW-SRV']);
          const isCollegeTemplate =
            draft.template === 'college' ||
            (Array.isArray(draft.nodes) &&
              draft.nodes.some(n => COLLEGE_NODE_IDS.has(n.id)));

          if (isCollegeTemplate) {
            // Stale college topology in cache — wipe it so the correct network loads
            console.log('[SimulationContext] College template detected in localStorage — clearing stale cache.');
            localStorage.removeItem('netshield_autosave');
          } else if (draft.templateVersion !== OFFICE_TEMPLATE_VERSION && draft.template === 'office') {
            // Old office template version — upgrade to latest
            console.log('[SimulationContext] Old office template detected — upgrading to', OFFICE_TEMPLATE_VERSION);
            localStorage.removeItem('netshield_autosave');
          } else if (draft.nodes && Array.isArray(draft.nodes) && draft.nodes.length > 0) {
            loadedNodes = draft.nodes;
            loadedEdges = draft.edges || [];
          }
        } catch (e) {
          console.error('Failed to parse autosave draft', e);
        }
      }
      
      if (loadedNodes.length === 0) {
        const response = await projectService.loadProject();
        if (response.success && response.project && response.project.network) {
          const net = response.project.network;
          if (net.nodes && net.nodes.length > 0) {
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
      }

      // If still empty, fall back directly to the hardcoded office setup template
      if (loadedNodes.length === 0) {
        try {
          const tmpl = await templateService.loadTemplate('office');
          if (tmpl.success && tmpl.graph) {
            loadedNodes = (tmpl.graph.nodes || []).map(n => ({
              id: n.id,
              type: n.type,
              position: n.position,
              data: { label: n.label, status: n.status || 'healthy' }
            }));
            loadedEdges = (tmpl.graph.edges || []).map(e => ({
              id: `e-${e.source}-${e.target}`,
              source: e.source,
              target: e.target,
              type: 'customEdge',
              data: { weight: e.weight, latency: e.latency, bandwidth: e.bandwidth }
            }));
          }
        } catch (tmplErr) {
          console.warn('Template API unavailable, using hardcoded office template', tmplErr);
        }
      }

      // Absolute last resort: use the hardcoded office template embedded in this file
      if (loadedNodes.length === 0) {
        loadedNodes = OFFICE_TEMPLATE_NODES;
        loadedEdges = OFFICE_TEMPLATE_EDGES;
        console.log('[SimulationContext] Loaded hardcoded office template as final fallback');
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

      // Persist to localStorage so other pages share the same loaded graph immediately
      try {
        const existing = localStorage.getItem('netshield_autosave');
        const existingParsed = existing ? JSON.parse(existing) : {};
        if (!existingParsed.nodes || existingParsed.nodes.length === 0) {
          localStorage.setItem('netshield_autosave', JSON.stringify({
            ...existingParsed,
            nodes: healthyNodes,
            edges: formattedEdges,
            template: 'office',
            templateVersion: OFFICE_TEMPLATE_VERSION
          }));
        }
      } catch (e) { /* ignore storage errors */ }

      // Pre-select default recovery source: prefer any healthy Server type
      const SERVER_TYPES = ['Application Server', 'Database Server', 'Backup Server'];
      const serverNode = healthyNodes.find(n => SERVER_TYPES.includes(n.type));
      if (serverNode) {
        setRecoverySource(serverNode.id);
      } else {
        // Fallback to Router or first available node
        const coreNode = healthyNodes.find(n => n.type === 'Router' || n.type === 'Core Switch');
        if (coreNode) {
          setRecoverySource(coreNode.id);
        } else if (healthyNodes.length > 0) {
          setRecoverySource(healthyNodes[0].id);
        }
      }

      if (healthyNodes.length > 0) {
        const defaultWorkstation = healthyNodes.find(n => n.type === 'PC' || n.type === 'Laptop') || healthyNodes[0];
        setStartNodes(prev => (prev.length === 0 ? [defaultWorkstation.id] : prev));
        setRecoveryTarget(prev => (!prev ? defaultWorkstation.id : prev));
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

  // Auto-failover watcher: if the current recovery source becomes infected or isolated,
  // automatically choose another healthy server and notify the user.
  useEffect(() => {
    if (!recoverySource || originalNodes.length === 0) return;
    const SERVER_TYPES = ['Application Server', 'Database Server', 'Backup Server'];
    const UNAVAILABLE_STATUSES = new Set(['infected', 'compromising', 'isolated']);

    const currentSourceState = nodeSimStates[recoverySource] || { status: 'healthy', isIsolated: false };
    const isUnavailable = UNAVAILABLE_STATUSES.has(currentSourceState.status) || currentSourceState.isIsolated;

    if (isUnavailable) {
      // Find another healthy server
      const nextServer = originalNodes.find(n =>
        SERVER_TYPES.includes(n.type) &&
        n.id !== recoverySource &&
        !UNAVAILABLE_STATUSES.has(nodeSimStates[n.id]?.status) &&
        !nodeSimStates[n.id]?.isIsolated
      );
      if (nextServer) {
        setRecoverySource(nextServer.id);
        triggerNotification(`${recoverySource} is unavailable. ${nextServer.id} is now the Recovery Source.`);
      } else {
        triggerNotification(`⚠ RECOVERY SOURCE UNAVAILABLE — No healthy servers found.`);
      }
    }
  }, [nodeSimStates, recoverySource, originalNodes]);

  // Log new step frame in execution timeline
  const logTimelineEvent = (action, explanation, currentNode = null, currentEdge = null) => {
    setNodeSimStates(currentStates => {
      const stateSnapshot = {};
      originalNodes.forEach(n => {
        const state = currentStates[n.id] || { status: 'healthy', progress: 0, isIsolated: false };
        stateSnapshot[n.id] = { ...state };
      });

      const activeInfected = originalNodes
        .filter(n => currentStates[n.id]?.status === 'infected')
        .map(n => n.id);

      setTimeline(prev => {
        const nextStepNum = prev.length + 1;
        const newFrame = {
          step: nextStepNum,
          action,
          explanation,
          currentNode,
          currentEdge,
          visited: activeInfected,
          queue: [...simQueueRef.current],
          stack: [...simStackRef.current],
          nodeStatesSnapshot: stateSnapshot
        };
        
        setCurrentFrame(nextStepNum - 1);
        return [...prev, newFrame];
      });

      return currentStates;
    });
  };

  // Traversal search expansion logic
  // NOTE: reads from nodeSimStatesRef.current (always fresh) to avoid stale closure bugs
  const propagateFromNode = (n, currentQueue, currentStack) => {
    const simStates = nodeSimStatesRef.current;

    // Check if current node is isolated or recovered
    if (simStates[n]?.isIsolated || simStates[n]?.status === 'recovered') {
      return;
    }

    // 1. Find all active neighbors (undirected — check both source and target)
    const activeEdgesList = originalEdges.filter(e => {
      const isSrcIsolated = simStates[e.source]?.isIsolated;
      const isDstIsolated = simStates[e.target]?.isIsolated;
      return !isSrcIsolated && !isDstIsolated && (e.source === n || e.target === n);
    });

    const neighbors = activeEdgesList.map(e => e.source === n ? e.target : e.source);

    if (algoId === 'bfs' || algoId === 'multi_bfs') {
      neighbors.forEach(v => {
        const vState = simStates[v] || { status: 'healthy', progress: 0, isIsolated: false };
        // Use queue ref for dedup — don't rely on stale activePulses closure
        const alreadyQueued = simQueueRef.current.includes(v);
        if (vState.status === 'healthy' && !vState.isIsolated && !alreadyQueued) {
          const pulseId = `att-${n}-${v}-${Date.now()}`;
          setActivePulses(prev => [...prev, {
            id: pulseId,
            type: 'attack',
            source: n,
            target: v,
            progress: 0
          }]);

          currentQueue.push(v);
          simQueueRef.current = currentQueue;

          setTimeout(() => {
            logTimelineEvent(
              `Threat propagating from ${n} to ${v}`,
              `The virus has compromised ${n} and is now travelling along the link towards ${v}.`,
              n,
              [n, v]
            );
          }, 0);
        } else if (vState.isIsolated && !alreadyQueued) {
          setBlockedCount(prev => prev + 1);
          setTimeout(() => {
            logTimelineEvent(
              `Propagation Blocked at ${v}`,
              `The virus attempted to propagate from ${n} to ${v}, but the path was blocked because ${v} is isolated.`,
              n,
              [n, v]
            );
          }, 0);
        }
      });

    } else if (algoId === 'dfs') {
      // Use dfsVisitedRef to track visited nodes — immune to stale closure
      const visited = dfsVisitedRef.current;

      const nextNeighbor = neighbors.find(v => {
        const vState = simStates[v] || { status: 'healthy', progress: 0, isIsolated: false };
        // Node is reachable if: not visited by DFS, not isolated, not already compromised/infected
        return !visited.has(v) && !vState.isIsolated &&
          (vState.status === 'healthy' || vState.status === 'protected');
      });

      if (nextNeighbor) {
        // Mark as visited immediately so we don't re-probe it on the next backtrack
        visited.add(nextNeighbor);

        const pulseId = `att-${n}-${nextNeighbor}-${Date.now()}`;
        setActivePulses(prev => [...prev, {
          id: pulseId,
          type: 'attack',
          source: n,
          target: nextNeighbor,
          progress: 0
        }]);

        currentStack.push(nextNeighbor);
        simStackRef.current = currentStack;

        setTimeout(() => {
          logTimelineEvent(
            `DFS drills deeper from ${n} to ${nextNeighbor}`,
            `DFS explores the next unvisited neighbor ${nextNeighbor}. Propagation pulse launched.`,
            n,
            [n, nextNeighbor]
          );
        }, 0);
      } else {
        // No unvisited neighbors — backtrack
        currentStack.pop();
        simStackRef.current = currentStack;
        if (currentStack.length > 0) {
          const prevNode = currentStack[currentStack.length - 1];
          setTimeout(() => {
            logTimelineEvent(
              `Backtracking to ${prevNode}`,
              `No unvisited healthy neighbors found for ${n}. Backtracking to ${prevNode}.`,
              n,
              null
            );
            // Re-trigger DFS from the parent — it will now skip ${n} (already visited)
            propagateFromNode(prevNode, currentQueue, currentStack);
          }, 100);
        } else {
          setTimeout(() => {
            logTimelineEvent(
              `Scanner DFS Completed`,
              `All reachable network endpoints have been scanned. Simulation finished.`,
              null,
              null
            );
          }, 0);
        }
      }
    }
  };

  const propagateRecovery = (nodeId) => {
    // Use finalResultRef to avoid stale closure
    const result = finalResultRef.current;
    const path = result?.path || [];
    if (path.length > 0) {
      const idx = path.indexOf(nodeId);
      if (idx > -1 && idx < path.length - 1) {
        const nextNode = path[idx + 1];
        const targetState = nodeSimStatesRef.current[nextNode] || { status: 'healthy' };
        if (targetState.status !== 'recovering' && targetState.status !== 'recovered') {
          const pulseId = `rec-${nodeId}-${nextNode}-${Date.now()}`;
          setActivePulses(prev => [...prev, {
            id: pulseId,
            type: 'recovery',
            source: nodeId,
            target: nextNode,
            progress: 0
          }]);
        }
      }
    }

    const mstEdges = result?.mstEdges || [];
    if (mstEdges.length > 0) {
      mstEdges.forEach(edge => {
        let u = '';
        let v = '';
        if (typeof edge === 'string') {
          const parts = edge.split(' - ');
          u = parts[0];
          v = parts[1];
        } else if (edge.source && edge.target) {
          u = edge.source;
          v = edge.target;
        }

        if (u === nodeId || v === nodeId) {
          const neighbor = u === nodeId ? v : u;
          const targetState = nodeSimStatesRef.current[neighbor] || { status: 'healthy' };
          if (targetState.status !== 'recovering' && targetState.status !== 'recovered' && !targetState.isIsolated) {
            const pulseId = `rec-${nodeId}-${neighbor}-${Date.now()}`;
            setActivePulses(prev => [...prev, {
              id: pulseId,
              type: 'recovery',
              source: nodeId,
              target: neighbor,
              progress: 0
            }]);
          }
        }
      });
    }
  };

  // Node Context Quick actions handlers
  const handleNodeIsolate = (nodeId) => {
    setNodeSimStates(prev => {
      const next = { ...prev };
      next[nodeId] = {
        ...(next[nodeId] || { status: 'healthy', progress: 0 }),
        isIsolated: true
      };
      return next;
    });

    const edgesToRemove = originalEdges.filter(e => e.source === nodeId || e.target === nodeId);
    setIsolatedEdges(prev => ({
      ...prev,
      [nodeId]: edgesToRemove
    }));

    // Cancel active pulses targeting or originating from this node
    setActivePulses(prev => prev.filter(p => p.source !== nodeId && p.target !== nodeId));

    setTimeout(() => {
      logTimelineEvent(
        `USER ACTION: Isolated ${nodeId}`,
        `Device ${nodeId} was isolated. All active connections connected to this device have been detaching from active topology.`,
        nodeId,
        null
      );
    }, 0);
  };

  const handleNodeRecover = (nodeId) => {
    setNodeSimStates(prev => {
      const next = { ...prev };
      const current = next[nodeId] || { status: 'healthy', progress: 0 };
      const prevStatus = current.status;
      
      next[nodeId] = {
        ...current,
        status: 'recovering',
        progress: 0
      };

      if (prevStatus === 'compromising') {
        setTimeout(() => {
          logTimelineEvent(
            `Recovery Intercepted Attack at ${nodeId}`,
            `Attack propagation through ${nodeId} was prevented because recovery started before the device became fully compromised.`,
            nodeId,
            null
          );
        }, 0);
      } else {
        setTimeout(() => {
          logTimelineEvent(
            `Recovering ${nodeId}`,
            `Security cleanup patches dispatched to ${nodeId}. Removing infected payloads...`,
            nodeId,
            null
          );
        }, 0);
      }

      return next;
    });
  };

  const handleNodeRestore = (nodeId) => {
    setNodeSimStates(prev => {
      const next = { ...prev };
      if (next[nodeId]) {
        next[nodeId].isIsolated = false;
      }
      return next;
    });

    setIsolatedEdges(prev => {
      const next = { ...prev };
      delete next[nodeId];
      return next;
    });

    setTimeout(() => {
      logTimelineEvent(
        `USER ACTION: Restored links for ${nodeId}`,
        `Original network connections associated with ${nodeId} have been re-established on the active topology.`,
        nodeId,
        null
      );
    }, 0);
  };

  // Central simulation tick loop
  useEffect(() => {
    let intervalId = null;

    if (isPlaying && simulationStatus === 'running') {
      const tickDuration = 50; // ms
      intervalId = setInterval(() => {
        setNodeSimStates(prev => {
          let updated = {};
          Object.keys(prev).forEach(k => {
            updated[k] = { ...prev[k] };
          });

          let changed = false;
          const speedFactor = speed;

          // 1. Progress compromising states
          Object.keys(updated).forEach(id => {
            const node = updated[id];
            if (node.status === 'compromising') {
              const delta = (tickDuration * 100 * speedFactor) / compromiseTime;
              node.progress = Math.min(100, node.progress + delta);
              changed = true;

              if (node.progress >= 100) {
                node.status = 'infected';
                node.progress = 100;
                
                const curQueue = [...simQueueRef.current];
                const curStack = [...simStackRef.current];
                setTimeout(() => {
                  propagateFromNode(id, curQueue, curStack);
                }, 0);
              }
            } else if (node.status === 'recovering') {
              const delta = (tickDuration * 100 * speedFactor) / recoveryTime;
              node.progress = Math.min(100, node.progress + delta);
              changed = true;

              if (node.progress >= 100) {
                node.status = 'recovered';
                node.progress = 100;
                setSavedCount(c => c + 1);
                
                if (mode === 'recovery') {
                  setTimeout(() => {
                    propagateRecovery(id);
                  }, 0);
                }
              }
            }
          });

          // 2. Progress active pulses
          setActivePulses(prevPulses => {
            let nextPulses = [];
            let pulsesChanged = false;

            prevPulses.forEach(p => {
              const delta = (tickDuration * 100 * speedFactor) / propagationDelay;
              const nextProgress = p.progress + delta;

              if (nextProgress >= 100) {
                pulsesChanged = true;
                const targetState = updated[p.target] || { status: 'healthy', progress: 0, isIsolated: false };

                // Mark this wire as permanently traversed (virus trail)
                if (p.type === 'attack') {
                  setTraversedEdges(prev => {
                    const next = new Set(prev);
                    next.add(`${p.source}->${p.target}`);
                    next.add(`${p.target}->${p.source}`);
                    return next;
                  });
                }

                if (targetState.isIsolated) {
                  setBlockedCount(c => c + 1);
                  setTimeout(() => {
                    logTimelineEvent(
                      `Attack Blocked at ${p.target}`,
                      `The attack from ${p.source} reached ${p.target}, but was blocked because ${p.target} is isolated.`,
                      p.source,
                      [p.source, p.target]
                    );
                  }, 0);
                } else if (p.type === 'attack') {
                  if (targetState.status === 'recovering' || targetState.status === 'recovered') {
                    setBlockedCount(c => c + 1);
                    setTimeout(() => {
                      logTimelineEvent(
                        `Attack Blocked at ${p.target}`,
                        `The attack pulse from ${p.source} reached ${p.target}, but was blocked because ${p.target} is secured.`,
                        p.source,
                        [p.source, p.target]
                      );
                    }, 0);
                  } else {
                    updated[p.target] = {
                      ...targetState,
                      status: 'compromising',
                      progress: 0
                    };
                    changed = true;
                    setTimeout(() => {
                      logTimelineEvent(
                        `Attack reached ${p.target}`,
                        `The threat pulse from ${p.source} arrived at ${p.target}. Compromise progress started.`,
                        p.target,
                        [p.source, p.target]
                      );
                    }, 0);
                  }
                } else if (p.type === 'recovery') {
                  if (targetState.status === 'compromising') {
                    updated[p.target] = {
                      ...targetState,
                      status: 'recovering',
                      progress: 0
                    };
                    changed = true;
                    setTimeout(() => {
                      logTimelineEvent(
                        `Recovery Intercepted Attack at ${p.target}`,
                        `Recovery completed before compromise completed. Attack propagation through ${p.target} was cancelled.`,
                        p.target,
                        [p.source, p.target]
                      );
                    }, 0);
                  } else if (targetState.status === 'infected' || targetState.status === 'healthy') {
                    updated[p.target] = {
                      ...targetState,
                      status: 'recovering',
                      progress: 0
                    };
                    changed = true;
                    setTimeout(() => {
                      logTimelineEvent(
                        `Recovery Started at ${p.target}`,
                        `Recovery pulse reached ${p.target}. Initiating security patch install...`,
                        p.target,
                        [p.source, p.target]
                      );
                    }, 0);
                  }
                }
              } else {
                nextPulses.push({
                  ...p,
                  progress: nextProgress
                });
              }
            });

            if (pulsesChanged) {
              return nextPulses;
            }
            if (prevPulses.some(p => p.progress !== nextPulses.find(np => np.id === p.id)?.progress)) {
              return nextPulses;
            }
            return prevPulses;
          });

          if (changed) {
            return updated;
          }
          return prev;
        });
      }, tickDuration);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, simulationStatus, speed, compromiseTime, recoveryTime, propagationDelay, mode]);

  // Telemetry elapsed timer
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

  // Compute live visual nodes & edges mapping for React Flow view layers
  useEffect(() => {
    if (originalNodes.length === 0) return;

    if (mode === 'idle') {
      setNodes(originalNodes.map(n => ({
        ...n,
        data: {
          ...n.data,
          status: startNodes.includes(n.id) ? 'protected' : 'healthy',
          isIsolated: false,
          progress: 0,
          mode: 'idle',
          simActive: false,
          isRecoverySource: n.id === recoverySource
        }
      })));
      setEdges(originalEdges.map(e => ({
        ...e,
        data: {
          ...e.data,
          isSimulation: false,
          isRecovery: false,
          isTraversed: false,
          speed
        }
      })));
      return;
    }

    // Scrubbing snapshot mode
    if (timeline.length > 0 && currentFrame < timeline.length && simulationStatus !== 'running') {
      const frame = timeline[currentFrame];
      const snapshot = frame.nodeStatesSnapshot || {};

      // Build set of traversed edges from all frames up to currentFrame
      const scrubTraversed = new Set();
      if (mode === 'simulation') {
        for (let fi = 0; fi <= currentFrame; fi++) {
          const f = timeline[fi];
          if (f.currentEdge && Array.isArray(f.currentEdge) && f.currentEdge.length === 2) {
            scrubTraversed.add(`${f.currentEdge[0]}->${f.currentEdge[1]}`);
            scrubTraversed.add(`${f.currentEdge[1]}->${f.currentEdge[0]}`);
          }
        }
      }
      
      setNodes(originalNodes.map(n => {
        const snapState = snapshot[n.id] || { status: 'healthy', progress: 0, isIsolated: false };
        return {
          ...n,
          data: {
            ...n.data,
            status: snapState.status,
            isIsolated: snapState.isIsolated,
            progress: snapState.progress,
            mode,
            simActive: true,
            onIsolate: handleNodeIsolate,
            onRecover: handleNodeRecover,
            onRestore: handleNodeRestore
          }
        };
      }));

      const activeNodeIds = originalNodes
        .filter(n => !(snapshot[n.id]?.isIsolated))
        .map(n => n.id);
      const activeNodeSet = new Set(activeNodeIds);

      setEdges(originalEdges
        .filter(e => activeNodeSet.has(e.source) && activeNodeSet.has(e.target))
        .map(e => {
          const activeEdge = frame.currentEdge;
          const isActive = activeEdge && (
            (e.source === activeEdge[0] && e.target === activeEdge[1]) ||
            (e.source === activeEdge[1] && e.target === activeEdge[0])
          );
          const isTraversed = mode === 'simulation' && (
            scrubTraversed.has(`${e.source}->${e.target}`) ||
            scrubTraversed.has(`${e.target}->${e.source}`)
          );
          return {
            ...e,
            data: {
              ...e.data,
              isSimulation: mode === 'simulation' && !!isActive,
              isRecovery: mode === 'recovery' && !!isActive,
              isTraversed,
              speed
            }
          };
        })
      );
      return;
    }

    // Live execution rendering
    setNodes(originalNodes.map(n => {
      const state = nodeSimStates[n.id] || { status: 'healthy', progress: 0, isIsolated: false };
      return {
        ...n,
        data: {
          ...n.data,
          status: state.status,
          isIsolated: state.isIsolated,
          progress: state.progress,
          mode,
          simActive: true,
          isRecoverySource: n.id === recoverySource,
          onIsolate: handleNodeIsolate,
          onRecover: handleNodeRecover,
          onRestore: handleNodeRestore
        }
      };
    }));

    setEdges(currentEdges => {
      const activeNodeIds = originalNodes
        .filter(n => !(nodeSimStates[n.id]?.isIsolated))
        .map(n => n.id);
        
      const activeNodeSet = new Set(activeNodeIds);
      
      return originalEdges
        .filter(e => activeNodeSet.has(e.source) && activeNodeSet.has(e.target))
        .map(e => {
          const pulse = activePulses.find(p => 
            (p.source === e.source && p.target === e.target) ||
            (p.source === e.target && p.target === e.source)
          );
          // Wire was already traversed by the virus (persistent trail)
          const isTraversed = mode === 'simulation' && (
            traversedEdges.has(`${e.source}->${e.target}`) ||
            traversedEdges.has(`${e.target}->${e.source}`)
          );
          return {
            ...e,
            data: {
              ...e.data,
              isSimulation: pulse?.type === 'attack',
              isRecovery: pulse?.type === 'recovery',
              isTraversed,
              pulseProgress: pulse?.progress ?? 0,
              pulseSource: pulse?.source ?? '',
              pulseTarget: pulse?.target ?? '',
              speed
            }
          };
        });
    });
  }, [nodeSimStates, activePulses, originalNodes, originalEdges, mode, startNodes, speed, currentFrame, timeline, simulationStatus]);

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

      if (!nodesToSave || nodesToSave.length === 0) {
        setSaveStatus('');
        return;
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
    setSimulationStatus('running');
    setIsPlaying(true);
    setCurrentFrame(0);
    setElapsedSeconds(0);
    setBlockedCount(0);
    setSavedCount(0);
    setTimeline([]);

    // Initialize states
    const initialStates = {};
    originalNodes.forEach(n => {
      initialStates[n.id] = { status: 'healthy', progress: 0, isIsolated: false };
    });

    simQueueRef.current = [];
    simStackRef.current = [];
    dfsVisitedRef.current = new Set(); // reset DFS visited tracker
    setTraversedEdges(new Set()); // clear old trail on new attack

    if (virusType === 'bfs' || virusType === 'multi_bfs') {
      initNodes.forEach(id => {
        initialStates[id] = { status: 'compromising', progress: 0, isIsolated: false };
        simQueueRef.current.push(id);
      });
    } else if (virusType === 'dfs') {
      const first = initNodes[0];
      if (first) {
        initialStates[first] = { status: 'compromising', progress: 0, isIsolated: false };
        simStackRef.current.push(first);
        dfsVisitedRef.current.add(first); // mark start node as visited immediately
      }
    }

    setNodeSimStates(initialStates);
    setActivePulses([]);

    // Create a mock trigger on backend to populate details metadata (complexities, guides, etc.)
    try {
      const response = await algorithmService.simulateAttack(virusType, originalNodes, originalEdges, initNodes);
      if (response.success) {
        setStatistics(response.statistics || {});
        setLearning(response.learning || {});
      }
    } catch (e) {
      console.warn('Metadata fetch warnings', e);
    }

    setTimeout(() => {
      logTimelineEvent(
        `Attack Injected`,
        `Threat infection inject point set at ${initNodes.join(', ')}. Initial compromise sequence started.`,
        initNodes[0] || null,
        null
      );
    }, 0);
  };

  // API Trigger: Start Recovery planner
  const triggerRecovery = async (recoveryAlgo, options = {}) => {
    let currentInfected = [];
    if (timeline.length > 0 && mode === 'simulation') {
      currentInfected = originalNodes
        .filter(n => nodeSimStates[n.id]?.status === 'infected' || nodeSimStates[n.id]?.status === 'compromising')
        .map(n => n.id);
    }

    if (currentInfected.length === 0) {
      originalNodes.forEach(n => {
        if (['PC', 'Laptop', 'Application Server', 'Database Server', 'Backup Server'].includes(n.type)) {
          currentInfected.push(n.id);
        }
      });
    }

    setInfectedNodes(currentInfected);

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
      const response = await algorithmService.recoverNetwork(recoveryAlgo, originalNodes, originalEdges, {
        source: src,
        destination: dest,
        budget
      });

      if (response.success) {
        setTimeline([]);
        setStatistics(response.statistics || {});
        setLearning(response.learning || {});
        setFinalResult(response.result || {});
        setCurrentFrame(0);
        setElapsedSeconds(0);
        setSavedCount(0);
        
        // Retain infected statuses but spawn recovery center
        setNodeSimStates(prev => {
          let next = { ...prev };
          originalNodes.forEach(n => {
            const currentState = next[n.id] || { status: 'healthy', progress: 0, isIsolated: false };
            if (currentInfected.includes(n.id) && currentState.status !== 'isolated') {
              next[n.id] = { ...currentState, status: 'infected', progress: 100 };
            }
          });
          next[src] = { status: 'recovering', progress: 0, isIsolated: false };
          return next;
        });

        setActivePulses([]);
        setSimulationStatus('running');
        setIsPlaying(true);

        setTimeout(() => {
          logTimelineEvent(
            `Recovery Action Initiated`,
            `Autonomic healing recovery launched at center node ${src} using ${recoveryAlgo.toUpperCase()}.`,
            src,
            null
          );
        }, 0);
      } else {
        setErrorMsg('Recovery planning computation failed.');
        setSimulationStatus('idle');
      }
    } catch (err) {
      setErrorMsg('Recovery API request failed.');
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
    setBlockedCount(0);
    setSavedCount(0);
    setNodeSimStates({});
    setActivePulses([]);
    setIsolatedEdges({});
    setTraversedEdges(new Set()); // clear virus wire trail
    dfsVisitedRef.current = new Set(); // reset DFS visited tracker
    nodeSimStatesRef.current = {}; // reset ref
    
    // reset canvas colors
    setNodes(originalNodes.map(n => ({
      ...n,
      data: {
        ...n.data,
        status: 'healthy',
        isIsolated: false,
        progress: 0,
        mode: 'idle'
      }
    })));
    setEdges(originalEdges.map(e => ({
      ...e,
      data: {
        ...e.data,
        isSimulation: false,
        isRecovery: false,
        speed
      }
    })));
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

  const getStats = () => {
    let healthy = 0;
    let compromising = 0;
    let infected = 0;
    let recovering = 0;
    let recovered = 0;
    let isolated = 0;

    originalNodes.forEach(n => {
      const state = nodeSimStates[n.id] || { status: 'healthy', isIsolated: false };
      if (state.isIsolated) {
        isolated++;
      }
      switch (state.status) {
        case 'compromising':
        case 'reached':
          compromising++;
          break;
        case 'infected':
          infected++;
          break;
        case 'recovering':
          recovering++;
          break;
        case 'recovered':
          recovered++;
          break;
        case 'healthy':
        default:
          if (!state.isIsolated) healthy++;
          break;
      }
    });

    const activeInfected = originalNodes
      .filter(n => nodeSimStates[n.id]?.status === 'infected')
      .map(n => n.id);

    return {
      healthy,
      compromising,
      infected: activeInfected.length,
      recovering,
      recovered,
      isolated,
      blocked: blockedCount,
      saved: savedCount
    };
  };

  const stats = getStats();

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
    syncGraph: loadGraph,
    // Restored/Added States & Functions
    nodeSimStates,
    activePulses,
    stats,
    compromiseTime,
    setCompromiseTime,
    recoveryTime,
    setRecoveryTime,
    propagationDelay,
    setPropagationDelay,
    handleNodeIsolate,
    handleNodeRecover,
    handleNodeRestore,
    notification,
    triggerNotification
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
