import { PlotWrapper } from './PlotWrapper';
import type { Data } from 'plotly.js';
import type { ChannelShape } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface CrossSection3DProps {
  shape: ChannelShape;
  b?: number;
  m?: number;
  d?: number;
  y: number;
  lengthUnit: string;
  channelLength?: number;
}

export function CrossSection3D({
  shape,
  b = 3,
  m = 1,
  y,
  lengthUnit,
  channelLength = 10,
}: CrossSection3DProps) {
  const { isDark } = useTheme();

  // Generate channel profile along length
  const nAlong = 20;
  const nAcross = 20;

  // Build cross-section shape
  const getChannelY = (w: number, height: number): number => {
    if (shape === 'rectangular') {
      return w >= -b / 2 && w <= b / 2 ? 0 : height;
    }
    if (shape === 'trapezoidal') {
      const halfTop = b / 2 + m * height;
      if (w >= -b / 2 && w <= b / 2) return 0;
      if (w < -b / 2 && w >= -halfTop) return (-b / 2 - w) / m;
      if (w > b / 2 && w <= halfTop) return (w - b / 2) / m;
      return height;
    }
    if (shape === 'triangular') {
      const halfTop = m * height;
      if (w >= 0 && w <= halfTop) return w / m;
      if (w < 0 && w >= -halfTop) return -w / m;
      return height;
    }
    return 0;
  };

  const maxH = y * 1.5;
  const halfW = shape === 'rectangular' ? b / 2 + 1 : (b || 0) / 2 + m * maxH + 1;

  // Channel bed surface
  const xBed: number[][] = [];
  const yBed: number[][] = [];
  const zBed: number[][] = [];

  // Water surface
  const xWater: number[][] = [];
  const yWater: number[][] = [];
  const zWater: number[][] = [];

  for (let i = 0; i <= nAlong; i++) {
    const along = (i / nAlong) * channelLength;
    const rowXBed: number[] = [];
    const rowYBed: number[] = [];
    const rowZBed: number[] = [];
    const rowXWater: number[] = [];
    const rowYWater: number[] = [];
    const rowZWater: number[] = [];

    for (let j = 0; j <= nAcross; j++) {
      const w = -halfW + (j / nAcross) * 2 * halfW;
      const bedZ = getChannelY(w, maxH);

      rowXBed.push(along);
      rowYBed.push(w);
      rowZBed.push(bedZ);

      rowXWater.push(along);
      rowYWater.push(w);
      rowZWater.push(bedZ < y ? y : NaN);
    }

    xBed.push(rowXBed);
    yBed.push(rowYBed);
    zBed.push(rowZBed);
    xWater.push(rowXWater);
    yWater.push(rowYWater);
    zWater.push(rowZWater);
  }

  const traces: Data[] = [
    {
      type: 'surface',
      x: xBed,
      y: yBed,
      z: zBed,
      colorscale: isDark
        ? [[0, 'rgb(60,60,60)'], [1, 'rgb(150,140,130)']]
        : [[0, 'rgb(180,170,160)'], [1, 'rgb(220,210,200)']],
      showscale: false,
      name: 'Channel Bed',
      opacity: 0.9,
    } as Data,
    {
      type: 'surface',
      x: xWater,
      y: yWater,
      z: zWater,
      colorscale: isDark
        ? [[0, 'rgba(82,183,136,0.5)'], [1, 'rgba(82,183,136,0.5)']]
        : [[0, 'rgba(45,106,79,0.4)'], [1, 'rgba(45,106,79,0.4)']],
      showscale: false,
      name: 'Water Surface',
      opacity: 0.7,
    } as Data,
  ];

  return (
    <PlotWrapper
      data={traces}
      title="3D Channel View"
      height={450}
      layout={{
        scene: {
          xaxis: { title: `Length (${lengthUnit})` },
          yaxis: { title: `Width (${lengthUnit})` },
          zaxis: { title: `Elevation (${lengthUnit})` },
          camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } },
          aspectmode: 'manual',
          aspectratio: { x: 2, y: 1, z: 0.5 },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        margin: { t: 40, r: 0, b: 0, l: 0 },
      }}
    />
  );
}
