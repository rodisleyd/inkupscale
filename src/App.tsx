/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { ComparisonViewer } from './components/ComparisonViewer';
import { ControlsPanel } from './components/ControlsPanel';
import { AiAnalysisModal } from './components/AiAnalysisModal';
import { CmykModal } from './components/CmykModal';
import { BatchModal } from './components/BatchModal';
import { AppMode, InkSettings, PrintSettings, ImageAnalysisResult, AiArtAnalysis } from './types';
import { ArtworkSample, getArtworkSamples } from './utils/samples';
import { analyzeImage } from './utils/imageAnalyzer';
import { processArtwork } from './utils/inkEngine';
import { setPngDpi } from './utils/pngDpiInjector';
import { rasterToSvg } from './utils/vectorizer';
import { calculatePixels } from './utils/presets';
import { ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Current Mode
  const [mode, setMode] = useState<AppMode>('INK_VECTOR');

  // Image Source State
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('arte_nanquim.png');
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);

  // Result State
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultCanvas, setResultCanvas] = useState<HTMLCanvasElement | null>(null);
  const [resultWidth, setResultWidth] = useState<number>(0);
  const [resultHeight, setResultHeight] = useState<number>(0);

  // Processing & Progress State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>('');

  // Auto-detection result
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AiArtAnalysis | null>(null);
  const [isCmykModalOpen, setIsCmykModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Default Ink Settings (Matching Page 11 of PDF)
  const [inkSettings, setInkSettings] = useState<InkSettings>({
    scale: 4, // 4x default
    cleanliness: 70, // Limpeza
    sharpness: 80, // Nitidez
    linePreservation: 85, // Preservação de Linhas & Hachuras
    denoise: 35, // Remoção de ruído
    deepBlack: 95, // Preto nanquim puro K=100%
    antiAliasing: true, // Suavização de serrilhados
    preserveCrosshatch: true, // Proteção de hachuras
  });

  // Default Print Settings (Matching Page 11 & 12 of PDF: 30x25 cm @ 300 DPI)
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    presetId: '30x25',
    widthCm: 30,
    heightCm: 25,
    dpi: 300,
    colorMode: 'grayscale',
    format: 'png',
    marginBleedMm: 0,
  });

  // Toast notification auto-dismiss
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load image from URL or File
  const handleLoadImage = useCallback(async (url: string, name: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;

    img.onload = async () => {
      setOriginalUrl(url);
      setFileName(name);
      setOriginalWidth(img.naturalWidth);
      setOriginalHeight(img.naturalHeight);
      setSourceImg(img);

      // 1. Run automatic detection (Page 13 of PDF)
      const analysis = await analyzeImage(img);
      setAnalysisResult(analysis);

      // Auto-set the optimal mode
      setMode(analysis.detectedMode);
      setNotification(`🎯 ${analysis.description} (${Math.round(analysis.confidence * 100)}% de confiança)`);

      // 2. Perform initial instant upscaling pass
      runProcessing(img, analysis.detectedMode, inkSettings, printSettings);
    };

    img.onerror = () => {
      setNotification('❌ Erro ao carregar a imagem da URL fornecida.');
    };
  }, [inkSettings, printSettings]);

  // User file upload handler
  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        handleLoadImage(e.target.result, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  // Sample select handler
  const handleSampleSelect = (sample: ArtworkSample) => {
    handleLoadImage(sample.dataUrl, `${sample.id}.png`);
  };

  // Core Processing Routine
  const runProcessing = async (
    img: HTMLImageElement | null = sourceImg,
    targetMode: AppMode = mode,
    currentInk = inkSettings,
    currentPrint = printSettings
  ) => {
    if (!img) return;

    setIsProcessing(true);
    setProgressPercent(10);
    setProgressStatus('Iniciando motor gráfico...');

    try {
      let targetW: number | undefined;
      let targetH: number | undefined;

      if (targetMode === 'PRINT_MASTER') {
        const { pxWidth, pxHeight } = calculatePixels(
          currentPrint.widthCm,
          currentPrint.heightCm,
          currentPrint.dpi
        );
        targetW = pxWidth;
        targetH = pxHeight;
      }

      const canvas = await processArtwork(
        img,
        {
          mode: targetMode,
          inkSettings: currentInk,
          printSettings: currentPrint,
          scale: currentInk.scale,
          targetWidth: targetW,
          targetHeight: targetH,
        },
        (pct, status) => {
          setProgressPercent(pct);
          setProgressStatus(status);
        }
      );

      setResultCanvas(canvas);
      setResultWidth(canvas.width);
      setResultHeight(canvas.height);

      let finalPng = canvas.toDataURL('image/png');
      finalPng = setPngDpi(finalPng, currentPrint.dpi);
      setResultUrl(finalPng);
    } catch (err) {
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download High-Res PNG with 300 DPI metadata
  const handleDownloadPng = () => {
    if (!resultUrl) return;
    const link = document.createElement('a');
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const dpi = printSettings.dpi;
    link.download = `${baseName}_ink_upscaler_${resultWidth}x${resultHeight}_${dpi}dpi.png`;
    link.href = resultUrl;
    link.click();
  };

  // Export True SVG Vector
  const handleDownloadSvg = () => {
    if (!resultCanvas) return;
    const svgContent = rasterToSvg(resultCanvas, 140);
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    link.download = `${baseName}_ink_vector.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download TIFF (Lossless Print)
  const handleDownloadTiff = () => {
    if (!resultUrl) return;
    const link = document.createElement('a');
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    link.download = `${baseName}_print_master_300dpi.tiff`;
    link.href = resultUrl;
    link.click();
  };

  // AI Diagnosis Trigger (Server-Side Gemini)
  const handleOpenAiDiagnosis = async () => {
    setIsAiModalOpen(true);
    if (aiAnalysis || !originalUrl) return;

    setIsAiLoading(true);
    try {
      const res = await fetch('/api/analyze-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: originalUrl,
          mimeType: 'image/png',
        }),
      });
      const data = await res.json();
      setAiAnalysis(data);
    } catch (err) {
      console.error('Failed to analyze with Gemini:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyAiSettings = (suggested: Partial<InkSettings>) => {
    const updated = { ...inkSettings, ...suggested };
    setInkSettings(updated);
    setNotification('✨ Parâmetros recomendados pela IA aplicados!');
    runProcessing(sourceImg, mode, updated, printSettings);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        currentMode={mode}
        onSelectMode={(newMode) => {
          setMode(newMode);
          if (sourceImg) {
            runProcessing(sourceImg, newMode, inkSettings, printSettings);
          }
        }}
        onOpenAiModal={handleOpenAiDiagnosis}
        onOpenCmykModal={() => setIsCmykModalOpen(true)}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
        hasImage={!!originalUrl}
        isProcessing={isProcessing}
        detectedModeInfo={analysisResult?.description}
      />

      {/* Floating Detection Notification Banner */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 animate-bounce">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900/95 border border-cyan-500/50 text-xs font-semibold text-cyan-300 shadow-2xl backdrop-blur">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 flex flex-col">
        {!originalUrl ? (
          /* Empty State: DropZone + Reference Gallery from PDF */
          <DropZone
            onFileSelect={handleFileSelect}
            onSampleSelect={handleSampleSelect}
            onUrlSelect={(url, name) => handleLoadImage(url, name || 'arte_web.png')}
          />
        ) : (
          /* Active State: Studio Layout (Comparison Canvas + Inspector Controls) */
          <div className="flex-1 flex flex-col gap-4">
            {/* Action Bar / Breadcrumb */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setOriginalUrl(null);
                  setResultUrl(null);
                  setResultCanvas(null);
                  setAnalysisResult(null);
                  setAiAnalysis(null);
                }}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Escolher Outra Arte</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="font-mono text-zinc-300 font-semibold">{fileName}</span>
                {analysisResult && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-400 text-[11px] font-medium">
                    {analysisResult.description}
                  </span>
                )}
              </div>
            </div>

            {/* Split Grid: Left = Visual Comparison Viewer | Right = Sizing & Engine Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
              {/* Left Column: Comparison Viewer (Page 12 of PDF) */}
              <div className="lg:col-span-8 flex flex-col h-full min-h-[540px]">
                <ComparisonViewer
                  originalUrl={originalUrl}
                  resultUrl={resultUrl}
                  originalWidth={originalWidth}
                  originalHeight={originalHeight}
                  resultWidth={resultWidth}
                  resultHeight={resultHeight}
                  dpi={printSettings.dpi}
                  isProcessing={isProcessing}
                  progressPercent={progressPercent}
                  progressStatus={progressStatus}
                />
              </div>

              {/* Right Column: Controls & Presets */}
              <div className="lg:col-span-4">
                <ControlsPanel
                  mode={mode}
                  onModeChange={(newMode) => {
                    setMode(newMode);
                    runProcessing(sourceImg, newMode, inkSettings, printSettings);
                  }}
                  inkSettings={inkSettings}
                  onInkSettingsChange={(newSettings) => setInkSettings(newSettings)}
                  printSettings={printSettings}
                  onPrintSettingsChange={(newPrint) => setPrintSettings(newPrint)}
                  onProcess={() => runProcessing(sourceImg, mode, inkSettings, printSettings)}
                  isProcessing={isProcessing}
                  progressPercent={progressPercent}
                  progressStatus={progressStatus}
                  hasResult={!!resultUrl}
                  onDownloadPng={handleDownloadPng}
                  onDownloadSvg={handleDownloadSvg}
                  onDownloadTiff={handleDownloadTiff}
                  originalWidth={originalWidth}
                  originalHeight={originalHeight}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AiAnalysisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        analysis={aiAnalysis}
        isLoading={isAiLoading}
        onApplySettings={handleApplyAiSettings}
      />

      <CmykModal
        isOpen={isCmykModalOpen}
        onClose={() => setIsCmykModalOpen(false)}
        imageUrl={resultUrl || originalUrl}
      />

      <BatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        inkSettings={inkSettings}
        printSettings={printSettings}
        mode={mode}
      />
    </div>
  );
}
