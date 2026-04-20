/**
 * Einstein-Brown bed load transport formula:
 *
 * Φ = f(Ψ)  where:
 *   Ψ = (γs-γw)d / (γw R Sf)  [flow intensity]
 *   Φ = qs / (d √((SG-1)gd))  [transport intensity]
 *
 * Einstein-Brown relation: Φ = 40(1/Ψ)³  for Ψ < 0.3 (high transport)
 * More general: Φ = K (1/Ψ)³  where K ≈ 40
 */

/**
 * Flow intensity parameter Ψ = (γs-γw)d / (γw R Sf)
 */
export function flowIntensity(
  gammaS: number,
  gammaW: number,
  d: number,
  R: number,
  Sf: number
): number {
  if (R <= 0 || Sf <= 0) return Infinity;
  return ((gammaS - gammaW) * d) / (gammaW * R * Sf);
}

/**
 * Transport intensity Φ using Einstein-Brown relation
 */
export function transportIntensity(psi: number): number {
  if (psi <= 0) return 0;
  return 40 * Math.pow(1 / psi, 3);
}

/**
 * Unit bed load transport rate qs from Φ:
 * qs = Φ · d · √((SG-1)gd)
 */
export function bedLoadRate(
  phi: number,
  d: number,
  SG: number,
  g: number
): number {
  return phi * d * Math.sqrt((SG - 1) * g * d);
}

/**
 * Total bed load for channel width b: Qs = qs · b
 */
export function totalBedLoad(qs: number, b: number): number {
  return qs * b;
}
