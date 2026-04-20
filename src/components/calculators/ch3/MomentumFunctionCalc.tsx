import { useMemo, useState } from 'react';
import { FileText, Share2 } from 'lucide-react';
import { useUnits } from '../../../context/UnitContext';
import { momentumFunction } from '../../../lib/momentum/momentum-function';
import { criticalFlowResult } from '../../../lib/energy/critical-depth';
import { InputField, ResultCard, SelectField, FormulaDisplay, ExportButton, CopyLinkButton } from '../../shared';
import { CSVExportButton } from '../../shared/CSVExportButton';
import { StepByStepPanel } from '../../shared/StepByStepPanel';
import { PresetSelector } from '../../shared/PresetSelector';
import { NotesPanel } from '../../shared/NotesPanel';
import { ReportDialog } from '../../shared/ReportDialog';
import { ShareCardDialog } from '../../shared/ShareCardDialog';
import { getStepsForShape } from '../../../constants/steps';
import { MYDiagram } from '../../charts/MYDiagram';
import { useUrlState } from '../../../hooks/useUrlState';
import type { ChannelShape, ChannelParams } from '../../../types';

const shapeOptions = [
  { value: 'rectangular', label: 'Rectangular' },
  { value: 'trapezoidal', label: 'Trapezoidal' },
  { value: 'triangular', label: 'Triangular' },
];

export default function MomentumFunctionCalc() {
  const { labels, g } = useUnits();
  const [shape, setShape] = useUrlState('shape', 'rectangular');
  const [b, setB] = useUrlState('b', 5);
  const [m, setM] = useUrlState('m', 1.5);
  const [y, setY] = useUrlState('y', 2);
  const [Q, setQ] = useUrlState('Q', 10);

  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const params: ChannelParams = useMemo(() => ({ shape: shape as ChannelShape, b, m }), [shape, b, m]);

  const { M, crit, Mc } = useMemo(() => {
    try {
      const M = momentumFunction(y, Q, g, params);
      const crit = criticalFlowResult(Q, g, params);
      const Mc = momentumFunction(crit.yc, Q, g, params);
      return { M, crit, Mc };
    } catch {
      return { M: 0, crit: { yc: 0, Vc: 0, Ec: 0, Ac: 0 }, Mc: 0 };
    }
  }, [y, Q, g, params]);

  const handlePreset = (values: Record<string, number | string>) => {
    if (values.shape !== undefined) setShape(String(values.shape));
    if (values.b !== undefined) setB(Number(values.b));
    if (values.m !== undefined) setM(Number(values.m));
    if (values.y !== undefined) setY(Number(values.y));
    if (values.Q !== undefined) setQ(Number(values.Q));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Chapter 3</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Momentum Function</h1>
      </div>

      <FormulaDisplay latex="M = \\frac{Q^2}{gA} + \\bar{y}A" />

      <PresetSelector calculatorId="ch3-momentum" onSelect={handlePreset} />

      <div id="ch3-momentum-export" className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 bg-[var(--color-surface)] p-4 sm:p-6 rounded-[6px] border border-[var(--color-border)]">
          <SelectField label="Channel Shape" value={shape} onChange={(v) => setShape(v)} options={shapeOptions} />
          {(shape === 'rectangular' || shape === 'trapezoidal') && (
            <InputField label="Bottom Width (b)" value={b} onChange={setB} unit={labels.length} min={0.1} />
          )}
          {(shape === 'trapezoidal' || shape === 'triangular') && (
            <InputField label="Side Slope (m)" value={m} onChange={setM} unit="H:V" min={0} />
          )}
          <InputField label="Flow Depth (y)" value={y} onChange={setY} unit={labels.length} min={0.01} />
          <InputField label="Discharge (Q)" value={Q} onChange={setQ} unit={labels.discharge} min={0.01} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <ResultCard label="Momentum Function (M)" value={M} unit={`${labels.length}²`} highlight />
          <ResultCard label="Critical M (Mc)" value={Mc} unit={`${labels.length}²`} />
          <ResultCard label="Critical Depth (yc)" value={crit.yc} unit={labels.length} />
        </div>

        <MYDiagram Q={Q} g={g} params={params} y1={y} lengthUnit={labels.length} onDepthSelect={(yv) => setY(yv)} />

        <StepByStepPanel steps={getStepsForShape('ch3-momentum', shape)} inputs={{ b, m, y, Q, g }} />
      </div>

      <NotesPanel calculatorId="ch3-momentum" />

      <div className="flex gap-2">
        <ExportButton targetId="ch3-momentum-export" filename="momentum-function" />
        <CSVExportButton
          headers={['Parameter', 'Value', 'Unit']}
          data={[
            ['Momentum Function (M)', M.toFixed(4), `${labels.length}²`],
            ['Critical M (Mc)', Mc.toFixed(4), `${labels.length}²`],
            ['Critical Depth (yc)', crit.yc.toFixed(4), labels.length],
          ]}
          filename="momentum-function"
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
          calculatorTitle="Momentum Function"
          inputs={[
            { label: 'Shape', value: shape, unit: '' },
            { label: 'Flow Depth (y)', value: String(y), unit: labels.length },
            { label: 'Discharge (Q)', value: String(Q), unit: labels.discharge },
          ]}
          results={[
            { label: 'Momentum Function (M)', value: M.toFixed(4), unit: `${labels.length}²` },
            { label: 'Critical M (Mc)', value: Mc.toFixed(4), unit: `${labels.length}²` },
            { label: 'Critical Depth (yc)', value: crit.yc.toFixed(4), unit: labels.length },
          ]}
          chartElementId="ch3-momentum-export"
        />
      )}

      {shareOpen && (
        <ShareCardDialog
          onClose={() => setShareOpen(false)}
          data={{
            calculatorName: 'Momentum Function',
            results: [
              { label: 'M', value: `${M.toFixed(4)} ${labels.length}²` },
              { label: 'Critical Depth (yc)', value: `${crit.yc.toFixed(4)} ${labels.length}` },
            ],
          }}
        />
      )}
    </div>
  );
}
