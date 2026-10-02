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

interface ControlsPanelProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  inkSettings: InkSettings;
  onInkSettingsChange: (settings: InkSettings) => void;
  printSettings: PrintSettings;
  onPrintSettingsChange: (settings: PrintSettings) => void;
  onProcess: () => void;
  isProcessing: boolean;
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
  hasResult,
  onDownloadPng,
  onDownloadSvg,
  onDownloadTiff,
  originalWidth,
  originalHeight,
}) => {
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
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-6 shadow-xl">
      {/* Mode Selector Radio Pills */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
          <span>Modo de Processamento</span>
          <span className="text-[10px] text-zinc-500 font-mono">PDF Ref. p.10-12</span>
        </label>
        <div className="grid grid-cols-3 gap-2 bg-zinc-900/80 p-1.5 rounded-xl border border-zinc-800">
          <button
            onClick={() => onModeChange('INK_VECTOR')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-center transition-all ${
              mode === 'INK_VECTOR'
                ? 'bg-zinc-800 text-cyan-400 font-bold shadow border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="text-base mb-0.5">✒️</span>
            <span className="text-xs">Arte Final</span>
            <span className="text-[10px] text-zinc-500 font-normal">Nanquim / Linhas</span>
          </button>

          <button
            onClick={() => onModeChange('SUPER_RES')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-center transition-all ${
              mode === 'SUPER_RES'
                ? 'bg-zinc-800 text-cyan-400 font-bold shadow border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="text-base mb-0.5">🚀</span>
            <span className="text-xs">Super Res</span>
            <span className="text-[10px] text-zinc-500 font-normal">IA / Cor / Foto</span>
          </button>

          <button
            onClick={() => onModeChange('PRINT_MASTER')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-center transition-all ${
              mode === 'PRINT_MASTER'
                ? 'bg-zinc-800 text-cyan-400 font-bold shadow border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="text-base mb-0.5">⚡</span>
            <span className="text-xs">Print Master</span>
            <span className="text-[10px] text-zinc-500 font-normal">300 DPI Gráfica</span>
          </button>
        </div>
      </div>

      {/* MODE 1 & 2 SCALE SELECTOR (2x, 4x, 6x, 8x) */}
      {mode !== 'PRINT_MASTER' && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Fator de Escala</span>
            <span className="text-cyan-400 font-mono font-bold text-xs">
              {originalWidth * inkSettings.scale} × {originalHeight * inkSettings.scale} px
            </span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[2, 4, 6, 8].map((s) => (
              <button
                key={s}
                onClick={() => onInkSettingsChange({ ...inkSettings, scale: s as 2 | 4 | 6 | 8 })}
                className={`py-2 rounded-lg font-mono text-xs font-bold transition-all border ${
                  inkSettings.scale === s
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
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
        <div className="space-y-4 pt-2 border-t border-zinc-900">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <span>✒️</span> Controles de Nanquim &amp; Hachuras
            </h4>
            <span className="text-[10px] text-zinc-500 font-mono">Anti-Serrilhado Ativo</span>
          </div>

          {/* Slider 1: Limpeza */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-medium">Limpeza de Fundo (Papel Branco)</span>
              <span className="font-mono text-cyan-400">{inkSettings.cleanliness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={inkSettings.cleanliness}
              onChange={(e) => onInkSettingsChange({ ...inkSettings, cleanliness: Number(e.target.value) })}
              className="w-full accent-cyan-400 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-[10px] text-zinc-500">Remove manchas cinzentas de scanner e ruídos de compressão.</p>
          </div>

          {/* Slider 2: Nitidez */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-medium">Nitidez de Contorno</span>
              <span className="font-mono text-cyan-400">{inkSettings.sharpness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={inkSettings.sharpness}
              onChange={(e) => onInkSettingsChange({ ...inkSettings, sharpness: Number(e.target.value) })}
              className="w-full accent-cyan-400 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-[10px] text-zinc-500">Recupera a borda dura do bico de pena ou caneta nanquim.</p>
          </div>

          {/* Slider 3: Preservação das Linhas */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-medium">Preservação de Linhas &amp; Hachuras</span>
              <span className="font-mono text-cyan-400">{inkSettings.linePreservation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={inkSettings.linePreservation}
              onChange={(e) => onInkSettingsChange({ ...inkSettings, linePreservation: Number(e.target.value) })}
              className="w-full accent-cyan-400 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-[10px] text-zinc-500">Mantém hachuras cruzadas ultrafinas sem empastamento preto.</p>
          </div>

          {/* Slider 4: Remoção de Ruído */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-medium">Remoção de Ruído &amp; Textura</span>
              <span className="font-mono text-cyan-400">{inkSettings.denoise}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={inkSettings.denoise}
              onChange={(e) => onInkSettingsChange({ ...inkSettings, denoise: Number(e.target.value) })}
              className="w-full accent-cyan-400 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-[10px] text-zinc-500">Elimina poeira digital e granulação de fibra de papel.</p>
          </div>

          {/* Slider 5: Nanquim Profundo */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-medium">Preto Nanquim Profundo (K=100%)</span>
              <span className="font-mono text-cyan-400">{inkSettings.deepBlack}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={inkSettings.deepBlack}
              onChange={(e) => onInkSettingsChange({ ...inkSettings, deepBlack: Number(e.target.value) })}
              className="w-full accent-cyan-400 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-[10px] text-zinc-500">Garante pretos densos chapados sem tons cinzentos lavados.</p>
          </div>

          {/* Checkbox Options */}
          <div className="pt-2 space-y-2">
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={inkSettings.antiAliasing}
                onChange={(e) => onInkSettingsChange({ ...inkSettings, antiAliasing: e.target.checked })}
                className="rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-0"
              />
              <span>Suavização de Serrilhados (Anti-Aliasing de Aparência Vetorial)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={inkSettings.preserveCrosshatch}
                onChange={(e) => onInkSettingsChange({ ...inkSettings, preserveCrosshatch: e.target.checked })}
                className="rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-0"
              />
              <span>Modo Proteção de Hachuras (Crosshatching Shield)</span>
            </label>
          </div>
        </div>
      )}

      {/* MODE 1: SUPER RESOLUTION CONTROLS */}
      {mode === 'SUPER_RES' && (
        <div className="space-y-4 pt-2 border-t border-zinc-900">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <span>🚀</span> Detalhes &amp; Micro-Contraste Cromático
            </h4>
            <span className="text-[10px] text-zinc-500 font-mono">RGB Full Color</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-medium">Nitidez de Micro-Detalhes (Cabelo/Olhos)</span>
              <span className="font-mono text-cyan-400">{inkSettings.sharpness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={inkSettings.sharpness}
              onChange={(e) => onInkSettingsChange({ ...inkSettings, sharpness: Number(e.target.value) })}
              className="w-full accent-cyan-400 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-300 font-medium">Redução de Artefatos de Compressão</span>
              <span className="font-mono text-cyan-400">{inkSettings.denoise}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={inkSettings.denoise}
              onChange={(e) => onInkSettingsChange({ ...inkSettings, denoise: Number(e.target.value) })}
              className="w-full accent-cyan-400 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* MODE 3: PRINT MASTER CONTROLS (from Page 11 & 12 of PDF) */}
      {mode === 'PRINT_MASTER' && (
        <div className="space-y-4 pt-2 border-t border-zinc-900">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <span>⚡</span> Produção Gráfica &amp; Pré-Impressão
            </h4>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
              300 DPI Offset
            </span>
          </div>

          {/* Preset Selector */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300 font-medium">Formato / Tamanho Final:</label>
            <select
              value={printSettings.presetId}
              onChange={(e) => handlePrintPresetSelect(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
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
              <label className="text-[11px] text-zinc-400">Largura (cm):</label>
              <input
                type="number"
                step="0.5"
                value={printSettings.widthCm}
                onChange={(e) => onPrintSettingsChange({ ...printSettings, widthCm: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400">Altura (cm):</label>
              <input
                type="number"
                step="0.5"
                value={printSettings.heightCm}
                onChange={(e) => onPrintSettingsChange({ ...printSettings, heightCm: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono"
              />
            </div>
          </div>

          {/* DPI Resolution Selector */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300 font-medium flex justify-between">
              <span>Resolução Gráfica (DPI):</span>
              <span className="font-mono text-cyan-400 font-bold">{printSettings.dpi} DPI</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[150, 300, 600].map((d) => (
                <button
                  key={d}
                  onClick={() => onPrintSettingsChange({ ...printSettings, dpi: d as 150 | 300 | 600 })}
                  className={`py-1.5 rounded-lg text-xs font-mono font-medium border transition ${
                    printSettings.dpi === d
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {d} DPI {d === 300 && '★'}
                </button>
              ))}
            </div>
          </div>

          {/* Color Mode */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-300 font-medium">Modo de Cor para Gráfica:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'grayscale', label: 'Grayscale (Nanquim)' },
                { id: 'cmyk_sim', label: 'CMYK (Offset)' },
                { id: 'rgb', label: 'RGB (Digital)' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => onPrintSettingsChange({ ...printSettings, colorMode: c.id as any })}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition ${
                    printSettings.colorMode === c.id
                      ? 'bg-zinc-800 text-cyan-400 border-cyan-500/40 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Automatic Pixel Math Display (Page 12 of PDF) */}
          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Cálculo Automático de Pixels:</span>
              <span className="text-zinc-200 font-bold">{pxWidth} × {pxHeight} px</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Tamanho Físico Impresso:</span>
              <span className="text-cyan-400 font-bold">{printSettings.widthCm} × {printSettings.heightCm} cm</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Densidade &amp; Resolução:</span>
              <span className="text-emerald-400 font-bold">{megapixels} MP @ {printSettings.dpi} DPI</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Process Button */}
      <button
        onClick={onProcess}
        disabled={isProcessing}
        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 group cursor-pointer"
      >
        <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        <span>{isProcessing ? 'Processando Arte...' : '[ Processar Imagem ]'}</span>
      </button>

      {/* Export / Download Section */}
      {hasResult && (
        <div className="pt-3 border-t border-zinc-800 space-y-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Exportação para Impressão</span>
            <span className="text-emerald-400 font-mono text-[10px]">Pronto para Envio</span>
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
            className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-medium text-xs transition flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <VectorSquare className="w-4 h-4 text-cyan-400" />
              <span>Exportar Vetor SVG (Curvas Reais)</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">.SVG</span>
          </button>

          {/* Download TIFF */}
          <button
            onClick={onDownloadTiff}
            className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-medium text-xs transition flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileImage className="w-4 h-4 text-amber-400" />
              <span>Baixar TIFF Gráfico Sem Perdas</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">.TIFF</span>
          </button>
        </div>
      )}
    </div>
  );
};
