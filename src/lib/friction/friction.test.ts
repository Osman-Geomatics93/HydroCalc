import { describe, it, expect } from 'vitest';
import { manningVelocity, manningDischarge } from './manning';
import { normalDepth } from './normal-depth';
import { classifySlope } from './classification';

describe('manningVelocity', () => {
  it('computes V = (1/n) R^(2/3) S^(1/2) in SI', () => {
    const V = manningVelocity(0.013, 0.5, 0.001, 'SI');
    const expected = (1 / 0.013) * Math.pow(0.5, 2 / 3) * Math.sqrt(0.001);
    expect(V).toBeCloseTo(expected, 4);
  });

  it('uses k=1.486 for US units', () => {
    const V = manningVelocity(0.013, 0.5, 0.001, 'US');
    const expected = (1.486 / 0.013) * Math.pow(0.5, 2 / 3) * Math.sqrt(0.001);
    expect(V).toBeCloseTo(expected, 4);
  });
});

describe('normalDepth', () => {
  it('converges for rectangular channel', () => {
    const result = normalDepth(10, 0.013, 0.001, { shape: 'rectangular', b: 5 }, 'SI');
    expect(result.yn).toBeGreaterThan(0);
    expect(result.yn).toBeLessThan(10);

    // Verify: Q_manning at yn should equal Q
    const Q_check = manningDischarge(0.013, result.An, result.Rn, 0.001, 'SI');
    expect(Q_check).toBeCloseTo(10, 4);
  });

  it('converges for trapezoidal channel', () => {
    const result = normalDepth(15, 0.025, 0.002, { shape: 'trapezoidal', b: 4, m: 2 }, 'SI');
    expect(result.yn).toBeGreaterThan(0);
  });
});

describe('classifySlope', () => {
  it('classifies mild slope', () => {
    expect(classifySlope(0.001, 2.0, 1.0)).toBe('Mild');
  });

  it('classifies steep slope', () => {
    expect(classifySlope(0.01, 0.5, 1.0)).toBe('Steep');
  });

  it('classifies horizontal', () => {
    expect(classifySlope(0, 0, 1.0)).toBe('Horizontal');
  });

  it('classifies adverse', () => {
    expect(classifySlope(-0.001, 0, 1.0)).toBe('Adverse');
  });
});
