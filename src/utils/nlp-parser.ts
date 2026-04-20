export interface ParsedInput {
  calculatorId?: string;
  shape?: string;
  values: Record<string, number>;
}

const PARAM_PATTERNS: { key: string; patterns: RegExp[] }[] = [
  { key: 'Q', patterns: [/Q\s*=\s*([\d.]+)/i, /discharge\s*(?:=|of|is)?\s*([\d.]+)/i, /([\d.]+)\s*m[³3]\/s/i, /([\d.]+)\s*(?:cfs|ft[³3]\/s)/i] },
  { key: 'b', patterns: [/b\s*=\s*([\d.]+)/i, /(?:bottom\s*)?width\s*(?:=|of|is)?\s*([\d.]+)/i, /([\d.]+)\s*m?\s*wide/i] },
  { key: 'y', patterns: [/(?<!y[_cnr12])y\s*=\s*([\d.]+)/i, /(?:flow\s*)?depth\s*(?:=|of|is)?\s*([\d.]+)/i] },
  { key: 'n', patterns: [/n\s*=\s*(0\.[\d]+)/i, /manning['']?s?\s*n?\s*(?:=|of|is)?\s*(0\.[\d]+)/i] },
  { key: 'S0', patterns: [/S[0o]?\s*=\s*([\d.]+)/i, /(?:bed\s*)?slope\s*(?:=|of|is)?\s*([\d.]+)/i] },
  { key: 'Sf', patterns: [/Sf\s*=\s*([\d.]+)/i, /friction\s*slope\s*(?:=|of|is)?\s*([\d.]+)/i] },
  { key: 'm', patterns: [/m\s*=\s*([\d.]+)/i, /side\s*slope\s*(?:=|of|is)?\s*([\d.]+)/i] },
  { key: 'd', patterns: [/d\s*=\s*([\d.]+)/i, /diameter\s*(?:=|of|is)?\s*([\d.]+)/i] },
  { key: 'y1', patterns: [/y[_]?1\s*=\s*([\d.]+)/i] },
];

const SHAPE_PATTERNS: { shape: string; pattern: RegExp }[] = [
  { shape: 'rectangular', pattern: /\brect(?:angular)?\b/i },
  { shape: 'trapezoidal', pattern: /\btrap(?:ezoidal)?\b/i },
  { shape: 'triangular', pattern: /\btri(?:angular)?\b/i },
  { shape: 'circular', pattern: /\bcirc(?:ular)?\b|\bpipe\b/i },
];

const CALC_HINTS: { id: string; pattern: RegExp }[] = [
  { id: 'ch2/critical-depth', pattern: /critical\s*depth/i },
  { id: 'ch2/alternate-depths', pattern: /alternate\s*depth/i },
  { id: 'ch2/energy', pattern: /specific\s*energy/i },
  { id: 'ch3/momentum', pattern: /momentum/i },
  { id: 'ch3/hydraulic-jump', pattern: /hydraulic\s*jump/i },
  { id: 'ch4/manning', pattern: /manning/i },
  { id: 'ch4/normal-depth', pattern: /normal\s*depth/i },
  { id: 'ch7/shields', pattern: /shields|sediment/i },
  { id: 'ch7/fall-velocity', pattern: /fall\s*velocity/i },
];

export function parseNaturalLanguage(text: string): ParsedInput | null {
  if (!text || text.trim().length < 3) return null;

  const values: Record<string, number> = {};

  // Extract parameter values
  for (const { key, patterns } of PARAM_PATTERNS) {
    for (const pat of patterns) {
      const match = text.match(pat);
      if (match) {
        const val = parseFloat(match[1]);
        if (!isNaN(val) && val >= 0) {
          values[key] = val;
          break;
        }
      }
    }
  }

  // Detect shape
  let shape: string | undefined;
  for (const { shape: s, pattern } of SHAPE_PATTERNS) {
    if (pattern.test(text)) {
      shape = s;
      break;
    }
  }

  // Detect calculator hint
  let calculatorId: string | undefined;
  for (const { id, pattern } of CALC_HINTS) {
    if (pattern.test(text)) {
      calculatorId = id;
      break;
    }
  }

  if (Object.keys(values).length === 0 && !shape) return null;

  return { calculatorId, shape, values };
}
