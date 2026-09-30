'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { Payment } from '@/lib/types';

interface WaPaymentRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  onSubmit: (reason: string) => Promise<void>;
  isSubmitting?: boolean;
}

const PRESET_REASONS = [
  'Nominal di struk transfer buram / tidak terbaca dengan jelas.',
  'Nama rekening pengirim tidak cocok dengan nama penghuni terdaftar.',
  'Nominal yang ditransfer kurang dari total tagihan sewa berjalan.',
  'Bukti transfer terindikasi palsu atau editan.',
  'Mutasi dana belum masuk ke rekening bank pengelola kos.',
];

export const WaPaymentRejectModal: React.FC<WaPaymentRejectModalProps> = ({
  isOpen,
  onClose,
  payment,
  onSubmit,
  isSubmitting = false,
}) => {
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen || !payment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Alasan penolakan wajib diisi agar penghuni mengetahui alasan dan dapat mengirimkan bukti yang benar.');
      return;
    }

    try {
      await onSubmit(reason.trim());
      setReason('');
      setError('');
      onClose();
    } catch {
      // handled by caller
    }
  };

  const handleSelectPreset = (preset: string) => {
    setReason(preset);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 bg-rose-50/60">
          <div className="flex items-center gap-2.5 text-rose-800">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Tolak Bukti Pembayaran</h3>
              <p className="text-xs text-rose-700">Notifikasi penolakan otomatis terkirim via WhatsApp</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Penghuni:</span>
              <strong className="text-slate-800">{payment.invoice?.tenancy?.tenant_name ?? 'Penghuni'}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Kamar:</span>
              <strong className="text-slate-800">{payment.invoice?.tenancy?.room?.room_number ?? '-'}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tagihan:</span>
              <strong className="text-slate-800">
                {payment.invoice?.invoice_number} ({payment.invoice?.period})
              </strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Nominal:</span>
              <strong className="text-emerald-700">
                Rp {new Intl.NumberFormat('id-ID').format(payment.amount)}
              </strong>
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih Alasan Cepat (Preset):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_REASONS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer text-left ${
                    reason === p
                      ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alasan Penolakan <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (e.target.value.trim()) setError('');
              }}
              placeholder="Tuliskan alasan penolakan secara jelas dan santun..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
            {error && <p className="text-[11px] font-medium text-rose-600 mt-1">{error}</p>}
          </div>

          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
            ℹ️ Penghuni akan menerima pesan WhatsApp dengan template <code>proof_rejected</code> yang memuat alasan di atas dan instruksi untuk mengirimkan bukti ulang yang sah.
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Memproses...' : 'Tolak & Kirim WA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
