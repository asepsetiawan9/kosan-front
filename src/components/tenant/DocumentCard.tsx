'use client';

import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UploadCloud, 
  ExternalLink, 
  Trash2,
  FileCheck2,
  FileBadge
} from 'lucide-react';
import { clsx } from 'clsx';
import { DocumentType, TenantDocument } from '@/lib/types';

interface DocumentCardProps {
  type: DocumentType;
  title: string;
  description: string;
  document?: TenantDocument | null;
  onUploadClick: (type: DocumentType) => void;
  onDeleteClick?: (doc: TenantDocument) => void;
  onPreviewClick?: (doc: TenantDocument) => void;
  isDeleting?: boolean;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  type,
  title,
  description,
  document,
  onUploadClick,
  onDeleteClick,
  onPreviewClick,
  isDeleting = false,
}) => {
  const isUploaded = !!document;
  const isVerified = document?.is_verified ?? false;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className={clsx(
        'rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between shadow-soft-card bg-white',
        isVerified
          ? 'border-emerald-200/80 bg-gradient-to-b from-emerald-50/20 to-white'
          : isUploaded
          ? 'border-indigo-200/80 bg-gradient-to-b from-indigo-50/15 to-white'
          : 'border-slate-200 hover:border-slate-300'
      )}
    >
      <div>
        {/* Header Badge & Title */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs',
                isVerified
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : isUploaded
                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              )}
            >
              {isVerified ? (
                <FileCheck2 className="w-5 h-5" />
              ) : isUploaded ? (
                <FileBadge className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-base leading-tight">{title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </div>
          </div>

          <div>
            {isVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Terverifikasi
              </span>
            ) : isUploaded ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3.5 h-3.5" />
                Menunggu
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                Belum Ada
              </span>
            )}
          </div>
        </div>

        {/* File Metadata if Uploaded */}
        {isUploaded && (
          <div className="my-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            <div className="flex items-center justify-between gap-2 font-medium">
              <span className="truncate text-slate-800 font-semibold" title={document.original_filename}>
                {document.original_filename || `${type.toUpperCase()}.file`}
              </span>
              <span className="text-[11px] text-slate-400 shrink-0">
                {formatFileSize(document.file_size)}
              </span>
            </div>
            {document.notes && (
              <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Catatan Pengelola:</span> {document.notes}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
        {isUploaded ? (
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2">
              {document.stream_url && (
                <button
                  type="button"
                  onClick={() => onPreviewClick ? onPreviewClick(document) : window.open(document.stream_url, '_blank')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Lihat Berkas
                </button>
              )}

              {!isVerified && (
                <button
                  type="button"
                  onClick={() => onUploadClick(type)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Ganti
                </button>
              )}
            </div>

            {!isVerified && onDeleteClick && (
              <button
                type="button"
                onClick={() => onDeleteClick(document)}
                disabled={isDeleting}
                title="Hapus berkas ini"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onUploadClick(type)}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-teal-800 bg-teal-50/80 border border-teal-200 hover:bg-teal-100/90 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <UploadCloud className="w-4 h-4 text-teal-700" />
            Unggah {title}
          </button>
        )}
      </div>
    </div>
  );
};
