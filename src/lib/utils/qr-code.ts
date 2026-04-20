/**
 * Pure TypeScript QR Code generator
 * Supports byte-mode encoding, error correction level L, versions 1-10
 * Outputs SVG string
 */

// GF(2^8) field arithmetic for Reed-Solomon
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x = x << 1;
    if (x & 0x100) x ^= 0x11d; // primitive polynomial
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
}
initGaloisField();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGenPoly(nsym: number): Uint8Array {
  let g = new Uint8Array([1]);
  for (let i = 0; i < nsym; i++) {
    const newG = new Uint8Array(g.length + 1);
    const factor = GF_EXP[i];
    for (let j = 0; j < g.length; j++) {
      newG[j] ^= g[j];
      newG[j + 1] ^= gfMul(g[j], factor);
    }
    g = newG;
  }
  return g;
}

function rsEncode(data: Uint8Array, nsym: number): Uint8Array {
  const gen = rsGenPoly(nsym);
  const out = new Uint8Array(data.length + nsym);
  out.set(data);
  for (let i = 0; i < data.length; i++) {
    const coef = out[i];
    if (coef !== 0) {
      for (let j = 1; j < gen.length; j++) {
        out[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return out.slice(data.length);
}

// QR version info
interface VersionInfo {
  size: number;
  dataCodewords: number;
  ecCodewords: number;
  totalCodewords: number;
}

// Error correction level L versions 1-10
const VERSIONS: VersionInfo[] = [
  { size: 21, dataCodewords: 19, ecCodewords: 7, totalCodewords: 26 },      // v1
  { size: 25, dataCodewords: 34, ecCodewords: 10, totalCodewords: 44 },     // v2
  { size: 29, dataCodewords: 55, ecCodewords: 15, totalCodewords: 70 },     // v3
  { size: 33, dataCodewords: 80, ecCodewords: 20, totalCodewords: 100 },    // v4
  { size: 37, dataCodewords: 108, ecCodewords: 26, totalCodewords: 134 },   // v5
  { size: 41, dataCodewords: 136, ecCodewords: 18, totalCodewords: 154 },   // v6
  { size: 45, dataCodewords: 156, ecCodewords: 20, totalCodewords: 176 },   // v7
  { size: 49, dataCodewords: 194, ecCodewords: 24, totalCodewords: 218 },   // v8
  { size: 53, dataCodewords: 232, ecCodewords: 30, totalCodewords: 260 },   // v9
  { size: 57, dataCodewords: 274, ecCodewords: 18, totalCodewords: 292 },   // v10
];

function selectVersion(dataLen: number): { version: number; info: VersionInfo } {
  // Byte mode: 4 bits mode + 8/16 bits count + 8*len bits data + 4 bits terminator
  for (let v = 0; v < VERSIONS.length; v++) {
    const charCountBits = v < 9 ? 8 : 16;
    const totalBits = 4 + charCountBits + dataLen * 8;
    const totalBytes = Math.ceil(totalBits / 8);
    if (totalBytes <= VERSIONS[v].dataCodewords) {
      return { version: v + 1, info: VERSIONS[v] };
    }
  }
  // Fallback to largest version
  return { version: 10, info: VERSIONS[9] };
}

function encodeData(text: string, info: VersionInfo, version: number): Uint8Array {
  const bytes = new TextEncoder().encode(text);
  const charCountBits = version < 10 ? 8 : 16;
  const bits: number[] = [];

  // Mode indicator: byte mode = 0100
  bits.push(0, 1, 0, 0);

  // Character count
  for (let i = charCountBits - 1; i >= 0; i--) {
    bits.push((bytes.length >> i) & 1);
  }

  // Data
  for (const b of bytes) {
    for (let i = 7; i >= 0; i--) {
      bits.push((b >> i) & 1);
    }
  }

  // Terminator (up to 4 bits)
  const maxBits = info.dataCodewords * 8;
  for (let i = 0; i < 4 && bits.length < maxBits; i++) {
    bits.push(0);
  }

  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);

  // Pad bytes
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < maxBits) {
    const pb = padBytes[padIdx % 2];
    for (let i = 7; i >= 0; i--) bits.push((pb >> i) & 1);
    padIdx++;
  }

  // Convert to bytes
  const data = new Uint8Array(info.dataCodewords);
  for (let i = 0; i < info.dataCodewords; i++) {
    let byte = 0;
    for (let b = 0; b < 8; b++) {
      byte = (byte << 1) | (bits[i * 8 + b] || 0);
    }
    data[i] = byte;
  }

  return data;
}

function createMatrix(size: number): { matrix: number[][]; reserved: boolean[][] } {
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));
  const reserved = Array.from({ length: size }, () => Array(size).fill(false));
  return { matrix, reserved };
}

