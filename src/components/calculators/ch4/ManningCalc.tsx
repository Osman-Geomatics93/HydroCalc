import { useMemo, useCallback, useState } from 'react';
import { useUnits } from '../../../context/UnitContext';
import { computeGeometry } from '../../../lib/geometry';
import { manningVelocity, manningDischarge } from '../../../lib/friction/manning';
import { froudeFromQ } from '../../../lib/energy/froude';
import { MANNING_TABLE } from '../../../constants/manning';
import { MANNING_K } from '../../../constants/physics';
import { InputField, ResultCard, SelectField, FormulaDisplay, ExportButton, CopyLinkButton } from '../../shared';
import { PresetSelector } from '../../shared/PresetSelector';
import { CSVExportButton } from '../../shared/CSVExportButton';
import { StepByStepPanel } from '../../shared/StepByStepPanel';
import { MonteCarloPanel } from '../../shared/MonteCarloPanel';
import { SmartWarnings } from '../../shared/SmartWarnings';
import { ParameterSweep } from '../../shared/ParameterSweep';
import { ManningGallery } from '../../shared/ManningGallery';
import { NotesPanel } from '../../shared/NotesPanel';
import { ReportDialog } from '../../shared/ReportDialog';
import { ShareCardDialog } from '../../shared/ShareCardDialog';
import { NaturalLanguageInput } from '../../shared/NaturalLanguageInput';
import { FlowAnimation } from '../../charts/FlowAnimation';
import { useUrlState } from '../../../hooks/useUrlState';
import { getStepsForShape } from '../../../constants/steps';
import { getFlowWarnings } from '../../../utils/flow-warnings';
import { Palette, Play, FileText, Share2 } from 'lucide-react';
import type { ChannelShape, ChannelParams } from '../../../types';

const shapeOptions = [
  { value: 'rectangular', label: 'Rectangular' },
  { value: 'trapezoidal', label: 'Trapezoidal' },
  { value: 'triangular', label: 'Triangular' },
  { value: 'circular', label: 'Circular' },
];

