/**
 * Step-by-step solution definitions keyed by calculator ID.
 * Each step: { label, latex (KaTeX), compute(inputs) => number }
 *
 * getStepsForShape() returns shape-appropriate formulas so the panel
 * works for rectangular, trapezoidal, triangular, and circular channels.
 */

export interface SolutionStep {
  label: string;
  latex: string;
  compute: (inputs: Record<string, number>) => number;
}

/* ── geometry helpers used inside compute() ────────────────────── */

function geoRect(b: number, y: number) {
  const A = b * y;
  const P = b + 2 * y;
  const R = A / P;
  const T = b;
  const D = y;
  return { A, P, R, T, D };
}

function geoTrap(b: number, m: number, y: number) {
  const A = (b + m * y) * y;
  const P = b + 2 * y * Math.sqrt(1 + m * m);
  const R = A / P;
  const T = b + 2 * m * y;
  const D = A / T;
  return { A, P, R, T, D };
}

function geoTri(m: number, y: number) {
  const A = m * y * y;
  const P = 2 * y * Math.sqrt(1 + m * m);
  const R = A / P;
  const T = 2 * m * y;
  const D = A / T;
  return { A, P, R, T, D };
}

function geoCirc(d: number, y: number) {
  const r = d / 2;
  const yc = Math.min(Math.max(y, 0), d);
  const theta = 2 * Math.acos(1 - yc / r);
  const A = (r * r / 2) * (theta - Math.sin(theta));
  const P = r * theta;
  const R = P > 0 ? A / P : 0;
  const T = 2 * Math.sqrt(Math.max(0, r * r - (r - yc) * (r - yc)));
  const D = T > 0 ? A / T : 0;
  return { A, P, R, T, D };
}

/** Universal dispatcher — mirrors lib/geometry */
function geo(shape: string, inp: Record<string, number>, yKey = 'y') {
  const y = inp[yKey];
  switch (shape) {
    case 'trapezoidal': return geoTrap(inp.b, inp.m, y);
    case 'triangular':  return geoTri(inp.m, y);
    case 'circular':    return geoCirc(inp.d, y);
    default:            return geoRect(inp.b, y);
  }
}

/* ── LaTeX per shape ───────────────────────────────────────────── */

const AREA_LATEX: Record<string, string> = {
  rectangular:  'A = b \\cdot y',
  trapezoidal:  'A = (b + m y) y',
  triangular:   'A = m y^2',
  circular:     'A = \\tfrac{r^2}{2}(\\theta - \\sin\\theta)',
};

const PERIMETER_LATEX: Record<string, string> = {
  rectangular:  'P = b + 2y',
  trapezoidal:  'P = b + 2y\\sqrt{1+m^2}',
  triangular:   'P = 2y\\sqrt{1+m^2}',
  circular:     'P = r\\theta',
};

const TOPWIDTH_LATEX: Record<string, string> = {
  rectangular:  'T = b',
  trapezoidal:  'T = b + 2my',
  triangular:   'T = 2my',
  circular:     'T = 2\\sqrt{r^2-(r-y)^2}',
};

const HYDEPTH_LATEX: Record<string, string> = {
  rectangular:  'D_h = A/T = y',
  trapezoidal:  'D_h = A / T',
  triangular:   'D_h = A / T = y/2',
  circular:     'D_h = A / T',
};

/* ── Step generators ───────────────────────────────────────────── */

function geometrySteps(shape: string): SolutionStep[] {
  return [
    { label: 'Flow Area', latex: AREA_LATEX[shape], compute: (i) => geo(shape, i).A },
    { label: 'Wetted Perimeter', latex: PERIMETER_LATEX[shape], compute: (i) => geo(shape, i).P },
    { label: 'Hydraulic Radius', latex: 'R = A / P', compute: (i) => geo(shape, i).R },
    { label: 'Top Width', latex: TOPWIDTH_LATEX[shape], compute: (i) => geo(shape, i).T },
    { label: 'Hydraulic Depth', latex: HYDEPTH_LATEX[shape], compute: (i) => geo(shape, i).D },
    { label: 'Velocity', latex: 'V = Q / A', compute: (i) => { const { A } = geo(shape, i); return A > 0 ? i.Q / A : 0; } },
    { label: 'Froude Number', latex: 'Fr = V / \\sqrt{g D_h}', compute: (i) => { const { A, D } = geo(shape, i); const V = A > 0 ? i.Q / A : 0; return D > 0 ? V / Math.sqrt(i.g * D) : 0; } },
  ];
}

