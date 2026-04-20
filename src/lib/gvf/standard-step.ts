import type { ChannelParams, GVFStep, UnitSystem } from '../../types';
import { computeGeometry } from '../geometry';
import { frictionSlope } from '../friction/manning';
import { froudeFromQ } from '../energy/froude';

/**
 * Standard Step Method for GVF computation.
 *
 * Given a starting depth y0 at x=0, computes the water surface profile
 * by marching in the downstream (or upstream) direction.
 *
 * Uses energy balance: E₁ + S₀Δx = E₂ + SfΔx
 * => Δx = (E₂ - E₁) / (S₀ - Sf_avg)
 */
export function standardStep(
  y0: number,
  Q: number,
  S0: number,
  n: number,
  g: number,
  params: ChannelParams,
  units: UnitSystem,
  options: {
    dx?: number;
    nSteps?: number;
    direction?: 'downstream' | 'upstream';
  } = {}
): GVFStep[] {
  const { dx = 10, nSteps = 200, direction = 'downstream' } = options;
  const sign = direction === 'downstream' ? 1 : -1;

  const steps: GVFStep[] = [];
  let y = y0;
  let x = 0;

  for (let i = 0; i <= nSteps; i++) {
    const geo = computeGeometry(params, y);
    if (geo.A <= 0) break;

    const V = Q / geo.A;
    const E = y + (V * V) / (2 * g);
    const Sf = frictionSlope(n, V, geo.R, units);
    const Fr = froudeFromQ(Q, g, geo);

    steps.push({ x, y, v: V, E, Sf, Fr });

    // Simple Euler step using dy/dx = (S0 - Sf)/(1 - Fr²)
    const Fr2 = Fr * Fr;
    if (Math.abs(1 - Fr2) < 0.01) break; // approaching critical depth

    const slope = (S0 - Sf) / (1 - Fr2);
    const actualDx = sign * dx;
    y = y + slope * actualDx;
    x = x + actualDx;

    if (y <= 0.001 || y > 100) break;
  }

  return steps;
}
