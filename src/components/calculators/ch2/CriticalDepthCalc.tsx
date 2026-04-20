import { useMemo, useState } from 'react';
import { FileText, Share2 } from 'lucide-react';
import { useUnits } from '../../../context/UnitContext';
import { criticalFlowResult } from '../../../lib/energy/critical-depth';
import { InputField, ResultCard, SelectField, FormulaDisplay, ExportButton, CopyLinkButton } from '../../shared';
import { CSVExportButton } from '../../shared/CSVExportButton';
import { StepByStepPanel } from '../../shared/StepByStepPanel';
import { PresetSelector } from '../../shared/PresetSelector';
import { NotesPanel } from '../../shared/NotesPanel';
import { ReportDialog } from '../../shared/ReportDialog';
import { ShareCardDialog } from '../../shared/ShareCardDialog';
import { getStepsForShape } from '../../../constants/steps';
import { EYDiagram } from '../../charts/EYDiagram';
import { useUrlState } from '../../../hooks/useUrlState';
import type { ChannelShape, ChannelParams } from '../../../types';

const shapeOptions = [
  { value: 'rectangular', label: 'Rectangular' },
  { value: 'trapezoidal', label: 'Trapezoidal' },
  { value: 'triangular', label: 'Triangular' },
  { value: 'circular', label: 'Circular' },
];

export default function CriticalDepthCalc() {
  const { labels, g } = useUnits();
  const [shape, setShape] = useUrlState('shape', 'rectangular');
  const [b, setB] = useUrlState('b', 5);
  const [m, setM] = useUrlState('m', 1.5);
  const [d, setD] = useUrlState('d', 2);
  const [Q, setQ] = useUrlState('Q', 10);

  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const params: ChannelParams = useMemo(() => ({ shape: shape as ChannelShape, b, m, d }), [shape, b, m, d]);

  const crit = useMemo(() => {
    try {
      return criticalFlowResult(Q, g, params);
    } catch {
      return { yc: 0, Vc: 0, Ec: 0, Ac: 0 };
    }
  }, [Q, g, params]);

  const handlePreset = (values: Record<string, number | string>) => {
    if (values.shape !== undefined) setShape(String(values.shape));
    if (values.b !== undefined) setB(Number(values.b));
    if (values.m !== undefined) setM(Number(values.m));
    if (values.d !== undefined) setD(Number(values.d));
    if (values.Q !== undefined) setQ(Number(values.Q));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Chapter 2</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Critical Depth</h1>
      </div>

      <FormulaDisplay latex="\\frac{Q^2 T}{g A^3} = 1 \\quad \\Rightarrow \\quad y_c = \\left(\\frac{q^2}{g}\\right)^{1/3} \\text{ (rectangular)}" />

      <PresetSelector calculatorId="ch2-critical" onSelect={handlePreset} />

      <div id="ch2-critical-export" className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[var(--color-surface)] p-6 rounded-[6px] border border-[var(--color-border)]">
          <SelectField label="Channel Shape" value={shape} onChange={(v) => setShape(v)} options={shapeOptions} />
          {(shape === 'rectangular' || shape === 'trapezoidal') && (
            <InputField label="Bottom Width (b)" value={b} onChange={setB} unit={labels.length} min={0.1} />
          )}
          {(shape === 'trapezoidal' || shape === 'triangular') && (
            <InputField label="Side Slope (m)" value={m} onChange={setM} unit="H:V" min={0} />
          )}
          {shape === 'circular' && (
            <InputField label="Diameter (d)" value={d} onChange={setD} unit={labels.length} min={0.1} />
          )}
          <InputField label="Discharge (Q)" value={Q} onChange={setQ} unit={labels.discharge} min={0.01} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ResultCard label="Critical Depth (yc)" value={crit.yc} unit={labels.length} highlight />
          <ResultCard label="Critical Velocity (Vc)" value={crit.Vc} unit={labels.velocity} />
          <ResultCard label="Critical Energy (Ec)" value={crit.Ec} unit={labels.length} />
          <ResultCard label="Critical Area (Ac)" value={crit.Ac} unit={labels.area} />
        </div>

        <EYDiagram Q={Q} g={g} params={params} lengthUnit={labels.length} yMax={crit.yc * 3} />

        <StepByStepPanel steps={getStepsForShape('ch2-critical', shape)} inputs={{ b, m, d, Q, g }} />
      </div>

      <NotesPanel calculatorId="ch2-critical" />

      <div className="flex gap-2">
        <ExportButton targetId="ch2-critical-export" filename="critical-depth" />
        <CSVExportButton
          headers={['Parameter', 'Value', 'Unit']}
          data={[
            ['Critical Depth', crit.yc.toFixed(4), labels.length],
            ['Critical Velocity', crit.Vc.toFixed(4), labels.velocity],
            ['Critical Energy', crit.Ec.toFixed(4), labels.length],
            ['Critical Area', crit.Ac.toFixed(4), labels.area],
          ]}
          filename="critical-depth"
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
          calculatorTitle="Critical Depth"
          inputs={[
            { label: 'Shape', value: shape, unit: '' },
            { label: 'Discharge (Q)', value: String(Q), unit: labels.discharge },
          ]}
          results={[
            { label: 'Critical Depth', value: crit.yc.toFixed(4), unit: labels.length },
            { label: 'Critical Velocity', value: crit.Vc.toFixed(4), unit: labels.velocity },
            { label: 'Critical Energy', value: crit.Ec.toFixed(4), unit: labels.length },
            { label: 'Critical Area', value: crit.Ac.toFixed(4), unit: labels.area },
          ]}
          chartElementId="ch2-critical-export"
        />
      )}

      {shareOpen && (
        <ShareCardDialog
          onClose={() => setShareOpen(false)}
          data={{
            calculatorName: 'Critical Depth',
            results: [
              { label: 'Critical Depth (yc)', value: `${crit.yc.toFixed(4)} ${labels.length}` },
              { label: 'Critical Energy (Ec)', value: `${crit.Ec.toFixed(4)} ${labels.length}` },
            ],
          }}
        />
      )}
    </div>
  );
}
