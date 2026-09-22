'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface InvoiceItemRowProps {
  index: number;
  register: UseFormRegister<any>;
  errors?: FieldErrors<any>;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export const InvoiceItemRow: React.FC<InvoiceItemRowProps> = ({
  index,
  register,
  errors,
  onRemove,
  canRemove,
}) => {
  const itemErrors = (errors?.items as any)?.[index];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex-1 w-full">
        <Input
          placeholder="Keterangan item (contoh: Sewa Kamar, Listrik)"
          error={itemErrors?.description?.message}
          {...register(`items.${index}.description`)}
        />
      </div>

      <div className="w-full sm:w-36">
        <Select
          error={itemErrors?.item_type?.message}
          {...register(`items.${index}.item_type`)}
        >
          <option value="sewa">Sewa</option>
          <option value="deposit">Deposit</option>
          <option value="listrik">Listrik</option>
          <option value="air">Air</option>
          <option value="denda">Denda</option>
          <option value="lain_lain">Lain-lain</option>
        </Select>
      </div>

      <div className="w-full sm:w-36">
        <Input
          type="number"
          placeholder="Nominal"
          error={itemErrors?.amount?.message}
          {...register(`items.${index}.amount`, { valueAsNumber: true })}
        />
      </div>

      {canRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors shrink-0 self-end sm:self-center cursor-pointer"
          title="Hapus baris"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
