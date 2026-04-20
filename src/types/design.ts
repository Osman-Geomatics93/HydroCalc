import type { ChannelShape } from './channels';

export interface DesignConstraints {
  Q: number;
  n: number;
  S0: number;
  maxVelocity?: number;
  freeboard?: number;
  maxSideSlope?: number;
}

export interface DesignResult {
  shape: ChannelShape;
  b: number;
  m: number;
  y: number;
  yn: number;
  V: number;
  Fr: number;
  A: number;
  P: number;
  R: number;
  freeboard: number;
  efficiency: number;
  warnings: string[];
}
