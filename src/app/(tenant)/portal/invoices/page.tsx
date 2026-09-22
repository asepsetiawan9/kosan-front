'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Receipt, Calendar, ArrowRight, Filter, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiRequest, formatRupiah } from '@/lib/api';
import { Invoice } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function TenantInvoicesPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ['tenant-invoices', statusFilter],
    queryFn: async () => {
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await apiRequest<{ data: Invoice[] }>(`/tenant/invoices${query}`);
      return res.data;
    },
  });

  const filterTabs = [
    { id: 'all', label: 'Semua Tagihan' },
    { id: 'belum_bayar', label: 'Belum Bayar' },
    { id: 'lunas', label: 'Lunas' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tagihan Sewa Kamar</h1>
          <p className="text-sm text-slate-500 mt-1">
            Riwayat tagihan bulanan, rincian biaya sewa, uang jaminan, dan bukti kwitansi.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Invoices List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Memuat data tagihan...</div>
      ) : !invoices || invoices.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center shadow-soft-card">
          <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-800 text-base">Tidak Ada Tagihan Ditemukan</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {statusFilter === 'all'
              ? 'Belum ada tagihan yang diterbitkan untuk masa sewa Anda saat ini.'
              : `Tidak ada tagihan dengan status "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invoices.map((inv) => {
            const isUnpaid = inv.status === 'belum_bayar' || inv.status === 'terlambat';
            const remaining = Number(inv.total_amount) - Number(inv.paid_amount);

            return (
              <div
                key={inv.id}
                className={`p-5 rounded-2xl bg-white border transition-all shadow-soft-card flex flex-col justify-between ${
                  isUnpaid ? 'border-amber-200 hover:border-amber-400' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Periode {inv.period}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base">{inv.invoice_number}</h4>
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>

                  <div className="my-3 py-3 border-y border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-400">Total Biaya Tagihan</p>
                      <p className="text-lg font-extrabold text-slate-900">{formatRupiah(inv.total_amount)}</p>
                    </div>
                    {inv.paid_amount > 0 && inv.paid_amount < inv.total_amount && (
                      <div className="text-right">
                        <p className="text-[11px] text-amber-700 font-semibold">Sisa Tagihan</p>
                        <p className="text-sm font-bold text-amber-900">{formatRupiah(remaining)}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Jatuh Tempo:</span>
                    <strong className="text-slate-800">{inv.due_date}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/portal/invoices/${inv.id}`}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Rincian</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {inv.status !== 'lunas' && (
                    <Link
                      href={`/portal/invoices/${inv.id}/pay`}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>Bayar</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      )}
    </div>
  );
}
