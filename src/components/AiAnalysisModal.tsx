import React from 'react';
import { Sparkles, X, Check, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { AiArtAnalysis, InkSettings } from '../types';

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AiArtAnalysis | null;
  isLoading: boolean;
  onApplySettings: (settings: Partial<InkSettings>) => void;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  isOpen,
  onClose,
  analysis,
  isLoading,
  onApplySettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Diagnóstico Técnico de Arte com IA</h3>
              <p className="text-xs text-zinc-400">Análise de bico de pena, hachuras e matriz gráfica</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-zinc-200">Examinando densidade de linhas e hachuras...</p>
            <p className="text-xs text-zinc-500">Avaliando espessura de traço, serrilhado de scanner e papel</p>
          </div>
        ) : analysis ? (
          <div className="space-y-4 text-xs">
            {/* Highlights Card */}
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Estilo Artístico Detectado:</span>
                <span className="font-bold text-cyan-400 text-sm">{analysis.styleDetected}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800/60">
                <div>
                  <span className="text-zinc-500 block">Densidade de Hachuras:</span>
                  <span className="font-medium text-zinc-200">{analysis.crosshatchingDensity}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Espessura do Traço:</span>
                  <span className="font-medium text-zinc-200">{analysis.lineWeight}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Ruído / Textura Papel:</span>
                  <span className="font-medium text-zinc-200">{analysis.paperNoiseLevel}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Confiança do Diagnóstico:</span>
                  <span className="font-bold text-emerald-400">{Math.round(analysis.confidence * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Technical Recommendation Paragraph */}
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-200 leading-relaxed">
              <p className="font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Parecer de Impressão Gráfica:
              </p>
              <p>{analysis.technicalNotes}</p>
            </div>

            {/* Suggested Sliders */}
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <span className="font-bold text-zinc-300 block">Parâmetros Sugeridos para Reconstrução:</span>
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-500 block">Limpeza</span>
                  <span className="text-cyan-400 font-bold">{analysis.suggestedSettings.cleanliness}%</span>
                </div>
                <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-500 block">Nitidez</span>
                  <span className="text-cyan-400 font-bold">{analysis.suggestedSettings.sharpness}%</span>
                </div>
                <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-500 block">Preservação</span>
                  <span className="text-cyan-400 font-bold">{analysis.suggestedSettings.linePreservation}%</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => {
                onApplySettings(analysis.suggestedSettings);
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Aplicar Parâmetros Recomendados</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-6 text-zinc-400">
            Nenhum dado de diagnóstico disponível.
          </div>
        )}
      </div>
    </div>
  );
};
