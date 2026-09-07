import React from 'react';
import {
  LayoutDashboard, Network, Flame, ShieldAlert, BookOpen,
  BarChart3, Activity, Settings, ChevronLeft, ChevronRight
} from 'lucide-react';

/**
 * File: Sidebar.jsx
 * Purpose: Retro office-themed collapsible navigation sidebar.
 * Uses --cth-* CSS variables for cream/ink palette.
 */

export default function Sidebar({ activePage, setActivePage, collapsed, setCollapsed }) {
  const menuItems = [
    { id: 'dashboard',   label: 'Dashboard',         icon: <LayoutDashboard size={18} />, emoji: '📊' },
    { id: 'builder',     label: 'Network Builder',   icon: <Network size={18} />,         emoji: '🏢' },
    { id: 'attack',      label: 'Attack Simulation', icon: <Flame size={18} />,           emoji: '🔥' },
    { id: 'recovery',    label: 'Recovery Planner',  icon: <ShieldAlert size={18} />,     emoji: '🛡️' },
    { id: 'learning',    label: 'Learning Mode',     icon: <BookOpen size={18} />,        emoji: '📚' },
    { id: 'comparison',  label: 'Comparison',        icon: <BarChart3 size={18} />,       emoji: '📊' },
    { id: 'performance', label: 'Performance',       icon: <Activity size={18} />,        emoji: '📈' },
    { id: 'settings',    label: 'Settings',          icon: <Settings size={18} />,        emoji: '⚙️' },
  ];

  return (
    <div
      style={{
        width: collapsed ? '56px' : '220px',
        transition: 'width 0.2s ease',
        background: 'var(--cth-ink-900)',
        borderRight: '2px solid var(--cth-ink-700)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Section Label */}
      {!collapsed && (
        <div
          style={{
            fontFamily: 'var(--cth-font-display)',
            fontSize: '7px',
            color: 'var(--cth-ink-500)',
            padding: '12px 14px 6px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            borderBottom: '1px solid var(--cth-ink-700)',
            whiteSpace: 'nowrap',
          }}
        >
          Navigation
        </div>
      )}

      {/* Menu items */}
      <div style={{ flex: 1, padding: '8px 6px', overflowY: 'auto', overflowX: 'hidden' }}>
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: collapsed ? '10px 0' : '9px 10px',
                marginBottom: '2px',
                background: isActive ? 'var(--cth-lemon)' : 'transparent',
                color: isActive ? 'var(--cth-ink-900)' : 'var(--cth-ink-300)',
                border: isActive ? '2px solid var(--cth-ink-900)' : '2px solid transparent',
                boxShadow: isActive ? '2px 2px 0 var(--cth-ink-700)' : 'none',
                cursor: 'pointer',
                fontFamily: 'var(--cth-font-ui)',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                transition: 'all 0.1s ease',
                justifyContent: collapsed ? 'center' : 'flex-start',
                textAlign: 'left',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--cth-ink-700)';
                  e.currentTarget.style.color = 'var(--cth-cream-50)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--cth-ink-300)';
                }
              }}
            >
              <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </span>
              {!collapsed && (
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse Toggle */}
      <div
        style={{
          padding: '10px 6px',
          borderTop: '2px solid var(--cth-ink-700)',
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-end',
        }}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'var(--cth-ink-700)',
            color: 'var(--cth-ink-300)',
            border: '1px solid var(--cth-ink-500)',
            padding: '4px 6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.1s ease',
          }}
          title={collapsed ? 'Expand Menu' : 'Collapse Menu'}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--cth-lemon)';
            e.currentTarget.style.borderColor = 'var(--cth-lemon)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--cth-ink-300)';
            e.currentTarget.style.borderColor = 'var(--cth-ink-500)';
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </div>
  );
}
