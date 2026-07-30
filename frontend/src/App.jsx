import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import NetworkBuilder from './pages/NetworkBuilder';
import AttackSimulation from './pages/AttackSimulation';
import RecoveryPlanner from './pages/RecoveryPlanner';
import LearningMode from './pages/LearningMode';
import Comparison from './pages/Comparison';
import Performance from './pages/Performance';
import Settings from './pages/Settings';
import { useSimulation } from './context/SimulationContext';

/**
 * File: App.jsx
 * Author: Antigravity AI
 * Purpose: Main application framework managing page states and nesting Sidebar layouts.
 */

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { syncGraph, saveActiveProject, saveStatus } = useSimulation();

  // Sync and save active designed topology automatically on tab changes
  useEffect(() => {
    syncGraph();
    saveActiveProject();
  }, [activePage]);

  // Page selection router mapping
  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'builder':
        return <NetworkBuilder />;
      case 'attack':
        return <AttackSimulation />;
      case 'recovery':
        return <RecoveryPlanner />;
      case 'learning':
        return <LearningMode />;
      case 'comparison':
        return <Comparison />;
      case 'performance':
        return <Performance />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0F1720] text-[#F8FAFC] flex flex-col overflow-hidden font-sans select-none">
      {/* Central NOC System Header */}
      <header className="h-16 border-b border-[#4B5563]/30 bg-[#233D4C]/30 backdrop-blur-md px-6 flex items-center justify-between flex-shrink-0 z-25">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-[#FD802E] animate-pulse" />
          <div>
            <h1 className="text-xl font-black tracking-wider text-[#F8FAFC] flex items-center gap-2 leading-none">
              NETSHIELD
              <span className="text-[9px] uppercase font-mono tracking-widest bg-[#FD802E]/20 text-[#FD802E] px-2 py-0.5 rounded border border-[#FD802E]/30 font-bold">
                NOC Console
              </span>
            </h1>
            <p className="text-[10px] text-[#94A3B8] tracking-wide mt-0.5 leading-none">
              Network Attack Simulation & Response Planner
            </p>
          </div>
        </div>
        
        {/* Active view status & Global Save */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <button
            onClick={saveActiveProject}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FD802E] hover:bg-[#FF9C4A] text-[#0F1720] font-bold text-xs rounded border border-[#FD802E]/30 transition-colors font-sans shadow-md disabled:opacity-50"
            title="Save changes to backend database"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Error!' : 'Save Project'}</span>
          </button>
          
          <div className="h-4 w-[1px] bg-[#4B5563]/30"></div>

          <span className="text-[#94A3B8]">Active Module:</span>
          <span className="px-2 py-0.5 rounded bg-[#FD802E]/10 text-[#FD802E] border border-[#FD802E]/25 uppercase font-bold tracking-wider font-sans">
            {activePage === 'builder' ? 'Network Builder' : activePage}
          </span>
        </div>
      </header>

      {/* Main viewport area splitting sidebar and body panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar Panel */}
        <Sidebar 
          activePage={activePage} 
          setActivePage={setActivePage} 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
        />

        {/* Dynamic page content container */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {renderActivePage()}
        </div>
      </div>
    </div>
  );
}