function froudeSteps(shape: string): SolutionStep[] {
  return [
    { label: 'Flow Area', latex: AREA_LATEX[shape], compute: (i) => geo(shape, i).A },
    { label: 'Velocity', latex: 'V = Q / A', compute: (i) => { const { A } = geo(shape, i); return A > 0 ? i.Q / A : 0; } },
    { label: 'Hydraulic Depth', latex: HYDEPTH_LATEX[shape], compute: (i) => geo(shape, i).D },
    { label: 'Froude Number', latex: 'Fr = \\frac{V}{\\sqrt{g D_h}}', compute: (i) => { const { A, D } = geo(shape, i); const V = A > 0 ? i.Q / A : 0; return D > 0 ? V / Math.sqrt(i.g * D) : 0; } },
  ];
}

function energySteps(shape: string): SolutionStep[] {
  return [
    { label: 'Flow Area', latex: AREA_LATEX[shape], compute: (i) => geo(shape, i).A },
    { label: 'Velocity', latex: 'V = Q / A', compute: (i) => { const { A } = geo(shape, i); return A > 0 ? i.Q / A : 0; } },
    { label: 'Velocity Head', latex: '\\frac{V^2}{2g}', compute: (i) => { const { A } = geo(shape, i); const V = A > 0 ? i.Q / A : 0; return (V * V) / (2 * i.g); } },
    { label: 'Specific Energy', latex: 'E = y + \\frac{V^2}{2g}', compute: (i) => { const { A } = geo(shape, i); const V = A > 0 ? i.Q / A : 0; return i.y + (V * V) / (2 * i.g); } },
    { label: 'Critical Depth', latex: shape === 'rectangular' ? 'y_c = \\left(\\frac{Q^2}{g b^2}\\right)^{1/3}' : 'y_c: \\; \\frac{Q^2 T}{g A^3} = 1', compute: (i) => {
      if (shape === 'rectangular') return Math.pow((i.Q * i.Q) / (i.g * i.b * i.b), 1 / 3);
      // iterative for other shapes
      let lo = 0.001, hi = 50;
      if (shape === 'circular') hi = i.d * 0.999;
      for (let it = 0; it < 60; it++) {
        const mid = (lo + hi) / 2;
        const g2 = geo(shape, { ...i, y: mid });
        const val = g2.A > 0 && g2.T > 0 ? (i.Q * i.Q * g2.T) / (i.g * Math.pow(g2.A, 3)) : 0;
        if (val > 1) lo = mid; else hi = mid;
      }
      return (lo + hi) / 2;
    } },
    { label: 'Froude Number', latex: 'Fr = V / \\sqrt{g D_h}', compute: (i) => { const { A, D } = geo(shape, i); const V = A > 0 ? i.Q / A : 0; return D > 0 ? V / Math.sqrt(i.g * D) : 0; } },
  ];
}

