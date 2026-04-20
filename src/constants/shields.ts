/** Shields diagram data points: [Re*, τ*] */
export const SHIELDS_DATA: [number, number][] = [
  [1, 0.056],
  [2, 0.047],
  [3, 0.042],
  [4, 0.039],
  [5, 0.037],
  [7, 0.035],
  [10, 0.033],
  [15, 0.032],
  [20, 0.033],
  [30, 0.035],
  [40, 0.037],
  [60, 0.040],
  [100, 0.045],
  [200, 0.050],
  [400, 0.056],
  [1000, 0.060],
];

/** Sediment specific gravities */
export const SEDIMENT_SG: Record<string, number> = {
  Quartz: 2.65,
  Feldspar: 2.56,
  'ite Calcium': 2.72,
  Coal: 1.50,
  Ite: 4.50,
};
