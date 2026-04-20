export interface ParamRange {
  key: string;
  min: number;
  max: number;
}

export interface MonteCarloResult {
  values: number[];
  mean: number;
  std: number;
  p5: number;
  p95: number;
  histogram: { binStart: number; binEnd: number; count: number }[];
}

/**
 * Latin Hypercube Sampling for a single parameter.
 */
function latinHypercube(n: number, min: number, max: number): number[] {
  const samples: number[] = [];
  const interval = (max - min) / n;
  for (let i = 0; i < n; i++) {
    samples.push(min + (i + Math.random()) * interval);
  }
  // Shuffle
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [samples[i], samples[j]] = [samples[j], samples[i]];
  }
  return samples;
}

/**
 * Runs a calculation function with random inputs drawn from specified ranges.
 * Uses Latin Hypercube Sampling for efficient space coverage.
 */
export function monteCarloRun(
  calcFn: (params: Record<string, number>) => number,
  paramRanges: ParamRange[],
  baseParams: Record<string, number>,
  nSamples: number = 1000
): MonteCarloResult {
  // Generate LHS samples for each parameter
  const sampledParams: Record<string, number[]> = {};
  for (const range of paramRanges) {
    sampledParams[range.key] = latinHypercube(nSamples, range.min, range.max);
  }

  // Run calculations
  const values: number[] = [];
  for (let i = 0; i < nSamples; i++) {
    const params = { ...baseParams };
    for (const range of paramRanges) {
      params[range.key] = sampledParams[range.key][i];
    }
    try {
      const result = calcFn(params);
      if (isFinite(result)) {
        values.push(result);
      }
    } catch {
      // Skip failed computations
    }
  }

  // Statistics
  values.sort((a, b) => a - b);
  const n = values.length;
  const mean = values.reduce((s, v) => s + v, 0) / n;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);
  const p5 = values[Math.floor(n * 0.05)] ?? mean;
  const p95 = values[Math.floor(n * 0.95)] ?? mean;

  // Histogram
  const nBins = 30;
  const minVal = values[0];
  const maxVal = values[n - 1];
  const binWidth = (maxVal - minVal) / nBins || 1;
  const histogram: MonteCarloResult['histogram'] = [];
  for (let i = 0; i < nBins; i++) {
    const binStart = minVal + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = values.filter((v) => v >= binStart && (i === nBins - 1 ? v <= binEnd : v < binEnd)).length;
    histogram.push({ binStart, binEnd, count });
  }

  return { values, mean, std, p5, p95, histogram };
}
