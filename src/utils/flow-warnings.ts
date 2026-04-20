export interface Warning {
  type: 'info' | 'warning' | 'danger';
  message: string;
  learnMore?: string;
}

interface WarningParams {
  Fr?: number;
  y?: number;
  yc?: number;
  V?: number;
  n?: number;
  S0?: number;
  tau0?: number;
  tauCr?: number;
  reStar?: number;
}

export function getFlowWarnings(params: WarningParams): Warning[] {
  const warnings: Warning[] = [];

  if (params.Fr !== undefined) {
    if (params.Fr > 1.01) {
      warnings.push({
        type: 'warning',
        message: 'Supercritical flow — hydraulic jump may occur downstream',
        learnMore: '/ch3/hydraulic-jump',
      });
    }
    if (params.Fr >= 0.9 && params.Fr <= 1.1) {
      warnings.push({
        type: 'info',
        message: 'Near-critical flow — surface instability expected',
        learnMore: '/ch2/critical-depth',
      });
    }
  }

  if (params.y !== undefined && params.yc !== undefined && params.yc > 0) {
    if (params.y < params.yc) {
      warnings.push({
        type: 'info',
        message: 'Depth below critical — flow is supercritical',
        learnMore: '/ch2/energy',
      });
    }
  }

  if (params.y !== undefined && params.y < 0.01) {
    warnings.push({
      type: 'warning',
      message: "Very shallow flow — Manning's equation may be inaccurate",
    });
  }

  if (params.tau0 !== undefined && params.tauCr !== undefined && params.tauCr > 0) {
    if (params.tau0 > params.tauCr) {
      warnings.push({
        type: 'danger',
        message: 'Bed shear exceeds critical — sediment motion expected',
        learnMore: '/ch7/shields',
      });
    }
  }

  if (params.reStar !== undefined && params.reStar < 5) {
    warnings.push({
      type: 'info',
      message: 'Smooth turbulent boundary',
    });
  }

  if (params.S0 !== undefined && params.S0 < 0) {
    warnings.push({
      type: 'danger',
      message: 'Adverse slope — no normal depth exists',
    });
  }

  if (params.n !== undefined && params.n > 0.06) {
    warnings.push({
      type: 'warning',
      message: "Very high roughness — verify Manning's n value",
      learnMore: '/ch4/manning',
    });
  }

  return warnings;
}
