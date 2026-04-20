import type { UnitSystem } from '../../types';
import { getManningK } from '../../constants/physics';

/**
 * Manning's equation: V = (k/n) R^(2/3) Sf^(1/2)
 * k = 1.0 (SI) or 1.486 (US)
 */
export function manningVelocity(n: number, R: number, Sf: number, units: UnitSystem): number {
  const k = getManningK(units);
  return (k / n) * Math.pow(R, 2 / 3) * Math.sqrt(Sf);
}

/**
 * Manning's discharge: Q = (k/n) A R^(2/3) Sf^(1/2)
 */
export function manningDischarge(n: number, A: number, R: number, Sf: number, units: UnitSystem): number {
  return A * manningVelocity(n, R, Sf, units);
}

/**
 * Friction slope from Manning's: Sf = (nV/(kR^(2/3)))²
 */
export function frictionSlope(n: number, V: number, R: number, units: UnitSystem): number {
  const k = getManningK(units);
  return Math.pow((n * V) / (k * Math.pow(R, 2 / 3)), 2);
}

/**
 * Conveyance: K = (k/n) A R^(2/3)
 * Q = K √Sf
 */
export function conveyance(n: number, A: number, R: number, units: UnitSystem): number {
  const k = getManningK(units);
  return (k / n) * A * Math.pow(R, 2 / 3);
}
