'use client';

import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, AlertCircle, Save, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface NikInputProps {
  initialValue?: string | null;
  onSave: (nik: string) => Promise<void>;
  disabled?: boolean;
}

export const NikInput: React.FC<NikInputProps> = ({
  initialValue = '',
  onSave,
  disabled = false,
}) => {
  const [nik, setNik] = useState(initialValue || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialValue) {
      setNik(initialValue);
    }
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '').slice(0, 16);
    setNik(rawVal);
    setError(null);
    setIsSuccess(false);
  };

  const isValidLength = nik.length === 16;
  const isChanged = nik !== (initialValue || '');

  const handleSave = async () => {
    if (!isValidLength) {
      setError('NIK wajib terdiri dari 16 digit angka sesuai KTP.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave(nik);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan NIK.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Nomor Induk Kependudukan (NIK)
            </h3>
            <p className="text-xs text-slate-500">
              16 digit nomor KTP resmi untuk administrasi sewa kos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isValidLength ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              16 Digit Lengkap
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              {nik.length}/16 digit
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={16}
            value={nik}
            onChange={handleChange}
            placeholder="Contoh: 3201012345670001"
            disabled={disabled || isSaving}
            className={clsx(
              'w-full px-4 py-2.5 rounded-xl border text-sm font-mono tracking-widest text-slate-900 placeholder:text-slate-400 placeholder:tracking-normal transition-all focus:outline-none focus:ring-2',
              error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100 bg-rose-50/20'
                : isValidLength
                ? 'border-emerald-300 focus:border-teal-500 focus:ring-teal-100 bg-emerald-50/20'
                : 'border-slate-300 focus:border-teal-500 focus:ring-teal-100 bg-slate-50/50'
            )}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={disabled || isSaving || !isValidLength || !isChanged}
          className={clsx(
            'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 shrink-0 cursor-pointer shadow-sm',
            !isValidLength || !isChanged || disabled || isSaving
              ? 'bg-slate-300 cursor-not-allowed opacity-70'
              : 'bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 shadow-teal-200 active:scale-[0.98]'
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan NIK</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-rose-600 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isSuccess && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>NIK berhasil disimpan dan disinkronkan ke profil Anda.</span>
        </div>
      )}
    </div>
  );
};
