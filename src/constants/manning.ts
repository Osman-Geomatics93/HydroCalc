export interface ManningEntry {
  material: string;
  nMin: number;
  nTypical: number;
  nMax: number;
}

export const MANNING_TABLE: ManningEntry[] = [
  { material: 'Glass', nMin: 0.009, nTypical: 0.010, nMax: 0.013 },
  { material: 'Brass', nMin: 0.009, nTypical: 0.011, nMax: 0.013 },
  { material: 'Steel (smooth)', nMin: 0.010, nTypical: 0.012, nMax: 0.014 },
  { material: 'Steel (painted)', nMin: 0.012, nTypical: 0.014, nMax: 0.017 },
  { material: 'Steel (riveted)', nMin: 0.017, nTypical: 0.019, nMax: 0.020 },
  { material: 'Cast iron', nMin: 0.010, nTypical: 0.013, nMax: 0.014 },
  { material: 'Concrete (finished)', nMin: 0.011, nTypical: 0.012, nMax: 0.014 },
  { material: 'Concrete (unfinished)', nMin: 0.012, nTypical: 0.014, nMax: 0.016 },
  { material: 'Concrete (gunite)', nMin: 0.016, nTypical: 0.019, nMax: 0.023 },
  { material: 'Brick', nMin: 0.012, nTypical: 0.015, nMax: 0.018 },
  { material: 'Asphalt', nMin: 0.013, nTypical: 0.016, nMax: 0.016 },
  { material: 'Corrugated metal', nMin: 0.021, nTypical: 0.025, nMax: 0.030 },
  { material: 'Earth (clean)', nMin: 0.016, nTypical: 0.022, nMax: 0.025 },
  { material: 'Earth (weedy)', nMin: 0.025, nTypical: 0.030, nMax: 0.033 },
  { material: 'Earth (stony)', nMin: 0.025, nTypical: 0.035, nMax: 0.040 },
  { material: 'Gravel', nMin: 0.022, nTypical: 0.027, nMax: 0.033 },
  { material: 'Natural stream (clean)', nMin: 0.025, nTypical: 0.033, nMax: 0.040 },
  { material: 'Natural stream (weedy)', nMin: 0.030, nTypical: 0.040, nMax: 0.050 },
  { material: 'Floodplain (pasture)', nMin: 0.025, nTypical: 0.035, nMax: 0.050 },
  { material: 'Floodplain (trees)', nMin: 0.050, nTypical: 0.100, nMax: 0.150 },
];
