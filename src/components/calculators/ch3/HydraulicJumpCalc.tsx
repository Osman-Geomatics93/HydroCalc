import { useMemo, useState } from 'react';
import { FileText, Share2 } from 'lucide-react';
import { useUnits } from '../../../context/UnitContext';
import { hydraulicJump } from '../../../lib/momentum/conjugate-depths';
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
import { MYDiagram } from '../../charts/MYDiagram';
import { useUrlState } from '../../../hooks/useUrlState';
import type { ChannelShape, ChannelParams } from '../../../types';

const shapeOptions = [
  { value: 'rectangular', label: 'Rectangular' },
  { value: 'trapezoidal', label: 'Trapezoidal' },
  { value: 'triangular', label: 'Triangular' },
];

export default function HydraulicJumpCalc() {
  const { labels, g } = useUnits();
  const [shape, setShape] = useUrlState('shape', 'rectangular');
  const [b, setB] = useUrlState('b', 5);
  const [m, setM] = useUrlState('m', 1.5);
  const [y1, setY1] = useUrlState('y1', 0.3);
  const [Q, setQ] = useUrlState('Q', 5);

  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const params: ChannelParams = useMemo(() => ({ shape: shape as ChannelShape, b, m }), [shape, b, m]);

  const result = useMemo(() => {
    try {
      return { data: hydraulicJump(y1, Q, g, params), error: null };
    } catch {
      return { data: null, error: 'Could not compute hydraulic jump. Ensure supercritical upstream flow.' };
    }
  }, [y1, Q, g, params]);

  const handlePreset = (values: Record<string, number | string>) => {
    if (values.shape !== undefined) setShape(String(values.shape));
    if (values.b !== undefined) setB(Number(values.b));
    if (values.m !== undefined) setM(Number(values.m));
    if (values.y1 !== undefined) setY1(Number(values.y1));
    if (values.Q !== undefined) setQ(Number(values.Q));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Chapter 3</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Hydraulic Jump</h1>
      </div>

      <FormulaDisplay latex="y_2 = \\frac{y_1}{2}\\left(\\sqrt{1 + 8Fr_1^2} - 1\\right) \\quad \\text{(rectangular)}" />

      <PresetSelector calculatorId="ch3-jump" onSelect={handlePreset} />

      <div id="ch3-jump-export" className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 bg-[var(--color-surface)] p-4 sm:p-6 rounded-[6px] border border-[var(--color-border)]">
          <SelectField label="Channel Shape" value={shape} onChange={(v) => setShape(v as ChannelShape)} options={shapeOptions} />
          {(shape === 'rectangular' || shape === 'trapezoidal') && (
            <InputField label="Bottom Width (b)" value={b} onChange={setB} unit={labels.length} min={0.1} />
          )}
          {(shape === 'trapezoidal' || shape === 'triangular') && (
            <InputField label="Side Slope (m)" value={m} onChange={setM} unit="H:V" min={0} />
          )}
          <InputField label="Upstream Depth (y₁)" value={y1} onChange={setY1} unit={labels.length} min={0.01} />
          <InputField label="Discharge (Q)" value={Q} onChange={setQ} unit={labels.discharge} min={0.01} />
        </div>

        {result.error ? (
          <div className="error-banner bg-red-50 text-red-700 p-4 rounded-[6px]">{result.error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <ResultCard label="Upstream Depth (y₁)" value={result.data!.y1} unit={labels.length} />
              <ResultCard label="Downstream Depth (y₂)" value={result.data!.y2} unit={labels.length} highlight />
              <ResultCard label="Upstream Fr₁" value={result.data!.Fr1} />
              <ResultCard label="Downstream Fr₂" value={result.data!.Fr2} />
              <ResultCard label="Energy Loss (ΔE)" value={result.data!.energyLoss} unit={labels.length} />
              <ResultCard label="Jump Type" value={result.data!.jumpType} />
            </div>

            <MYDiagram
              Q={Q} g={g} params={params}
              y1={result.data!.y1} y2={result.data!.y2}
              lengthUnit={labels.length}
              yMax={result.data!.y2 * 2}
            />

            <SmartWarnings warnings={getFlowWarnings({ Fr: result.data!.Fr1 })} />
          </>
        )}

        <StepByStepPanel steps={getStepsForShape('ch3-jump', shape)} inputs={{ b, m, y1, Q, g }} />
      </div>

      <NotesPanel calculatorId="ch3-jump" />

      <div className="flex gap-2">
        <ExportButton targetId="ch3-jump-export" filename="hydraulic-jump" />
        <CSVExportButton
          headers={['Parameter', 'Value', 'Unit']}
          data={[
            ['Upstream Depth (y1)', result.data ? result.data.y1.toFixed(4) : 'N/A', labels.length],
            ['Downstream Depth (y2)', result.data ? result.data.y2.toFixed(4) : 'N/A', labels.length],
            ['Upstream Fr1', result.data ? result.data.Fr1.toFixed(4) : 'N/A', '—'],
            ['Downstream Fr2', result.data ? result.data.Fr2.toFixed(4) : 'N/A', '—'],
            ['Energy Loss (dE)', result.data ? result.data.energyLoss.toFixed(4) : 'N/A', labels.length],
            ['Jump Type', result.data ? result.data.jumpType : 'N/A', '—'],
          ]}
          filename="hydraulic-jump"
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
          calculatorTitle="Hydraulic Jump"
          inputs={[
            { label: 'Shape', value: shape, unit: '' },
            { label: 'Upstream Depth (y1)', value: String(y1), unit: labels.length },
            { label: 'Discharge (Q)', value: String(Q), unit: labels.discharge },
          ]}
          results={[
            { label: 'Upstream Depth (y1)', value: result.data ? result.data.y1.toFixed(4) : 'N/A', unit: labels.length },
            { label: 'Downstream Depth (y2)', value: result.data ? result.data.y2.toFixed(4) : 'N/A', unit: labels.length },
            { label: 'Energy Loss (dE)', value: result.data ? result.data.energyLoss.toFixed(4) : 'N/A', unit: labels.length },
            { label: 'Jump Type', value: result.data ? result.data.jumpType : 'N/A', unit: '—' },
          ]}
          chartElementId="ch3-jump-export"
        />
      )}

      {shareOpen && (
        <ShareCardDialog
          onClose={() => setShareOpen(false)}
          data={{
            calculatorName: 'Hydraulic Jump',
            results: [
              { label: 'Conjugate Depth (y2)', value: result.data ? `${result.data.y2.toFixed(4)} ${labels.length}` : 'N/A' },
              { label: 'Energy Loss', value: result.data ? `${result.data.energyLoss.toFixed(4)} ${labels.length}` : 'N/A' },
              { label: 'Jump Type', value: result.data?.jumpType || 'N/A' },
            ],
          }}
        />
      )}
    </div>
  );
}
