export interface GlossaryEntry {
  term: string;
  definition: string;
  latex?: string;
  relatedTerms?: string[];
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  'manning-n': {
    term: "Manning's n",
    definition: 'Empirical roughness coefficient representing channel resistance to flow. Higher values indicate rougher surfaces.',
    latex: "V = \\frac{k}{n} R^{2/3} S_f^{1/2}",
    relatedTerms: ['hydraulic-radius', 'friction-slope'],
  },
  'froude-number': {
    term: 'Froude Number',
    definition: 'Dimensionless ratio of flow inertia to gravity. Fr < 1 is subcritical (tranquil), Fr > 1 is supercritical (rapid), Fr = 1 is critical.',
    latex: 'Fr = \\frac{V}{\\sqrt{g D_h}}',
    relatedTerms: ['critical-depth', 'flow-regime'],
  },
  'hydraulic-radius': {
    term: 'Hydraulic Radius',
    definition: 'Ratio of the cross-sectional flow area to the wetted perimeter. A measure of channel flow efficiency.',
    latex: 'R = \\frac{A}{P}',
    relatedTerms: ['flow-area', 'wetted-perimeter'],
  },
  'specific-energy': {
    term: 'Specific Energy',
    definition: 'Total mechanical energy per unit weight relative to the channel bottom. Sum of depth and velocity head.',
    latex: 'E = y + \\frac{V^2}{2g} = y + \\frac{Q^2}{2gA^2}',
    relatedTerms: ['critical-depth', 'alternate-depths'],
  },
  'critical-depth': {
    term: 'Critical Depth',
    definition: 'Flow depth at which specific energy is minimum for a given discharge. Separates subcritical and supercritical flow.',
    latex: '\\frac{Q^2 T}{g A^3} = 1',
    relatedTerms: ['froude-number', 'specific-energy'],
  },
  'alternate-depths': {
    term: 'Alternate Depths',
    definition: 'Two depths (one subcritical, one supercritical) that have the same specific energy for a given discharge.',
    relatedTerms: ['specific-energy', 'critical-depth'],
  },
  'flow-area': {
    term: 'Flow Area',
    definition: 'Cross-sectional area of the flow perpendicular to the direction of flow.',
    latex: 'A = \\int_0^T y\\, dw',
    relatedTerms: ['hydraulic-radius', 'wetted-perimeter'],
  },
  'wetted-perimeter': {
    term: 'Wetted Perimeter',
    definition: 'Length of the channel cross-section boundary in contact with the water.',
    relatedTerms: ['hydraulic-radius', 'flow-area'],
  },
  'hydraulic-depth': {
    term: 'Hydraulic Depth',
    definition: 'Ratio of flow area to top width. Used in Froude number calculation for non-rectangular channels.',
    latex: 'D_h = \\frac{A}{T}',
    relatedTerms: ['froude-number', 'top-width'],
  },
  'top-width': {
    term: 'Top Width',
    definition: 'Width of the channel at the free surface.',
    relatedTerms: ['hydraulic-depth', 'flow-area'],
  },
  'momentum-function': {
    term: 'Momentum Function',
    definition: 'Sum of pressure force and momentum flux per unit weight. Conserved across hydraulic jumps.',
    latex: 'M = \\frac{Q^2}{gA} + \\bar{y} A',
    relatedTerms: ['hydraulic-jump', 'conjugate-depths'],
  },
  'hydraulic-jump': {
    term: 'Hydraulic Jump',
    definition: 'Rapid transition from supercritical to subcritical flow, accompanied by significant energy loss and turbulence.',
    relatedTerms: ['conjugate-depths', 'momentum-function', 'froude-number'],
  },
  'conjugate-depths': {
    term: 'Conjugate Depths',
    definition: 'Two depths across a hydraulic jump that share the same momentum function value.',
    latex: 'y_2 = \\frac{y_1}{2}\\left(\\sqrt{1 + 8 Fr_1^2} - 1\\right)',
    relatedTerms: ['hydraulic-jump', 'momentum-function'],
  },
  'normal-depth': {
    term: 'Normal Depth',
    definition: 'Equilibrium depth in uniform flow where gravitational driving force equals frictional resistance.',
    relatedTerms: ['manning-n', 'friction-slope', 'uniform-flow'],
  },
  'uniform-flow': {
    term: 'Uniform Flow',
    definition: 'Flow condition where depth, velocity, and cross-section remain constant along the channel length.',
    relatedTerms: ['normal-depth', 'manning-n'],
  },
  'friction-slope': {
    term: 'Friction Slope',
    definition: 'Energy gradient due to friction losses. Equals bed slope in uniform flow.',
    latex: 'S_f = \\frac{n^2 V^2}{k^2 R^{4/3}}',
    relatedTerms: ['manning-n', 'bed-slope'],
  },
  'bed-slope': {
    term: 'Bed Slope',
    definition: 'Longitudinal slope of the channel bottom. Positive when descending in flow direction.',
    latex: 'S_0 = -\\frac{dz_b}{dx}',
    relatedTerms: ['friction-slope', 'normal-depth'],
  },
  'flow-regime': {
    term: 'Flow Regime',
    definition: 'Classification of flow as subcritical (Fr < 1), critical (Fr = 1), or supercritical (Fr > 1).',
    relatedTerms: ['froude-number', 'critical-depth'],
  },
  'gvf': {
    term: 'Gradually Varied Flow',
    definition: 'Non-uniform flow where depth changes gradually along the channel, governed by the GVF equation.',
    latex: '\\frac{dy}{dx} = \\frac{S_0 - S_f}{1 - Fr^2}',
    relatedTerms: ['bed-slope', 'friction-slope', 'froude-number'],
  },
  'standard-step': {
    term: 'Standard Step Method',
    definition: 'Numerical method for computing GVF water surface profiles by solving the energy equation over finite steps.',
    latex: '\\Delta x = \\frac{E_2 - E_1}{S_0 - \\bar{S}_f}',
    relatedTerms: ['gvf', 'specific-energy'],
  },
  'shields-parameter': {
    term: 'Shields Parameter',
    definition: 'Dimensionless shear stress used to determine incipient motion of sediment particles.',
    latex: '\\tau^* = \\frac{\\tau_0}{(\\gamma_s - \\gamma_w) d}',
    relatedTerms: ['bed-shear-stress', 'fall-velocity'],
  },
  'bed-shear-stress': {
    term: 'Bed Shear Stress',
    definition: 'Tangential force per unit area exerted by the flow on the channel bed.',
    latex: '\\tau_0 = \\gamma_w R S_f',
    relatedTerms: ['shields-parameter', 'hydraulic-radius'],
  },
  'fall-velocity': {
    term: 'Fall Velocity',
    definition: 'Terminal settling velocity of a sediment particle in still water.',
    relatedTerms: ['shields-parameter', 'reynolds-number'],
  },
  'reynolds-number': {
    term: 'Reynolds Number',
    definition: 'Dimensionless number representing the ratio of inertial to viscous forces. Used to classify laminar vs. turbulent flow.',
    latex: 'Re = \\frac{VL}{\\nu}',
    relatedTerms: ['fall-velocity'],
  },
  'bed-load': {
    term: 'Bed Load Transport',
    definition: 'Sediment transported along the channel bed by rolling, sliding, or saltation.',
    latex: '\\Phi = 40 \\left(\\frac{1}{\\Psi}\\right)^3',
    relatedTerms: ['shields-parameter', 'fall-velocity'],
  },
  'side-slope': {
    term: 'Side Slope',
    definition: 'Ratio of horizontal to vertical distance on channel banks. e.g., m=2 means 2H:1V.',
    relatedTerms: ['flow-area', 'wetted-perimeter'],
  },
  'discharge': {
    term: 'Discharge',
    definition: 'Volume of water passing through a cross-section per unit time.',
    latex: 'Q = AV',
    relatedTerms: ['flow-area', 'velocity'],
  },
  'velocity': {
    term: 'Velocity',
    definition: 'Average flow velocity computed as discharge divided by flow area.',
    latex: 'V = \\frac{Q}{A}',
    relatedTerms: ['discharge', 'flow-area'],
  },
  'energy-loss': {
    term: 'Energy Loss',
    definition: 'Energy dissipated across a hydraulic jump, expressed as the difference in specific energy.',
    latex: '\\Delta E = \\frac{(y_2 - y_1)^3}{4 y_1 y_2}',
    relatedTerms: ['hydraulic-jump', 'specific-energy'],
  },
  'specific-weight': {
    term: 'Specific Weight',
    definition: 'Weight per unit volume of a fluid. Water: 9790 N/m3 (SI) or 62.4 lb/ft3 (US).',
    latex: '\\gamma = \\rho g',
    relatedTerms: ['specific-gravity'],
  },
  'specific-gravity': {
    term: 'Specific Gravity',
    definition: 'Ratio of material density to water density. Quartz sand SG = 2.65.',
    relatedTerms: ['specific-weight'],
  },
};
