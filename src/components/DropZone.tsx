import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Sparkles, CheckCircle2, ArrowRight, Link2, Globe, AlertCircle } from 'lucide-react';
import { ArtworkSample, getArtworkSamples } from '../utils/samples';
import { useTheme } from '../context/ThemeContext';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  onSampleSelect: (sample: ArtworkSample) => void;
  onUrlSelect: (url: string, fileName?: string) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelect, onSampleSelect, onUrlSelect }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [samples] = useState<ArtworkSample[]>(() => getArtworkSamples());
  const [imageUrl, setImageUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

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

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);

    const trimmed = imageUrl.trim();
    if (!trimmed) {
      setUrlError('Por favor, insira o link de uma imagem.');
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image/')) {
      setUrlError('A URL deve começar com http:// ou https://');
      return;
    }

    setIsLoadingUrl(true);

    // Extract filename from URL if available
    let name = 'arte_web.png';
    try {
      const parsed = new URL(trimmed);
      const pathParts = parsed.pathname.split('/');
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart.includes('.')) {
        name = decodeURIComponent(lastPart);
      }
    } catch {}

    // If it's already a base64 data URL
    if (trimmed.startsWith('data:image/')) {
      setIsLoadingUrl(false);
      onUrlSelect(trimmed, name);
      return;
    }

    const blobToDataUrl = (blob: Blob): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    // Strategy 1: Local / Vercel Serverless Image Proxy (Bypasses Pinterest, ArtStation, etc. CORS)
    try {
      const res = await fetch(`/api/proxy-image?url=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const blob = await res.blob();
        if (blob && blob.size > 0 && blob.type.startsWith('image/')) {
          const dataUrl = await blobToDataUrl(blob);
          setIsLoadingUrl(false);
          onUrlSelect(dataUrl, name);
          return;
        }
      }
    } catch (e) {
      console.warn('Local proxy failed, trying fallback...', e);
    }

    // Strategy 2: High reliability CORS proxy fallback (images.weserv.nl)
    try {
      const cleanUrl = trimmed.replace(/^https?:\/\//, '');
      const fallbackUrl = `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&output=png`;
      const res = await fetch(fallbackUrl);
      if (res.ok) {
        const blob = await res.blob();
        if (blob && blob.size > 0 && blob.type.startsWith('image/')) {
          const dataUrl = await blobToDataUrl(blob);
          setIsLoadingUrl(false);
          onUrlSelect(dataUrl, name);
          return;
        }
      }
    } catch (e) {
      console.warn('Fallback proxy failed, trying direct image load...', e);
    }

    // Strategy 3: Direct browser image load
    const testImg = new Image();
    testImg.crossOrigin = 'anonymous';
    testImg.src = trimmed;

    testImg.onload = () => {
      setIsLoadingUrl(false);
      onUrlSelect(trimmed, name);
    };

    testImg.onerror = () => {
      setIsLoadingUrl(false);
      setUrlError('Não foi possível carregar a imagem desta URL. Verifique se o link direto da imagem está correto.');
    };
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 flex flex-col gap-8">
      {/* Hero Explanatory Banner */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
          isDark 
            ? 'bg-cyan-950/60 border-cyan-800/50 text-cyan-400' 
            : 'bg-cyan-50 border-cyan-200 text-cyan-700 shadow-sm'
        }`}>
          <Sparkles className="w-3.5 h-3.5" />
          Para Ilustradores, Quadrinistas &amp; Designers Gráficos
        </div>
        <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Transforme traço raster em <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent">qualidade de impressão 300 DPI</span>
        </h2>
        <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          Reconstrução inteligente de arte final em preto e branco (nanquim), remoção de serrilhados, preservação de hachuras finas e upscaling 2× a 8× sem aspecto borrado.
        </p>
      </div>

      {/* Main Drag & Drop + URL Input Box */}
      <div className="flex flex-col gap-4">
        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? isDark 
                ? 'border-cyan-500 bg-cyan-950/20 scale-[1.01]' 
                : 'border-cyan-500 bg-cyan-50/70 scale-[1.01]'
              : isDark
                ? 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70'
                : 'border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50/80 shadow-sm'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/tiff"
            className="hidden"
            onChange={handleInputChange}
          />

          <div className="flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-xl ${
              isDark 
                ? 'bg-zinc-800/80 border-zinc-700 text-cyan-400 group-hover:border-cyan-500/50' 
                : 'bg-zinc-100 border-zinc-200 text-cyan-600 group-hover:border-cyan-400'
            }`}>
              <Upload className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <p className={`text-base font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                Arraste sua arte aqui ou clique para selecionar do computador
              </p>
              <p className={`text-xs font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                Suporta PNG, JPG, WEBP e TIFF • Resolução recomendada: 512px a 4096px
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className={`text-[11px] font-medium px-2.5 py-1 rounded-md border ${
                isDark 
                  ? 'bg-zinc-800 text-zinc-300 border-zinc-700/60' 
                  : 'bg-zinc-100 text-zinc-700 border-zinc-200'
              }`}>
                ✒️ Nanquim &amp; Hachuras
              </span>
              <span className={`text-[11px] font-medium px-2.5 py-1 rounded-md border ${
                isDark 
                  ? 'bg-zinc-800 text-zinc-300 border-zinc-700/60' 
                  : 'bg-zinc-100 text-zinc-700 border-zinc-200'
              }`}>
                ⚡ Print Master 300 DPI
              </span>
              <span className={`text-[11px] font-medium px-2.5 py-1 rounded-md border ${
                isDark 
                  ? 'bg-zinc-800 text-zinc-300 border-zinc-700/60' 
                  : 'bg-zinc-100 text-zinc-700 border-zinc-200'
              }`}>
                ✨ Detecção Automática
              </span>
              <span className={`text-[11px] font-medium px-2.5 py-1 rounded-md border ${
                isDark 
                  ? 'bg-zinc-800 text-zinc-300 border-zinc-700/60' 
                  : 'bg-zinc-100 text-zinc-700 border-zinc-200'
              }`}>
                📐 Exportação SVG + PNG
              </span>
            </div>
          </div>
        </div>

        {/* URL Input Bar */}
        <div className={`p-4 rounded-2xl border shadow-xl backdrop-blur transition-colors ${
          isDark 
            ? 'bg-zinc-900/60 border-zinc-800/90' 
            : 'bg-white border-zinc-200 shadow-zinc-200/50'
        }`}>
          <form onSubmit={handleUrlSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Link2 className="w-4 h-4 text-cyan-500" />
              </div>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  if (urlError) setUrlError(null);
                }}
                placeholder="Ou cole o link direto de uma imagem (ex: https://exemplo.com/desenho.png)"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono ${
                  isDark 
                    ? 'bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-500' 
                    : 'bg-zinc-50 border-zinc-200 text-zinc-800 placeholder:text-zinc-400'
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={isLoadingUrl || !imageUrl.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isLoadingUrl ? 'Carregando...' : 'Carregar Imagem da Web'}</span>
            </button>
          </form>

          {urlError && (
            <div className={`mt-2.5 flex items-center gap-2 text-xs px-3 py-2 rounded-xl border ${
              isDark 
                ? 'text-red-400 bg-red-950/40 border-red-800/50' 
                : 'text-red-700 bg-red-50 border-red-200'
            }`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{urlError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Curated Sample Gallery from the PDF */}
      <div className={`space-y-4 pt-4 border-t ${isDark ? 'border-zinc-900' : 'border-zinc-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-cyan-500" />
            <h3 className={`text-sm font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>
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
              className={`group text-left p-3 rounded-xl border transition-all flex flex-col gap-2.5 cursor-pointer ${
                isDark 
                  ? 'bg-zinc-900/60 hover:bg-zinc-800/80 border-zinc-800/80 hover:border-cyan-500/50 shadow-sm' 
                  : 'bg-white hover:bg-zinc-50/80 border-zinc-200 hover:border-cyan-500/60 shadow-sm hover:shadow-md'
              }`}
            >
              <div className={`relative aspect-square w-full rounded-lg overflow-hidden border ${
                isDark ? 'bg-white/5 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
              }`}>
                <img
                  src={sample.dataUrl}
                  alt={sample.title}
                  className="w-full h-full object-contain filter group-hover:contrast-125 transition-all"
                />
                <span className={`absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur border ${
                  isDark 
                    ? 'bg-zinc-950/80 text-zinc-300 border-zinc-800' 
                    : 'bg-white/90 text-zinc-700 border-zinc-300 shadow-sm'
                }`}>
                  {sample.category}
                </span>
              </div>
              <div>
                <p className={`text-xs font-semibold line-clamp-1 ${
                  isDark ? 'text-zinc-200 group-hover:text-cyan-300' : 'text-zinc-900 group-hover:text-cyan-700'
                }`}>
                  {sample.title}
                </p>
                <p className={`text-[11px] line-clamp-2 leading-tight mt-0.5 ${
                  isDark ? 'text-zinc-400' : 'text-zinc-500'
                }`}>
                  {sample.description}
                </p>
              </div>
              <div className={`mt-auto pt-2 flex items-center justify-between text-[10px] font-medium ${
                isDark ? 'text-cyan-400/90' : 'text-cyan-700'
              }`}>
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
