import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Sliders, Shield } from 'lucide-react';

/**
 * File: Settings.jsx
 * Author: Antigravity AI
 * Purpose: Baseline settings page placeholder for configuring Developer Mode and system limits.
 */

export default function Settings() {
  const [devMode, setDevMode] = useState(true);
  const [autosave, setAutosave] = useState(true);
  const [saveInterval, setSaveInterval] = useState(30);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0F1720] select-none text-sans text-xs">
      <div className="flex justify-between items-center pb-2 border-b border-[#4B5563]/25">
        <div>
          <h2 className="text-xl font-bold text-[#F8FAFC]">APPLICATION SETTINGS</h2>
          <p className="text-[#94A3B8] text-[11px] mt-0.5">Configure system parameters, autosave intervals, and Developer Mode options.</p>
        </div>
      </div>

      <div className="max-w-2xl bg-[#233D4C] border border-[#4B5563]/25 rounded-xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#FD802E]"></div>
        
        <div className="flex gap-4">
          <div className="p-3 bg-[#FD802E]/10 rounded-xl text-[#FD802E] border border-[#FD802E]/20 flex-shrink-0 h-12 w-12 flex items-center justify-center">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wide">Workspace Configuration</h3>
            <p className="text-[#CBD5E1] text-xs leading-relaxed">
              Adjust global settings of the local NETSHIELD simulator environment.
            </p>
          </div>
        </div>

        <div className="border-t border-[#4B5563]/15 pt-5 space-y-4">
          {/* Toggle Developer Mode */}
          <div className="flex items-center justify-between p-3 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15">
            <div className="space-y-0.5">
              <span className="text-[#F8FAFC] font-semibold block">Developer Mode Overlay</span>
              <p className="text-[#94A3B8] text-[10px]">Expose raw API requests and queues inside simulation sidebars.</p>
            </div>
            <button
              onClick={() => setDevMode(!devMode)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                devMode ? 'bg-[#FD802E]' : 'bg-[#1B2838] border border-[#4B5563]/30'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#F8FAFC] transform transition-transform duration-200 ${
                  devMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle Autosave */}
          <div className="flex items-center justify-between p-3 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15">
            <div className="space-y-0.5">
              <span className="text-[#F8FAFC] font-semibold block">Auto-save Graph State</span>
              <p className="text-[#94A3B8] text-[10px]">Autosave drafts to browser local storage and sync configuration files.</p>
            </div>
            <button
              onClick={() => setAutosave(!autosave)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                autosave ? 'bg-[#FD802E]' : 'bg-[#1B2838] border border-[#4B5563]/30'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#F8FAFC] transform transition-transform duration-200 ${
                  autosave ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Autosave Interval */}
          {autosave && (
            <div className="flex items-center justify-between p-3 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15 animate-in slide-in-from-top-2 duration-150">
              <div className="space-y-0.5">
                <span className="text-[#F8FAFC] font-semibold block">Autosave Sync Interval (seconds)</span>
                <p className="text-[#94A3B8] text-[10px]">Seconds between automatic backend state saving triggers.</p>
              </div>
              <input
                type="number"
                min="10"
                max="300"
                value={saveInterval}
                onChange={(e) => setSaveInterval(parseInt(e.target.value) || 10)}
                className="w-20 bg-[#0F1720] border border-[#4B5563]/30 text-[#F8FAFC] px-2 py-1 rounded outline-none text-right font-mono"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
