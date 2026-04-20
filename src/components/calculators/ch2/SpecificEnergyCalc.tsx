import { useMemo, useCallback, useState } from 'react';
import { useUnits } from '../../../context/UnitContext';
import { specificEnergy } from '../../../lib/energy/specific-energy';
import { criticalFlowResult } from '../../../lib/energy/critical-depth';
import { froudeFromQ } from '../../../lib/energy/froude';
import { computeGeometry } from '../../../lib/geometry';
import { InputField, ResultCard, SelectField, FormulaDisplay, ExportButton, CopyLinkButton } from '../../shared';
import { PresetSelector } from '../../shared/PresetSelector';
import { CSVExportButton } from '../../shared/CSVExportButton';
import { StepByStepPanel } from '../../shared/StepByStepPanel';
import { SmartWarnings } from '../../shared/SmartWarnings';
import { ParameterSweep } from '../../shared/ParameterSweep';
import { NotesPanel } from '../../shared/NotesPanel';
import { ReportDialog } from '../../shared/ReportDialog';
import { ShareCardDialog } from '../../shared/ShareCardDialog';
import { NaturalLanguageInput } from '../../shared/NaturalLanguageInput';
import { EYDiagram } from '../../charts/EYDiagram';
import { useUrlState } from '../../../hooks/useUrlState';
import { getStepsForShape } from '../../../constants/steps';
import { getFlowWarnings } from '../../../utils/flow-warnings';
import { FileText, Share2 } from 'lucide-react';
import type { ChannelShape, ChannelParams } from '../../../types';

const shapeOptions = [
  { value: 'rectangular', label: 'Rectangular' },
  { value: 'trapezoidal', label: 'Trapezoidal' },
  { value: 'triangular', label: 'Triangular' },
  { value: 'circular', label: 'Circular' },
];