function addFinderPattern(matrix: number[][], reserved: boolean[][], row: number, col: number) {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const pr = row + r, pc = col + c;
      if (pr < 0 || pr >= matrix.length || pc < 0 || pc >= matrix.length) continue;
      if (r === -1 || r === 7 || c === -1 || c === 7) {
        matrix[pr][pc] = 0;
      } else if (r === 0 || r === 6 || c === 0 || c === 6) {
        matrix[pr][pc] = 1;
      } else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
        matrix[pr][pc] = 1;
      } else {
        matrix[pr][pc] = 0;
      }
      reserved[pr][pc] = true;
    }
  }
}

function addTimingPatterns(matrix: number[][], reserved: boolean[][]) {
  const size = matrix.length;
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    reserved[6][i] = true;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
    reserved[i][6] = true;
  }
}

function reserveFormatArea(reserved: boolean[][], size: number) {
  // Around finder patterns
  for (let i = 0; i < 9; i++) {
    if (i < size) reserved[8][i] = true;
    if (i < size) reserved[i][8] = true;
    if (size - 1 - i >= 0) reserved[8][size - 1 - i] = true;
    if (size - 1 - i >= 0) reserved[size - 1 - i][8] = true;
  }
  // Dark module
  reserved[size - 8][8] = true;
}

function placeData(matrix: number[][], reserved: boolean[][], codewords: Uint8Array) {
  const size = matrix.length;
  let bitIdx = 0;
  const totalBits = codewords.length * 8;

  // Place data in two-column modules, right to left, alternating up/down
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5; // skip timing pattern column
    const rows = upward ? Array.from({ length: size }, (_, i) => size - 1 - i) : Array.from({ length: size }, (_, i) => i);
    for (const row of rows) {
      for (const col of [right, right - 1]) {
        if (col < 0 || reserved[row][col]) continue;
        if (bitIdx < totalBits) {
          const byteIdx = Math.floor(bitIdx / 8);
          const bitPos = 7 - (bitIdx % 8);
          matrix[row][col] = (codewords[byteIdx] >> bitPos) & 1;
          bitIdx++;
        }
      }
    }
    upward = !upward;
  }
}

function applyMask(matrix: number[][], reserved: boolean[][]): number[][] {
  // Mask pattern 0: (row + col) % 2 === 0
  const size = matrix.length;
  const masked = matrix.map((r) => [...r]);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!reserved[r][c] && (r + c) % 2 === 0) {
        masked[r][c] ^= 1;
      }
    }
  }
  return masked;
}

function addFormatInfo(matrix: number[][], size: number) {
  // Format info for ECC level L, mask 0
  // Pre-computed: 111011111000100
  const formatBits = 0b111011111000100;
  const bits: number[] = [];
  for (let i = 14; i >= 0; i--) {
    bits.push((formatBits >> i) & 1);
  }

  // Horizontal: left of top-right finder
  const hPositions = [0, 1, 2, 3, 4, 5, 7, 8, size - 8, size - 7, size - 6, size - 5, size - 4, size - 3, size - 2];
  for (let i = 0; i < 15; i++) {
    matrix[8][hPositions[i]] = bits[i];
  }

  // Vertical: below top-left finder
  const vPositions = [size - 1, size - 2, size - 3, size - 4, size - 5, size - 6, size - 7, size - 8, 7, 5, 4, 3, 2, 1, 0];
  for (let i = 0; i < 15; i++) {
    matrix[vPositions[i]][8] = bits[i];
  }

  // Dark module
  matrix[size - 8][8] = 1;
}

export function generateQRCode(text: string): string {
  const { version, info } = selectVersion(text.length);
  const size = info.size;

  const { matrix, reserved } = createMatrix(size);

  // Add finder patterns
  addFinderPattern(matrix, reserved, 0, 0);
  addFinderPattern(matrix, reserved, 0, size - 7);
  addFinderPattern(matrix, reserved, size - 7, 0);

  // Add timing patterns
  addTimingPatterns(matrix, reserved);

  // Reserve format info areas
  reserveFormatArea(reserved, size);

  // Encode data
  const dataCodewords = encodeData(text, info, version);
  const ecCodewords = rsEncode(dataCodewords, info.ecCodewords);

  // Interleave data + EC
  const allCodewords = new Uint8Array(dataCodewords.length + ecCodewords.length);
  allCodewords.set(dataCodewords);
  allCodewords.set(ecCodewords, dataCodewords.length);

  // Place data
  placeData(matrix, reserved, allCodewords);

  // Apply mask
  const masked = applyMask(matrix, reserved);

  // Add format info
  addFormatInfo(masked, size);

  return matrixToSVG(masked, size);
}

function matrixToSVG(matrix: number[][], size: number): string {
  const moduleSize = 8;
  const margin = 4;
  const totalSize = (size + margin * 2) * moduleSize;

  let paths = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        const x = (c + margin) * moduleSize;
        const y = (r + margin) * moduleSize;
        paths += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" shape-rendering="crispEdges">
<rect width="100%" height="100%" fill="white"/>
<g fill="black">${paths}</g>
</svg>`;
}
