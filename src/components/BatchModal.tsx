import React, { useState } from 'react';
import { X, FolderSync, Upload, CheckCircle2, Play, Download, Trash2 } from 'lucide-react';
import { BatchItem, InkSettings, PrintSettings, AppMode } from '../types';
import { processArtwork } from '../utils/inkEngine';
import { setPngDpi } from '../utils/pngDpiInjector';

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  inkSettings: InkSettings;
  printSettings: PrintSettings;
  mode: AppMode;
}

export const BatchModal: React.FC<BatchModalProps> = ({
  isOpen,
  onClose,
  inkSettings,
  printSettings,
  mode,
}) => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  if (!isOpen) return null;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newItems: BatchItem[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
    }));
    setItems((prev) => [...prev, ...newItems]);
  };

  const handleProcessAll = async () => {
    setIsProcessingAll(true);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.status === 'done') continue;

      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'processing', progress: 15 } : it))
      );

      try {
        const img = new Image();
        img.src = item.previewUrl;
        await new Promise((res) => {
          img.onload = res;
        });

        const canvas = await processArtwork(
          img,
          {
            mode,
            inkSettings,
            printSettings,
            scale: inkSettings.scale,
          },
          (pct) => {
            setItems((prev) =>
              prev.map((it) => (it.id === item.id ? { ...it, progress: pct } : it))
            );
          }
        );

        let resultPng = canvas.toDataURL('image/png');
        resultPng = setPngDpi(resultPng, printSettings.dpi);

        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  status: 'done',
                  progress: 100,
                  resultUrl: resultPng,
                  targetDimensions: { width: canvas.width, height: canvas.height },
                }
              : it
          )
        );
      } catch (err) {
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'error' } : it))
        );
      }
    }
    setIsProcessingAll(false);
  };

  const handleDownload = (item: BatchItem) => {
    if (!item.resultUrl) return;
    const link = document.createElement('a');
    link.download = `ink_pro_${item.name.replace(/\.[^/.]+$/, '')}_300dpi.png`;
    link.href = item.resultUrl;
    link.click();
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderSync className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Processamento em Lote (Quadrinhos / Pranchas)</h3>
              <p className="text-xs text-zinc-400">Processe múltiplos arquivos simultaneamente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload box */}
        <div className="border border-dashed border-zinc-800 rounded-xl p-4 text-center bg-zinc-900/40 hover:bg-zinc-900/60 transition cursor-pointer relative">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="flex items-center justify-center gap-2 text-zinc-300 text-xs font-semibold">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Adicionar páginas de quadrinhos ou pranchas (PNG / JPG / WEBP)</span>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[180px]">
          {items.length === 0 ? (
            <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
              Nenhuma imagem na fila de processamento.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded object-cover border border-zinc-800"
                  />
                  <div>
                    <p className="font-semibold text-zinc-200 line-clamp-1 max-w-[240px]">{item.name}</p>
                    <p className="text-[11px] text-zinc-500">
                      {item.status === 'done' ? (
                        <span className="text-emerald-400 font-mono">Concluído ({item.targetDimensions?.width}×{item.targetDimensions?.height} px)</span>
                      ) : item.status === 'processing' ? (
                        <span className="text-cyan-400 font-mono">Processando {item.progress}%...</span>
                      ) : (
                        <span>Na fila</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === 'done' && (
                    <button
                      onClick={() => handleDownload(item)}
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer"
                      title="Baixar PNG"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            {items.length} {items.length === 1 ? 'imagem' : 'imagens'} na fila
          </span>
          <button
            onClick={handleProcessAll}
            disabled={items.length === 0 || isProcessingAll}
            className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-zinc-950 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isProcessingAll ? 'Processando Lote...' : 'Iniciar Processamento de Lote'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
