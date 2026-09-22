'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Room } from '@/lib/types';
import { formatRupiah } from '@/lib/api';

export const tenancySchema = z.object({
  room_id: z.string().min(1, 'Pilih kamar yang akan disewa'),
  tenant_name: z.string().min(2, 'Nama penyewa wajib diisi'),
  tenant_phone: z.string().min(8, 'Nomor telepon/WhatsApp wajib diisi'),
  tenant_email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  start_date: z.string().min(1, 'Tanggal mulai sewa wajib diisi'),
  billing_due_day: z.number().min(1).max(31, 'Tanggal jatuh tempo 1 - 31'),
  deposit_amount: z.number().min(0, 'Deposit tidak boleh negatif'),
  create_first_invoice: z.boolean().optional(),
});

export type TenancyFormValues = {
  room_id: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_email?: string;
  start_date: string;
  billing_due_day: number;
  deposit_amount: number;
  create_first_invoice?: boolean;
};

interface TenancyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableRooms: Room[];
  onSubmit: (values: TenancyFormValues) => Promise<void> | void;
  errorMessage: string | null;
}

export const TenancyFormModal: React.FC<TenancyFormModalProps> = ({
  isOpen,
  onClose,
  availableRooms,
  onSubmit,
  errorMessage,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TenancyFormValues>({
    resolver: zodResolver(tenancySchema),
    defaultValues: {
      billing_due_day: 1,
      deposit_amount: 500000,
      create_first_invoice: true,
      start_date: new Date().toISOString().split('T')[0],
      tenant_name: '',
      tenant_phone: '',
      tenant_email: '',
      room_id: '',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        billing_due_day: 1,
        deposit_amount: 500000,
        create_first_invoice: true,
        start_date: new Date().toISOString().split('T')[0],
        tenant_name: '',
        tenant_phone: '',
        tenant_email: '',
        room_id: '',
      });
    }
  }, [isOpen, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrasi Penyewa Baru"
      description="Pilih kamar kosong dan isi kelengkapan profil penghuni untuk aktivasi sewa"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {errorMessage}
          </div>
        )}

        <Select
          label="Pilih Kamar Kosong *"
          error={errors.room_id?.message}
          {...register('room_id')}
        >
          <option value="">-- Pilih Kamar Tersedia --</option>
          {availableRooms.map((room) => (
            <option key={room.id} value={room.id}>
              Kamar {room.room_number} ({room.type.toUpperCase()}) — {formatRupiah(room.base_price)}/bln
            </option>
          ))}
        </Select>

        <Input
          label="Nama Lengkap Penyewa *"
          placeholder="Contoh: Budi Santoso"
          error={errors.tenant_name?.message}
          {...register('tenant_name')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nomor WhatsApp / HP *"
            placeholder="081234567890"
            error={errors.tenant_phone?.message}
            {...register('tenant_phone')}
          />

          <Input
            label="Alamat Email (Opsional)"
            type="email"
            placeholder="budi@example.com"
            error={errors.tenant_email?.message}
            {...register('tenant_email')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tanggal Mulai Sewa *"
            type="date"
            error={errors.start_date?.message}
            {...register('start_date')}
          />

          <Input
            label="Tanggal Jatuh Tempo Bulanan (1–31) *"
            type="number"
            min={1}
            max={31}
            error={errors.billing_due_day?.message}
            {...register('billing_due_day', { valueAsNumber: true })}
          />
        </div>

        <Input
          label="Nominal Uang Jaminan / Deposit Awal (Rp)"
          type="number"
          placeholder="500000"
          error={errors.deposit_amount?.message}
          {...register('deposit_amount', { valueAsNumber: true })}
        />

        <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/70 flex items-start gap-3">
          <input
            type="checkbox"
            id="create_first_invoice"
            className="mt-1 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
            {...register('create_first_invoice')}
          />
          <label htmlFor="create_first_invoice" className="text-xs text-teal-900 cursor-pointer">
            <span className="font-bold block">Terbitkan Tagihan Pertama Otomatis</span>
            Sistem akan membuat tagihan sewa bulan ke-1 beserta deposit secara otomatis dalam 1 transaksi database.
          </label>
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
            Simpan & Aktifkan Sewa
          </Button>
        </div>
      </form>
    </Modal>
  );
};