export default function ManningCalc() {
  const { units, labels } = useUnits();
  const [shape, setShape] = useUrlState('shape', 'rectangular');
  const [b, setB] = useUrlState('b', 5);
  const [m, setM] = useUrlState('m', 1.5);
  const [d, setD] = useUrlState('d', 2);
  const [y, setY] = useUrlState('y', 1.5);
  const [n, setN] = useUrlState('n', 0.013);
  const [Sf, setSf] = useUrlState('Sf', 0.001);

  const k = MANNING_K[units];
  const params: ChannelParams = useMemo(() => ({ shape: shape as ChannelShape, b, m, d }), [shape, b, m, d]);
  const geo = computeGeometry(params, y);
  const V = manningVelocity(n, geo.R, Sf, units);
  const Q = manningDischarge(n, geo.A, geo.R, Sf, units);
  const Fr = useMemo(() => geo.A > 0 ? froudeFromQ(Q, units === 'SI' ? 9.81 : 32.2, geo) : 0, [Q, units, geo]);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const warnings = useMemo(() => getFlowWarnings({ Fr, y, n, S0: Sf }), [Fr, y, n, Sf]);

  const sweepCalcFn = useCallback((inputs: Record<string, number | string>) => {
    const p: ChannelParams = { shape: inputs.shape as ChannelShape, b: +inputs.b, m: +inputs.m, d: +inputs.d };
    const g = computeGeometry(p, +inputs.y);
    const v = manningVelocity(+inputs.n, g.R, +inputs.Sf, units);
    const q = manningDischarge(+inputs.n, g.A, g.R, +inputs.Sf, units);
    return { V: v, Q: q };
  }, [units]);

  const handleNLFill = useCallback((values: Record<string, number>) => {
    if (values.b !== undefined) setB(values.b);
    if (values.y !== undefined) setY(values.y);
    if (values.n !== undefined) setN(values.n);
    if (values.Sf !== undefined) setSf(values.Sf);
    if (values.S0 !== undefined) setSf(values.S0);
    if (values.m !== undefined) setM(values.m);
  }, [setB, setY, setN, setSf, setM]);

  const handlePreset = (values: Record<string, number | string>) => {
    if (values.shape !== undefined) setShape(String(values.shape));
    if (values.b !== undefined) setB(Number(values.b));
    if (values.m !== undefined) setM(Number(values.m));
    if (values.d !== undefined) setD(Number(values.d));
    if (values.y !== undefined) setY(Number(values.y));
    if (values.n !== undefined) setN(Number(values.n));
    if (values.Sf !== undefined) setSf(Number(values.Sf));
  };

  const csvHeaders = ['Parameter', 'Value', 'Unit'];
  const csvData = [
    ['Velocity', V.toFixed(4), labels.velocity],
    ['Discharge', Q.toFixed(4), labels.discharge],
    ['Flow Area', geo.A.toFixed(4), labels.area],
    ['Hydraulic Radius', geo.R.toFixed(4), labels.length],
  ];

  // Monte Carlo calc function for discharge
  const mcCalcFn = useCallback((p: Record<string, number>) => {
    const A = p.b * p.y;
    const P = p.b + 2 * p.y;
    const R = A / P;
    return (k / p.n) * A * Math.pow(R, 2 / 3) * Math.sqrt(p.Sf);
  }, [k]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Chapter 4</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Manning's Equation</h1>
      </div>

      <NaturalLanguageInput onFill={handleNLFill} onShapeChange={(s) => setShape(s)} />

      <FormulaDisplay latex="V = \\frac{k}{n} R^{2/3} S_f^{1/2}, \\qquad Q = VA" />

      <PresetSelector calculatorId="ch4-manning" onSelect={handlePreset} />

      <div id="ch4-manning-export" className="space-y-6">
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
          <div className="flex flex-col">
            <InputField label="Manning's n" value={n} onChange={setN} step={0.001} min={0.001} glossaryTerm="manning-n" />
            <button onClick={() => setGalleryOpen(true)} className="text-xs text-[var(--color-accent)] hover:underline mt-1 flex items-center gap-1 self-start">
              <Palette className="w-3 h-3" /> Browse Materials
            </button>
          </div>
          <InputField label="Friction Slope (Sf)" value={Sf} onChange={setSf} step={0.0001} min={0} glossaryTerm="friction-slope" />
        </div>

        <div data-tutorial="results" className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ResultCard label="Velocity (V)" value={V} unit={labels.velocity} highlight />
          <ResultCard label="Discharge (Q)" value={Q} unit={labels.discharge} highlight />
          <ResultCard label="Flow Area (A)" value={geo.A} unit={labels.area} />
          <ResultCard label="Hydraulic Radius (R)" value={geo.R} unit={labels.length} />
        </div>

        <SmartWarnings warnings={warnings} />

        {/* Flow Animation */}
        <div className="flex justify-end">
          <button onClick={() => setShowAnimation(!showAnimation)} className="flex items-center gap-1 text-xs text-[var(--color-accent)] hover:opacity-80 no-print">
            <Play className="w-3 h-3" /> {showAnimation ? 'Hide' : 'Show'} Flow Animation
          </button>
        </div>
        {showAnimation && <FlowAnimation shape={shape as ChannelShape} b={b} m={m} d={d} y={y} V={V} />}

        {/* Manning's n reference table */}
        <div className="bg-[var(--color-surface)] rounded-[6px] border border-[var(--color-border)] overflow-hidden">
          <h3 className="px-4 py-2 bg-[var(--color-bg-alt)] font-semibold text-sm border-b border-[var(--color-border)]">Manning's n Reference</h3>
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[var(--color-bg-alt)]">
                <tr className="border-b">
                  <th className="px-4 py-1.5 text-left">Material</th>
                  <th className="px-4 py-1.5 text-right">Min</th>
                  <th className="px-4 py-1.5 text-right">Typical</th>
                  <th className="px-4 py-1.5 text-right">Max</th>
                </tr>
              </thead>
              <tbody>
                {MANNING_TABLE.map((row) => (
                  <tr
                    key={row.material}
                    className="border-b hover:bg-[var(--color-accent-bg)] cursor-pointer"
                    onClick={() => setN(row.nTypical)}
                  >
                    <td className="px-4 py-1">{row.material}</td>
                    <td className="px-4 py-1 text-right">{row.nMin}</td>
                    <td className="px-4 py-1 text-right font-medium">{row.nTypical}</td>
                    <td className="px-4 py-1 text-right">{row.nMax}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <ParameterSweep
          paramDefs={[
            { key: 'y', label: 'Flow Depth', min: 0.1, max: 5, default: y },
            { key: 'n', label: "Manning's n", min: 0.01, max: 0.06, default: n },
            { key: 'Sf', label: 'Friction Slope', min: 0.0001, max: 0.01, default: Sf },
          ]}
          baseInputs={{ shape, b, m, d, y, n, Sf }}
          calcFn={sweepCalcFn}
          outputLabels={{ V: 'Velocity', Q: 'Discharge' }}
        />

        <StepByStepPanel steps={getStepsForShape('ch4-manning', shape)} inputs={{ b, m, d, y, n, Sf, k }} />

        {shape === 'rectangular' && (
          <MonteCarloPanel
            calcFn={mcCalcFn}
            outputLabel="Discharge Q"
            outputUnit={labels.discharge}
            paramConfigs={[
              { label: "Manning's n", key: 'n', baseValue: n, uncertaintyPct: 15 },
              { label: 'Slope Sf', key: 'Sf', baseValue: Sf, uncertaintyPct: 10 },
              { label: 'Depth y', key: 'y', baseValue: y, uncertaintyPct: 5 },
            ]}
            baseParams={{ b, y, n, Sf }}
          />
        )}
      </div>

      <div data-tutorial="export-buttons" className="flex gap-2">
        <ExportButton targetId="ch4-manning-export" filename="manning-equation" />
        <CSVExportButton headers={csvHeaders} data={csvData} filename="manning-equation" />
        <CopyLinkButton />
        <button onClick={() => setReportOpen(true)} className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-[6px] hover:bg-[var(--color-bg-alt)] flex items-center gap-1" title="Generate PDF Report">
          <FileText className="w-4 h-4" />
        </button>
        <button onClick={() => setShareOpen(true)} className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-[6px] hover:bg-[var(--color-bg-alt)] flex items-center gap-1" title="Share as Image">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      <NotesPanel calculatorId="ch4-manning" />

      {galleryOpen && <ManningGallery onSelect={(nv) => setN(nv)} onClose={() => setGalleryOpen(false)} />}

      {reportOpen && (
        <ReportDialog
          onClose={() => setReportOpen(false)}
          calculatorTitle="Manning's Equation"
          inputs={[
            { label: 'Shape', value: shape, unit: '' },
            { label: 'Flow Depth (y)', value: String(y), unit: labels.length },
            { label: "Manning's n", value: String(n), unit: '' },
            { label: 'Friction Slope (Sf)', value: String(Sf), unit: '' },
          ]}
          results={csvData.map(([l, v, u]) => ({ label: l, value: v, unit: u }))}
          chartElementId="ch4-manning-export"
        />
      )}

      {shareOpen && (
        <ShareCardDialog
          onClose={() => setShareOpen(false)}
          data={{
            calculatorName: "Manning's Equation",
            results: [
              { label: 'Velocity', value: `${V.toFixed(4)} ${labels.velocity}` },
              { label: 'Discharge', value: `${Q.toFixed(4)} ${labels.discharge}` },
            ],
          }}
        />
      )}
    </div>
  );
}
