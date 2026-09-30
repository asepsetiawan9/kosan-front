'use client';

import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Video, Star, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface PropertyMediaUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  onSuccess: () => void;
}

export function PropertyMediaUploader({
  isOpen,
  onClose,
  propertyId,
  onSuccess,
}: PropertyMediaUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setErrorMessage(null);
    const isVid = selected.type.startsWith('video/');
    setMediaType(isVid ? 'video' : 'image');

    // Check size limit: image max 5MB, video max 50MB
    if (isVid && selected.size > 52428800) {
      setErrorMessage('Ukuran file video maksimal 50MB.');
      return;
    }
    if (!isVid && selected.size > 5242880) {
      setErrorMessage('Ukuran file gambar maksimal 5MB.');
      return;
    }

    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 5242880) {
      setErrorMessage('Ukuran file thumbnail maksimal 5MB.');
      return;
    }
    setThumbnail(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Silakan pilih berkas foto atau video terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }
      formData.append('media_type', mediaType);
      if (title) formData.append('title', title);
      if (description) formData.append('description', description);
      formData.append('is_featured', isFeatured ? '1' : '0');

      const response = await fetch(`/api/proxy/admin/properties/${propertyId}/media`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengunggah media properti.');
      }

      // Reset form
      setFile(null);
      setThumbnail(null);
      setTitle('');
      setDescription('');
      setIsFeatured(false);
      setPreviewUrl(null);

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat mengunggah media.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Unggah Media Iklan Properti">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Dropzone Upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Pilih Berkas Foto atau Video <span className="text-rose-500">*</span>
          </label>

          {!file ? (
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-teal-400 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-teal-50/20 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 group-hover:bg-teal-100 text-teal-600 flex items-center justify-center mb-3 transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Klik untuk memilih berkas atau seret ke sini
              </p>
              <p className="text-[11px] text-slate-400 mt-1 text-center">
                Mendukung Foto (JPG, PNG, WebP maks 5MB) dan Video (MP4, WebM maks 50MB)
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 p-3">
              <div className="flex items-center justify-between text-white pb-2 mb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs truncate">
                  {mediaType === 'video' ? <Video className="w-4 h-4 text-teal-400" /> : <ImageIcon className="w-4 h-4 text-teal-400" />}
                  <span className="font-semibold truncate max-w-[200px]">{file.name}</span>
                  <span className="text-slate-400">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                  className="p-1 rounded-lg bg-white/10 hover:bg-rose-500/80 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {previewUrl && (
                <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
                  {mediaType === 'video' ? (
                    <video src={previewUrl} controls className="w-full h-full object-contain" />
                  ) : (
                    <img src={previewUrl} alt="Pratinjau" className="w-full h-full object-cover" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Thumbnail Optional for Video */}
        {mediaType === 'video' && file && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Poster / Thumbnail Video (Opsional)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleThumbnailChange}
              className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
            {thumbnail && (
              <p className="text-[11px] text-emerald-600 mt-1">
                Thumbnail terpilih: {thumbnail.name}
              </p>
            )}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Judul Media (Opsional)
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="cth: Tampak Depan Gedung / Video Tur Lantai 1"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Deskripsi Keterangan (Opsional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Keterangan singkat tentang foto/video promosi ini..."
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Featured Switch */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2">
            <Star className={`w-4 h-4 ${isFeatured ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Jadikan Iklan Utama (Featured)</span>
              <span className="text-[11px] text-slate-500 block">Tampil di hero katalog dan kartu properti</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500"
          />
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" disabled={isLoading || !file}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Mengunggah...
              </>
            ) : (
              'Unggah Media'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
