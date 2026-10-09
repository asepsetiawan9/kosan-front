'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FacilityPicker } from '@/components/admin/FacilityPicker';
import { RoomImageUploader } from '@/components/admin/RoomImageUploader';
import { Room, Facility, Property } from '@/lib/types';

const roomSchema = z.object({
  property_id: z.string().optional().or(z.literal('')),
  room_number: z.string().min(1, 'Nomor kamar wajib diisi'),
  name: z.string().min(2, 'Nama kamar wajib diisi'),
  type: z.enum(['standar', 'deluxe', 'vip', 'paviliun']),
  base_price: z.number().min(100000, 'Harga minimal Rp 100.000'),
  description: z.string().optional(),
  status: z.enum(['kosong', 'dipesan', 'terisi', 'maintenance']).optional(),
  facility_ids: z.array(z.string()).optional(),
});

export type RoomFormValues = z.infer<typeof roomSchema> & {
  photoFile?: File | null;
};

interface RoomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRoom: Room | null;
  facilities: Facility[];
  properties?: Property[];
  onSubmit: (values: RoomFormValues) => Promise<void>;
  errorMessage: string | null;
}

export const RoomFormModal: React.FC<RoomFormModalProps> = ({
  isOpen,
  onClose,
  editingRoom,
  facilities,
  properties = [],
  onSubmit,
  errorMessage,
}) => {
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof roomSchema>>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      property_id: editingRoom?.property_id || '',
      room_number: editingRoom?.room_number || '',
      name: editingRoom?.name || '',
      type: (editingRoom?.type as any) || 'standar',
      base_price: Number(editingRoom?.base_price) || 1500000,
      description: editingRoom?.description || '',
      status: (editingRoom?.status as any) || 'kosong',
      facility_ids: editingRoom?.facilities?.map((f) => f.id) || [],
    },
  });

  React.useEffect(() => {
    if (editingRoom) {
      setPhotoFile(null);
      setExistingImageUrl(editingRoom.primary_image || null);
      reset({
        property_id: editingRoom.property_id || '',
        room_number: editingRoom.room_number,
        name: editingRoom.name,
        type: editingRoom.type as any,
        base_price: Number(editingRoom.base_price),
        description: editingRoom.description || '',
        status: editingRoom.status as any,
        facility_ids: editingRoom.facilities?.map((f) => f.id) || [],
      });
    } else {
      setPhotoFile(null);
      setExistingImageUrl(null);
      reset({
        property_id: '',
        room_number: '',
        name: '',
        type: 'standar',
        base_price: 1500000,
        description: '',
        status: 'kosong',
        facility_ids: [],
      });
    }
  }, [editingRoom, reset]);

  const selectedFacilityIds = watch('facility_ids') || [];

  const toggleFacility = (facilityId: string) => {
    const current = selectedFacilityIds;
    const next = current.includes(facilityId)
      ? current.filter((id) => id !== facilityId)
      : [...current, facilityId];
    setValue('facility_ids', next, { shouldValidate: true });
  };

  const handleFormSubmit = async (values: z.infer<typeof roomSchema>) => {
    await onSubmit({
      ...values,
      photoFile,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRoom ? `Edit Kamar ${editingRoom.room_number}` : 'Tambah Kamar Baru'}
      description="Lengkapi detail ruangan, tipe, harga sewa, dan fasilitas yang tersedia"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {errorMessage}
          </div>
        )}

        {properties.length > 0 && (
          <div>
            <Select
              label="Properti / Gedung Kosan"
              error={errors.property_id?.message}
              {...register('property_id')}
            >
              <option value="">Pilih Gedung Properti (Opsional)</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.city ? `— ${p.city}` : ''}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nomor Kamar *"
            placeholder="Contoh: 101, 102, A1"
            error={errors.room_number?.message}
            {...register('room_number')}
          />

          <Input
            label="Nama / Label Kamar *"
            placeholder="Contoh: Kamar Deluxe Flamboyan"
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Tipe Kamar *" error={errors.type?.message} {...register('type')}>
            <option value="standar">Standar</option>
            <option value="deluxe">Deluxe</option>
            <option value="vip">VIP Eksekutif</option>
            <option value="paviliun">Paviliun Suite</option>
          </Select>

          <Input
            label="Harga Sewa / Bulan (Rp) *"
            type="number"
            placeholder="1500000"
            error={errors.base_price?.message}
            {...register('base_price', { valueAsNumber: true })}
          />
        </div>

        {editingRoom && (
          <Select label="Status Ketersediaan" error={errors.status?.message} {...register('status')}>
            <option value="kosong">Kosong (Tersedia untuk disewa)</option>
            <option value="terisi">Terisi (Sedang ada penyewa)</option>
            <option value="dipesan">Dipesan (Dalam Proses Booking)</option>
            <option value="maintenance">Perbaikan (Maintenance)</option>
          </Select>
        )}

        <RoomImageUploader
          file={photoFile}
          onChangeFile={(f) => {
            setPhotoFile(f);
            if (f) setExistingImageUrl(null);
          }}
          existingImageUrl={existingImageUrl}
          onRemoveExisting={() => {
            setExistingImageUrl(null);
            setPhotoFile(null);
          }}
        />

        <FacilityPicker
          facilities={facilities}
          selectedFacilityIds={selectedFacilityIds}
          onToggleFacility={toggleFacility}
        />

        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Deskripsi Kamar</label>
          <textarea
            rows={3}
            placeholder="Jelaskan ukuran kamar, spesifikasi jendela, arah pencahayaan, dll..."
            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
            {...register('description')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="gradient-emerald-glow shadow-emerald-glow cursor-pointer"
          >
            {editingRoom ? 'Simpan Perubahan' : 'Buat Kamar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
