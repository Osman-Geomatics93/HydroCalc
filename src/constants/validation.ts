export interface ValidationRule {
  min?: number;
  max?: number;
  warningMin?: number;
  warningMax?: number;
  warning?: string;
  tip?: string;
}

export const VALIDATION_RULES: Record<string, ValidationRule> = {
  // Manning's roughness coefficient
  "Manning's n": {
    min: 0.001,
    max: 0.15,
    warningMax: 0.06,
    warning: 'Unusually high Manning n — check material',
    tip: 'Typical range: 0.01 (smooth) to 0.05 (natural channels)',
  },
  // Slopes
  'Friction Slope': {
    min: 0,
    max: 1,
    warningMax: 0.1,
    warning: 'Very steep slope — verify input',
    tip: 'Most channels: 0.0001 to 0.02',
  },
  'Bed Slope': {
    min: -0.1,
    max: 1,
    warningMax: 0.1,
    warning: 'Very steep slope — verify input',
    tip: 'Adverse slope if negative',
  },
  // Depth
  'Flow Depth': {
    min: 0.001,
    warning: 'Depth must be positive',
    tip: 'Enter depth in current unit system',
  },
  // Width
  'Bottom Width': {
    min: 0.01,
    warning: 'Width must be positive',
    tip: 'Channel bottom width',
  },
  // Diameter
  'Diameter': {
    min: 0.01,
    warning: 'Diameter must be positive',
    tip: 'Pipe or culvert diameter',
  },
  // Side slope
  'Side Slope': {
    min: 0,
    max: 20,
    warningMax: 10,
    warning: 'Very flat side slope',
    tip: 'Horizontal:Vertical ratio (e.g. 1.5 = 1.5H:1V)',
  },
  // Discharge
  'Discharge': {
    min: 0,
    warning: 'Discharge must be non-negative',
    tip: 'Volumetric flow rate',
  },
  // Specific gravity
  'Specific Gravity': {
    min: 1.01,
    max: 10,
    warningMax: 5,
    warning: 'Unusual specific gravity',
    tip: 'Quartz sand: 2.65, heavy minerals: up to 5',
  },
  // Particle diameter
  'Particle Diameter': {
    min: 0.001,
    max: 500,
    warningMax: 100,
    warning: 'Very coarse particle',
    tip: 'Fine sand: 0.1 mm, coarse gravel: 50 mm',
  },
};

/**
 * Find a validation rule by matching against a label.
 * Checks if any known rule key is a substring of the label.
 */
export function findValidationRule(label: string): ValidationRule | undefined {
  for (const [key, rule] of Object.entries(VALIDATION_RULES)) {
    if (label.includes(key) || label.toLowerCase().includes(key.toLowerCase())) {
      return rule;
    }
  }
  // Check partial matches
  if (label.toLowerCase().includes('manning')) return VALIDATION_RULES["Manning's n"];
  if (label.toLowerCase().includes('slope') && label.toLowerCase().includes('bed')) return VALIDATION_RULES['Bed Slope'];
  if (label.toLowerCase().includes('slope')) return VALIDATION_RULES['Friction Slope'];
  if (label.toLowerCase().includes('depth')) return VALIDATION_RULES['Flow Depth'];
  if (label.toLowerCase().includes('width') && label.toLowerCase().includes('bottom')) return VALIDATION_RULES['Bottom Width'];
  if (label.toLowerCase().includes('diameter') && !label.toLowerCase().includes('particle')) return VALIDATION_RULES['Diameter'];
  if (label.toLowerCase().includes('discharge') || label.includes('(Q)')) return VALIDATION_RULES['Discharge'];
  return undefined;
}
