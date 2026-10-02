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
    checker: 'bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] bg-zinc-900',
  };

  const displayResultUrl = resultUrl || originalUrl;

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 text-xs">
        {/* Dimensions & DPI HUD */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800/80 border border-zinc-700/60 font-mono text-zinc-300">
            <span className="text-zinc-500 font-sans font-medium text-[10px] uppercase">Original:</span>
            <span>{originalWidth}×{originalHeight} px</span>
          </div>

          <span className="text-zinc-600">→</span>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/60 font-mono text-cyan-300">
            <span className="text-cyan-500 font-sans font-medium text-[10px] uppercase">Resultado:</span>
            <span>{resultWidth || originalWidth * 2}×{resultHeight || originalHeight * 2} px</span>
            <span className="text-[10px] px-1 rounded bg-cyan-500/20 text-cyan-400 font-sans font-bold">
              {dpi} DPI
            </span>
          </div>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Buttons */}
          <div className="flex items-center bg-zinc-800/80 rounded-lg p-0.5 border border-zinc-700/60">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.5))}
              className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-700 transition"
              title="Reduzir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-zinc-300 min-w-[42px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(8, zoom + 0.5))}
              className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-700 transition"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 text-zinc-400 hover:text-cyan-400 rounded hover:bg-zinc-700 transition ml-0.5"
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
                className={`px-2 py-1 rounded text-[11px] font-mono transition ${
                  zoom === z
                    ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40'
                    : 'text-zinc-400 hover:text-zinc-200 bg-zinc-800/40'
                }`}
              >
                {z * 100}%
              </button>
            ))}
          </div>

          {/* Comparison Mode (Split vs Side-by-side) */}
          <div className="flex items-center bg-zinc-800/80 rounded-lg p-0.5 border border-zinc-700/60">
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded transition ${
                viewMode === 'split'
                  ? 'bg-zinc-700 text-cyan-400'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Comparação Deslizante (Split Slider)"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`p-1.5 rounded transition ${
                viewMode === 'side-by-side'
                  ? 'bg-zinc-700 text-cyan-400'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Lado a Lado (Side by Side)"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Background Toggle */}
          <div className="flex items-center bg-zinc-800/80 rounded-lg p-0.5 border border-zinc-700/60">
            <button
              onClick={() => setBgStyle('dark')}
              className={`w-5 h-5 rounded text-[9px] font-bold transition flex items-center justify-center ${
                bgStyle === 'dark' ? 'bg-zinc-700 text-white border border-zinc-500' : 'text-zinc-500'
              }`}
              title="Fundo Preto Estúdio"
            >
              K
            </button>
            <button
              onClick={() => setBgStyle('white')}
              className={`w-5 h-5 rounded text-[9px] font-bold transition flex items-center justify-center ${
                bgStyle === 'white' ? 'bg-white text-zinc-950 font-extrabold border border-zinc-400' : 'text-zinc-500'
              }`}
              title="Fundo Papel Branco (Impressão)"
            >
              W
            </button>
            <button
              onClick={() => setBgStyle('checker')}
              className={`w-5 h-5 rounded text-[9px] font-bold transition flex items-center justify-center ${
                bgStyle === 'checker' ? 'bg-zinc-700 text-cyan-400 border border-zinc-500' : 'text-zinc-500'
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
        className={`relative flex-1 min-h-[420px] max-h-[720px] overflow-hidden select-none cursor-grab active:cursor-grabbing ${bgClasses[bgStyle]}`}
      >
        {/* Processing Progress Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-30 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-spin">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="w-full max-w-md space-y-2 text-center">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-300">
                <span>{progressStatus}</span>
                <span className="font-bold text-cyan-400">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-500">
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
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-zinc-950 border-2 border-cyan-400 shadow-xl flex items-center justify-center text-cyan-400 text-xs font-bold transition group-hover:scale-110">
                  <SplitSquareVertical className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Mode: SIDE BY SIDE */}
        {viewMode === 'side-by-side' && (
          <div
            className="absolute inset-0 grid grid-cols-2 divide-x divide-zinc-800"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Left: Original */}
            <div className="relative flex items-center justify-center p-4">
              <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-900/90 text-zinc-400 border border-zinc-800">
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
              <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-950/90 text-cyan-400 border border-cyan-800/80">
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
            <div className="absolute top-3 left-3 z-20 pointer-events-none px-2.5 py-1 rounded-md bg-zinc-900/90 backdrop-blur border border-zinc-800 text-[11px] font-semibold text-zinc-300">
              ORIGINAL (Antes)
            </div>
            <div className="absolute top-3 right-3 z-20 pointer-events-none px-2.5 py-1 rounded-md bg-cyan-950/90 backdrop-blur border border-cyan-800 text-[11px] font-semibold text-cyan-300 flex items-center gap-1.5">
              <span>RESULTADO (Depois)</span>
              {resultUrl && (
                <Check className="w-3.5 h-3.5 text-cyan-400" />
              )}
            </div>
          </>
        )}

        {/* Pan hint when zoomed */}
        {zoom > 1 && (
          <div className="absolute bottom-3 left-3 z-20 px-2.5 py-1 rounded bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-cyan-400" />
            <span>Arraste para mover (Pan) • Zoom: {Math.round(zoom * 100)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
