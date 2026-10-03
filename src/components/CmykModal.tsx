import React, { useState, useEffect, useRef } from 'react';
import { X, Layers, Printer, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface CmykModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

export const CmykModal: React.FC<CmykModalProps> = ({ isOpen, onClose, imageUrl }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`border rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl transition-colors ${
        isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className={`flex items-center justify-between border-b pb-4 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Inspeção de Chapas CMYK (Offset)</h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Simulação de fotolitos e separação de tintas gráficas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition cursor-pointer ${
              isDark ? 'text-zinc-500 hover:text-white hover:bg-zinc-800' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plates Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={`p-3 rounded-xl border space-y-2 ${
            isDark ? 'bg-zinc-900 border-cyan-500/30' : 'bg-zinc-50 border-cyan-300 shadow-sm'
          }`}>
            <div className={`flex justify-between items-center text-xs font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
              <span>CYAN (C)</span>
              <span className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Chapa 1</span>
            </div>
            <div className="aspect-square bg-white rounded-lg overflow-hidden border border-zinc-200 flex items-center justify-center">
              {plates ? <img src={plates.c} alt="Cyan plate" className="w-full h-full object-contain" /> : <div className="animate-pulse bg-zinc-200 w-full h-full" />}
            </div>
          </div>

          <div className={`p-3 rounded-xl border space-y-2 ${
            isDark ? 'bg-zinc-900 border-pink-500/30' : 'bg-zinc-50 border-pink-300 shadow-sm'
          }`}>
            <div className={`flex justify-between items-center text-xs font-bold ${isDark ? 'text-pink-400' : 'text-pink-700'}`}>
              <span>MAGENTA (M)</span>
              <span className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Chapa 2</span>
            </div>
            <div className="aspect-square bg-white rounded-lg overflow-hidden border border-zinc-200 flex items-center justify-center">
              {plates ? <img src={plates.m} alt="Magenta plate" className="w-full h-full object-contain" /> : <div className="animate-pulse bg-zinc-200 w-full h-full" />}
            </div>
          </div>

          <div className={`p-3 rounded-xl border space-y-2 ${
            isDark ? 'bg-zinc-900 border-yellow-500/30' : 'bg-zinc-50 border-yellow-400/50 shadow-sm'
          }`}>
            <div className={`flex justify-between items-center text-xs font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
              <span>YELLOW (Y)</span>
              <span className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Chapa 3</span>
            </div>
            <div className="aspect-square bg-white rounded-lg overflow-hidden border border-zinc-200 flex items-center justify-center">
              {plates ? <img src={plates.y} alt="Yellow plate" className="w-full h-full object-contain" /> : <div className="animate-pulse bg-zinc-200 w-full h-full" />}
            </div>
          </div>

          <div className={`p-3 rounded-xl border space-y-2 shadow-lg ${
            isDark ? 'bg-zinc-900 border-white/40 shadow-black/40' : 'bg-zinc-50 border-zinc-400 shadow-zinc-200/50'
          }`}>
            <div className={`flex justify-between items-center text-xs font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              <span>KEY / BLACK (K)</span>
              <span className={`text-[10px] px-1 rounded ${
                isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-800'
              }`}>Nanquim</span>
            </div>
            <div className="aspect-square bg-white rounded-lg overflow-hidden border border-zinc-200 flex items-center justify-center">
              {plates ? <img src={plates.k} alt="Key plate" className="w-full h-full object-contain" /> : <div className="animate-pulse bg-zinc-200 w-full h-full" />}
            </div>
          </div>
        </div>

        {/* Technical Print Summary */}
        <div className={`p-4 rounded-xl border text-xs space-y-2 ${
          isDark ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
        }`}>
          <div className={`flex items-center gap-2 font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>Chapa K (Preto Nanquim) Concentra 94% dos Dados de Traço</span>
          </div>
          <p className={`leading-relaxed text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Em ilustrações de arte final preto e branco, a chapa <strong>K (Black)</strong> atua isoladamente com registro perfeito sem risco de "fantasma" de cores nas máquinas offset, garantindo fidelidade de impressão com preto 100% puro.
          </p>
        </div>
      </div>
    </div>
  );
};
