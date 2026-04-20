/**
 * Numerical root-finding solvers.
 * All functions find x such that f(x) = 0.
 */

export interface SolverOptions {
  tol?: number;
  maxIter?: number;
}

/**
 * Bisection method — guaranteed convergence if f(a) and f(b) have opposite signs.
 */
export function bisection(
  f: (x: number) => number,
  a: number,
  b: number,
  opts: SolverOptions = {}
): number {
  const { tol = 1e-10, maxIter = 100 } = opts;
  let fa = f(a);
  if (Math.abs(fa) < tol) return a;
  let fb = f(b);
  if (Math.abs(fb) < tol) return b;

  if (fa * fb > 0) {
    throw new Error(`Bisection: f(a) and f(b) must have opposite signs. f(${a})=${fa}, f(${b})=${fb}`);
  }

  for (let i = 0; i < maxIter; i++) {
    const mid = (a + b) / 2;
    const fm = f(mid);
    if (Math.abs(fm) < tol || (b - a) / 2 < tol) return mid;
    if (fa * fm < 0) {
      b = mid;
      fb = fm;
    } else {
      a = mid;
      fa = fm;
    }
  }
  return (a + b) / 2;
}

/**
 * Newton-Raphson method — fast convergence when derivative is available.
 */
export function newtonRaphson(
  f: (x: number) => number,
  df: (x: number) => number,
  x0: number,
  opts: SolverOptions = {}
): number {
  const { tol = 1e-10, maxIter = 50 } = opts;
  let x = x0;

  for (let i = 0; i < maxIter; i++) {
    const fx = f(x);
    if (Math.abs(fx) < tol) return x;
    const dfx = df(x);
    if (Math.abs(dfx) < 1e-15) {
      throw new Error('Newton-Raphson: derivative is zero');
    }
    x = x - fx / dfx;
  }
  return x;
}

/**
 * Secant method — when derivative is not available.
 */
export function secant(
  f: (x: number) => number,
  x0: number,
  x1: number,
  opts: SolverOptions = {}
): number {
  const { tol = 1e-10, maxIter = 50 } = opts;
  let xPrev = x0;
  let xCurr = x1;
  let fPrev = f(xPrev);

  for (let i = 0; i < maxIter; i++) {
    const fCurr = f(xCurr);
    if (Math.abs(fCurr) < tol) return xCurr;

    const denom = fCurr - fPrev;
    if (Math.abs(denom) < 1e-15) return xCurr;

    const xNext = xCurr - fCurr * (xCurr - xPrev) / denom;
    xPrev = xCurr;
    fPrev = fCurr;
    xCurr = xNext;
  }
  return xCurr;
}
