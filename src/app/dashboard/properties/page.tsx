'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, CheckCircle2, AlertCircle, X, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PropertyTable } from '@/components/admin/PropertyTable';
import { PropertyFormModal, PropertyFormValues } from '@/components/admin/PropertyFormModal';
import { apiRequest } from '@/lib/api';
import { Property } from '@/lib/types';

export default function PropertiesManagementPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch Properties
  const { data: propertiesData, isLoading } = useQuery<{ data: Property[] }>({
    queryKey: ['properties', searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      return apiRequest<{ data: Property[] }>(`admin/properties?${params.toString()}`);
    },
  });

  const properties = propertiesData?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: PropertyFormValues) =>
      apiRequest('admin/properties', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setIsModalOpen(false);
      setSuccessMessage('Properti kosan berhasil ditambahkan.');
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Gagal menambahkan properti.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: PropertyFormValues) =>
      apiRequest(`admin/properties/${editingProperty?.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setIsModalOpen(false);
      setEditingProperty(null);
      setSuccessMessage('Data properti berhasil diperbarui.');
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Gagal memperbarui data properti.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`admin/properties/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setSuccessMessage('Properti berhasil dihapus.');
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Gagal menghapus properti. Pastikan tidak ada kamar terdaftar.');
    },
  });

  const openCreateModal = () => {
    setEditingProperty(null);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prop: Property) => {
    setEditingProperty(prop);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleDelete = (prop: Property) => {
    if (confirm(`Apakah Anda yakin ingin menghapus properti "${prop.name}"?`)) {
      deleteMutation.mutate(prop.id);
    }
  };

  const handleFormSubmit = async (values: PropertyFormValues) => {
    setErrorMessage(null);
    if (editingProperty) {
      await updateMutation.mutateAsync(values);
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifikasi */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="p-1 hover:bg-emerald-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-rose-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-700" />
            <h2 className="text-xl font-bold text-slate-900">Manajemen Properti</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola lokasi gedung kosan, alamat Google Maps terintegrasi, dan data kontak pemilik properti
          </p>
        </div>
        <Button onClick={openCreateModal} className="gradient-emerald-glow shadow-emerald-glow cursor-pointer">
          <Plus className="w-4 h-4" />
          Tambah Properti Baru
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama properti, kota, alamat, atau nama pemilik..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition"
          />
        </div>
      </Card>

      {/* Properties Table Component */}
      <PropertyTable
        properties={properties}
        isLoading={isLoading}
        onEditProperty={openEditModal}
        onDeleteProperty={handleDelete}
      />

      {/* Modal Form Tambah / Edit Properti Component */}
      <PropertyFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingProperty={editingProperty}
        onSubmit={handleFormSubmit}
        errorMessage={errorMessage}
      />
    </div>
  );
}
