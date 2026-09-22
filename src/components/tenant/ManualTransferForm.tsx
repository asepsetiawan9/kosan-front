'use client';

import React, { useState, useRef } from 'react';
import { Copy, Check, Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { formatRupiah } from '@/lib/api';

interface ManualTransferFormProps {
  invoiceId: string;
  remainingAmount: number;
  onSuccess: () => void;
}

export const ManualTransferForm: React.FC<ManualTransferFormProps> = ({
  invoiceId,
  remainingAmount,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<number>(remainingAmount);
  const [notes, setNotes] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const bankAccounts = [
    { bank: 'BCA', number: '1234567890', name: 'Asep Mulyana' },
    { bank: 'Mandiri', number: '9870001234567', name: 'Asep Mulyana' },
  ];

  const handleCopy = (bank: string, num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorMsg('Ukuran file maksimal 5MB.');
        return;
      }
      setFile(selectedFile);
      setErrorMsg(null);

      if (selectedFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Silakan pilih berkas bukti transfer terlebih dahulu.');
      return;
    }

    if (amount <= 0) {
      setErrorMsg('Nominal transfer harus lebih besar dari 0.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('amount', String(amount));
      formData.append('proof_file', file);
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }

      const res = await fetch(`/api/proxy/tenant/invoices/${invoiceId}/manual-pay`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal mengirim bukti pembayaran.');
      }

      onSuccess();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Bank Account Details */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
          Rekening Tujuan Pembayaran
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {bankAccounts.map((acc) => (
            <div
              key={acc.bank}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-indigo-700">{acc.bank}</span>
                <p className="text-sm font-extrabold text-slate-900 tracking-wider mt-0.5">
                  {acc.number}
                </p>
                <p className="text-[11px] text-slate-400">a.n {acc.name}</p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(acc.bank, acc.number)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer transition-colors"
                title="Salin Nomor Rekening"
              >
                {copiedBank === acc.bank ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Disalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Nominal yang Ditransfer (Rp) <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
            Rp
          </span>
          <input
            type="number"
            min={1000}
            max={remainingAmount}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            required
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Sisa tagihan yang harus dibayar: <strong>{formatRupiah(remainingAmount)}</strong>
        </p>
      </div>

      {/* File Upload Box */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Bukti Struk Transfer (JPG, PNG, PDF maks 5MB) <span className="text-rose-500">*</span>
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/30"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              Klik untuk memilih berkas atau seret foto ke sini
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, atau PDF hingga 5MB</p>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-200 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Bukti Transfer"
                  className="w-12 h-12 rounded-xl object-cover border border-indigo-200 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                <p className="text-[11px] text-slate-400">
                  {(file.size / 1024).toFixed(0)} KB • Siap diunggah
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-2 py-1"
            >
              Ganti File
            </button>
          </div>
        )}
      </div>

      {/* Notes Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Catatan Tambahan (Nama Pengirim / Bank Asal)
        </label>
        <input
          type="text"
          placeholder="Contoh: Transfer dari Rek BCA a.n Budi"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
        />
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-indigo-200"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Mengunggah Bukti Pembayaran...</span>
          </>
        ) : (
          <span>Kirim Bukti Pembayaran</span>
        )}
      </button>
    </form>
  );
};
