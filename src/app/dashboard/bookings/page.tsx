'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Booking } from '@/lib/types';
import { BookingTable } from '@/components/admin/BookingTable';
import { BookingDetailDrawer } from '@/components/admin/BookingDetailDrawer';
import { KtpPreviewModal } from '@/components/admin/KtpPreviewModal';
import { 
  CalendarCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function AdminBookingsPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Booking for Detail / Modals
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [approveConfirmBooking, setApproveConfirmBooking] = useState<Booking | null>(null);
  const [rejectPromptBooking, setRejectPromptBooking] = useState<Booking | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);

  // KTP Preview Modal State
  const [ktpModalOpen, setKtpModalOpen] = useState(false);
  const [ktpModalData, setKtpModalData] = useState<{ url: string; name: string } | null>(null);

  // Fetch Bookings
  const { data: bookingsData, isLoading, error } = useQuery<{ data: Booking[] }>({
    queryKey: ['admin-bookings', selectedStatus, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      const res = await fetch(`/api/proxy/admin/bookings?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Gagal memuat daftar permohonan booking.');
      }
      return res.json();
    },
  });

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      setActionError(null);
      const res = await fetch(`/api/proxy/admin/bookings/${bookingId}/approve`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal menyetujui permohonan booking.');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setApproveConfirmBooking(null);
      setDetailBooking(null);
    },
    onError: (err: any) => {
      setActionError(err.message);
    },
  });

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason: string }) => {
      setActionError(null);
      const res = await fetch(`/api/proxy/admin/bookings/${bookingId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejection_reason: reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal menolak permohonan booking.');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setRejectPromptBooking(null);
      setDetailBooking(null);
    },
    onError: (err: any) => {
      setActionError(err.message);
    },
  });

  const bookings = bookingsData?.data || [];

  const handleOpenKtpModal = (url: string, name: string) => {
    setKtpModalData({ url, name });
    setKtpModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Persetujuan Permohonan Booking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verifikasi identitas calon penghuni, inspeksi KTP, dan setujui sewa secara otomatis.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Semua Status' },
              { id: 'menunggu', label: 'Menunggu' },
              { id: 'disetujui', label: 'Disetujui' },
              { id: 'ditolak', label: 'Ditolak' },
              { id: 'dibatalkan', label: 'Dibatalkan' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedStatus === tab.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, no HP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Booking Table Component */}
      <BookingTable
        bookings={bookings}
        isLoading={isLoading}
        error={error}
        onSelectBooking={setDetailBooking}
        onApprove={setApproveConfirmBooking}
        onReject={(b) => {
          setRejectPromptBooking(b);
          setRejectReason('');
        }}
      />

      {/* Booking Detail Drawer Component */}
      <BookingDetailDrawer
        booking={detailBooking}
        onClose={() => setDetailBooking(null)}
        onApprove={setApproveConfirmBooking}
        onReject={(b) => {
          setRejectPromptBooking(b);
          setRejectReason('');
        }}
        onOpenKtpModal={handleOpenKtpModal}
      />

      {/* KTP Preview Modal Component */}
      <KtpPreviewModal
        isOpen={ktpModalOpen}
        onClose={() => setKtpModalOpen(false)}
        ktpUrl={ktpModalData?.url || null}
        tenantName={ktpModalData?.name || ''}
      />

      {/* APPROVE CONFIRMATION MODAL */}
      {approveConfirmBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Konfirmasi Persetujuan Booking
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Anda akan menyetujui permohonan sewa oleh <strong className="text-slate-800">{approveConfirmBooking.name}</strong> untuk kamar <strong className="text-slate-800">{approveConfirmBooking.room?.room_number}</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <p>✓ Status kamar otomatis berubah menjadi <strong>Terisi</strong>.</p>
              <p>✓ Data tenancy (sewa) aktif baru akan dibuat otomatis.</p>
              <p>✓ Akun portal penghuni disiapkan dan notifikasi dikirimkan via WhatsApp.</p>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={approveMutation.isPending}
                onClick={() => setApproveConfirmBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={approveMutation.isPending}
                onClick={() => approveMutation.mutate(approveConfirmBooking.id)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white gradient-emerald-glow shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {approveMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Ya, Setujui Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT PROMPT MODAL */}
      {rejectPromptBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tolak Permohonan Booking
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tolak permohonan dari <strong className="text-slate-800">{rejectPromptBooking.name}</strong>. Silakan sertakan alasan penolakan untuk notifikasi.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Alasan Penolakan <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Contoh: Dokumen KTP buram, kuota kamar penuh, dll..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 placeholder:text-slate-400"
              />
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={rejectMutation.isPending}
                onClick={() => setRejectPromptBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={rejectMutation.isPending || !rejectReason.trim()}
                onClick={() =>
                  rejectMutation.mutate({
                    bookingId: rejectPromptBooking.id,
                    reason: rejectReason.trim(),
                  })
                }
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {rejectMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Tolak Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
