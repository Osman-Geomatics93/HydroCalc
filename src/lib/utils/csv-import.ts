export interface ParsedCSV {
  headers: string[];
  rows: string[][];
}

export function parseCSV(text: string): ParsedCSV {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };

  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1)
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, '')));

  return { headers, rows };
}

export function generateCSVTemplate(inputHeaders: string[], outputHeaders: string[]): string {
  const allHeaders = [...inputHeaders, ...outputHeaders.map((h) => `[output] ${h}`)];
  return allHeaders.join(',') + '\n' + inputHeaders.map(() => '').join(',') + '\n';
}