export default function SpecificEnergyCalc() {
  const { labels, g } = useUnits();
  const [shape, setShape] = useUrlState('shape', 'rectangular');
  const [b, setB] = useUrlState('b', 5);
  const [m, setM] = useUrlState('m', 1.5);
  const [d, setD] = useUrlState('d', 2);
  const [y, setY] = useUrlState('y', 2);
  const [Q, setQ] = useUrlState('Q', 10);

  const params: ChannelParams = useMemo(() => ({ shape: shape as ChannelShape, b, m, d }), [shape, b, m, d]);

  const result = useMemo(() => {
    try {
      const E = specificEnergy(y, Q, g, params);
      const geo = computeGeometry(params, y);
      const Fr = froudeFromQ(Q, g, geo);
      const crit = criticalFlowResult(Q, g, params);
      const V = geo.A > 0 ? Q / geo.A : 0;
      return { E, Fr, crit, V, error: null };
    } catch {
      return { E: 0, Fr: 0, crit: { yc: 0, Vc: 0, Ec: 0, Ac: 0 }, V: 0, error: 'Could not compute results' };
    }
  }, [y, Q, g, params]);

  const { E, Fr, crit, V } = result;
  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const warnings = useMemo(() => getFlowWarnings({ Fr, y, yc: crit.yc }), [Fr, y, crit.yc]);

  const sweepCalcFn = useCallback((inputs: Record<string, number | string>) => {
    const p: ChannelParams = { shape: inputs.shape as ChannelShape, b: +inputs.b, m: +inputs.m, d: +inputs.d };
    const Ev = specificEnergy(+inputs.y, +inputs.Q, g, p);
    const geo = computeGeometry(p, +inputs.y);
    const Frv = froudeFromQ(+inputs.Q, g, geo);
    return { E: Ev, Fr: Frv };
  }, [g]);

  const handleNLFill = useCallback((values: Record<string, number>) => {
    if (values.b !== undefined) setB(values.b);
    if (values.y !== undefined) setY(values.y);
    if (values.Q !== undefined) setQ(values.Q);
    if (values.m !== undefined) setM(values.m);
    if (values.d !== undefined) setD(values.d);
  }, [setB, setY, setQ, setM, setD]);

  const handlePreset = (values: Record<string, number | string>) => {
    if (values.shape !== undefined) setShape(String(values.shape));
    if (values.b !== undefined) setB(Number(values.b));
    if (values.m !== undefined) setM(Number(values.m));
    if (values.d !== undefined) setD(Number(values.d));
    if (values.y !== undefined) setY(Number(values.y));
    if (values.Q !== undefined) setQ(Number(values.Q));
  };

  const csvHeaders = ['Parameter', 'Value', 'Unit'];
  const csvData = [
    ['Specific Energy', E.toFixed(4), labels.length],
    ['Froude Number', Fr.toFixed(4), ''],
    ['Critical Depth', crit.yc.toFixed(4), labels.length],
    ['Critical Energy', crit.Ec.toFixed(4), labels.length],
    ['Flow Regime', Fr < 0.99 ? 'Subcritical' : Fr > 1.01 ? 'Supercritical' : 'Critical', ''],
    ['Velocity', V.toFixed(4), labels.velocity],
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Chapter 2</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Specific Energy</h1>
      </div>

      <NaturalLanguageInput onFill={handleNLFill} onShapeChange={(s) => setShape(s)} />

      <FormulaDisplay latex="E = y + \\frac{Q^2}{2gA^2}" />

      <PresetSelector calculatorId="ch2-energy" onSelect={handlePreset} />

      <div id="ch2-energy-export" className="space-y-6">
        <div data-tutorial="inputs" className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[var(--color-surface)] p-6 rounded-[6px] border border-[var(--color-border)]">
          <SelectField label="Channel Shape" value={shape} onChange={(v) => setShape(v)} options={shapeOptions} />
          {(shape === 'rectangular' || shape === 'trapezoidal') && (
            <InputField label="Bottom Width (b)" value={b} onChange={setB} unit={labels.length} min={0.1} />
          )}
          {(shape === 'trapezoidal' || shape === 'triangular') && (
            <InputField label="Side Slope (m)" value={m} onChange={setM} unit="H:V" min={0} glossaryTerm="side-slope" />
          )}
          {shape === 'circular' && (
            <InputField label="Diameter (d)" value={d} onChange={setD} unit={labels.length} min={0.1} />
          )}
          <InputField label="Flow Depth (y)" value={y} onChange={setY} unit={labels.length} min={0.01} />
          <InputField label="Discharge (Q)" value={Q} onChange={setQ} unit={labels.discharge} min={0} glossaryTerm="discharge" />
        </div>

        <div data-tutorial="results" className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ResultCard label="Specific Energy (E)" value={E} unit={labels.length} highlight />
          <ResultCard label="Froude Number" value={Fr} />
          <ResultCard label="Critical Depth (yc)" value={crit.yc} unit={labels.length} />
          <ResultCard label="Critical Energy (Ec)" value={crit.Ec} unit={labels.length} />
          <ResultCard label="Flow Regime" value={Fr < 0.99 ? 'Subcritical' : Fr > 1.01 ? 'Supercritical' : 'Critical'} />
          <ResultCard label="Velocity" value={V} unit={labels.velocity} />
        </div>

        <SmartWarnings warnings={warnings} />

        <EYDiagram Q={Q} g={g} params={params} currentY={y} lengthUnit={labels.length} onDepthSelect={(yv) => setY(yv)} />

        <ParameterSweep
          paramDefs={[
            { key: 'y', label: 'Flow Depth', min: 0.1, max: 5, default: y },
            { key: 'Q', label: 'Discharge', min: 1, max: 50, default: Q },
          ]}
          baseInputs={{ shape, b, m, d, y, Q }}
          calcFn={sweepCalcFn}
          outputLabels={{ E: 'Specific Energy', Fr: 'Froude Number' }}
        />

        <StepByStepPanel steps={getStepsForShape('ch2-energy', shape)} inputs={{ b, m, d, y, Q, g }} />
      </div>

      <div data-tutorial="export-buttons" className="flex gap-2 flex-wrap">
        <ExportButton targetId="ch2-energy-export" filename="specific-energy" />
        <CSVExportButton headers={csvHeaders} data={csvData} filename="specific-energy" />
        <CopyLinkButton />
        <button onClick={() => setReportOpen(true)} className="border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] p-1.5 rounded-[6px] transition-[border-color,color] duration-200 text-[var(--color-text-muted)] no-print" title="Generate PDF Report">
          <FileText className="w-4 h-4" />
        </button>
        <button onClick={() => setShareOpen(true)} className="border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] p-1.5 rounded-[6px] transition-[border-color,color] duration-200 text-[var(--color-text-muted)] no-print" title="Share as Image">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      <NotesPanel calculatorId="ch2-energy" />

      {reportOpen && (
        <ReportDialog
          onClose={() => setReportOpen(false)}
          calculatorTitle="Specific Energy"
          inputs={[
            { label: 'Shape', value: shape, unit: '' },
            { label: 'Bottom Width (b)', value: String(b), unit: labels.length },
            { label: 'Flow Depth (y)', value: String(y), unit: labels.length },
            { label: 'Discharge (Q)', value: String(Q), unit: labels.discharge },
          ]}
          results={csvData.map(([l, v, u]) => ({ label: l, value: v, unit: u }))}
          chartElementId="ch2-energy-export"
        />
      )}

      {shareOpen && (
        <ShareCardDialog
          onClose={() => setShareOpen(false)}
          data={{
            calculatorName: 'Specific Energy',
            results: [
              { label: 'Specific Energy', value: `${E.toFixed(3)} ${labels.length}` },
              { label: 'Froude Number', value: Fr.toFixed(3) },
              { label: 'Flow Regime', value: Fr < 0.99 ? 'Subcritical' : Fr > 1.01 ? 'Supercritical' : 'Critical' },
              { label: 'Velocity', value: `${V.toFixed(3)} ${labels.velocity}` },
            ],
          }}
        />
      )}
    </div>
  );
}
