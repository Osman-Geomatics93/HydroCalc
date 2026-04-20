export interface ChainMapping {
  label: string;
  outputs: { key: string; label: string }[];
  compatibleInputs: Record<string, { calcId: string; inputKey: string; label: string }[]>;
}

export const CHAIN_MAPPINGS: Record<string, ChainMapping> = {
  'ch4-normal-depth': {
    label: 'Normal Depth',
    outputs: [
      { key: 'yn', label: 'Normal Depth (yn)' },
      { key: 'Vn', label: 'Normal Velocity (Vn)' },
    ],
    compatibleInputs: {
      yn: [
        { calcId: 'ch2-energy', inputKey: 'y', label: 'Flow Depth in Specific Energy' },
        { calcId: 'ch2-alternate', inputKey: 'y1', label: 'Known Depth in Alternate Depths' },
        { calcId: 'ch3-momentum', inputKey: 'y', label: 'Flow Depth in Momentum' },
        { calcId: 'ch6-profiles', inputKey: 'y0', label: 'Initial Depth in GVF Profile' },
      ],
    },
  },
  'ch2-critical-depth': {
    label: 'Critical Depth',
    outputs: [
      { key: 'yc', label: 'Critical Depth (yc)' },
      { key: 'Ec', label: 'Critical Energy (Ec)' },
    ],
    compatibleInputs: {
      yc: [
        { calcId: 'ch2-alternate', inputKey: 'y1', label: 'Known Depth in Alternate Depths' },
        { calcId: 'ch3-hydraulic-jump', inputKey: 'y1', label: 'Upstream Depth in Hydraulic Jump' },
      ],
    },
  },
  'ch2-energy': {
    label: 'Specific Energy',
    outputs: [
      { key: 'E', label: 'Specific Energy (E)' },
      { key: 'V', label: 'Velocity (V)' },
      { key: 'Fr', label: 'Froude Number (Fr)' },
    ],
    compatibleInputs: {},
  },
  'ch3-hydraulic-jump': {
    label: 'Hydraulic Jump',
    outputs: [
      { key: 'y2', label: 'Conjugate Depth (y2)' },
      { key: 'energyLoss', label: 'Energy Loss (ΔE)' },
    ],
    compatibleInputs: {
      y2: [
        { calcId: 'ch2-energy', inputKey: 'y', label: 'Flow Depth in Specific Energy' },
        { calcId: 'ch6-profiles', inputKey: 'y0', label: 'Initial Depth in GVF Profile' },
      ],
    },
  },
};

export const CALC_ID_TO_PATH: Record<string, string> = {
  'ch1-geometry': '/ch1/geometry',
  'ch1-froude': '/ch1/froude',
  'ch2-energy': '/ch2/energy',
  'ch2-critical-depth': '/ch2/critical-depth',
  'ch2-alternate': '/ch2/alternate-depths',
  'ch2-obstructions': '/ch2/obstructions',
  'ch3-momentum': '/ch3/momentum',
  'ch3-hydraulic-jump': '/ch3/hydraulic-jump',
  'ch3-combined': '/ch3/combined',
  'ch4-manning': '/ch4/manning',
  'ch4-normal-depth': '/ch4/normal-depth',
  'ch4-classification': '/ch4/classification',
  'ch5-taxonomy': '/ch5/taxonomy',
  'ch5-composite': '/ch5/composite',
  'ch6-standard-step': '/ch6/standard-step',
  'ch6-profiles': '/ch6/profiles',
  'ch6-multi-reach': '/ch6/multi-reach',
  'ch7-fall-velocity': '/ch7/fall-velocity',
  'ch7-shields': '/ch7/shields',
  'ch7-bed-load': '/ch7/bed-load',
};
