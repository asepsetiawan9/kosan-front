'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Tenancy } from '@/lib/types';
import { formatRupiah } from '@/lib/api';

export const checkoutSchema = z.object({
  checkout_date: z.string().min(1, 'Tanggal checkout wajib diisi'),
  deposit_deduction: z.number().min(0, 'Potongan tidak boleh negatif'),
  deduction_reason: z.string().optional(),
  next_room_status: z.enum(['kosong', 'maintenance']),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTenancy: Tenancy | null;
  onSubmit: (values: CheckoutFormValues) => Promise<void> | void;
  errorMessage: string | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedTenancy,
  onSubmit,
  errorMessage,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      checkout_date: new Date().toISOString().split('T')[0],
      deposit_deduction: 0,
      deduction_reason: '',
      next_room_status: 'kosong',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        checkout_date: new Date().toISOString().split('T')[0],
        deposit_deduction: 0,
        deduction_reason: '',
        next_room_status: 'kosong',
      });
    }
  }, [isOpen, reset]);

  const currentDeduction = watch('deposit_deduction') || 0;
  const depositRefund = selectedTenancy
    ? Math.max(0, selectedTenancy.deposit_amount - currentDeduction)
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Proses Checkout Kamar ${selectedTenancy?.room?.room_number || ''}`}
      description="Pemeriksaan akhir deposit dan pelepasan status hunian kamar"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {errorMessage}
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Nama Penyewa:</span>
            <span className="font-bold text-slate-800">{selectedTenancy?.tenant_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Uang Deposit Tercatat:</span>
            <span className="font-bold text-slate-800">
              {formatRupiah(selectedTenancy?.deposit_amount || 0)}
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-200 text-emerald-700">
            <span className="font-semibold">Estimasi Pengembalian:</span>
            <span className="font-bold">{formatRupiah(depositRefund)}</span>
          </div>
        </div>

        <Input
          label="Tanggal Checkout *"
          type="date"
          error={errors.checkout_date?.message}
          {...register('checkout_date')}
        />

        <Input
          label="Potongan Uang Jaminan / Kerusakan (Rp)"
          type="number"
          placeholder="0"
          error={errors.deposit_deduction?.message}
          {...register('deposit_deduction', { valueAsNumber: true })}
        />

        <div>
          <label className="text-xs font-semibold text-slate-700 mb-1 block">
            Catatan Alasan Potongan (Jika Ada)
          </label>
          <textarea
            rows={2}
            placeholder="Contoh: Penggantian kunci kamar hilang, kebersihan, dll..."
            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
            {...register('deduction_reason')}
          />
        </div>

        <Select
          label="Status Kamar Setelah Checkout *"
          error={errors.next_room_status?.message}
          {...register('next_room_status')}
        >
          <option value="kosong">Kembalikan ke 'Kosong' (Siap disewakan)</option>
          <option value="maintenance">Pindahkan ke 'Perbaikan' (Butuh renovasi/pembersihan)</option>
        </Select>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="danger"
            isLoading={isSubmitting}
            className="cursor-pointer"
          >
            Konfirmasi Selesai Sewa
          </Button>
        </div>
      </form>
    </Modal>
  );
};
