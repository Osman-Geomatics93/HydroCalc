export interface FlowState {
  /** Flow depth */
  y: number;
  /** Velocity */
  v: number;
  /** Flow area */
  A: number;
  /** Discharge */
  Q: number;
  /** Froude number */
  Fr: number;
  /** Specific energy */
  E: number;
  /** Momentum function */
  M: number;
}

export type FlowRegime = 'subcritical' | 'critical' | 'supercritical';

export interface CriticalFlowResult {
  yc: number;
  Vc: number;
  Ec: number;
  Ac: number;
}

export interface HydraulicJumpResult {
  y1: number;
  y2: number;
  Fr1: number;
  Fr2: number;
  energyLoss: number;
  jumpType: string;
}

export interface NormalDepthResult {
  yn: number;
  Vn: number;
  An: number;
  Rn: number;
}

export type ProfileType =
  | 'M1' | 'M2' | 'M3'
  | 'S1' | 'S2' | 'S3'
  | 'C1' | 'C3'
  | 'H2' | 'H3'
  | 'A2' | 'A3';

export interface GVFStep {
  x: number;
  y: number;
  v: number;
  E: number;
  Sf: number;
  Fr: number;
}

export interface SedimentResult {
  shieldsParameter: number;
  criticalShearStress: number;
  fallVelocity: number;
  bedLoadTransport?: number;
}
