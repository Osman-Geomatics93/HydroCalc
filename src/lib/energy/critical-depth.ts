import type { ChannelParams, CriticalFlowResult } from '../../types';
import { computeGeometry } from '../geometry';
import { bisection } from '../utils/solvers';

/**
 * Critical depth for rectangular channel: yc = (q²/g)^(1/3)
 */
export function criticalDepthRect(q: number, g: number): number {
  return Math.pow((q * q) / g, 1 / 3);
}

/**
 * Critical depth for general channel shape.
 * At critical depth: Q²T/(gA³) = 1  =>  f(y) = Q²T/(gA³) - 1 = 0
 */
export function criticalDepth(Q: number, g: number, params: ChannelParams): number {
  if (Q <= 0) return 0;

  if (params.shape === 'rectangular') {
    const q = Q / params.b!;
    return criticalDepthRect(q, g);
  }

  const f = (y: number): number => {
    const geo = computeGeometry(params, y);
    if (geo.A <= 0 || geo.T <= 0) return -1;
    return (Q * Q * geo.T) / (g * Math.pow(geo.A, 3)) - 1;
  };

  // Upper bound: for circular channels cap at diameter; otherwise use adaptive search
  let upper = params.shape === 'circular' ? (params.d! * 0.999) : 50;

  // Adaptive bracketing: scan to find a sign change
  const lower = 1e-6;
  let a = lower;
  let fa = f(a);
  const nScan = 200;
  for (let i = 1; i <= nScan; i++) {
    const b = lower + (upper - lower) * (i / nScan);
    const fb = f(b);
    if (fa * fb <= 0) {
      return bisection(f, a, b, { tol: 1e-8 });
    }
    a = b;
    fa = fb;
  }

  // Fallback: try extending upper bound for non-circular channels
  if (params.shape !== 'circular') {
    for (const tryUpper of [100, 500, 1000]) {
      const fb = f(tryUpper);
      if (f(lower) * fb <= 0) {
        return bisection(f, lower, tryUpper, { tol: 1e-8 });
      }
    }
  }

  // Last resort: return depth where f is closest to zero
  let bestY = lower;
  let bestAbs = Math.abs(f(lower));
  for (let i = 1; i <= nScan; i++) {
    const y = lower + (upper - lower) * (i / nScan);
    const absF = Math.abs(f(y));
    if (absF < bestAbs) {
      bestAbs = absF;
      bestY = y;
    }
  }
  return bestY;
}

/**
 * Full critical flow result
 */
export function criticalFlowResult(Q: number, g: number, params: ChannelParams): CriticalFlowResult {
  const yc = criticalDepth(Q, g, params);
  const geo = computeGeometry(params, yc);
  const Ac = geo.A > 0 ? geo.A : 1e-10;
  const Vc = Q / Ac;
  const Ec = yc + (Q * Q) / (2 * g * Ac * Ac);
  return { yc, Vc, Ec, Ac };
}
