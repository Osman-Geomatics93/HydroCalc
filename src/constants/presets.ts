export interface Preset {
  name: string;
  description: string;
  values: Record<string, number | string>;
}

export const PRESETS: Record<string, Preset[]> = {
  'ch1-geometry': [
    { name: 'Irrigation Canal', description: 'Trapezoidal lined canal', values: { shape: 'trapezoidal', b: 3, m: 1.5, y: 1.2, Q: 5 } },
    { name: 'Storm Drain', description: 'Circular concrete pipe', values: { shape: 'circular', d: 1.5, y: 0.8, Q: 2 } },
    { name: 'Natural Channel', description: 'Wide rectangular river', values: { shape: 'rectangular', b: 20, y: 3, Q: 80 } },
  ],
  'ch1-froude': [
    { name: 'Subcritical Flow', description: 'Deep, slow canal flow', values: { shape: 'rectangular', b: 5, y: 2, Q: 5 } },
    { name: 'Supercritical Flow', description: 'Shallow, fast spillway', values: { shape: 'rectangular', b: 5, y: 0.2, Q: 10 } },
    { name: 'Critical Flow', description: 'Near critical conditions', values: { shape: 'rectangular', b: 3, y: 0.612, Q: 3 } },
  ],
  'ch2-energy': [
    { name: 'Deep Canal', description: 'Subcritical irrigation flow', values: { shape: 'rectangular', b: 5, y: 2, Q: 10 } },
    { name: 'Spillway Chute', description: 'Supercritical fast flow', values: { shape: 'rectangular', b: 3, y: 0.15, Q: 5 } },
    { name: 'Trapezoidal Channel', description: 'Lined trapezoidal section', values: { shape: 'trapezoidal', b: 4, m: 2, y: 1.5, Q: 12 } },
  ],
  'ch2-critical': [
    { name: 'Small Canal', description: 'Rectangular 3m wide', values: { shape: 'rectangular', b: 3, Q: 5 } },
    { name: 'Large River', description: 'Wide rectangular section', values: { shape: 'rectangular', b: 30, Q: 200 } },
    { name: 'V-Channel', description: 'Triangular drainage ditch', values: { shape: 'triangular', m: 2, Q: 3 } },
  ],
  'ch2-alternate': [
    { name: 'Subcritical Given', description: 'Find supercritical alternate', values: { shape: 'rectangular', b: 5, y1: 2, Q: 10 } },
    { name: 'Supercritical Given', description: 'Find subcritical alternate', values: { shape: 'rectangular', b: 5, y1: 0.3, Q: 10 } },
  ],
  'ch2-obstructions': [
    { name: 'Upward Step', description: 'Bottom step Dz=0.3m', values: { type: 'step', b: 5, y1: 2, Q: 10, dz: 0.3 } },
    { name: 'Width Constriction', description: 'Bridge pier narrowing', values: { type: 'constriction', b: 5, y1: 2, Q: 10, b2: 3 } },
    { name: 'Near-Choke Step', description: 'Large step close to choke', values: { type: 'step', b: 5, y1: 1.5, Q: 10, dz: 0.8 } },
  ],
  'ch3-momentum': [
    { name: 'Canal Flow', description: 'Typical subcritical flow', values: { shape: 'rectangular', b: 5, y: 2, Q: 10 } },
    { name: 'Fast Flow', description: 'Supercritical conditions', values: { shape: 'rectangular', b: 5, y: 0.3, Q: 10 } },
  ],
  'ch3-jump': [
    { name: 'Strong Jump', description: 'Fr1 > 4.5, high energy loss', values: { shape: 'rectangular', b: 5, y1: 0.15, Q: 10 } },
    { name: 'Weak Jump', description: 'Fr1 ~ 2.5', values: { shape: 'rectangular', b: 5, y1: 0.5, Q: 5 } },
    { name: 'Trapezoidal Jump', description: 'Jump in trapezoidal channel', values: { shape: 'trapezoidal', b: 3, m: 1.5, y1: 0.2, Q: 5 } },
  ],
  'ch3-combined': [
    { name: 'Supercritical Entry', description: 'Fast flow entering stilling basin', values: { b: 5, y: 0.3, Q: 10 } },
    { name: 'Subcritical Entry', description: 'Slow flow approaching weir', values: { b: 5, y: 2.5, Q: 10 } },
  ],
  'ch4-manning': [
    { name: 'Concrete Channel', description: 'Smooth concrete lined', values: { shape: 'rectangular', b: 3, y: 1, n: 0.013, Sf: 0.001 } },
    { name: 'Earth Channel', description: 'Clean earth canal', values: { shape: 'trapezoidal', b: 4, m: 2, y: 1.5, n: 0.022, Sf: 0.0005 } },
    { name: 'Natural Stream', description: 'Clean winding stream', values: { shape: 'rectangular', b: 10, y: 2, n: 0.035, Sf: 0.002 } },
  ],
  'ch4-normal': [
    { name: 'Mild Slope', description: 'Gentle concrete canal', values: { shape: 'rectangular', b: 5, Q: 10, n: 0.013, S0: 0.0005 } },
    { name: 'Steep Slope', description: 'Mountain stream', values: { shape: 'rectangular', b: 3, Q: 8, n: 0.035, S0: 0.02 } },
    { name: 'Circular Pipe', description: 'Concrete storm sewer', values: { shape: 'circular', d: 1.2, Q: 1, n: 0.013, S0: 0.002 } },
  ],
  'ch4-classification': [
    { name: 'Mild Reach', description: 'yn > yc, subcritical normal', values: { shape: 'rectangular', b: 5, Q: 10, n: 0.013, S0: 0.0005 } },
    { name: 'Steep Reach', description: 'yn < yc, supercritical normal', values: { shape: 'rectangular', b: 3, Q: 10, n: 0.013, S0: 0.02 } },
    { name: 'Critical Slope', description: 'yn = yc', values: { shape: 'rectangular', b: 5, Q: 10, n: 0.013, S0: 0.004 } },
  ],
  'ch5-composite': [
    { name: 'M1 Profile', description: 'Backwater behind dam', values: { b: 5, Q: 10, n: 0.013, S0: 0.001, y: 3 } },
    { name: 'M2 Profile', description: 'Drawdown to free overfall', values: { b: 5, Q: 10, n: 0.013, S0: 0.001, y: 1 } },
    { name: 'S1 Profile', description: 'Steep channel behind obstacle', values: { b: 3, Q: 8, n: 0.013, S0: 0.02, y: 2 } },
  ],
  'ch6-step': [
    { name: 'M1 Backwater', description: 'Dam backwater calculation', values: { b: 5, Q: 10, n: 0.013, S0: 0.001, y0: 3, dx: 50, nSteps: 100, direction: 'upstream' } },
    { name: 'M2 Drawdown', description: 'Free overfall drawdown', values: { b: 5, Q: 10, n: 0.013, S0: 0.001, y0: 1.2, dx: 50, nSteps: 100, direction: 'upstream' } },
    { name: 'S2 Profile', description: 'Steep channel acceleration', values: { b: 3, Q: 8, n: 0.013, S0: 0.02, y0: 0.5, dx: 10, nSteps: 80, direction: 'downstream' } },
  ],
  'ch6-profiles': [
    { name: 'Mild Backwater', description: 'Depth above normal depth', values: { b: 5, Q: 10, n: 0.013, S0: 0.001, y0: 3 } },
    { name: 'Steep Drawdown', description: 'Steep channel S2 profile', values: { b: 3, Q: 8, n: 0.013, S0: 0.02, y0: 0.5 } },
  ],
  'ch7-fall': [
    { name: 'Fine Sand', description: 'd = 0.1 mm, quartz', values: { d: 0.1, SG: 2.65 } },
    { name: 'Medium Sand', description: 'd = 0.5 mm, quartz', values: { d: 0.5, SG: 2.65 } },
    { name: 'Coarse Sand', description: 'd = 2 mm, quartz', values: { d: 2, SG: 2.65 } },
  ],
  'ch7-shields': [
    { name: 'Fine Sand Bed', description: 'Low shear, likely no motion', values: { d: 0.3, SG: 2.65, R: 0.5, Sf: 0.0005 } },
    { name: 'Gravel Bed', description: 'High shear, likely motion', values: { d: 5, SG: 2.65, R: 1.0, Sf: 0.005 } },
    { name: 'Medium Sand', description: 'Borderline conditions', values: { d: 1, SG: 2.65, R: 0.3, Sf: 0.002 } },
  ],
  'ch7-bedload': [
    { name: 'Sand Transport', description: 'Medium sand in river', values: { d: 1, SG: 2.65, R: 0.5, Sf: 0.002, b: 10 } },
    { name: 'Gravel Transport', description: 'Coarse gravel in steep stream', values: { d: 10, SG: 2.65, R: 1, Sf: 0.01, b: 5 } },
  ],
  'ch6-multireach': [
    { name: 'Mild to Steep', description: 'Transition from mild to steep slope', values: { Q: 10 } },
    { name: 'Uniform Reaches', description: 'Three identical reaches', values: { Q: 15 } },
  ],
};
