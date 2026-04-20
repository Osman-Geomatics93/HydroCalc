import html2canvas from 'html2canvas';

export interface ShareCardData {
  calculatorName: string;
  results: { label: string; value: string }[];
}

export async function generateShareCard(data: ShareCardData): Promise<Blob> {
  // Create off-screen card element
  const card = document.createElement('div');
  card.style.cssText = `
    width: 1200px; height: 630px; position: fixed; left: -9999px; top: 0;
    background: linear-gradient(135deg, #2d6a4f 0%, #1b4332 50%, #081c15 100%);
    display: flex; flex-direction: column; justify-content: center; padding: 60px 80px;
    font-family: system-ui, -apple-system, sans-serif; color: white;
  `;

  const title = document.createElement('div');
  title.style.cssText = 'font-size: 48px; font-weight: 700; margin-bottom: 12px; letter-spacing: -1px;';
  title.textContent = data.calculatorName;
  card.appendChild(title);

  const subtitle = document.createElement('div');
  subtitle.style.cssText = 'font-size: 20px; opacity: 0.7; margin-bottom: 40px;';
  subtitle.textContent = 'Open Channel Flow Analysis';
  card.appendChild(subtitle);

  const grid = document.createElement('div');
  grid.style.cssText = 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;';

  for (const r of data.results.slice(0, 6)) {
    const item = document.createElement('div');
    item.style.cssText = 'background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px;';
    const label = document.createElement('div');
    label.style.cssText = 'font-size: 14px; opacity: 0.7; margin-bottom: 6px;';
    label.textContent = r.label;
    item.appendChild(label);
    const value = document.createElement('div');
    value.style.cssText = 'font-size: 28px; font-weight: 600;';
    value.textContent = r.value;
    item.appendChild(value);
    grid.appendChild(item);
  }
  card.appendChild(grid);

  const brand = document.createElement('div');
  brand.style.cssText = 'position: absolute; bottom: 40px; right: 80px; font-size: 18px; opacity: 0.5;';
  brand.textContent = 'HydroCalc';
  card.appendChild(brand);

  document.body.appendChild(card);

  try {
    const canvas = await html2canvas(card, { scale: 1, width: 1200, height: 630, backgroundColor: null });
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      }, 'image/png');
    });
  } finally {
    document.body.removeChild(card);
  }
}
