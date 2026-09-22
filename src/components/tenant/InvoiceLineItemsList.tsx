'use client';

import React from 'react';
import { InvoiceItem } from '@/lib/types';
import { formatRupiah } from '@/lib/api';

interface InvoiceLineItemsListProps {
  items?: InvoiceItem[];
  totalAmount: number | string;
  paidAmount: number | string;
  remaining: number;
}

export const InvoiceLineItemsList: React.FC<InvoiceLineItemsListProps> = ({
  items = [],
  totalAmount,
  paidAmount,
  remaining,
}) => {
  return (
    <div className="space-y-6">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        Rincian Item Tagihan
      </h4>

      <div className="space-y-3">
        {items && items.length > 0 ? (
          items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-bold text-slate-800">{item.description}</p>
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider capitalize">
                  Kategori: {item.item_type}
                </span>
              </div>
              <p className="text-sm font-extrabold text-slate-900">{formatRupiah(item.amount)}</p>
            </div>
          ))
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-xs">
            Sewa Pokok Kamar: {formatRupiah(totalAmount)}
          </div>
        )}
      </div>

      {/* Subtotal & Totals Breakdown */}
      <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Total Tagihan</span>
          <span className="font-bold text-slate-900">{formatRupiah(totalAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Jumlah Terbayar</span>
          <span className="font-bold text-emerald-700">{formatRupiah(paidAmount)}</span>
        </div>
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-base font-extrabold">
          <span className="text-slate-900">Sisa Tagihan yang Harus Dibayar</span>
          <span className={remaining > 0 ? 'text-amber-800' : 'text-emerald-700'}>
            {formatRupiah(remaining > 0 ? remaining : 0)}
          </span>
        </div>
      </div>
    </div>
  );
};
