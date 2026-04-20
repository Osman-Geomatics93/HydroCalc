import { useMemo, useState } from 'react';
import { FileText, Share2 } from 'lucide-react';
import { useUnits } from '../../../context/UnitContext';
import { alternateDepths } from '../../../lib/energy/alternate-depths';
import { specificEnergy } from '../../../lib/energy/specific-energy';
import { criticalFlowResult } from '../../../lib/energy/critical-depth';
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
import { EYDiagram } from '../../charts/EYDiagram';
import { useUrlState } from '../../../hooks/useUrlState';
import type { ChannelShape, ChannelParams } from '../../../types';

const shapeOptions = [
  { value: 'rectangular', label: 'Rectangular' },
  { value: 'trapezoidal', label: 'Trapezoidal' },
  { value: 'triangular', label: 'Triangular' },
  { value: 'circular', label: 'Circular' },
];

export default function AlternateDepthsCalc() {
  const { labels, g } = useUnits();
  const [shape, setShape] = useUrlState('shape', 'rectangular');
  const [b, setB] = useUrlState('b', 5);
  const [m, setM] = useUrlState('m', 1.5);
  const [d, setD] = useUrlState('d', 2);
  const [y1, setY1] = useUrlState('y1', 2);
  const [Q, setQ] = useUrlState('Q', 10);

  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const params: ChannelParams = useMemo(() => ({ shape: shape as ChannelShape, b, m, d }), [shape, b, m, d]);

  const result = useMemo(() => {
    try {
      const alt = alternateDepths(y1, Q, g, params);
      const E = specificEnergy(y1, Q, g, params);
      const crit = criticalFlowResult(Q, g, params);
      return { alt, E, crit, error: null };
    } catch {
      return { alt: null, E: 0, crit: null, error: 'Could not find alternate depth' };
    }
  }, [y1, Q, g, params]);

  const handlePreset = (values: Record<string, number | string>) => {
    if (values.shape !== undefined) setShape(String(values.shape));
    if (values.b !== undefined) setB(Number(values.b));
    if (values.m !== undefined) setM(Number(values.m));
    if (values.d !== undefined) setD(Number(values.d));
    if (values.y1 !== undefined) setY1(Number(values.y1));
    if (values.Q !== undefined) setQ(Number(values.Q));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Chapter 2</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Alternate Depths</h1>
      </div>

      <FormulaDisplay latex="E(y_1) = E(y_2) \\quad \\Rightarrow \\quad y_1 + \\frac{Q^2}{2gA_1^2} = y_2 + \\frac{Q^2}{2gA_2^2}" />

      <PresetSelector calculatorId="ch2-alternate" onSelect={handlePreset} />

      <div id="ch2-alternate-export" className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 bg-[var(--color-surface)] p-4 sm:p-6 rounded-[6px] border border-[var(--color-border)]">
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
          <InputField label="Known Depth (y₁)" value={y1} onChange={setY1} unit={labels.length} min={0.01} />
          <InputField label="Discharge (Q)" value={Q} onChange={setQ} unit={labels.discharge} min={0.01} />
        </div>

        {result.error ? (
          <div className="error-banner bg-red-50 text-red-700 p-4 rounded-[6px]">{result.error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <ResultCard label="Specific Energy" value={result.E} unit={labels.length} />
              <ResultCard label="Subcritical Depth" value={result.alt!.sub} unit={labels.length} highlight />
              <ResultCard label="Supercritical Depth" value={result.alt!.sup} unit={labels.length} highlight />
              <ResultCard label="Critical Depth" value={result.crit!.yc} unit={labels.length} />
            </div>

            <EYDiagram
              Q={Q} g={g} params={params}
              currentY={y1}
              alternateY={result.alt!}
              lengthUnit={labels.length}
              yMax={Math.max(y1, result.alt!.sub) * 1.5}
              onDepthSelect={(yv) => setY1(yv)}
            />
          </>
        )}

        <SmartWarnings warnings={getFlowWarnings({ y: y1, yc: result.crit?.yc })} />

        <StepByStepPanel steps={getStepsForShape('ch2-alternate', shape)} inputs={{ b, m, d, y1, Q, g }} />
      </div>

      <NotesPanel calculatorId="ch2-alternate" />

      <div className="flex gap-2">
        <ExportButton targetId="ch2-alternate-export" filename="alternate-depths" />
        <CSVExportButton
          headers={['Parameter', 'Value', 'Unit']}
          data={[
            ['Specific Energy', result.E.toFixed(4), labels.length],
            ['Subcritical Depth', result.alt ? result.alt.sub.toFixed(4) : 'N/A', labels.length],
            ['Supercritical Depth', result.alt ? result.alt.sup.toFixed(4) : 'N/A', labels.length],
          ]}
          filename="alternate-depths"
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
          calculatorTitle="Alternate Depths"
          inputs={[
            { label: 'Shape', value: shape, unit: '' },
            { label: 'Known Depth (y1)', value: String(y1), unit: labels.length },
            { label: 'Discharge (Q)', value: String(Q), unit: labels.discharge },
          ]}
          results={[
            { label: 'Specific Energy', value: result.E.toFixed(4), unit: labels.length },
            { label: 'Subcritical Depth', value: result.alt ? result.alt.sub.toFixed(4) : 'N/A', unit: labels.length },
            { label: 'Supercritical Depth', value: result.alt ? result.alt.sup.toFixed(4) : 'N/A', unit: labels.length },
          ]}
          chartElementId="ch2-alternate-export"
        />
      )}

      {shareOpen && (
        <ShareCardDialog
          onClose={() => setShareOpen(false)}
          data={{
            calculatorName: 'Alternate Depths',
            results: [
              { label: 'Subcritical Depth', value: result.alt ? `${result.alt.sub.toFixed(4)} ${labels.length}` : 'N/A' },
              { label: 'Supercritical Depth', value: result.alt ? `${result.alt.sup.toFixed(4)} ${labels.length}` : 'N/A' },
            ],
          }}
        />
      )}
    </div>
  );
}
