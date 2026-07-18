import React, { useEffect, useRef } from 'react';
import { 
  Edit2, Copy, Trash2, Heart, ShieldAlert, ShieldCheck, Maximize, RefreshCw, PlusCircle
} from 'lucide-react';

/**
 * File: ContextMenu.jsx
 * Author: Antigravity AI
 * Purpose: Absoluted-positioned context menu rendering on right-click of canvas elements.
 */

export default function ContextMenu({ 
  x, y, targetType, targetId, onClose, onAction 
}) {
  const menuRef = useRef(null);

  // Close context menu on clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{ top: y, left: x }}
      className="absolute z-50 min-w-[160px] bg-[#1B2838] border border-[#4B5563]/40 rounded-lg shadow-2xl py-1 text-xs text-[#CBD5E1] select-none font-sans"
    >
      {targetType === 'node' && (
        <>
          <button
            onClick={() => { onAction('rename', targetId); onClose(); }}
            className="w-full text-left px-3 py-2 hover:bg-[#FD802E] hover:text-[#0F1720] flex items-center gap-2 transition-colors font-semibold"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Rename Node
          </button>
          <button
            onClick={() => { onAction('duplicate', targetId); onClose(); }}
            className="w-full text-left px-3 py-2 hover:bg-[#FD802E] hover:text-[#0F1720] flex items-center gap-2 transition-colors font-semibold"
          >
            <Copy className="h-3.5 w-3.5" />
            Duplicate Node
          </button>
          
          <div className="border-t border-[#4B5563]/20 my-1"></div>
          
          <button
            onClick={() => { onAction('status', { id: targetId, status: 'healthy' }); onClose(); }}
            className="w-full text-left px-3 py-2 hover:bg-[#22C55E]/20 text-[#22C55E] flex items-center gap-2 transition-colors font-semibold"
          >
            <Heart className="h-3.5 w-3.5" />
            Set Healthy
          </button>
          <button
            onClick={() => { onAction('status', { id: targetId, status: 'infected' }); onClose(); }}
            className="w-full text-left px-3 py-2 hover:bg-[#EF4444]/20 text-[#EF4444] flex items-center gap-2 transition-colors font-semibold"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Set Infected
          </button>
          <button
            onClick={() => { onAction('status', { id: targetId, status: 'protected' }); onClose(); }}
            className="w-full text-left px-3 py-2 hover:bg-[#FACC15]/20 text-[#FACC15] flex items-center gap-2 transition-colors font-semibold"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Set Protected
          </button>
          
          <div className="border-t border-[#4B5563]/20 my-1"></div>
          
          <button
            onClick={() => { onAction('delete', targetId); onClose(); }}
            className="w-full text-left px-3 py-2 hover:bg-[#EF4444] hover:text-[#F8FAFC] text-[#EF4444] flex items-center gap-2 transition-colors font-semibold"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Node
          </button>
        </>
      )}

      {targetType === 'edge' && (
        <>
          <button
            onClick={() => { onAction('edit-edge', targetId); onClose(); }}
            className="w-full text-left px-3 py-2 hover:bg-[#FD802E] hover:text-[#0F1720] flex items-center gap-2 transition-colors font-semibold"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit Properties
          </button>
          <button
            onClick={() => { onAction('delete-edge', targetId); onClose(); }}
            className="w-full text-left px-3 py-2 hover:bg-[#EF4444] hover:text-[#F8FAFC] text-[#EF4444] flex items-center gap-2 transition-colors font-semibold"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Link
          </button>
        </>
      )}

      {targetType === 'canvas' && (
        <>
          <button
            onClick={() => { onAction('center-view'); onClose(); }}
            className="w-full text-left px-3 py-2 hover:bg-[#FD802E] hover:text-[#0F1720] flex items-center gap-2 transition-colors font-semibold"
          >
            <Maximize className="h-3.5 w-3.5" />
            Center View
          </button>
          <button
            onClick={() => { onAction('reset-zoom'); onClose(); }}
            className="w-full text-left px-3 py-2 hover:bg-[#FD802E] hover:text-[#0F1720] flex items-center gap-2 transition-colors font-semibold"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Zoom
          </button>
          
          <div className="border-t border-[#4B5563]/20 my-1"></div>
          
          <div className="px-3 py-1 text-[10px] text-[#94A3B8] uppercase tracking-wider">Quick Add</div>
          <button
            onClick={() => { onAction('add-device-here', 'PC'); onClose(); }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#1B2838] flex items-center gap-2 transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5 text-[#FD802E]" />
            Add Workstation
          </button>
          <button
            onClick={() => { onAction('add-device-here', 'Router'); onClose(); }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#1B2838] flex items-center gap-2 transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5 text-[#FD802E]" />
            Add Router
          </button>
          <button
            onClick={() => { onAction('add-device-here', 'Access Switch'); onClose(); }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#1B2838] flex items-center gap-2 transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5 text-[#FD802E]" />
            Add Access Switch
          </button>
        </>
      )}
    </div>
  );
}
