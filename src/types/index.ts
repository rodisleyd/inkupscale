export type AppMode = 'INK_VECTOR' | 'SUPER_RES' | 'PRINT_MASTER';

export interface ImageAnalysisResult {
  detectedMode: AppMode;
  confidence: number;
  isMonochrome: boolean;
  saturation: number;
  contrast: number;
  edgeDensity: number;
  description: string;
}

export interface InkSettings {
  scale: 2 | 4 | 6 | 8;
  cleanliness: number; // 0 - 100 (Limpeza / background despeckle)
  sharpness: number; // 0 - 100 (Nitidez)
  linePreservation: number; // 0 - 100 (Preservação de hachuras / linhas)
  denoise: number; // 0 - 100 (Remoção de ruído)
  deepBlack: number; // 0 - 100 (Preto nanquim puro vs meio-tom)
  antiAliasing: boolean; // Suavização de serrilhados
  preserveCrosshatch: boolean; // Preservação específica de crosshatching
}

export interface PrintSettings {
  presetId: string;
  widthCm: number;
  heightCm: number;
  dpi: 150 | 300 | 450 | 600;
  colorMode: 'cmyk_sim' | 'grayscale' | 'rgb';
  format: 'png' | 'tiff' | 'svg';
  marginBleedMm: number; // 0, 3mm sangria gráfica
}

export interface PrintPreset {
  id: string;
  name: string;
  category: 'Padronizados' | 'Quadrinhos & Mangá' | 'Quadrados';
  widthCm: number;
  heightCm: number;
  description: string;
}

export interface AiArtAnalysis {
  recommendedMode: AppMode;
  confidence: number;
  styleDetected: string;
  paperNoiseLevel: string;
  crosshatchingDensity: string;
  lineWeight: string;
  suggestedSettings: {
    cleanliness: number;
    sharpness: number;
    linePreservation: number;
    denoise: number;
    deepBlack: number;
  };
  technicalNotes: string;
}

export interface BatchItem {
  id: string;
  name: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
  resultUrl?: string;
  originalDimensions?: { width: number; height: number };
  targetDimensions?: { width: number; height: number };
}
