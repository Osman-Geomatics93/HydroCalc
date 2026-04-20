import type { UnitSystem } from '../types';

export const GRAVITY = { SI: 9.81, US: 32.2 } as const;
export const MANNING_K = { SI: 1.0, US: 1.486 } as const;

/** Kinematic viscosity of water at 20°C */
export const WATER_VISCOSITY = { SI: 1.004e-6, US: 1.081e-5 } as const;

/** Water density */
export const WATER_DENSITY = { SI: 998, US: 1.94 } as const; // kg/m³ or slug/ft³

/** Specific weight of water */
export const WATER_SPECIFIC_WEIGHT = { SI: 9790, US: 62.4 } as const; // N/m³ or lb/ft³

export function getGravity(units: UnitSystem): number {
  return GRAVITY[units];
}

export function getManningK(units: UnitSystem): number {
  return MANNING_K[units];
}
