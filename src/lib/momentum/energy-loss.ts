/**
 * Energy loss across a hydraulic jump (rectangular channel):
 * ΔE = (y₂ - y₁)³ / (4 y₁ y₂)
 */
export function jumpEnergyLossRect(y1: number, y2: number): number {
  return Math.pow(y2 - y1, 3) / (4 * y1 * y2);
}

/**
 * Relative energy loss: ΔE / E₁
 */
export function relativeEnergyLoss(deltaE: number, E1: number): number {
  return E1 > 0 ? deltaE / E1 : 0;
}
