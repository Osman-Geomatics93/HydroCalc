import { PlotWrapper } from './PlotWrapper';
import type { Data } from 'plotly.js';
import type { ChannelParams } from '../../types';
import { generateMYCurve } from '../../lib/momentum/momentum-function';
import { criticalDepth } from '../../lib/energy/critical-depth';
import { momentumFunction } from '../../lib/momentum/momentum-function';
import { useTheme } from '../../context/ThemeContext';

interface MYDiagramProps {
  Q: number;
  g: number;
  params: ChannelParams;
  yMax?: number;
  y1?: number;
  y2?: number;
  lengthUnit: string;
  onDepthSelect?: (y: number) => void;
}

export function MYDiagram({ Q, g, params, yMax = 5, y1, y2, lengthUnit, onDepthSelect }: MYDiagramProps) {
  const { isDark } = useTheme();
  const curve = generateMYCurve(Q, g, params, yMax);
  const yc = criticalDepth(Q, g, params);
  const Mc = momentumFunction(yc, Q, g, params);

  const lineColor = isDark ? '#52b788' : '#2d6a4f';

  const traces: Data[] = [
    {
      x: curve.M,
      y: curve.y,
      mode: 'lines',
      line: { color: lineColor, width: 2 },
      name: 'M(y)',
      hovertemplate: `Momentum: %{x:.3f} ${lengthUnit}\u00b2<br>Depth: %{y:.3f} ${lengthUnit}<extra>M(y)</extra>`,
    },
    {
      x: [Mc],
      y: [yc],
      mode: 'markers',
      marker: { color: '#dc2626', size: 10, symbol: 'diamond' },
      name: `Critical (yc=${yc.toFixed(3)})`,
    },
  ];

  if (y1 && y1 > 0) {
    const M1 = momentumFunction(y1, Q, g, params);
    traces.push({
      x: [M1],
      y: [y1],
      mode: 'markers',
      marker: { color: '#059669', size: 10 },
      name: `y₁ = ${y1.toFixed(3)}`,
    });
  }

  if (y2 && y2 > 0) {
    const M2 = momentumFunction(y2, Q, g, params);
    traces.push({
      x: [M2],
      y: [y2],
      mode: 'markers',
      marker: { color: '#f59e0b', size: 10 },
      name: `y₂ = ${y2.toFixed(3)}`,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        title="Momentum Function Diagram (M-y)"
        xLabel={`Momentum Function M (${lengthUnit}²)`}
        yLabel={`Depth y (${lengthUnit})`}
        layout={{
          yaxis: { range: [0, yMax] },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
