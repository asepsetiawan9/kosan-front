'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Receipt,
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Building,
} from 'lucide-react';
import { apiRequest, formatRupiah } from '@/lib/api';
import { Invoice } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PaymentMethodSelector } from '@/components/tenant/PaymentMethodSelector';
import { ManualTransferForm } from '@/components/tenant/ManualTransferForm';
import { PaymentPollingStatus } from '@/components/tenant/PaymentPollingStatus';
import { SnapGatewayEmbed } from '@/components/tenant/SnapGatewayEmbed';

interface GatewayInitResponse {
  payment_id: string;
  order_id: string;
  gross_amount: number;
  snap_token: string;
  redirect_url: string;
  invoice_number: string;
}

export default function TenantInvoicePayPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<'gateway' | 'manual'>('gateway');
  const [gatewayData, setGatewayData] = useState<GatewayInitResponse | null>(null);
  const [isInitializingGateway, setIsInitializingGateway] = useState<boolean>(false);
  const [gatewayError, setGatewayError] = useState<string | null>(null);
  const [isSimulatingSettlement, setIsSimulatingSettlement] = useState<boolean>(false);

  const { data: invoice, isLoading, isError, refetch } = useQuery<Invoice>({
    queryKey: ['tenant-invoice-detail', id],
    queryFn: async () => {
      const res = await apiRequest<{ data: Invoice }>(`/tenant/invoices/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-12 text-center text-slate-400 text-sm">Memuat instruksi pembayaran...</div>;
  }

  if (isError || !invoice) {
    return (
      <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center shadow-soft-card max-w-lg mx-auto">
        <AlertTriangle className="w-10 h-10 mx-auto text-rose-500 mb-3" />
        <h3 className="font-bold text-slate-900 text-base">Tagihan Tidak Ditemukan</h3>
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

  const remaining = Number(invoice.total_amount) - Number(invoice.paid_amount);
  const isLunas = invoice.status === 'lunas';

  const handleInitGateway = async () => {
    setIsInitializingGateway(true);
    setGatewayError(null);

    try {
      const res = await apiRequest<{ success: boolean; data: GatewayInitResponse }>(
        `/tenant/invoices/${id}/pay`,
        {
          method: 'POST',
          body: JSON.stringify({ provider: 'midtrans' }),
        }
      );

      if (res.data) {
        setGatewayData(res.data);
      }
    } catch (err: unknown) {
      setGatewayError(err instanceof Error ? err.message : 'Gagal menginisialisasi pembayaran gateway.');
    } finally {
      setIsInitializingGateway(false);
    }
  };

  const handleSimulateSettlement = async () => {
    if (!gatewayData) return;
    setIsSimulatingSettlement(true);

    try {
      const res = await fetch(`/api/proxy/webhook/payment/midtrans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: gatewayData.order_id,
          status_code: '200',
          gross_amount: String(gatewayData.gross_amount),
          transaction_status: 'settlement',
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['tenant-invoice-detail', id] });
        queryClient.invalidateQueries({ queryKey: ['tenant-invoices'] });
        await refetch();
      } else {
        alert(resData.message || 'Simulasi pembayaran gagal.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulatingSettlement(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Navigation */}
      <button
        type="button"
        onClick={() => router.push(`/portal/invoices/${id}`)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Detail Faktur</span>
      </button>

      {/* Invoice Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-card overflow-hidden">
        <div className="p-6 md:p-8 bg-slate-50/60 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                Pusat Pembayaran
              </span>
              <StatusBadge status={invoice.status} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {invoice.invoice_number}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Periode: {invoice.period}</p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs text-slate-400">Sisa Tagihan Pelunasan</p>
            <p className="text-xl font-black text-indigo-900 mt-0.5">
              {formatRupiah(remaining > 0 ? remaining : 0)}
            </p>
          </div>
        </div>

        {/* If Already Paid */}
        {isLunas ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Tagihan Ini Sudah Lunas Sepenuhnya</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Terima kasih atas pembayaran tepat waktu Anda. Tidak ada kewajiban tertunggak untuk faktur ini.
              </p>
            </div>
            <Link
              href={`/portal/invoices/${id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
            >
              <span>Lihat Bukti Faktur Lunas</span>
            </Link>
          </div>
        ) : (
          <div className="p-6 md:p-8 space-y-6">
            {/* Payment Method Selector */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Pilih Metode Pembayaran
              </h3>
              <PaymentMethodSelector activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* Tab 1: Gateway Otomatis */}
            {activeTab === 'gateway' && (
              <SnapGatewayEmbed
                remaining={remaining}
                gatewayData={gatewayData}
                gatewayError={gatewayError}
                isInitializing={isInitializingGateway}
                isSimulating={isSimulatingSettlement}
                onInitGateway={handleInitGateway}
                onSimulateSettlement={handleSimulateSettlement}
              />
            )}

            {/* Tab 2: Transfer Bank Manual */}
            {activeTab === 'manual' && (
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200">
                <ManualTransferForm
                  invoiceId={id}
                  remainingAmount={remaining}
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['tenant-invoice-detail', id] });
                    refetch();
                  }}
                />
              </div>
            )}

            {/* Polling Status Component */}
            <div className="pt-2">
              <PaymentPollingStatus
                invoiceId={id}
                initialStatus={invoice.status}
                onStatusChanged={() => {
                  queryClient.invalidateQueries({ queryKey: ['tenant-invoice-detail', id] });
                  queryClient.invalidateQueries({ queryKey: ['tenant-invoices'] });
                  refetch();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
