import { describe, it, expect } from 'vitest';
import { specificEnergyRect } from './specific-energy';
import { criticalDepthRect, criticalDepth } from './critical-depth';
import { alternateDepths } from './alternate-depths';
import { froudeNumber } from './froude';

const g = 9.81;

describe('specificEnergyRect', () => {
  it('E = y + q²/(2gy²)', () => {
    const q = 2; // m³/s per m
    const y = 1;
    const E = specificEnergyRect(y, q, g);
    expect(E).toBeCloseTo(1 + 4 / (2 * 9.81), 4);
  });
});

describe('criticalDepthRect', () => {
  it('yc = (q²/g)^(1/3)', () => {
    const q = 2;
    const yc = criticalDepthRect(q, g);
    expect(yc).toBeCloseTo(Math.pow(4 / g, 1 / 3), 6);
  });

  it('E at critical depth = 3/2 yc', () => {
    const q = 3;
    const yc = criticalDepthRect(q, g);
    const Ec = specificEnergyRect(yc, q, g);
    expect(Ec).toBeCloseTo(1.5 * yc, 4);
  });

  it('Froude number at critical depth = 1', () => {
    const q = 2;
    const yc = criticalDepthRect(q, g);
    const V = q / yc;
    const Fr = froudeNumber(V, g, yc); // D = y for rectangular
    expect(Fr).toBeCloseTo(1.0, 4);
  });
});

describe('criticalDepth (general)', () => {
  it('trapezoidal critical depth converges', () => {
    const Q = 10;
    const yc = criticalDepth(Q, g, { shape: 'trapezoidal', b: 3, m: 2 });
    expect(yc).toBeGreaterThan(0);
    expect(yc).toBeLessThan(10);
  });
});

describe('alternateDepths', () => {
  it('alternate depths have same specific energy', () => {
    const q = 2;
    const params = { shape: 'rectangular' as const, b: 5 };
    const Q = q * 5;
    const y1 = 2;
    const { sub, sup } = alternateDepths(y1, Q, g, params);

    // Both should give same E
    const E1 = specificEnergyRect(y1, q, g);
    const E2sub = specificEnergyRect(sub, q, g);
    const E2sup = specificEnergyRect(sup, q, g);
    expect(E2sub).toBeCloseTo(E1, 3);
    expect(E2sup).toBeCloseTo(E1, 3);
    expect(sub).toBeGreaterThan(sup);
  });
});
