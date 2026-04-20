import { useMemo, useState } from 'react';
import { FileText, Share2 } from 'lucide-react';
import { useUnits } from '../../../context/UnitContext';
import { computeGeometry } from '../../../lib/geometry';
import { froudeNumber, classifyFlow } from '../../../lib/energy/froude';
import { InputField, ResultCard, SelectField, FormulaDisplay, ExportButton, CopyLinkButton } from '../../shared';
import { CSVExportButton } from '../../shared/CSVExportButton';
import { StepByStepPanel } from '../../shared/StepByStepPanel';
import { PresetSelector } from '../../shared/PresetSelector';
import { SmartWarnings } from '../../shared/SmartWarnings';
import { NotesPanel } from '../../shared/NotesPanel';
import { ReportDialog } from '../../shared/ReportDialog';
import { ShareCardDialog } from '../../shared/ShareCardDialog';
import { getStepsForShape } from '../../../constants/steps';
import { getFlowWarnings } from '../../../utils/flow-warnings';
import { useUrlState } from '../../../hooks/useUrlState';
import type { ChannelShape } from '../../../types';

const shapeOptions = [
  { value: 'rectangular', label: 'Rectangular' },
  { value: 'trapezoidal', label: 'Trapezoidal' },
  { value: 'triangular', label: 'Triangular' },
  { value: 'circular', label: 'Circular' },
];

export default function FroudeNumberCalc() {
  const { labels, g } = useUnits();
  const [shape, setShape] = useUrlState('shape', 'rectangular');
  const [b, setB] = useUrlState('b', 5);
  const [m, setM] = useUrlState('m', 1.5);
  const [d, setD] = useUrlState('d', 2);
  const [y, setY] = useUrlState('y', 1);
  const [Q, setQ] = useUrlState('Q', 10);

  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const geo = useMemo(() => computeGeometry({ shape: shape as ChannelShape, b, m, d }, y), [shape, b, m, d, y]);
  const V = geo.A > 0 ? Q / geo.A : 0;
  const Fr = froudeNumber(V, g, geo.D);
  const regime = classifyFlow(Fr);
  const warnings = useMemo(() => getFlowWarnings({ Fr, y }), [Fr, y]);

  const handlePreset = (values: Record<string, number | string>) => {
    if (values.shape !== undefined) setShape(String(values.shape));
    if (values.b !== undefined) setB(Number(values.b));
    if (values.m !== undefined) setM(Number(values.m));
    if (values.d !== undefined) setD(Number(values.d));
    if (values.y !== undefined) setY(Number(values.y));
    if (values.Q !== undefined) setQ(Number(values.Q));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Chapter 1</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Froude Number</h1>
      </div>

      <FormulaDisplay latex="Fr = \\frac{V}{\\sqrt{g D_h}} \\quad \\text{where } D_h = \\frac{A}{T}" />

      <PresetSelector calculatorId="ch1-froude" onSelect={handlePreset} />

      <div id="ch1-froude-export" className="space-y-6">
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
          <InputField label="Flow Depth (y)" value={y} onChange={setY} unit={labels.length} min={0.01} />
          <InputField label="Discharge (Q)" value={Q} onChange={setQ} unit={labels.discharge} min={0} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ResultCard label="Velocity (V)" value={V} unit={labels.velocity} />
          <ResultCard label="Hydraulic Depth (D)" value={geo.D} unit={labels.length} />
          <ResultCard label="Froude Number" value={Fr} highlight />
          <ResultCard
            label="Flow Regime"
            value={regime.charAt(0).toUpperCase() + regime.slice(1)}
          />
        </div>

        <SmartWarnings warnings={warnings} />

        <StepByStepPanel steps={getStepsForShape('ch1-froude', shape)} inputs={{ b, m, d, y, Q, g }} />
      </div>

      <NotesPanel calculatorId="ch1-froude" />

      <div className="flex gap-2">
        <ExportButton targetId="ch1-froude-export" filename="froude-number" />
        <CSVExportButton
          headers={['Parameter', 'Value', 'Unit']}
          data={[
            ['Velocity', V.toFixed(4), labels.velocity],
            ['Hydraulic Depth', geo.D.toFixed(4), labels.length],
            ['Froude Number', Fr.toFixed(4), '—'],
            ['Flow Regime', regime.charAt(0).toUpperCase() + regime.slice(1), '—'],
          ]}
          filename="froude-number"
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
          calculatorTitle="Froude Number"
          inputs={[
            { label: 'Shape', value: shape, unit: '' },
            { label: 'Flow Depth (y)', value: String(y), unit: labels.length },
            { label: 'Discharge (Q)', value: String(Q), unit: labels.discharge },
          ]}
          results={[
            { label: 'Velocity', value: V.toFixed(4), unit: labels.velocity },
            { label: 'Froude Number', value: Fr.toFixed(4), unit: '—' },
            { label: 'Flow Regime', value: regime.charAt(0).toUpperCase() + regime.slice(1), unit: '—' },
          ]}
          chartElementId="ch1-froude-export"
        />
      )}

      {shareOpen && (
        <ShareCardDialog
          onClose={() => setShareOpen(false)}
          data={{
            calculatorName: 'Froude Number',
            results: [
              { label: 'Froude Number', value: Fr.toFixed(4) },
              { label: 'Flow Regime', value: regime.charAt(0).toUpperCase() + regime.slice(1) },
            ],
          }}
        />
      )}
    </div>
  );
}
