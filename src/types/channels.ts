export type ChannelShape = 'rectangular' | 'trapezoidal' | 'triangular' | 'circular';

export interface ChannelParams {
  shape: ChannelShape;
  /** Bottom width (m or ft) — not used for triangular/circular */
  b?: number;
  /** Side slope (horizontal:vertical) — used for trapezoidal/triangular */
  m?: number;
  /** Diameter — used for circular */
  d?: number;
}

export interface ChannelGeometry {
  /** Flow area */
  A: number;
  /** Wetted perimeter */
  P: number;
  /** Hydraulic radius R = A/P */
  R: number;
  /** Top width */
  T: number;
  /** Hydraulic depth D = A/T */
  D: number;
}
