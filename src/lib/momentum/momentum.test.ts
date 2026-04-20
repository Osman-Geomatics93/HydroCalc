import { describe, it, expect } from 'vitest';
import { momentumFunctionRect } from './momentum-function';
import { conjugateDepthRect, hydraulicJump } from './conjugate-depths';
import { jumpEnergyLossRect } from './energy-loss';

const g = 9.81;

describe('conjugateDepthRect', () => {
  it('Belanger equation: y₂ = (y₁/2)(√(1+8Fr₁²)-1)', () => {
    const y1 = 0.5;
    const q = 3;
    const V1 = q / y1;
    const Fr1 = V1 / Math.sqrt(g * y1);
    const y2 = conjugateDepthRect(y1, Fr1);

    // Verify M(y1) ≈ M(y2)
    const M1 = momentumFunctionRect(y1, q, g);
    const M2 = momentumFunctionRect(y2, q, g);
    expect(M1).toBeCloseTo(M2, 3);
  });
});

describe('jumpEnergyLossRect', () => {
  it('ΔE = (y₂ - y₁)³ / (4 y₁ y₂)', () => {
    const y1 = 0.3;
    const y2 = 2.5;
    const dE = jumpEnergyLossRect(y1, y2);
    const expected = Math.pow(y2 - y1, 3) / (4 * y1 * y2);
    expect(dE).toBeCloseTo(expected, 6);
  });
});

describe('hydraulicJump (general)', () => {
  it('computes jump for rectangular channel', () => {
    const result = hydraulicJump(0.3, 5, g, { shape: 'rectangular', b: 3 });
    expect(result.y2).toBeGreaterThan(result.y1);
    expect(result.Fr1).toBeGreaterThan(1);
    expect(result.Fr2).toBeLessThan(1);
    expect(result.energyLoss).toBeGreaterThan(0);
  });
});
