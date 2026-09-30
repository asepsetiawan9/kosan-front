'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GoogleMapsPreview } from '@/components/ui/GoogleMapsPreview';
import { Property } from '@/lib/types';

const propertySchema = z.object({
  name: z.string().min(2, 'Nama properti wajib diisi (minimal 2 karakter)'),
  address: z.string().min(5, 'Alamat lengkap wajib diisi'),
  city: z.string().optional().or(z.literal('')),
  province: z.string().optional().or(z.literal('')),
  postal_code: z.string().max(10, 'Kode pos maksimal 10 digit').optional().or(z.literal('')),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  google_maps_url: z.string().url('Format URL peta tidak valid').optional().or(z.literal('')),
  owner_name: z.string().min(2, 'Nama pemilik wajib diisi'),
  owner_phone: z.string().optional().or(z.literal('')),
  owner_email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProperty: Property | null;
  onSubmit: (values: PropertyFormValues) => Promise<void>;
  errorMessage: string | null;
}

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  onClose,
  editingProperty,
  onSubmit,
  errorMessage,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: editingProperty?.name || '',
      address: editingProperty?.address || '',
      city: editingProperty?.city || '',
      province: editingProperty?.province || '',
      postal_code: editingProperty?.postal_code || '',
      latitude: editingProperty?.latitude ?? undefined,
      longitude: editingProperty?.longitude ?? undefined,
      google_maps_url: editingProperty?.google_maps_url || '',
      owner_name: editingProperty?.owner_name || '',
      owner_phone: editingProperty?.owner_phone || '',
      owner_email: editingProperty?.owner_email || '',
    },
  });

  React.useEffect(() => {
    if (editingProperty) {
      reset({
        name: editingProperty.name,
        address: editingProperty.address,
        city: editingProperty.city || '',
        province: editingProperty.province || '',
        postal_code: editingProperty.postal_code || '',
        latitude: editingProperty.latitude ?? undefined,
        longitude: editingProperty.longitude ?? undefined,
        google_maps_url: editingProperty.google_maps_url || '',
        owner_name: editingProperty.owner_name,
        owner_phone: editingProperty.owner_phone || '',
        owner_email: editingProperty.owner_email || '',
      });
    } else {
      reset({
        name: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        latitude: undefined,
        longitude: undefined,
        google_maps_url: '',
        owner_name: '',
        owner_phone: '',
        owner_email: '',
      });
    }
  }, [editingProperty, reset]);

  const mapsUrl = watch('google_maps_url');
  const lat = watch('latitude');
  const lng = watch('longitude');
  const currentAddress = watch('address');
  const propName = watch('name');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProperty ? `Edit Properti ${editingProperty.name}` : 'Tambah Properti Kosan Baru'}
      description="Lengkapi informasi gedung kosan, alamat lokasi, koordinat peta, dan kontak pemilik properti"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {errorMessage}
          </div>
        )}

        {/* Section 1: Informasi Properti */}
        <div className="border-b border-slate-100 pb-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Informasi Properti</h4>
          <div className="space-y-3">
            <Input
              label="Nama Properti Kosan *"
              placeholder="Contoh: Kos Melati Residence, Paviliun Indah"
              error={errors.name?.message}
              {...register('name')}
            />

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Alamat Lengkap *</label>
              <textarea
                rows={2}
                placeholder="Jl. Nama Jalan No. XX, Kelurahan, Kecamatan..."
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
                {...register('address')}
              />
              {errors.address && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Kota / Kabupaten"
                placeholder="Bandung, Sleman"
                error={errors.city?.message}
                {...register('city')}
              />
              <Input
                label="Provinsi"
                placeholder="Jawa Barat, DIY"
                error={errors.province?.message}
                {...register('province')}
              />
              <Input
                label="Kode Pos"
                placeholder="40132"
                error={errors.postal_code?.message}
                {...register('postal_code')}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Data Pemilik */}
        <div className="border-b border-slate-100 pb-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Data Pemilik Properti</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Nama Pemilik *"
              placeholder="Hj. Siti Rohmah"
              error={errors.owner_name?.message}
              {...register('owner_name')}
            />
            <Input
              label="Nomor HP / WhatsApp"
              placeholder="081234567890"
              error={errors.owner_phone?.message}
              {...register('owner_phone')}
            />
            <Input
              label="Email Pemilik"
              type="email"
              placeholder="pemilik@example.com"
              error={errors.owner_email?.message}
              {...register('owner_email')}
            />
          </div>
        </div>

        {/* Section 3: Integrasi Google Maps */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Integrasi Google Maps</h4>
          <div className="space-y-3">
            <Input
              label="Tautan Google Maps URL"
              placeholder="https://maps.google.com/?q=-6.8858340,107.6139120"
              error={errors.google_maps_url?.message}
              {...register('google_maps_url')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Latitude (Opsional)"
                type="number"
                step="any"
                placeholder="-6.8858340"
                error={errors.latitude?.message}
                {...register('latitude', {
                  setValueAs: (v) => (v === '' || isNaN(v) ? null : parseFloat(v)),
                })}
              />
              <Input
                label="Longitude (Opsional)"
                type="number"
                step="any"
                placeholder="107.6139120"
                error={errors.longitude?.message}
                {...register('longitude', {
                  setValueAs: (v) => (v === '' || isNaN(v) ? null : parseFloat(v)),
                })}
              />
            </div>

            {/* Live Preview Peta */}
            {(mapsUrl || (lat && lng) || currentAddress) && (
              <div className="mt-2">
                <p className="text-xs font-semibold text-slate-600 mb-1.5">Pratinjau Lokasi:</p>
                <GoogleMapsPreview
                  url={mapsUrl}
                  latitude={lat}
                  longitude={lng}
                  address={currentAddress}
                  name={propName}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="gradient-emerald-glow shadow-emerald-glow cursor-pointer"
          >
            {editingProperty ? 'Simpan Perubahan' : 'Tambah Properti'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
