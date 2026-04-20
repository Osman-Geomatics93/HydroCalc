import type { ChannelGeometry } from '../../types';

/**
 * Circular channel geometry: diameter d, depth y.
 * Uses central angle θ where y = (d/2)(1 - cos(θ/2)).
 */
export function circularGeometry(d: number, y: number): ChannelGeometry {
  const r = d / 2;
  // Clamp y to [0, d]
  const yc = Math.min(Math.max(y, 0), d);

  // Central angle θ: y = r(1 - cos(θ/2))  =>  θ = 2·acos(1 - y/r)
  const theta = 2 * Math.acos(1 - yc / r);

  const A = (r * r / 2) * (theta - Math.sin(theta));
  const P = r * theta;
  const R = P > 0 ? A / P : 0;
  const T = 2 * Math.sqrt(r * r - (r - yc) * (r - yc));
  const D = T > 0 ? A / T : 0;

  return { A, P, R, T, D };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function circularCrossSection(d: number, _y: number): { x: number[]; y: number[] } {
  const r = d / 2;
  const n = 50;
  const xs: number[] = [];
  const ys: number[] = [];

  // Draw circle outline
  for (let i = 0; i <= n; i++) {
    const angle = (i / n) * 2 * Math.PI;
    xs.push(r * Math.sin(angle));
    ys.push(r - r * Math.cos(angle));
  }

  return { x: xs, y: ys };
}

export function circularWaterLine(d: number, y: number): { x: number[]; y: number[] } {
  const r = d / 2;
  const yc = Math.min(Math.max(y, 0), d);
  const halfWidth = Math.sqrt(r * r - (r - yc) * (r - yc));
  return {
    x: [-halfWidth, halfWidth],
    y: [yc, yc],
  };
}
