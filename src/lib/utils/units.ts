import type { UnitSystem, UnitLabels } from '../../types';

const FT_PER_M = 3.28084;

export function convertLength(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value;
  return from === 'SI' ? value * FT_PER_M : value / FT_PER_M;
}

export function convertArea(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value;
  return from === 'SI' ? value * FT_PER_M ** 2 : value / FT_PER_M ** 2;
}

export function convertVelocity(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value;
  return from === 'SI' ? value * FT_PER_M : value / FT_PER_M;
}

export function convertDischarge(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value;
  return from === 'SI' ? value * FT_PER_M ** 3 : value / FT_PER_M ** 3;
}

export function getUnitLabels(units: UnitSystem): UnitLabels {
  if (units === 'SI') {
    return { length: 'm', area: 'm²', velocity: 'm/s', discharge: 'm³/s', slope: 'm/m' };
  }
  return { length: 'ft', area: 'ft²', velocity: 'ft/s', discharge: 'ft³/s', slope: 'ft/ft' };
}
