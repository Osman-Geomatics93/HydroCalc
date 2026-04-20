import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PlotWrapper } from '../charts/PlotWrapper';
import type { Data } from 'plotly.js';
import { useTheme } from '../../context/ThemeContext';

interface ParamDef {
  key: string;
  label: string;
  min: number;
  max: number;
  default: number;
}

interface ParameterSweepProps {
  paramDefs: ParamDef[];
  baseInputs: Record<string, number | string>;
  calcFn: (inputs: Record<string, number | string>) => Record<string, number>;
  outputLabels: Record<string, string>;
}

export function ParameterSweep({ paramDefs, baseInputs, calcFn, outputLabels }: ParameterSweepProps) {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedParam, setSelectedParam] = useState(paramDefs[0]?.key || '');
  const [start, setStart] = useState(paramDefs[0]?.min || 0);
  const [end, setEnd] = useState(paramDefs[0]?.max || 10);
  const [steps, setSteps] = useState(10);

  const selectedDef = paramDefs.find((p) => p.key === selectedParam);

  const handleParamChange = (key: string) => {
    setSelectedParam(key);
    const def = paramDefs.find((p) => p.key === key);
    if (def) { setStart(def.min); setEnd(def.max); }
  };

  const sweepData = useMemo(() => {
    if (!selectedParam || steps < 2) return null;
    const n = Math.min(steps, 100);
    const step = (end - start) / (n - 1);
    const rows: Record<string, number>[] = [];
    const xVals: number[] = [];

    for (let i = 0; i < n; i++) {
      const val = start + step * i;
      xVals.push(val);
      try {
        const inputs = { ...baseInputs, [selectedParam]: val };
        const out = calcFn(inputs);
        rows.push(out);
      } catch {
        rows.push({});
      }
    }
    return { xVals, rows };
  }, [selectedParam, start, end, steps, baseInputs, calcFn]);

  const outputKeys = sweepData?.rows[0] ? Object.keys(sweepData.rows[0]) : [];
  const lineColor = isDark ? '#52b788' : '#2d6a4f';
  const colors = [lineColor, '#f59e0b', '#dc2626', '#6366f1', '#06b6d4'];

  return (
    <div className="bg-[var(--color-surface)] rounded-[6px] border border-[var(--color-border)] no-print">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      >
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        Parameter Sweep
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-[var(--color-border)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
            <div>
              <label className="text-[13px] font-medium text-[var(--color-text-muted)]">Parameter</label>
              <select
                value={selectedParam}
                onChange={(e) => handleParamChange(e.target.value)}
                className="mt-1 w-full px-2 py-1.5 border rounded-[6px] text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)]"
              >
                {paramDefs.map((p) => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[13px] font-medium text-[var(--color-text-muted)]">Start</label>
              <input type="number" value={start} onChange={(e) => setStart(+e.target.value)}
                className="mt-1 w-full px-2 py-1.5 border rounded-[6px] text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)]" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-[var(--color-text-muted)]">End</label>
              <input type="number" value={end} onChange={(e) => setEnd(+e.target.value)}
                className="mt-1 w-full px-2 py-1.5 border rounded-[6px] text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)]" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-[var(--color-text-muted)]">Steps</label>
              <input type="number" value={steps} min={2} max={100} onChange={(e) => setSteps(+e.target.value)}
                className="mt-1 w-full px-2 py-1.5 border rounded-[6px] text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)]" />
            </div>
          </div>

          {sweepData && outputKeys.length > 0 && (
            <>
              {/* Chart */}
              <PlotWrapper
                data={outputKeys.map((key, i): Data => ({
                  x: sweepData.xVals,
                  y: sweepData.rows.map((r) => r[key] ?? null),
                  mode: 'lines+markers',
                  name: outputLabels[key] || key,
                  line: { color: colors[i % colors.length], width: 2 },
                  marker: { size: 4 },
                }))}
                xLabel={selectedDef?.label || selectedParam}
                yLabel="Output"
                height={300}
              />

              {/* Table */}
              <div className="max-h-60 overflow-auto rounded-[6px] border border-[var(--color-border)]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[var(--color-bg-alt)]">
                    <tr>
                      <th className="px-3 py-1.5 text-left">{selectedDef?.label || selectedParam}</th>
                      {outputKeys.map((k) => (
                        <th key={k} className="px-3 py-1.5 text-right">{outputLabels[k] || k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sweepData.xVals.map((x, i) => (
                      <tr key={i} className="border-t border-[var(--color-border)]">
                        <td className="px-3 py-1">{x.toPrecision(4)}</td>
                        {outputKeys.map((k) => (
                          <td key={k} className="px-3 py-1 text-right">
                            {sweepData.rows[i][k]?.toPrecision(4) ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
