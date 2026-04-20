import type { ChannelParams } from '../../types';
import { computeGeometry } from '../geometry';

/**
 * Specific energy for rectangular channel: E = y + q²/(2gy²)
 * where q = Q/b (unit discharge)
 */
export function specificEnergyRect(y: number, q: number, g: number): number {
  if (y <= 0) return Infinity;
  return y + (q * q) / (2 * g * y * y);
}

/**
 * General specific energy: E = y + Q²/(2gA²)
 */
export function specificEnergy(y: number, Q: number, g: number, params: ChannelParams): number {
  if (y <= 0) return Infinity;
  const geo = computeGeometry(params, y);
  if (geo.A <= 0) return Infinity;
  return y + (Q * Q) / (2 * g * geo.A * geo.A);
}

/**
 * Generate E-y curve data for plotting.
 * Returns arrays of [y, E] pairs.
 */
export function generateEYCurve(
  Q: number,
  g: number,
  params: ChannelParams,
  yMax: number,
  nPoints = 200
): { y: number[]; E: number[] } {
  const ys: number[] = [];
  const Es: number[] = [];
  const yMin = 0.01;

  for (let i = 0; i < nPoints; i++) {
    const yi = yMin + (yMax - yMin) * (i / (nPoints - 1));
    const Ei = specificEnergy(yi, Q, g, params);
    if (isFinite(Ei) && Ei < yMax * 3) {
      ys.push(yi);
      Es.push(Ei);
    }
  }
  return { y: ys, E: Es };
}
