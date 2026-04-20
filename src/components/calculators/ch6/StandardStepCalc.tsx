import { useMemo, useState } from 'react';
import { FileText, Share2 } from 'lucide-react';
import { useUnits } from '../../../context/UnitContext';
import { standardStep } from '../../../lib/gvf/standard-step';
import { normalDepth } from '../../../lib/friction/normal-depth';
import { criticalDepth } from '../../../lib/energy/critical-depth';
import { InputField, ResultCard, SelectField, FormulaDisplay, ExportButton, CopyLinkButton } from '../../shared';
import { PresetSelector } from '../../shared/PresetSelector';
import { CSVExportButton } from '../../shared/CSVExportButton';
import { SmartWarnings } from '../../shared/SmartWarnings';
import { NotesPanel } from '../../shared/NotesPanel';
import { ReportDialog } from '../../shared/ReportDialog';
import { ShareCardDialog } from '../../shared/ShareCardDialog';
import { WaterSurfaceProfile } from '../../charts/WaterSurfaceProfile';
import { LongitudinalProfile3D } from '../../charts/LongitudinalProfile3D';
import { getFlowWarnings } from '../../../utils/flow-warnings';
import { useUrlState } from '../../../hooks/useUrlState';
import type { ChannelParams } from '../../../types';

export default function StandardStepCalc() {
  const { units, labels, g } = useUnits();
  const [b, setB] = useUrlState('b', 5);
  const [Q, setQ] = useUrlState('Q', 10);
  const [n, setN] = useUrlState('n', 0.013);
  const [S0, setS0] = useUrlState('S0', 0.001);
  const [y0, setY0] = useUrlState('y0', 3);
  const [dx, setDx] = useUrlState('dx', 50);
  const [nSteps, setNSteps] = useUrlState('nSteps', 100);
  const [direction, setDirection] = useUrlState('direction', 'downstream');

  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [view3D, setView3D] = useState(false);

  const params: ChannelParams = useMemo(() => ({ shape: 'rectangular', b }), [b]);

  const result = useMemo(() => {
    try {
      const steps = standardStep(y0, Q, S0, n, g, params, units, {
        dx,
        nSteps,
        direction: direction as 'downstream' | 'upstream',
      });
      const nd = normalDepth(Q, n, S0, params, units);
      const yc = criticalDepth(Q, g, params);
      return { steps, yn: nd.yn, yc, error: null };
    } catch {
      return { steps: [], yn: 0, yc: 0, error: 'Computation error' };
    }
  }, [y0, Q, S0, n, g, params, dx, nSteps, direction, units]);

  const handlePreset = (values: Record<string, number | string>) => {
    if (values.b !== undefined) setB(Number(values.b));
    if (values.Q !== undefined) setQ(Number(values.Q));
    if (values.n !== undefined) setN(Number(values.n));
    if (values.S0 !== undefined) setS0(Number(values.S0));
    if (values.y0 !== undefined) setY0(Number(values.y0));
    if (values.dx !== undefined) setDx(Number(values.dx));
    if (values.nSteps !== undefined) setNSteps(Number(values.nSteps));
    if (values.direction !== undefined) setDirection(String(values.direction));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Chapter 6</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Standard Step Method</h1>
      </div>

      <FormulaDisplay latex="\\Delta x = \\frac{E_2 - E_1}{S_0 - \\bar{S}_f}" />

      <PresetSelector calculatorId="ch6-step" onSelect={handlePreset} />

      <div id="ch6-step-export" className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 bg-[var(--color-surface)] p-4 sm:p-6 rounded-[6px] border border-[var(--color-border)]">
          <InputField label="Bottom Width (b)" value={b} onChange={setB} unit={labels.length} min={0.1} />
          <InputField label="Discharge (Q)" value={Q} onChange={setQ} unit={labels.discharge} min={0.01} />
          <InputField label="Manning's n" value={n} onChange={setN} step={0.001} min={0.001} />
          <InputField label="Bed Slope (S₀)" value={S0} onChange={setS0} step={0.0001} />
          <InputField label="Starting Depth (y₀)" value={y0} onChange={setY0} unit={labels.length} min={0.01} />
          <InputField label="Step Size (Δx)" value={dx} onChange={setDx} unit={labels.length} min={1} />
          <InputField label="Number of Steps" value={nSteps} onChange={setNSteps} min={10} max={500} step={10} />
          <SelectField label="Direction" value={direction} onChange={setDirection} options={[
            { value: 'downstream', label: 'Downstream' },
            { value: 'upstream', label: 'Upstream' },
          ]} />
        </div>

        {result.error ? (
          <div className="error-banner bg-red-50 text-red-700 p-4 rounded-[6px]">{result.error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <ResultCard label="Normal Depth (yn)" value={result.yn} unit={labels.length} />
              <ResultCard label="Critical Depth (yc)" value={result.yc} unit={labels.length} />
              <ResultCard label="Steps Computed" value={result.steps.length} />
              <ResultCard label="Reach Length" value={result.steps.length > 0 ? Math.abs(result.steps[result.steps.length - 1].x - result.steps[0].x) : 0} unit={labels.length} />
            </div>

            <SmartWarnings warnings={getFlowWarnings({ y: y0, yc: result.yc, n, S0 })} />

            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => setView3D(false)} className={`px-3 py-1 rounded-[6px] border ${!view3D ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-bg)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>2D</button>
              <button onClick={() => setView3D(true)} className={`px-3 py-1 rounded-[6px] border ${view3D ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-bg)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>3D</button>
            </div>

            {view3D ? (
              <LongitudinalProfile3D steps={result.steps} S0={S0} yn={result.yn} yc={result.yc} lengthUnit={labels.length} channelWidth={b} />
            ) : (
              <WaterSurfaceProfile steps={result.steps} yn={result.yn} yc={result.yc} S0={S0} lengthUnit={labels.length} />
            )}

            {/* Data table */}
            <div className="bg-[var(--color-surface)] rounded-[6px] border border-[var(--color-border)] overflow-hidden">
              <h3 className="px-4 py-2 bg-[var(--color-bg-alt)] font-semibold text-sm border-b border-[var(--color-border)]">Step Results</h3>
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-[var(--color-bg-alt)]">
                    <tr className="border-b">
                      <th className="px-3 py-1.5 text-right">x ({labels.length})</th>
                      <th className="px-3 py-1.5 text-right">y ({labels.length})</th>
                      <th className="px-3 py-1.5 text-right">V ({labels.velocity})</th>
                      <th className="px-3 py-1.5 text-right">E ({labels.length})</th>
                      <th className="px-3 py-1.5 text-right">Sf</th>
                      <th className="px-3 py-1.5 text-right">Fr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.steps.filter((_, i) => i % Math.max(1, Math.floor(result.steps.length / 20)) === 0).map((s, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-3 py-1 text-right">{s.x.toFixed(1)}</td>
                        <td className="px-3 py-1 text-right">{s.y.toFixed(4)}</td>
                        <td className="px-3 py-1 text-right">{s.v.toFixed(4)}</td>
                        <td className="px-3 py-1 text-right">{s.E.toFixed(4)}</td>
                        <td className="px-3 py-1 text-right">{s.Sf.toFixed(6)}</td>
                        <td className="px-3 py-1 text-right">{s.Fr.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <NotesPanel calculatorId="ch6-step" />

      <div className="flex gap-2">
        <ExportButton targetId="ch6-step-export" filename="standard-step" />
        <CSVExportButton
          headers={['x', 'y', 'V', 'E', 'Sf', 'Fr']}
          data={result.steps.map((s) => [s.x.toFixed(2), s.y.toFixed(4), s.v.toFixed(4), s.E.toFixed(4), s.Sf.toFixed(6), s.Fr.toFixed(4)])}
          filename="standard-step-data"
        />
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
          calculatorTitle="Standard Step Method"
          inputs={[
            { label: 'Bottom Width (b)', value: String(b), unit: labels.length },
            { label: 'Discharge (Q)', value: String(Q), unit: labels.discharge },
            { label: "Manning's n", value: String(n), unit: '' },
            { label: 'Bed Slope (S0)', value: String(S0), unit: '' },
            { label: 'Starting Depth (y0)', value: String(y0), unit: labels.length },
          ]}
          results={[
            { label: 'Normal Depth (yn)', value: result.yn.toFixed(4), unit: labels.length },
            { label: 'Critical Depth (yc)', value: result.yc.toFixed(4), unit: labels.length },
            { label: 'Steps Computed', value: String(result.steps.length), unit: '' },
          ]}
          chartElementId="ch6-step-export"
        />
      )}

      {shareOpen && (
        <ShareCardDialog
          onClose={() => setShareOpen(false)}
          data={{
            calculatorName: 'Standard Step Method',
            results: [
              { label: 'Normal Depth', value: `${result.yn.toFixed(4)} ${labels.length}` },
              { label: 'Critical Depth', value: `${result.yc.toFixed(4)} ${labels.length}` },
              { label: 'Steps', value: String(result.steps.length) },
            ],
          }}
        />
      )}
    </div>
  );
}
