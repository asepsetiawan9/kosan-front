'use client';

import React, { useState } from 'react';
import { Room } from '@/lib/types';
import { formatRupiah } from '@/lib/api';
import { BookingSuccessCard } from './BookingSuccessCard';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  UploadCloud, 
  FileCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Building
} from 'lucide-react';

interface BookingModalFormProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BookingModalForm: React.FC<BookingModalFormProps> = ({
  room,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [ktpPreviewUrl, setKtpPreviewUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setErrorMessage('Ukuran file KTP tidak boleh melebihi 3 MB.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Format file harus berupa JPG, PNG, atau PDF.');
      return;
    }

    setErrorMessage(null);
    setKtpFile(file);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setKtpPreviewUrl(url);
    } else {
      setKtpPreviewUrl(null);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (step === 1) {
      if (!name.trim() || !phone.trim()) {
        setErrorMessage('Nama lengkap dan nomor WhatsApp wajib diisi.');
        return;
      }
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!moveInDate) {
      setErrorMessage('Pilih rencana tanggal masuk kos.');
      return;
    }

    if (!ktpFile) {
      setErrorMessage('Wajib melampirkan foto/dokumen KTP untuk verifikasi identitas.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('room_id', room.id);
      formData.append('name', name);
      formData.append('phone', phone);
      if (email.trim()) {
        formData.append('email', email);
      }
      formData.append('requested_move_in', moveInDate);
      formData.append('ktp_file', ktpFile);

      const response = await fetch('/api/proxy/public/bookings', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg = data.message || 'Gagal mengajukan booking. Periksa kembali data Anda.';
        throw new Error(msg);
      }

      setStep(3);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setStep(1);
    setName('');
    setPhone('');
    setEmail('');
    setMoveInDate('');
    setKtpFile(null);
    if (ktpPreviewUrl) {
      URL.revokeObjectURL(ktpPreviewUrl);
      setKtpPreviewUrl(null);
    }
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-emerald-glow text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Pengajuan Sewa Kamar
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {room.room_number} • {room.name} ({formatRupiah(room.base_price)}/bln)
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Step Indicators */}
        {step !== 3 && (
          <div className="px-6 pt-4 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <div
                className={`flex items-center gap-1.5 ${
                  step === 1 ? 'text-teal-800' : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 1 ? 'bg-teal-700 text-white font-bold' : 'bg-slate-200 text-slate-600'
                }`}>
                  1
                </span>
                <span>Data Diri</span>
              </div>
              <div className="h-0.5 flex-1 bg-slate-200" />
              <div
                className={`flex items-center gap-1.5 ${
                  step === 2 ? 'text-teal-800' : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 2 ? 'bg-teal-700 text-white font-bold' : 'bg-slate-200 text-slate-600'
                }`}>
                  2
                </span>
                <span>Jadwal & KTP</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Lengkap Sesuai KTP <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rian Kurniawan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 08123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all placeholder:text-slate-400"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Status persetujuan dan aktivasi akun akan dikirimkan langsung ke nomor ini.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alamat Email (Opsional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-emerald-glow hover:opacity-95 shadow-xs transition-all"
                >
                  Langkah Selanjutnya
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Move-in Date & KTP Upload */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Rencana Tanggal Masuk Kos <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Unggah Foto / Dokumen KTP Asli <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-teal-500 transition-colors bg-slate-50/50 relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <UploadCloud className="w-8 h-8 text-teal-600" />
                    <p className="text-xs font-semibold text-slate-700">
                      Klik atau seret file KTP ke sini
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Format: JPG, PNG, atau PDF (Maksimal 3 MB)
                    </p>
                  </div>
                </div>

                {/* Preview File */}
                {ktpFile && (
                  <div className="mt-3 p-3 rounded-xl bg-teal-50/60 border border-teal-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 truncate">
                      <FileCheck className="w-4 h-4 text-teal-700 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">{ktpFile.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {(ktpFile.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                    {ktpPreviewUrl && (
                      <img
                        src={ktpPreviewUrl}
                        alt="Preview KTP"
                        className="w-12 h-8 object-cover rounded-md border border-teal-300"
                      />
                    )}
                  </div>
                )}
                <p className="text-[11px] text-slate-400 mt-1.5">
                  * Berkas KTP Anda disimpan secara privat dan hanya digunakan untuk verifikasi identitas pengelola kos.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-emerald-glow hover:opacity-95 shadow-xs transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Mengirim Permohonan...
                    </>
                  ) : (
                    <>
                      Kirim Permohonan Sewa
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: BookingSuccessCard */}
          {step === 3 && (
            <BookingSuccessCard
              room={room}
              name={name}
              phone={phone}
              moveInDate={moveInDate}
              onClose={handleResetAndClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};
