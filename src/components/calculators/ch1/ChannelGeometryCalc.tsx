import { useMemo, useState } from 'react';
import { Eye, FileText, Share2 } from 'lucide-react';
import { useUnits } from '../../../context/UnitContext';
import { computeGeometry } from '../../../lib/geometry';
import { froudeNumber } from '../../../lib/energy/froude';
import { InputField, ResultCard, SelectField, FormulaDisplay, ExportButton, CopyLinkButton } from '../../shared';
import { PresetSelector } from '../../shared/PresetSelector';
import { CSVExportButton } from '../../shared/CSVExportButton';
import { StepByStepPanel } from '../../shared/StepByStepPanel';
import { SmartWarnings } from '../../shared/SmartWarnings';
import { NotesPanel } from '../../shared/NotesPanel';
import { ReportDialog } from '../../shared/ReportDialog';
import { ShareCardDialog } from '../../shared/ShareCardDialog';
import { FlowAnimation } from '../../charts/FlowAnimation';
import { CrossSectionPlot } from '../../charts/CrossSectionPlot';
import { CrossSection3D } from '../../charts/CrossSection3D';
import { useUrlState } from '../../../hooks/useUrlState';
import { getStepsForShape } from '../../../constants/steps';
import { getFlowWarnings } from '../../../utils/flow-warnings';
import type { ChannelShape } from '../../../types';

const shapeOptions = [
  { value: 'rectangular', label: 'Rectangular' },
  { value: 'trapezoidal', label: 'Trapezoidal' },
  { value: 'triangular', label: 'Triangular' },
  { value: 'circular', label: 'Circular' },
];

