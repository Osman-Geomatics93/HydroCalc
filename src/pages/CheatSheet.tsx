import { FormulaDisplay } from '../components/shared/FormulaDisplay';

interface FormulaSection {
  title: string;
  formulas: { name: string; latex: string; notes?: string }[];
}

const SECTIONS: FormulaSection[] = [
  {
    title: 'Channel Geometry',
    formulas: [
      { name: 'Rectangular Area', latex: 'A = by', notes: 'b = bottom width, y = depth' },
      { name: 'Rectangular Wetted Perimeter', latex: 'P = b + 2y' },
      { name: 'Trapezoidal Area', latex: 'A = (b + my)y', notes: 'm = side slope H:V' },
      { name: 'Trapezoidal Wetted Perimeter', latex: 'P = b + 2y\\sqrt{1 + m^2}' },
      { name: 'Triangular Area', latex: 'A = my^2' },
      { name: 'Hydraulic Radius', latex: 'R = \\frac{A}{P}' },
      { name: 'Hydraulic Depth', latex: 'D_h = \\frac{A}{T}' },
      { name: 'Top Width (Trap)', latex: 'T = b + 2my' },
    ],
  },
  {
    title: 'Energy',
    formulas: [
      { name: 'Specific Energy', latex: 'E = y + \\frac{V^2}{2g} = y + \\frac{Q^2}{2gA^2}' },
      { name: 'Froude Number', latex: 'Fr = \\frac{V}{\\sqrt{gD_h}} = \\frac{Q}{A\\sqrt{gD_h}}' },
      { name: 'Critical Depth (Rect)', latex: 'y_c = \\left(\\frac{q^2}{g}\\right)^{1/3}', notes: 'q = Q/b' },
      { name: 'Critical Condition', latex: '\\frac{Q^2 T}{g A^3} = 1' },
      { name: 'Minimum Energy', latex: 'E_{\\min} = \\frac{3}{2} y_c \\quad \\text{(rectangular)}' },
    ],
  },
  {
    title: 'Momentum',
    formulas: [
      { name: 'Momentum Function', latex: 'M = \\frac{Q^2}{gA} + \\bar{y}A' },
      { name: 'Centroid Depth (Rect)', latex: '\\bar{y} = \\frac{y}{2}' },
      { name: 'Conjugate Depth (Rect)', latex: 'y_2 = \\frac{y_1}{2}\\left(\\sqrt{1 + 8Fr_1^2} - 1\\right)' },
      { name: 'Energy Loss (Jump)', latex: '\\Delta E = \\frac{(y_2 - y_1)^3}{4 y_1 y_2}' },
    ],
  },
  {
    title: 'Uniform Flow',
    formulas: [
      { name: "Manning's Equation", latex: 'V = \\frac{k}{n} R^{2/3} S_f^{1/2}', notes: 'k = 1 (SI), 1.486 (US)' },
      { name: 'Manning Discharge', latex: 'Q = \\frac{k}{n} A R^{2/3} S_f^{1/2}' },
      { name: 'Normal Depth', latex: 'Q = \\frac{k}{n} A(y_n) R(y_n)^{2/3} S_0^{1/2}', notes: 'Solve iteratively' },
      { name: 'Best Section (Rect)', latex: '\\frac{b}{y} = 2' },
      { name: 'Best Section (Trap)', latex: 'm = \\frac{1}{\\sqrt{3}} \\approx 0.577' },
    ],
  },
  {
    title: 'Gradually Varied Flow',
    formulas: [
      { name: 'GVF Equation', latex: '\\frac{dy}{dx} = \\frac{S_0 - S_f}{1 - Fr^2}' },
      { name: 'Standard Step', latex: '\\Delta x = \\frac{E_2 - E_1}{S_0 - \\bar{S}_f}' },
      { name: 'Friction Slope', latex: 'S_f = \\frac{n^2 V^2}{k^2 R^{4/3}} = \\frac{n^2 Q^2}{k^2 A^2 R^{4/3}}' },
    ],
  },
  {
    title: 'Sediment Transport',
    formulas: [
      { name: 'Bed Shear Stress', latex: '\\tau_0 = \\gamma_w R S_f' },
      { name: 'Shields Parameter', latex: '\\tau^* = \\frac{\\tau_0}{(\\gamma_s - \\gamma_w) d}' },
      { name: 'Shear Velocity', latex: 'u_* = \\sqrt{\\frac{\\tau_0}{\\rho}}' },
      { name: 'Boundary Reynolds', latex: 'Re_* = \\frac{u_* d}{\\nu}' },
      { name: 'Einstein-Brown', latex: '\\Phi = 40 \\left(\\frac{1}{\\Psi}\\right)^3', notes: 'Ψ = τ*⁻¹' },
    ],
  },
];

export default function CheatSheet() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 cheat-sheet">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]">Reference</div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
          Formula Cheat Sheet
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          All key open channel flow formulas in one place. Print-optimized.
        </p>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.title}>
          <h2 className="text-lg font-bold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2 mb-4">
            {section.title}
          </h2>
          <div className="space-y-3">
            {section.formulas.map((f) => (
              <div key={f.name} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[6px] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[var(--color-text)] mb-2">{f.name}</div>
                    <FormulaDisplay latex={f.latex} />
                  </div>
                  {f.notes && (
                    <div className="text-xs text-[var(--color-text-muted)] mt-1 shrink-0 max-w-[150px]">
                      {f.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center text-xs text-[var(--color-text-subtle)] py-4 no-print">
        Press Ctrl+P to print this page as a cheat sheet.
      </div>
    </div>
  );
}
