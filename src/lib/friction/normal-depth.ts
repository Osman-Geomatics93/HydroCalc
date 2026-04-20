import type { ChannelParams, NormalDepthResult, UnitSystem } from '../../types';
import { computeGeometry } from '../geometry';
import { manningDischarge } from './manning';
import { bisection } from '../utils/solvers';

/**
 * Normal depth solver: find y_n such that Q_manning(y_n) = Q_target.
 * Uses bisection since Manning's Q(y) is monotonically increasing.
 */
export function normalDepth(
  Q: number,
  n: number,
  S0: number,
  params: ChannelParams,
  units: UnitSystem
): NormalDepthResult {
  if (Q <= 0 || S0 <= 0) {
    return { yn: 0, Vn: 0, An: 0, Rn: 0 };
  }

  const f = (y: number): number => {
    const geo = computeGeometry(params, y);
    return manningDischarge(n, geo.A, geo.R, S0, units) - Q;
  };

  // Upper bound: for circular channels cap at diameter
  const upper = params.shape === 'circular' ? (params.d! * 0.999) : 50;

  // Adaptive bracketing
  const lower = 1e-6;
  let a = lower;
  let fa = f(a);
  const nScan = 200;
  let yn = -1;

  for (let i = 1; i <= nScan; i++) {
    const b = lower + (upper - lower) * (i / nScan);
    const fb = f(b);
    if (fa * fb <= 0) {
      yn = bisection(f, a, b, { tol: 1e-8 });
      break;
    }
    a = b;
    fa = fb;
  }

  // Extend search for non-circular channels
  if (yn < 0 && params.shape !== 'circular') {
    for (const tryUpper of [100, 500, 1000]) {
      if (f(lower) * f(tryUpper) <= 0) {
        yn = bisection(f, lower, tryUpper, { tol: 1e-8 });
        break;
      }
    }
  }

  if (yn < 0) {
    throw new Error('Could not find normal depth');
  }

  const geo = computeGeometry(params, yn);
  const Vn = Q / geo.A;

  return { yn, Vn, An: geo.A, Rn: geo.R };
}
