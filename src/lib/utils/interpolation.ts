/**
 * Linear interpolation between points.
 */
export function lerp(x: number, x0: number, x1: number, y0: number, y1: number): number {
  return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
}

/**
 * Interpolate from a sorted table of [x, y] pairs.
 * Uses linear interpolation; clamps to boundary values outside range.
 */
export function tableInterpolate(table: [number, number][], x: number): number {
  if (x <= table[0][0]) return table[0][1];
  if (x >= table[table.length - 1][0]) return table[table.length - 1][1];

  for (let i = 0; i < table.length - 1; i++) {
    if (x >= table[i][0] && x <= table[i + 1][0]) {
      return lerp(x, table[i][0], table[i + 1][0], table[i][1], table[i + 1][1]);
    }
  }
  return table[table.length - 1][1];
}

/**
 * Log-log interpolation for Shields diagram type data.
 */
export function logLogInterpolate(table: [number, number][], x: number): number {
  const logTable = table.map(([a, b]) => [Math.log10(a), Math.log10(b)] as [number, number]);
  const logX = Math.log10(x);
  return Math.pow(10, tableInterpolate(logTable, logX));
}
