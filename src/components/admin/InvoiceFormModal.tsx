'use client';

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { InvoiceItemRow } from '@/components/admin/InvoiceItemRow';
import { Tenancy } from '@/lib/types';
import { formatRupiah } from '@/lib/api';

const itemSchema = z.object({
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  amount: z.number().min(1000, 'Nominal minimal Rp 1.000'),
  item_type: z.enum(['sewa', 'deposit', 'listrik', 'air', 'denda', 'lain_lain']),
});

export const invoiceSchema = z.object({
  tenancy_id: z.string().min(1, 'Pilih penyewa'),
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Format periode YYYY-MM'),
  due_date: z.string().min(1, 'Tanggal jatuh tempo wajib diisi'),
  items: z.array(itemSchema).min(1, 'Minimal 1 baris rincian item'),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTenancies: Tenancy[];
  onSubmit: (values: InvoiceFormValues) => Promise<void> | void;
  errorMessage: string | null;
}

export const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({
  isOpen,
  onClose,
  activeTenancies,
  onSubmit,
  errorMessage,
}) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      tenancy_id: '',
      period: new Date().toISOString().slice(0, 7),
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ description: 'Biaya Sewa Kamar Bulanan', amount: 1500000, item_type: 'sewa' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        tenancy_id: '',
        period: new Date().toISOString().slice(0, 7),
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [{ description: 'Biaya Sewa Kamar Bulanan', amount: 1500000, item_type: 'sewa' }],
      });
    }
  }, [isOpen, reset]);

  const watchItems = watch('items') || [];
  const totalCalculated = watchItems.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Penerbitan Tagihan Manual"
      description="Rincikan komponen biaya sewa, iuran air, listrik, denda, atau deposit"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {errorMessage}
          </div>
        )}

        <Select
          label="Pilih Penyewa Aktif *"
          error={errors.tenancy_id?.message}
          {...register('tenancy_id')}
        >
          <option value="">-- Pilih Penyewa / Kamar --</option>
          {activeTenancies.map((t) => (
            <option key={t.id} value={t.id}>
              {t.tenant_name} — Kamar {t.room?.room_number} (Tgl {t.billing_due_day}/bln)
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Periode Tagihan (YYYY-MM) *"
            type="month"
            error={errors.period?.message}
            {...register('period')}
          />

          <Input
            label="Batas Akhir Bayar (Jatuh Tempo) *"
            type="date"
            error={errors.due_date?.message}
            {...register('due_date')}
          />
        </div>

        {/* Line Items Repeater */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Rincian Item Biaya (Line Items) *
            </label>
            <button
              type="button"
              onClick={() => append({ description: '', amount: 0, item_type: 'lain_lain' })}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Baris
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {fields.map((field, index) => (
              <InvoiceItemRow
                key={field.id}
                index={index}
                register={register}
                errors={errors}
                onRemove={remove}
                canRemove={fields.length > 1}
              />
            ))}
          </div>

          {errors.items?.message && (
            <p className="text-xs text-rose-600">{errors.items.message}</p>
          )}
        </div>

        {/* Total Calculation */}
        <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between text-teal-950">
          <span className="text-xs font-medium">Total Akumulasi Tagihan:</span>
          <span className="text-lg font-black text-teal-800">
            {formatRupiah(totalCalculated)}
          </span>
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
            Terbitkan Tagihan Sekarang
          </Button>
        </div>
      </form>
    </Modal>
  );
};
