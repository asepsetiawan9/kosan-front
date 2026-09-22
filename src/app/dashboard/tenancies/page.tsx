'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TenancyTable } from '@/components/admin/TenancyTable';
import { TenancyFormModal, TenancyFormValues } from '@/components/admin/TenancyFormModal';
import { CheckoutModal, CheckoutFormValues } from '@/components/admin/CheckoutModal';
import { apiRequest } from '@/lib/api';
import { Tenancy, Room } from '@/lib/types';

export default function TenanciesManagementPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedTenancy, setSelectedTenancy] = useState<Tenancy | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch Tenancies
  const { data: tenanciesData, isLoading } = useQuery<{ data: Tenancy[] }>({
    queryKey: ['tenancies', selectedStatus, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      if (searchTerm) params.append('search', searchTerm);
      return apiRequest<{ data: Tenancy[] }>(`admin/tenancies?${params.toString()}`);
    },
  });

  // Fetch Available Rooms
  const { data: roomsData } = useQuery<{ data: Room[] }>({
    queryKey: ['available-rooms'],
    queryFn: () => apiRequest<{ data: Room[] }>('admin/rooms?status=kosong'),
  });

  const tenancies = tenanciesData?.data || [];
  const availableRooms = roomsData?.data || [];

  // Mutations
  const registerMutation = useMutation({
    mutationFn: (data: TenancyFormValues) =>
      apiRequest('admin/tenancies', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenancies'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['available-rooms'] });
      setIsRegisterOpen(false);
      setSuccessMessage('Penyewa berhasil didaftarkan dan kamar telah aktif.');
    },
    onError: (err: unknown) => {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal mendaftarkan penyewa.');
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: (data: CheckoutFormValues) =>
      apiRequest(`admin/tenancies/${selectedTenancy?.id}/checkout`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenancies'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['available-rooms'] });
      setIsCheckoutOpen(false);
      setSelectedTenancy(null);
      setSuccessMessage('Checkout berhasil diproses. Status kamar telah diperbarui.');
    },
    onError: (err: unknown) => {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal melakukan checkout.');
    },
  });

  const openRegisterModal = () => {
    setErrorMessage(null);
    setIsRegisterOpen(true);
  };

  const openCheckoutModal = (tenancy: Tenancy) => {
    setSelectedTenancy(tenancy);
    setErrorMessage(null);
    setIsCheckoutOpen(true);
  };

  const onRegister = async (values: TenancyFormValues) => {
    setErrorMessage(null);
    await registerMutation.mutateAsync(values);
  };

  const onCheckout = async (values: CheckoutFormValues) => {
    setErrorMessage(null);
    await checkoutMutation.mutateAsync(values);
  };

  return (
    <div className="space-y-6">
      {/* Alert Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900">
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
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Penyewa & Riwayat Sewa</h2>
          <p className="text-xs text-slate-500 mt-0.5">Registrasi penyewa baru, pantau jatuh tempo bulanan, dan proses checkout</p>
        </div>
        <Button onClick={openRegisterModal} className="gradient-emerald-glow shadow-emerald-glow cursor-pointer">
          <Plus className="w-4 h-4" />
          Daftarkan Penyewa Baru
        </Button>
      </div>

      {/* Search & Filter */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama atau telepon penyewa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition text-slate-700"
          >
            <option value="">Semua Status Sewa</option>
            <option value="aktif">Sewa Aktif (Menghuni)</option>
            <option value="selesai">Selesai (Sudah Checkout)</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
        </div>
      </Card>

      {/* Tenancies Table Component */}
      <TenancyTable
        tenancies={tenancies}
        isLoading={isLoading}
        onCheckout={openCheckoutModal}
      />

      {/* Modal Registrasi Penyewa Component */}
      <TenancyFormModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        availableRooms={availableRooms}
        onSubmit={onRegister}
        errorMessage={errorMessage}
      />

      {/* Modal Prosedur Checkout Component */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedTenancy={selectedTenancy}
        onSubmit={onCheckout}
        errorMessage={errorMessage}
      />
    </div>
  );
}
