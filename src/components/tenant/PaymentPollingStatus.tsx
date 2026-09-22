'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { Invoice } from '@/lib/types';

interface PaymentPollingStatusProps {
  invoiceId: string;
  initialStatus: string;
  onStatusChanged?: (invoice: Invoice) => void;
}

export const PaymentPollingStatus: React.FC<PaymentPollingStatusProps> = ({
  invoiceId,
  initialStatus,
  onStatusChanged,
}) => {
  const [currentStatus, setCurrentStatus] = useState<string>(initialStatus);
  const [pollCount, setPollCount] = useState<number>(0);

  useEffect(() => {
    // Stop polling if final status reached
    if (['lunas', 'dibatalkan'].includes(currentStatus)) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await apiRequest<{ data: Invoice }>(`/tenant/invoices/${invoiceId}`);
        if (res.data) {
          if (res.data.status !== currentStatus) {
            setCurrentStatus(res.data.status);
            onStatusChanged?.(res.data);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      } finally {
        setPollCount((prev) => prev + 1);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [invoiceId, currentStatus, onStatusChanged]);

  if (currentStatus === 'lunas') {
    return (
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800">
        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
        <div>
          <h4 className="text-xs font-bold text-emerald-900">Pembayaran Berhasil Diverifikasi!</h4>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            Tagihan Anda telah lunas sepenuhnya. Kwitansi digital telah diperbarui.
          </p>
        </div>
      </div>
    );
  }

  if (currentStatus === 'menunggu_verifikasi') {
    return (
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-900">
        <Clock className="w-6 h-6 text-amber-600 shrink-0 animate-pulse" />
        <div>
          <h4 className="text-xs font-bold text-amber-900">Menunggu Verifikasi Pengelola</h4>
          <p className="text-[11px] text-amber-700 mt-0.5">
            Bukti transfer telah diterima. Admin sedang memeriksa mutasi rekening Anda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-500">
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
        <span>Memantau status pembayaran secara berkala...</span>
      </div>
      <span className="text-[10px] text-slate-400 font-mono">Sync #{pollCount}</span>
    </div>
  );
};
