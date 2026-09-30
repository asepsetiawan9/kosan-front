'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Image as ImageIcon 
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DocumentType } from '@/lib/types';

interface DocumentUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: DocumentType;
  typeTitle: string;
  onUpload: (type: DocumentType, file: File) => Promise<void>;
}

export const DocumentUploaderModal: React.FC<DocumentUploaderModalProps> = ({
  isOpen,
  onClose,
  documentType,
  typeTitle,
  onUpload,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
    setIsUploading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Format berkas tidak didukung. Mohon gunakan file JPG, PNG, atau PDF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran berkas melebihi batas 5MB. Silakan kompres atau pilih berkas yang lebih kecil.');
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Pilih berkas identitas terlebih dahulu.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      await onUpload(documentType, selectedFile);
      handleClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah berkas.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Unggah ${typeTitle}`}>
      <div className="space-y-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          Unggah foto atau scan resmi berkas <strong>{typeTitle}</strong> yang jelas dan terbaca. Berkas Anda disimpan dengan enkripsi di storage privat dan hanya dapat diakses oleh admin pengelola.
        </p>

        {/* Dropzone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[170px] ${
            isDragging
              ? 'border-teal-500 bg-teal-50/50'
              : selectedFile
              ? 'border-emerald-300 bg-emerald-50/20'
              : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {previewUrl ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-28 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-xs relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Pratinjau Berkas"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs font-semibold text-slate-800">{selectedFile?.name}</p>
              <p className="text-[11px] text-teal-700">Klik untuk memilih berkas lain</p>
            </div>
          ) : selectedFile ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-800">{selectedFile.name}</p>
              <p className="text-[11px] text-slate-400">
                {(selectedFile.size / 1024).toFixed(1)} KB (PDF Dokumen)
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Tarik & jatuhkan berkas ke sini, atau <span className="text-teal-700 underline">pilih dari perangkat</span>
              </p>
              <p className="text-xs text-slate-400">
                Mendukung format JPG, PNG, atau PDF (Maksimal 5MB)
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
            className="cursor-pointer"
          >
            Batal
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
            className="bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                Mengunggah...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 mr-1.5" />
                Unggah Berkas
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
