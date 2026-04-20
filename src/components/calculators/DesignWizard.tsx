import { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Wand2, CheckCircle2 } from 'lucide-react';
import { useUnits } from '../../context/UnitContext';
import { designChannel, bestHydraulicSection } from '../../lib/design/channel-design';
import { ResultCard } from '../shared';
import type { ChannelShape } from '../../types';
import type { DesignConstraints, DesignResult } from '../../types/design';

const STEPS = ['Design Goal', 'Constraints', 'Shapes', 'Results'];

const GOALS = [
  { id: 'convey', label: 'Convey discharge Q', description: 'Design channel to carry a given flow rate' },
  { id: 'erosion', label: 'Prevent erosion', description: 'Limit velocity to prevent bed/bank erosion' },
  { id: 'efficiency', label: 'Maximize efficiency', description: 'Best hydraulic section for minimum excavation' },
];

const SHAPES: { id: ChannelShape; label: string }[] = [
  { id: 'rectangular', label: 'Rectangular' },
  { id: 'trapezoidal', label: 'Trapezoidal' },
  { id: 'triangular', label: 'Triangular' },
];

export default function DesignWizard() {
  const { units, labels, g } = useUnits();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('convey');
  const [Q, setQ] = useState(10);
  const [n, setN] = useState(0.013);
  const [S0, setS0] = useState(0.001);
  const [maxV, setMaxV] = useState(2);
  const [freeboard, setFreeboard] = useState(0.3);
  const [selectedShapes, setSelectedShapes] = useState<ChannelShape[]>(['rectangular', 'trapezoidal']);

  const toggleShape = (s: ChannelShape) => {
    setSelectedShapes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const constraints: DesignConstraints = { Q, n, S0, maxVelocity: goal === 'erosion' ? maxV : undefined, freeboard };

  const results = useMemo<DesignResult[]>(() => {
    if (step < 3) return [];
    return selectedShapes.map((shape) => {
      try {
        return designChannel(constraints, shape, units, g);
      } catch {
        return null;
      }
    }).filter(Boolean) as DesignResult[];
  }, [step, selectedShapes, constraints, units, g]);

  // Find best result (lowest P = most efficient)
  const bestIdx = results.length > 0
    ? results.reduce((best, r, i) => r.P < results[best].P ? i : best, 0)
    : -1;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Tools</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)] flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <Wand2 className="w-6 h-6 text-[var(--color-accent)]" /> Channel Design Wizard
        </h1>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                i === step
                  ? 'bg-[var(--color-accent)] text-white'
                  : i < step
                  ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)]'
                  : 'bg-[var(--color-bg-alt)] text-[var(--color-text-subtle)]'
              }`}
            >
              {s}
            </div>
            {i < STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-subtle)]" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[6px] p-6">
        {step === 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-[var(--color-text)]">Select Design Goal</h2>
            {GOALS.map((g) => (
              <button
                key={g.id}
                onClick={() => setGoal(g.id)}
                className={`w-full text-left p-4 rounded-[6px] border transition-colors ${
                  goal === g.id
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-bg)]'
                    : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'
                }`}
              >
                <div className="font-medium text-sm text-[var(--color-text)]">{g.label}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{g.description}</div>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-[var(--color-text)]">Enter Constraints</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[13px] font-medium text-[var(--color-text-muted)]">Discharge Q ({labels.discharge})</label>
                <input type="number" value={Q} onChange={(e) => setQ(+e.target.value)} min={0.01}
                  className="mt-1 w-full px-3 py-2 border rounded-[6px] text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)]" />
              </div>
              <div>
                <label className="text-[13px] font-medium text-[var(--color-text-muted)]">Manning's n</label>
                <input type="number" value={n} onChange={(e) => setN(+e.target.value)} step={0.001} min={0.001}
                  className="mt-1 w-full px-3 py-2 border rounded-[6px] text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)]" />
              </div>
              <div>
                <label className="text-[13px] font-medium text-[var(--color-text-muted)]">Bed Slope S₀</label>
                <input type="number" value={S0} onChange={(e) => setS0(+e.target.value)} step={0.0001} min={0.0001}
                  className="mt-1 w-full px-3 py-2 border rounded-[6px] text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)]" />
              </div>
              {goal === 'erosion' && (
                <div>
                  <label className="text-[13px] font-medium text-[var(--color-text-muted)]">Max Velocity ({labels.velocity})</label>
                  <input type="number" value={maxV} onChange={(e) => setMaxV(+e.target.value)} min={0.1}
                    className="mt-1 w-full px-3 py-2 border rounded-[6px] text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)]" />
                </div>
              )}
              <div>
                <label className="text-[13px] font-medium text-[var(--color-text-muted)]">Freeboard ({labels.length})</label>
                <input type="number" value={freeboard} onChange={(e) => setFreeboard(+e.target.value)} min={0} step={0.1}
                  className="mt-1 w-full px-3 py-2 border rounded-[6px] text-sm bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)]" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-[var(--color-text)]">Select Shapes to Evaluate</h2>
            <div className="grid grid-cols-3 gap-3">
              {SHAPES.map((s) => {
                const best = bestHydraulicSection(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleShape(s.id)}
                    className={`p-4 rounded-[6px] border text-left transition-colors ${
                      selectedShapes.includes(s.id)
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-bg)]'
                        : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'
                    }`}
                  >
                    <div className="font-medium text-sm text-[var(--color-text)]">{s.label}</div>
                    <div className="text-xs text-[var(--color-text-muted)] mt-1">Best: {best.ratio}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-semibold text-[var(--color-text)]">Optimized Results</h2>
            {results.map((r, i) => (
              <div key={r.shape} className={`p-4 rounded-[6px] border ${
                i === bestIdx ? 'border-[var(--color-accent)] bg-[var(--color-accent-bg)]' : 'border-[var(--color-border)]'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-semibold text-[var(--color-text)] capitalize">{r.shape}</span>
                  {i === bestIdx && (
                    <span className="flex items-center gap-1 text-xs text-[var(--color-accent)]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Recommended
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {r.b > 0 && <ResultCard label="Bottom Width (b)" value={r.b} unit={labels.length} />}
                  {r.m > 0 && <ResultCard label="Side Slope (m)" value={r.m} unit="H:V" />}
                  <ResultCard label="Normal Depth (yn)" value={r.yn} unit={labels.length} highlight />
                  <ResultCard label="Total Depth (y+fb)" value={r.y} unit={labels.length} />
                  <ResultCard label="Velocity (V)" value={r.V} unit={labels.velocity} />
                  <ResultCard label="Froude (Fr)" value={r.Fr} />
                  <ResultCard label="Area (A)" value={r.A} unit={labels.area} />
                  <ResultCard label="Perimeter (P)" value={r.P} unit={labels.length} />
                </div>
                {r.warnings.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {r.warnings.map((w, j) => (
                      <div key={j} className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                        {w}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1 px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        {step < 3 ? (
          <button
            onClick={() => setStep((s) => Math.min(3, s + 1))}
            disabled={step === 2 && selectedShapes.length === 0}
            className="flex items-center gap-1 px-5 py-2 bg-[var(--color-accent)] text-white rounded-[6px] text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
