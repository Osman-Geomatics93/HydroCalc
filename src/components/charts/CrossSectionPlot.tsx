import { PlotWrapper } from './PlotWrapper';
import type { Data } from 'plotly.js';
import type { ChannelShape } from '../../types';
import { rectangularCrossSection } from '../../lib/geometry/rectangular';
import { trapezoidalCrossSection } from '../../lib/geometry/trapezoidal';
import { triangularCrossSection } from '../../lib/geometry/triangular';
import { circularCrossSection, circularWaterLine } from '../../lib/geometry/circular';
import { useTheme } from '../../context/ThemeContext';

interface CrossSectionPlotProps {
  shape: ChannelShape;
  b?: number;
  m?: number;
  d?: number;
  y: number;
  lengthUnit: string;
}

export function CrossSectionPlot({ shape, b = 3, m = 1, d = 2, y, lengthUnit }: CrossSectionPlotProps) {
  const { isDark } = useTheme();
  const traces: Data[] = [];

  const waterFill = isDark ? 'rgba(82,183,136,0.25)' : 'rgba(45,106,79,0.25)';
  const waterLine = isDark ? '#74c69d' : '#40916c';
  const channelLine = isDark ? '#a0a0a0' : '#374151';
  const channelFill = isDark ? 'rgba(150,150,150,0.15)' : 'rgba(200,200,200,0.2)';

  if (shape === 'circular') {
    const circle = circularCrossSection(d, y);
    traces.push({
      x: circle.x,
      y: circle.y,
      mode: 'lines',
      line: { color: channelLine, width: 2 },
      name: 'Channel',
      fill: 'toself',
      fillcolor: channelFill,
    });
    if (y > 0) {
      const water = circularWaterLine(d, y);
      const r = d / 2;
      const n = 40;
      const wx: number[] = [];
      const wy: number[] = [];
      for (let i = 0; i <= n; i++) {
        const angle = (i / n) * 2 * Math.PI;
        const cy = r - r * Math.cos(angle);
        if (cy <= y) {
          wx.push(r * Math.sin(angle));
          wy.push(cy);
        }
      }
      wx.push(water.x[1], water.x[0]);
      wy.push(y, y);
      traces.push({
        x: wx,
        y: wy,
        mode: 'lines',
        fill: 'toself',
        fillcolor: waterFill,
        line: { color: waterLine, width: 1 },
        name: 'Water',
      });
    }
  } else {
    let cs: { x: number[]; y: number[] };
    if (shape === 'rectangular') cs = rectangularCrossSection(b, y * 1.3);
    else if (shape === 'trapezoidal') cs = trapezoidalCrossSection(b, m, y * 1.3);
    else cs = triangularCrossSection(m, y * 1.3);

    traces.push({
      x: cs.x,
      y: cs.y,
      mode: 'lines',
      line: { color: channelLine, width: 2 },
      name: 'Channel',
      fill: 'toself',
      fillcolor: channelFill,
    });

    // Water fill
    if (y > 0) {
      let wcs: { x: number[]; y: number[] };
      if (shape === 'rectangular') wcs = rectangularCrossSection(b, y);
      else if (shape === 'trapezoidal') wcs = trapezoidalCrossSection(b, m, y);
      else wcs = triangularCrossSection(m, y);

      traces.push({
        x: [...wcs.x, wcs.x[0]],
        y: [...wcs.y, wcs.y[0]],
        mode: 'lines',
        fill: 'toself',
        fillcolor: waterFill,
        line: { color: waterLine, width: 1 },
        name: 'Water',
      });
    }
  }

  return (
    <PlotWrapper
      data={traces}
      title="Channel Cross-Section"
      xLabel={`Width (${lengthUnit})`}
      yLabel={`Depth (${lengthUnit})`}
      height={350}
      layout={{
        yaxis: { scaleanchor: 'x', scaleratio: 1 },
        showlegend: false,
      }}
    />
  );
}
