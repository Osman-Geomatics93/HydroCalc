import type { ChannelParams, ChannelGeometry } from '../../types';
import { rectangularGeometry } from './rectangular';
import { trapezoidalGeometry } from './trapezoidal';
import { triangularGeometry } from './triangular';
import { circularGeometry } from './circular';

export { rectangularGeometry, rectangularCrossSection } from './rectangular';
export { trapezoidalGeometry, trapezoidalCrossSection } from './trapezoidal';
export { triangularGeometry, triangularCrossSection } from './triangular';
export { circularGeometry, circularCrossSection, circularWaterLine } from './circular';

/** Generic geometry dispatcher */
export function computeGeometry(params: ChannelParams, y: number): ChannelGeometry {
  switch (params.shape) {
    case 'rectangular':
      return rectangularGeometry(params.b!, y);
    case 'trapezoidal':
      return trapezoidalGeometry(params.b!, params.m!, y);
    case 'triangular':
      return triangularGeometry(params.m!, y);
    case 'circular':
      return circularGeometry(params.d!, y);
  }
}
