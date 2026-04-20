import { describe, it, expect } from 'vitest';
import { stokesVelocity, rubeyVelocity } from './fall-velocity';
import { shieldsParameter, criticalShieldsParameter } from './shields';
import { flowIntensity, transportIntensity } from './einstein-brown';

const g = 9.81;
const nu = 1.004e-6; // water at 20°C

describe('stokesVelocity', () => {
  it('computes fall velocity for fine sand (d=0.1mm)', () => {
    const d = 0.0001; // 0.1 mm
    const ws = stokesVelocity(d, 2.65, g, nu);
    expect(ws).toBeGreaterThan(0);
    expect(ws).toBeLessThan(0.1); // should be small for fine particles
  });
});

describe('rubeyVelocity', () => {
  it('computes fall velocity for medium sand (d=0.5mm)', () => {
    const d = 0.0005;
    const ws = rubeyVelocity(d, 2.65, g, nu);
    expect(ws).toBeGreaterThan(0);
    expect(ws).toBeLessThan(1);
  });

  it('agrees with Stokes for very fine particles', () => {
    const d = 0.00005; // 0.05 mm - very fine
    const wsStokes = stokesVelocity(d, 2.65, g, nu);
    const wsRubey = rubeyVelocity(d, 2.65, g, nu);
    // Rubey should be close to Stokes for very fine particles
    expect(wsRubey).toBeCloseTo(wsStokes, 3);
  });
});

describe('shieldsParameter', () => {
  it('computes dimensionless shear stress', () => {
    const tau0 = 5; // N/m²
    const gammaS = 2.65 * 9810;
    const gammaW = 9810;
    const d = 0.001; // 1mm
    const tauStar = shieldsParameter(tau0, gammaS, gammaW, d);
    expect(tauStar).toBeGreaterThan(0);
  });
});

describe('criticalShieldsParameter', () => {
  it('returns ~0.06 for high Re*', () => {
    const tauStarCr = criticalShieldsParameter(1000);
    expect(tauStarCr).toBeCloseTo(0.06, 1);
  });

  it('returns ~0.033 for Re* ≈ 10', () => {
    const tauStarCr = criticalShieldsParameter(10);
    expect(tauStarCr).toBeCloseTo(0.033, 2);
  });
});

describe('einstein-brown', () => {
  it('flow intensity is positive', () => {
    const psi = flowIntensity(2.65 * 9810, 9810, 0.001, 0.5, 0.001);
    expect(psi).toBeGreaterThan(0);
  });

  it('transport intensity increases with decreasing psi', () => {
    const phi1 = transportIntensity(0.5);
    const phi2 = transportIntensity(0.3);
    expect(phi2).toBeGreaterThan(phi1);
  });
});