function criticalSteps(shape: string): SolutionStep[] {
  const ycCompute = (i: Record<string, number>) => {
    if (shape === 'rectangular') return Math.pow((i.Q * i.Q) / (i.g * i.b * i.b), 1 / 3);
    let lo = 0.001, hi = 50;
    if (shape === 'circular') hi = i.d * 0.999;
    for (let it = 0; it < 60; it++) {
      const mid = (lo + hi) / 2;
      const g2 = geo(shape, { ...i, y: mid });
      const val = g2.A > 0 && g2.T > 0 ? (i.Q * i.Q * g2.T) / (i.g * Math.pow(g2.A, 3)) : 0;
      if (val > 1) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  };

  return [
    { label: 'Critical Depth', latex: shape === 'rectangular' ? 'y_c = \\left(\\frac{Q^2}{g b^2}\\right)^{1/3}' : 'y_c: \\; \\frac{Q^2 T}{g A^3} = 1', compute: ycCompute },
    { label: 'Critical Area', latex: 'A_c = A(y_c)', compute: (i) => { const yc = ycCompute(i); return geo(shape, { ...i, y: yc }).A; } },
    { label: 'Critical Velocity', latex: 'V_c = Q / A_c', compute: (i) => { const yc = ycCompute(i); const Ac = geo(shape, { ...i, y: yc }).A; return Ac > 0 ? i.Q / Ac : 0; } },
    { label: 'Critical Energy', latex: shape === 'rectangular' ? 'E_c = \\frac{3}{2} y_c' : 'E_c = y_c + \\frac{V_c^2}{2g}', compute: (i) => { const yc = ycCompute(i); const Ac = geo(shape, { ...i, y: yc }).A; const Vc = Ac > 0 ? i.Q / Ac : 0; return yc + (Vc * Vc) / (2 * i.g); } },
  ];
}

function alternateSteps(shape: string): SolutionStep[] {
  return [
    { label: 'Flow Area at y₁', latex: AREA_LATEX[shape].replace('y', 'y_1'), compute: (i) => geo(shape, { ...i, y: i.y1 }).A },
    { label: 'Specific Energy', latex: 'E = y_1 + \\frac{Q^2}{2gA_1^2}', compute: (i) => { const { A } = geo(shape, { ...i, y: i.y1 }); return A > 0 ? i.y1 + (i.Q * i.Q) / (2 * i.g * A * A) : 0; } },
    { label: 'Froude Number', latex: 'Fr_1 = V_1 / \\sqrt{g D_1}', compute: (i) => { const { A, D } = geo(shape, { ...i, y: i.y1 }); const V = A > 0 ? i.Q / A : 0; return D > 0 ? V / Math.sqrt(i.g * D) : 0; } },
  ];
}

function obstructionStepSteps(): SolutionStep[] {
  return [
    { label: 'Upstream Energy', latex: 'E_1 = y_1 + \\frac{Q^2}{2g(b y_1)^2}', compute: (i) => { const A = i.b * i.y1; return i.y1 + (i.Q * i.Q) / (2 * i.g * A * A); } },
    { label: 'Downstream Energy', latex: 'E_2 = E_1 - \\Delta z', compute: (i) => { const A = i.b * i.y1; return i.y1 + (i.Q * i.Q) / (2 * i.g * A * A) - i.dz; } },
    { label: 'Critical Depth', latex: 'y_c = (Q^2/(g b^2))^{1/3}', compute: (i) => Math.pow((i.Q * i.Q) / (i.g * i.b * i.b), 1 / 3) },
    { label: 'Critical Energy', latex: 'E_c = \\frac{3}{2} y_c', compute: (i) => 1.5 * Math.pow((i.Q * i.Q) / (i.g * i.b * i.b), 1 / 3) },
  ];
}

function obstructionConstrictionSteps(): SolutionStep[] {
  return [
    { label: 'Upstream Energy', latex: 'E_1 = y_1 + \\frac{Q^2}{2g(b_1 y_1)^2}', compute: (i) => { const A = i.b * i.y1; return i.y1 + (i.Q * i.Q) / (2 * i.g * A * A); } },
    { label: 'Downstream unit discharge', latex: 'q_2 = Q / b_2', compute: (i) => i.Q / i.b2 },
    { label: 'Critical Depth (contracted)', latex: 'y_{c2} = (q_2^2 / g)^{1/3}', compute: (i) => { const q2 = i.Q / i.b2; return Math.pow((q2 * q2) / i.g, 1 / 3); } },
    { label: 'Critical Energy (contracted)', latex: 'E_{c2} = \\frac{3}{2} y_{c2}', compute: (i) => { const q2 = i.Q / i.b2; return 1.5 * Math.pow((q2 * q2) / i.g, 1 / 3); } },
  ];
}

function momentumSteps(shape: string): SolutionStep[] {
  const ybarLabel: Record<string, string> = {
    rectangular: '\\bar{y} = y / 2',
    trapezoidal: '\\bar{y} = \\frac{y(3b+2my)}{6(b+my)}',
    triangular: '\\bar{y} = y / 3',
    circular: '\\bar{y} \\approx D_h / 2',
  };

  const ybarCompute = (shape: string, i: Record<string, number>) => {
    switch (shape) {
      case 'trapezoidal': return i.y * (3 * i.b + 2 * i.m * i.y) / (6 * (i.b + i.m * i.y));
      case 'triangular': return i.y / 3;
      case 'circular': return geo(shape, i).D / 2;
      default: return i.y / 2;
    }
  };

  return [
    { label: 'Flow Area', latex: AREA_LATEX[shape], compute: (i) => geo(shape, i).A },
    { label: 'Centroid Depth', latex: ybarLabel[shape] || '\\bar{y} = y/2', compute: (i) => ybarCompute(shape, i) },
    { label: 'Pressure + Weight Force', latex: '\\bar{y} \\cdot A', compute: (i) => { const { A } = geo(shape, i); return ybarCompute(shape, i) * A; } },
    { label: 'Momentum Flux', latex: '\\frac{Q^2}{g A}', compute: (i) => { const { A } = geo(shape, i); return A > 0 ? (i.Q * i.Q) / (i.g * A) : 0; } },
    { label: 'Momentum Function', latex: 'M = \\frac{Q^2}{gA} + \\bar{y}A', compute: (i) => { const { A } = geo(shape, i); return A > 0 ? (i.Q * i.Q) / (i.g * A) + ybarCompute(shape, i) * A : 0; } },
  ];
}

function jumpSteps(shape: string): SolutionStep[] {
  return [
    { label: 'Upstream Area', latex: AREA_LATEX[shape].replace(/y/g, 'y_1'), compute: (i) => geo(shape, { ...i, y: i.y1 }).A },
    { label: 'Upstream Velocity', latex: 'V_1 = Q / A_1', compute: (i) => { const { A } = geo(shape, { ...i, y: i.y1 }); return A > 0 ? i.Q / A : 0; } },
    { label: 'Upstream Froude', latex: 'Fr_1 = V_1 / \\sqrt{g D_1}', compute: (i) => { const { A, D } = geo(shape, { ...i, y: i.y1 }); const V = A > 0 ? i.Q / A : 0; return D > 0 ? V / Math.sqrt(i.g * D) : 0; } },
    ...(shape === 'rectangular' ? [
      { label: 'Conjugate Depth', latex: 'y_2 = \\frac{y_1}{2}(\\sqrt{1 + 8 Fr_1^2} - 1)', compute: (i: Record<string, number>) => { const Fr1 = (i.Q / (i.b * i.y1)) / Math.sqrt(i.g * i.y1); return (i.y1 / 2) * (Math.sqrt(1 + 8 * Fr1 * Fr1) - 1); } },
      { label: 'Energy Loss', latex: '\\Delta E = \\frac{(y_2 - y_1)^3}{4 y_1 y_2}', compute: (i: Record<string, number>) => { const Fr1 = (i.Q / (i.b * i.y1)) / Math.sqrt(i.g * i.y1); const y2 = (i.y1 / 2) * (Math.sqrt(1 + 8 * Fr1 * Fr1) - 1); return Math.pow(y2 - i.y1, 3) / (4 * i.y1 * y2); } },
    ] : [
      { label: 'Conjugate Depth', latex: 'y_2: \\; M(y_2) = M(y_1)', compute: () => NaN },
    ]),
  ];
}

function combinedSteps(): SolutionStep[] {
  return [
    { label: 'Flow Area', latex: 'A = b \\cdot y', compute: (i) => i.b * i.y },
    { label: 'Specific Energy', latex: 'E = y + \\frac{Q^2}{2gA^2}', compute: (i) => { const A = i.b * i.y; return A > 0 ? i.y + (i.Q * i.Q) / (2 * i.g * A * A) : 0; } },
    { label: 'Momentum Function', latex: 'M = \\frac{Q^2}{gA} + \\frac{by^2}{2}', compute: (i) => { const A = i.b * i.y; return A > 0 ? (i.Q * i.Q) / (i.g * A) + (i.b * i.y * i.y) / 2 : 0; } },
    { label: 'Critical Depth', latex: 'y_c = (Q^2/(gb^2))^{1/3}', compute: (i) => Math.pow((i.Q * i.Q) / (i.g * i.b * i.b), 1 / 3) },
  ];
}

function manningSteps(shape: string): SolutionStep[] {
  return [
    { label: 'Flow Area', latex: AREA_LATEX[shape], compute: (i) => geo(shape, i).A },
    { label: 'Wetted Perimeter', latex: PERIMETER_LATEX[shape], compute: (i) => geo(shape, i).P },
    { label: 'Hydraulic Radius', latex: 'R = A / P', compute: (i) => geo(shape, i).R },
    { label: 'Velocity (Manning)', latex: 'V = \\frac{k}{n} R^{2/3} S_f^{1/2}', compute: (i) => { const { R } = geo(shape, i); return (i.k / i.n) * Math.pow(R, 2 / 3) * Math.sqrt(i.Sf); } },
    { label: 'Discharge', latex: 'Q = V \\cdot A', compute: (i) => { const { A, R } = geo(shape, i); return (i.k / i.n) * A * Math.pow(R, 2 / 3) * Math.sqrt(i.Sf); } },
  ];
}

function normalDepthSteps(shape: string): SolutionStep[] {
  return [
    { label: 'Section Factor Target', latex: 'AR^{2/3} = \\frac{nQ}{k\\sqrt{S_0}}', compute: (i) => (i.n * i.Q) / (i.k * Math.sqrt(i.S0)) },
    { label: 'Normal Depth', latex: 'y_n: \\; A_n R_n^{2/3} = \\frac{nQ}{k\\sqrt{S_0}}', compute: (i) => {
      const target = (i.n * i.Q) / (i.k * Math.sqrt(i.S0));
      let yn = 1;
      for (let it = 0; it < 60; it++) {
        const { A, R, P } = geo(shape, { ...i, y: yn });
        const f = A * Math.pow(R, 2 / 3) - target;
        // numerical derivative
        const dy = 1e-6;
        const g2 = geo(shape, { ...i, y: yn + dy });
        const f2 = g2.A * Math.pow(g2.R, 2 / 3) - target;
        const df = (f2 - f) / dy;
        if (Math.abs(df) < 1e-15) break;
        yn = yn - f / df;
        if (yn < 0.001) yn = 0.001;
      }
      return yn;
    } },
    { label: 'Normal Area', latex: 'A_n = A(y_n)', compute: (i) => {
      const target = (i.n * i.Q) / (i.k * Math.sqrt(i.S0));
      let yn = 1;
      for (let it = 0; it < 60; it++) {
        const { A, R } = geo(shape, { ...i, y: yn });
        const f = A * Math.pow(R, 2 / 3) - target;
        const dy = 1e-6;
        const g2 = geo(shape, { ...i, y: yn + dy });
        const f2 = g2.A * Math.pow(g2.R, 2 / 3) - target;
        const df = (f2 - f) / dy;
        if (Math.abs(df) < 1e-15) break;
        yn = yn - f / df;
        if (yn < 0.001) yn = 0.001;
      }
      return geo(shape, { ...i, y: yn }).A;
    } },
  ];
}

function classificationSteps(shape: string): SolutionStep[] {
  const ycCompute = (i: Record<string, number>) => {
    if (shape === 'rectangular') return Math.pow((i.Q * i.Q) / (i.g * i.b * i.b), 1 / 3);
    let lo = 0.001, hi = 50;
    if (shape === 'circular') hi = i.d * 0.999;
    for (let it = 0; it < 60; it++) {
      const mid = (lo + hi) / 2;
      const g2 = geo(shape, { ...i, y: mid });
      const val = g2.A > 0 && g2.T > 0 ? (i.Q * i.Q * g2.T) / (i.g * Math.pow(g2.A, 3)) : 0;
      if (val > 1) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  };

  return [
    { label: 'Normal Depth', latex: 'y_n \\text{ from Manning\'s equation}', compute: (i) => {
      const target = (i.n * i.Q) / (i.k * Math.sqrt(i.S0));
      let yn = 1;
      for (let it = 0; it < 60; it++) {
        const { A, R } = geo(shape, { ...i, y: yn });
        const f = A * Math.pow(R, 2 / 3) - target;
        const dy = 1e-6;
        const g2 = geo(shape, { ...i, y: yn + dy });
        const f2 = g2.A * Math.pow(g2.R, 2 / 3) - target;
        const df = (f2 - f) / dy;
        if (Math.abs(df) < 1e-15) break;
        yn = yn - f / df;
        if (yn < 0.001) yn = 0.001;
      }
      return yn;
    } },
    { label: 'Critical Depth', latex: shape === 'rectangular' ? 'y_c = (Q^2/(g b^2))^{1/3}' : 'y_c: \\; Q^2 T/(g A^3) = 1', compute: ycCompute },
  ];
}

function compositeSteps(): SolutionStep[] {
  return [
    { label: 'Section Factor', latex: 'AR^{2/3} = \\frac{nQ}{k\\sqrt{S_0}}', compute: (i) => (i.n * i.Q) / (i.k * Math.sqrt(i.S0)) },
    { label: 'Normal Depth', latex: 'y_n: \\; A_n R_n^{2/3} = \\text{target}', compute: (i) => {
      const target = (i.n * i.Q) / (i.k * Math.sqrt(i.S0));
      let yn = 1;
      for (let it = 0; it < 60; it++) {
        const A = i.b * yn; const P = i.b + 2 * yn; const R = A / P;
        const f = A * Math.pow(R, 2 / 3) - target;
        const dy = 1e-6; const A2 = i.b * (yn + dy); const P2 = i.b + 2 * (yn + dy); const R2 = A2 / P2;
        const f2 = A2 * Math.pow(R2, 2 / 3) - target;
        const df = (f2 - f) / dy;
        if (Math.abs(df) < 1e-15) break;
        yn = yn - f / df; if (yn < 0.001) yn = 0.001;
      }
      return yn;
    } },
    { label: 'Critical Depth', latex: 'y_c = (Q^2/(gb^2))^{1/3}', compute: (i) => Math.pow((i.Q * i.Q) / (i.g * i.b * i.b), 1 / 3) },
  ];
}

function profileSteps(): SolutionStep[] {
  return [
    { label: 'Normal Depth', latex: 'y_n \\text{ from Manning}', compute: (i) => {
      const target = (i.n * i.Q) / (i.k * Math.sqrt(i.S0));
      let yn = 1;
      for (let it = 0; it < 60; it++) {
        const A = i.b * yn; const P = i.b + 2 * yn; const R = A / P;
        const f = A * Math.pow(R, 2 / 3) - target;
        const dy = 1e-6; const A2 = i.b * (yn + dy); const P2 = i.b + 2 * (yn + dy); const R2 = A2 / P2;
        const f2 = A2 * Math.pow(R2, 2 / 3) - target;
        const df = (f2 - f) / dy;
        if (Math.abs(df) < 1e-15) break;
        yn = yn - f / df; if (yn < 0.001) yn = 0.001;
      }
      return yn;
    } },
    { label: 'Critical Depth', latex: 'y_c = (Q^2/(gb^2))^{1/3}', compute: (i) => Math.pow((i.Q * i.Q) / (i.g * i.b * i.b), 1 / 3) },
    { label: 'Starting Energy', latex: 'E_0 = y_0 + \\frac{Q^2}{2g(by_0)^2}', compute: (i) => { const A = i.b * i.y0; return i.y0 + (i.Q * i.Q) / (2 * i.g * A * A); } },
    { label: 'Starting Froude', latex: 'Fr_0 = Q / (by_0 \\sqrt{g y_0})', compute: (i) => (i.Q / (i.b * i.y0)) / Math.sqrt(i.g * i.y0) },
  ];
}

function fallVelocitySteps(): SolutionStep[] {
  return [
    { label: 'Diameter in meters', latex: 'd = d_{mm} / 1000', compute: (i) => i.d / 1000 },
    { label: 'Stokes Velocity', latex: 'w_s = \\frac{(SG-1)g d^2}{18\\nu}', compute: (i) => { const dm = i.d / 1000; return ((i.SG - 1) * i.g * dm * dm) / (18 * i.nu); } },
    { label: 'Particle Reynolds', latex: 'Re = w_s d / \\nu', compute: (i) => { const dm = i.d / 1000; const ws = ((i.SG - 1) * i.g * dm * dm) / (18 * i.nu); return ws * dm / i.nu; } },
  ];
}

function shieldsSteps(): SolutionStep[] {
  return [
    { label: 'Bed Shear Stress', latex: '\\tau_0 = \\gamma_w R S_f', compute: (i) => i.gammaW * i.R * i.Sf },
    { label: 'Shear Velocity', latex: 'u_* = \\sqrt{\\tau_0 / \\rho}', compute: (i) => Math.sqrt((i.gammaW * i.R * i.Sf) / i.rho) },
    { label: 'Boundary Reynolds', latex: 'Re_* = u_* d / \\nu', compute: (i) => { const uStar = Math.sqrt((i.gammaW * i.R * i.Sf) / i.rho); return uStar * i.dUnits / i.nu; } },
    { label: 'Shields Parameter', latex: '\\tau^* = \\frac{\\tau_0}{(\\gamma_s - \\gamma_w) d}', compute: (i) => { const gammaS = i.SG * i.gammaW; return (i.gammaW * i.R * i.Sf) / ((gammaS - i.gammaW) * i.dUnits); } },
  ];
}

function bedloadSteps(): SolutionStep[] {
  return [
    { label: 'Flow Intensity', latex: '\\Psi = \\frac{(\\gamma_s - \\gamma_w) d}{\\gamma_w R S_f}', compute: (i) => { const gammaS = i.SG * i.gammaW; return ((gammaS - i.gammaW) * i.d) / (i.gammaW * i.R * i.Sf); } },
    { label: 'Transport Intensity', latex: '\\Phi = 40 / \\Psi^3', compute: (i) => { const gammaS = i.SG * i.gammaW; const psi = ((gammaS - i.gammaW) * i.d) / (i.gammaW * i.R * i.Sf); return 40 / (psi * psi * psi); } },
  ];
}

/* ── Public API ─────────────────────────────────────────────────── */

/**
 * Return the step-by-step solution for a given calculator and channel shape.
 * Always returns an array (empty if no steps defined for that combo).
 */
export function getStepsForShape(calculatorId: string, shape: string): SolutionStep[] {
  switch (calculatorId) {
    case 'ch1-geometry':       return geometrySteps(shape);
    case 'ch1-froude':         return froudeSteps(shape);
    case 'ch2-energy':         return energySteps(shape);
    case 'ch2-critical':       return criticalSteps(shape);
    case 'ch2-alternate':      return alternateSteps(shape);
    case 'ch2-obstructions-step': return obstructionStepSteps();
    case 'ch2-obstructions-constriction': return obstructionConstrictionSteps();
    case 'ch3-momentum':       return momentumSteps(shape);
    case 'ch3-jump':           return jumpSteps(shape);
    case 'ch3-combined':       return combinedSteps();
    case 'ch4-manning':        return manningSteps(shape);
    case 'ch4-normal':         return normalDepthSteps(shape);
    case 'ch4-classification': return classificationSteps(shape);
    case 'ch5-composite':      return compositeSteps();
    case 'ch6-profiles':       return profileSteps();
    case 'ch7-fall':           return fallVelocitySteps();
    case 'ch7-shields':        return shieldsSteps();
    case 'ch7-bedload':        return bedloadSteps();
    default:                   return [];
  }
}

/**
 * @deprecated Use getStepsForShape() instead. Kept for backward compat.
 */
export const SOLUTION_STEPS: Record<string, SolutionStep[]> = {};
