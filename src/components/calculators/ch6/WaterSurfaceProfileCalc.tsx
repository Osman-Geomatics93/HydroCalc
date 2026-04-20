import { useMemo, useState } from 'react';
import { FileText, Share2 } from 'lucide-react';
import { useUnits } from '../../../context/UnitContext';
import { standardStep } from '../../../lib/gvf/standard-step';
import { normalDepth } from '../../../lib/friction/normal-depth';
import { criticalDepth } from '../../../lib/energy/critical-depth';
import { classifySlope } from '../../../lib/friction/classification';
import { determineProfile } from '../../../lib/gvf/profiles';
import { InputField, ResultCard, FormulaDisplay, ExportButton, CopyLinkButton } from '../../shared';
import { CSVExportButton } from '../../shared/CSVExportButton';
import { StepByStepPanel } from '../../shared/StepByStepPanel';
import { PresetSelector } from '../../shared/PresetSelector';
import { SmartWarnings } from '../../shared/SmartWarnings';
import { NotesPanel } from '../../shared/NotesPanel';
import { ReportDialog } from '../../shared/ReportDialog';
import { ShareCardDialog } from '../../shared/ShareCardDialog';
import { getStepsForShape } from '../../../constants/steps';
import { getManningK } from '../../../constants/physics';
import { getFlowWarnings } from '../../../utils/flow-warnings';
import { WaterSurfaceProfile } from '../../charts/WaterSurfaceProfile';
import { LongitudinalProfile3D } from '../../charts/LongitudinalProfile3D';
import { useUrlState } from '../../../hooks/useUrlState';
import type { ChannelParams } from '../../../types';

export default function WaterSurfaceProfileCalc() {
  const { units, labels, g } = useUnits();
  const [b, setB] = useUrlState('b', 5);
  const [Q, setQ] = useUrlState('Q', 10);
  const [n, setN] = useUrlState('n', 0.013);
  const [S0, setS0] = useUrlState('S0', 0.001);
  const [y0, setY0] = useUrlState('y0', 3);

  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [view3D, setView3D] = useState(false);

  const params: ChannelParams = { shape: 'rectangular', b };

  const result = useMemo(() => {
    try {
      const nd = normalDepth(Q, n, S0, params, units);
      const yc = criticalDepth(Q, g, params);
      const slope = classifySlope(S0, nd.yn, yc);
      const profile = determineProfile(slope, y0, nd.yn, yc);

      // Determine direction: subcritical profiles compute upstream, supercritical downstream
      const direction = y0 > yc ? 'upstream' : 'downstream';

      const steps = standardStep(y0, Q, S0, n, g, params, units, {
        dx: 50,
        nSteps: 150,
        direction,
      });

      return { steps, yn: nd.yn, yc, slope, profile, error: null };
    } catch {
      return { steps: [], yn: 0, yc: 0, slope: null, profile: null, error: 'Computation error' };
    }
  }, [y0, Q, S0, n, g, b, units]);

  const handlePreset = (values: Record<string, number | string>) => {
    if (values.b !== undefined) setB(Number(values.b));
    if (values.Q !== undefined) setQ(Number(values.Q));
    if (values.n !== undefined) setN(Number(values.n));
    if (values.S0 !== undefined) setS0(Number(values.S0));
    if (values.y0 !== undefined) setY0(Number(values.y0));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Chapter 6</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Water Surface Profiles</h1>
      </div>

      <FormulaDisplay latex="\\frac{dy}{dx} = \\frac{S_0 - S_f}{1 - Fr^2}" />

      <PresetSelector calculatorId="ch6-profiles" onSelect={handlePreset} />

      <div id="ch6-profiles-export" className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-[var(--color-surface)] p-6 rounded-[6px] border border-[var(--color-border)]">
          <InputField label="Bottom Width (b)" value={b} onChange={setB} unit={labels.length} min={0.1} />
          <InputField label="Discharge (Q)" value={Q} onChange={setQ} unit={labels.discharge} min={0.01} />
          <InputField label="Manning's n" value={n} onChange={setN} step={0.001} min={0.001} />
          <InputField label="Bed Slope (S₀)" value={S0} onChange={setS0} step={0.0001} />
          <InputField label="Starting Depth (y₀)" value={y0} onChange={setY0} unit={labels.length} min={0.01} />
        </div>

        {result.error ? (
          <div className="error-banner bg-red-50 text-red-700 p-4 rounded-[6px]">{result.error}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ResultCard label="Normal Depth" value={result.yn} unit={labels.length} />
              <ResultCard label="Critical Depth" value={result.yc} unit={labels.length} />
              <ResultCard label="Slope Class" value={result.slope || 'N/A'} />
              <ResultCard label="Profile Type" value={result.profile || 'N/A'} highlight />
            </div>

            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => setView3D(false)} className={`px-3 py-1 rounded-[6px] border ${!view3D ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-bg)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>2D</button>
              <button onClick={() => setView3D(true)} className={`px-3 py-1 rounded-[6px] border ${view3D ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-bg)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}>3D</button>
            </div>

            {view3D ? (
              <LongitudinalProfile3D steps={result.steps} S0={S0} yn={result.yn} yc={result.yc} lengthUnit={labels.length} channelWidth={b} />
            ) : (
              <WaterSurfaceProfile steps={result.steps} yn={result.yn} yc={result.yc} S0={S0} lengthUnit={labels.length} />
            )}

            <SmartWarnings warnings={getFlowWarnings({ y: y0, yc: result.yc, n, S0 })} />
          </>
        )}

        <StepByStepPanel steps={getStepsForShape('ch6-profiles', 'rectangular')} inputs={{ b, Q, n, S0, y0, g, k: getManningK(units) }} />
      </div>

      <NotesPanel calculatorId="ch6-profiles" />

      <div className="flex gap-2">
        <ExportButton targetId="ch6-profiles-export" filename="water-surface-profile" />
        <CSVExportButton
          headers={['Station (x)', 'Depth (y)', 'Velocity (V)', 'Energy (E)', 'Sf']}
          data={result.steps.map(s => [
            s.x.toFixed(2),
            s.y.toFixed(4),
            s.v.toFixed(4),
            s.E.toFixed(4),
            s.Sf.toFixed(6),
          ])}
          filename="water-surface-profile"
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
          calculatorTitle="Water Surface Profiles"
          inputs={[
            { label: 'Bottom Width (b)', value: String(b), unit: labels.length },
            { label: 'Discharge (Q)', value: String(Q), unit: labels.discharge },
            { label: "Manning's n", value: String(n), unit: '' },
            { label: 'Bed Slope (S0)', value: String(S0), unit: '' },
            { label: 'Starting Depth (y0)', value: String(y0), unit: labels.length },
          ]}
          results={[
            { label: 'Normal Depth', value: result.yn.toFixed(4), unit: labels.length },
            { label: 'Critical Depth', value: result.yc.toFixed(4), unit: labels.length },
            { label: 'Slope Class', value: result.slope || 'N/A', unit: '—' },
            { label: 'Profile Type', value: result.profile || 'N/A', unit: '—' },
          ]}
          chartElementId="ch6-profiles-export"
        />
      )}

      {shareOpen && (
        <ShareCardDialog
          onClose={() => setShareOpen(false)}
          data={{
            calculatorName: 'Water Surface Profiles',
            results: [
              { label: 'Profile Type', value: result.profile || 'N/A' },
              { label: 'Slope Class', value: result.slope || 'N/A' },
            ],
          }}
        />
      )}
    </div>
  );
}
