import { ImageAnalysisResult } from '../types';

export async function analyzeImage(img: HTMLImageElement): Promise<ImageAnalysisResult> {
  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return {
      detectedMode: 'INK_VECTOR',
      confidence: 0.85,
      isMonochrome: true,
      saturation: 0,
      contrast: 0.8,
      edgeDensity: 0.5,
      description: 'LINE ART / NANQUIM (Padrão)'
    };
  }

  ctx.drawImage(img, 0, 0, size, size);
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  let totalSat = 0;
  let totalLum = 0;
  let nearBlackCount = 0;
  let nearWhiteCount = 0;
  let midtoneCount = 0;

  const totalPixels = size * size;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    const lum = (0.299 * r + 0.587 * g + 0.114 * b);
    totalLum += lum;

    // Saturation
    const sat = max === 0 ? 0 : d / max;
    totalSat += sat;

    if (lum < 60) {
      nearBlackCount++;
    } else if (lum > 200) {
      nearWhiteCount++;
    } else {
      midtoneCount++;
    }
  }

  const avgSat = totalSat / totalPixels;
  const blackWhiteRatio = (nearBlackCount + nearWhiteCount) / totalPixels;
  const isMonochrome = avgSat < 0.12;

  // Edge detection sample (simple gradient magnitude)
  let edgeSum = 0;
  for (let y = 1; y < size - 1; y += 2) {
    for (let x = 1; x < size - 1; x += 2) {
      const idx = (y * size + x) * 4;
      const rightIdx = (y * size + (x + 1)) * 4;
      const bottomIdx = ((y + 1) * size + x) * 4;
      const l = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      const lr = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;
      const lb = (data[bottomIdx] + data[bottomIdx + 1] + data[bottomIdx + 2]) / 3;
      const grad = Math.abs(l - lr) + Math.abs(l - lb);
      if (grad > 40) edgeSum++;
    }
  }
  const edgeDensity = edgeSum / ((size / 2) * (size / 2));

  // Decision logic
  // High contrast + low saturation + strong black/white clustering = INK / LINE ART
  if (isMonochrome && (blackWhiteRatio > 0.45 || edgeDensity > 0.15)) {
    const confidence = Math.min(0.98, 0.75 + blackWhiteRatio * 0.2 + (1 - avgSat) * 0.05);
    return {
      detectedMode: 'INK_VECTOR',
      confidence: Number(confidence.toFixed(2)),
      isMonochrome: true,
      saturation: Number(avgSat.toFixed(3)),
      contrast: Number(blackWhiteRatio.toFixed(2)),
      edgeDensity: Number(edgeDensity.toFixed(2)),
      description: 'LINE ART / NANQUIM DETECTADO'
    };
  } else {
    const confidence = Math.min(0.96, 0.7 + avgSat * 0.4);
    return {
      detectedMode: 'SUPER_RES',
      confidence: Number(confidence.toFixed(2)),
      isMonochrome: false,
      saturation: Number(avgSat.toFixed(3)),
      contrast: Number(blackWhiteRatio.toFixed(2)),
      edgeDensity: Number(edgeDensity.toFixed(2)),
      description: 'COLOR ILLUSTRATION / FOTO DETECTADA'
    };
  }
}
