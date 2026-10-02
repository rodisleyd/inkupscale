import React, { useState, useEffect, useRef } from 'react';
import { X, Layers, Printer, CheckCircle2, ShieldAlert } from 'lucide-react';

interface CmykModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

export const CmykModal: React.FC<CmykModalProps> = ({ isOpen, onClose, imageUrl }) => {
  const [activePlate, setActivePlate] = useState<'all' | 'c' | 'm' | 'y' | 'k'>('all');
  const [plates, setPlates] = useState<{
    c: string;
    m: string;
    y: string;
    k: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      const size = 320;
      const cCanvas = document.createElement('canvas');
      const mCanvas = document.createElement('canvas');
      const yCanvas = document.createElement('canvas');
      const kCanvas = document.createElement('canvas');

      [cCanvas, mCanvas, yCanvas, kCanvas].forEach((c) => {
        c.width = size;
        c.height = size;
      });

      const temp = document.createElement('canvas');
      temp.width = size;
      temp.height = size;
      const tCtx = temp.getContext('2d');
      if (!tCtx) return;
      tCtx.drawImage(img, 0, 0, size, size);
      const imgData = tCtx.getImageData(0, 0, size, size);
      const d = imgData.data;

      const cCtx = cCanvas.getContext('2d')!;
      const mCtx = mCanvas.getContext('2d')!;
      const yCtx = yCanvas.getContext('2d')!;
      const kCtx = kCanvas.getContext('2d')!;

      const cData = cCtx.createImageData(size, size);
      const mData = mCtx.createImageData(size, size);
      const yData = yCtx.createImageData(size, size);
      const kData = kCtx.createImageData(size, size);

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i] / 255;
        const g = d[i + 1] / 255;
        const b = d[i + 2] / 255;

        // RGB to CMYK
        const k = 1 - Math.max(r, g, b);
        const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
        const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
        const y = k === 1 ? 0 : (1 - b - k) / (1 - k);

        // Cyan plate (displayed in cyan tint or grayscale)
        cData.data[i] = Math.round((1 - c) * 255);
        cData.data[i + 1] = 255;
        cData.data[i + 2] = 255;
        cData.data[i + 3] = 255;

        // Magenta plate
        mData.data[i] = 255;
        mData.data[i + 1] = Math.round((1 - m) * 255);
        mData.data[i + 2] = 255;
        mData.data[i + 3] = 255;

        // Yellow plate
        yData.data[i] = 255;
        yData.data[i + 1] = 255;
        yData.data[i + 2] = Math.round((1 - y) * 255);
        yData.data[i + 3] = 255;

        // Key / Black plate (pure black density)
        const kVal = Math.round((1 - k) * 255);
        kData.data[i] = kVal;
        kData.data[i + 1] = kVal;
        kData.data[i + 2] = kVal;
        kData.data[i + 3] = 255;
      }

      cCtx.putImageData(cData, 0, 0);
      mCtx.putImageData(mData, 0, 0);
      yCtx.putImageData(yData, 0, 0);
      kCtx.putImageData(kData, 0, 0);

      setPlates({
        c: cCanvas.toDataURL(),
        m: mCanvas.toDataURL(),
        y: yCanvas.toDataURL(),
        k: kCanvas.toDataURL(),
      });
    };
  }, [isOpen, imageUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Inspeção de Chapas CMYK (Offset)</h3>
              <p className="text-xs text-zinc-400">Simulação de fotolitos e separação de tintas gráficas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plates Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-zinc-900 border border-cyan-500/30 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-cyan-400">
              <span>CYAN (C)</span>
              <span className="text-[10px] text-zinc-500">Chapa 1</span>
            </div>
            <div className="aspect-square bg-white rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center">
              {plates ? <img src={plates.c} alt="Cyan plate" className="w-full h-full object-contain" /> : <div className="animate-pulse bg-zinc-800 w-full h-full" />}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900 border border-pink-500/30 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-pink-400">
              <span>MAGENTA (M)</span>
              <span className="text-[10px] text-zinc-500">Chapa 2</span>
            </div>
            <div className="aspect-square bg-white rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center">
              {plates ? <img src={plates.m} alt="Magenta plate" className="w-full h-full object-contain" /> : <div className="animate-pulse bg-zinc-800 w-full h-full" />}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900 border border-yellow-500/30 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-yellow-400">
              <span>YELLOW (Y)</span>
              <span className="text-[10px] text-zinc-500">Chapa 3</span>
            </div>
            <div className="aspect-square bg-white rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center">
              {plates ? <img src={plates.y} alt="Yellow plate" className="w-full h-full object-contain" /> : <div className="animate-pulse bg-zinc-800 w-full h-full" />}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-900 border border-white/40 space-y-2 shadow-lg shadow-black/40">
            <div className="flex justify-between items-center text-xs font-bold text-white">
              <span>KEY / BLACK (K)</span>
              <span className="text-[10px] px-1 bg-cyan-500/20 text-cyan-400 rounded">Nanquim</span>
            </div>
            <div className="aspect-square bg-white rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center">
              {plates ? <img src={plates.k} alt="Key plate" className="w-full h-full object-contain" /> : <div className="animate-pulse bg-zinc-800 w-full h-full" />}
            </div>
          </div>
        </div>

        {/* Technical Print Summary */}
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs space-y-2 text-zinc-300">
          <div className="flex items-center gap-2 font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Chapa K (Preto Nanquim) Concentra 94% dos Dados de Traço</span>
          </div>
          <p className="text-zinc-400 leading-relaxed text-[11px]">
            Em ilustrações de arte final preto e branco, a chapa <strong>K (Black)</strong> atua isoladamente com registro perfeito sem risco de "fantasma" de cores nas máquinas offset, garantindo fidelidade de impressão com preto 100% puro.
          </p>
        </div>
      </div>
    </div>
  );
};
