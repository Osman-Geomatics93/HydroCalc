import { PlotWrapper } from './PlotWrapper';
import type { Data } from 'plotly.js';
import type { GVFStep } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface WaterSurfaceProfileProps {
  steps: GVFStep[];
  yn?: number;
  yc?: number;
  S0?: number;
  lengthUnit: string;
}

export function WaterSurfaceProfile({ steps, yn, yc, S0 = 0, lengthUnit }: WaterSurfaceProfileProps) {
  const { isDark } = useTheme();

  if (steps.length === 0) return null;

  const xRange = [steps[0].x, steps[steps.length - 1].x];

  const waterColor = isDark ? '#74c69d' : '#40916c';
  const waterFill = isDark ? 'rgba(82,183,136,0.12)' : 'rgba(45,106,79,0.12)';

  const traces: Data[] = [
    // Water surface
    {
      x: steps.map((s) => s.x),
      y: steps.map((s) => s.y),
      mode: 'lines',
      line: { color: waterColor, width: 2.5 },
      name: 'Water Surface',
      fill: 'tozeroy',
      fillcolor: waterFill,
      hovertemplate: `x: %{x:.1f} ${lengthUnit}<br>y: %{y:.4f} ${lengthUnit}<extra>Water Surface</extra>`,
    },
    // Channel bed
    {
      x: xRange,
      y: [0 - S0 * xRange[0], 0 - S0 * xRange[1]].map((v) => Math.max(v, -10)),
      mode: 'lines',
      line: { color: isDark ? '#a8a29e' : '#78716c', width: 2 },
      name: 'Channel Bed',
    },
  ];

  // Normal depth line
  if (yn && yn > 0) {
    traces.push({
      x: xRange,
      y: [yn, yn],
      mode: 'lines',
      line: { color: '#22c55e', width: 1.5, dash: 'dash' },
      name: `yn = ${yn.toFixed(3)}`,
    });
  }

  // Critical depth line
  if (yc && yc > 0) {
    traces.push({
      x: xRange,
      y: [yc, yc],
      mode: 'lines',
      line: { color: '#ef4444', width: 1.5, dash: 'dot' },
      name: `yc = ${yc.toFixed(3)}`,
    });
  }

  return (
    <PlotWrapper
      data={traces}
      title="Water Surface Profile"
      xLabel={`Distance x (${lengthUnit})`}
      yLabel={`Depth y (${lengthUnit})`}
      height={400}
    />
  );
}
