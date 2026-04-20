import { describe, it, expect } from 'vitest';
import { getFlowWarnings, type Warning } from './flow-warnings';

describe('getFlowWarnings', () => {
  it('returns empty array for no warnings', () => {
    const warnings = getFlowWarnings({ Fr: 0.5, y: 1, yc: 0.5, n: 0.013, S0: 0.001 });
    // Fr=0.5 is subcritical (no supercritical warning), y>yc, n<0.06, S0>0
    // Only possible: near-critical (no, Fr=0.5), depth below critical (no, y>yc)
    expect(warnings).toEqual([]);
  });

  it('warns about supercritical flow when Fr > 1', () => {
    const warnings = getFlowWarnings({ Fr: 2.5 });
    const supercritical = warnings.find(w => w.message.includes('Supercritical'));
    expect(supercritical).toBeDefined();
    expect(supercritical!.type).toBe('warning');
    expect(supercritical!.learnMore).toBe('/ch3/hydraulic-jump');
  });

  it('warns about near-critical flow when Fr is close to 1', () => {
    const warnings = getFlowWarnings({ Fr: 1.0 });
    const nearCritical = warnings.find(w => w.message.includes('Near-critical'));
    expect(nearCritical).toBeDefined();
    expect(nearCritical!.type).toBe('info');
  });

  it('detects both supercritical and near-critical at Fr = 1.05', () => {
    const warnings = getFlowWarnings({ Fr: 1.05 });
    expect(warnings.some(w => w.message.includes('Supercritical'))).toBe(true);
    expect(warnings.some(w => w.message.includes('Near-critical'))).toBe(true);
  });

  it('warns about depth below critical', () => {
    const warnings = getFlowWarnings({ y: 0.3, yc: 0.8 });
    const below = warnings.find(w => w.message.includes('below critical'));
    expect(below).toBeDefined();
    expect(below!.type).toBe('info');
  });

  it('warns about very shallow flow', () => {
    const warnings = getFlowWarnings({ y: 0.005 });
    const shallow = warnings.find(w => w.message.includes('shallow'));
    expect(shallow).toBeDefined();
    expect(shallow!.type).toBe('warning');
  });

  it('warns about sediment motion when tau0 > tauCr', () => {
    const warnings = getFlowWarnings({ tau0: 5, tauCr: 3 });
    const motion = warnings.find(w => w.message.includes('sediment motion'));
    expect(motion).toBeDefined();
    expect(motion!.type).toBe('danger');
  });

  it('warns about smooth turbulent boundary when reStar < 5', () => {
    const warnings = getFlowWarnings({ reStar: 3 });
    const smooth = warnings.find(w => w.message.includes('Smooth turbulent'));
    expect(smooth).toBeDefined();
    expect(smooth!.type).toBe('info');
  });

  it('warns about adverse slope when S0 < 0', () => {
    const warnings = getFlowWarnings({ S0: -0.001 });
    const adverse = warnings.find(w => w.message.includes('Adverse slope'));
    expect(adverse).toBeDefined();
    expect(adverse!.type).toBe('danger');
  });

  it('warns about high roughness when n > 0.06', () => {
    const warnings = getFlowWarnings({ n: 0.08 });
    const rough = warnings.find(w => w.message.includes('roughness'));
    expect(rough).toBeDefined();
    expect(rough!.type).toBe('warning');
    expect(rough!.learnMore).toBe('/ch4/manning');
  });

  it('does not warn about parameters not provided', () => {
    const warnings = getFlowWarnings({});
    expect(warnings).toEqual([]);
  });

  it('does not warn about sediment when tau0 < tauCr', () => {
    const warnings = getFlowWarnings({ tau0: 2, tauCr: 5 });
    expect(warnings.some(w => w.message.includes('sediment'))).toBe(false);
  });

  it('handles combined warnings', () => {
    const warnings = getFlowWarnings({ Fr: 2.5, S0: -0.001, n: 0.08 });
    expect(warnings.length).toBeGreaterThanOrEqual(3);
    expect(warnings.some(w => w.type === 'warning')).toBe(true);
    expect(warnings.some(w => w.type === 'danger')).toBe(true);
  });
});
