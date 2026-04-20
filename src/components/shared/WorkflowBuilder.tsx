import { useState } from 'react';
import { Plus, X, ChevronRight, Play } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { CHAIN_MAPPINGS, CALC_ID_TO_PATH } from '../../constants/chain-mappings';
import { useNavigate } from 'react-router-dom';

interface WorkflowStep {
  calcId: string;
  label: string;
  outputMapping?: { outputKey: string; targetCalcId: string; targetInputKey: string };
}

const AVAILABLE_CALCS = Object.entries(CALC_ID_TO_PATH).map(([id, path]) => ({
  id,
  label: id.replace(/^ch\d+-/, '').replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
  path,
}));

export default function WorkflowBuilder() {
  const [steps, setSteps] = useLocalStorage<WorkflowStep[]>('hydro-workflow', []);
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  const addStep = (calcId: string) => {
    const calc = AVAILABLE_CALCS.find((c) => c.id === calcId);
    if (calc) {
      setSteps((prev) => [...prev, { calcId, label: calc.label }]);
    }
    setAdding(false);
  };

  const removeStep = (idx: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== idx));
  };

  const setMapping = (stepIdx: number, outputKey: string, targetCalcId: string, targetInputKey: string) => {
    setSteps((prev) => prev.map((s, i) =>
      i === stepIdx ? { ...s, outputMapping: { outputKey, targetCalcId, targetInputKey } } : s
    ));
  };

  const runStep = (step: WorkflowStep) => {
    const path = CALC_ID_TO_PATH[step.calcId];
    if (path) navigate(path);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Tools</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
          Workflow Builder
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Chain calculators together — outputs from one step feed into the next.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const mapping = CHAIN_MAPPINGS[step.calcId];
          return (
            <div key={idx} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[6px] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--color-accent)] bg-[var(--color-accent-bg)] px-2 py-0.5 rounded">
                    Step {idx + 1}
                  </span>
                  <span className="font-medium text-sm text-[var(--color-text)]">{step.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => runStep(step)} className="p-1 text-[var(--color-accent)] hover:opacity-70" title="Open calculator">
                    <Play className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeStep(idx)} className="p-1 text-[var(--color-text-subtle)] hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Output mapping */}
              {mapping && mapping.outputs.length > 0 && idx < steps.length - 1 && (
                <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
                  <div className="text-xs text-[var(--color-text-muted)] mb-1">Connect output to next step:</div>
                  <div className="flex gap-2 flex-wrap">
                    {mapping.outputs.map((out) => {
                      const targets = mapping.compatibleInputs[out.key] || [];
                      return (
                        <div key={out.key} className="flex items-center gap-1 text-xs">
                          <span className="text-[var(--color-text)]">{out.label}</span>
                          <ChevronRight className="w-3 h-3 text-[var(--color-text-subtle)]" />
                          <select
                            value={step.outputMapping?.outputKey === out.key ? `${step.outputMapping.targetCalcId}:${step.outputMapping.targetInputKey}` : ''}
                            onChange={(e) => {
                              const [tc, ti] = e.target.value.split(':');
                              if (tc && ti) setMapping(idx, out.key, tc, ti);
                            }}
                            className="px-1 py-0.5 border rounded text-xs bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)]"
                          >
                            <option value="">—</option>
                            {targets.map((t) => (
                              <option key={`${t.calcId}:${t.inputKey}`} value={`${t.calcId}:${t.inputKey}`}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Arrow connector */}
              {idx < steps.length - 1 && (
                <div className="flex justify-center mt-2 text-[var(--color-text-subtle)]">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add step */}
      {adding ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[6px] p-4">
          <div className="text-xs font-medium text-[var(--color-text-muted)] mb-2">Select a calculator:</div>
          <div className="grid grid-cols-2 gap-1 max-h-60 overflow-y-auto">
            {AVAILABLE_CALCS.map((calc) => (
              <button
                key={calc.id}
                onClick={() => addStep(calc.id)}
                className="text-left px-3 py-1.5 text-sm rounded hover:bg-[var(--color-accent-bg)] hover:text-[var(--color-accent)] text-[var(--color-text-muted)]"
              >
                {calc.label}
              </button>
            ))}
          </div>
          <button onClick={() => setAdding(false)} className="mt-2 text-xs text-[var(--color-text-subtle)] hover:underline">Cancel</button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-[var(--color-border)] rounded-[6px] text-sm text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] w-full justify-center"
        >
          <Plus className="w-4 h-4" /> Add Step
        </button>
      )}

      {steps.length === 0 && (
        <div className="text-center text-sm text-[var(--color-text-subtle)] py-12">
          Add calculator steps to build a workflow pipeline.
          <br />
          Outputs from upstream steps can feed into downstream inputs.
        </div>
      )}
    </div>
  );
}
