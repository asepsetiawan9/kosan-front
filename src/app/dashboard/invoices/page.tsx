'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle2, AlertCircle, X, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { InvoiceTable } from '@/components/admin/InvoiceTable';
import { InvoiceFormModal, InvoiceFormValues } from '@/components/admin/InvoiceFormModal';
import { apiRequest } from '@/lib/api';
import { Invoice, Tenancy } from '@/lib/types';

export default function InvoicesManagementPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch Invoices
  const { data: invoicesData, isLoading } = useQuery<{ data: Invoice[] }>({
    queryKey: ['invoices', selectedStatus, selectedPeriod],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedPeriod) params.append('period', selectedPeriod);
      return apiRequest<{ data: Invoice[] }>(`admin/invoices?${params.toString()}`);
    },
  });

  // Fetch Active Tenancies for creation select
  const { data: tenanciesData } = useQuery<{ data: Tenancy[] }>({
    queryKey: ['active-tenancies'],
    queryFn: () => apiRequest<{ data: Tenancy[] }>('admin/tenancies?status=aktif'),
  });

  const invoices = invoicesData?.data || [];
  const activeTenancies = tenanciesData?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (values: InvoiceFormValues) => {
      return apiRequest('admin/invoices', {
        method: 'POST',
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsCreateOpen(false);
      setSuccessMessage('Tagihan baru berhasil diterbitkan!');
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: unknown) => {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal membuat tagihan.');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      return apiRequest(`admin/invoices/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setSuccessMessage('Status tagihan berhasil diubah!');
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: unknown) => {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal mengubah status.');
    },
  });

  const openCreateModal = () => {
    setErrorMessage(null);
    setIsCreateOpen(true);
  };

  const onSubmit = async (values: InvoiceFormValues) => {
    setErrorMessage(null);
    await createMutation.mutateAsync(values);
  };

  const handleQuickStatus = (invoice: Invoice, newStatus: string) => {
    statusMutation.mutate({ id: invoice.id, status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tagihan & Keuangan</h2>
          <p className="text-xs text-slate-500 mt-0.5">Kelola penagihan sewa, rekonsiliasi pembayaran, dan line items biaya</p>
        </div>
        <Button onClick={openCreateModal} className="gradient-emerald-glow shadow-emerald-glow cursor-pointer">
          <Plus className="w-4 h-4" />
          Terbitkan Tagihan Manual
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition text-slate-700"
          >
            <option value="">Semua Status Tagihan</option>
            <option value="belum_bayar">Belum Dibayar</option>
            <option value="sebagian_dibayar">Sebagian Dibayar</option>
            <option value="lunas">Lunas</option>
            <option value="terlambat">Terlambat</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>

          <div className="relative">
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition text-slate-700"
            />
            {selectedPeriod && (
              <button
                onClick={() => setSelectedPeriod('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Invoice Table Component */}
      <InvoiceTable
        invoices={invoices}
        isLoading={isLoading}
        onQuickStatus={handleQuickStatus}
      />

      {/* Modal Buat Tagihan Manual Component */}
      <InvoiceFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        activeTenancies={activeTenancies}
        onSubmit={onSubmit}
        errorMessage={errorMessage}
      />
    </div>
  );
}
