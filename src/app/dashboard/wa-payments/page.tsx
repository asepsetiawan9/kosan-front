'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  Receipt,
  FileCheck2,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { Payment } from '@/lib/types';
import { DuplicateWarningBadge } from '@/components/ui/DuplicateWarningBadge';
import { ProofImageViewer } from '@/components/admin/ProofImageViewer';
import { WaPaymentRejectModal } from '@/components/admin/WaPaymentRejectModal';
import { WaManualPaymentModal } from '@/components/admin/WaManualPaymentModal';

export default function WaPaymentsPage() {
  const queryClient = useQueryClient();

  // Filters state
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [onlyDuplicates, setOnlyDuplicates] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  // Modals state
  const [viewerPayment, setViewerPayment] = useState<Payment | null>(null);
  const [rejectingPayment, setRejectingPayment] = useState<Payment | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string>('');

  // Query: Pending Count specifically for WhatsApp
  const { data: pendingData, refetch: refetchPendingCount } = useQuery<{ success: boolean; count: number }>({
    queryKey: ['wa-payments-pending-count'],
    queryFn: () => apiRequest<{ success: boolean; count: number }>('/admin/wa/payments/pending-count'),
    refetchInterval: 10000,
  });

  const pendingCount = pendingData?.count ?? 0;

  // Query: Payments List
  const {
    data: paymentsData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<{ data: Payment[] }>({
    queryKey: ['wa-payments-list', statusFilter, sourceFilter, onlyDuplicates, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (sourceFilter !== 'all') params.append('source', sourceFilter);
      if (onlyDuplicates) params.append('is_duplicate_suspect', '1');
      if (search.trim()) params.append('search', search.trim());

      const query = params.toString() ? `?${params.toString()}` : '';
      return apiRequest<{ data: Payment[] }>(`/admin/wa/payments${query}`);
    },
  });

  const payments = paymentsData?.data || [];

  // Mutation: Approve
  const approveMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      return apiRequest(`/admin/wa/payments/${paymentId}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({
          action: 'approve',
          notes: 'Diverifikasi sah oleh admin.',
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wa-payments-list'] });
      queryClient.invalidateQueries({ queryKey: ['wa-payments-pending-count'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      setActionSuccessMessage('Pembayaran berhasil disetujui. Tagihan telah diperbarui dan notifikasi WhatsApp telah terkirim ke penghuni.');
      setTimeout(() => setActionSuccessMessage(''), 6000);
    },
  });

  // Mutation: Reject
  const rejectMutation = useMutation({
    mutationFn: async ({ paymentId, reason }: { paymentId: string; reason: string }) => {
      return apiRequest(`/admin/wa/payments/${paymentId}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({
          action: 'reject',
          reject_reason: reason,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wa-payments-list'] });
      queryClient.invalidateQueries({ queryKey: ['wa-payments-pending-count'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      setActionSuccessMessage('Pembayaran telah ditolak. Notifikasi rincian alasan penolakan telah dikirim ke nomor WhatsApp penghuni.');
      setTimeout(() => setActionSuccessMessage(''), 6000);
    },
  });

  const handleApprove = async (payment: Payment) => {
    if (confirm(`Setujui pembayaran sewa Rp ${new Intl.NumberFormat('id-ID').format(payment.amount)} dari ${payment.invoice?.tenancy?.tenant_name}? Tagihan akan dinyatakan lunas/sebagian dibayar.`)) {
      approveMutation.mutate(payment.id);
    }
  };

  const handleRejectSubmit = async (reason: string) => {
    if (rejectingPayment) {
      await rejectMutation.mutateAsync({
        paymentId: rejectingPayment.id,
        reason,
      });
    }
  };

  const statusTabs = [
    { id: 'pending', label: 'Menunggu Verifikasi', count: pendingCount },
    { id: 'all', label: 'Semua Status' },
    { id: 'success', label: 'Disetujui (Lunas)' },
    { id: 'failed', label: 'Ditolak' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Verifikasi Bukti Transfer WhatsApp
            </h1>
            {pendingCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow-xs animate-bounce">
                {pendingCount} Menunggu
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pemeriksaan bukti transfer otomatis dari bot WhatsApp. Konfirmasi status tagihan sewa dan kirim notifikasi hasil verifikasi langsung ke penghuni.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              refetch();
              refetchPendingCount();
            }}
            disabled={isRefetching}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            Segarkan
          </button>

          <button
            type="button"
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-emerald-glow text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Catat Pembayaran Manual
          </button>
        </div>
      </div>

      {/* Success Toast Banner */}
      {actionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessMessage('')}
            className="text-emerald-600 hover:text-emerald-900 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft-card space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
            {statusTabs.map((tab) => {
              const isSelected = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        isSelected ? 'bg-white text-teal-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Duplicate Suspect Checkbox */}
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={onlyDuplicates}
                onChange={(e) => setOnlyDuplicates(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Hanya Suspect Duplikat</span>
            </label>

            {/* Source Dropdown */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="all">Semua Sumber</option>
              <option value="whatsapp">Hanya WhatsApp</option>
              <option value="manual_admin">Manual Admin</option>
              <option value="web">Web Portal</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari invoice / nama penghuni..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table & Cards Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
            <span>Memuat data verifikasi pembayaran...</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <FileCheck2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Tidak ada data pembayaran</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {statusFilter === 'pending'
                  ? 'Semua bukti transfer WhatsApp telah selesai diverifikasi.'
                  : 'Tidak ditemukan transaksi yang cocok dengan kriteria pencarian.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Bukti Transfer</th>
                  <th className="px-4 py-3.5">Penghuni & Kamar</th>
                  <th className="px-4 py-3.5">Tagihan & Nominal</th>
                  <th className="px-4 py-3.5">Sumber & Status</th>
                  <th className="px-4 py-3.5">Waktu Masuk</th>
                  <th className="px-5 py-3.5 text-right">Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => {
                  const tenant = p.invoice?.tenancy;
                  const room = tenant?.room;
                  const tenantPhone = tenant?.tenant_phone || '';
                  const waClean = tenantPhone.replace(/\D/g, '');
                  const waLink = waClean ? `https://wa.me/${waClean.startsWith('0') ? '62' + waClean.substring(1) : waClean}` : null;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        p.is_duplicate_suspect ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Thumbnail Proof */}
                      <td className="px-5 py-4">
                        {p.proof_url ? (
                          <div
                            onClick={() => setViewerPayment(p)}
                            className="group relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer shadow-2xs hover:shadow-md transition-all shrink-0"
                            title="Klik untuk memperbesar bukti transfer"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.proof_url}
                              alt="Bukti"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <Eye className="w-4 h-4" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-[10px] text-center p-1">
                            <Receipt className="w-4 h-4 mb-0.5 text-slate-300" />
                            <span>Tanpa Bukti</span>
                          </div>
                        )}
                      </td>

                      {/* Tenant & Room */}
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {tenant?.tenant_name || 'Penghuni'}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                            Kamar {room?.room_number ?? '-'}
                          </span>
                          <span>{room?.name}</span>
                        </div>
                        {waLink && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline mt-1"
                          >
                            <MessageSquare className="w-3 h-3 text-emerald-600" />
                            <span>{tenantPhone}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </td>

                      {/* Invoice & Amount */}
                      <td className="px-4 py-4">
                        <div className="font-bold text-emerald-700 text-sm">
                          Rp {new Intl.NumberFormat('id-ID').format(p.amount)}
                        </div>
                        <div className="text-xs font-semibold text-slate-700 mt-0.5">
                          {p.invoice?.invoice_number}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Periode: {p.invoice?.period}
                        </div>
                      </td>

                      {/* Source & Status Badges */}
                      <td className="px-4 py-4 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Status */}
                          {p.status === 'pending' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300">
                              Menunggu
                            </span>
                          )}
                          {p.status === 'success' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300">
                              Disetujui (Lunas)
                            </span>
                          )}
                          {p.status === 'failed' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-800 border border-rose-300">
                              Ditolak
                            </span>
                          )}

                          {/* Source */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              p.source === 'whatsapp'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : p.source === 'manual_admin'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {p.source === 'whatsapp'
                              ? 'WhatsApp'
                              : p.source === 'manual_admin'
                              ? 'Admin Manual'
                              : 'Web Gateway'}
                          </span>
                        </div>

                        {/* Duplicate Alert */}
                        {p.is_duplicate_suspect && (
                          <div>
                            <DuplicateWarningBadge />
                          </div>
                        )}

                        {/* Rejection Note */}
                        {p.reject_reason && (
                          <div className="text-[11px] text-rose-700 bg-rose-50 p-1.5 rounded-lg border border-rose-200 max-w-xs mt-1">
                            <strong>Alasan Tolak:</strong> {p.reject_reason}
                          </div>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-4 text-slate-500 text-[11px]">
                        <div>{p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID') : '-'}</div>
                        <div className="text-[10px] text-slate-400">
                          {p.created_at ? new Date(p.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''} WIB
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.proof_url && (
                            <button
                              type="button"
                              onClick={() => setViewerPayment(p)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                              title="Perbesar Bukti"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}

                          {p.status === 'pending' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(p)}
                                disabled={approveMutation.isPending}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl gradient-emerald-glow text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                                title="Setujui dan nyatakan lunas"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Setujui</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setRejectingPayment(p)}
                                disabled={rejectMutation.isPending}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                                title="Tolak bukti transfer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-400 italic">
                              Selesai
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Proof Image Viewer Modal */}
      {viewerPayment && (
        <ProofImageViewer
          isOpen={!!viewerPayment}
          onClose={() => setViewerPayment(null)}
          imageUrl={viewerPayment.proof_url}
          mimeType={viewerPayment.proof_mime}
          title={`Bukti Transfer: ${viewerPayment.invoice?.invoice_number ?? 'Pembayaran'}`}
          subtitle={`${viewerPayment.invoice?.tenancy?.tenant_name ?? 'Penghuni'} — Rp ${new Intl.NumberFormat('id-ID').format(viewerPayment.amount)}`}
          sha256={viewerPayment.proof_sha256}
          isDuplicateSuspect={viewerPayment.is_duplicate_suspect}
        />
      )}

      {/* Reject Reason Confirmation Modal */}
      {rejectingPayment && (
        <WaPaymentRejectModal
          isOpen={!!rejectingPayment}
          onClose={() => setRejectingPayment(null)}
          payment={rejectingPayment}
          onSubmit={handleRejectSubmit}
          isSubmitting={rejectMutation.isPending}
        />
      )}

      {/* Manual Payment Input Modal */}
      <WaManualPaymentModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['wa-payments-list'] });
          queryClient.invalidateQueries({ queryKey: ['wa-payments-pending-count'] });
          queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
          setActionSuccessMessage('Pembayaran manual berhasil dicatat di sistem.');
          setTimeout(() => setActionSuccessMessage(''), 6000);
        }}
      />
    </div>
  );
}
