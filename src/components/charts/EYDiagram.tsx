import { PlotWrapper } from './PlotWrapper';
import type { Data } from 'plotly.js';
import type { ChannelParams } from '../../types';
import { generateEYCurve } from '../../lib/energy/specific-energy';
import { criticalFlowResult } from '../../lib/energy/critical-depth';
import { useTheme } from '../../context/ThemeContext';

interface EYDiagramProps {
  Q: number;
  g: number;
  params: ChannelParams;
  yMax?: number;
  /** Optional current depth to annotate */
  currentY?: number;
  /** Optional alternate depths to annotate */
  alternateY?: { sub: number; sup: number };
  lengthUnit: string;
  /** Callback when user clicks chart to select a depth */
  onDepthSelect?: (y: number) => void;
}

export function EYDiagram({
  Q, g, params, yMax = 5, currentY, alternateY, lengthUnit, onDepthSelect,
}: EYDiagramProps) {
  const { isDark } = useTheme();
  const curve = generateEYCurve(Q, g, params, yMax);
  const crit = criticalFlowResult(Q, g, params);

  const lineColor = isDark ? '#52b788' : '#2d6a4f';

  const traces: Data[] = [
    // E-y curve
    {
      x: curve.E,
      y: curve.y,
      mode: 'lines',
      line: { color: lineColor, width: 2 },
      name: 'E(y)',
      hovertemplate: `Energy: %{x:.3f} ${lengthUnit}<br>Depth: %{y:.3f} ${lengthUnit}<extra>E(y)</extra>`,
    },
    // 45° line E = y
    {
      x: [0, yMax],
      y: [0, yMax],
      mode: 'lines',
      line: { color: '#9ca3af', width: 1, dash: 'dash' },
      name: 'E = y',
      showlegend: false,
    },
    // Critical depth point
    {
      x: [crit.Ec],
      y: [crit.yc],
      mode: 'markers',
      marker: { color: '#dc2626', size: 10, symbol: 'diamond' },
      name: `Critical (yc=${crit.yc.toFixed(3)})`,
    },
  ];

  // Annotate current depth
  if (currentY && currentY > 0) {
    const E = curve.E[curve.y.findIndex((yi) => Math.abs(yi - currentY) < (yMax / 200))] || 0;
    if (E > 0) {
      traces.push({
        x: [E],
        y: [currentY],
        mode: 'markers',
        marker: { color: '#059669', size: 10, symbol: 'circle' },
        name: `y = ${currentY.toFixed(3)}`,
      });
    }
  }

  // Annotate alternate depths
  if (alternateY) {
    const addPoint = (y: number, label: string, color: string) => {
      const idx = curve.y.findIndex((yi) => Math.abs(yi - y) < (yMax / 200));
      if (idx >= 0) {
        traces.push({
          x: [curve.E[idx]],
          y: [y],
          mode: 'markers',
          marker: { color, size: 8, symbol: 'circle-open', line: { width: 2 } },
          name: label,
        });
      }
    };
    addPoint(alternateY.sub, `Subcritical: ${alternateY.sub.toFixed(3)}`, isDark ? '#74c69d' : '#40916c');
    addPoint(alternateY.sup, `Supercritical: ${alternateY.sup.toFixed(3)}`, '#f59e0b');
  }

  const handleClick = (event: any) => {
    if (!onDepthSelect || !event.points || event.points.length === 0) return;
    const clickedY = event.points[0].y;
    if (typeof clickedY === 'number' && clickedY > 0) {
      onDepthSelect(Math.round(clickedY * 1000) / 1000);
    }
  };

  return (
    <div>
      <PlotWrapper
        data={traces}
        title="Specific Energy Diagram (E-y)"
        xLabel={`Specific Energy E (${lengthUnit})`}
        yLabel={`Depth y (${lengthUnit})`}
        layout={{
          xaxis: { range: [0, yMax * 1.5] },
          yaxis: { range: [0, yMax] },
          ...(onDepthSelect ? { dragmode: false as any, hovermode: 'closest' as const } : {}),
        }}
        onClick={onDepthSelect ? handleClick : undefined}
      />
      {onDepthSelect && (
        <p className="text-xs text-[var(--color-text-subtle)] text-center mt-1">Click on the diagram to set depth</p>
      )}
    </div>
  );
}
