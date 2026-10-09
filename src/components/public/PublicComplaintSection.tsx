'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  UploadCloud, 
  X, 
  Wrench, 
  Sparkles, 
  ShieldAlert, 
  Zap, 
  HelpCircle,
  MessageSquareQuote,
  Send,
  Building2,
  Lock
} from 'lucide-react';
import { Property, PublicComplaintCategory } from '@/lib/types';

interface CategoryOption {
  value: PublicComplaintCategory;
  label: string;
  desc: string;
  icon: React.ElementType;
}

const CATEGORIES: CategoryOption[] = [
  {
    value: 'fasilitas_rusak',
    label: 'Fasilitas Rusak',
    desc: 'Kerusakan keran, pintu, AC, kasur, lemari, dsb.',
    icon: Wrench,
  },
  {
    value: 'kebersihan',
    label: 'Kebersihan',
    desc: 'Sampah, koridor kotor, dapur umum, area jemuran.',
    icon: Sparkles,
  },
  {
    value: 'keamanan',
    label: 'Keamanan',
    desc: 'Pintu gerbang, tamu tak dikenal, parkir, ketertiban.',
    icon: ShieldAlert,
  },
  {
    value: 'air_listrik',
    label: 'Air / Listrik',
    desc: 'Air mati, pompa mati, MCB jeglek, lampu padam.',
    icon: Zap,
  },
  {
    value: 'lainnya',
    label: 'Lainnya',
    desc: 'Pertanyaan umum atau kendala seputar lingkungan kos.',
    icon: HelpCircle,
  },
];

