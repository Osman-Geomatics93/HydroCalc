import type { ChannelGeometry, FlowRegime } from '../../types';

/** Froude number: Fr = V / √(gD) where D = A/T (hydraulic depth) */
export function froudeNumber(V: number, g: number, D: number): number {
  if (D <= 0) return 0;
  return V / Math.sqrt(g * D);
}

/** Froude number from Q, geometry */
export function froudeFromQ(Q: number, g: number, geo: ChannelGeometry): number {
  if (geo.A <= 0 || geo.T <= 0) return 0;
  const V = Q / geo.A;
  return froudeNumber(V, g, geo.D);
}

export function classifyFlow(Fr: number): FlowRegime {
  if (Math.abs(Fr - 1) < 0.001) return 'critical';
  return Fr < 1 ? 'subcritical' : 'supercritical';
}
