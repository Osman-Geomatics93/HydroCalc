/**
 * Stokes law fall velocity for small particles (Re < 1):
 * ws = (γs - γw) d² / (18μ)
 * Simplified: ws = (SG - 1) g d² / (18ν)
 */
export function stokesVelocity(d: number, SG: number, g: number, nu: number): number {
  return ((SG - 1) * g * d * d) / (18 * nu);
}

/**
 * Rubey's fall velocity formula (valid for wider range):
 * ws = F(d) √((SG-1)gd)
 * F(d) = √(2/3 + 36ν²/((SG-1)gd³)) - √(36ν²/((SG-1)gd³))
 */
export function rubeyVelocity(d: number, SG: number, g: number, nu: number): number {
  const term = (36 * nu * nu) / ((SG - 1) * g * d * d * d);
  const F = Math.sqrt(2 / 3 + term) - Math.sqrt(term);
  return F * Math.sqrt((SG - 1) * g * d);
}

/**
 * Particle Reynolds number: Re* = ws·d / ν
 */
export function particleReynolds(ws: number, d: number, nu: number): number {
  return (ws * d) / nu;
}
