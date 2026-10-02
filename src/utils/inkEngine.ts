import { InkSettings, PrintSettings, AppMode } from '../types';

export interface ProcessOptions {
  mode: AppMode;
  inkSettings: InkSettings;
  printSettings: PrintSettings;
  targetWidth?: number;
  targetHeight?: number;
  scale?: number;
}

export async function processArtwork(
  sourceImage: HTMLImageElement,
  options: ProcessOptions,
  onProgress?: (percent: number, stepText: string) => void
): Promise<HTMLCanvasElement> {
  const { mode, inkSettings, printSettings, targetWidth, targetHeight, scale = 2 } = options;

  onProgress?.(10, 'Calculando dimensões de alta resolução...');

  // 1. Determine output dimensions
  let outW = 0;
  let outH = 0;

  if (mode === 'PRINT_MASTER' && targetWidth && targetHeight) {
    outW = targetWidth;
    outH = targetHeight;
  } else {
    const s = mode === 'PRINT_MASTER' ? 2 : (scale || inkSettings.scale || 2);
    outW = Math.round(sourceImage.naturalWidth * s);
    outH = Math.round(sourceImage.naturalHeight * s);
  }

  // Safety caps for canvas memory in browsers
  const maxDimension = 7200;
  if (outW > maxDimension || outH > maxDimension) {
    const ratio = Math.min(maxDimension / outW, maxDimension / outH);
    outW = Math.round(outW * ratio);
    outH = Math.round(outH * ratio);
  }

  onProgress?.(25, 'Executando redimensionamento multi-fase de alta precisão...');

  // Multi-step progressive upscaling for smoother gradients and anti-aliasing
  const workCanvas = document.createElement('canvas');
  workCanvas.width = outW;
  workCanvas.height = outH;
  const ctx = workCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Não foi possível obter contexto 2D para renderização.');

  // High quality interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw scaled
  ctx.drawImage(sourceImage, 0, 0, outW, outH);

  onProgress?.(45, 'Analisando estrutura de pixels e extraindo dados...');
  const imgData = ctx.getImageData(0, 0, outW, outH);
  const data = imgData.data;

  // If INK_VECTOR mode or Grayscale print:
  if (mode === 'INK_VECTOR' || (mode === 'PRINT_MASTER' && printSettings.colorMode === 'grayscale')) {
    onProgress?.(60, 'Reconstruindo linhas de nanquim, eliminando ruído e hachuras...');

    const cleanliness = inkSettings.cleanliness / 100; // 0 to 1
    const sharpness = inkSettings.sharpness / 100; // 0 to 1
    const linePreserve = inkSettings.linePreservation / 100; // 0 to 1
    const denoise = inkSettings.denoise / 100; // 0 to 1
    const deepBlack = inkSettings.deepBlack / 100; // 0 to 1

    // Step 1: Compute luminance map
    const totalPixels = outW * outH;
    const lumMap = new Float32Array(totalPixels);

    for (let i = 0; i < totalPixels; i++) {
      const idx = i * 4;
      // Perceptual luminance formula
      lumMap[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }

    // Step 2: Denoise / Despeckle (light median/bilateral filter on luminance)
    const denoisedLum = new Float32Array(totalPixels);
    const radius = denoise > 0.5 ? 2 : (denoise > 0.2 ? 1 : 0);

    if (radius > 0) {
      for (let y = 0; y < outH; y++) {
        for (let x = 0; x < outW; x++) {
          const centerIdx = y * outW + x;
          const centerVal = lumMap[centerIdx];

          // If it's pure white or deep black, don't blur excessively to preserve fine tips
          if (centerVal > 240 && cleanliness > 0.4) {
            denoisedLum[centerIdx] = 255;
            continue;
          }
          if (centerVal < 30 && deepBlack > 0.5) {
            denoisedLum[centerIdx] = 0;
            continue;
          }

          let sum = 0;
          let count = 0;
          for (let dy = -radius; dy <= radius; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= outH) continue;
            for (let dx = -radius; dx <= radius; dx++) {
              const nx = x + dx;
              if (nx < 0 || nx >= outW) continue;
              const nVal = lumMap[ny * outW + nx];
              // Only average pixels of similar tone (bilateral preservation of lines)
              if (Math.abs(nVal - centerVal) < 70) {
                sum += nVal;
                count++;
              }
            }
          }
          denoisedLum[centerIdx] = count > 0 ? sum / count : centerVal;
        }
      }
    } else {
      denoisedLum.set(lumMap);
    }

    onProgress?.(80, 'Suavizando serrilhados (Anti-aliasing) e aprofundando o nanquim...');

    // Step 3: Ink Line recovery, Unsharp Mask & Anti-serrilhado smoothing
    // Clean threshold: values above this become pure white paper
    const whiteThreshold = 255 - (cleanliness * 75); // e.g. 180 to 255
    // Black threshold: values below this become pure ink black
    const blackThreshold = 40 + (1 - linePreserve) * 60; // 40 to 100

    for (let y = 1; y < outH - 1; y++) {
      for (let x = 1; x < outW - 1; x++) {
        const idx = y * outW + x;
        const cur = denoisedLum[idx];

        // Laplacian edge detection for sharpness
        const top = denoisedLum[(y - 1) * outW + x];
        const bottom = denoisedLum[(y + 1) * outW + x];
        const left = denoisedLum[y * outW + (x - 1)];
        const right = denoisedLum[y * outW + (x + 1)];

        const laplacian = (cur * 4) - (top + bottom + left + right);
        let enhancedVal = cur - laplacian * (sharpness * 0.45);

        // Clamping
        if (enhancedVal < 0) enhancedVal = 0;
        if (enhancedVal > 255) enhancedVal = 255;

        // Ink Vector Curve Transfer
        // Produces crisp vector-like curves with smooth antialiased pen strokes
        let finalTone: number;

        if (enhancedVal >= whiteThreshold) {
          // Pure white paper
          finalTone = 255;
        } else if (enhancedVal <= blackThreshold) {
          // Pure Nanquim deep black
          finalTone = (1 - deepBlack) * enhancedVal * 0.2;
        } else {
          // Transition zone (anti-aliasing and hachuras preservation)
          const t = (enhancedVal - blackThreshold) / (whiteThreshold - blackThreshold);
          
          // S-curve for ultra-crisp comic inking
          const curve = t * t * (3 - 2 * t);
          finalTone = curve * 255;

          // If crosshatch preservation is high, soften extreme contrast in midtones
          if (inkSettings.preserveCrosshatch && enhancedVal > 50 && enhancedVal < 180) {
            finalTone = finalTone * 0.85 + enhancedVal * 0.15;
          }
        }

        const pIdx = idx * 4;
        data[pIdx] = finalTone;
        data[pIdx + 1] = finalTone;
        data[pIdx + 2] = finalTone;
        data[pIdx + 3] = 255;
      }
    }
  } else if (mode === 'SUPER_RES') {
    onProgress?.(70, 'Aplicando reconstrução de detalhes cromáticos e micro-contraste...');

    // Super Resolution mode for color illustrations and photos
    const sharpness = inkSettings.sharpness / 100;
    const denoise = inkSettings.denoise / 100;

    // Edge-preserving high-pass sharpening on RGB channels
    const srcCopy = new Uint8ClampedArray(data);

    for (let y = 1; y < outH - 1; y++) {
      for (let x = 1; x < outW - 1; x++) {
        const idx = (y * outW + x) * 4;

        for (let c = 0; c < 3; c++) {
          const center = srcCopy[idx + c];
          const top = srcCopy[((y - 1) * outW + x) * 4 + c];
          const bottom = srcCopy[((y + 1) * outW + x) * 4 + c];
          const left = srcCopy[(y * outW + (x - 1)) * 4 + c];
          const right = srcCopy[(y * outW + (x + 1)) * 4 + c];

          const edge = (center * 4) - (top + bottom + left + right);
          let newVal = center + edge * (sharpness * 0.35);

          // Subtle noise clamping
          if (denoise > 0.4 && Math.abs(edge) < 15) {
            newVal = (top + bottom + left + right) / 4;
          }

          data[idx + c] = Math.max(0, Math.min(255, newVal));
        }
      }
    }
  } else if (mode === 'PRINT_MASTER' && printSettings.colorMode === 'cmyk_sim') {
    onProgress?.(75, 'Simulando perfil CMYK de offset com preto rico (Rich Black)...');

    // Convert to CMYK simulation with rich black
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;

      const k = 1 - Math.max(r, g, b);
      if (k > 0.85) {
        // Boost rich black for graphic print: pure deep dense black
        data[i] = 12;
        data[i + 1] = 12;
        data[i + 2] = 16;
      }
    }
  }

  onProgress?.(95, 'Finalizando composição de imagem...');
  ctx.putImageData(imgData, 0, 0);

  onProgress?.(100, 'Processamento concluído!');
  return workCanvas;
}
