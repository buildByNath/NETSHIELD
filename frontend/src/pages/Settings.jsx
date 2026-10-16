import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Sliders, Shield, Globe, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import client, { getApiBaseUrl } from '../services/api';

/**
 * File: Settings.jsx
 * Author: Antigravity AI
 * Purpose: Application settings page for configuring system limits, backend API endpoints, and interactive simulation timing delays.
 */

export default function Settings() {
  const [devMode, setDevMode] = useState(true);
  const [autosave, setAutosave] = useState(true);
  const [saveInterval, setSaveInterval] = useState(30);

  // Backend API URL management
  const [backendUrlInput, setBackendUrlInput] = useState(() => getApiBaseUrl());
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [backendError, setBackendError] = useState('');
  const [isSavingUrl, setIsSavingUrl] = useState(false);

  const testBackendConnection = async (urlToTest) => {
    setBackendStatus('checking');
    setBackendError('');
    try {
      const target = (urlToTest || getApiBaseUrl() || '').replace(/\/+$/, '');
      if (!target) {
        setBackendStatus('offline');
        setBackendError('No backend URL provided');
        return;
      }
      const res = await client.get(`${target}/health`, { timeout: 7000 });
      if (res.data && res.data.status === 'online') {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
        setBackendError('Invalid response from server');
      }
    } catch (err) {
      setBackendStatus('offline');
      setBackendError(err.message || 'Connection failed');
    }
  };

  useEffect(() => {
    testBackendConnection(backendUrlInput);
  }, []);

  const handleSaveBackendUrl = () => {
    setIsSavingUrl(true);
    let trimmed = (backendUrlInput || '').trim().replace(/\/+$/, '');
    if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      trimmed = `https://${trimmed}`;
    }
    setBackendUrlInput(trimmed);
    localStorage.setItem('netshield_backend_url', trimmed);
    testBackendConnection(trimmed);
    setTimeout(() => {
      setIsSavingUrl(false);
    }, 600);
  };

  const {
    compromiseTime,
    setCompromiseTime,
    recoveryTime,
    setRecoveryTime,
    propagationDelay,
    setPropagationDelay
  } = useSimulation();

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

        {/* Cyber Attack and Mitigation delay configuration section */}
        <div className="border-t border-[#4B5563]/15 pt-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[#FD802E]" />
            <h3 className="text-xs font-bold text-[#FD802E] uppercase tracking-wide">Attack & Recovery Delays (ms)</h3>
          </div>
          
          {/* Link propagation delay */}
          <div className="p-3 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[#F8FAFC] font-semibold block text-[11px]">Link Propagation Delay (Attack Pulse)</span>
                <p className="text-[#94A3B8] text-[9.5px] leading-tight">Duration for attack pulse signals to move along connection wires.</p>
              </div>
              <span className="text-[#FD802E] font-mono font-bold text-xs">{propagationDelay}ms</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={propagationDelay}
              onChange={(e) => setPropagationDelay(parseInt(e.target.value))}
              className="w-full accent-[#FD802E] h-1 bg-[#0F1720] rounded-lg cursor-pointer"
            />
          </div>

          {/* Node compromise time */}
          <div className="p-3 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[#F8FAFC] font-semibold block text-[11px]">Device Compromise Duration</span>
                <p className="text-[#94A3B8] text-[9.5px] leading-tight">Time for an infected packet to compromise a device from reached to infected.</p>
              </div>
              <span className="text-[#FD802E] font-mono font-bold text-xs">{compromiseTime}ms</span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={compromiseTime}
              onChange={(e) => setCompromiseTime(parseInt(e.target.value))}
              className="w-full accent-[#FD802E] h-1 bg-[#0F1720] rounded-lg cursor-pointer"
            />
          </div>

          {/* Node recovery time */}
          <div className="p-3 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[#F8FAFC] font-semibold block text-[11px]">Device Recovery Duration</span>
                <p className="text-[#94A3B8] text-[9.5px] leading-tight">Time required for recovery patches to clean and restore an infected host.</p>
              </div>
              <span className="text-[#FD802E] font-mono font-bold text-xs">{recoveryTime}ms</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={recoveryTime}
              onChange={(e) => setRecoveryTime(parseInt(e.target.value))}
              className="w-full accent-[#FD802E] h-1 bg-[#0F1720] rounded-lg cursor-pointer"
            />
          </div>
        </div>

      </div>

      {/* Backend API & Cloud Deployment Configuration */}
      <div className="max-w-2xl bg-[#233D4C] border border-[#4B5563]/25 rounded-xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#10B981]"></div>
        
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="p-3 bg-[#10B981]/10 rounded-xl text-[#10B981] border border-[#10B981]/20 flex-shrink-0 h-12 w-12 flex items-center justify-center">
              <Globe className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wide">Backend API Endpoint</h3>
                {backendStatus === 'online' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> CONNECTED
                  </span>
                )}
                {backendStatus === 'checking' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <RefreshCw className="w-3 h-3 animate-spin" /> CHECKING
                  </span>
                )}
                {backendStatus === 'offline' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                    <AlertCircle className="w-3 h-3" /> OFFLINE / DISCONNECTED
                  </span>
                )}
              </div>
              <p className="text-[#CBD5E1] text-xs leading-relaxed">
                Configure the FastAPI service URL (e.g. on Render, Docker, or localhost).
              </p>
            </div>
          </div>

          <button
            onClick={() => testBackendConnection(backendUrlInput)}
            title="Refresh connection status"
            className="p-2 bg-[#0F1720]/60 hover:bg-[#0F1720] border border-[#4B5563]/30 text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${backendStatus === 'checking' ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="border-t border-[#4B5563]/15 pt-5 space-y-4">
          <div className="p-3 bg-[#0F1720]/40 rounded-lg border border-[#4B5563]/15 space-y-2">
            <label className="text-[#F8FAFC] font-semibold block text-[11px]">
              FastAPI Server Base URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={backendUrlInput}
                onChange={(e) => setBackendUrlInput(e.target.value)}
                placeholder="https://netshield-backend.onrender.com"
                className="flex-1 bg-[#0F1720] border border-[#4B5563]/30 text-[#F8FAFC] px-3 py-2 rounded-lg outline-none font-mono text-xs focus:border-[#10B981]"
              />
              <button
                onClick={handleSaveBackendUrl}
                disabled={isSavingUrl}
                className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingUrl ? 'Saving...' : 'Save & Connect'}</span>
              </button>
            </div>
            {backendError && (
              <p className="text-red-400 text-[10px] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {backendError}
              </p>
            )}
            <p className="text-[#94A3B8] text-[10px] mt-1 leading-normal">
              Tip for Render: If your backend is at <code className="text-[#38BDF8]">https://netshield-backend.onrender.com</code>, paste it above or set <code className="text-[#38BDF8]">VITE_API_BASE_URL</code> in your Render static site dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
