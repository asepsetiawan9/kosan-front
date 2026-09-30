'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, UploadCloud, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { Invoice } from '@/lib/types';

interface WaManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const WaManualPaymentModal: React.FC<WaManualPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [autoApprove, setAutoApprove] = useState<boolean>(true);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Fetch unpaid/active invoices
  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery<{ data: Invoice[] }>({
    queryKey: ['unpaid-invoices-for-manual-pay'],
    queryFn: async () => {
      return apiRequest<{ data: Invoice[] }>('/admin/invoices?per_page=100');
    },
    enabled: isOpen,
  });

  const unpaidInvoices = (invoicesData?.data || []).filter((inv) =>
    ['belum_bayar', 'sebagian_dibayar', 'terlambat', 'menunggu_verifikasi'].includes(inv.status)
  );

  if (!isOpen) return null;

  const handleInvoiceChange = (invId: string) => {
    setSelectedInvoiceId(invId);
    setError('');
    const found = unpaidInvoices.find((i) => i.id === invId);
    if (found) {
      const remaining = Math.max(0, found.total_amount - (found.paid_amount || 0));
      setAmount(remaining.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      setError('Pilih tagihan yang akan dibayarkan.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Masukkan nominal pembayaran yang valid.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('invoice_id', selectedInvoiceId);
      formData.append('amount', numAmount.toString());
      if (notes.trim()) formData.append('notes', notes.trim());
      formData.append('auto_approve', autoApprove ? '1' : '0');
      if (file) {
        formData.append('proof_file', file);
      }

      await apiRequest('/admin/wa/payments/manual', {
        method: 'POST',
        body: formData,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mencatat pembayaran manual.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h3 className="text-base font-bold text-slate-900">Catat Pembayaran Manual</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Input pembayaran tunai/admin langsung ke sistem (source: manual_admin)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* Select Invoice */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pilih Tagihan Penghuni <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              disabled={isLoadingInvoices}
            >
              <option value="">-- Pilih Tagihan Aktif --</option>
              {unpaidInvoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_number} — {inv.tenancy?.tenant_name} (Kamar {inv.tenancy?.room?.room_number ?? '-'}) — Rp{' '}
                  {new Intl.NumberFormat('id-ID').format(inv.total_amount - (inv.paid_amount || 0))}
                </option>
              ))}
            </select>
          </div>

          {/* Nominal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nominal Diterima (Rp) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1000"
              step="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Contoh: 1500000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Proof File (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Unggah Foto Kwitansi / Struk (Opsional)
            </label>
            <div className="relative border border-dashed border-slate-200 hover:border-teal-500 rounded-xl p-3 text-center transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-1 text-slate-500 text-xs">
                <UploadCloud className="w-5 h-5 text-teal-600" />
                {file ? (
                  <span className="font-semibold text-slate-800">{file.name}</span>
                ) : (
                  <span>Pilih berkas foto/PDF kwitansi (Maks 5MB)</span>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Admin (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Titip uang cash via pengelola kos"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Auto Approve Checkbox */}
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={autoApprove}
              onChange={(e) => setAutoApprove(e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800">Verifikasi Lunas Langsung</span>
              <p className="text-[11px] text-slate-500">
                Otomatis tandai status pembayaran lunas dan perbarui saldo invoice.
              </p>
            </div>
          </label>

          {/* Actions */}
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-emerald-glow text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Pembayaran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
