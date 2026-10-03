import React from 'react';
import { Sparkles, X, Check, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { AiArtAnalysis, InkSettings } from '../types';
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`border rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative transition-colors ${
        isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-4 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isDark ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-700'
            }`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Diagnóstico Técnico de Arte com IA</h3>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Análise de bico de pena, hachuras e matriz gráfica</p>
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

        {/* Content */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className={`text-sm font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>Examinando densidade de linhas e hachuras...</p>
            <p className="text-xs text-zinc-500">Avaliando espessura de traço, serrilhado de scanner e papel</p>
          </div>
        ) : analysis ? (
          <div className="space-y-4 text-xs">
            {/* Highlights Card */}
            <div className={`p-4 rounded-xl border space-y-3 ${
              isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Estilo Artístico Detectado:</span>
                <span className={`font-bold text-sm ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>{analysis.styleDetected}</span>
              </div>
              <div className={`grid grid-cols-2 gap-3 pt-2 border-t ${isDark ? 'border-zinc-800/60' : 'border-zinc-200'}`}>
                <div>
                  <span className={`block ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Densidade de Hachuras:</span>
                  <span className={`font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{analysis.crosshatchingDensity}</span>
                </div>
                <div>
                  <span className={`block ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Espessura do Traço:</span>
                  <span className={`font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{analysis.lineWeight}</span>
                </div>
                <div>
                  <span className={`block ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Ruído / Textura Papel:</span>
                  <span className={`font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{analysis.paperNoiseLevel}</span>
                </div>
                <div>
                  <span className={`block ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Confiança do Diagnóstico:</span>
                  <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{Math.round(analysis.confidence * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Technical Recommendation Paragraph */}
            <div className={`p-3.5 rounded-xl border leading-relaxed ${
              isDark 
                ? 'bg-cyan-950/30 border-cyan-800/40 text-cyan-200' 
                : 'bg-cyan-50 border-cyan-200 text-cyan-900'
            }`}>
              <p className={`font-semibold mb-1 flex items-center gap-1.5 ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}>
                <ShieldCheck className="w-4 h-4 text-cyan-500" />
                Parecer de Impressão Gráfica:
              </p>
              <p>{analysis.technicalNotes}</p>
            </div>

            {/* Suggested Sliders */}
            <div className={`p-3.5 rounded-xl border space-y-2 ${
              isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <span className={`font-bold block ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>Parâmetros Sugeridos para Reconstrução:</span>
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                <div className={`p-2 rounded border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                  <span className={`block ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Limpeza</span>
                  <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>{analysis.suggestedSettings.cleanliness}%</span>
                </div>
                <div className={`p-2 rounded border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                  <span className={`block ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Nitidez</span>
                  <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>{analysis.suggestedSettings.sharpness}%</span>
                </div>
                <div className={`p-2 rounded border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                  <span className={`block ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Preservação</span>
                  <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>{analysis.suggestedSettings.linePreservation}%</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => {
                onApplySettings(analysis.suggestedSettings);
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
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
