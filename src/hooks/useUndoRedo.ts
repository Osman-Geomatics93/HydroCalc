import { useCallback, useEffect, useState, useRef } from 'react';

/**
 * Undo/Redo via browser history.
 * Wraps URL-based state so that each meaningful input change pushes
 * a new history entry, enabling Ctrl+Z / Ctrl+Shift+Z navigation.
 */
export function useUndoRedo() {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const stackRef = useRef({ past: 0, future: 0 });

  // Push current URL as a new history entry (called by useUrlState when pushHistory: true)
  const pushSnapshot = useCallback(() => {
    const url = window.location.pathname + window.location.search;
    window.history.pushState({ hydroSnapshot: true }, '', url);
    stackRef.current.past++;
    stackRef.current.future = 0;
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    if (stackRef.current.past > 0) {
      window.history.back();
    }
  }, []);

  const redo = useCallback(() => {
    if (stackRef.current.future > 0) {
      window.history.forward();
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      // Sync undo/redo ability on popstate
      stackRef.current.past = Math.max(0, stackRef.current.past - 1);
      stackRef.current.future++;
      setCanUndo(stackRef.current.past > 0);
      setCanRedo(stackRef.current.future > 0);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  return { undo, redo, canUndo, canRedo, pushSnapshot };
}
