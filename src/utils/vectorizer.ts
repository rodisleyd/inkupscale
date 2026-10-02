/**
 * Vectorizer utility: Converts high-contrast line art canvas into true SVG vector paths.
 */

export function rasterToSvg(canvas: HTMLCanvasElement, threshold: number = 140): string {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // For very large canvas, downsample slightly for SVG trace path performance
  const maxDim = 1200;
  let traceW = width;
  let traceH = height;
  let scale = 1;

  if (width > maxDim || height > maxDim) {
    scale = Math.min(maxDim / width, maxDim / height);
    traceW = Math.round(width * scale);
    traceH = Math.round(height * scale);
  }

  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = traceW;
  sampleCanvas.height = traceH;
  const sCtx = sampleCanvas.getContext('2d');
  if (!sCtx) return '';

  sCtx.drawImage(canvas, 0, 0, traceW, traceH);
  const imgData = sCtx.getImageData(0, 0, traceW, traceH);
  const data = imgData.data;

  // Binary grid: 1 for black ink, 0 for white paper
  const grid = new Uint8Array(traceW * traceH);
  for (let i = 0; i < traceW * traceH; i++) {
    const idx = i * 4;
    const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    grid[i] = lum < threshold ? 1 : 0;
  }

  // Horizontal scanline vector run-length encoder (ultra fast, produces compact crisp SVG)
  const paths: string[] = [];
  const invScale = 1 / scale;

  for (let y = 0; y < traceH; y++) {
    let inRun = false;
    let runStart = 0;
    const rowOffset = y * traceW;

    for (let x = 0; x < traceW; x++) {
      const isBlack = grid[rowOffset + x] === 1;

      if (isBlack && !inRun) {
        inRun = true;
        runStart = x;
      } else if (!isBlack && inRun) {
        inRun = false;
        const x1 = (runStart * invScale).toFixed(1);
        const y1 = (y * invScale).toFixed(1);
        const w = ((x - runStart) * invScale).toFixed(1);
        const h = (1 * invScale).toFixed(1);
        paths.push(`M ${x1} ${y1} h ${w} v ${h} h -${w} Z`);
      }
    }

    if (inRun) {
      const x1 = (runStart * invScale).toFixed(1);
      const y1 = (y * invScale).toFixed(1);
      const w = ((traceW - runStart) * invScale).toFixed(1);
      const h = (1 * invScale).toFixed(1);
      paths.push(`M ${x1} ${y1} h ${w} v ${h} h -${w} Z`);
    }
  }

  const pathData = paths.join(' ');
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="#ffffff" />
  <path fill="#0a0a0c" fill-rule="evenodd" d="${pathData}" />
</svg>`;

  return svgContent;
}
