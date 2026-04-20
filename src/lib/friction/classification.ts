/**
 * Reach (slope) classification based on normal depth vs critical depth.
 *
 * Mild (M):     yn > yc  (S0 < Sc)
 * Steep (S):    yn < yc  (S0 > Sc)
 * Critical (C): yn ≈ yc  (S0 = Sc)
 * Horizontal (H): S0 = 0
 * Adverse (A):  S0 < 0
 */
export type SlopeClass = 'Mild' | 'Steep' | 'Critical' | 'Horizontal' | 'Adverse';

export function classifySlope(S0: number, yn: number, yc: number, tol = 0.01): SlopeClass {
  if (S0 < 0) return 'Adverse';
  if (S0 === 0) return 'Horizontal';
  const ratio = yn / yc;
  if (Math.abs(ratio - 1) < tol) return 'Critical';
  return ratio > 1 ? 'Mild' : 'Steep';
}

/**
 * Critical slope: the slope at which yn = yc for given Q, n, geometry.
 * Sc = (Qn / (kA R^(2/3)))² evaluated at y = yc
 */
export function criticalSlope(
  Q: number,
  n: number,
  Ac: number,
  Rc: number,
  k: number
): number {
  const conv = (k / n) * Ac * Math.pow(Rc, 2 / 3);
  return Math.pow(Q / conv, 2);
}
