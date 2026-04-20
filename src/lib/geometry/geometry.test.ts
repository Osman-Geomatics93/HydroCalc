import { describe, it, expect } from 'vitest';
import { rectangularGeometry } from './rectangular';
import { trapezoidalGeometry } from './trapezoidal';
import { triangularGeometry } from './triangular';
import { circularGeometry } from './circular';

describe('rectangularGeometry', () => {
  it('computes correctly for b=3, y=2', () => {
    const g = rectangularGeometry(3, 2);
    expect(g.A).toBeCloseTo(6, 8);
    expect(g.P).toBeCloseTo(7, 8);
    expect(g.R).toBeCloseTo(6 / 7, 8);
    expect(g.T).toBeCloseTo(3, 8);
    expect(g.D).toBeCloseTo(2, 8);
  });
});

describe('trapezoidalGeometry', () => {
  it('computes correctly for b=4, m=2, y=1', () => {
    const g = trapezoidalGeometry(4, 2, 1);
    // A = (4 + 2*1)*1 = 6
    expect(g.A).toBeCloseTo(6, 8);
    // P = 4 + 2*1*√5 = 4 + 4.472
    expect(g.P).toBeCloseTo(4 + 2 * Math.sqrt(5), 6);
    // T = 4 + 2*2*1 = 8
    expect(g.T).toBeCloseTo(8, 8);
  });

  it('reduces to rectangular when m=0', () => {
    const g = trapezoidalGeometry(3, 0, 2);
    expect(g.A).toBeCloseTo(6, 8);
    expect(g.P).toBeCloseTo(7, 8);
  });
});

describe('triangularGeometry', () => {
  it('computes correctly for m=1, y=2', () => {
    const g = triangularGeometry(1, 2);
    // A = 1*4 = 4
    expect(g.A).toBeCloseTo(4, 8);
    // P = 2*2*√2
    expect(g.P).toBeCloseTo(4 * Math.sqrt(2), 6);
    // T = 2*1*2 = 4
    expect(g.T).toBeCloseTo(4, 8);
    // D = A/T = 1
    expect(g.D).toBeCloseTo(1, 8);
  });
});

describe('circularGeometry', () => {
  it('half-full circle d=2 gives A=πr²/2', () => {
    const g = circularGeometry(2, 1); // half full
    expect(g.A).toBeCloseTo(Math.PI / 2, 4);
    expect(g.P).toBeCloseTo(Math.PI, 4);
    expect(g.T).toBeCloseTo(2, 4);
  });

  it('full circle gives A=πr²', () => {
    const g = circularGeometry(2, 2);
    expect(g.A).toBeCloseTo(Math.PI, 4);
    expect(g.P).toBeCloseTo(2 * Math.PI, 4);
  });
});
