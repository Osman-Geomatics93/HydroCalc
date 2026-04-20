import type { ChannelParams } from '../../types';
import { conjugateDepth } from '../momentum/conjugate-depths';

/**
 * Generate the conjugate depth curve for a water surface profile.
 * For each depth y in the profile, compute y_conj.
 * This helps identify where hydraulic jumps occur.
 */
export function conjugateCurve(
  profileY: number[],
  profileX: number[],
  Q: number,
  g: number,
  params: ChannelParams
): { x: number[]; y: number[] } {
  const xs: number[] = [];
  const ys: number[] = [];

  for (let i = 0; i < profileY.length; i++) {
    try {
      const yConj = conjugateDepth(profileY[i], Q, g, params);
      xs.push(profileX[i]);
      ys.push(yConj);
    } catch {
      // Skip points where conjugate depth can't be found
    }
  }

  return { x: xs, y: ys };
}
