import type { ChannelGeometry } from '../../types';

/** Triangular channel geometry: side slope m (H:V), depth y */
export function triangularGeometry(m: number, y: number): ChannelGeometry {
  const A = m * y * y;
  const P = 2 * y * Math.sqrt(1 + m * m);
  const R = A / P;
  const T = 2 * m * y;
  const D = A / T;
  return { A, P, R, T, D };
}

export function triangularCrossSection(m: number, y: number): { x: number[]; y: number[] } {
  const topHalf = m * y;
  return {
    x: [-topHalf, 0, topHalf],
    y: [y, 0, y],
  };
}
