import { useState, useCallback } from 'react';

/**
 * File: useUndoRedo.js
 * Author: Antigravity AI
 * Purpose: Custom React hook managing past/future state stacks for undo and redo functionality.
 */

export default function useUndoRedo() {
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  const takeSnapshot = useCallback((currentState) => {
    // Perform deep copy to prevent pointer mutation
    const stateCopy = JSON.parse(JSON.stringify(currentState));
    
    // Limit history stack size to 50 items to conserve memory
    setPast((prev) => {
      const updated = [...prev, stateCopy];
      if (updated.length > 50) {
        updated.shift();
      }
      return updated;
    });
    setFuture([]);
  }, []);

  const undo = useCallback((currentState) => {
    if (past.length === 0) return null;

    const stateCopy = JSON.parse(JSON.stringify(currentState));
    const previousState = past[past.length - 1];
    
    setPast((prev) => prev.slice(0, prev.length - 1));
    setFuture((prev) => [stateCopy, ...prev]);

    return previousState;
  }, [past]);

  const redo = useCallback((currentState) => {
    if (future.length === 0) return null;

    const stateCopy = JSON.parse(JSON.stringify(currentState));
    const nextState = future[0];

    setFuture((prev) => prev.slice(1));
    setPast((prev) => [...prev, stateCopy]);

    return nextState;
  }, [future]);

  const clearHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  return {
    takeSnapshot,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    clearHistory
  };
}
