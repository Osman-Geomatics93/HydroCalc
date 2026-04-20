import { useMemo } from 'react';
import { useUnits } from '../../../context/UnitContext';
import { normalDepth } from '../../../lib/friction/normal-depth';
import { criticalDepth } from '../../../lib/energy/critical-depth';
import { classifySlope, criticalSlope } from '../../../lib/friction/classification';
import { computeGeometry } from '../../../lib/geometry';
import { getManningK } from '../../../constants/physics';
import { InputField, ResultCard, SelectField, FormulaDisplay, ExportButton, CopyLinkButton } from '../../shared';
import { CSVExportButton } from '../../shared/CSVExportButton';
import { StepByStepPanel } from '../../shared/StepByStepPanel';
import { PresetSelector } from '../../shared/PresetSelector';
import { getStepsForShape } from '../../../constants/steps';
import { useUrlState } from '../../../hooks/useUrlState';
import type { ChannelShape, ChannelParams } from '../../../types';

const shapeOptions = [
  { value: 'rectangular', label: 'Rectangular' },
  { value: 'trapezoidal', label: 'Trapezoidal' },
  { value: 'triangular', label: 'Triangular' },
];

export default function ReachClassificationCalc() {
  const { units, labels, g } = useUnits();
  const [shape, setShape] = useUrlState('shape', 'rectangular');
  const [b, setB] = useUrlState('b', 5);
  const [m, setM] = useUrlState('m', 1.5);
  const [Q, setQ] = useUrlState('Q', 10);
  const [n, setN] = useUrlState('n', 0.013);
  const [S0, setS0] = useUrlState('S0', 0.001);

  const params: ChannelParams = useMemo(() => ({ shape: shape as ChannelShape, b, m }), [shape, b, m]);

  const result = useMemo(() => {
    try {
      const nd = normalDepth(Q, n, S0, params, units);
      const yc = criticalDepth(Q, g, params);
      const geoC = computeGeometry(params, yc);
      const k = getManningK(units);
      const Sc = criticalSlope(Q, n, geoC.A, geoC.R, k);
      const slope = classifySlope(S0, nd.yn, yc);
      return { yn: nd.yn, yc, Sc, slope, error: null };
    } catch {
      return { yn: 0, yc: 0, Sc: 0, slope: 'Unknown', error: 'Computation error' };
    }
  }, [Q, n, S0, params, units, g]);

  const handlePreset = (values: Record<string, number | string>) => {
    if (values.shape !== undefined) setShape(String(values.shape));
    if (values.b !== undefined) setB(Number(values.b));
    if (values.m !== undefined) setM(Number(values.m));
    if (values.Q !== undefined) setQ(Number(values.Q));
    if (values.n !== undefined) setN(Number(values.n));
    if (values.S0 !== undefined) setS0(Number(values.S0));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Chapter 4</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Reach Classification</h1>
      </div>

      <FormulaDisplay latex="\\text{Mild: } y_n > y_c, \\quad \\text{Steep: } y_n < y_c, \\quad \\text{Critical: } y_n = y_c" />

      <PresetSelector calculatorId="ch4-classification" onSelect={handlePreset} />

      <div id="ch4-class-export" className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-[var(--color-surface)] p-6 rounded-[6px] border border-[var(--color-border)]">
          <SelectField label="Channel Shape" value={shape} onChange={(v) => setShape(v)} options={shapeOptions} />
          {(shape === 'rectangular' || shape === 'trapezoidal') && (
            <InputField label="Bottom Width (b)" value={b} onChange={setB} unit={labels.length} min={0.1} />
          )}
          {(shape === 'trapezoidal' || shape === 'triangular') && (
            <InputField label="Side Slope (m)" value={m} onChange={setM} unit="H:V" min={0} />
          )}
          <InputField label="Discharge (Q)" value={Q} onChange={setQ} unit={labels.discharge} min={0.01} />
          <InputField label="Manning's n" value={n} onChange={setN} step={0.001} min={0.001} />
          <InputField label="Bed Slope (S₀)" value={S0} onChange={setS0} step={0.0001} />
        </div>

        {result.error ? (
          <div className="error-banner bg-red-50 text-red-700 p-4 rounded-[6px]">{result.error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <ResultCard label="Normal Depth (yn)" value={result.yn} unit={labels.length} />
            <ResultCard label="Critical Depth (yc)" value={result.yc} unit={labels.length} />
            <ResultCard label="Critical Slope (Sc)" value={result.Sc} />
            <ResultCard label="Classification" value={result.slope} highlight />
          </div>
        )}

        <StepByStepPanel steps={getStepsForShape('ch4-classification', shape)} inputs={{ b, m, Q, n, S0, g, k: getManningK(units) }} />
      </div>

      <div className="flex gap-2">
        <ExportButton targetId="ch4-class-export" filename="reach-classification" />
        <CSVExportButton
          headers={['Parameter', 'Value', 'Unit']}
          data={[
            ['Normal Depth (yn)', result.yn.toFixed(4), labels.length],
            ['Critical Depth (yc)', result.yc.toFixed(4), labels.length],
            ['Critical Slope (Sc)', result.Sc.toFixed(6), '—'],
            ['Classification', String(result.slope), '—'],
          ]}
          filename="reach-classification"
        />
        <CopyLinkButton />
      </div>
    </div>
  );
}
