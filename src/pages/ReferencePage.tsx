import { FormulaDisplay } from '../components/shared/FormulaDisplay';

interface FormulaSection {
  title: string;
  formulas: { label: string; latex: string }[];
}

const sections: FormulaSection[] = [
  {
    title: 'Channel Geometry',
    formulas: [
      { label: 'Rectangular', latex: 'A = by, \\quad P = b + 2y, \\quad T = b' },
      { label: 'Trapezoidal', latex: 'A = (b+my)y, \\quad P = b + 2y\\sqrt{1+m^2}, \\quad T = b + 2my' },
      { label: 'Triangular', latex: 'A = my^2, \\quad P = 2y\\sqrt{1+m^2}, \\quad T = 2my' },
      { label: 'Hydraulic radius', latex: 'R = \\frac{A}{P}, \\quad D = \\frac{A}{T}' },
    ],
  },
  {
    title: 'Energy',
    formulas: [
      { label: 'Specific energy', latex: 'E = y + \\frac{V^2}{2g} = y + \\frac{Q^2}{2gA^2}' },
      { label: 'Critical depth (rect)', latex: 'y_c = \\left(\\frac{q^2}{g}\\right)^{1/3}, \\quad E_c = \\frac{3}{2}y_c' },
      { label: 'Critical condition', latex: '\\frac{Q^2 T}{g A^3} = 1' },
      { label: 'Froude number', latex: 'Fr = \\frac{V}{\\sqrt{gD}}' },
    ],
  },
  {
    title: 'Momentum',
    formulas: [
      { label: 'Momentum function', latex: 'M = \\frac{Q^2}{gA} + \\bar{y}A' },
      { label: 'Conjugate depth (rect)', latex: 'y_2 = \\frac{y_1}{2}\\left(\\sqrt{1 + 8Fr_1^2} - 1\\right)' },
      { label: 'Energy loss', latex: '\\Delta E = \\frac{(y_2 - y_1)^3}{4y_1 y_2}' },
    ],
  },
  {
    title: 'Uniform Flow',
    formulas: [
      { label: "Manning's equation", latex: 'V = \\frac{k}{n} R^{2/3} S_f^{1/2}, \\quad Q = VA' },
      { label: 'Friction slope', latex: 'S_f = \\left(\\frac{nV}{kR^{2/3}}\\right)^2' },
      { label: 'Conveyance', latex: 'K = \\frac{k}{n} A R^{2/3}, \\quad Q = K\\sqrt{S_f}' },
    ],
  },
  {
    title: 'Gradually Varied Flow',
    formulas: [
      { label: 'GVF equation', latex: '\\frac{dy}{dx} = \\frac{S_0 - S_f}{1 - Fr^2}' },
      { label: 'Standard step', latex: '\\Delta x = \\frac{E_2 - E_1}{S_0 - \\bar{S}_f}' },
    ],
  },
  {
    title: 'Sediment Transport',
    formulas: [
      { label: 'Stokes fall velocity', latex: 'w_s = \\frac{(S_G - 1)g d^2}{18\\nu}' },
      { label: 'Shields parameter', latex: '\\tau^* = \\frac{\\tau_0}{(\\gamma_s - \\gamma_w)d}' },
      { label: 'Bed shear stress', latex: '\\tau_0 = \\gamma_w R S_f' },
      { label: 'Einstein-Brown', latex: '\\Phi = 40\\left(\\frac{1}{\\Psi}\\right)^3' },
    ],
  },
];

export default function ReferencePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1
        className="text-2xl font-bold text-[var(--color-text)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Reference Formulas
      </h1>

      {sections.map((section) => (
        <div key={section.title}>
          <h2
            className="text-lg font-semibold text-[var(--color-text)] mb-3 border-b border-[var(--color-border)] pb-1"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {section.title}
          </h2>
          <div className="space-y-3">
            {section.formulas.map((f) => (
              <div key={f.label} className="flex flex-col gap-1">
                <span className="text-sm font-medium text-[var(--color-text-muted)]">{f.label}</span>
                <FormulaDisplay latex={f.latex} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
