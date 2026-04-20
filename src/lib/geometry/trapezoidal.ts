import type { ChannelGeometry } from '../../types';

/** Trapezoidal channel geometry: bottom width b, side slope m (H:V), depth y */
export function trapezoidalGeometry(b: number, m: number, y: number): ChannelGeometry {
  const A = (b + m * y) * y;
  const P = b + 2 * y * Math.sqrt(1 + m * m);
  const R = A / P;
  const T = b + 2 * m * y;
  const D = A / T;
  return { A, P, R, T, D };
}

export function trapezoidalCrossSection(b: number, m: number, y: number): { x: number[]; y: number[] } {
  const topHalf = b / 2 + m * y;
  return {
    x: [-topHalf, -b / 2, b / 2, topHalf],
    y: [y, 0, 0, y],
  };
}
