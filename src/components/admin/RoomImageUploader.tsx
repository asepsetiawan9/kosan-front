'use client';

import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface RoomImageUploaderProps {
  file?: File | null;
  onChangeFile?: (file: File | null) => void;
  existingImageUrl?: string | null;
  onRemoveExisting?: () => void;
  // Backward compatibility / optional props
  value?: string;
  onChange?: (val: string) => void;
  error?: string;
  label?: string;
}

export const RoomImageUploader: React.FC<RoomImageUploaderProps> = ({
  file = null,
  onChangeFile,
  existingImageUrl,
  onRemoveExisting,
  value,
  onChange,
  error: parentError,
  label = 'Foto Utama Kamar',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Sync preview with incoming file or existing URL
  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (existingImageUrl) {
      setPreviewUrl(existingImageUrl);
    } else if (value) {
      setPreviewUrl(value);
    } else {
      setPreviewUrl(null);
    }
  }, [file, existingImageUrl, value]);

  const handleSelectedFile = (selectedFile: File) => {
    setLocalError(null);

    // Validasi tipe file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(selectedFile.type)) {
      setLocalError('Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.');
      return;
    }

    // Validasi ukuran (maksimal 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setLocalError('Ukuran file melebihi batas maksimal 5MB.');
      return;
    }

    if (onChangeFile) {
      onChangeFile(selectedFile);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleSelectedFile(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (onChangeFile) {
      onChangeFile(null);
    }
    if (onRemoveExisting) {
      onRemoveExisting();
    }
    if (onChange) {
      onChange('');
    }
    setPreviewUrl(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const activeError = localError || parentError;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 block">
          {label}
        </label>
        <span className="text-[11px] text-slate-600 font-medium">
          Maks. 5MB (JPG, PNG, WEBP)
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={onFileInputChange}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-900 shadow-xs group transition-all">
          <div className="relative w-full h-48 sm:h-52 bg-slate-100 flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Pratinjau Foto Kamar"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80';
              }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
          </div>

          {/* Top action badge and remove button */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] text-white font-medium flex items-center gap-1.5 shadow-xs">
              {file ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Foto Baru Terpilih</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5 text-teal-300" />
                  <span>Foto Kamar Tersimpan</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md transition-colors cursor-pointer shadow-md"
              title="Hapus foto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom metadata and change button */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <div className="max-w-[70%]">
              {file ? (
                <div>
                  <p className="text-xs font-semibold truncate drop-shadow-sm">{file.name}</p>
                  <p className="text-[10px] text-slate-300">{formatFileSize(file.size)}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-200 drop-shadow-sm">Foto siap ditampilkan di katalog publik</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-900 text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-700" />
              <span>Ganti</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative w-full h-40 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 cursor-pointer text-center group ${
            dragActive
              ? 'border-teal-600 bg-teal-50/50 scale-[1.01]'
              : 'border-slate-200 hover:border-teal-500 bg-slate-50/60 hover:bg-teal-50/20'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center text-teal-600 transition-colors mb-2.5">
            <UploadCloud className="w-6 h-6 stroke-[1.8]" />
          </div>
          <p className="text-xs font-semibold text-slate-800 mb-0.5">
            Klik untuk memilih berkas foto atau seret ke sini
          </p>
          <p className="text-[11px] text-slate-600">
            Unggah foto ruangan kamar beresolusi jelas untuk menarik calon penyewa
          </p>
        </div>
      )}

      {activeError && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600 pt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{activeError}</span>
        </div>
      )}
    </div>
  );
};
