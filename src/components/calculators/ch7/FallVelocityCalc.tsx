import { useMemo } from 'react';
import { useUnits } from '../../../context/UnitContext';
import { stokesVelocity, rubeyVelocity, particleReynolds } from '../../../lib/sediment/fall-velocity';
import { WATER_VISCOSITY } from '../../../constants/physics';
import { InputField, ResultCard, FormulaDisplay, ExportButton, CopyLinkButton } from '../../shared';
import { CSVExportButton } from '../../shared/CSVExportButton';
import { StepByStepPanel } from '../../shared/StepByStepPanel';
import { PresetSelector } from '../../shared/PresetSelector';
import { getStepsForShape } from '../../../constants/steps';
import { useUrlState } from '../../../hooks/useUrlState';

export default function FallVelocityCalc() {
  const { units, labels, g } = useUnits();
  const [d, setD] = useUrlState('d', 0.5);   // mm
  const [SG, setSG] = useUrlState('SG', 2.65);

  const nu = WATER_VISCOSITY[units];
  const dMeters = units === 'SI' ? d / 1000 : d / 304.8; // mm to m or ft

  const result = useMemo(() => {
    const wsStokes = stokesVelocity(dMeters, SG, g, nu);
    const wsRubey = rubeyVelocity(dMeters, SG, g, nu);
    const ReStokes = particleReynolds(wsStokes, dMeters, nu);
    const ReRubey = particleReynolds(wsRubey, dMeters, nu);
    return { wsStokes, wsRubey, ReStokes, ReRubey };
  }, [dMeters, SG, g, nu]);

  const handlePreset = (values: Record<string, number | string>) => {
    if (values.d !== undefined) setD(Number(values.d));
    if (values.SG !== undefined) setSG(Number(values.SG));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Chapter 7</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Fall Velocity</h1>
      </div>

      <FormulaDisplay latex="w_s = \\frac{(S_G - 1) g d^2}{18\\nu} \\quad \\text{(Stokes)}" />

      <PresetSelector calculatorId="ch7-fall" onSelect={handlePreset} />

      <div id="ch7-fall-export" className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-[var(--color-surface)] p-6 rounded-[6px] border border-[var(--color-border)]">
          <InputField label="Particle Diameter (d)" value={d} onChange={setD} unit="mm" min={0.001} step={0.1} />
          <InputField label="Specific Gravity (SG)" value={SG} onChange={setSG} min={1.01} step={0.01} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <ResultCard label="Stokes Velocity" value={result.wsStokes} unit={labels.velocity} />
          <ResultCard label="Rubey Velocity" value={result.wsRubey} unit={labels.velocity} highlight />
          <ResultCard label="Re (Stokes)" value={result.ReStokes} />
          <ResultCard label="Re (Rubey)" value={result.ReRubey} />
          <ResultCard label="Method" value={result.ReStokes < 1 ? 'Stokes valid' : 'Use Rubey'} />
        </div>

        <div className="bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-[6px] p-4 text-sm text-[var(--color-text-muted)]">
          <strong>Note:</strong> Stokes law is valid for Re &lt; 1 (very fine particles).
          For coarser particles, Rubey's formula provides better accuracy.
        </div>

        <StepByStepPanel steps={getStepsForShape('ch7-fall', 'rectangular')} inputs={{ d, SG, g, nu }} />
      </div>

      <div className="flex gap-2">
        <ExportButton targetId="ch7-fall-export" filename="fall-velocity" />
        <CSVExportButton
          headers={['Parameter', 'Value', 'Unit']}
          data={[
            ['Stokes Velocity', result.wsStokes.toFixed(6), labels.velocity],
            ['Rubey Velocity', result.wsRubey.toFixed(6), labels.velocity],
            ['Re (Stokes)', result.ReStokes.toFixed(4), '—'],
            ['Re (Rubey)', result.ReRubey.toFixed(4), '—'],
            ['Method', result.ReStokes < 1 ? 'Stokes valid' : 'Use Rubey', '—'],
          ]}
          filename="fall-velocity"
        />
        <CopyLinkButton />
      </div>
    </div>
  );
}
