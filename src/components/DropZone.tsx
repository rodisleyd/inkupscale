import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { ArtworkSample, getArtworkSamples } from '../utils/samples';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  onSampleSelect: (sample: ArtworkSample) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelect, onSampleSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [samples] = useState<ArtworkSample[]>(() => getArtworkSamples());

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 flex flex-col gap-8">
      {/* Hero Explanatory Banner */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Para Ilustradores, Quadrinistas &amp; Designers Gráficos
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Transforme traço raster em <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">qualidade de impressão 300 DPI</span>
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Reconstrução inteligente de arte final em preto e branco (nanquim), remoção de serrilhados, preservação de hachuras finas e upscaling 2× a 8× sem aspecto borrado.
        </p>
      </div>

      {/* Main Drag & Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-cyan-500 bg-cyan-950/20 scale-[1.01]'
            : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/tiff"
          className="hidden"
          onChange={handleInputChange}
        />

        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:border-cyan-500/50 transition-all duration-300 shadow-xl">
            <Upload className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <p className="text-base font-semibold text-zinc-200">
              Arraste sua arte aqui ou clique para selecionar
            </p>
            <p className="text-xs text-zinc-500 font-mono">
              Suporta PNG, JPG, WEBP e TIFF • Resolução recomendada: 512px a 4096px
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              ✒️ Nanquim &amp; Hachuras
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              ⚡ Print Master 300 DPI
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              ✨ Detecção Automática
            </span>
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              📐 Exportação SVG + PNG
            </span>
          </div>
        </div>
      </div>

      {/* Curated Sample Gallery from the PDF */}
      <div className="space-y-4 pt-4 border-t border-zinc-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-zinc-300">
              Ou teste instantaneamente com as artes de referência do documento:
            </h3>
          </div>
          <span className="text-xs text-zinc-500 hidden sm:inline">1 clique para carregar</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {samples.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSampleSelect(sample)}
              className="group text-left p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-cyan-500/50 transition-all flex flex-col gap-2.5"
            >
              <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white/5 border border-zinc-800">
                <img
                  src={sample.dataUrl}
                  alt={sample.title}
                  className="w-full h-full object-contain filter group-hover:contrast-125 transition-all"
                />
                <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-950/80 text-zinc-300 backdrop-blur border border-zinc-800">
                  {sample.category}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-200 group-hover:text-cyan-300 line-clamp-1">
                  {sample.title}
                </p>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-tight mt-0.5">
                  {sample.description}
                </p>
              </div>
              <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-cyan-400/90 font-medium">
                <span>Testar agora</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
