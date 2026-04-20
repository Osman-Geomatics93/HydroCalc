import { useState, useMemo } from 'react';
import { Plus, Trash2, FileText, Share2 } from 'lucide-react';
import { useUnits } from '../../../context/UnitContext';
import { multiReachProfile, type Reach } from '../../../lib/gvf/multi-reach';
import { InputField, ResultCard, FormulaDisplay, ExportButton, CopyLinkButton } from '../../shared';
import { CSVExportButton } from '../../shared/CSVExportButton';
import { NotesPanel } from '../../shared/NotesPanel';
import { ReportDialog } from '../../shared/ReportDialog';
import { ShareCardDialog } from '../../shared/ShareCardDialog';
import { WaterSurfaceProfile } from '../../charts/WaterSurfaceProfile';
import { LongitudinalProfile3D } from '../../charts/LongitudinalProfile3D';

const defaultReach: Reach = { length: 500, S0: 0.001, n: 0.013, b: 5, y0: 3 };

export default function MultiReachCalc() {
  const { units, labels, g } = useUnits();
  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [view3D, setView3D] = useState(false);
  const [Q, setQ] = useState(10);
  const [direction, setDirection] = useState<'downstream' | 'upstream'>('downstream');
  const [reaches, setReaches] = useState<Reach[]>([
    { length: 500, S0: 0.001, n: 0.013, b: 5, y0: 3 },
    { length: 300, S0: 0.005, n: 0.020, b: 4 },
  ]);

  const addReach = () => setReaches([...reaches, { ...defaultReach, y0: undefined }]);
  const removeReach = (idx: number) => {
    if (reaches.length <= 1) return;
    setReaches(reaches.filter((_, i) => i !== idx));
  };
  const updateReach = (idx: number, field: keyof Reach, value: number) => {
    setReaches(reaches.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const result = useMemo(() => {
    try {
      return multiReachProfile(reaches, Q, g, units, direction);
    } catch {
      return { steps: [], reachBoundaries: [] };
    }
  }, [reaches, Q, g, units, direction]);

  const csvHeaders = ['x', 'y', 'V', 'E', 'Sf', 'Fr'];
  const csvData = result.steps.map((s) => [
    s.x.toFixed(2), s.y.toFixed(4), s.v.toFixed(4), s.E.toFixed(4), s.Sf.toFixed(6), s.Fr.toFixed(4),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Chapter 6</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
          Multi-Reach Profile Builder
        </h1>
      </div>

      <FormulaDisplay latex="\\text{Each reach: } \\Delta x = \\frac{E_2 - E_1}{S_0 - \\bar{S}_f}, \\quad y_{\\text{start}}^{(i+1)} = y_{\\text{end}}^{(i)}" />

      <div id="ch6-multireach-export" className="space-y-6">
        <div className="bg-[var(--color-surface)] p-4 rounded-[6px] border border-[var(--color-border)] space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Discharge (Q)" value={Q} onChange={setQ} unit={labels.discharge} min={0.01} />
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-medium text-[var(--color-text-muted)] tracking-wide">Direction</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as 'downstream' | 'upstream')}
                className="px-3 py-2 border border-[var(--color-border)] rounded-[6px] text-sm text-[var(--color-text)]"
              >
                <option value="downstream">Downstream</option>
                <option value="upstream">Upstream</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reach table */}
        <div className="bg-[var(--color-surface)] rounded-[6px] border border-[var(--color-border)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-[var(--color-bg-alt)] border-b border-[var(--color-border)]">
            <h3 className="font-semibold text-sm">Reaches</h3>
            <button
              onClick={addReach}
              className="flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline"
            >
              <Plus className="w-3 h-3" /> Add Reach
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-bg-alt)]">
                <tr className="border-b">
                  <th className="px-3 py-1.5 text-left">#</th>
                  <th className="px-3 py-1.5 text-right">Length ({labels.length})</th>
                  <th className="px-3 py-1.5 text-right">S0</th>
                  <th className="px-3 py-1.5 text-right">n</th>
                  <th className="px-3 py-1.5 text-right">b ({labels.length})</th>
                  <th className="px-3 py-1.5 text-right">y0 ({labels.length})</th>
                  <th className="px-3 py-1.5"></th>
                </tr>
              </thead>
              <tbody>
                {reaches.map((r, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-3 py-1 font-medium">{i + 1}</td>
                    <td className="px-3 py-1">
                      <input type="number" value={r.length} onChange={(e) => updateReach(i, 'length', +e.target.value)}
                        className="w-20 text-right px-1 py-0.5 border border-[var(--color-border)] rounded text-xs" />
                    </td>
                    <td className="px-3 py-1">
                      <input type="number" value={r.S0} onChange={(e) => updateReach(i, 'S0', +e.target.value)}
                        className="w-20 text-right px-1 py-0.5 border border-[var(--color-border)] rounded text-xs" step={0.0001} />
                    </td>
                    <td className="px-3 py-1">
                      <input type="number" value={r.n} onChange={(e) => updateReach(i, 'n', +e.target.value)}
                        className="w-20 text-right px-1 py-0.5 border border-[var(--color-border)] rounded text-xs" step={0.001} />
                    </td>
                    <td className="px-3 py-1">
                      <input type="number" value={r.b} onChange={(e) => updateReach(i, 'b', +e.target.value)}
                        className="w-20 text-right px-1 py-0.5 border border-[var(--color-border)] rounded text-xs" />
                    </td>
                    <td className="px-3 py-1">
                      <input
                        type="number"
                        value={r.y0 ?? ''}
                        onChange={(e) => updateReach(i, 'y0', +e.target.value || 0)}
                        placeholder={i === 0 ? '-' : 'auto'}
                        className="w-20 text-right px-1 py-0.5 border border-[var(--color-border)] rounded text-xs"
                      />
                    </td>
                    <td className="px-3 py-1">
                      {reaches.length > 1 && (
                        <button onClick={() => removeReach(i)} className="text-[var(--color-text-subtle)] hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <ResultCard label="Total Steps" value={result.steps.length} />
          <ResultCard label="Total Length" value={result.reachBoundaries[result.reachBoundaries.length - 1] || 0} unit={labels.length} />
          <ResultCard
            label="Final Depth"
            value={result.steps.length > 0 ? result.steps[result.steps.length - 1].y : 0}
            unit={labels.length}
            highlight
          />
        </div>

        {result.steps.length > 0 && (
          <>
            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => setView3D(false)} className={`px-3 py-1 rounded-[6px] border ${!view3D ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-bg)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>2D</button>
              <button onClick={() => setView3D(true)} className={`px-3 py-1 rounded-[6px] border ${view3D ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-bg)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>3D</button>
            </div>
            {view3D ? (
              <LongitudinalProfile3D steps={result.steps} S0={reaches[0]?.S0 || 0.001} lengthUnit={labels.length} channelWidth={reaches[0]?.b || 5} />
            ) : (
              <WaterSurfaceProfile steps={result.steps} lengthUnit={labels.length} />
            )}
          </>
        )}
      </div>

      <NotesPanel calculatorId="ch6-multireach" />

      <div className="flex gap-2">
        <ExportButton targetId="ch6-multireach-export" filename="multi-reach-profile" />
        <CSVExportButton headers={csvHeaders} data={csvData} filename="multi-reach-data" />
        <CopyLinkButton />
        <button onClick={() => setReportOpen(true)} className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-[6px] hover:bg-[var(--color-bg-alt)] flex items-center gap-1" title="Generate PDF Report">
          <FileText className="w-4 h-4" />
        </button>
        <button onClick={() => setShareOpen(true)} className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-[6px] hover:bg-[var(--color-bg-alt)] flex items-center gap-1" title="Share as Image">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {reportOpen && (
        <ReportDialog
          onClose={() => setReportOpen(false)}
          calculatorTitle="Multi-Reach Profile"
          inputs={[
            { label: 'Discharge (Q)', value: String(Q), unit: labels.discharge },
            { label: 'Reaches', value: String(reaches.length), unit: '' },
            { label: 'Direction', value: direction, unit: '' },
          ]}
          results={[
            { label: 'Total Steps', value: String(result.steps.length), unit: '' },
            { label: 'Total Length', value: String(result.reachBoundaries[result.reachBoundaries.length - 1] || 0), unit: labels.length },
            { label: 'Final Depth', value: result.steps.length > 0 ? result.steps[result.steps.length - 1].y.toFixed(4) : '0', unit: labels.length },
          ]}
          chartElementId="ch6-multireach-export"
        />
      )}

      {shareOpen && (
        <ShareCardDialog
          onClose={() => setShareOpen(false)}
          data={{
            calculatorName: 'Multi-Reach Profile',
            results: [
              { label: 'Total Steps', value: String(result.steps.length) },
              { label: 'Final Depth', value: result.steps.length > 0 ? `${result.steps[result.steps.length - 1].y.toFixed(4)} ${labels.length}` : 'N/A' },
            ],
          }}
        />
      )}
    </div>
  );
}