export function PublicComplaintSection() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProps, setIsLoadingProps] = useState(false);

  // Form State
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [category, setCategory] = useState<PublicComplaintCategory>('fasilitas_rusak');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [agree, setAgree] = useState(false);

  // Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ id: string; reporterName: string } | null>(null);

  // Load properties for dropdown
  useEffect(() => {
    async function loadProperties() {
      setIsLoadingProps(true);
      try {
        const res = await fetch('/api/proxy/public/properties');
        if (res.ok) {
          const json = await res.json();
          setProperties(json.data || []);
        }
      } catch (err) {
        console.error('Gagal mengambil daftar properti untuk form aduan:', err);
      } finally {
        setIsLoadingProps(false);
      }
    }

    loadProperties();
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);

    if (photos.length + selected.length > 3) {
      setErrorMsg('Maksimal hanya 3 foto yang dapat dilampirkan.');
      return;
    }

    setErrorMsg(null);
    const newPhotos = [...photos, ...selected].slice(0, 3);
    setPhotos(newPhotos);

    // Generate previews
    const newPreviews = newPhotos.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(newPreviews);
  };

  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);

    // Revoke old URL
    if (photoPreviews[index]) {
      URL.revokeObjectURL(photoPreviews[index]);
    }
    const updatedPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotoPreviews(updatedPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!reporterName.trim() || reporterName.trim().length < 3) {
      setErrorMsg('Nama lengkap minimal 3 karakter.');
      return;
    }

    if (!reporterPhone.trim() || reporterPhone.trim().length < 10) {
      setErrorMsg('Nomor telepon / WhatsApp minimal 10 digit.');
      return;
    }

    if (!description.trim() || description.trim().length < 15) {
      setErrorMsg('Deskripsi kendala minimal 15 karakter agar pengelola mudah memahami.');
      return;
    }

    if (!agree) {
      setErrorMsg('Harap centang persetujuan validitas laporan sebelum mengirim.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('reporter_name', reporterName.trim());
      formData.append('reporter_phone', reporterPhone.trim());
      if (propertyId) {
        formData.append('property_id', propertyId);
      }
      if (roomNumber.trim()) {
        formData.append('room_number', roomNumber.trim());
      }
      formData.append('category', category);
      formData.append('description', description.trim());

      photos.forEach((file) => {
        formData.append('photos[]', file);
      });

      const res = await fetch('/api/proxy/public/complaints', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Gagal mengirim aduan. Periksa kembali isian formulir.');
      }

      setSuccessData({
        id: json.data?.id || 'SUBMITTED',
        reporterName: reporterName.trim(),
      });

      // Reset form
      setReporterName('');
      setReporterPhone('');
      setPropertyId('');
      setRoomNumber('');
      setCategory('fasilitas_rusak');
      setDescription('');
      setPhotos([]);
      setPhotoPreviews([]);
      setAgree(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat mengirim aduan.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="aduan" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Decorative Glow Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-3">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            Layanan Pengaduan & Respon Cepat
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Ada Kendala di Lingkungan Kos?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Laporkan kendala fasilitas, kebersihan, atau keamanan langsung ke pengelola tanpa perlu login. Tim kami siap merespons via WhatsApp.
          </p>
        </div>

        {/* Success Card */}
        {successData ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-800/90 border border-emerald-500/30 text-center max-w-2xl mx-auto backdrop-blur-xl shadow-2xl space-y-5 animate-in fade-in duration-500">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Aduan Anda Berhasil Diterima!
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Terima kasih, <strong className="text-white">{successData.reporterName}</strong>. Laporan kendala Anda telah diteruskan ke pengelola kos dan akan segera ditindaklanjuti.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 max-w-sm mx-auto text-xs text-slate-400">
              <span className="block text-slate-500 font-mono text-[10px] uppercase tracking-wider mb-1">Kode Tiket Aduan</span>
              <span className="font-mono text-emerald-400 font-bold tracking-wider">{successData.id.slice(0, 18)}...</span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSuccessData(null)}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs tracking-wide transition-all shadow-lg"
              >
                Kirim Aduan Lain
              </button>
            </div>
          </div>
        ) : (
          /* Complaint Form Card */
          <div className="rounded-3xl bg-slate-800/60 border border-slate-700/60 p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                <p className="leading-relaxed">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Nama Lengkap <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Nomor WhatsApp / HP <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Pengelola akan menghubungi via WhatsApp ini untuk konfirmasi status.
                  </p>
                </div>
              </div>

              {/* Property & Room Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Lokasi Kosan / Gedung
                  </label>
                  <div className="relative">
                    <select
                      value={propertyId}
                      onChange={(e) => setPropertyId(e.target.value)}
                      disabled={isLoadingProps}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">-- Pilih Kosan (Opsional / Umum) --</option>
                      {properties.map((prop) => (
                        <option key={prop.id} value={prop.id}>
                          {prop.name} ({prop.city || prop.address})
                        </option>
                      ))}
                    </select>
                    <Building2 className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    No. Kamar / Unit
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="Misal: 102 / P03"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all"
                  />
                </div>
              </div>

              {/* Category Radio Cards */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-3">
                  Kategori Kendala <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.value;
                    return (
                      <button
                        type="button"
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-950/80 border-teal-400 text-white shadow-lg shadow-teal-500/10 ring-1 ring-teal-400'
                            : 'bg-slate-900/70 border-slate-700/80 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-400'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{cat.label}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{cat.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Jelaskan Kendala Secara Detail <span className="text-rose-400">*</span>
                  </label>
                  <span className={`text-[11px] font-mono ${description.length < 15 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {description.length}/2000 {description.length < 15 ? '(min. 15 char)' : ''}
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan dengan jelas apa kendala yang dialami, sejak kapan, atau letak persisnya..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all leading-relaxed"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Lampiran Foto Bukti Kendala (Opsional, Maks 3 Foto)
                </label>

                {photos.length < 3 && (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-teal-400/60 rounded-2xl bg-slate-900/50 cursor-pointer transition-all hover:bg-slate-900/80 group">
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-teal-400 transition-colors mb-2" />
                    <p className="text-xs font-semibold text-slate-300">
                      Klik untuk pilih foto atau seret ke sini
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Format JPG, PNG, atau WebP (Maks 3 MB per foto)
                    </p>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Photo Previews */}
                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {photoPreviews.map((preview, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-700 h-24 sm:h-28 bg-slate-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preview}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-all shadow-md"
                          title="Hapus foto ini"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Declaration Checkbox */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-700/60">
                <input
                  type="checkbox"
                  id="agree-checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-600 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="agree-checkbox" className="text-xs text-slate-300 leading-relaxed cursor-pointer select-none">
                  Saya menyatakan bahwa informasi kendala di atas adalah benar dan bersedia dihubungi oleh tim pengelola kos melalui nomor WhatsApp untuk tindak lanjut penyelesaian.
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-teal-400" />
                  <span>Data privasi Anda terjaga dan hanya digunakan untuk tindak lanjut aduan.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white gradient-emerald-glow shadow-emerald-glow hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim Aduan...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim Aduan Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
