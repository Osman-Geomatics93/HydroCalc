export type UnitSystem = 'SI' | 'US';

export interface ConversionFactors {
  length: number;      // m <-> ft
  area: number;        // m² <-> ft²
  velocity: number;    // m/s <-> ft/s
  discharge: number;   // m³/s <-> ft³/s
  slope: number;       // dimensionless
  manningK: number;    // 1.0 (SI) vs 1.486 (US)
  gravity: number;     // 9.81 vs 32.2
}

export interface UnitLabels {
  length: string;
  area: string;
  velocity: string;
  discharge: string;
  slope: string;
}
