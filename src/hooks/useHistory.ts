import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface HistoryEntry {
  id: string;
  calculatorId: string;
  calculatorName: string;
  inputs: Record<string, number | string>;
  outputs: Record<string, number | string>;
  timestamp: number;
}

const MAX_ENTRIES = 100;

export function useHistory() {
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('hydro-history', []);

  const addEntry = useCallback(
    (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
      setHistory((prev) => {
        const newEntry: HistoryEntry = {
          ...entry,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: Date.now(),
        };
        // Deduplicate: skip if last entry for same calculator has identical inputs
        if (prev.length > 0) {
          const last = prev[0];
          if (
            last.calculatorId === entry.calculatorId &&
            JSON.stringify(last.inputs) === JSON.stringify(entry.inputs)
          ) {
            return prev;
          }
        }
        return [newEntry, ...prev].slice(0, MAX_ENTRIES);
      });
    },
    [setHistory]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  return { history, addEntry, clearHistory };
}
