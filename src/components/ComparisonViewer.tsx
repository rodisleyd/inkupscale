import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Columns, 
  SplitSquareVertical, 
  Eye, 
  Move, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  Check 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ComparisonViewerProps {
  originalUrl: string;
  resultUrl: string | null;
  originalWidth: number;
  originalHeight: number;
  resultWidth?: number;
  resultHeight?: number;
  dpi?: number;
  isProcessing: boolean;
  progressPercent: number;
  progressStatus: string;
}

export const ComparisonViewer: React.FC<ComparisonViewerProps> = ({
  originalUrl,
  resultUrl,
  originalWidth,
  originalHeight,
  resultWidth,
  resultHeight,
  dpi = 300,
  isProcessing,
  progressPercent,
  progressStatus,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0 - 100
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'side-by-side'>('split');
  const [zoom, setZoom] = useState<number>(1); // 1 = 100%, 2 = 200%, 4 = 400%, etc.
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [bgStyle, setBgStyle] = useState<'dark' | 'white' | 'checker'>('dark');

  // Handle split slider drag
  const handleMouseDownSplit = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSplit(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSplit && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const pct = Math.max(5, Math.min(95, (offsetX / rect.width) * 100));
        setSplitPos(pct);
      } else if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingSplit(false);
      setIsPanning(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplit, isPanning, panStart]);

  const handleMouseDownPan = (e: React.MouseEvent) => {
    if (e.button === 0 && !isDraggingSplit) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const bgClasses = {
    dark: 'bg-zinc-950',
    white: 'bg-white',
    checker: isDark 
      ? 'bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] bg-zinc-900' 
      : 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100',
  };

  const displayResultUrl = resultUrl || originalUrl;

  return (
    <div className={`flex flex-col h-full border rounded-2xl overflow-hidden shadow-2xl transition-colors ${
      isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200 shadow-zinc-200/50'
    }`}>
      {/* Top Toolbar */}
      <div className={`flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b text-xs transition-colors ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-100/90 border-zinc-200'
      }`}>
        {/* Dimensions & DPI HUD */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono border ${
            isDark ? 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700 shadow-sm'
          }`}>
            <span className={`font-sans font-medium text-[10px] uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Original:</span>
            <span>{originalWidth}×{originalHeight} px</span>
          </div>

          <span className={isDark ? 'text-zinc-600' : 'text-zinc-400'}>→</span>

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono border ${
            isDark 
              ? 'bg-cyan-950/60 border-cyan-800/60 text-cyan-300' 
              : 'bg-cyan-50 border-cyan-200 text-cyan-800 shadow-sm'
          }`}>
            <span className={`font-sans font-medium text-[10px] uppercase ${isDark ? 'text-cyan-500' : 'text-cyan-600'}`}>Resultado:</span>
            <span>{resultWidth || originalWidth * 2}×{resultHeight || originalHeight * 2} px</span>
            <span className={`text-[10px] px-1 rounded font-sans font-bold ${
              isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-200/60 text-cyan-800'
            }`}>
              {dpi} DPI
            </span>
          </div>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Buttons */}
          <div className={`flex items-center rounded-lg p-0.5 border ${
            isDark ? 'bg-zinc-800/80 border-zinc-700/60' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.5))}
              className={`p-1.5 rounded transition cursor-pointer ${
                isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-700' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
              title="Reduzir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className={`px-2 font-mono text-[11px] min-w-[42px] text-center ${
              isDark ? 'text-zinc-300' : 'text-zinc-800 font-semibold'
            }`}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(8, zoom + 0.5))}
              className={`p-1.5 rounded transition cursor-pointer ${
                isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-700' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className={`p-1.5 rounded transition ml-0.5 cursor-pointer ${
                isDark ? 'text-zinc-400 hover:text-cyan-400 hover:bg-zinc-700' : 'text-zinc-600 hover:text-cyan-700 hover:bg-zinc-100'
              }`}
              title="Ajustar 100% (Reset)"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Preset Zoom Levels */}
          <div className="hidden sm:flex items-center gap-1">
            {[1, 2, 4].map((z) => (
              <button
                key={z}
                onClick={() => { setZoom(z); setPan({ x: 0, y: 0 }); }}
                className={`px-2 py-1 rounded text-[11px] font-mono transition cursor-pointer ${
                  zoom === z
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40'
                      : 'bg-cyan-50 text-cyan-700 font-bold border border-cyan-300'
                    : isDark 
                      ? 'text-zinc-400 hover:text-zinc-200 bg-zinc-800/40' 
                      : 'text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200'
                }`}
              >
                {z * 100}%
              </button>
            ))}
          </div>

          {/* Comparison Mode (Split vs Side-by-side) */}
          <div className={`flex items-center rounded-lg p-0.5 border ${
            isDark ? 'bg-zinc-800/80 border-zinc-700/60' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded transition cursor-pointer ${
                viewMode === 'split'
                  ? isDark ? 'bg-zinc-700 text-cyan-400' : 'bg-zinc-100 text-cyan-700 font-bold'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Comparação Deslizante (Split Slider)"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`p-1.5 rounded transition cursor-pointer ${
                viewMode === 'side-by-side'
                  ? isDark ? 'bg-zinc-700 text-cyan-400' : 'bg-zinc-100 text-cyan-700 font-bold'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Lado a Lado (Side by Side)"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Background Toggle */}
          <div className={`flex items-center rounded-lg p-0.5 border ${
            isDark ? 'bg-zinc-800/80 border-zinc-700/60' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            <button
              onClick={() => setBgStyle('dark')}
              className={`w-5 h-5 rounded text-[9px] font-bold transition flex items-center justify-center cursor-pointer ${
                bgStyle === 'dark' 
                  ? 'bg-zinc-700 text-white border border-zinc-500' 
                  : isDark ? 'text-zinc-500' : 'text-zinc-400 hover:text-zinc-800'
              }`}
              title="Fundo Preto Estúdio"
            >
              K
            </button>
            <button
              onClick={() => setBgStyle('white')}
              className={`w-5 h-5 rounded text-[9px] font-bold transition flex items-center justify-center cursor-pointer ${
                bgStyle === 'white' 
                  ? 'bg-white text-zinc-950 font-extrabold border border-zinc-400 shadow-sm' 
                  : isDark ? 'text-zinc-500' : 'text-zinc-400 hover:text-zinc-800'
              }`}
              title="Fundo Papel Branco (Impressão)"
            >
              W
            </button>
            <button
              onClick={() => setBgStyle('checker')}
              className={`w-5 h-5 rounded text-[9px] font-bold transition flex items-center justify-center cursor-pointer ${
                bgStyle === 'checker' 
                  ? isDark ? 'bg-zinc-700 text-cyan-400 border border-zinc-500' : 'bg-zinc-100 text-cyan-700 border border-zinc-300'
                  : isDark ? 'text-zinc-500' : 'text-zinc-400 hover:text-zinc-800'
              }`}
              title="Fundo Transparente / Xadrez"
            >
              ▦
            </button>
          </div>
        </div>
      </div>

      {/* Main Visual Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDownPan}
        className={`relative flex-1 min-h-[420px] max-h-[720px] overflow-hidden select-none cursor-grab active:cursor-grabbing transition-colors ${bgClasses[bgStyle]}`}
      >
        {/* Processing Progress Overlay */}
        {isProcessing && (
          <div className={`absolute inset-0 z-30 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6 ${
            isDark ? 'bg-zinc-950/80' : 'bg-white/80'
          }`}>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center animate-spin border ${
              isDark ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-600'
            }`}>
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="w-full max-w-md space-y-2 text-center">
              <div className={`flex items-center justify-between text-xs font-mono ${
                isDark ? 'text-zinc-300' : 'text-zinc-700 font-semibold'
              }`}>
                <span>{progressStatus}</span>
                <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>{progressPercent}%</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden border ${
                isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-200 border-zinc-300'
              }`}>
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                Processando linhas de nanquim, filtrando serrilhado e gerando matriz 300 DPI...
              </p>
            </div>
          </div>
        )}

        {/* View Mode: SPLIT SLIDER */}
        {viewMode === 'split' && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            {/* The Image Container with matching Aspect Ratio */}
            <div className="relative max-w-full max-h-full flex items-center justify-center shadow-2xl">
              {/* RESULT (AFTER) - Right Side / Background */}
              <img
                src={displayResultUrl}
                alt="Resultado de Alta Resolução"
                className="max-h-[640px] w-auto object-contain block pointer-events-none"
                style={{ imageRendering: zoom > 2 ? 'pixelated' : 'auto' }}
              />

              {/* ORIGINAL (BEFORE) - Left Side / Clipped Overlay */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - splitPos}% 0 0)` }}
              >
                <img
                  src={originalUrl}
                  alt="Original"
                  className="max-h-[640px] w-auto object-contain block"
                  style={{ imageRendering: zoom > 2 ? 'pixelated' : 'auto' }}
                />
              </div>

              {/* Split Divider Line & Handle */}
              <div
                onMouseDown={handleMouseDownSplit}
                className="absolute top-0 bottom-0 z-20 cursor-ew-resize group"
                style={{ left: `${splitPos}%`, transform: 'translateX(-50%)' }}
              >
                {/* Thin Vertical line */}
                <div className="w-0.5 h-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />

                {/* Central circular handle badge */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 shadow-xl flex items-center justify-center text-xs font-bold transition group-hover:scale-110 ${
                  isDark ? 'bg-zinc-950 border-cyan-400 text-cyan-400' : 'bg-white border-cyan-500 text-cyan-600 shadow-md'
                }`}>
                  <SplitSquareVertical className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Mode: SIDE BY SIDE */}
        {viewMode === 'side-by-side' && (
          <div
            className={`absolute inset-0 grid grid-cols-2 divide-x ${
              isDark ? 'divide-zinc-800' : 'divide-zinc-200'
            }`}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Left: Original */}
            <div className="relative flex items-center justify-center p-4">
              <span className={`absolute top-3 left-3 z-10 px-2 py-0.5 rounded text-[10px] font-bold uppercase border backdrop-blur ${
                isDark ? 'bg-zinc-900/90 text-zinc-400 border-zinc-800' : 'bg-white/90 text-zinc-700 border-zinc-300 shadow-sm'
              }`}>
                Original ({originalWidth}×{originalHeight} px)
              </span>
              <img
                src={originalUrl}
                alt="Original"
                className="max-h-[580px] w-auto object-contain shadow-md"
                style={{ imageRendering: zoom > 2 ? 'pixelated' : 'auto' }}
              />
            </div>

            {/* Right: Result */}
            <div className="relative flex items-center justify-center p-4">
              <span className={`absolute top-3 left-3 z-10 px-2 py-0.5 rounded text-[10px] font-bold uppercase border backdrop-blur ${
                isDark 
                  ? 'bg-cyan-950/90 text-cyan-400 border-cyan-800/80' 
                  : 'bg-cyan-50/90 text-cyan-700 border-cyan-300 shadow-sm'
              }`}>
                Resultado ({resultWidth || originalWidth * 2}×{resultHeight || originalHeight * 2} px)
              </span>
              <img
                src={displayResultUrl}
                alt="Resultado"
                className="max-h-[580px] w-auto object-contain shadow-md"
                style={{ imageRendering: zoom > 2 ? 'pixelated' : 'auto' }}
              />
            </div>
          </div>
        )}

        {/* Float Labels for Split Mode */}
        {viewMode === 'split' && (
          <>
            <div className={`absolute top-3 left-3 z-20 pointer-events-none px-2.5 py-1 rounded-md backdrop-blur border text-[11px] font-semibold ${
              isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-300' : 'bg-white/90 border-zinc-300 text-zinc-800 shadow-sm'
            }`}>
              ORIGINAL (Antes)
            </div>
            <div className={`absolute top-3 right-3 z-20 pointer-events-none px-2.5 py-1 rounded-md backdrop-blur border text-[11px] font-semibold flex items-center gap-1.5 ${
              isDark 
                ? 'bg-cyan-950/90 border-cyan-800 text-cyan-300' 
                : 'bg-cyan-50/90 border-cyan-300 text-cyan-700 shadow-sm'
            }`}>
              <span>RESULTADO (Depois)</span>
              {resultUrl && (
                <Check className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              )}
            </div>
          </>
        )}

        {/* Pan hint when zoomed */}
        {zoom > 1 && (
          <div className={`absolute bottom-3 left-3 z-20 px-2.5 py-1 rounded border text-[11px] flex items-center gap-1.5 ${
            isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-400' : 'bg-white/90 border-zinc-300 text-zinc-600 shadow-sm'
          }`}>
            <Move className="w-3.5 h-3.5 text-cyan-500" />
            <span>Arraste para mover (Pan) • Zoom: {Math.round(zoom * 100)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
