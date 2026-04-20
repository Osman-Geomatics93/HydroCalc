import { useMemo, useCallback, useState } from 'react';
import { useUnits } from '../../../context/UnitContext';
import { normalDepth } from '../../../lib/friction/normal-depth';
import { criticalDepth } from '../../../lib/energy/critical-depth';
import { classifySlope } from '../../../lib/friction/classification';
import { InputField, ResultCard, SelectField, FormulaDisplay, ExportButton, CopyLinkButton } from '../../shared';
import { CSVExportButton } from '../../shared/CSVExportButton';
import { StepByStepPanel } from '../../shared/StepByStepPanel';
import { PresetSelector } from '../../shared/PresetSelector';
import { SmartWarnings } from '../../shared/SmartWarnings';
import { ParameterSweep } from '../../shared/ParameterSweep';
import { ManningGallery } from '../../shared/ManningGallery';
import { NotesPanel } from '../../shared/NotesPanel';
import { ReportDialog } from '../../shared/ReportDialog';
import { ShareCardDialog } from '../../shared/ShareCardDialog';
import { getStepsForShape } from '../../../constants/steps';
import { getManningK } from '../../../constants/physics';
import { getFlowWarnings } from '../../../utils/flow-warnings';
import { useUrlState } from '../../../hooks/useUrlState';
import { Palette, FileText, Share2 } from 'lucide-react';
import type { ChannelShape, ChannelParams } from '../../../types';

const shapeOptions = [
  { value: 'rectangular', label: 'Rectangular' },
  { value: 'trapezoidal', label: 'Trapezoidal' },
  { value: 'triangular', label: 'Triangular' },
  { value: 'circular', label: 'Circular' },
];

