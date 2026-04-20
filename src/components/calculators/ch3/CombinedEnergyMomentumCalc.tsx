import { useMemo, useState } from 'react';
import { FileText, Share2 } from 'lucide-react';
import { useUnits } from '../../../context/UnitContext';
import { specificEnergy, generateEYCurve } from '../../../lib/energy/specific-energy';
import { momentumFunction, generateMYCurve } from '../../../lib/momentum/momentum-function';
import { criticalFlowResult } from '../../../lib/energy/critical-depth';
import { hydraulicJump } from '../../../lib/momentum/conjugate-depths';
import { alternateDepths } from '../../../lib/energy/alternate-depths';
import { InputField, ResultCard, FormulaDisplay, ExportButton, CopyLinkButton } from '../../shared';
import { CSVExportButton } from '../../shared/CSVExportButton';
import { StepByStepPanel } from '../../shared/StepByStepPanel';
import { PresetSelector } from '../../shared/PresetSelector';
import { getStepsForShape } from '../../../constants/steps';
import { PlotWrapper } from '../../charts/PlotWrapper';
import { useUrlState } from '../../../hooks/useUrlState';
import { useTheme } from '../../../context/ThemeContext';
import { NotesPanel } from '../../shared/NotesPanel';
import { ReportDialog } from '../../shared/ReportDialog';
import { ShareCardDialog } from '../../shared/ShareCardDialog';
import type { ChannelParams } from '../../../types';

