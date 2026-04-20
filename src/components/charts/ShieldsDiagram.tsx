import { PlotWrapper } from './PlotWrapper';
import type { Data } from 'plotly.js';
import { SHIELDS_DATA } from '../../constants/shields';
import { useTheme } from '../../context/ThemeContext';

interface ShieldsDiagramProps {
  /** Current operating point [Re*, τ*] */
  point?: { reStar: number; tauStar: number };
  /** Critical shields parameter for given Re* */
  criticalTauStar?: number;
}

export function ShieldsDiagram({ point, criticalTauStar }: ShieldsDiagramProps) {
  const { isDark } = useTheme();
  const lineColor = isDark ? '#52b788' : '#2d6a4f';

  const traces: Data[] = [
    // Shields curve
    {
      x: SHIELDS_DATA.map(([re]) => re),
      y: SHIELDS_DATA.map(([, tau]) => tau),
      mode: 'lines+markers',
      line: { color: lineColor, width: 2 },
      marker: { size: 4 },
      name: 'Shields Curve (τ*cr)',
      hovertemplate: 'Re*: %{x:.1f}<br>τ*cr: %{y:.4f}<extra>Shields Curve</extra>',
    },
  ];

  // Motion / No motion regions
  traces.push({
    x: SHIELDS_DATA.map(([re]) => re),
    y: SHIELDS_DATA.map(([, tau]) => tau),
    fill: 'tozeroy',
    fillcolor: isDark ? 'rgba(82,183,136,0.1)' : 'rgba(34,197,94,0.1)',
    line: { color: 'transparent' },
    name: 'No Motion',
    showlegend: true,
    type: 'scatter',
  });

  // Operating point
  if (point) {
    traces.push({
      x: [point.reStar],
      y: [point.tauStar],
      mode: 'markers',
      marker: {
        color: point.tauStar > (criticalTauStar || 0.06) ? '#dc2626' : '#22c55e',
        size: 12,
        symbol: 'star',
        line: { width: 2, color: isDark ? '#fff' : '#000' },
      },
      name: point.tauStar > (criticalTauStar || 0.06)
        ? 'Motion (above curve)'
        : 'No motion (below curve)',
    });
  }

  return (
    <PlotWrapper
      data={traces}
      title="Shields Diagram"
      xLabel="Boundary Reynolds Number Re*"
      yLabel="Critical Shields Parameter τ*"
      layout={{
        xaxis: { type: 'log', range: [0, 3.5] },
        yaxis: { type: 'log', range: [-1.5, -0.8] },
      }}
    />
  );
}
