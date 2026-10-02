import { PrintPreset } from '../types';

export const PRINT_PRESETS: PrintPreset[] = [
  {
    id: '30x25',
    name: '30 × 25 cm (Destaque PDF)',
    category: 'Quadrados',
    widthCm: 30,
    heightCm: 25,
    description: '3543 × 2953 px @ 300 DPI - Proporção de arte final do documento'
  },
  {
    id: '25x25',
    name: '25 × 25 cm (Quadrado)',
    category: 'Quadrados',
    widthCm: 25,
    heightCm: 25,
    description: '2953 × 2953 px @ 300 DPI - Perfeito para capa de álbum e gravuras'
  },
  {
    id: 'a4',
    name: 'A4 Internacional',
    category: 'Padronizados',
    widthCm: 21.0,
    heightCm: 29.7,
    description: '2480 × 3508 px @ 300 DPI - Padrão gráfico editorial e portfólio'
  },
  {
    id: 'a3',
    name: 'A3 Poster / Prancha',
    category: 'Padronizados',
    widthCm: 29.7,
    heightCm: 42.0,
    description: '3508 × 4960 px @ 300 DPI - Prancha original de ilustrador e pôster'
  },
  {
    id: 'a2',
    name: 'A2 Grande Formato',
    category: 'Padronizados',
    widthCm: 42.0,
    heightCm: 59.4,
    description: '4960 × 7016 px @ 300 DPI - Fine art para exposições e galerias'
  },
  {
    id: 'comic_us',
    name: 'Comic Book EUA (Standard)',
    category: 'Quadrinhos & Mangá',
    widthCm: 16.83,
    heightCm: 25.72,
    description: '1988 × 3038 px @ 300 DPI - Padrão Marvel / DC / Image Comics'
  },
  {
    id: 'manga_b5',
    name: 'Mangá Tankōbon B5',
    category: 'Quadrinhos & Mangá',
    widthCm: 18.2,
    heightCm: 25.7,
    description: '2150 × 3035 px @ 300 DPI - Padrão de páginas originais japonesas'
  },
  {
    id: 'manga_b6',
    name: 'Mangá Volume B6',
    category: 'Quadrinhos & Mangá',
    widthCm: 12.8,
    heightCm: 18.2,
    description: '1512 × 2150 px @ 300 DPI - Padrão de publicação de bolso'
  },
];

export function calculatePixels(widthCm: number, heightCm: number, dpi: number) {
  // 1 inch = 2.54 cm
  const widthInches = widthCm / 2.54;
  const heightInches = heightCm / 2.54;
  const pxWidth = Math.round(widthInches * dpi);
  const pxHeight = Math.round(heightInches * dpi);
  const megapixels = ((pxWidth * pxHeight) / 1000000).toFixed(1);
  return { pxWidth, pxHeight, megapixels, widthInches, heightInches };
}
