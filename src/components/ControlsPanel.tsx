import React from 'react';
import { 
  Sliders, 
  Download, 
  Sparkles, 
  Printer, 
  FileCode, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Layers,
  FileImage,
  VectorSquare,
  HelpCircle,
  FileDown
} from 'lucide-react';
import { AppMode, InkSettings, PrintSettings } from '../types';
import { PRINT_PRESETS, calculatePixels } from '../utils/presets';
import { useTheme } from '../context/ThemeContext';

interface ControlsPanelProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  inkSettings: InkSettings;
  onInkSettingsChange: (settings: InkSettings) => void;
  printSettings: PrintSettings;
  onPrintSettingsChange: (settings: PrintSettings) => void;
  onProcess: () => void;
  isProcessing: boolean;
  progressPercent?: number;
  progressStatus?: string;
  hasResult: boolean;
  onDownloadPng: () => void;
  onDownloadSvg: () => void;
  onDownloadTiff: () => void;
  originalWidth: number;
  originalHeight: number;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  mode,
  onModeChange,
  inkSettings,
  onInkSettingsChange,
  printSettings,
  onPrintSettingsChange,
  onProcess,
  isProcessing,
  progressPercent = 0,
  progressStatus = '',
  hasResult,
  onDownloadPng,
  onDownloadSvg,
  onDownloadTiff,
  originalWidth,
  originalHeight,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Compute calculated dimensions for Print Master
  const { pxWidth, pxHeight, megapixels, widthInches, heightInches } = calculatePixels(
    printSettings.widthCm,
    printSettings.heightCm,
    printSettings.dpi
  );

  const handlePrintPresetSelect = (presetId: string) => {
    const preset = PRINT_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      onPrintSettingsChange({
        ...printSettings,
        presetId,
        widthCm: preset.widthCm,
        heightCm: preset.heightCm,
      });
    }
  };

  return (
    <div className={`border rounded-2xl p-5 space-y-6 shadow-xl transition-colors ${
      isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200 shadow-zinc-200/50'
    }`}>
      {/* Mode Selector Radio Pills */}
      <div className="space-y-2">
        <label className={`text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
          isDark ? 'text-zinc-400' : 'text-zinc-500'
        }`}>
          <span>Modo de Processamento</span>
          <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>PDF Ref. p.10-12</span>
        </label>
        <div className={`grid grid-cols-3 gap-2 p-1.5 rounded-xl border ${
          isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
        }`}>
          <button
            onClick={() => onModeChange('INK_VECTOR')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
              mode === 'INK_VECTOR'
                ? isDark 
                  ? 'bg-zinc-800 text-cyan-400 font-bold shadow border border-zinc-700'
                  : 'bg-white text-cyan-700 font-bold shadow-sm border border-zinc-300'
                : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span className="text-base mb-0.5">✒️</span>
            <span className="text-xs">Arte Final</span>
            <span className={`text-[10px] font-normal ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Nanquim / Linhas</span>
          </button>

          <button
            onClick={() => onModeChange('SUPER_RES')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
              mode === 'SUPER_RES'
                ? isDark 
                  ? 'bg-zinc-800 text-cyan-400 font-bold shadow border border-zinc-700'
                  : 'bg-white text-cyan-700 font-bold shadow-sm border border-zinc-300'
                : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span className="text-base mb-0.5">🚀</span>
            <span className="text-xs">Super Res</span>
            <span className={`text-[10px] font-normal ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>IA / Cor / Foto</span>
          </button>

          <button
            onClick={() => onModeChange('PRINT_MASTER')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
              mode === 'PRINT_MASTER'
                ? isDark 
                  ? 'bg-zinc-800 text-cyan-400 font-bold shadow border border-zinc-700'
                  : 'bg-white text-cyan-700 font-bold shadow-sm border border-zinc-300'
                : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span className="text-base mb-0.5">⚡</span>
            <span className="text-xs">Print Master</span>
            <span className={`text-[10px] font-normal ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>300 DPI Gráfica</span>
          </button>
        </div>
      </div>

      {/* MODE 1 & 2 SCALE SELECTOR (2x, 4x, 6x, 8x) */}
      {mode !== 'PRINT_MASTER' && (
        <div className="space-y-2">
          <label className={`text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
            isDark ? 'text-zinc-400' : 'text-zinc-500'
          }`}>
            <span>Fator de Escala</span>
            <span className={`font-mono font-bold text-xs ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
              {originalWidth * inkSettings.scale} × {originalHeight * inkSettings.scale} px
            </span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[2, 4, 6, 8].map((s) => (
              <button
                key={s}
                onClick={() => onInkSettingsChange({ ...inkSettings, scale: s as 2 | 4 | 6 | 8 })}
                className={`py-2 rounded-lg font-mono text-xs font-bold transition-all border cursor-pointer ${
                  inkSettings.scale === s
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-sm'
                      : 'bg-cyan-50 text-cyan-700 border-cyan-400 shadow-sm'
                    : isDark
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300'
                }`}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODE 2: INK / LINE ART SPECIFIC CONTROLS (from Page 11 of PDF) */}
      {mode === 'INK_VECTOR' && (
        <div className={`space-y-4 pt-2 border-t ${isDark ? 'border-zinc-900' : 'border-zinc-200'}`}>
          <div className="flex items-center justify-between">
            <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? 'text-cyan-400' : 'text-cyan-700'
            }`}>
              <span>✒️</span> Controles de Nanquim &amp; Hachuras
            </h4>
            <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Anti-Serrilhado Ativo</span>
          </div>

          {/* Slider 1: Limpeza */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className={`font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Limpeza de Fundo (Papel Branco)</span>
              <span className={`font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>{inkSettings.cleanliness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={inkSettings.cleanliness}
              onChange={(e) => onInkSettingsChange({ ...inkSettings, cleanliness: Number(e.target.value) })}
              className={`w-full accent-cyan-500 h-1.5 rounded-lg appearance-none cursor-pointer ${
                isDark ? 'bg-zinc-800' : 'bg-zinc-200'
              }`}
            />
            <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Remove manchas cinzentas de scanner e ruídos de compressão.</p>
          </div>

          {/* Slider 2: Nitidez */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className={`font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Nitidez de Contorno</span>
              <span className={`font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>{inkSettings.sharpness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={inkSettings.sharpness}
              onChange={(e) => onInkSettingsChange({ ...inkSettings, sharpness: Number(e.target.value) })}
              className={`w-full accent-cyan-500 h-1.5 rounded-lg appearance-none cursor-pointer ${
                isDark ? 'bg-zinc-800' : 'bg-zinc-200'
              }`}
            />
            <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Recupera a borda dura do bico de pena ou caneta nanquim.</p>
          </div>

          {/* Slider 3: Preservação das Linhas */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className={`font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Preservação de Linhas &amp; Hachuras</span>
              <span className={`font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>{inkSettings.linePreservation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={inkSettings.linePreservation}
              onChange={(e) => onInkSettingsChange({ ...inkSettings, linePreservation: Number(e.target.value) })}
              className={`w-full accent-cyan-500 h-1.5 rounded-lg appearance-none cursor-pointer ${
                isDark ? 'bg-zinc-800' : 'bg-zinc-200'
              }`}
            />
            <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Mantém hachuras cruzadas ultrafinas sem empastamento preto.</p>
          </div>

          {/* Slider 4: Remoção de Ruído */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className={`font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Remoção de Ruído &amp; Textura</span>
              <span className={`font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>{inkSettings.denoise}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={inkSettings.denoise}
              onChange={(e) => onInkSettingsChange({ ...inkSettings, denoise: Number(e.target.value) })}
              className={`w-full accent-cyan-500 h-1.5 rounded-lg appearance-none cursor-pointer ${
                isDark ? 'bg-zinc-800' : 'bg-zinc-200'
              }`}
            />
            <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Elimina poeira digital e granulação de fibra de papel.</p>
          </div>

          {/* Slider 5: Nanquim Profundo */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className={`font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Preto Nanquim Profundo (K=100%)</span>
              <span className={`font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>{inkSettings.deepBlack}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={inkSettings.deepBlack}
              onChange={(e) => onInkSettingsChange({ ...inkSettings, deepBlack: Number(e.target.value) })}
              className={`w-full accent-cyan-500 h-1.5 rounded-lg appearance-none cursor-pointer ${
                isDark ? 'bg-zinc-800' : 'bg-zinc-200'
              }`}
            />
            <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Garante pretos densos chapados sem tons cinzentos lavados.</p>
          </div>

          {/* Checkbox Options */}
          <div className="pt-2 space-y-2">
            <label className={`flex items-center gap-2 text-xs cursor-pointer ${
              isDark ? 'text-zinc-300' : 'text-zinc-700'
            }`}>
              <input
                type="checkbox"
                checked={inkSettings.antiAliasing}
                onChange={(e) => onInkSettingsChange({ ...inkSettings, antiAliasing: e.target.checked })}
                className="rounded border-zinc-400 text-cyan-600 focus:ring-0"
              />
              <span>Suavização de Serrilhados (Anti-Aliasing de Aparência Vetorial)</span>
            </label>

            <label className={`flex items-center gap-2 text-xs cursor-pointer ${
              isDark ? 'text-zinc-300' : 'text-zinc-700'
            }`}>
              <input
                type="checkbox"
                checked={inkSettings.preserveCrosshatch}
                onChange={(e) => onInkSettingsChange({ ...inkSettings, preserveCrosshatch: e.target.checked })}
                className="rounded border-zinc-400 text-cyan-600 focus:ring-0"
              />
              <span>Modo Proteção de Hachuras (Crosshatching Shield)</span>
            </label>
          </div>
        </div>
      )}

      {/* MODE 1: SUPER RESOLUTION CONTROLS */}
      {mode === 'SUPER_RES' && (
        <div className={`space-y-4 pt-2 border-t ${isDark ? 'border-zinc-900' : 'border-zinc-200'}`}>
          <div className="flex items-center justify-between">
            <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? 'text-cyan-400' : 'text-cyan-700'
            }`}>
              <span>🚀</span> Detalhes &amp; Micro-Contraste Cromático
            </h4>
            <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>RGB Full Color</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className={`font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Nitidez de Micro-Detalhes (Cabelo/Olhos)</span>
              <span className={`font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>{inkSettings.sharpness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={inkSettings.sharpness}
              onChange={(e) => onInkSettingsChange({ ...inkSettings, sharpness: Number(e.target.value) })}
              className={`w-full accent-cyan-500 h-1.5 rounded-lg appearance-none cursor-pointer ${
                isDark ? 'bg-zinc-800' : 'bg-zinc-200'
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className={`font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Redução de Artefatos de Compressão</span>
              <span className={`font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>{inkSettings.denoise}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={inkSettings.denoise}
              onChange={(e) => onInkSettingsChange({ ...inkSettings, denoise: Number(e.target.value) })}
              className={`w-full accent-cyan-500 h-1.5 rounded-lg appearance-none cursor-pointer ${
                isDark ? 'bg-zinc-800' : 'bg-zinc-200'
              }`}
            />
          </div>
        </div>
      )}

      {/* MODE 3: PRINT MASTER CONTROLS (from Page 11 & 12 of PDF) */}
      {mode === 'PRINT_MASTER' && (
        <div className={`space-y-4 pt-2 border-t ${isDark ? 'border-zinc-900' : 'border-zinc-200'}`}>
          <div className="flex items-center justify-between">
            <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? 'text-cyan-400' : 'text-cyan-700'
            }`}>
              <span>⚡</span> Produção Gráfica &amp; Pré-Impressão
            </h4>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border ${
              isDark 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              300 DPI Offset
            </span>
          </div>

          {/* Preset Selector */}
          <div className="space-y-1.5">
            <label className={`text-xs font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Formato / Tamanho Final:</label>
            <select
              value={printSettings.presetId}
              onChange={(e) => handlePrintPresetSelect(e.target.value)}
              className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 transition border ${
                isDark 
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-200' 
                  : 'bg-zinc-50 border-zinc-300 text-zinc-800'
              }`}
            >
              {PRINT_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.widthCm} × {p.heightCm} cm)
                </option>
              ))}
            </select>
          </div>

          {/* Custom Dimension Inputs */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Largura (cm):</label>
              <input
                type="number"
                step="0.5"
                value={printSettings.widthCm}
                onChange={(e) => onPrintSettingsChange({ ...printSettings, widthCm: Number(e.target.value) })}
                className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-mono border ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-300 text-zinc-800'
                }`}
              />
            </div>
            <div>
              <label className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Altura (cm):</label>
              <input
                type="number"
                step="0.5"
                value={printSettings.heightCm}
                onChange={(e) => onPrintSettingsChange({ ...printSettings, heightCm: Number(e.target.value) })}
                className={`w-full rounded-lg px-2.5 py-1.5 text-xs font-mono border ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-300 text-zinc-800'
                }`}
              />
            </div>
          </div>

          {/* DPI Resolution Selector */}
          <div className="space-y-1.5">
            <label className={`text-xs font-medium flex justify-between ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              <span>Resolução Gráfica (DPI):</span>
              <span className={`font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>{printSettings.dpi} DPI</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[150, 300, 600].map((d) => (
                <button
                  key={d}
                  onClick={() => onPrintSettingsChange({ ...printSettings, dpi: d as 150 | 300 | 600 })}
                  className={`py-1.5 rounded-lg text-xs font-mono font-medium border transition cursor-pointer ${
                    printSettings.dpi === d
                      ? isDark
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 font-bold'
                        : 'bg-cyan-50 text-cyan-700 border-cyan-400 font-bold shadow-sm'
                      : isDark
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {d} DPI {d === 300 && '★'}
                </button>
              ))}
            </div>
          </div>

          {/* Color Mode */}
          <div className="space-y-1.5">
            <label className={`text-xs font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Modo de Cor para Gráfica:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'grayscale', label: 'Grayscale (Nanquim)' },
                { id: 'cmyk_sim', label: 'CMYK (Offset)' },
                { id: 'rgb', label: 'RGB (Digital)' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => onPrintSettingsChange({ ...printSettings, colorMode: c.id as any })}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition cursor-pointer ${
                    printSettings.colorMode === c.id
                      ? isDark
                        ? 'bg-zinc-800 text-cyan-400 border-cyan-500/40 font-bold'
                        : 'bg-white text-cyan-700 border-cyan-400 font-bold shadow-sm'
                      : isDark
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Automatic Pixel Math Display (Page 12 of PDF) */}
          <div className={`p-3 rounded-xl border space-y-1.5 font-mono text-xs ${
            isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className={`flex justify-between ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              <span>Cálculo Automático de Pixels:</span>
              <span className={`font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{pxWidth} × {pxHeight} px</span>
            </div>
            <div className={`flex justify-between ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              <span>Tamanho Físico Impresso:</span>
              <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>{printSettings.widthCm} × {printSettings.heightCm} cm</span>
            </div>
            <div className={`flex justify-between ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              <span>Densidade &amp; Resolução:</span>
              <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{megapixels} MP @ {printSettings.dpi} DPI</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Process Button with Integrated Progress Bar */}
      <div className="space-y-3">
        <button
          onClick={onProcess}
          disabled={isProcessing}
          className={`relative w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide shadow-lg overflow-hidden transition-all flex items-center justify-center gap-2 group ${
            isProcessing
              ? isDark
                ? 'bg-zinc-900 border border-cyan-500/50 text-cyan-300 shadow-cyan-500/20 cursor-wait'
                : 'bg-zinc-100 border border-cyan-400 text-cyan-800 cursor-wait'
              : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white shadow-cyan-500/20 active:scale-[0.99] cursor-pointer'
          }`}
        >
          {/* Inner animated filling progress bar */}
          {isProcessing && (
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500/30 via-blue-600/40 to-cyan-400/50 transition-all duration-200 border-r border-cyan-400"
              style={{ width: `${progressPercent}%` }}
            />
          )}

          <div className="relative z-10 flex items-center gap-2">
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <span>Processando Arte ({progressPercent}%)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span>[ Processar Imagem ]</span>
              </>
            )}
          </div>
        </button>

        {/* Live Progress HUD Box (Visible during processing) */}
        {isProcessing && (
          <div className={`p-3 rounded-xl border shadow-xl backdrop-blur space-y-2 ${
            isDark ? 'bg-zinc-900/90 border-cyan-500/40' : 'bg-white border-cyan-300 shadow-cyan-500/10'
          }`}>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className={`text-[11px] truncate max-w-[240px] ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                {progressStatus || 'Processando matriz de pixels...'}
              </span>
              <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>{progressPercent}%</span>
            </div>

            {/* Glowing Progress Track */}
            <div className={`w-full h-2 rounded-full overflow-hidden border p-0.5 ${
              isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-300'
            }`}>
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-200 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Export / Download Section */}
      {hasResult && (
        <div className={`pt-3 border-t space-y-2 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <label className={`text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
            isDark ? 'text-zinc-400' : 'text-zinc-500'
          }`}>
            <span>Exportação para Impressão</span>
            <span className={`font-mono text-[10px] font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Pronto para Envio</span>
          </label>

          {/* Download 300 DPI PNG */}
          <button
            onClick={onDownloadPng}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center justify-between shadow cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileDown className="w-4 h-4" />
              <span>Baixar PNG Alta Resolução ({printSettings.dpi} DPI)</span>
            </div>
            <span className="text-[10px] bg-emerald-700/80 px-1.5 py-0.5 rounded font-mono">
              pHYs 300DPI
            </span>
          </button>

          {/* Export SVG Vector */}
          <button
            onClick={onDownloadSvg}
            className={`w-full py-2 px-3 rounded-xl border font-medium text-xs transition flex items-center justify-between cursor-pointer ${
              isDark 
                ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200' 
                : 'bg-white hover:bg-zinc-50 border-zinc-300 text-zinc-800 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2">
              <VectorSquare className="w-4 h-4 text-cyan-500" />
              <span>Exportar Vetor SVG (Curvas Reais)</span>
            </div>
            <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>.SVG</span>
          </button>

          {/* Download TIFF */}
          <button
            onClick={onDownloadTiff}
            className={`w-full py-2 px-3 rounded-xl border font-medium text-xs transition flex items-center justify-between cursor-pointer ${
              isDark 
                ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200' 
                : 'bg-white hover:bg-zinc-50 border-zinc-300 text-zinc-800 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileImage className="w-4 h-4 text-amber-500" />
              <span>Baixar TIFF Gráfico Sem Perdas</span>
            </div>
            <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>.TIFF</span>
          </button>
        </div>
      )}
    </div>
  );
};
