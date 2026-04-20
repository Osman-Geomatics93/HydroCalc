/** LaTeX SI unit mapping */
const LATEX_UNITS: Record<string, string> = {
  m: '\\meter',
  ft: '\\foot',
  'm/s': '\\meter\\per\\second',
  'ft/s': '\\foot\\per\\second',
  'm²': '\\meter\\squared',
  'ft²': '\\foot\\squared',
  'm³/s': '\\meter\\cubed\\per\\second',
  'ft³/s': '\\foot\\cubed\\per\\second',
  'm/m': '\\meter\\per\\meter',
  'ft/ft': '\\foot\\per\\foot',
  N: '\\newton',
  Pa: '\\pascal',
  kg: '\\kilogram',
  's': '\\second',
};

export type ClipboardFormat = 'plain' | 'engineering' | 'latex' | 'excel';

export function formatForClipboard(
  value: number | string,
  unit: string | undefined,
  format: ClipboardFormat
): string {
  const num = typeof value === 'number' ? value : parseFloat(value);
  const formatted = isNaN(num) ? String(value) : num.toFixed(4);

  switch (format) {
    case 'plain':
      return formatted;

    case 'engineering':
      return unit ? `${formatted} ${unit}` : formatted;

    case 'latex': {
      const latexUnit = unit ? LATEX_UNITS[unit] : undefined;
      if (latexUnit) {
        return `\\SI{${formatted}}{${latexUnit}}`;
      }
      return unit ? `${formatted}\\,\\text{${unit}}` : formatted;
    }

    case 'excel':
      return unit ? `Value\tUnit\n${formatted}\t${unit}` : formatted;

    default:
      return formatted;
  }
}

export const FORMAT_LABELS: Record<ClipboardFormat, string> = {
  plain: 'Plain Number',
  engineering: 'With Unit',
  latex: 'LaTeX (\\SI)',
  excel: 'Excel-ready',
};
