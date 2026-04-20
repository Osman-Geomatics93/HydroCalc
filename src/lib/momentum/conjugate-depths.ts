import type { ChannelParams, HydraulicJumpResult } from '../../types';
import { computeGeometry } from '../geometry';
import { froudeFromQ } from '../energy/froude';
import { momentumFunction } from './momentum-function';
import { bisection } from '../utils/solvers';
import { criticalDepth } from '../energy/critical-depth';

/**
 * Conjugate depth for rectangular channel (Belanger equation):
 * y₂ = (y₁/2)(√(1 + 8Fr₁²) - 1)
 */
export function conjugateDepthRect(y1: number, Fr1: number): number {
  return (y1 / 2) * (Math.sqrt(1 + 8 * Fr1 * Fr1) - 1);
}

/**
 * General conjugate depth: find y₂ such that M(y₂) = M(y₁), y₂ ≠ y₁
 */
export function conjugateDepth(
  y1: number,
  Q: number,
  g: number,
  params: ChannelParams
): number {
  const M1 = momentumFunction(y1, Q, g, params);
  const yc = criticalDepth(Q, g, params);

  const f = (y: number) => momentumFunction(y, Q, g, params) - M1;

  if (y1 < yc) {
    // y1 is supercritical, find subcritical conjugate
    return bisection(f, yc * 1.001, y1 * 50, { tol: 1e-8 });
  } else {
    // y1 is subcritical, find supercritical conjugate
    return bisection(f, 0.001, yc * 0.999, { tol: 1e-8 });
  }
}

/**
 * Full hydraulic jump result
 */
export function hydraulicJump(
  y1: number,
  Q: number,
  g: number,
  params: ChannelParams
): HydraulicJumpResult {
  const geo1 = computeGeometry(params, y1);
  const Fr1 = froudeFromQ(Q, g, geo1);

  const y2 = conjugateDepth(y1, Q, g, params);
  const geo2 = computeGeometry(params, y2);
  const Fr2 = froudeFromQ(Q, g, geo2);

  // Energy loss
  const E1 = y1 + (Q * Q) / (2 * g * geo1.A * geo1.A);
  const E2 = y2 + (Q * Q) / (2 * g * geo2.A * geo2.A);
  const energyLoss = E1 - E2;

  let jumpType: string;
  if (Fr1 < 1.7) jumpType = 'Undular';
  else if (Fr1 < 2.5) jumpType = 'Weak';
  else if (Fr1 < 4.5) jumpType = 'Oscillating';
  else if (Fr1 < 9) jumpType = 'Steady';
  else jumpType = 'Strong';

  return { y1, y2, Fr1, Fr2, energyLoss, jumpType };
}
