'use client';

import React from 'react';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';

interface KtpPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  ktpUrl: string | null;
  tenantName: string;
}

export const KtpPreviewModal: React.FC<KtpPreviewModalProps> = ({
  isOpen,
  onClose,
  ktpUrl,
  tenantName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Dokumen KTP: {tenantName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {ktpUrl ? (
            <div className="space-y-3">
              <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                <img
                  src={ktpUrl}
                  alt={`KTP ${tenantName}`}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  🔒 URL HMAC bertanda tangan kedaluwarsa dalam 5 menit.
                </span>
                <a
                  href={ktpUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Ukuran Penuh
                </a>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Berkas KTP tidak tersedia atau URL pratinjau kedaluwarsa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
