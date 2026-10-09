'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RoomTable } from '@/components/admin/RoomTable';
import { RoomFormModal, RoomFormValues } from '@/components/admin/RoomFormModal';
import { DeleteRoomModal } from '@/components/admin/DeleteRoomModal';
import { apiRequest } from '@/lib/api';
import { Room, Facility, Property } from '@/lib/types';

export default function RoomsManagementPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch Properties
  const { data: propertiesData } = useQuery<{ data: Property[] }>({
    queryKey: ['properties', 'all'],
    queryFn: () => apiRequest<{ data: Property[] }>('admin/properties?all=1'),
  });

  // Fetch Rooms
  const { data: roomsData, isLoading } = useQuery<{ data: Room[] }>({
    queryKey: ['rooms', selectedProperty, selectedType, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedProperty) params.append('property_id', selectedProperty);
      if (selectedType) params.append('type', selectedType);
      if (searchTerm) params.append('search', searchTerm);
      return apiRequest<{ data: Room[] }>(`admin/rooms?${params.toString()}`);
    },
  });

  // Fetch Facilities
  const { data: facilitiesData } = useQuery<{ data: Facility[] }>({
    queryKey: ['facilities'],
    queryFn: () => apiRequest<{ data: Facility[] }>('admin/facilities'),
  });

  const properties = propertiesData?.data || [];
  const rooms = roomsData?.data || [];
  const facilities = facilitiesData?.data || [];

  const buildRoomPayload = (data: RoomFormValues, method?: 'PUT') => {
    if (data.photoFile) {
      const formData = new FormData();
      if (method) {
        formData.append('_method', method);
      }
      if (data.property_id) formData.append('property_id', data.property_id);
      formData.append('room_number', data.room_number);
      formData.append('name', data.name);
      formData.append('type', data.type);
      formData.append('base_price', String(data.base_price));
      if (data.description) formData.append('description', data.description);
      if (data.status) formData.append('status', data.status);
      if (data.facility_ids && data.facility_ids.length > 0) {
        data.facility_ids.forEach((id) => formData.append('facility_ids[]', id));
      }
      formData.append('photo', data.photoFile);
      formData.append('image', data.photoFile);
      return formData;
    }

    const { photoFile, ...cleanData } = data;
    return JSON.stringify(cleanData);
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: RoomFormValues) => {
      const payload = buildRoomPayload(data);
      return apiRequest('admin/rooms', {
        method: 'POST',
        body: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setIsModalOpen(false);
      setSuccessMessage('Kamar berhasil dibuat.');
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Gagal membuat kamar.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: RoomFormValues) => {
      if (data.photoFile) {
        const payload = buildRoomPayload(data, 'PUT');
        return apiRequest(`admin/rooms/${editingRoom?.id}`, {
          method: 'POST',
          body: payload,
        });
      }
      const { photoFile, ...cleanData } = data;
      return apiRequest(`admin/rooms/${editingRoom?.id}`, {
        method: 'PUT',
        body: JSON.stringify(cleanData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setIsModalOpen(false);
      setEditingRoom(null);
      setSuccessMessage('Data kamar berhasil diperbarui.');
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Gagal memperbarui kamar.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`admin/rooms/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setSuccessMessage(`Kamar ${deletingRoom?.room_number || ''} berhasil dihapus.`);
      setDeletingRoom(null);
      setDeleteError(null);
    },
    onError: (err: any) => {
      setDeleteError(err.message || 'Gagal menghapus kamar. Kamar mungkin sedang memiliki penyewa aktif.');
    },
  });

  const openCreateModal = () => {
    setEditingRoom(null);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleDelete = (room: Room) => {
    setDeleteError(null);
    setDeletingRoom(room);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRoom) return;
    deleteMutation.mutate(deletingRoom.id);
  };

  const handleFormSubmit = async (values: RoomFormValues) => {
    setErrorMessage(null);
    if (editingRoom) {
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
          <h2 className="text-xl font-bold text-slate-900">Manajemen Kamar</h2>
          <p className="text-xs text-slate-500 mt-0.5">Kelola informasi unit, fasilitas pendukung, dan tarif bulanan</p>
        </div>
        <Button onClick={openCreateModal} className="gradient-emerald-glow shadow-emerald-glow cursor-pointer">
          <Plus className="w-4 h-4" />
          Tambah Kamar Baru
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nomor atau nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition"
            />
          </div>

          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition text-slate-700"
          >
            <option value="">Semua Gedung Properti</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.city ? `(${p.city})` : ''}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition text-slate-700"
          >
            <option value="">Semua Tipe Kamar</option>
            <option value="standar">Standar</option>
            <option value="deluxe">Deluxe</option>
            <option value="vip">VIP Eksekutif</option>
            <option value="paviliun">Paviliun Suite</option>
          </select>
        </div>
      </Card>

      {/* Rooms Table Component */}
      <RoomTable
        rooms={rooms}
        isLoading={isLoading}
        onEditRoom={openEditModal}
        onDeleteRoom={handleDelete}
      />

      {/* Modal Form Tambah / Edit Kamar Component */}
      <RoomFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingRoom={editingRoom}
        facilities={facilities}
        properties={properties}
        onSubmit={handleFormSubmit}
        errorMessage={errorMessage}
      />

      {/* Modal Konfirmasi Hapus Kamar Component */}
      <DeleteRoomModal
        isOpen={Boolean(deletingRoom)}
        onClose={() => {
          setDeletingRoom(null);
          setDeleteError(null);
        }}
        room={deletingRoom}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
        errorMessage={deleteError}
      />
    </div>
  );
}
