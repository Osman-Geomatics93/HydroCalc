import { useMemo, useState } from 'react';
import { FileText, Share2 } from 'lucide-react';
import { useUnits } from '../../../context/UnitContext';
import {
  shieldsParameter,
  criticalShieldsParameter,
  criticalShearStress,
  bedShearStress,
  isMotion,
} from '../../../lib/sediment/shields';
import { WATER_SPECIFIC_WEIGHT, WATER_VISCOSITY, WATER_DENSITY } from '../../../constants/physics';
import { InputField, ResultCard, FormulaDisplay, ExportButton, CopyLinkButton } from '../../shared';
import { CSVExportButton } from '../../shared/CSVExportButton';
import { StepByStepPanel } from '../../shared/StepByStepPanel';
import { PresetSelector } from '../../shared/PresetSelector';
import { SmartWarnings } from '../../shared/SmartWarnings';
import { NotesPanel } from '../../shared/NotesPanel';
import { ReportDialog } from '../../shared/ReportDialog';
import { ShareCardDialog } from '../../shared/ShareCardDialog';
import { getStepsForShape } from '../../../constants/steps';
import { getFlowWarnings } from '../../../utils/flow-warnings';
import { ShieldsDiagram } from '../../charts/ShieldsDiagram';
import { useUrlState } from '../../../hooks/useUrlState';

export default function ShieldsCalc() {
  const { units, labels } = useUnits();
  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [d, setD] = useUrlState('d', 1);     // mm
  const [SG, setSG] = useUrlState('SG', 2.65);
  const [R, setR] = useUrlState('R', 0.5);   // hydraulic radius
  const [Sf, setSf] = useUrlState('Sf', 0.002);

  const gammaW = WATER_SPECIFIC_WEIGHT[units];
  const gammaS = SG * gammaW;
  const nu = WATER_VISCOSITY[units];
  const rho = WATER_DENSITY[units];
  const dUnits = units === 'SI' ? d / 1000 : d / 304.8;

  const result = useMemo(() => {
    const tau0 = bedShearStress(gammaW, R, Sf);
    const tauStar = shieldsParameter(tau0, gammaS, gammaW, dUnits);
    const uStar = Math.sqrt(tau0 / rho);
    const reStar = (uStar * dUnits) / nu;
    const tauStarCr = criticalShieldsParameter(reStar);
    const tauCr = criticalShearStress(tauStarCr, gammaS, gammaW, dUnits);
    const motion = isMotion(tau0, tauCr);

    return { tau0, tauStar, uStar, reStar, tauStarCr, tauCr, motion };
  }, [gammaS, gammaW, dUnits, rho, nu, R, Sf]);

  const handlePreset = (values: Record<string, number | string>) => {
    if (values.d !== undefined) setD(Number(values.d));
    if (values.SG !== undefined) setSG(Number(values.SG));
    if (values.R !== undefined) setR(Number(values.R));
    if (values.Sf !== undefined) setSf(Number(values.Sf));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Chapter 7</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Shields Diagram</h1>
      </div>

      <FormulaDisplay latex="\\tau^* = \\frac{\\tau_0}{(\\gamma_s - \\gamma_w)d}, \\qquad \\tau_0 = \\gamma_w R S_f" />

      <PresetSelector calculatorId="ch7-shields" onSelect={handlePreset} />

      <div id="ch7-shields-export" className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 bg-[var(--color-surface)] p-4 sm:p-6 rounded-[6px] border border-[var(--color-border)]">
          <InputField label="Particle Diameter" value={d} onChange={setD} unit="mm" min={0.01} step={0.1} />
          <InputField label="Specific Gravity" value={SG} onChange={setSG} min={1.01} step={0.01} />
          <InputField label="Hydraulic Radius (R)" value={R} onChange={setR} unit={labels.length} min={0.01} />
          <InputField label="Friction Slope (Sf)" value={Sf} onChange={setSf} step={0.0001} min={0} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <ResultCard label="Bed Shear (τ₀)" value={result.tau0} unit={units === 'SI' ? 'N/m²' : 'lb/ft²'} />
          <ResultCard label="Shields Parameter (τ*)" value={result.tauStar} />
          <ResultCard label="Critical τ*" value={result.tauStarCr} />
          <ResultCard label="Critical Shear (τcr)" value={result.tauCr} unit={units === 'SI' ? 'N/m²' : 'lb/ft²'} />
          <ResultCard label="Boundary Re*" value={result.reStar} />
          <ResultCard label="Shear Velocity (u*)" value={result.uStar} unit={labels.velocity} />
          <ResultCard
            label="Sediment Motion"
            value={result.motion ? 'MOTION' : 'No Motion'}
            highlight
          />
        </div>

        <SmartWarnings warnings={getFlowWarnings({ tau0: result.tau0, tauCr: result.tauCr, reStar: result.reStar })} />

        <ShieldsDiagram
          point={{ reStar: result.reStar, tauStar: result.tauStar }}
          criticalTauStar={result.tauStarCr}
        />

        <StepByStepPanel steps={getStepsForShape('ch7-shields', 'rectangular')} inputs={{ gammaW, SG, R, Sf, rho, nu, dUnits }} />
      </div>

      <NotesPanel calculatorId="ch7-shields" />

      <div className="flex gap-2">
        <ExportButton targetId="ch7-shields-export" filename="shields-diagram" />
        <CSVExportButton
          headers={['Parameter', 'Value', 'Unit']}
          data={[
            ['Bed Shear (τ0)', result.tau0.toFixed(4), units === 'SI' ? 'N/m²' : 'lb/ft²'],
            ['Shields Parameter (τ*)', result.tauStar.toFixed(6), '—'],
            ['Critical τ*', result.tauStarCr.toFixed(6), '—'],
            ['Critical Shear (τcr)', result.tauCr.toFixed(4), units === 'SI' ? 'N/m²' : 'lb/ft²'],
            ['Boundary Re*', result.reStar.toFixed(2), '—'],
            ['Shear Velocity (u*)', result.uStar.toFixed(6), labels.velocity],
            ['Sediment Motion', result.motion ? 'MOTION' : 'No Motion', '—'],
          ]}
          filename="shields-diagram"
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
          calculatorTitle="Shields Diagram"
          inputs={[
            { label: 'Particle Diameter', value: String(d), unit: 'mm' },
            { label: 'Specific Gravity', value: String(SG), unit: '' },
            { label: 'Hydraulic Radius (R)', value: String(R), unit: labels.length },
            { label: 'Friction Slope (Sf)', value: String(Sf), unit: '' },
          ]}
          results={[
            { label: 'Bed Shear (τ0)', value: result.tau0.toFixed(4), unit: units === 'SI' ? 'N/m²' : 'lb/ft²' },
            { label: 'Shields Parameter (τ*)', value: result.tauStar.toFixed(6), unit: '—' },
            { label: 'Critical τ*', value: result.tauStarCr.toFixed(6), unit: '—' },
            { label: 'Sediment Motion', value: result.motion ? 'MOTION' : 'No Motion', unit: '—' },
          ]}
          chartElementId="ch7-shields-export"
        />
      )}

      {shareOpen && (
        <ShareCardDialog
          onClose={() => setShareOpen(false)}
          data={{
            calculatorName: 'Shields Diagram',
            results: [
              { label: 'Shields Parameter (τ*)', value: result.tauStar.toFixed(6) },
              { label: 'Sediment Motion', value: result.motion ? 'MOTION' : 'No Motion' },
            ],
          }}
        />
      )}
    </div>
  );
}
