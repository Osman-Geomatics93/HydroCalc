import { describe, it, expect } from 'vitest';
import { parseNaturalLanguage } from './nlp-parser';

describe('parseNaturalLanguage', () => {
  it('returns null for empty string', () => {
    expect(parseNaturalLanguage('')).toBeNull();
  });

  it('returns null for very short input', () => {
    expect(parseNaturalLanguage('ab')).toBeNull();
  });

  it('returns null for text with no recognizable values', () => {
    expect(parseNaturalLanguage('hello world')).toBeNull();
  });

  it('parses explicit parameter assignments', () => {
    const result = parseNaturalLanguage('b=3 y=1.5 Q=10 n=0.013 S0=0.001');
    expect(result).not.toBeNull();
    expect(result!.values.b).toBe(3);
    expect(result!.values.y).toBe(1.5);
    expect(result!.values.Q).toBe(10);
    expect(result!.values.n).toBe(0.013);
    expect(result!.values.S0).toBe(0.001);
  });

  it('detects rectangular shape', () => {
    const result = parseNaturalLanguage('rectangular channel Q=5');
    expect(result).not.toBeNull();
    expect(result!.shape).toBe('rectangular');
  });

  it('detects trapezoidal shape', () => {
    const result = parseNaturalLanguage('trapezoidal channel b=4 m=2');
    expect(result!.shape).toBe('trapezoidal');
    expect(result!.values.b).toBe(4);
    expect(result!.values.m).toBe(2);
  });

  it('detects circular shape from "pipe"', () => {
    const result = parseNaturalLanguage('circular pipe d=1.2');
    expect(result!.shape).toBe('circular');
    expect(result!.values.d).toBe(1.2);
  });

  it('detects calculator hints', () => {
    const result = parseNaturalLanguage('find critical depth for Q=10');
    expect(result!.calculatorId).toBe('ch2/critical-depth');
  });

  it('detects Manning calculator hint', () => {
    const result = parseNaturalLanguage('manning equation Q=5');
    expect(result!.calculatorId).toBe('ch4/manning');
  });

  it('parses natural language with units', () => {
    const result = parseNaturalLanguage('5 m3/s discharge');
    expect(result!.values.Q).toBe(5);
  });

  it('parses width from natural language', () => {
    const result = parseNaturalLanguage('3 m wide channel');
    expect(result!.values.b).toBe(3);
  });

  it('parses "rect" abbreviation', () => {
    const result = parseNaturalLanguage('rect channel b=5');
    expect(result!.shape).toBe('rectangular');
  });

  it('handles spaces around equals sign', () => {
    const result = parseNaturalLanguage('Q = 15 b = 3');
    expect(result!.values.Q).toBe(15);
    expect(result!.values.b).toBe(3);
  });

  it('parses friction slope', () => {
    const result = parseNaturalLanguage('Sf=0.002');
    expect(result!.values.Sf).toBe(0.002);
  });

  it('detects hydraulic jump calculator', () => {
    const result = parseNaturalLanguage('hydraulic jump y1=0.3 Q=5');
    expect(result!.calculatorId).toBe('ch3/hydraulic-jump');
    expect(result!.values.y1).toBe(0.3);
  });
});
