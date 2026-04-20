export interface Problem {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  hints: string[];
  inputs: Record<string, number | string>;
  expectedOutputs: Record<string, { value: number; tolerance: number; label: string }>;
}

export const PROBLEM_BANK: Record<string, Problem[]> = {
  'ch1-geometry': [
    {
      id: 'g1', difficulty: 'easy',
      question: 'A rectangular channel has a bottom width of 4 m and a flow depth of 2 m. Calculate the flow area and wetted perimeter.',
      hints: ['A = b × y', 'P = b + 2y'],
      inputs: { shape: 'rectangular', b: 4, y: 2 },
      expectedOutputs: {
        A: { value: 8, tolerance: 0.01, label: 'Flow Area (m²)' },
        P: { value: 8, tolerance: 0.01, label: 'Wetted Perimeter (m)' },
      },
    },
    {
      id: 'g2', difficulty: 'easy',
      question: 'Find the hydraulic radius of a rectangular channel with b = 6 m and y = 1.5 m.',
      hints: ['A = b × y = 9 m²', 'P = b + 2y = 9 m', 'R = A/P'],
      inputs: { shape: 'rectangular', b: 6, y: 1.5 },
      expectedOutputs: {
        R: { value: 1.0, tolerance: 0.01, label: 'Hydraulic Radius (m)' },
      },
    },
    {
      id: 'g3', difficulty: 'medium',
      question: 'A trapezoidal channel has b = 3 m, side slope m = 2, and depth y = 1.5 m. Find the flow area.',
      hints: ['A = (b + my)y', 'A = (3 + 2×1.5) × 1.5'],
      inputs: { shape: 'trapezoidal', b: 3, m: 2, y: 1.5 },
      expectedOutputs: {
        A: { value: 9.0, tolerance: 0.01, label: 'Flow Area (m²)' },
      },
    },
    {
      id: 'g4', difficulty: 'medium',
      question: 'Calculate the top width of a trapezoidal channel with b = 5 m, m = 1.5, y = 2 m.',
      hints: ['T = b + 2my'],
      inputs: { shape: 'trapezoidal', b: 5, m: 1.5, y: 2 },
      expectedOutputs: {
        T: { value: 11.0, tolerance: 0.01, label: 'Top Width (m)' },
      },
    },
    {
      id: 'g5', difficulty: 'hard',
      question: 'A triangular channel with side slope m = 2 carries water at depth 1.2 m. Find the hydraulic depth D.',
      hints: ['A = m×y²', 'T = 2my', 'D = A/T = y/2'],
      inputs: { shape: 'triangular', m: 2, y: 1.2 },
      expectedOutputs: {
        D: { value: 0.6, tolerance: 0.01, label: 'Hydraulic Depth (m)' },
      },
    },
  ],

  'ch1-froude': [
    {
      id: 'f1', difficulty: 'easy',
      question: 'Water flows at V = 3 m/s in a rectangular channel with depth y = 2 m. Calculate the Froude number. Is the flow subcritical or supercritical?',
      hints: ['Fr = V / √(gD)', 'For rectangular channels D = y', 'g = 9.81 m/s²'],
      inputs: { shape: 'rectangular', b: 5, y: 2, Q: 30 },
      expectedOutputs: {
        Fr: { value: 0.677, tolerance: 0.01, label: 'Froude Number' },
      },
    },
    {
      id: 'f2', difficulty: 'medium',
      question: 'A rectangular channel (b = 4 m) carries Q = 20 m³/s at depth y = 1 m. Find Fr.',
      hints: ['V = Q/A = Q/(by)', 'Fr = V/√(gy)'],
      inputs: { shape: 'rectangular', b: 4, y: 1, Q: 20 },
      expectedOutputs: {
        Fr: { value: 1.597, tolerance: 0.02, label: 'Froude Number' },
      },
    },
    {
      id: 'f3', difficulty: 'medium',
      question: 'Q = 12 m³/s flows in a rectangular channel b = 6 m at depth y = 0.8 m. Determine Fr and flow regime.',
      hints: ['V = Q/(by) = 12/(6×0.8) = 2.5 m/s', 'Fr = V/√(gy)'],
      inputs: { shape: 'rectangular', b: 6, y: 0.8, Q: 12 },
      expectedOutputs: {
        Fr: { value: 0.893, tolerance: 0.02, label: 'Froude Number' },
      },
    },
    {
      id: 'f4', difficulty: 'hard',
      question: 'A trapezoidal channel (b = 3 m, m = 1.5) carries Q = 15 m³/s at y = 1.5 m. Calculate Fr using hydraulic depth.',
      hints: ['A = (b+my)y = (3+1.5×1.5)×1.5 = 7.875 m²', 'T = b+2my = 7.5 m', 'D = A/T', 'V = Q/A', 'Fr = V/√(gD)'],
      inputs: { shape: 'trapezoidal', b: 3, m: 1.5, y: 1.5, Q: 15 },
      expectedOutputs: {
        Fr: { value: 0.590, tolerance: 0.02, label: 'Froude Number' },
      },
    },
    {
      id: 'f5', difficulty: 'easy',
      question: 'At what velocity is the Froude number equal to 1 in a rectangular channel with depth y = 0.5 m?',
      hints: ['Fr = 1 when V = √(gy)', 'V = √(9.81 × 0.5)'],
      inputs: { shape: 'rectangular', b: 5, y: 0.5, Q: 11.07 },
      expectedOutputs: {
        Fr: { value: 1.0, tolerance: 0.05, label: 'Froude Number' },
      },
    },
  ],

  'ch2-energy': [
    {
      id: 'e1', difficulty: 'easy',
      question: 'Rectangular channel: b = 5 m, y = 2 m, Q = 10 m³/s. Calculate specific energy E.',
      hints: ['V = Q/(by) = 10/(5×2) = 1 m/s', 'E = y + V²/(2g)'],
      inputs: { shape: 'rectangular', b: 5, y: 2, Q: 10 },
      expectedOutputs: {
        E: { value: 2.051, tolerance: 0.01, label: 'Specific Energy (m)' },
      },
    },
    {
      id: 'e2', difficulty: 'medium',
      question: 'Find the critical depth for Q = 10 m³/s in a rectangular channel b = 5 m.',
      hints: ['q = Q/b = 2 m²/s', 'yc = (q²/g)^(1/3)'],
      inputs: { shape: 'rectangular', b: 5, Q: 10 },
      expectedOutputs: {
        yc: { value: 0.742, tolerance: 0.01, label: 'Critical Depth (m)' },
      },
    },
    {
      id: 'e3', difficulty: 'medium',
      question: 'A rectangular channel b = 4 m carries Q = 8 m³/s. What is the minimum specific energy?',
      hints: ['yc = (q²/g)^(1/3) where q = Q/b', 'Emin = 1.5 × yc'],
      inputs: { shape: 'rectangular', b: 4, Q: 8 },
      expectedOutputs: {
        Ec: { value: 1.177, tolerance: 0.02, label: 'Critical Energy (m)' },
      },
    },
    {
      id: 'e4', difficulty: 'hard',
      question: 'Water flows at y = 0.3 m in a rectangular channel b = 3 m with Q = 5 m³/s. Find E, Fr, and flow regime.',
      hints: ['V = Q/(by)', 'E = y + V²/(2g)', 'Fr = V/√(gy)'],
      inputs: { shape: 'rectangular', b: 3, y: 0.3, Q: 5 },
      expectedOutputs: {
        E: { value: 1.714, tolerance: 0.02, label: 'Specific Energy (m)' },
        Fr: { value: 3.244, tolerance: 0.05, label: 'Froude Number' },
      },
    },
    {
      id: 'e5', difficulty: 'easy',
      question: 'If V = 2 m/s and y = 3 m, what is the specific energy?',
      hints: ['E = y + V²/(2g) = 3 + 4/19.62'],
      inputs: { shape: 'rectangular', b: 5, y: 3, Q: 30 },
      expectedOutputs: {
        E: { value: 3.204, tolerance: 0.01, label: 'Specific Energy (m)' },
      },
    },
  ],

  'ch2-alternate': [
    {
      id: 'a1', difficulty: 'medium',
      question: 'Rectangular channel b = 5 m, Q = 10 m³/s. If y₁ = 2 m (subcritical), find the alternate (supercritical) depth.',
      hints: ['Alternate depth has same E but different y', 'E = y + Q²/(2g(by)²)'],
      inputs: { shape: 'rectangular', b: 5, y1: 2, Q: 10 },
      expectedOutputs: {
        sup: { value: 0.296, tolerance: 0.02, label: 'Supercritical Depth (m)' },
      },
    },
    {
      id: 'a2', difficulty: 'medium',
      question: 'Rectangular channel b = 4 m, Q = 12 m³/s, y₁ = 0.5 m. Find the alternate subcritical depth.',
      hints: ['Compute E at y₁, then solve for y₂ at same E'],
      inputs: { shape: 'rectangular', b: 4, y1: 0.5, Q: 12 },
      expectedOutputs: {
        sub: { value: 2.354, tolerance: 0.05, label: 'Subcritical Depth (m)' },
      },
    },
    {
      id: 'a3', difficulty: 'hard',
      question: 'Trapezoidal channel b = 3 m, m = 1.5, Q = 15 m³/s. If y₁ = 2.5 m, find the supercritical alternate depth.',
      hints: ['A = (b+my)y', 'E = y + Q²/(2gA²)', 'Solve iteratively'],
      inputs: { shape: 'trapezoidal', b: 3, m: 1.5, y1: 2.5, Q: 15 },
      expectedOutputs: {
        sup: { value: 0.494, tolerance: 0.05, label: 'Supercritical Depth (m)' },
      },
    },
  ],

  'ch3-momentum': [
    {
      id: 'm1', difficulty: 'easy',
      question: 'Rectangular channel b = 5 m, y = 2 m, Q = 10 m³/s. Calculate the momentum function M.',
      hints: ['M = Q²/(gA) + ȳA', 'For rectangular: ȳ = y/2, A = by'],
      inputs: { shape: 'rectangular', b: 5, y: 2, Q: 10 },
      expectedOutputs: {
        M: { value: 11.019, tolerance: 0.05, label: 'Momentum Function (m²)' },
      },
    },
    {
      id: 'm2', difficulty: 'medium',
      question: 'Find the critical depth for momentum function in rectangular channel b = 4 m, Q = 12 m³/s.',
      hints: ['At critical: Q²T/(gA³) = 1', 'yc = (q²/g)^(1/3)'],
      inputs: { shape: 'rectangular', b: 4, Q: 12 },
      expectedOutputs: {
        yc: { value: 0.860, tolerance: 0.02, label: 'Critical Depth (m)' },
      },
    },
    {
      id: 'm3', difficulty: 'hard',
      question: 'Trapezoidal channel b = 3 m, m = 2, Q = 20 m³/s, y = 1 m. Calculate M.',
      hints: ['A = (b+my)y = 5 m²', 'ȳ depends on trapezoid geometry'],
      inputs: { shape: 'trapezoidal', b: 3, m: 2, y: 1, Q: 20 },
      expectedOutputs: {
        M: { value: 9.580, tolerance: 0.2, label: 'Momentum Function (m²)' },
      },
    },
  ],

  'ch3-hydraulic-jump': [
    {
      id: 'j1', difficulty: 'easy',
      question: 'Rectangular channel b = 5 m, upstream depth y₁ = 0.3 m, Q = 10 m³/s. Find conjugate depth y₂.',
      hints: ['Fr₁ = V₁/√(gy₁)', 'y₂ = (y₁/2)(√(1+8Fr₁²) - 1)'],
      inputs: { shape: 'rectangular', b: 5, y1: 0.3, Q: 10 },
      expectedOutputs: {
        y2: { value: 2.26, tolerance: 0.05, label: 'Conjugate Depth (m)' },
      },
    },
    {
      id: 'j2', difficulty: 'medium',
      question: 'Rectangular channel b = 4 m, y₁ = 0.5 m, Q = 12 m³/s. Calculate the energy loss across the jump.',
      hints: ['Find y₂ first', 'ΔE = (y₂-y₁)³ / (4y₁y₂)'],
      inputs: { shape: 'rectangular', b: 4, y1: 0.5, Q: 12 },
      expectedOutputs: {
        energyLoss: { value: 0.371, tolerance: 0.05, label: 'Energy Loss (m)' },
      },
    },
    {
      id: 'j3', difficulty: 'hard',
      question: 'Rectangular b = 6 m, Fr₁ = 4.5, y₁ = 0.2 m. Find y₂ and classify the jump.',
      hints: ['y₂ = (y₁/2)(√(1+8Fr₁²) - 1)', 'Fr > 4.5 → steady jump'],
      inputs: { shape: 'rectangular', b: 6, y1: 0.2, Q: 7.54 },
      expectedOutputs: {
        y2: { value: 1.172, tolerance: 0.05, label: 'Conjugate Depth (m)' },
      },
    },
  ],

  'ch4-manning': [
    {
      id: 'mn1', difficulty: 'easy',
      question: 'Rectangular channel: b = 5 m, y = 1.5 m, n = 0.013, Sf = 0.001. Calculate velocity and discharge.',
      hints: ['R = A/P = (by)/(b+2y)', 'V = (1/n)R^(2/3)Sf^(1/2)', 'Q = VA'],
      inputs: { shape: 'rectangular', b: 5, y: 1.5, n: 0.013, Sf: 0.001 },
      expectedOutputs: {
        V: { value: 1.724, tolerance: 0.05, label: 'Velocity (m/s)' },
        Q: { value: 12.93, tolerance: 0.2, label: 'Discharge (m³/s)' },
      },
    },
    {
      id: 'mn2', difficulty: 'medium',
      question: 'Trapezoidal channel: b = 3 m, m = 2, y = 1 m, n = 0.022, Sf = 0.002. Find Q.',
      hints: ['A = (b+my)y = 5 m²', 'P = b + 2y√(1+m²)', 'R = A/P'],
      inputs: { shape: 'trapezoidal', b: 3, m: 2, y: 1, n: 0.022, Sf: 0.002 },
      expectedOutputs: {
        Q: { value: 7.27, tolerance: 0.2, label: 'Discharge (m³/s)' },
      },
    },
    {
      id: 'mn3', difficulty: 'easy',
      question: 'Rectangular b = 4 m, y = 2 m, n = 0.015, Sf = 0.0005. Find velocity.',
      hints: ['R = (4×2)/(4+2×2) = 1 m', 'V = (1/0.015)(1)^(2/3)(0.0005)^(1/2)'],
      inputs: { shape: 'rectangular', b: 4, y: 2, n: 0.015, Sf: 0.0005 },
      expectedOutputs: {
        V: { value: 1.491, tolerance: 0.05, label: 'Velocity (m/s)' },
      },
    },
    {
      id: 'mn4', difficulty: 'hard',
      question: 'Triangular channel m = 1.5, y = 1.2 m, n = 0.025, Sf = 0.003. Calculate discharge.',
      hints: ['A = my² = 2.16 m²', 'P = 2y√(1+m²)', 'R = A/P'],
      inputs: { shape: 'triangular', m: 1.5, y: 1.2, n: 0.025, Sf: 0.003 },
      expectedOutputs: {
        Q: { value: 3.46, tolerance: 0.2, label: 'Discharge (m³/s)' },
      },
    },
    {
      id: 'mn5', difficulty: 'medium',
      question: 'Rectangular b = 10 m, y = 3 m, n = 0.035, Sf = 0.0004. Find V and Q.',
      hints: ['A = 30 m²', 'P = 16 m', 'R = 1.875 m'],
      inputs: { shape: 'rectangular', b: 10, y: 3, n: 0.035, Sf: 0.0004 },
      expectedOutputs: {
        V: { value: 0.870, tolerance: 0.05, label: 'Velocity (m/s)' },
        Q: { value: 26.1, tolerance: 0.5, label: 'Discharge (m³/s)' },
      },
    },
  ],

  'ch4-normal-depth': [
    {
      id: 'nd1', difficulty: 'easy',
      question: 'Rectangular channel b = 5 m, Q = 10 m³/s, n = 0.013, S₀ = 0.001. Find normal depth yn.',
      hints: ['Manning: Q = (1/n)AR^(2/3)S^(1/2)', 'Solve iteratively for yn'],
      inputs: { shape: 'rectangular', b: 5, Q: 10, n: 0.013, S0: 0.001 },
      expectedOutputs: {
        yn: { value: 1.505, tolerance: 0.05, label: 'Normal Depth (m)' },
      },
    },
    {
      id: 'nd2', difficulty: 'medium',
      question: 'Trapezoidal b = 4 m, m = 1.5, Q = 20 m³/s, n = 0.02, S₀ = 0.0005. Find yn.',
      hints: ['A = (b+my)y', 'P = b + 2y√(1+m²)', 'Iterate Manning'],
      inputs: { shape: 'trapezoidal', b: 4, m: 1.5, Q: 20, n: 0.02, S0: 0.0005 },
      expectedOutputs: {
        yn: { value: 2.42, tolerance: 0.1, label: 'Normal Depth (m)' },
      },
    },
    {
      id: 'nd3', difficulty: 'hard',
      question: 'Triangular channel m = 2, Q = 5 m³/s, n = 0.015, S₀ = 0.002. Find yn and classify the slope.',
      hints: ['A = my²', 'P = 2y√(1+m²)', 'Compare yn with yc'],
      inputs: { shape: 'triangular', m: 2, Q: 5, n: 0.015, S0: 0.002 },
      expectedOutputs: {
        yn: { value: 1.28, tolerance: 0.1, label: 'Normal Depth (m)' },
      },
    },
  ],

  'ch7-shields': [
    {
      id: 's1', difficulty: 'easy',
      question: 'd = 2 mm, SG = 2.65, R = 0.5 m, Sf = 0.002. Calculate bed shear stress τ₀.',
      hints: ['τ₀ = γw × R × Sf', 'γw = 9790 N/m³ (SI)'],
      inputs: { d: 2, SG: 2.65, R: 0.5, Sf: 0.002 },
      expectedOutputs: {
        tau0: { value: 9.79, tolerance: 0.1, label: 'Bed Shear Stress (N/m²)' },
      },
    },
    {
      id: 's2', difficulty: 'medium',
      question: 'd = 1 mm, SG = 2.65, R = 0.3 m, Sf = 0.003. Find the Shields parameter τ* and determine if sediment moves.',
      hints: ['τ₀ = γwRSf', 'τ* = τ₀/((γs-γw)d)', 'Compare with critical τ*'],
      inputs: { d: 1, SG: 2.65, R: 0.3, Sf: 0.003 },
      expectedOutputs: {
        tauStar: { value: 0.578, tolerance: 0.05, label: 'Shields Parameter' },
      },
    },
    {
      id: 's3', difficulty: 'hard',
      question: 'd = 0.5 mm, SG = 2.65, R = 1 m, Sf = 0.001. Find τ*, Re*, critical τ*, and whether motion occurs.',
      hints: ['u* = √(τ₀/ρ)', 'Re* = u*d/ν', 'Read critical τ* from Shields curve'],
      inputs: { d: 0.5, SG: 2.65, R: 1, Sf: 0.001 },
      expectedOutputs: {
        tau0: { value: 9.79, tolerance: 0.1, label: 'Bed Shear Stress (N/m²)' },
      },
    },
  ],
};
