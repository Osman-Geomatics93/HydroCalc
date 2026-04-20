import { useMemo } from 'react';
import { PlotWrapper } from './PlotWrapper';
import type { Data, Layout } from 'plotly.js';
import type { GVFStep } from '../../types';

interface LongitudinalProfile3DProps {
  steps: GVFStep[];
  S0: number;
  yn?: number;
  yc?: number;
  lengthUnit: string;
  channelWidth?: number;
}

export function LongitudinalProfile3D({ steps, S0, yn, yc, lengthUnit, channelWidth = 5 }: LongitudinalProfile3DProps) {
  const { traces, layout } = useMemo(() => {
    if (steps.length === 0) return { traces: [] as Data[], layout: {} as Partial<Layout> };

    const xVals = steps.map((s) => s.x);
    const halfW = channelWidth / 2;

    // Channel bed surface: z = -S0 * x
    const bedX: number[][] = [];
    const bedY: number[][] = [];
    const bedZ: number[][] = [];
    for (const s of steps) {
      const bedElev = -S0 * s.x;
      bedX.push([s.x, s.x]);
      bedY.push([-halfW, halfW]);
      bedZ.push([bedElev, bedElev]);
    }

    // Water surface: z = bed + depth, colored by depth
    const waterX: number[][] = [];
    const waterY: number[][] = [];
    const waterZ: number[][] = [];
    const waterColor: number[][] = [];
    for (const s of steps) {
      const bedElev = -S0 * s.x;
      const waterElev = bedElev + s.y;
      waterX.push([s.x, s.x]);
      waterY.push([-halfW, halfW]);
      waterZ.push([waterElev, waterElev]);
      waterColor.push([s.y, s.y]);
    }

    const data: Data[] = [
      // Bed surface
      {
        type: 'surface',
        x: bedX,
        y: bedY,
        z: bedZ,
        colorscale: [[0, '#a8966e'], [1, '#8b7a55']],
        showscale: false,
        opacity: 0.7,
        name: 'Channel Bed',
        hovertemplate: `x: %{x:.1f}<br>Bed elev: %{z:.3f}<extra>Bed</extra>`,
      } as Data,
      // Water surface
      {
        type: 'surface',
        x: waterX,
        y: waterY,
        z: waterZ,
        surfacecolor: waterColor,
        colorscale: [[0, '#93c5fd'], [0.5, '#3b82f6'], [1, '#1e3a8a']],
        showscale: true,
        colorbar: { title: `Depth (${lengthUnit})`, len: 0.5, thickness: 15 },
        opacity: 0.85,
        name: 'Water Surface',
        hovertemplate: `x: %{x:.1f}<br>WS elev: %{z:.3f}<extra>Water</extra>`,
      } as Data,
      // Energy grade line
      {
        type: 'scatter3d',
        x: xVals,
        y: xVals.map(() => 0),
        z: steps.map((s) => -S0 * s.x + s.E),
        mode: 'lines',
        line: { color: '#ef4444', width: 4 },
        name: 'EGL',
        hovertemplate: `x: %{x:.1f}<br>EGL: %{z:.3f}<extra>EGL</extra>`,
      } as Data,
    ];

    // yn reference line
    if (yn && yn > 0) {
      const xRange = [xVals[0], xVals[xVals.length - 1]];
      data.push({
        type: 'scatter3d',
        x: xRange,
        y: [0, 0],
        z: xRange.map((x) => -S0 * x + yn),
        mode: 'lines',
        line: { color: '#22c55e', width: 3, dash: 'dash' },
        name: `yn = ${yn.toFixed(3)}`,
      } as Data);
    }

    // yc reference line
    if (yc && yc > 0) {
      const xRange = [xVals[0], xVals[xVals.length - 1]];
      data.push({
        type: 'scatter3d',
        x: xRange,
        y: [0, 0],
        z: xRange.map((x) => -S0 * x + yc),
        mode: 'lines',
        line: { color: '#f97316', width: 3, dash: 'dot' },
        name: `yc = ${yc.toFixed(3)}`,
      } as Data);
    }

    const sceneLayout: Partial<Layout> = {
      scene: {
        xaxis: { title: `Distance (${lengthUnit})` },
        yaxis: { title: `Width (${lengthUnit})` },
        zaxis: { title: `Elevation (${lengthUnit})` },
        camera: { eye: { x: 1.5, y: 1.5, z: 0.8 } },
        aspectmode: 'manual',
        aspectratio: { x: 2, y: 0.5, z: 0.8 },
      } as any,
    };

    return { traces: data, layout: sceneLayout };
  }, [steps, S0, yn, yc, lengthUnit, channelWidth]);

  if (steps.length === 0) return null;

  return (
    <PlotWrapper
      data={traces}
      layout={layout}
      title="3D Longitudinal Profile"
      height={500}
    />
  );
}