export default function NormalDepthCalc() {
  const { units, labels, g } = useUnits();
  const [shape, setShape] = useUrlState('shape', 'rectangular');
  const [b, setB] = useUrlState('b', 5);
  const [m, setM] = useUrlState('m', 1.5);
  const [d, setD] = useUrlState('d', 2);
  const [Q, setQ] = useUrlState('Q', 10);
  const [n, setN] = useUrlState('n', 0.013);
  const [S0, setS0] = useUrlState('S0', 0.001);

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const params: ChannelParams = useMemo(() => ({ shape: shape as ChannelShape, b, m, d }), [shape, b, m, d]);

  const result = useMemo(() => {
    try {
      const nd = normalDepth(Q, n, S0, params, units);
      const yc = criticalDepth(Q, g, params);
      const slope = classifySlope(S0, nd.yn, yc);
      return { ...nd, yc, slope, error: null };
    } catch {
      return { yn: 0, Vn: 0, An: 0, Rn: 0, yc: 0, slope: 'Unknown' as const, error: 'Could not find normal depth' };
    }
  }, [Q, n, S0, params, units, g]);

  const handlePreset = (values: Record<string, number | string>) => {
    if (values.shape !== undefined) setShape(String(values.shape));
    if (values.b !== undefined) setB(Number(values.b));
    if (values.m !== undefined) setM(Number(values.m));
    if (values.d !== undefined) setD(Number(values.d));
    if (values.Q !== undefined) setQ(Number(values.Q));
    if (values.n !== undefined) setN(Number(values.n));
    if (values.S0 !== undefined) setS0(Number(values.S0));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Chapter 4</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Normal Depth</h1>
      </div>

      <FormulaDisplay latex="Q = \\frac{k}{n} A R^{2/3} S_0^{1/2} \\quad \\Rightarrow \\quad \\text{solve for } y_n" />

      <PresetSelector calculatorId="ch4-normal" onSelect={handlePreset} />

      <div id="ch4-normal-export" className="space-y-6">
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
          <div className="flex flex-col">
            <InputField label="Manning's n" value={n} onChange={setN} step={0.001} min={0.001} />
            <button onClick={() => setGalleryOpen(true)} className="text-xs text-[var(--color-accent)] hover:underline mt-1 flex items-center gap-1 self-start">
              <Palette className="w-3 h-3" /> Browse Materials
            </button>
          </div>
          <InputField label="Bed Slope (S₀)" value={S0} onChange={setS0} step={0.0001} min={0} />
        </div>

        {result.error ? (
          <div className="error-banner bg-red-50 text-red-700 p-4 rounded-[6px]">{result.error}</div>
        ) : (
          <>
          <SmartWarnings warnings={getFlowWarnings({ y: result.yn, yc: result.yc, n, S0 })} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ResultCard label="Normal Depth (yn)" value={result.yn} unit={labels.length} highlight />
            <ResultCard label="Normal Velocity (Vn)" value={result.Vn} unit={labels.velocity} />
            <ResultCard label="Flow Area (An)" value={result.An} unit={labels.area} />
            <ResultCard label="Hydraulic Radius (Rn)" value={result.Rn} unit={labels.length} />
            <ResultCard label="Critical Depth (yc)" value={result.yc} unit={labels.length} />
            <ResultCard label="Slope Class" value={result.slope} />
          </div>
          </>
        )}

        <ParameterSweep
          paramDefs={[
            { key: 'Q', label: 'Discharge', min: 1, max: 50, default: Q },
            { key: 'n', label: "Manning's n", min: 0.01, max: 0.06, default: n },
            { key: 'S0', label: 'Bed Slope', min: 0.0001, max: 0.01, default: S0 },
          ]}
          baseInputs={{ shape, b, m, d, Q, n, S0 }}
          calcFn={(inputs) => {
            try {
              const p: ChannelParams = { shape: inputs.shape as ChannelShape, b: +inputs.b, m: +inputs.m, d: +inputs.d };
              const nd = normalDepth(+inputs.Q, +inputs.n, +inputs.S0, p, units);
              return { yn: nd.yn, Vn: nd.Vn };
            } catch { return { yn: 0, Vn: 0 }; }
          }}
          outputLabels={{ yn: 'Normal Depth', Vn: 'Normal Velocity' }}
        />

        <StepByStepPanel steps={getStepsForShape('ch4-normal', shape)} inputs={{ b, m, d, Q, n, S0, g, k: getManningK(units) }} />
      </div>

      <NotesPanel calculatorId="ch4-normal-depth" />

      {galleryOpen && <ManningGallery onSelect={(nv) => setN(nv)} onClose={() => setGalleryOpen(false)} />}

      <div className="flex gap-2">
        <ExportButton targetId="ch4-normal-export" filename="normal-depth" />
        <CSVExportButton
          headers={['Parameter', 'Value', 'Unit']}
          data={[
            ['Normal Depth (yn)', result.yn.toFixed(4), labels.length],
            ['Normal Velocity (Vn)', result.Vn.toFixed(4), labels.velocity],
            ['Flow Area (An)', result.An.toFixed(4), labels.area],
            ['Hydraulic Radius (Rn)', result.Rn.toFixed(4), labels.length],
            ['Critical Depth (yc)', result.yc.toFixed(4), labels.length],
            ['Slope Class', result.slope, '—'],
          ]}
          filename="normal-depth"
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
          calculatorTitle="Normal Depth"
          inputs={[
            { label: 'Shape', value: shape, unit: '' },
            { label: 'Discharge (Q)', value: String(Q), unit: labels.discharge },
            { label: "Manning's n", value: String(n), unit: '' },
            { label: 'Bed Slope (S0)', value: String(S0), unit: '' },
          ]}
          results={[
            { label: 'Normal Depth (yn)', value: result.yn.toFixed(4), unit: labels.length },
            { label: 'Normal Velocity (Vn)', value: result.Vn.toFixed(4), unit: labels.velocity },
            { label: 'Critical Depth (yc)', value: result.yc.toFixed(4), unit: labels.length },
            { label: 'Slope Class', value: result.slope, unit: '—' },
          ]}
          chartElementId="ch4-normal-export"
        />
      )}

      {shareOpen && (
        <ShareCardDialog
          onClose={() => setShareOpen(false)}
          data={{
            calculatorName: 'Normal Depth',
            results: [
              { label: 'Normal Depth (yn)', value: `${result.yn.toFixed(4)} ${labels.length}` },
              { label: 'Slope Class', value: result.slope },
            ],
          }}
        />
      )}
    </div>
  );
}
