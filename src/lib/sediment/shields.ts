import { SHIELDS_DATA } from '../../constants/shields';
import { logLogInterpolate } from '../utils/interpolation';

/**
 * Shields parameter (dimensionless shear stress):
 * τ* = τ₀ / ((γs - γw) d)
 */
export function shieldsParameter(
  tau0: number,
  gammaS: number,
  gammaW: number,
  d: number
): number {
  return tau0 / ((gammaS - gammaW) * d);
}

/**
 * Critical Shields parameter from Shields diagram, given boundary Re*.
 * Re* = u* d / ν  where u* = √(τ₀/ρ)
 */
export function criticalShieldsParameter(ReStar: number): number {
  return logLogInterpolate(SHIELDS_DATA, ReStar);
}

/**
 * Critical shear stress:
 * τ_cr = τ*_cr (γs - γw) d
 */
export function criticalShearStress(
  tauStarCr: number,
  gammaS: number,
  gammaW: number,
  d: number
): number {
  return tauStarCr * (gammaS - gammaW) * d;
}

/**
 * Bed shear stress from flow:
 * τ₀ = γw R Sf
 */
export function bedShearStress(gammaW: number, R: number, Sf: number): number {
  return gammaW * R * Sf;
}

/**
 * Check if sediment motion occurs: τ₀ > τ_cr
 */
export function isMotion(tau0: number, tauCr: number): boolean {
  return tau0 > tauCr;
}
