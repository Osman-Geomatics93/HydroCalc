import { useMemo } from 'react';
import { useUnits } from '../../../context/UnitContext';
import { bottomStep, widthConstriction } from '../../../lib/energy/obstructions';
import { InputField, ResultCard, SelectField, FormulaDisplay, ExportButton, CopyLinkButton } from '../../shared';
import { CSVExportButton } from '../../shared/CSVExportButton';
import { StepByStepPanel } from '../../shared/StepByStepPanel';
import { PresetSelector } from '../../shared/PresetSelector';
import { getStepsForShape } from '../../../constants/steps';
import { EYDiagram } from '../../charts/EYDiagram';
import { useUrlState } from '../../../hooks/useUrlState';
import type { ChannelParams } from '../../../types';

const typeOptions = [
  { value: 'step', label: 'Bottom Step (Δz)' },
  { value: 'constriction', label: 'Width Constriction' },
];

export default function ObstructionsCalc() {
  const { labels, g } = useUnits();
  const [type, setType] = useUrlState('type', 'step');
  const [b, setB] = useUrlState('b', 5);
  const [y1, setY1] = useUrlState('y1', 2);
  const [Q, setQ] = useUrlState('Q', 10);
  const [dz, setDz] = useUrlState('dz', 0.3);
  const [b2, setB2] = useUrlState('b2', 3);

  const params: ChannelParams = useMemo(() => ({ shape: 'rectangular', b }), [b]);

  const result = useMemo(() => {
    try {
      if (type === 'step') {
        return bottomStep(y1, Q, g, dz, params);
      } else {
        return widthConstriction(y1, Q, g, b, b2);
      }
    } catch {
      return null;
    }
  }, [type, y1, Q, g, dz, b, b2, params]);

  const handlePreset = (values: Record<string, number | string>) => {
    if (values.type !== undefined) setType(String(values.type));
    if (values.b !== undefined) setB(Number(values.b));
    if (values.y1 !== undefined) setY1(Number(values.y1));
    if (values.Q !== undefined) setQ(Number(values.Q));
    if (values.dz !== undefined) setDz(Number(values.dz));
    if (values.b2 !== undefined) setB2(Number(values.b2));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Chapter 2</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Channel Obstructions</h1>
      </div>

      <FormulaDisplay
        latex={type === 'step'
          ? 'E_2 = E_1 - \\Delta z'
          : 'E_1 = E_2, \\quad q_2 = \\frac{Q}{b_2}'}
      />

      <PresetSelector calculatorId="ch2-obstructions" onSelect={handlePreset} />

      <div id="ch2-obstructions-export" className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 bg-[var(--color-surface)] p-4 sm:p-6 rounded-[6px] border border-[var(--color-border)]">
          <SelectField label="Obstruction Type" value={type} onChange={setType} options={typeOptions} />
          <InputField label="Channel Width (b)" value={b} onChange={setB} unit={labels.length} min={0.1} />
          <InputField label="Upstream Depth (y₁)" value={y1} onChange={setY1} unit={labels.length} min={0.01} />
          <InputField label="Discharge (Q)" value={Q} onChange={setQ} unit={labels.discharge} min={0.01} />
          {type === 'step' && (
            <InputField label="Step Height (Δz)" value={dz} onChange={setDz} unit={labels.length} step={0.05} />
          )}
          {type === 'constriction' && (
            <InputField label="Contracted Width (b₂)" value={b2} onChange={setB2} unit={labels.length} min={0.1} />
          )}
        </div>

        {result ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <ResultCard label="Upstream Energy (E₁)" value={result.E1} unit={labels.length} />
              <ResultCard label="Downstream Energy (E₂)" value={result.E2} unit={labels.length} />
              <ResultCard label="Downstream Depth (y₂)" value={result.y2} unit={labels.length} highlight />
              <ResultCard label="Critical Depth (yc)" value={result.yc} unit={labels.length} />
              <ResultCard label="Critical Energy (Ec)" value={result.Ec} unit={labels.length} />
              <ResultCard
                label="Choke Status"
                value={result.choked ? 'CHOKED' : 'Not choked'}
              />
            </div>

            <EYDiagram Q={Q} g={g} params={params} currentY={y1} lengthUnit={labels.length} />
          </>
        ) : (
          <div className="error-banner bg-red-50 text-red-700 p-4 rounded-[6px]">Could not compute result</div>
        )}

        <StepByStepPanel
          steps={getStepsForShape(type === 'step' ? 'ch2-obstructions-step' : 'ch2-obstructions-constriction', 'rectangular')}
          inputs={{ b, y1, Q, g, dz, b2 }}
        />
      </div>

      <div className="flex gap-2">
        <ExportButton targetId="ch2-obstructions-export" filename="obstructions" />
        <CSVExportButton
          headers={['Parameter', 'Value', 'Unit']}
          data={[
            ['Upstream Energy (E1)', result ? result.E1.toFixed(4) : 'N/A', labels.length],
            ['Downstream Energy (E2)', result ? result.E2.toFixed(4) : 'N/A', labels.length],
            ['Downstream Depth (y2)', result ? result.y2.toFixed(4) : 'N/A', labels.length],
            ['Choke Status', result ? (result.choked ? 'CHOKED' : 'Not choked') : 'N/A', '—'],
          ]}
          filename="obstructions"
        />
        <CopyLinkButton />
      </div>
    </div>
  );
}
