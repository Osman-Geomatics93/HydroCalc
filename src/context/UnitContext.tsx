import { createContext, useContext, type ReactNode } from 'react';
import type { UnitSystem, UnitLabels } from '../types';
import { getUnitLabels } from '../lib/utils/units';
import { getGravity } from '../constants/physics';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface UnitContextValue {
  units: UnitSystem;
  toggleUnits: () => void;
  labels: UnitLabels;
  g: number;
}

const UnitContext = createContext<UnitContextValue | null>(null);

export function UnitProvider({ children }: { children: ReactNode }) {
  const [units, setUnits] = useLocalStorage<UnitSystem>('hydro-units', 'SI');

  const toggleUnits = () => setUnits((u) => (u === 'SI' ? 'US' : 'SI'));

  const value: UnitContextValue = {
    units,
    toggleUnits,
    labels: getUnitLabels(units),
    g: getGravity(units),
  };

  return <UnitContext value={value}>{children}</UnitContext>;
}

export function useUnits(): UnitContextValue {
  const ctx = useContext(UnitContext);
  if (!ctx) throw new Error('useUnits must be used within UnitProvider');
  return ctx;
}
