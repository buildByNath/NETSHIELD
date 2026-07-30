import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Network, Flame, ShieldAlert, BookOpen, BarChart3, Activity, FileText, Settings, ChevronLeft, ChevronRight
} from 'lucide-react';

/**
 * File: Sidebar.jsx
 * Author: Antigravity AI
 * Purpose: NOC collapsible vertical navigation sidebar using Framer Motion animations.
 */

export default function Sidebar({ activePage, setActivePage, collapsed, setCollapsed }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'builder', label: 'Network Builder', icon: <Network className="h-5 w-5" /> },
    { id: 'attack', label: 'Attack Simulation', icon: <Flame className="h-5 w-5" /> },
    { id: 'recovery', label: 'Recovery Planner', icon: <ShieldAlert className="h-5 w-5" /> },
    { id: 'learning', label: 'Learning Mode', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'comparison', label: 'Comparison', icon: <BarChart3 className="h-5 w-5" /> },
    { id: 'performance', label: 'Performance', icon: <Activity className="h-5 w-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> }
  ];

  return (
    <motion.div
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="bg-[#233D4C] border-r border-[#4B5563]/30 h-[calc(100vh-4rem)] flex flex-col relative select-none flex-shrink-0"
    >
      {/* Menu Navigation Items */}
      <div className="flex-1 py-4 overflow-y-auto overflow-x-hidden space-y-1 px-3">
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-semibold transition-colors duration-150 ${
                isActive
                  ? 'bg-[#FD802E] text-[#0F1720] font-bold shadow-[0_4px_10px_rgba(253,128,46,0.3)]'
                  : 'text-[#CBD5E1] hover:bg-[#1B2838] hover:text-[#F8FAFC]'
              }`}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse Sidebar Button Area */}
      <div className="p-3 border-t border-[#4B5563]/25 flex justify-end">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-[#0F1720] border border-[#4B5563]/30 text-[#94A3B8] hover:text-[#FD802E] hover:border-[#FD802E]/50 transition-colors"
          title={collapsed ? "Expand Menu" : "Collapse Menu"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </motion.div>
  );
}
