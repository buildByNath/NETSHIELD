import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';

import { 
  Undo2, Redo2, FileJson, Save, FolderOpen, AlertTriangle, ShieldCheck, 
  Trash2, Copy, RefreshCw, ZoomIn, ZoomOut, Maximize
} from 'lucide-react';

import CustomNode from '../components/network/CustomNode';
import CustomEdge from '../components/network/CustomEdge';
import DeviceLibrary from '../components/network/DeviceLibrary';
import ContextMenu from '../components/network/ContextMenu';
import PropertiesPanel from '../components/network/PropertiesPanel';
import useUndoRedo from '../hooks/useUndoRedo';
import { templateService, validationService, projectService } from '../services/api';

/**
 * File: NetworkBuilder.jsx
 * Author: Antigravity AI
 * Purpose: Interactive canvas containing React Flow and control systems for graph building.
 */

// Register custom node and edge models
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

function BuilderCanvas() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  
  // Selection & UI state
  const [selectedElement, setSelectedElement] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState('college');
  
  // Validation status
  const [validation, setValidation] = useState({ valid: true, errors: [], warnings: [] });
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // 'saving' | 'saved' | 'error'

  const { project } = useReactFlow();
  const { takeSnapshot, undo, redo, canUndo, canRedo, clearHistory } = useUndoRedo();

  // Load template list on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await templateService.getTemplates();
        setTemplates(data);
      } catch (err) {
        console.error('Failed to load templates list', err);
      }
    };
    fetchTemplates();
    
    // Auto-load project state from backend
    loadProjectState();
  }, []);

  // Validation function running on graph changes
  const validateGraph = useCallback(async (currentNodes, currentEdges) => {
    if (currentNodes.length === 0) return;
    try {
      const result = await validationService.validateGraph(currentNodes, currentEdges);
      setValidation(result);
    } catch (err) {
      console.error('Validation API error', err);
    }
  }, []);

  // Trigger validation on node/edge updates and sync with local storage autosave
  useEffect(() => {
    const timer = setTimeout(() => {
      validateGraph(nodes, edges);
      // Autosave draft to local storage
      const draft = { nodes, edges, activeTemplate };
      localStorage.setItem('netshield_autosave', JSON.stringify(draft));
    }, 1000); // Debounce by 1s

    return () => clearTimeout(timer);
  }, [nodes, edges, validateGraph]);

  // Load project state from backend
  const loadProjectState = async () => {
    setLoading(true);
    try {
      const response = await projectService.loadProject();
      if (response.success && response.project) {
        const net = response.project.network;
        
        // Re-inject customEdge and node types
        const loadedNodes = (net.nodes || []).map(n => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: { label: n.label, status: n.status || 'healthy' }
        }));
        
        const loadedEdges = (net.edges || []).map(e => ({
          id: `e-${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          type: 'customEdge',
          data: { weight: e.weight, latency: e.latency, bandwidth: e.bandwidth }
        }));
        
        setNodes(loadedNodes);
        setEdges(loadedEdges);
        clearHistory();
      }
    } catch (err) {
      console.error('Failed to load project state from backend', err);
    } finally {
      setLoading(false);
    }
  };

  // Save current project state to backend
  const saveProjectState = async () => {
    setSaveStatus('saving');
    try {
      const formattedNodes = nodes.map(node => ({
        id: node.id,
        label: node.data?.label || node.id,
        type: node.type || 'PC',
        status: node.data?.status || 'healthy',
        position: node.position
      }));

      const formattedEdges = edges.map(edge => ({
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
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (err) {
      setSaveStatus('error');
      console.error('Failed to save project', err);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Template loader handler
  const handleLoadTemplate = async (templateId) => {
    setLoading(true);
    try {
      const response = await templateService.loadTemplate(templateId);
      if (response.success && response.graph) {
        takeSnapshot(nodes, edges);
        
        const loadedNodes = (response.graph.nodes || []).map(n => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: { label: n.label, status: n.status || 'healthy' }
        }));
        
        const loadedEdges = (response.graph.edges || []).map(e => ({
          id: `e-${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          type: 'customEdge',
          data: { weight: e.weight, latency: e.latency, bandwidth: e.bandwidth }
        }));

        setNodes(loadedNodes);
        setEdges(loadedEdges);
        setActiveTemplate(templateId);
        setSelectedElement(null);
      }
    } catch (err) {
      console.error('Template loading failed', err);
    } finally {
      setLoading(false);
    }
  };

  // Canvas Drag & Drop Projection
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Create unique ID
      const count = nodes.filter(n => n.type === type).length + 1;
      const id = `${type.replace(/\s+/g, '')}-${Date.now().toString().slice(-4)}`;

      const newNode = {
        id,
        type,
        position,
        data: { label: `${type} ${count}`, status: 'healthy' }
      };

      takeSnapshot(nodes, edges);
      setNodes((nds) => nds.concat(newNode));
      setSelectedElement(newNode);
    },
    [reactFlowInstance, nodes, edges, takeSnapshot, setNodes]
  );

  // Connection Handler
  const onConnect = useCallback(
    (params) => {
      takeSnapshot(nodes, edges);
      setEdges((eds) => addEdge(
        {
          ...params,
          id: `e-${params.source}-${params.target}`,
          type: 'customEdge',
          data: { weight: 1.0, latency: 10.0, bandwidth: 100.0 }
        },
        eds
      ));
    },
    [nodes, edges, takeSnapshot, setEdges]
  );

  // Undo/Redo trigger
  const handleUndo = () => {
    const prevState = undo({ nodes, edges });
    if (prevState) {
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setSelectedElement(null);
    }
  };

  const handleRedo = () => {
    const nextState = redo({ nodes, edges });
    if (nextState) {
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setSelectedElement(null);
    }
  };

  // Context Menu callbacks
  const onNodeContextMenu = useCallback(
    (event, node) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        targetType: 'node',
        targetId: node.id
      });
      setSelectedElement(node);
    },
    []
  );

  const onEdgeContextMenu = useCallback(
    (event, edge) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        targetType: 'edge',
        targetId: edge.id
      });
      setSelectedElement(edge);
    },
    []
  );

  const onPaneContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        targetType: 'canvas',
        targetId: null
      });
    },
    []
  );

  const handleContextAction = useCallback((action, payload) => {
    takeSnapshot(nodes, edges);
    
    if (action === 'rename') {
      const newName = prompt('Enter new name for device:');
      if (newName) {
        setNodes(nds => nds.map(n => n.id === payload ? { ...n, data: { ...n.data, label: newName } } : n));
        setSelectedElement(prev => prev && prev.id === payload ? { ...prev, data: { ...prev.data, label: newName } } : prev);
      }
    } else if (action === 'duplicate') {
      const nodeToCopy = nodes.find(n => n.id === payload);
      if (nodeToCopy) {
        const id = `${nodeToCopy.type.replace(/\s+/g, '')}-${Date.now().toString().slice(-4)}`;
        const newNode = {
          ...nodeToCopy,
          id,
          position: { x: nodeToCopy.position.x + 40, y: nodeToCopy.position.y + 40 },
          data: { ...nodeToCopy.data, label: `${nodeToCopy.data.label} (Copy)` }
        };
        setNodes(nds => nds.concat(newNode));
        setSelectedElement(newNode);
      }
    } else if (action === 'status') {
      const { id, status } = payload;
      setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, status } } : n));
      setSelectedElement(prev => prev && prev.id === id ? { ...prev, data: { ...prev.data, status } } : prev);
    } else if (action === 'delete') {
      setNodes(nds => nds.filter(n => n.id !== payload));
      setEdges(eds => eds.filter(e => e.source !== payload && e.target !== payload));
      setSelectedElement(null);
    } else if (action === 'delete-edge') {
      setEdges(eds => eds.filter(e => e.id !== payload));
      setSelectedElement(null);
    } else if (action === 'edit-edge') {
      const edge = edges.find(e => e.id === payload);
      if (edge) setSelectedElement(edge);
    } else if (action === 'center-view') {
      reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
    } else if (action === 'reset-zoom') {
      reactFlowInstance.setZoom(1);
    } else if (action === 'add-device-here') {
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      // project viewport coordinates to flow positions
      const position = reactFlowInstance.screenToFlowPosition({
        x: contextMenu.x,
        y: contextMenu.y
      });
      const count = nodes.filter(n => n.type === payload).length + 1;
      const id = `${payload.replace(/\s+/g, '')}-${Date.now().toString().slice(-4)}`;
      const newNode = {
        id,
        type: payload,
        position,
        data: { label: `${payload} ${count}`, status: 'healthy' }
      };
      setNodes(nds => nds.concat(newNode));
      setSelectedElement(newNode);
    }
  }, [nodes, edges, contextMenu, reactFlowInstance, takeSnapshot, setNodes, setEdges]);

  // Update attributes in Properties Panel
  const handleUpdateElement = (updatedElement) => {
    takeSnapshot(nodes, edges);
    if (updatedElement.source) {
      // It's an edge
      setEdges(eds => eds.map(e => e.id === updatedElement.id ? updatedElement : e));
    } else {
      // It's a node
      setNodes(nds => nds.map(n => n.id === updatedElement.id ? updatedElement : n));
    }
    setSelectedElement(updatedElement);
  };

  // Keyboard shortcut listener (Delete key to delete nodes, Ctrl+Z to undo, Ctrl+Y to redo)
  useEffect(() => {
    const handleKeyDown = (event) => {
      const isInput = event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA';
      if (isInput) return;

      if (event.key === 'Delete' && selectedElement) {
        takeSnapshot(nodes, edges);
        if (selectedElement.source) {
          setEdges(eds => eds.filter(e => e.id !== selectedElement.id));
        } else {
          setNodes(nds => nds.filter(n => n.id !== selectedElement.id));
          setEdges(eds => eds.filter(e => e.source !== selectedElement.id && e.target !== selectedElement.id));
        }
        setSelectedElement(null);
      }

      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        handleUndo();
      }
      if (event.ctrlKey && event.key === 'y') {
        event.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, nodes, edges, handleUndo, handleRedo]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0F1720]">
      {/* Topology Builder Sub-Header Toolbar */}
      <div className="h-12 border-b border-[#4B5563]/30 bg-[#233D4C]/40 flex items-center justify-between px-6 select-none z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-[#0F1720]/80 px-2.5 py-1 rounded-lg border border-[#4B5563]/25">
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase">Template:</span>
            <select
              value={activeTemplate}
              onChange={(e) => handleLoadTemplate(e.target.value)}
              disabled={loading}
              className="bg-transparent text-xs text-[#FD802E] font-bold outline-none cursor-pointer"
            >
              {templates.map(t => (
                <option key={t.id} value={t.id} className="bg-[#233D4C] text-[#F8FAFC]">
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-[1px] bg-[#4B5563]/30"></div>

          {/* Undo/Redo controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="p-1.5 rounded bg-[#1B2838] border border-[#4B5563]/20 hover:border-[#FD802E]/40 text-[#CBD5E1] hover:text-[#FD802E] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="p-1.5 rounded bg-[#1B2838] border border-[#4B5563]/20 hover:border-[#FD802E]/40 text-[#CBD5E1] hover:text-[#FD802E] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Action buttons (Save, Validation) */}
        <div className="flex items-center gap-2">
          {/* Validation Indicators */}
          <button
            onClick={() => setShowValidationPanel(!showValidationPanel)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition-colors ${
              !validation.valid
                ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/25'
                : validation.warnings.length > 0
                ? 'bg-[#FACC15]/15 border-[#FACC15]/40 text-[#FACC15] hover:bg-[#FACC15]/25'
                : 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#22C55E] hover:bg-[#22C55E]/25'
            }`}
          >
            {!validation.valid ? (
              <AlertTriangle className="h-3.5 w-3.5 animate-bounce" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5" />
            )}
            <span>Topology Status</span>
            <span className="bg-[#0F1720]/40 px-1 py-0.2 text-[9px] rounded font-mono">
              {!validation.valid ? validation.errors.length : validation.warnings.length}
            </span>
          </button>

          <button
            onClick={saveProjectState}
            disabled={loading || saveStatus === 'saving'}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#FD802E] hover:bg-[#FF9C4A] text-[#0F1720] font-bold text-xs rounded-lg shadow-md transition-colors disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Project'}</span>
          </button>
        </div>
      </div>

      {/* Main Builder layout with drag inputs and property drawers */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Dynamic Topology validation results overlay */}
        {showValidationPanel && (
          <div className="absolute top-4 left-4 z-20 max-w-sm w-full bg-[#1B2838]/95 backdrop-blur-md border border-[#4B5563]/40 rounded-xl shadow-2xl p-4 space-y-3 font-sans text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#4B5563]/25 pb-2">
              <span className="font-bold text-[#FD802E] uppercase tracking-wider">Topology Issues</span>
              <button 
                onClick={() => setShowValidationPanel(false)}
                className="text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {validation.errors.length === 0 && validation.warnings.length === 0 && (
                <div className="text-center py-4 text-[#22C55E] font-semibold flex flex-col items-center gap-1">
                  <ShieldCheck className="h-8 w-8" />
                  <span>Network Topology is Valid!</span>
                </div>
              )}
              
              {/* Render validation errors */}
              {validation.errors.map((err, i) => (
                <div key={`err-${i}`} className="flex items-start gap-2 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] p-2 rounded-lg font-mono text-[10px]">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{err}</span>
                </div>
              ))}

              {/* Render validation warnings */}
              {validation.warnings.map((warn, i) => (
                <div key={`warn-${i}`} className="flex items-start gap-2 bg-[#FACC15]/10 border border-[#FACC15]/20 text-[#FACC15] p-2 rounded-lg font-mono text-[10px]">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Draggable toolbox library on left */}
        <DeviceLibrary />

        {/* Center Builder Canvas wrapper */}
        <div 
          ref={reactFlowWrapper} 
          className="flex-1 h-full relative"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeContextMenu={onNodeContextMenu}
            onEdgeContextMenu={onEdgeContextMenu}
            onPaneContextMenu={onPaneContextMenu}
            // Close context menu and select nodes on canvas click
            onPaneClick={() => { setContextMenu(null); setSelectedElement(null); }}
            onNodeClick={(e, node) => { setContextMenu(null); setSelectedElement(node); }}
            onEdgeClick={(e, edge) => { setContextMenu(null); setSelectedElement(edge); }}
            fitView
            minZoom={0.1}
            maxZoom={4}
          >
            <Background color="#4B5563" gap={16} size={1} />
            <Controls className="react-flow__controls" />
            <MiniMap className="react-flow__minimap" nodeColor={() => '#233D4C'} />
          </ReactFlow>

          {/* Context menu trigger */}
          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              targetType={contextMenu.targetType}
              targetId={contextMenu.targetId}
              onClose={() => setContextMenu(null)}
              onAction={handleContextAction}
            />
          )}
        </div>

        {/* Properties editing drawer sheet on right */}
        {selectedElement && (
          <PropertiesPanel
            selectedElement={selectedElement}
            onUpdate={handleUpdateElement}
            onClose={() => setSelectedElement(null)}
          />
        )}
      </div>
    </div>
  );
}

export default function NetworkBuilder() {
  return (
    <ReactFlowProvider>
      <BuilderCanvas />
    </ReactFlowProvider>
  );
}
