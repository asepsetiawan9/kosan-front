'use client';

import React, { useState } from 'react';
import { 
  Wrench, 
  Sparkles, 
  ShieldAlert, 
  HelpCircle, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { ComplaintCategory } from '@/lib/types';

const categories: { id: ComplaintCategory; label: string; desc: string; icon: React.ElementType }[] = [
  {
    id: 'fasilitas_rusak',
    label: 'Fasilitas Rusak',
    desc: 'AC, keran bocor, lampu mati, pintu rusak, shower',
    icon: Wrench,
  },
  {
    id: 'kebersihan',
    label: 'Kebersihan',
    desc: 'Sampah lorong, area dapur kotor, debu koridor',
    icon: Sparkles,
  },
  {
    id: 'keamanan',
    label: 'Keamanan',
    desc: 'Kunci gerbang, tamu mencurigakan, kebisingan malam',
    icon: ShieldAlert,
  },
  {
    id: 'lainnya',
    label: 'Lainnya',
    desc: 'Keluhan lain di luar kategori di atas',
    icon: HelpCircle,
  },
];

interface ComplaintFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({
  onSubmit,
  isSubmitting = false,
  errorMessage: initialErrorMessage = null,
}) => {
  const [category, setCategory] = useState<ComplaintCategory>('fasilitas_rusak');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState(initialErrorMessage || '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setErrorMessage('Ukuran file foto maksimal 3MB.');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setErrorMessage('');
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (description.trim().length < 10) {
      setErrorMessage('Deskripsi keluhan minimal 10 karakter agar pengelola dapat memahami masalah dengan jelas.');
      return;
    }

    const formData = new FormData();
    formData.append('category', category);
    formData.append('description', description);
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    try {
      await onSubmit(formData);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal mengirim tiket aduan.');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-card p-6 md:p-8">
      {(errorMessage || initialErrorMessage) && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage || initialErrorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Picker */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Pilih Kategori Kendala
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/15'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{cat.label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{cat.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description Textarea */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Deskripsi Detail Keluhan
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan kendala fasilitas yang Anda alami (misal: AC tidak dingin sejak semalam, keluar tetesan air di bawah unit)..."
            className="w-full p-4 bg-slate-50/70 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 transition-all outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">Minimal 10 karakter.</p>
        </div>

        {/* Photo Dropzone / Uploader */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Lampiran Foto Bukti (Opsional)
          </label>

          {photoPreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-w-xs bg-slate-100">
              <img src={photoPreview} alt="Preview Bukti" className="w-full h-48 object-cover" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-700">Klik untuk unggah foto bukti</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Format JPG, PNG, atau WEBP (Maksimal 3MB)</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Mengirim Tiket Aduan...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Kirim Tiket Aduan ke Pengelola</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
