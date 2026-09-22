'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Receipt, Calendar, CheckCircle2, AlertTriangle, Building, CreditCard } from 'lucide-react';
import { apiRequest, formatRupiah } from '@/lib/api';
import { Invoice } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { InvoiceLineItemsList } from '@/components/tenant/InvoiceLineItemsList';

export default function TenantInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: invoice, isLoading, isError } = useQuery<Invoice>({
    queryKey: ['tenant-invoice-detail', id],
    queryFn: async () => {
      const res = await apiRequest<{ data: Invoice }>(`/tenant/invoices/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-12 text-center text-slate-400 text-sm">Memuat detail tagihan...</div>;
  }

  if (isError || !invoice) {
    return (
      <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center shadow-soft-card max-w-lg mx-auto">
        <AlertTriangle className="w-10 h-10 mx-auto text-rose-500 mb-3" />
        <h3 className="font-bold text-slate-900 text-base">Tagihan Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 mt-1">
          Data tagihan tidak dapat diakses atau bukan milik akun Anda.
        </p>
        <Link
          href="/portal/invoices"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Tagihan</span>
        </Link>
      </div>
    );
  }

  const isLunas = invoice.status === 'lunas';
  const remaining = Number(invoice.total_amount) - Number(invoice.paid_amount);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Link */}
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Tagihan</span>
      </button>

      {/* Invoice Card Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-card overflow-hidden">
        {/* Header Ribbon */}
        <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Faktur Pembayaran</span>
              <StatusBadge status={invoice.status} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{invoice.invoice_number}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Periode Sewa: {invoice.period}</p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs text-slate-400">Batas Waktu Jatuh Tempo</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-center sm:justify-end gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>{invoice.due_date}</span>
            </p>
          </div>
        </div>

        {/* Room & Tenancy Context */}
        {invoice.tenancy && (
          <div className="p-6 border-b border-slate-100 bg-indigo-50/30 flex items-center justify-between text-xs">
            <div>
              <p className="text-slate-500 font-medium">Penyewa:</p>
              <p className="font-bold text-slate-900 text-sm">{invoice.tenancy.tenant_name}</p>
            </div>
            {invoice.tenancy.room && (
              <div className="text-right">
                <p className="text-slate-500 font-medium">Unit Properti:</p>
                <p className="font-bold text-slate-900 text-sm">
                  Kamar {invoice.tenancy.room.room_number} ({invoice.tenancy.room.name})
                </p>
              </div>
            )}
          </div>
        )}

        {/* Line Items Table Component */}
        <div className="p-6 md:p-8">
          <InvoiceLineItemsList
            items={invoice.items}
            totalAmount={invoice.total_amount}
            paidAmount={invoice.paid_amount}
            remaining={remaining}
          />
        </div>

        {/* Payment Action Footer (Ready for Phase 4 Gateway) */}
        <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            {isLunas ? (
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Tagihan ini sudah lunas sepenuhnya. Simpan bukti ini untuk arsip Anda.</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Silakan lakukan pelunasan sebelum batas tanggal jatuh tempo.</span>
              </div>
            )}
          </div>

          {!isLunas && (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/portal/invoices/${id}/pay`}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-md shadow-indigo-200 flex items-center gap-2 transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Bayar Sekarang</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
