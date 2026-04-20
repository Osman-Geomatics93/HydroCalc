import type { ChannelShape, ChannelParams, UnitSystem } from '../../types';
import type { DesignConstraints, DesignResult } from '../../types/design';
import { computeGeometry } from '../geometry';
import { normalDepth } from '../friction/normal-depth';
import { froudeFromQ } from '../../lib/energy/froude';

/**
 * Best hydraulic section ratios for each shape.
 */
export function bestHydraulicSection(shape: ChannelShape): { ratio: string; description: string } {
  switch (shape) {
    case 'rectangular':
      return { ratio: 'b/y = 2', description: 'Best rectangular section: bottom width equals twice the depth' };
    case 'trapezoidal':
      return { ratio: 'm = 1/√3 ≈ 0.577', description: 'Best trapezoidal section: side slope of 1/√3 (60° angle)' };
    case 'triangular':
      return { ratio: 'm = 1', description: 'Best triangular section: 45° side slopes (m = 1)' };
    case 'circular':
      return { ratio: 'y/d = 0.938', description: 'Maximum discharge occurs at about 94% full' };
  }
}

/**
 * Check velocity against erosion limits for common materials.
 */
export function checkVelocityLimits(V: number, material?: string): { safe: boolean; limit: number; material: string } {
  const limits: Record<string, number> = {
    'Fine sand': 0.5,
    'Sandy loam': 0.75,
    'Clay loam': 1.0,
    'Stiff clay': 1.5,
    'Gravel': 2.0,
    'Cobbles': 3.5,
    'Concrete': 6.0,
    'Riprap': 5.0,
  };

  const mat = material || 'Clay loam';
  const limit = limits[mat] || 1.5;
  return { safe: V <= limit, limit, material: mat };
}

/**
 * Design a channel for given constraints and shape.
 */
export function designChannel(
  constraints: DesignConstraints,
  shape: ChannelShape,
  units: UnitSystem,
  g: number
): DesignResult {
  const { Q, n, S0 } = constraints;
  const warnings: string[] = [];

  let b = 0;
  let m = 0;
  let yn = 0;

  if (shape === 'rectangular') {
    // Best hydraulic section: b = 2y
    // Manning: Q = (k/n) * (2y²) * (2y² / (4y))^(2/3) * S0^(1/2)
    // Q = (k/n) * 2y² * (y/2)^(2/3) * S0^(1/2)
    // Solve for y iteratively
    const k = units === 'SI' ? 1.0 : 1.486;
    const target = Q;

    // Binary search for y
    let lo = 0.01, hi = 50;
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      const bTry = 2 * mid;
      const A = bTry * mid;
      const P = bTry + 2 * mid;
      const R = A / P;
      const Qtry = (k / n) * A * Math.pow(R, 2 / 3) * Math.sqrt(S0);
      if (Qtry < target) lo = mid; else hi = mid;
    }
    yn = (lo + hi) / 2;
    b = 2 * yn;
    m = 0;
  } else if (shape === 'trapezoidal') {
    // Best section: m = 1/sqrt(3)
    m = constraints.maxSideSlope !== undefined ? Math.min(constraints.maxSideSlope, 1 / Math.sqrt(3)) : 1 / Math.sqrt(3);
    const k = units === 'SI' ? 1.0 : 1.486;

    // For best trap section with given m: b = 2y(sqrt(1+m²) - m)
    let lo = 0.01, hi = 50;
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      const bTry = 2 * mid * (Math.sqrt(1 + m * m) - m);
      const A = (bTry + m * mid) * mid;
      const P = bTry + 2 * mid * Math.sqrt(1 + m * m);
      const R = A / P;
      const Qtry = (k / n) * A * Math.pow(R, 2 / 3) * Math.sqrt(S0);
      if (Qtry < Q) lo = mid; else hi = mid;
    }
    yn = (lo + hi) / 2;
    b = 2 * yn * (Math.sqrt(1 + m * m) - m);
  } else if (shape === 'triangular') {
    m = 1; // best section
    const k = units === 'SI' ? 1.0 : 1.486;

    let lo = 0.01, hi = 50;
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      const A = m * mid * mid;
      const P = 2 * mid * Math.sqrt(1 + m * m);
      const R = A / P;
      const Qtry = (k / n) * A * Math.pow(R, 2 / 3) * Math.sqrt(S0);
      if (Qtry < Q) lo = mid; else hi = mid;
    }
    yn = (lo + hi) / 2;
    b = 0;
  } else {
    // Circular — just find yn from normal depth
    const params: ChannelParams = { shape: 'circular', d: 2 }; // start guess
    try {
      const nd = normalDepth(Q, n, S0, params, units);
      yn = nd.yn;
    } catch {
      yn = 1;
    }
    b = 0;
  }

  const params: ChannelParams = shape === 'circular'
    ? { shape, d: yn * 2 }
    : shape === 'triangular'
    ? { shape, m }
    : { shape, b, m };

  const geo = computeGeometry(params, yn);
  const V = geo.A > 0 ? Q / geo.A : 0;
  const Fr = geo.A > 0 ? froudeFromQ(Q, g, geo) : 0;

  // Best section efficiency = (R of this design) / (R of best design)
  const bestR = shape === 'rectangular' ? yn / 2 : geo.R;
  const efficiency = bestR > 0 ? geo.R / bestR : 1;

  // Freeboard
  const freeboard = constraints.freeboard || (yn < 1 ? 0.3 : yn < 3 ? 0.5 : 0.75);

  // Warnings
  if (constraints.maxVelocity && V > constraints.maxVelocity) {
    warnings.push(`Velocity ${V.toFixed(2)} exceeds max ${constraints.maxVelocity} — consider larger section or lining`);
  }
  if (Fr > 0.86 && Fr < 1.13) {
    warnings.push('Near-critical flow — consider adjusting slope to avoid instability');
  }
  if (Fr > 1) {
    warnings.push('Supercritical flow — consider flatter slope or wider channel');
  }

  return {
    shape,
    b: Math.round(b * 1000) / 1000,
    m: Math.round(m * 1000) / 1000,
    y: Math.round((yn + freeboard) * 1000) / 1000,
    yn: Math.round(yn * 1000) / 1000,
    V: Math.round(V * 1000) / 1000,
    Fr: Math.round(Fr * 1000) / 1000,
    A: Math.round(geo.A * 1000) / 1000,
    P: Math.round(geo.P * 1000) / 1000,
    R: Math.round(geo.R * 1000) / 1000,
    freeboard: Math.round(freeboard * 1000) / 1000,
    efficiency: Math.round(efficiency * 1000) / 1000,
    warnings,
  };
}
