import type { ChannelParams } from '../../types';
import { specificEnergy } from './specific-energy';
import { criticalDepth } from './critical-depth';
import { bisection } from '../utils/solvers';

/**
 * Find the alternate depth given a known depth y1 and discharge Q.
 * The alternate depth y2 satisfies E(y2) = E(y1) but y2 ≠ y1.
 *
 * Returns { sub, sup } — subcritical and supercritical alternate depths.
 */
export function alternateDepths(
  y1: number,
  Q: number,
  g: number,
  params: ChannelParams
): { sub: number; sup: number } {
  const E1 = specificEnergy(y1, Q, g, params);
  const yc = criticalDepth(Q, g, params);

  const f = (y: number) => specificEnergy(y, Q, g, params) - E1;

  let sub: number, sup: number;

  if (y1 > yc) {
    // y1 is subcritical, find supercritical alternate
    sub = y1;
    sup = bisection(f, 0.001, yc * 0.999, { tol: 1e-8 });
  } else {
    // y1 is supercritical, find subcritical alternate
    sup = y1;
    sub = bisection(f, yc * 1.001, y1 * 20, { tol: 1e-8 });
  }

  return { sub, sup };
}

/**
 * Find alternate depths for a given specific energy E and discharge Q.
 */
export function alternateDepthsFromE(
  E: number,
  Q: number,
  g: number,
  params: ChannelParams
): { sub: number; sup: number } {
  const yc = criticalDepth(Q, g, params);

  const f = (y: number) => specificEnergy(y, Q, g, params) - E;

  const sub = bisection(f, yc * 1.001, E * 2, { tol: 1e-8 });
  const sup = bisection(f, 0.001, yc * 0.999, { tol: 1e-8 });

  return { sub, sup };
}