export default function ChannelGeometryCalc() {
  const { labels, g } = useUnits();
  const [shape, setShape] = useUrlState('shape', 'rectangular');
  const [b, setB] = useUrlState('b', 3);
  const [m, setM] = useUrlState('m', 1.5);
  const [d, setD] = useUrlState('d', 2);
  const [y, setY] = useUrlState('y', 1.5);
  const [Q, setQ] = useUrlState('Q', 5);
  const [show3D, setShow3D] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const geo = useMemo(
    () => computeGeometry({ shape: shape as ChannelShape, b, m, d }, y),
    [shape, b, m, d, y]
  );

  const V = geo.A > 0 ? Q / geo.A : 0;
  const Fr = froudeNumber(V, g, geo.D);
  const warnings = useMemo(() => getFlowWarnings({ Fr, y }), [Fr, y]);

  const formulaMap: Record<ChannelShape, string> = {
    rectangular: 'A = b \\cdot y, \\quad P = b + 2y',
    trapezoidal: 'A = (b + my)y, \\quad P = b + 2y\\sqrt{1 + m^2}',
    triangular: 'A = my^2, \\quad P = 2y\\sqrt{1 + m^2}',
    circular: 'A = \\frac{r^2}{2}(\\theta - \\sin\\theta), \\quad P = r\\theta',
  };

  const handlePreset = (values: Record<string, number | string>) => {
    if (values.shape !== undefined) setShape(String(values.shape));
    if (values.b !== undefined) setB(Number(values.b));
    if (values.m !== undefined) setM(Number(values.m));
    if (values.d !== undefined) setD(Number(values.d));
    if (values.y !== undefined) setY(Number(values.y));
    if (values.Q !== undefined) setQ(Number(values.Q));
  };

  const csvHeaders = ['Parameter', 'Value', 'Unit'];
  const csvData = [
    ['Flow Area', geo.A.toFixed(4), labels.area],
    ['Wetted Perimeter', geo.P.toFixed(4), labels.length],
    ['Hydraulic Radius', geo.R.toFixed(4), labels.length],
    ['Top Width', geo.T.toFixed(4), labels.length],
    ['Hydraulic Depth', geo.D.toFixed(4), labels.length],
    ['Velocity', V.toFixed(4), labels.velocity],
    ['Froude Number', Fr.toFixed(4), ''],
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Chapter 1</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>Channel Geometry</h1>
      </div>

      <FormulaDisplay latex={formulaMap[shape as ChannelShape]} />

      <PresetSelector calculatorId="ch1-geometry" onSelect={handlePreset} />

      <div id="ch1-geometry-export" className="space-y-6">
        <div data-tutorial="inputs" className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[var(--color-surface)] p-6 rounded-[6px] border border-[var(--color-border)]">
          <SelectField label="Channel Shape" value={shape} onChange={(v) => setShape(v)} options={shapeOptions} />

          {(shape === 'rectangular' || shape === 'trapezoidal') && (
            <InputField label="Bottom Width (b)" value={b} onChange={setB} unit={labels.length} min={0.1} />
          )}
          {(shape === 'trapezoidal' || shape === 'triangular') && (
            <InputField label="Side Slope (m)" value={m} onChange={setM} unit="H:V" min={0} glossaryTerm="side-slope" />
          )}
          {shape === 'circular' && (
            <InputField label="Diameter (d)" value={d} onChange={setD} unit={labels.length} min={0.1} />
          )}
          <InputField label="Flow Depth (y)" value={y} onChange={setY} unit={labels.length} min={0.01} />
          <InputField label="Discharge (Q)" value={Q} onChange={setQ} unit={labels.discharge} min={0} glossaryTerm="discharge" />
        </div>

        <div data-tutorial="results" className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ResultCard label="Flow Area (A)" value={geo.A} unit={labels.area} />
          <ResultCard label="Wetted Perimeter (P)" value={geo.P} unit={labels.length} />
          <ResultCard label="Hydraulic Radius (R)" value={geo.R} unit={labels.length} />
          <ResultCard label="Top Width (T)" value={geo.T} unit={labels.length} />
          <ResultCard label="Hydraulic Depth (D)" value={geo.D} unit={labels.length} />
          <ResultCard label="Velocity (V)" value={V} unit={labels.velocity} />
          <ResultCard label="Froude Number (Fr)" value={Fr} highlight={Math.abs(Fr - 1) < 0.05} />
          <ResultCard
            label="Flow Regime"
            value={Fr < 0.99 ? 'Subcritical' : Fr > 1.01 ? 'Supercritical' : 'Critical'}
          />
        </div>

        <SmartWarnings warnings={warnings} />

        <CrossSectionPlot shape={shape as ChannelShape} b={b} m={m} d={d} y={y} lengthUnit={labels.length} />

        {shape !== 'circular' && (
          <div>
            <button
              onClick={() => setShow3D(!show3D)}
              className="flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline mb-2"
            >
              <Eye className="w-4 h-4" /> {show3D ? 'Hide 3D View' : 'View 3D'}
            </button>
            {show3D && (
              <CrossSection3D
                shape={shape as ChannelShape}
                b={b}
                m={m}
                d={d}
                y={y}
                lengthUnit={labels.length}
              />
            )}
          </div>
        )}

        {shape !== 'circular' && (
          <div className="flex justify-end">
            <button onClick={() => setShowAnimation(!showAnimation)} className="flex items-center gap-1 text-xs text-[var(--color-accent)] hover:opacity-80 no-print">
              {showAnimation ? 'Hide' : 'Show'} Flow Animation
            </button>
          </div>
        )}
        {showAnimation && shape !== 'circular' && <FlowAnimation shape={shape as ChannelShape} b={b} m={m} d={d} y={y} V={V} />}

        <StepByStepPanel steps={getStepsForShape('ch1-geometry', shape)} inputs={{ b, m, d, y, Q, g }} />
      </div>

      <NotesPanel calculatorId="ch1-geometry" />

      <div data-tutorial="export-buttons" className="flex gap-2">
        <ExportButton targetId="ch1-geometry-export" filename="channel-geometry" />
        <CSVExportButton headers={csvHeaders} data={csvData} filename="channel-geometry" />
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
          calculatorTitle="Channel Geometry"
          inputs={[
            { label: 'Shape', value: shape, unit: '' },
            { label: 'Bottom Width (b)', value: String(b), unit: labels.length },
            { label: 'Flow Depth (y)', value: String(y), unit: labels.length },
            { label: 'Discharge (Q)', value: String(Q), unit: labels.discharge },
          ]}
          results={csvData.map(([l, v, u]) => ({ label: l, value: v, unit: u }))}
          chartElementId="ch1-geometry-export"
        />
      )}

      {shareOpen && (
        <ShareCardDialog
          onClose={() => setShareOpen(false)}
          data={{
            calculatorName: 'Channel Geometry',
            results: csvData.map(([l, v, u]) => ({ label: l, value: `${v} ${u}` })),
          }}
        />
      )}
    </div>
  );
}
