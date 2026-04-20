import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { FormulaDisplay } from './FormulaDisplay';
import type { SolutionStep } from '../../constants/steps';

interface StepByStepPanelProps {
  steps: SolutionStep[];
  inputs: Record<string, number>;
}

export function StepByStepPanel({ steps, inputs }: StepByStepPanelProps) {
  const [open, setOpen] = useState(false);

  if (steps.length === 0) return null;

  return (
    <div className="bg-[var(--color-surface)] rounded-[6px] border border-[var(--color-border)] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-bg-alt)] transition-colors duration-150"
      >
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        Step-by-Step Solution
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-[var(--color-border-light)]">
          {steps.map((step, i) => {
            let value: number;
            try {
              value = step.compute(inputs);
            } catch {
              value = NaN;
            }
            return (
              <div key={i} className="flex items-start gap-3 pt-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-accent-bg)] text-[var(--color-accent)] text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--color-text)]">{step.label}</div>
                  <div className="mt-1">
                    <FormulaDisplay latex={step.latex} block={false} />
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[var(--color-accent)]">
                    = {isNaN(value) ? 'N/A' : value.toFixed(4)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
