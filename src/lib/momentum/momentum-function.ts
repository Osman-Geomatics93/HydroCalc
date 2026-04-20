import type { ChannelParams } from '../../types';
import { computeGeometry } from '../geometry';

/**
 * Momentum function for rectangular channel:
 * M = q²/(gy) + y²/2
 */
export function momentumFunctionRect(y: number, q: number, g: number): number {
  if (y <= 0) return Infinity;
  return (q * q) / (g * y) + (y * y) / 2;
}

/**
 * General momentum function: M = Q²/(gA) + ȳA
 * For rectangular: ȳ = y/2, A = by
 * For trapezoidal: ȳ = y(3b+2my)/(6(b+my))
 */
export function momentumFunction(y: number, Q: number, g: number, params: ChannelParams): number {
  if (y <= 0) return Infinity;
  const geo = computeGeometry(params, y);
  if (geo.A <= 0) return Infinity;

  // Centroid depth approximation using ȳ = A/(2T) for general shapes
  // More accurate: first moment of area / A
  let yBar: number;
  switch (params.shape) {
    case 'rectangular':
      yBar = y / 2;
      break;
    case 'trapezoidal': {
      const b = params.b!;
      const m = params.m!;
      yBar = y * (3 * b + 2 * m * y) / (6 * (b + m * y));
      break;
    }
    case 'triangular':
      yBar = y / 3;
      break;
    default:
      yBar = geo.D / 2; // approximate
  }

  return (Q * Q) / (g * geo.A) + yBar * geo.A;
}

/**
 * Generate M-y curve data
 */
export function generateMYCurve(
  Q: number,
  g: number,
  params: ChannelParams,
  yMax: number,
  nPoints = 200
): { y: number[]; M: number[] } {
  const ys: number[] = [];
  const Ms: number[] = [];
  const yMin = 0.01;

  for (let i = 0; i < nPoints; i++) {
    const yi = yMin + (yMax - yMin) * (i / (nPoints - 1));
    const Mi = momentumFunction(yi, Q, g, params);
    if (isFinite(Mi) && Mi < yMax * 10) {
      ys.push(yi);
      Ms.push(Mi);
    }
  }
  return { y: ys, M: Ms };
}
