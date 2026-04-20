import type { ChannelGeometry } from '../../types';

/** Rectangular channel geometry: width b, depth y */
export function rectangularGeometry(b: number, y: number): ChannelGeometry {
  const A = b * y;
  const P = b + 2 * y;
  const R = A / P;
  const T = b;
  const D = A / T;
  return { A, P, R, T, D };
}

/** Cross-section polygon for plotting */
export function rectangularCrossSection(b: number, y: number): { x: number[]; y: number[] } {
  return {
    x: [-b / 2, -b / 2, b / 2, b / 2],
    y: [y, 0, 0, y],
  };
}