export default function CombinedEnergyMomentumCalc() {
  const { labels, g } = useUnits();
  const { isDark } = useTheme();
  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [b, setB] = useUrlState('b', 5);
  const [y, setY] = useUrlState('y', 0.3);
  const [Q, setQ] = useUrlState('Q', 5);

  const params: ChannelParams = useMemo(() => ({ shape: 'rectangular' as const, b }), [b]);

  const result = useMemo(() => {
    try {
      const E = specificEnergy(y, Q, g, params);
      const M = momentumFunction(y, Q, g, params);
      const crit = criticalFlowResult(Q, g, params);
      const jump = hydraulicJump(y, Q, g, params);
      const alt = alternateDepths(y, Q, g, params);
      return { E, M, crit, jump, alt, error: null };
    } catch {
      return { E: 0, M: 0, crit: null, jump: null, alt: null, error: 'Computation error' };
    }
  }, [y, Q, g, params]);

  const yMax = result.jump ? result.jump.y2 * 2 : 5;
  const eyCurve = generateEYCurve(Q, g, params, yMax);
  const myCurve = generateMYCurve(Q, g, params, yMax);

  const lineColor = isDark ? '#52b788' : '#2d6a4f';

  const handlePreset = (values: Record<string, number | string>) => {
    if (values.b !== undefined) setB(Number(values.b));
    if (values.y !== undefined) setY(Number(values.y));
    if (values.Q !== undefined) setQ(Number(values.Q));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Chapter 3</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Combined Energy-Momentum</h1>
      </div>

      <FormulaDisplay latex="E = y + \\frac{Q^2}{2gA^2}, \\qquad M = \\frac{Q^2}{gA} + \\bar{y}A" />

      <PresetSelector calculatorId="ch3-combined" onSelect={handlePreset} />

      <div id="ch3-combined-export" className="space-y-6">
        <div className="grid grid-cols-3 gap-4 bg-[var(--color-surface)] p-6 rounded-[6px] border border-[var(--color-border)]">
          <InputField label="Bottom Width (b)" value={b} onChange={setB} unit={labels.length} min={0.1} />
          <InputField label="Flow Depth (y)" value={y} onChange={setY} unit={labels.length} min={0.01} />
          <InputField label="Discharge (Q)" value={Q} onChange={setQ} unit={labels.discharge} min={0.01} />
        </div>

        {result.error ? (
          <div className="error-banner bg-red-50 text-red-700 p-4 rounded-[6px]">{result.error}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ResultCard label="Specific Energy" value={result.E} unit={labels.length} />
              <ResultCard label="Momentum Function" value={result.M} unit={`${labels.length}²`} />
              {result.alt && <ResultCard label="Alternate Depth (sub)" value={result.alt.sub} unit={labels.length} />}
              {result.alt && <ResultCard label="Alternate Depth (sup)" value={result.alt.sup} unit={labels.length} />}
              {result.jump && <ResultCard label="Conjugate Depth" value={result.jump.y2} unit={labels.length} highlight />}
              {result.jump && <ResultCard label="Energy Loss" value={result.jump.energyLoss} unit={labels.length} />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PlotWrapper
                data={[
                  { x: eyCurve.E, y: eyCurve.y, mode: 'lines', line: { color: lineColor, width: 2 }, name: 'E(y)' },
                  ...(result.crit ? [{ x: [result.crit.Ec], y: [result.crit.yc], mode: 'markers' as const, marker: { color: '#dc2626', size: 8, symbol: 'diamond' }, name: 'Critical' }] : []),
                ]}
                title="E-y Diagram"
                xLabel={`E (${labels.length})`}
                yLabel={`y (${labels.length})`}
                height={350}
                onClick={(e: any) => {
                  if (e.points?.[0]?.y > 0) setY(Math.round(e.points[0].y * 1000) / 1000);
                }}
              />
              <PlotWrapper
                data={[
                  { x: myCurve.M, y: myCurve.y, mode: 'lines', line: { color: lineColor, width: 2 }, name: 'M(y)' },
                  ...(result.crit ? [{
                    x: [momentumFunction(result.crit.yc, Q, g, params)],
                    y: [result.crit.yc],
                    mode: 'markers' as const,
                    marker: { color: '#dc2626', size: 8, symbol: 'diamond' },
                    name: 'Critical',
                  }] : []),
                ]}
                title="M-y Diagram"
                xLabel={`M (${labels.length}²)`}
                yLabel={`y (${labels.length})`}
                height={350}
                onClick={(e: any) => {
                  if (e.points?.[0]?.y > 0) setY(Math.round(e.points[0].y * 1000) / 1000);
                }}
              />
            </div>
            <p className="text-xs text-[var(--color-text-subtle)] text-center">Click on either diagram to set depth</p>
          </>
        )}

        <StepByStepPanel steps={getStepsForShape('ch3-combined', 'rectangular')} inputs={{ b, y, Q, g }} />
      </div>

      <NotesPanel calculatorId="ch3-combined" />

      <div className="flex gap-2">
        <ExportButton targetId="ch3-combined-export" filename="combined-em" />
        <CSVExportButton
          headers={['Parameter', 'Value', 'Unit']}
          data={[
            ['Specific Energy', result.E.toFixed(4), labels.length],
            ['Momentum Function', result.M.toFixed(4), `${labels.length}²`],
            ['Alternate Depth (sub)', result.alt ? result.alt.sub.toFixed(4) : 'N/A', labels.length],
            ['Alternate Depth (sup)', result.alt ? result.alt.sup.toFixed(4) : 'N/A', labels.length],
            ['Conjugate Depth', result.jump ? result.jump.y2.toFixed(4) : 'N/A', labels.length],
            ['Energy Loss', result.jump ? result.jump.energyLoss.toFixed(4) : 'N/A', labels.length],
          ]}
          filename="combined-em"
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
          calculatorTitle="Combined Energy-Momentum"
          inputs={[
            { label: 'Bottom Width (b)', value: String(b), unit: labels.length },
            { label: 'Flow Depth (y)', value: String(y), unit: labels.length },
            { label: 'Discharge (Q)', value: String(Q), unit: labels.discharge },
          ]}
          results={[
            { label: 'Specific Energy', value: result.E.toFixed(4), unit: labels.length },
            { label: 'Momentum Function', value: result.M.toFixed(4), unit: `${labels.length}²` },
            { label: 'Conjugate Depth', value: result.jump ? result.jump.y2.toFixed(4) : 'N/A', unit: labels.length },
            { label: 'Energy Loss', value: result.jump ? result.jump.energyLoss.toFixed(4) : 'N/A', unit: labels.length },
          ]}
          chartElementId="ch3-combined-export"
        />
      )}

      {shareOpen && (
        <ShareCardDialog
          onClose={() => setShareOpen(false)}
          data={{
            calculatorName: 'Combined Energy-Momentum',
            results: [
              { label: 'Specific Energy', value: `${result.E.toFixed(4)} ${labels.length}` },
              { label: 'Momentum Function', value: `${result.M.toFixed(4)} ${labels.length}²` },
              { label: 'Conjugate Depth', value: result.jump ? `${result.jump.y2.toFixed(4)} ${labels.length}` : 'N/A' },
            ],
          }}
        />
      )}
    </div>
  );
}
