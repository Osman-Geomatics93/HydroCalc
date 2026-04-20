export interface CaseStudyStep {
  title: string;
  description: string;
  calculatorPath: string;
  params: Record<string, string | number>;
}

export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  steps: CaseStudyStep[];
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'dam-spillway',
    title: 'Dam Spillway Design',
    description: 'Design a spillway channel for a small dam with a 50 m³/s flood discharge. Determine critical depth, classify the water surface profile, and compute the profile downstream.',
    difficulty: 'intermediate',
    estimatedMinutes: 25,
    steps: [
      {
        title: 'Compute Critical Depth',
        description: 'Find the critical depth for Q = 50 m³/s in a 10m-wide rectangular channel.',
        calculatorPath: '/ch2/critical-depth',
        params: { Q: 50, b: 10, shape: 'rectangular' },
      },
      {
        title: 'Determine Specific Energy',
        description: 'Calculate the specific energy at y = 2.5 m.',
        calculatorPath: '/ch2/energy',
        params: { Q: 50, b: 10, y: 2.5 },
      },
      {
        title: 'Find Normal Depth',
        description: 'Compute normal depth for the spillway channel with n = 0.015 and S₀ = 0.008.',
        calculatorPath: '/ch4/normal-depth',
        params: { Q: 50, b: 10, n: 0.015, S0: 0.008 },
      },
      {
        title: 'Classify Water Surface Profile',
        description: 'Classify the resulting profile and determine if it is an S-type or M-type curve.',
        calculatorPath: '/ch6/profiles',
        params: { Q: 50, b: 10, n: 0.015, S0: 0.008, y0: 2.5 },
      },
    ],
  },
  {
    id: 'flood-channel',
    title: 'Flood Channel Sizing',
    description: 'Size a trapezoidal flood control channel to carry a 100-year flood of 30 m³/s using Manning\'s equation. Evaluate channel geometry and verify Froude number.',
    difficulty: 'beginner',
    estimatedMinutes: 15,
    steps: [
      {
        title: 'Channel Geometry',
        description: 'Set up a trapezoidal channel with b = 6m, side slope m = 2, and depth y = 2m. Compute A, P, R.',
        calculatorPath: '/ch1/geometry',
        params: { b: 6, y: 2, m: 2, shape: 'trapezoidal' },
      },
      {
        title: 'Manning Discharge',
        description: 'With n = 0.025 and S₀ = 0.0005, compute the discharge capacity.',
        calculatorPath: '/ch4/manning',
        params: { b: 6, y: 2, m: 2, n: 0.025, S0: 0.0005, shape: 'trapezoidal' },
      },
      {
        title: 'Check Froude Number',
        description: 'Verify the flow is subcritical (Fr < 1) for safety.',
        calculatorPath: '/ch1/froude',
        params: { Q: 30, b: 6, y: 2, m: 2, shape: 'trapezoidal' },
      },
      {
        title: 'Compute Normal Depth',
        description: 'Find the equilibrium normal depth for Q = 30 m³/s.',
        calculatorPath: '/ch4/normal-depth',
        params: { Q: 30, b: 6, n: 0.025, S0: 0.0005, m: 2, shape: 'trapezoidal' },
      },
    ],
  },
  {
    id: 'culvert-analysis',
    title: 'Culvert Analysis',
    description: 'Analyze a circular culvert under a highway embankment. Determine if the culvert flows full or partially full, and compute the hydraulic jump downstream.',
    difficulty: 'advanced',
    estimatedMinutes: 30,
    steps: [
      {
        title: 'Critical Depth in Culvert',
        description: 'Compute the critical depth for Q = 5 m³/s in a 2m-diameter circular culvert.',
        calculatorPath: '/ch2/critical-depth',
        params: { Q: 5, d: 2, shape: 'circular' },
      },
      {
        title: 'Normal Depth',
        description: 'Find the normal depth with n = 0.013 and S₀ = 0.01.',
        calculatorPath: '/ch4/normal-depth',
        params: { Q: 5, d: 2, n: 0.013, S0: 0.01, shape: 'circular' },
      },
      {
        title: 'Hydraulic Jump',
        description: 'If supercritical flow exits the culvert at y = 0.4m, compute the sequent depth.',
        calculatorPath: '/ch3/hydraulic-jump',
        params: { Q: 5, b: 2, y1: 0.4 },
      },
      {
        title: 'Energy Loss',
        description: 'Compute specific energy before and after the jump to find energy dissipated.',
        calculatorPath: '/ch2/energy',
        params: { Q: 5, b: 2, y: 0.4 },
      },
    ],
  },
  {
    id: 'irrigation-canal',
    title: 'Irrigation Canal Design',
    description: 'Design a lined irrigation canal using the Design Wizard to carry 8 m³/s with minimum excavation and optimal hydraulic efficiency.',
    difficulty: 'intermediate',
    estimatedMinutes: 20,
    steps: [
      {
        title: 'Set Design Parameters',
        description: 'Use the Design Wizard with Q = 8 m³/s, concrete lining (n = 0.013), and S₀ = 0.0004.',
        calculatorPath: '/design-wizard',
        params: { Q: 8, n: 0.013, S0: 0.0004 },
      },
      {
        title: 'Verify Geometry',
        description: 'Check the designed channel geometry: A, P, R, T.',
        calculatorPath: '/ch1/geometry',
        params: { b: 4, y: 1.8, m: 1.5, shape: 'trapezoidal' },
      },
      {
        title: 'Compute Normal Depth',
        description: 'Confirm the normal depth matches the design depth.',
        calculatorPath: '/ch4/normal-depth',
        params: { Q: 8, b: 4, n: 0.013, S0: 0.0004, m: 1.5, shape: 'trapezoidal' },
      },
      {
        title: 'Check Froude Number',
        description: 'Ensure subcritical flow for stable irrigation delivery.',
        calculatorPath: '/ch1/froude',
        params: { Q: 8, b: 4, y: 1.8, m: 1.5, shape: 'trapezoidal' },
      },
      {
        title: 'Compute GVF Profile',
        description: 'Model the backwater curve if a weir raises the downstream depth to 2.5m.',
        calculatorPath: '/ch6/profiles',
        params: { Q: 8, b: 4, n: 0.013, S0: 0.0004, y0: 2.5 },
      },
    ],
  },
  {
    id: 'bridge-scour',
    title: 'Bridge Scour Assessment',
    description: 'Assess potential scour at a bridge crossing by analyzing channel contraction, critical velocity, and sediment transport capacity.',
    difficulty: 'advanced',
    estimatedMinutes: 30,
    steps: [
      {
        title: 'Upstream Channel Flow',
        description: 'Compute normal flow conditions upstream: Q = 200 m³/s, b = 40m, n = 0.035, S₀ = 0.0003.',
        calculatorPath: '/ch4/manning',
        params: { Q: 200, b: 40, n: 0.035, S0: 0.0003, y: 3.5 },
      },
      {
        title: 'Bridge Contraction',
        description: 'Model the contracted section (b = 25m) and find the depth through energy analysis.',
        calculatorPath: '/ch2/obstructions',
        params: { Q: 200, b: 40, b2: 25, y: 3.5 },
      },
      {
        title: 'Shields Parameter',
        description: 'Check if the bed sediment (d₅₀ = 2mm) is mobile under contracted flow conditions.',
        calculatorPath: '/ch7/shields',
        params: { d50: 0.002, S0: 0.0003, y: 4.5 },
      },
      {
        title: 'Fall Velocity',
        description: 'Compute the settling velocity for the bed material.',
        calculatorPath: '/ch7/fall-velocity',
        params: { d: 0.002 },
      },
      {
        title: 'Bed Load Transport',
        description: 'Estimate the bed load transport rate under scour conditions.',
        calculatorPath: '/ch7/bed-load',
        params: { d50: 0.002, S0: 0.0003, y: 4.5, Q: 200, b: 25 },
      },
    ],
  },
];
