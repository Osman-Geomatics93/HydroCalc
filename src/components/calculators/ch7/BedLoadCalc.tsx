import { useMemo, useCallback } from 'react';
import { useUnits } from '../../../context/UnitContext';
import { flowIntensity, transportIntensity, bedLoadRate, totalBedLoad } from '../../../lib/sediment/einstein-brown';
import { WATER_SPECIFIC_WEIGHT } from '../../../constants/physics';
import { InputField, ResultCard, FormulaDisplay, ExportButton, CopyLinkButton } from '../../shared';
import { PresetSelector } from '../../shared/PresetSelector';
import { CSVExportButton } from '../../shared/CSVExportButton';
import { StepByStepPanel } from '../../shared/StepByStepPanel';
import { MonteCarloPanel } from '../../shared/MonteCarloPanel';
import { useUrlState } from '../../../hooks/useUrlState';
import { getStepsForShape } from '../../../constants/steps';

export default function BedLoadCalc() {
  const { units, labels, g } = useUnits();
  const [d, setD] = useUrlState('d', 1);      // mm
  const [SG, setSG] = useUrlState('SG', 2.65);
  const [R, setR] = useUrlState('R', 0.5);
  const [Sf, setSf] = useUrlState('Sf', 0.002);
  const [b, setB] = useUrlState('b', 5);

  const gammaW = WATER_SPECIFIC_WEIGHT[units];
  const gammaS = SG * gammaW;
  const dUnits = units === 'SI' ? d / 1000 : d / 304.8;

  const result = useMemo(() => {
    const psi = flowIntensity(gammaS, gammaW, dUnits, R, Sf);
    const phi = transportIntensity(psi);
    const qs = bedLoadRate(phi, dUnits, SG, g);
    const Qs = totalBedLoad(qs, b);
    return { psi, phi, qs, Qs };
  }, [d, SG, R, Sf, b, units, g]);

  const volUnit = units === 'SI' ? 'm\u00b3/s/m' : 'ft\u00b3/s/ft';
  const totalUnit = units === 'SI' ? 'm\u00b3/s' : 'ft\u00b3/s';

  const handlePreset = (values: Record<string, number | string>) => {
    if (values.d !== undefined) setD(Number(values.d));
    if (values.SG !== undefined) setSG(Number(values.SG));
    if (values.R !== undefined) setR(Number(values.R));
    if (values.Sf !== undefined) setSf(Number(values.Sf));
    if (values.b !== undefined) setB(Number(values.b));
  };

  const csvHeaders = ['Parameter', 'Value', 'Unit'];
  const csvData = [
    ['Flow Intensity', result.psi.toFixed(4), ''],
    ['Transport Intensity', result.phi.toFixed(6), ''],
    ['Unit Bed Load', result.qs.toFixed(8), volUnit],
    ['Total Bed Load', result.Qs.toFixed(8), totalUnit],
  ];

  // Monte Carlo calc function
  const mcCalcFn = useCallback((p: Record<string, number>) => {
    const dU = units === 'SI' ? p.d / 1000 : p.d / 304.8;
    const gS = p.SG * gammaW;
    const psi = ((gS - gammaW) * dU) / (gammaW * p.R * p.Sf);
    const phi = psi > 0 ? 40 / (psi * psi * psi) : 0;
    const qs = phi * Math.sqrt((p.SG - 1) * g * dU * dU * dU);
    return qs * p.b;
  }, [units, gammaW, g]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Chapter 7</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Bed Load Transport</h1>
      </div>

      <FormulaDisplay latex="\\Phi = 40 \\left(\\frac{1}{\\Psi}\\right)^3, \\qquad \\Psi = \\frac{(\\gamma_s - \\gamma_w)d}{\\gamma_w R S_f}" />

      <PresetSelector calculatorId="ch7-bedload" onSelect={handlePreset} />

      <div id="ch7-bedload-export" className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-[var(--color-surface)] p-6 rounded-[6px] border border-[var(--color-border)]">
          <InputField label="Particle Diameter" value={d} onChange={setD} unit="mm" min={0.01} step={0.1} glossaryTerm="bed-load" />
          <InputField label="Specific Gravity" value={SG} onChange={setSG} min={1.01} step={0.01} glossaryTerm="specific-gravity" />
          <InputField label="Hydraulic Radius (R)" value={R} onChange={setR} unit={labels.length} min={0.01} glossaryTerm="hydraulic-radius" />
          <InputField label="Friction Slope (Sf)" value={Sf} onChange={setSf} step={0.0001} min={0} glossaryTerm="friction-slope" />
          <InputField label="Channel Width (b)" value={b} onChange={setB} unit={labels.length} min={0.1} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <ResultCard label="Flow Intensity (\u03A8)" value={result.psi} />
          <ResultCard label="Transport Intensity (\u03A6)" value={result.phi} />
          <ResultCard label="Unit Bed Load (qs)" value={result.qs} unit={volUnit} highlight />
          <ResultCard label="Total Bed Load (Qs)" value={result.Qs} unit={totalUnit} highlight />
        </div>

        <StepByStepPanel
          steps={getStepsForShape('ch7-bedload', 'rectangular')}
          inputs={{ SG, gammaW, d: dUnits, R, Sf }}
        />

        <MonteCarloPanel
          calcFn={mcCalcFn}
          outputLabel="Total Bed Load"
          outputUnit={totalUnit}
          paramConfigs={[
            { label: 'Diameter (mm)', key: 'd', baseValue: d, uncertaintyPct: 20 },
            { label: 'Hydraulic Radius', key: 'R', baseValue: R, uncertaintyPct: 10 },
            { label: 'Friction Slope', key: 'Sf', baseValue: Sf, uncertaintyPct: 15 },
          ]}
          baseParams={{ d, SG, R, Sf, b }}
        />
      </div>

      <div className="flex gap-2">
        <ExportButton targetId="ch7-bedload-export" filename="bed-load-transport" />
        <CSVExportButton headers={csvHeaders} data={csvData} filename="bed-load-transport" />
        <CopyLinkButton />
      </div>
    </div>
  );
}
