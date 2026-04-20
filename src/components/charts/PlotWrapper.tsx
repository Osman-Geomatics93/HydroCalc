// eslint-disable-next-line @typescript-eslint/no-explicit-any
import Plotly from 'plotly.js-dist-min';
import type { Data, Layout } from 'plotly.js';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import factoryModule from 'react-plotly.js/factory';
import { useTheme } from '../../context/ThemeContext';
import { useEffect, useState } from 'react';

const createPlotlyComponent = typeof factoryModule === 'function' ? factoryModule : (factoryModule as any).default;
const Plot = createPlotlyComponent(Plotly);

interface PlotWrapperProps {
  data: Data[];
  layout?: Partial<Layout>;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  height?: number;
  onClick?: (event: any) => void;
}

export function PlotWrapper({ data, layout = {}, title, xLabel, yLabel, height = 450, onClick }: PlotWrapperProps) {
  const { isDark } = useTheme();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const gridColor = isDark ? '#2e2e2e' : '#e8e6e1';
  const zeroColor = isDark ? '#555' : '#9a9a9a';
  const fontColor = isDark ? '#e8e6e1' : undefined;

  const transition = reducedMotion
    ? undefined
    : { duration: 400, easing: 'cubic-in-out' as const };

  const mergedLayout: Partial<Layout> = {
    title: title ? { text: title, font: { size: 16, color: fontColor } } : undefined,
    xaxis: {
      title: xLabel ? { text: xLabel } : undefined,
      gridcolor: gridColor,
      zerolinecolor: zeroColor,
      color: fontColor,
      ...layout.xaxis,
    },
    yaxis: {
      title: yLabel ? { text: yLabel } : undefined,
      gridcolor: gridColor,
      zerolinecolor: zeroColor,
      color: fontColor,
      ...layout.yaxis,
    },
    plot_bgcolor: isDark ? '#1e1e1e' : '#ffffff',
    paper_bgcolor: isDark ? '#121212' : '#fafaf8',
    font: { family: 'Plus Jakarta Sans, system-ui, sans-serif', size: 12, color: fontColor },
    margin: { t: title ? 50 : 30, r: 30, b: 50, l: 60 },
    height,
    autosize: true,
    legend: isDark ? { font: { color: fontColor } } : undefined,
    transition,
    hoverlabel: {
      bgcolor: isDark ? '#2e2e2e' : '#ffffff',
      bordercolor: isDark ? '#52b788' : '#2d6a4f',
      font: { size: 13, color: isDark ? '#e8e6e1' : '#1a1a1a', family: 'Plus Jakarta Sans' },
    },
    ...layout,
  };

  return (
    <div className="w-full rounded-[6px] border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface)]">
      <Plot
        data={data}
        layout={mergedLayout}
        config={{
          responsive: true,
          displayModeBar: true,
          modeBarButtonsToRemove: ['lasso2d', 'select2d'],
          toImageButtonOptions: { format: 'png', scale: 2 },
        }}
        useResizeHandler
        className="w-full"
        onClick={onClick}
      />
    </div>
  );
}
