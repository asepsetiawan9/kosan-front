'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Calendar, CheckCircle2, Receipt } from 'lucide-react';
import { formatRupiah } from '@/lib/api';
import { Invoice } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface ActiveBillCardProps {
  invoice?: Invoice | null;
  totalUnpaid?: number;
}

export const ActiveBillCard: React.FC<ActiveBillCardProps> = ({ invoice, totalUnpaid = 0 }) => {
  if (!invoice) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-emerald-100/50 border border-emerald-200/80 shadow-soft-card flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-950">Semua Tagihan Sudah Lunas</h3>
            <p className="text-sm text-emerald-700">Terima kasih telah membayar sewa tepat waktu! Hunian Anda aktif tanpa tunggakan.</p>
          </div>
        </div>
        <Link
          href="/portal/invoices"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-50 transition-colors shrink-0"
        >
          Lihat Riwayat
        </Link>
      </div>
    );
  }

  const remaining = Number(invoice.total_amount) - Number(invoice.paid_amount);

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-amber-100/60 border border-amber-200/80 shadow-soft-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200 shrink-0 mt-1">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Tagihan Jatuh Tempo Terdekat</span>
              <StatusBadge status={invoice.status} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatRupiah(remaining > 0 ? remaining : invoice.total_amount)}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
              <span className="flex items-center gap-1 font-medium">
                <Receipt className="w-3.5 h-3.5 text-amber-700" />
                No. {invoice.invoice_number}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                Jatuh Tempo: <strong className="text-slate-800">{invoice.due_date}</strong>
              </span>
              <span>•</span>
              <span>Periode: {invoice.period}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          <Link
            href={`/portal/invoices/${invoice.id}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-md shadow-indigo-200 transition-all"
          >
            <span>Rincian Tagihan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
