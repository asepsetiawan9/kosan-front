'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, FileText, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { Payment } from '@/lib/types';
import { apiRequest, formatRupiah } from '@/lib/api';

interface PaymentReceiptModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  payment,
  isOpen,
  onClose,
  onVerified,
}) => {
  const [notes, setNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !payment) return null;

  const handleAction = async (action: 'approve' | 'reject') => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      await apiRequest(`/admin/payments/${payment.id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({
          action,
          notes: notes.trim() || undefined,
        }),
      });

      onVerified();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal memproses verifikasi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isPdf = payment.proof_url?.toLowerCase().includes('.pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
              Pemeriksaan Bukti Pembayaran
            </span>
            <h3 className="text-lg font-extrabold text-slate-900">
              {payment.invoice?.invoice_number || 'Tagihan Kos'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Tenant & Room Context */}
          <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Penyewa:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {payment.invoice?.tenancy?.tenant_name || '-'}
              </p>
              <p className="text-[11px] text-slate-500">{payment.invoice?.tenancy?.tenant_phone}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Unit Kamar:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {payment.invoice?.tenancy?.room?.room_number
                  ? `Kamar ${payment.invoice.tenancy.room.room_number}`
                  : '-'}
              </p>
              <p className="text-[11px] text-slate-500 capitalize">
                {payment.invoice?.tenancy?.room?.type}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Nominal Bukti:</span>
              <p className="font-black text-emerald-700 text-sm mt-0.5">
                {formatRupiah(payment.amount)}
              </p>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                Metode: {payment.method}
              </span>
            </div>
          </div>

          {/* Proof File Showcase */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">Lampiran Bukti Transfer</label>
              {payment.proof_url && (
                <a
                  href={payment.proof_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>Buka Tab Baru</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {payment.proof_url ? (
              isPdf ? (
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <FileText className="w-12 h-12 text-indigo-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">Dokumen Bukti Format PDF</p>
                  <a
                    href={payment.proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600"
                  >
                    <span>Lihat Dokumen PDF</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900/5 flex items-center justify-center p-2 max-h-[340px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={payment.proof_url}
                    alt="Bukti Struk Transfer"
                    className="max-h-[320px] w-auto object-contain rounded-xl shadow-sm"
                  />
                </div>
              )
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
                Tidak ada berkas bukti fisik terlampir (Transaksi Gateway).
              </div>
            )}
          </div>

          {/* Notes by Tenant (if any) */}
          {payment.notes && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-700">Catatan Pengirim:</span>
              <p className="text-slate-600 mt-0.5">{payment.notes}</p>
            </div>
          )}

          {/* Verification Notes Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Catatan Verifikasi Admin (Opsional / Alasan jika ditolak)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Bukti mutasi BCA sesuai nominal dan tanggal."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>

          {payment.status === 'pending' && (
            <>
              <button
                type="button"
                onClick={() => handleAction('reject')}
                disabled={isProcessing}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span>Tolak Pembayaran</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction('approve')}
                disabled={isProcessing}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-200 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Verifikasi Lunas</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
