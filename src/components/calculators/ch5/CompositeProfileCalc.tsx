import { useMemo, useState } from 'react';
import { FileText, Share2 } from 'lucide-react';
import { useUnits } from '../../../context/UnitContext';
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
import { useUrlState } from '../../../hooks/useUrlState';
import type { ChannelParams } from '../../../types';

export default function CompositeProfileCalc() {
  const { units, labels, g } = useUnits();
  const [b, setB] = useUrlState('b', 5);
  const [Q, setQ] = useUrlState('Q', 10);
  const [n, setN] = useUrlState('n', 0.013);
  const [S0, setS0] = useUrlState('S0', 0.001);
  const [y, setY] = useUrlState('y', 2.5);

  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const params: ChannelParams = { shape: 'rectangular', b };

  const result = useMemo(() => {
    try {
      const nd = normalDepth(Q, n, S0, params, units);
      const yc = criticalDepth(Q, g, params);
      const slope = classifySlope(S0, nd.yn, yc);
      const profile = determineProfile(slope, y, nd.yn, yc);
      return { yn: nd.yn, yc, slope, profile, error: null };
    } catch {
      return { yn: 0, yc: 0, slope: null, profile: null, error: 'Computation error' };
    }
  }, [Q, n, S0, b, y, units, g]);

  const handlePreset = (values: Record<string, number | string>) => {
    if (values.b !== undefined) setB(Number(values.b));
    if (values.Q !== undefined) setQ(Number(values.Q));
    if (values.n !== undefined) setN(Number(values.n));
    if (values.S0 !== undefined) setS0(Number(values.S0));
    if (values.y !== undefined) setY(Number(values.y));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Chapter 5</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Composite Profiles</h1>
      </div>

      <FormulaDisplay latex="\\text{Given } S_0, Q, n, \\text{shape} \\Rightarrow y_n, y_c \\Rightarrow \\text{Profile Type}" />

      <PresetSelector calculatorId="ch5-composite" onSelect={handlePreset} />

      <div id="ch5-composite-export" className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-[var(--color-surface)] p-6 rounded-[6px] border border-[var(--color-border)]">
          <InputField label="Bottom Width (b)" value={b} onChange={setB} unit={labels.length} min={0.1} />
          <InputField label="Discharge (Q)" value={Q} onChange={setQ} unit={labels.discharge} min={0.01} />
          <InputField label="Manning's n" value={n} onChange={setN} step={0.001} min={0.001} />
          <InputField label="Bed Slope (S₀)" value={S0} onChange={setS0} step={0.0001} />
          <InputField label="Local Depth (y)" value={y} onChange={setY} unit={labels.length} min={0.01} />
        </div>

        {result.error ? (
          <div className="error-banner bg-red-50 text-red-700 p-4 rounded-[6px]">{result.error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <ResultCard label="Normal Depth (yn)" value={result.yn} unit={labels.length} />
              <ResultCard label="Critical Depth (yc)" value={result.yc} unit={labels.length} />
              <ResultCard label="Slope Class" value={result.slope || 'N/A'} />
              <ResultCard label="Profile Type" value={result.profile || 'N/A'} highlight />
            </div>

            <SmartWarnings warnings={getFlowWarnings({ y, yc: result.yc, n, S0 })} />
          </>
        )}

        <StepByStepPanel steps={getStepsForShape('ch5-composite', 'rectangular')} inputs={{ b, Q, n, S0, y, g, k: getManningK(units) }} />
      </div>

      <NotesPanel calculatorId="ch5-composite" />

      <div className="flex gap-2">
        <ExportButton targetId="ch5-composite-export" filename="composite-profile" />
        <CSVExportButton
          headers={['Parameter', 'Value', 'Unit']}
          data={[
            ['Normal Depth (yn)', result.yn.toFixed(4), labels.length],
            ['Critical Depth (yc)', result.yc.toFixed(4), labels.length],
            ['Slope Class', result.slope || 'N/A', '—'],
            ['Profile Type', result.profile || 'N/A', '—'],
          ]}
          filename="composite-profile"
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
          calculatorTitle="Composite Profiles"
          inputs={[
            { label: 'Bottom Width (b)', value: String(b), unit: labels.length },
            { label: 'Discharge (Q)', value: String(Q), unit: labels.discharge },
            { label: "Manning's n", value: String(n), unit: '' },
            { label: 'Bed Slope (S0)', value: String(S0), unit: '' },
            { label: 'Local Depth (y)', value: String(y), unit: labels.length },
          ]}
          results={[
            { label: 'Normal Depth (yn)', value: result.yn.toFixed(4), unit: labels.length },
            { label: 'Critical Depth (yc)', value: result.yc.toFixed(4), unit: labels.length },
            { label: 'Slope Class', value: result.slope || 'N/A', unit: '—' },
            { label: 'Profile Type', value: result.profile || 'N/A', unit: '—' },
          ]}
          chartElementId="ch5-composite-export"
        />
      )}

      {shareOpen && (
        <ShareCardDialog
          onClose={() => setShareOpen(false)}
          data={{
            calculatorName: 'Composite Profiles',
            results: [
              { label: 'Slope Class', value: result.slope || 'N/A' },
              { label: 'Profile Type', value: result.profile || 'N/A' },
            ],
          }}
        />
      )}
    </div>
  );
}
