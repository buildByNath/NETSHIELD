import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Activity, RefreshCw, Server, AlertCircle } from 'lucide-react';

/**
 * File: App.jsx
 * Author: Antigravity AI
 * Purpose: Main React container verifying application setup and backend API availability.
 */

export default function App() {
  const [status, setStatus] = useState('connecting'); // 'connecting' | 'connected' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const checkHealth = async () => {
    setStatus('connecting');
    try {
      const response = await axios.get('http://127.0.0.1:8000/health');
      if (response.data && response.data.status === 'online') {
        setStatus('connected');
      } else {
        setStatus('error');
        setErrorMsg('Invalid response structure received.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Unable to connect to the backend server.');
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1720] text-[#F8FAFC] flex flex-col">
      {/* Premium NOC Header */}
      <header className="h-16 border-b border-[#4B5563] bg-[#233D4C]/30 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-[#FD802E] animate-pulse" />
          <div>
            <h1 className="text-xl font-bold tracking-wider text-[#F8FAFC] flex items-center gap-2">
              NETSHIELD
              <span className="text-[10px] uppercase font-mono tracking-widest bg-[#FD802E]/20 text-[#FD802E] px-2 py-0.5 rounded border border-[#FD802E]/30">
                v1.0.0 Setup
              </span>
            </h1>
            <p className="text-[11px] text-[#94A3B8] leading-none">
              Network Attack Simulation & Response Planner
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-[#94A3B8]">Developer Mode:</span>
          <span className="px-2 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
            ACTIVE
          </span>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#233D4C] border border-[#4B5563]/30 rounded-xl p-8 shadow-2xl relative overflow-hidden">
          {/* Accent decoration line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FD802E]"></div>
          
          <div className="text-center space-y-6">
            <div className="inline-flex p-3 rounded-full bg-[#0F1720] border border-[#4B5563]/30 text-[#FD802E]">
              <Server className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[#F8FAFC]">Environment Verification</h2>
              <p className="text-sm text-[#CBD5E1]">
                Verifying local connections between React (Vite) and FastAPI (Python)
              </p>
            </div>

            <div className="border border-[#4B5563]/25 rounded-lg p-5 bg-[#0F1720]/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#CBD5E1]">FastAPI Server</span>
                <span className="text-xs font-mono text-[#94A3B8]">http://127.0.0.1:8000</span>
              </div>
              
              <div className="flex items-center justify-between border-t border-[#4B5563]/10 pt-4">
                <span className="text-sm text-[#CBD5E1]">Status</span>
                <div className="flex items-center gap-2">
                  {status === 'connecting' && (
                    <>
                      <RefreshCw className="h-4 w-4 text-[#FD802E] animate-spin" />
                      <span className="text-sm text-[#FD802E]">Pinging...</span>
                    </>
                  )}
                  {status === 'connected' && (
                    <>
                      <Activity className="h-4 w-4 text-[#22C55E] animate-pulse" />
                      <span className="text-sm text-[#22C55E] font-semibold">Online (Connected)</span>
                    </>
                  )}
                  {status === 'error' && (
                    <>
                      <AlertCircle className="h-4 w-4 text-[#EF4444]" />
                      <span className="text-sm text-[#EF4444] font-semibold">Offline</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {status === 'error' && (
              <div className="text-left text-xs bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] p-3 rounded font-mono">
                <strong>Error details:</strong> {errorMsg}
              </div>
            )}

            <button
              onClick={checkHealth}
              disabled={status === 'connecting'}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#FD802E] hover:bg-[#FF9C4A] text-[#F8FAFC] font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${status === 'connecting' ? 'animate-spin' : ''}`} />
              Retry Connection Check
            </button>
          </div>
        </div>
      </main>

      {/* Footer / Status bar */}
      <footer className="h-8 border-t border-[#4B5563] bg-[#233D4C]/10 px-6 flex items-center justify-between text-xs text-[#94A3B8] font-mono">
        <div>KTU Design & Analysis of Algorithms Viva Project</div>
        <div>System OK</div>
      </footer>
    </div>
  );
}
