import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Printer, 
  Layers, 
  Cpu, 
  FolderSync, 
  Info,
  Maximize2,
  Download
} from 'lucide-react';
import { AppMode } from '../types';

interface HeaderProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onOpenAiModal: () => void;
  onOpenCmykModal: () => void;
  onOpenBatchModal: () => void;
  hasImage: boolean;
  isProcessing: boolean;
  detectedModeInfo?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onOpenAiModal,
  onOpenCmykModal,
  onOpenBatchModal,
  hasImage,
  detectedModeInfo
}) => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Concept */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-extrabold text-xl tracking-tighter">
            ✒️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                INK UPSCALER <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">PRO</span>
              </h1>
              {detectedModeInfo && (
                <span className="hidden sm:inline-flex text-[11px] items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {detectedModeInfo}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Raster → Print Quality &amp; Nanquim Vector Studio
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs (Top Bar Navigation) */}
        <div className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 text-xs font-medium w-full md:w-auto justify-center">
          <button
            onClick={() => onSelectMode('INK_VECTOR')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentMode === 'INK_VECTOR'
                ? 'bg-zinc-800 text-cyan-400 shadow-sm font-semibold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>✒️</span>
            <span>Arte Final / Nanquim</span>
          </button>

          <button
            onClick={() => onSelectMode('SUPER_RES')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentMode === 'SUPER_RES'
                ? 'bg-zinc-800 text-cyan-400 shadow-sm font-semibold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>🚀</span>
            <span>Super Resolution</span>
          </button>

          <button
            onClick={() => onSelectMode('PRINT_MASTER')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentMode === 'PRINT_MASTER'
                ? 'bg-zinc-800 text-cyan-400 shadow-sm font-semibold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>⚡</span>
            <span>Print Master (300 DPI)</span>
          </button>
        </div>

        {/* Graphic Tools / Auxiliary Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {hasImage && (
            <>
              <button
                onClick={onOpenAiModal}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 hover:border-cyan-500/50 text-zinc-300 hover:text-cyan-300 transition-colors"
                title="Diagnóstico de Traço e Hachuras com IA"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden lg:inline">Diagnóstico IA</span>
              </button>

              <button
                onClick={onOpenCmykModal}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 hover:border-amber-500/50 text-zinc-300 hover:text-amber-300 transition-colors"
                title="Inspeção de Chapas CMYK para Gráfica"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden lg:inline">Chapas CMYK</span>
              </button>
            </>
          )}

          {installPrompt && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/20 transition-all animate-pulse cursor-pointer"
              title="Instalar Ink Upscaler Pro no seu dispositivo"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar App</span>
            </button>
          )}

          <button
            onClick={onOpenBatchModal}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 hover:border-zinc-500 text-zinc-300 hover:text-white transition-colors"
            title="Lote / Processamento Múltiplo de Páginas"
          >
            <FolderSync className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Lote / Quadrinhos</span>
          </button>
        </div>
      </div>
    </header>
  );
};
