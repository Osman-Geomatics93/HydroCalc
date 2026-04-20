import { computeGeometry } from '../geometry';
import { normalDepth } from '../friction/normal-depth';
import { criticalDepth } from '../energy/critical-depth';
import { froudeFromQ } from '../energy/froude';
import type { ChannelParams, UnitSystem } from '../../types';

export interface CalculatorSchema {
  label: string;
  inputColumns: string[];
  outputColumns: string[];
}

export const BATCH_CALCULATORS: Record<string, CalculatorSchema> = {
  geometry: {
    label: 'Channel Geometry',
    inputColumns: ['b', 'y', 'm'],
    outputColumns: ['A', 'P', 'R', 'T', 'D'],
  },
  'normal-depth': {
    label: 'Normal Depth',
    inputColumns: ['Q', 'b', 'n', 'S0'],
    outputColumns: ['yn', 'Vn', 'An', 'Rn'],
  },
  'critical-depth': {
    label: 'Critical Depth',
    inputColumns: ['Q', 'b'],
    outputColumns: ['yc'],
  },
  'froude': {
    label: 'Froude Number',
    inputColumns: ['Q', 'b', 'y'],
    outputColumns: ['Fr'],
  },
};

export function getCalculatorSchema(calcType: string): CalculatorSchema | undefined {
  return BATCH_CALCULATORS[calcType];
}

export function runBatchComputation(
  calcType: string,
  rows: Record<string, number>[],
  units: UnitSystem,
  g: number
): Record<string, number | string>[] {
  return rows.map((row) => {
    try {
      switch (calcType) {
        case 'geometry': {
          const params: ChannelParams = row.m
            ? { shape: 'trapezoidal', b: row.b, m: row.m }
            : { shape: 'rectangular', b: row.b };
          const geo = computeGeometry(params, row.y);
          return { ...row, A: geo.A, P: geo.P, R: geo.R, T: geo.T, D: geo.D };
        }
        case 'normal-depth': {
          const params: ChannelParams = { shape: 'rectangular', b: row.b };
          const nd = normalDepth(row.Q, row.n, row.S0, params, units);
          return { ...row, yn: nd.yn, Vn: nd.Vn, An: nd.An, Rn: nd.Rn };
        }
        case 'critical-depth': {
          const params: ChannelParams = { shape: 'rectangular', b: row.b };
          const yc = criticalDepth(row.Q, g, params);
          return { ...row, yc };
        }
        case 'froude': {
          const params: ChannelParams = { shape: 'rectangular', b: row.b };
          const geo = computeGeometry(params, row.y);
          const Fr = froudeFromQ(row.Q, g, geo);
          return { ...row, Fr };
        }
        default:
          return { ...row, error: 'Unknown calculator' };
      }
    } catch (e) {
      return { ...row, error: String(e instanceof Error ? e.message : 'Computation error') };
    }
  });
}
