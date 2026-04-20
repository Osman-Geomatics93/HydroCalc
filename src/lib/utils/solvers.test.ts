import { describe, it, expect } from 'vitest';
import { bisection, newtonRaphson, secant } from './solvers';

describe('bisection', () => {
  it('finds root of x²-4 = 0 (positive root)', () => {
    const root = bisection((x) => x * x - 4, 0, 5);
    expect(root).toBeCloseTo(2, 8);
  });

  it('finds root of x²-4 = 0 (negative root)', () => {
    const root = bisection((x) => x * x - 4, -5, 0);
    expect(root).toBeCloseTo(-2, 8);
  });

  it('finds root of sin(x) near π', () => {
    const root = bisection(Math.sin, 3, 4);
    expect(root).toBeCloseTo(Math.PI, 8);
  });

  it('throws if same sign at endpoints', () => {
    expect(() => bisection((x) => x * x + 1, 0, 5)).toThrow();
  });
});

describe('newtonRaphson', () => {
  it('finds root of x²-4 = 0', () => {
    const root = newtonRaphson(
      (x) => x * x - 4,
      (x) => 2 * x,
      3
    );
    expect(root).toBeCloseTo(2, 8);
  });

  it('finds cube root of 27', () => {
    const root = newtonRaphson(
      (x) => x * x * x - 27,
      (x) => 3 * x * x,
      5
    );
    expect(root).toBeCloseTo(3, 8);
  });
});

describe('secant', () => {
  it('finds root of x²-4 = 0', () => {
    const root = secant((x) => x * x - 4, 1, 3);
    expect(root).toBeCloseTo(2, 8);
  });

  it('finds root of cos(x) near π/2', () => {
    const root = secant(Math.cos, 1, 2);
    expect(root).toBeCloseTo(Math.PI / 2, 8);
  });
});
