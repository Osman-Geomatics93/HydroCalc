import { describe, it, expect } from 'vitest';
import { bestHydraulicSection, checkVelocityLimits, designChannel } from './channel-design';

describe('bestHydraulicSection', () => {
  it('rectangular: b/y = 2', () => {
    const result = bestHydraulicSection('rectangular');
    expect(result.ratio).toBe('b/y = 2');
    expect(result.description).toContain('width');
  });

  it('trapezoidal: m = 1/√3', () => {
    const result = bestHydraulicSection('trapezoidal');
    expect(result.ratio).toContain('√3');
  });

  it('triangular: m = 1', () => {
    const result = bestHydraulicSection('triangular');
    expect(result.ratio).toContain('m = 1');
  });

  it('circular: y/d ≈ 0.938', () => {
    const result = bestHydraulicSection('circular');
    expect(result.ratio).toContain('0.938');
  });
});

describe('checkVelocityLimits', () => {
  it('returns safe for low velocity in concrete', () => {
    const result = checkVelocityLimits(3.0, 'Concrete');
    expect(result.safe).toBe(true);
    expect(result.limit).toBe(6.0);
    expect(result.material).toBe('Concrete');
  });

  it('returns unsafe when velocity exceeds limit', () => {
    const result = checkVelocityLimits(2.0, 'Fine sand');
    expect(result.safe).toBe(false);
    expect(result.limit).toBe(0.5);
  });

  it('defaults to Clay loam when no material specified', () => {
    const result = checkVelocityLimits(0.5);
    expect(result.material).toBe('Clay loam');
    expect(result.safe).toBe(true);
  });

  it('returns safe at exactly the limit', () => {
    const result = checkVelocityLimits(2.0, 'Gravel');
    expect(result.safe).toBe(true);
    expect(result.limit).toBe(2.0);
  });
});

describe('designChannel', () => {
  const g = 9.81;

  it('designs a rectangular channel (best hydraulic section)', () => {
    const result = designChannel(
      { Q: 10, n: 0.013, S0: 0.001 },
      'rectangular',
      'SI',
      g
    );
    expect(result.shape).toBe('rectangular');
    expect(result.b).toBeGreaterThan(0);
    expect(result.yn).toBeGreaterThan(0);
    expect(result.V).toBeGreaterThan(0);
    // Best section: b ≈ 2 * yn
    expect(result.b).toBeCloseTo(2 * result.yn, 1);
  });

  it('designs a trapezoidal channel', () => {
    const result = designChannel(
      { Q: 15, n: 0.015, S0: 0.002 },
      'trapezoidal',
      'SI',
      g
    );
    expect(result.shape).toBe('trapezoidal');
    expect(result.b).toBeGreaterThan(0);
    expect(result.m).toBeGreaterThan(0);
    expect(result.yn).toBeGreaterThan(0);
    expect(result.A).toBeGreaterThan(0);
    expect(result.P).toBeGreaterThan(0);
    expect(result.R).toBeGreaterThan(0);
  });

  it('designs a triangular channel', () => {
    const result = designChannel(
      { Q: 5, n: 0.013, S0: 0.001 },
      'triangular',
      'SI',
      g
    );
    expect(result.shape).toBe('triangular');
    expect(result.b).toBe(0);
    expect(result.m).toBe(1); // Best section
    expect(result.yn).toBeGreaterThan(0);
  });

  it('includes freeboard in total depth', () => {
    const result = designChannel(
      { Q: 10, n: 0.013, S0: 0.001 },
      'rectangular',
      'SI',
      g
    );
    expect(result.y).toBeGreaterThan(result.yn);
    expect(result.freeboard).toBeGreaterThan(0);
  });

  it('warns when velocity exceeds max', () => {
    const result = designChannel(
      { Q: 10, n: 0.013, S0: 0.01, maxVelocity: 0.5 },
      'rectangular',
      'SI',
      g
    );
    expect(result.warnings.some(w => w.includes('Velocity'))).toBe(true);
  });

  it('respects maxSideSlope constraint for trapezoidal', () => {
    const result = designChannel(
      { Q: 10, n: 0.013, S0: 0.001, maxSideSlope: 1.0 },
      'trapezoidal',
      'SI',
      g
    );
    // Best trapezoidal m = 1/√3 ≈ 0.577, which is < 1.0, so should use best section
    expect(result.m).toBeCloseTo(1 / Math.sqrt(3), 2);
  });

  it('works with US customary units', () => {
    const result = designChannel(
      { Q: 100, n: 0.013, S0: 0.001 },
      'rectangular',
      'US',
      32.2
    );
    expect(result.b).toBeGreaterThan(0);
    expect(result.yn).toBeGreaterThan(0);
    expect(result.V).toBeGreaterThan(0);
  });

  it('has efficiency value', () => {
    const result = designChannel(
      { Q: 10, n: 0.013, S0: 0.001 },
      'rectangular',
      'SI',
      g
    );
    expect(result.efficiency).toBeGreaterThan(0);
    expect(result.efficiency).toBeLessThanOrEqual(1.001); // allow small rounding
  });
});
