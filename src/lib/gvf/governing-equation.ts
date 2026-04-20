import type { ChannelParams, UnitSystem } from '../../types';
import { computeGeometry } from '../geometry';
import { froudeFromQ } from '../energy/froude';
import { frictionSlope } from '../friction/manning';

/**
 * GVF governing equation:
 * dy/dx = (S₀ - Sf) / (1 - Fr²)
 */
export function dydx(
  y: number,
  Q: number,
  S0: number,
  n: number,
  g: number,
  params: ChannelParams,
  units: UnitSystem
): number {
  const geo = computeGeometry(params, y);
  if (geo.A <= 0) return 0;

  const V = Q / geo.A;
  const Sf = frictionSlope(n, V, geo.R, units);
  const Fr = froudeFromQ(Q, g, geo);
  const Fr2 = Fr * Fr;

  if (Math.abs(1 - Fr2) < 1e-6) return 0; // avoid division by zero at critical

  return (S0 - Sf) / (1 - Fr2);
}
