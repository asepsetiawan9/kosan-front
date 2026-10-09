'use client';

import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Star, AlertCircle, Loader2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { extractYouTubeId } from '@/components/ui/VideoPlayer';

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

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
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const detectedYouTubeId = extractYouTubeId(youtubeUrl);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setErrorMessage(null);

    // Validasi tipe berkas hanya gambar (JPG, PNG, WebP)
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validImageTypes.includes(selected.type)) {
      setErrorMessage('Format file tidak didukung. Unggah gambar JPG, PNG, atau WEBP.');
      return;
    }

    if (selected.size > 5242880) {
      setErrorMessage('Ukuran file foto maksimal 5MB.');
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
    setErrorMessage(null);

    if (activeTab === 'image' && !file) {
      setErrorMessage('Silakan pilih berkas foto yang ingin diunggah terlebih dahulu.');
      return;
    }

    if (activeTab === 'video') {
      if (!youtubeUrl.trim()) {
        setErrorMessage('Silakan masukkan tautan video YouTube.');
        return;
      }
      if (!detectedYouTubeId) {
        setErrorMessage('Format tautan YouTube tidak valid. Gunakan format https://www.youtube.com/watch?v=... atau https://youtu.be/...');
        return;
      }
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('media_type', activeTab);

      if (activeTab === 'image' && file) {
        formData.append('file', file);
      } else if (activeTab === 'video') {
        formData.append('youtube_url', youtubeUrl.trim());
      }

      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      if (title.trim()) formData.append('title', title.trim());
      if (description.trim()) formData.append('description', description.trim());
      formData.append('is_featured', isFeatured ? '1' : '0');

      const response = await fetch(`/api/proxy/admin/properties/${propertyId}/media`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan media properti.');
      }

      // Reset form
      setFile(null);
      setYoutubeUrl('');
      setThumbnail(null);
      setTitle('');
      setDescription('');
      setIsFeatured(false);
      setPreviewUrl(null);

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat menyimpan media.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Media Iklan Properti" maxWidth="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Switcher: Foto vs Video YouTube */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setActiveTab('image');
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'image'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Unggah Foto Properti</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('video');
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'video'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <YoutubeIcon className="w-4 h-4 text-rose-600" />
            <span>Tautkan Video YouTube</span>
          </button>
        </div>

        {/* TAB 1: UPLOAD FOTO */}
        {activeTab === 'image' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Berkas Foto Properti <span className="text-rose-500">*</span>
            </label>

            {!file ? (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-teal-50/20 transition-all duration-200 group">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 group-hover:bg-teal-100 text-teal-600 flex items-center justify-center mb-3 transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  Klik untuk memilih foto atau seret ke sini
                </p>
                <p className="text-[11px] text-slate-500 mt-1 text-center">
                  Format gambar JPG, PNG, atau WebP (Maksimal 5MB)
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 p-3">
                <div className="flex items-center justify-between text-white pb-2 mb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs truncate">
                    <ImageIcon className="w-4 h-4 text-teal-400" />
                    <span className="font-semibold truncate max-w-[200px]">{file.name}</span>
                    <span className="text-slate-400">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {previewUrl && (
                  <div className="relative h-44 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Pratinjau Foto"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LINK VIDEO YOUTUBE (TIDAK ADA UPLOAD VIDEO) */}
        {activeTab === 'video' && (
          <div className="space-y-3">
            <Input
              label="Tautan / Link Video YouTube *"
              placeholder="Contoh: https://www.youtube.com/watch?v=dQw4w9WgXcQ atau https://youtu.be/..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />

            {/* Live Interactive YouTube Preview */}
            {detectedYouTubeId ? (
              <div className="rounded-2xl border border-rose-200/90 bg-rose-50/40 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tautan Terverifikasi (ID: {detectedYouTubeId})</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    Autoplay Siap
                  </span>
                </div>

                <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-md bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${detectedYouTubeId}?autoplay=0&controls=1&rel=0`}
                    title="Pratinjau YouTube"
                    className="w-full h-full border-0 absolute inset-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  ✨ Video ini akan <strong>otomatis terputar secara mulus</strong> di bagian <em>Virtual Tour</em> pada halaman publik untuk menarik pengunjung.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start gap-2.5">
                <YoutubeIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  Masukkan tautan video YouTube properti (misal: tur gedung, suasana kamar, fasilitas). Pengunggahan berkas video mentah ditiadakan agar performa halaman tetap sangat cepat dan hemat bandwidth hosting.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input Judul & Deskripsi Media */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Judul Media (Opsional)"
            placeholder="Contoh: Virtual Tour Fasilitas Bersama"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Opsi Custom Thumbnail */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Thumbnail Kustom (Opsional)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleThumbnailChange}
              className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer w-full text-slate-600"
            />
            {thumbnail && (
              <span className="text-[10px] text-emerald-600 mt-0.5 block truncate">
                Thumbnail dipilih: {thumbnail.name}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Deskripsi (Opsional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan detail sudut ruangan atau area yang ditampilkan..."
            className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Checkbox Unggulan / Featured */}
        <label className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/60 border border-amber-200 cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300"
          />
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Tampilkan Sebagai Media Unggulan di Beranda Publik</span>
          </div>
        </label>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" disabled={isLoading} className="cursor-pointer">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>Simpan Media</span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
