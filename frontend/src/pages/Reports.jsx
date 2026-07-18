import React, { useState, useEffect } from 'react';
import { FileText, Printer, FileDown, Layers, Calendar, User, Settings } from 'lucide-react';
import { projectService, reportService } from '../services/api';

/**
 * File: Reports.jsx
 * Author: Antigravity AI
 * Purpose: Print-ready Lab Report Generator compiling network metrics and DAA observations.
 */

export default function Reports() {
  const [metadata, setMetadata] = useState({
    projectName: 'NETSHIELD Network Simulation',
    author: 'KTU Computer Science Student',
    date: new Date().toISOString().split('T')[0],
    version: '1.0'
  });
  
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [observations, setObservations] = useState(
    '1. Successfully modeled worm propagation using BFS traversal.\n' +
    '2. Depth-first scanner traced port indices and backtracked correctly.\n' +
    '3. Computed optimal cable layouts using Prim and Kruskal MST algorithms.\n' +
    '4. Telemetry verified Dijkstra path execution runtime under 1 millisecond.'
  );

  // Load active graph
  const loadGraph = async () => {
    try {
      let loadedNodes = [];
      let loadedEdges = [];
      
      const draftStr = localStorage.getItem('netshield_autosave');
      if (draftStr) {
        const draft = JSON.parse(draftStr);
        loadedNodes = draft.nodes || [];
        loadedEdges = draft.edges || [];
        if (draft.metadata) {
          setMetadata(prev => ({
            ...prev,
            projectName: draft.metadata.projectName || prev.projectName,
            author: draft.metadata.author || prev.author
          }));
        }
      } else {
        const response = await projectService.loadProject();
        if (response.success && response.project && response.project.network) {
          loadedNodes = response.project.network.nodes || [];
          loadedEdges = response.project.network.edges || [];
          if (response.project.metadata) {
            setMetadata(prev => ({
              ...prev,
              projectName: response.project.metadata.projectName || prev.projectName,
              author: response.project.metadata.author || prev.author
            }));
          }
        }
      }
      setNodes(loadedNodes);
      setEdges(loadedEdges);
    } catch (err) {
      console.error('Failed to load report graph', err);
    }
  };

  useEffect(() => {
    loadGraph();
  }, []);

  // Request report compilation
  const generateReport = async () => {
    setLoading(true);
    try {
      const parsedObservations = observations.split('\n').filter(line => line.trim().length > 0);
      const response = await reportService.exportReport(
        { nodes, edges },
        { projectName: metadata.projectName, author: metadata.author, lastModified: metadata.date },
        parsedObservations
      );

      if (response.success) {
        setReport(response.report);
      }
    } catch (err) {
      console.error('Failed to compile report', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0F1720] select-none text-sans text-xs print:bg-white print:text-black print:p-0">
      
      {/* Configuration Header Card - Hidden on print */}
      <div className="flex justify-between items-center pb-2 border-b border-[#4B5563]/25 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-[#F8FAFC]">PROJECT REPORT GENERATOR</h2>
          <p className="text-[#94A3B8] text-[11px] mt-0.5">Export structured lab submission reports of active network topologies.</p>
        </div>
      </div>

      {/* Editor Panels Grid - Hidden on print */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        
        {/* Metadata Editor */}
        <div className="md:col-span-1 bg-[#233D4C] border border-[#4B5563]/25 rounded-xl p-5 space-y-4 shadow-xl">
          <h3 className="text-xs uppercase font-bold text-[#F8FAFC] tracking-wider border-b border-[#4B5563]/10 pb-2">
            Report Parameters
          </h3>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] text-[#94A3B8] font-bold uppercase">Project Name:</label>
              <input
                type="text"
                value={metadata.projectName}
                onChange={(e) => setMetadata({ ...metadata, projectName: e.target.value })}
                className="w-full bg-[#0F1720] border border-[#4B5563]/30 text-[#F8FAFC] px-2.5 py-1.5 rounded outline-none"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] text-[#94A3B8] font-bold uppercase">Author (Student):</label>
              <input
                type="text"
                value={metadata.author}
                onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                className="w-full bg-[#0F1720] border border-[#4B5563]/30 text-[#F8FAFC] px-2.5 py-1.5 rounded outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-[#94A3B8] font-bold uppercase">Lab Date:</label>
              <input
                type="date"
                value={metadata.date}
                onChange={(e) => setMetadata({ ...metadata, date: e.target.value })}
                className="w-full bg-[#0F1720] border border-[#4B5563]/30 text-[#F8FAFC] px-2.5 py-1.5 rounded outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Observations Logger */}
        <div className="md:col-span-2 bg-[#233D4C] border border-[#4B5563]/25 rounded-xl p-5 flex flex-col justify-between shadow-xl">
          <div className="space-y-2">
            <h3 className="text-xs uppercase font-bold text-[#F8FAFC] tracking-wider border-b border-[#4B5563]/10 pb-2">
              DAA Observations Log
            </h3>
            <p className="text-[#94A3B8] text-[10px] mt-1">Observations to append to the print-ready sheet (one item per line).</p>
            
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full h-32 bg-[#0F1720] border border-[#4B5563]/30 text-[#F8FAFC] p-3 rounded-lg outline-none font-sans text-xs resize-none"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={generateReport}
              disabled={loading || nodes.length === 0}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#3B82F6] hover:bg-[#60A5FA] text-[#F8FAFC] font-bold rounded-lg uppercase transition-all shadow-md"
            >
              <FileDown className="h-4 w-4" />
              Compile Report Sheet
            </button>
          </div>
        </div>

      </div>

      {/* Compiled Report Print View Card */}
      {report && (
        <div className="max-w-4xl mx-auto bg-[#1B2838] border border-[#4B5563]/25 rounded-xl p-8 space-y-6 shadow-2xl relative print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
          
          {/* Action floating header bar - Hidden on print */}
          <div className="flex justify-between items-center bg-[#233D4C]/30 p-2.5 rounded-lg border border-[#4B5563]/15 print:hidden">
            <span className="text-[#94A3B8] font-mono text-[10px]">Report compilation: SUCCESS. Ready for submission.</span>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#22C55E] hover:bg-[#4ADE80] text-[#F8FAFC] font-bold rounded-lg uppercase transition-all shadow-md"
            >
              <Printer className="h-3.5 w-3.5" />
              Print / Save PDF
            </button>
          </div>

          {/* Print Sheet body starts */}
          <div className="space-y-6 font-serif leading-relaxed print:text-black">
            
            {/* Institution Header */}
            <div className="text-center pb-4 border-b-2 border-black/80 space-y-1">
              <h1 className="text-2xl font-black tracking-wide text-white print:text-black uppercase">DESIGN AND ANALYSIS OF ALGORITHMS LABORATORY</h1>
              <p className="text-xs text-[#94A3B8] print:text-black font-sans font-bold uppercase">KTU B.TECH COMPUTER SCIENCE & ENGINEERING</p>
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-2 gap-4 text-xs font-sans border-b border-black/30 pb-4">
              <div className="space-y-1.5">
                <div><span className="font-bold uppercase text-[#94A3B8] print:text-black text-[9px] block">Experiment title:</span> <span className="text-white print:text-black font-semibold text-sm">{report.projectName}</span></div>
                <div><span className="font-bold uppercase text-[#94A3B8] print:text-black text-[9px] block">Submitted By:</span> <span className="text-white print:text-black font-semibold text-sm">{report.author}</span></div>
              </div>
              <div className="space-y-1.5 text-right">
                <div><span className="font-bold uppercase text-[#94A3B8] print:text-black text-[9px] block">Submission Date:</span> <span className="text-white print:text-black font-semibold font-mono text-sm">{report.date}</span></div>
                <div><span className="font-bold uppercase text-[#94A3B8] print:text-black text-[9px] block">Format Status:</span> <span className="text-[#22C55E] print:text-black font-semibold uppercase text-xs">Evaluated Draft</span></div>
              </div>
            </div>

            {/* Topology stats */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase text-white print:text-black tracking-wider font-sans border-b border-black/10 pb-1">I. Graph Topology Metrics</h3>
              <div className="grid grid-cols-3 gap-4 font-sans text-center text-xs">
                <div className="p-3 bg-[#233D4C]/30 border border-[#4B5563]/15 rounded-lg print:border-black/35 print:bg-transparent">
                  <span className="text-[#94A3B8] print:text-black uppercase text-[9px] block mb-0.5">Total Vertices (V)</span>
                  <strong className="text-lg text-white print:text-black">{report.nodesCount}</strong>
                </div>
                <div className="p-3 bg-[#233D4C]/30 border border-[#4B5563]/15 rounded-lg print:border-black/35 print:bg-transparent">
                  <span className="text-[#94A3B8] print:text-black uppercase text-[9px] block mb-0.5">Total Edges (E)</span>
                  <strong className="text-lg text-white print:text-black">{report.edgesCount}</strong>
                </div>
                <div className="p-3 bg-[#233D4C]/30 border border-[#4B5563]/15 rounded-lg print:border-black/35 print:bg-transparent">
                  <span className="text-[#94A3B8] print:text-black uppercase text-[9px] block mb-0.5">Network Density</span>
                  <strong className="text-lg text-white print:text-black">
                    {report.nodesCount > 1 
                      ? `${Math.round((report.edgesCount / (report.nodesCount * (report.nodesCount - 1) / 2)) * 100)}%`
                      : '0%'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Observations */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black uppercase text-white print:text-black tracking-wider font-sans border-b border-black/10 pb-1">II. Algorithm Observations & Tracing Logs</h3>
              <ul className="list-decimal list-inside space-y-2.5 text-xs text-[#CBD5E1] print:text-black pl-1">
                {report.runsSummary.map((obs, idx) => (
                  <li key={idx} className="pl-1 leading-relaxed">{obs}</li>
                ))}
              </ul>
            </div>

            {/* Signature Block */}
            <div className="pt-16 grid grid-cols-2 gap-4 text-xs font-sans border-t border-black/20 mt-16 print:mt-24">
              <div>
                <div className="border-b border-black/50 w-48 h-8"></div>
                <span className="text-[#94A3B8] print:text-black uppercase text-[9px] mt-1 block">Student Signature</span>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="border-b border-black/50 w-48 h-8"></div>
                <span className="text-[#94A3B8] print:text-black uppercase text-[9px] mt-1 block">Laboratory Instructor Approval</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
