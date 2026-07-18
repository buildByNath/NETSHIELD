import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import NetworkBuilder from './pages/NetworkBuilder';
import AttackSimulation from './pages/AttackSimulation';
import RecoveryPlanner from './pages/RecoveryPlanner';
import LearningMode from './pages/LearningMode';
import Comparison from './pages/Comparison';
import Performance from './pages/Performance';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

/**
 * File: App.jsx
 * Author: Antigravity AI
 * Purpose: Main application framework managing page states and nesting Sidebar layouts.
 */

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      case 'reports':
        return <Reports />;
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
        
        {/* Active view status */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-[#94A3B8]">Active Module:</span>
          <span className="px-2 py-0.5 rounded bg-[#FD802E]/10 text-[#FD802E] border border-[#FD802E]/25 uppercase font-bold tracking-wider">
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

      {/* Bottom operations status bar */}
      <footer className="h-8 border-t border-[#4B5563]/30 bg-[#233D4C]/10 px-6 flex items-center justify-between text-xs text-[#94A3B8] font-mono flex-shrink-0 z-20">
        <div>KTU B.Tech DAA Viva Lab Project</div>
        <div>NOC Status: Nominal</div>
      </footer>
    </div>
  );
}
