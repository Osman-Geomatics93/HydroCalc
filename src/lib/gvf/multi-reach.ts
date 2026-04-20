import type { GVFStep, UnitSystem } from '../../types';
import { standardStep } from './standard-step';
import type { ChannelParams } from '../../types';

export interface Reach {
  length: number;
  S0: number;
  n: number;
  b: number;
  /** Optional starting depth for the first reach. If not provided, uses previous reach's end depth. */
  y0?: number;
}

/**
 * Chains standard-step computations across multiple reaches.
 * End depth of reach N becomes start depth of reach N+1.
 */
export function multiReachProfile(
  reaches: Reach[],
  Q: number,
  g: number,
  units: UnitSystem,
  direction: 'downstream' | 'upstream' = 'downstream'
): { steps: GVFStep[]; reachBoundaries: number[] } {
  if (reaches.length === 0) return { steps: [], reachBoundaries: [] };

  const allSteps: GVFStep[] = [];
  const reachBoundaries: number[] = [0];
  let xOffset = 0;
  let currentY = reaches[0].y0 || 1;

  for (let i = 0; i < reaches.length; i++) {
    const reach = reaches[i];
    const y0 = i === 0 ? (reach.y0 || currentY) : currentY;
    const params: ChannelParams = { shape: 'rectangular', b: reach.b };

    const nSteps = Math.max(10, Math.round(reach.length / 1));
    const dx = reach.length / nSteps;

    const steps = standardStep(y0, Q, reach.S0, reach.n, g, params, units, {
      dx,
      nSteps,
      direction,
    });

    // Offset x positions by cumulative offset
    for (const step of steps) {
      allSteps.push({
        ...step,
        x: step.x + xOffset,
      });
    }

    xOffset += reach.length;
    reachBoundaries.push(xOffset);

    // Use last depth as start of next reach
    if (steps.length > 0) {
      currentY = steps[steps.length - 1].y;
    }
  }

  return { steps: allSteps, reachBoundaries };
}
