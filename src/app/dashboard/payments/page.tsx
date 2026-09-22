'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { Payment } from '@/lib/types';
import { PaymentReceiptModal } from '@/components/admin/PaymentReceiptModal';
import { PaymentVerificationTable } from '@/components/admin/PaymentVerificationTable';

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { data: paymentsData, isLoading, refetch } = useQuery<{ data: Payment[] }>({
    queryKey: ['admin-payments', statusFilter, methodFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (methodFilter !== 'all') params.append('method', methodFilter);
      if (search.trim()) params.append('search', search.trim());

      const query = params.toString() ? `?${params.toString()}` : '';
      return apiRequest<{ data: Payment[] }>(`/admin/payments${query}`);
    },
  });

  const payments = paymentsData?.data || [];

  const statusTabs = [
    { id: 'all', label: 'Semua Status' },
    { id: 'pending', label: 'Menunggu Verifikasi' },
    { id: 'success', label: 'Berhasil' },
    { id: 'failed', label: 'Ditolak' },
  ];

  const handleOpenModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Verifikasi & Mutasi Pembayaran
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitoring seluruh transaksi gateway otomatis dan verifikasi bukti transfer bank manual.
          </p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft-card space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {statusTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Method Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="all">Semua Metode</option>
              <option value="manual_transfer">Transfer Manual</option>
              <option value="gateway">Gateway Otomatis</option>
            </select>

            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari invoice / penyewa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table Component */}
      <PaymentVerificationTable
        payments={payments}
        isLoading={isLoading}
        onSelectPayment={handleOpenModal}
      />

      {/* Payment Receipt Verification Modal */}
      <PaymentReceiptModal
        payment={selectedPayment}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPayment(null);
        }}
        onVerified={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
          refetch();
        }}
      />
    </div>
  );
}
