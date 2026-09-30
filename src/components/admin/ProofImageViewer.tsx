'use client';

import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  ExternalLink,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface ProofImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  mimeType?: string | null;
  title?: string;
  subtitle?: string;
  sha256?: string | null;
  isDuplicateSuspect?: boolean;
}

export const ProofImageViewer: React.FC<ProofImageViewerProps> = ({
  isOpen,
  onClose,
  imageUrl,
  mimeType,
  title = 'Berkas Bukti Transfer',
  subtitle,
  sha256,
  isDuplicateSuspect = false,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  if (!isOpen || !imageUrl) return null;

  const isPdf = mimeType === 'application/pdf' || imageUrl.toLowerCase().includes('.pdf');

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              {isDuplicateSuspect && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                  Suspect Duplikat
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2">
            {!isPdf && (
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Perkecil"
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-600 px-1 min-w-[40px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Perbesar"
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  title="Putar 90 Derajat"
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer border-l border-slate-100"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset Tampilan"
                  className="px-2 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            )}

            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs cursor-pointer"
              title="Buka di tab baru"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-500 transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Warning Banner if Duplicate */}
        {isDuplicateSuspect && (
          <div className="flex items-center gap-2 px-6 py-2 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <p>
              <strong>Perhatian Admin:</strong> Berkas ini memiliki hash SHA256 identik dengan bukti transfer yang pernah diunggah sebelumnya. Pastikan mutasi bank riil benar-benar masuk.
            </p>
          </div>
        )}

        {/* Image / PDF Display Body */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-900/5 min-h-[400px]">
          {isPdf ? (
            <div className="w-full h-[550px] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-xs">
              <FileText className="w-16 h-16 text-rose-500 mb-3" />
              <h4 className="text-base font-bold text-slate-800">Berkas Dokumen PDF</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                Pratinjau berkas PDF bukti transfer. Anda dapat membuka atau mengunduh berkas lengkap melalui tombol di bawah.
              </p>
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs shadow-md transition-colors"
              >
                <Download className="w-4 h-4" />
                Unduh / Buka Dokumen PDF
              </a>
            </div>
          ) : (
            <div className="relative overflow-hidden flex items-center justify-center max-w-full max-h-[60vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Bukti Transfer"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transition: 'transform 0.15s ease-out',
                }}
                className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-md border border-slate-200 bg-white"
              />
            </div>
          )}
        </div>

        {/* Footer info: SHA256 Hash */}
        {sha256 && (
          <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>
              <strong>SHA256:</strong> <code className="text-slate-700">{sha256}</code>
            </span>
            <span className="text-slate-400">Signed URL Terenkripsi</span>
          </div>
        )}
      </div>
    </div>
  );
};
