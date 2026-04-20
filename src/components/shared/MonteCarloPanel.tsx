import { useState, useMemo } from 'react';
import { BarChart3, Play } from 'lucide-react';
import { monteCarloRun, type MonteCarloResult, type ParamRange } from '../../lib/utils/monte-carlo';
import { PlotWrapper } from '../charts/PlotWrapper';

interface MonteCarloConfig {
  label: string;
  key: string;
  baseValue: number;
  uncertaintyPct: number;
}

interface MonteCarloPanelProps {
  calcFn: (params: Record<string, number>) => number;
  outputLabel: string;
  outputUnit?: string;
  paramConfigs: MonteCarloConfig[];
  baseParams: Record<string, number>;
}

export function MonteCarloPanel({
  calcFn,
  outputLabel,
  outputUnit,
  paramConfigs,
  baseParams,
}: MonteCarloPanelProps) {
  const [open, setOpen] = useState(false);
  const [uncertainties, setUncertainties] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const cfg of paramConfigs) {
      init[cfg.key] = cfg.uncertaintyPct;
    }
    return init;
  });
  const [nSamples, setNSamples] = useState(1000);
  const [result, setResult] = useState<MonteCarloResult | null>(null);

  const runAnalysis = () => {
    const ranges: ParamRange[] = paramConfigs.map((cfg) => {
      const pct = (uncertainties[cfg.key] || 10) / 100;
      const base = baseParams[cfg.key] ?? cfg.baseValue;
      return {
        key: cfg.key,
        min: base * (1 - pct),
        max: base * (1 + pct),
      };
    });

    const res = monteCarloRun(calcFn, ranges, baseParams, nSamples);
    setResult(res);
  };

  const histogramData = useMemo(() => {
    if (!result) return null;
    return [
      {
        x: result.values,
        type: 'histogram' as const,
        nbinsx: 30,
        marker: { color: 'rgba(45,106,79,0.6)', line: { color: 'rgba(45,106,79,1)', width: 1 } },
        name: outputLabel,
      },
    ];
  }, [result, outputLabel]);

  return (
    <div className="bg-[var(--color-surface)] rounded-[6px] border border-[var(--color-border)] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-bg-alt)] transition-colors duration-150"
      >
        <BarChart3 className="w-4 h-4" />
        Monte Carlo Sensitivity Analysis
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-[var(--color-border-light)] pt-3">
          <div className="text-xs text-[var(--color-text-muted)] mb-2">
            Set uncertainty range (%) for each parameter:
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {paramConfigs.map((cfg) => (
              <div key={cfg.key} className="flex flex-col gap-1">
                <label className="text-[11px] text-[var(--color-text-subtle)]">{cfg.label}</label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[var(--color-text-muted)]">&plusmn;</span>
                  <input
                    type="number"
                    value={uncertainties[cfg.key] || 10}
                    onChange={(e) =>
                      setUncertainties((prev) => ({ ...prev, [cfg.key]: parseFloat(e.target.value) || 0 }))
                    }
                    className="w-16 px-2 py-1 text-xs border border-[var(--color-border)] rounded-[4px] text-[var(--color-text)]"
                    min={1}
                    max={50}
                    step={1}
                  />
                  <span className="text-xs text-[var(--color-text-subtle)]">%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <label className="text-[11px] text-[var(--color-text-subtle)]">Samples:</label>
              <input
                type="number"
                value={nSamples}
                onChange={(e) => setNSamples(Math.max(100, parseInt(e.target.value) || 1000))}
                className="w-20 px-2 py-1 text-xs border border-[var(--color-border)] rounded-[4px] text-[var(--color-text)]"
                min={100}
                max={10000}
                step={100}
              />
            </div>
            <button
              onClick={runAnalysis}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[var(--color-accent)] text-white rounded-[4px] hover:opacity-90 transition-opacity"
            >
              <Play className="w-3 h-3" /> Run Analysis
            </button>
          </div>
          {result && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  ['Mean', result.mean],
                  ['Std Dev', result.std],
                  ['P5', result.p5],
                  ['P95', result.p95],
                ].map(([label, value]) => (
                  <div key={label as string} className="bg-[var(--color-bg-alt)] rounded-[4px] p-2">
                    <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-subtle)]">{label as string}</div>
                    <div className="text-sm font-semibold text-[var(--color-text)]">
                      {(value as number).toFixed(4)}
                      {outputUnit && <span className="text-[10px] font-normal text-[var(--color-text-subtle)] ml-1">{outputUnit}</span>}
                    </div>
                  </div>
                ))}
              </div>
              {histogramData && (
                <PlotWrapper
                  data={histogramData}
                  title={`Distribution of ${outputLabel}`}
                  xLabel={`${outputLabel}${outputUnit ? ` (${outputUnit})` : ''}`}
                  yLabel="Frequency"
                  height={300}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
