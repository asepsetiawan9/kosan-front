'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Layers
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { apiRequest } from '@/lib/api';
import { Facility } from '@/lib/types';

const facilitySchema = z.object({
  name: z.string().min(2, 'Nama fasilitas wajib diisi'),
  category: z.enum(['kamar', 'kamar_mandi', 'umum']),
  icon_identifier: z.string().optional(),
});

type FacilityFormValues = z.infer<typeof facilitySchema>;

export default function FacilitiesManagementPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: facilitiesData, isLoading } = useQuery<{ data: Facility[] }>({
    queryKey: ['facilities'],
    queryFn: () => apiRequest<{ data: Facility[] }>('admin/facilities'),
  });

  const facilities = facilitiesData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FacilityFormValues>({
    resolver: zodResolver(facilitySchema),
    defaultValues: {
      category: 'umum',
      icon_identifier: 'sparkles',
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: FacilityFormValues) => {
      return apiRequest('admin/facilities', {
        method: 'POST',
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      setIsModalOpen(false);
      setSuccessMessage('Fasilitas baru berhasil ditambahkan!');
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: unknown) => {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal menyimpan fasilitas.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return apiRequest(`admin/facilities/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      setSuccessMessage('Fasilitas berhasil dihapus.');
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: unknown) => {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal menghapus fasilitas.');
    },
  });

  const openCreateModal = () => {
    setErrorMessage(null);
    reset({
      name: '',
      category: 'umum',
      icon_identifier: 'sparkles',
    });
    setIsModalOpen(true);
  };

  const onSubmit = (values: FacilityFormValues) => {
    setErrorMessage(null);
    createMutation.mutate(values);
  };

  const handleDelete = (facility: Facility) => {
    if (confirm(`Hapus fasilitas "${facility.name}"?`)) {
      deleteMutation.mutate(facility.id);
    }
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
          <h2 className="text-xl font-bold text-slate-900">Master Fasilitas</h2>
          <p className="text-xs text-slate-500 mt-0.5">Daftar fasilitas yang dapat disematkan ke unit kamar kosan</p>
        </div>
        <Button onClick={openCreateModal} className="gradient-emerald-glow shadow-emerald-glow">
          <Plus className="w-4 h-4" />
          Tambah Fasilitas
        </Button>
      </div>

      {/* Facilities Grid by Category */}
      {['kamar', 'kamar_mandi', 'umum'].map((category) => {
        const categoryLabel = {
          kamar: 'Fasilitas Dalam Kamar',
          kamar_mandi: 'Fasilitas Kamar Mandi',
          umum: 'Fasilitas Umum & Gedung',
        }[category];

        const filtered = facilities.filter((f) => f.category === category);

        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-700" />
              <h3 className="text-sm font-bold text-slate-800">{categoryLabel}</h3>
              <span className="text-xs text-slate-400">({filtered.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((item) => (
                <Card key={item.id} className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-800 block">{item.name}</span>
                      <span className="text-[10px] text-slate-400 capitalize">{item.category}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Card>
              ))}
              {filtered.length === 0 && (
                <p className="text-xs text-slate-400 italic py-2">Belum ada fasilitas di kategori ini.</p>
              )}
            </div>
          </div>
        );
      })}

      {/* Modal Tambah Fasilitas */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Fasilitas Baru"
        description="Masukkan nama fasilitas dan kelompokkan ke dalam kategori yang tepat"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {errorMessage}
            </div>
          )}

          <Input
            label="Nama Fasilitas *"
            placeholder="Contoh: Meja Belajar, Balkon Privat, CCTV"
            error={errors.name?.message}
            {...register('name')}
          />

          <Select label="Kategori Fasilitas *" error={errors.category?.message} {...register('category')}>
            <option value="umum">Fasilitas Umum & Gedung</option>
            <option value="kamar">Fasilitas Dalam Kamar</option>
            <option value="kamar_mandi">Fasilitas Kamar Mandi</option>
          </Select>

          <Input
            label="Icon Identifier"
            placeholder="Contoh: wifi, wind, bath, bed"
            error={errors.icon_identifier?.message}
            {...register('icon_identifier')}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="gradient-emerald-glow shadow-emerald-glow"
            >
              Simpan Fasilitas
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
