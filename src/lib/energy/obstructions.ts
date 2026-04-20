import type { ChannelParams } from '../../types';
import { specificEnergy } from './specific-energy';
import { criticalDepth } from './critical-depth';
import { alternateDepthsFromE } from './alternate-depths';

export interface ObstructionResult {
  y2: number;
  E1: number;
  E2: number;
  yc: number;
  Ec: number;
  choked: boolean;
}

/**
 * Bottom step (rise = Δz):  E₂ = E₁ - Δz
 * If E₂ < Ec, flow is choked.
 */
export function bottomStep(
  y1: number,
  Q: number,
  g: number,
  dz: number,
  params: ChannelParams
): ObstructionResult {
  const E1 = specificEnergy(y1, Q, g, params);
  const yc = criticalDepth(Q, g, params);
  const Ec = specificEnergy(yc, Q, g, params);
  const E2 = E1 - dz;
  const choked = E2 < Ec;

  let y2: number;
  if (choked) {
    y2 = yc;
  } else {
    const regime = y1 > yc ? 'sub' : 'sup';
    const depths = alternateDepthsFromE(E2, Q, g, params);
    y2 = regime === 'sub' ? depths.sub : depths.sup;
  }

  return { y2, E1, E2, yc, Ec, choked };
}

/**
 * Width constriction: channel narrows from b₁ to b₂.
 * q₂ = Q/b₂ increases, shifting the E-y curve.
 */
export function widthConstriction(
  y1: number,
  Q: number,
  g: number,
  b1: number,
  b2: number
): ObstructionResult {
  const params1: ChannelParams = { shape: 'rectangular', b: b1 };
  const params2: ChannelParams = { shape: 'rectangular', b: b2 };

  const E1 = specificEnergy(y1, Q, g, params1);
  const yc2 = criticalDepth(Q, g, params2);
  const Ec2 = specificEnergy(yc2, Q, g, params2);
  const E2 = E1; // energy is conserved (no loss)
  const choked = E2 < Ec2;

  let y2: number;
  if (choked) {
    y2 = yc2;
  } else {
    const yc1 = criticalDepth(Q, g, params1);
    const regime = y1 > yc1 ? 'sub' : 'sup';
    const depths = alternateDepthsFromE(E2, Q, g, params2);
    y2 = regime === 'sub' ? depths.sub : depths.sup;
  }

  return { y2, E1, E2, yc: yc2, Ec: Ec2, choked };
}

/**
 * Sluice gate: supercritical flow downstream, given upstream depth y1 and gate opening a.
 * E is conserved: E₁ = E₂, and y₂ < gate opening in contracted section.
 */
export function sluiceGate(
  y1: number,
  Q: number,
  g: number,
  params: ChannelParams
): { y2: number; E: number } {
  const E = specificEnergy(y1, Q, g, params);
  const yc = criticalDepth(Q, g, params);

  // Downstream is supercritical alternate depth
  const depths = alternateDepthsFromE(E, Q, g, params);

  return { y2: y1 > yc ? depths.sup : depths.sub, E };
}
