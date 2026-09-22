'use client';

import React from 'react';
import { Receipt, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Invoice } from '@/lib/types';
import { formatRupiah } from '@/lib/api';

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading: boolean;
  onQuickStatus: (invoice: Invoice, newStatus: string) => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  isLoading,
  onQuickStatus,
}) => {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4 md:px-6">No. Tagihan</th>
              <th className="py-3.5 px-4">Penyewa & Kamar</th>
              <th className="py-3.5 px-4">Periode</th>
              <th className="py-3.5 px-4">Total Biaya</th>
              <th className="py-3.5 px-4">Jatuh Tempo</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 md:px-6 text-right">Ubah Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Memuat data tagihan...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Belum ada data tagihan.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* No Tagihan */}
                  <td className="py-3.5 px-4 md:px-6">
                    <span className="font-mono font-bold text-slate-900 text-xs block">
                      {inv.invoice_number}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {inv.items?.length || 0} rincian biaya
                    </span>
                  </td>

                  {/* Penyewa & Kamar */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 block">
                      {inv.tenancy?.tenant_name || 'Penyewa'}
                    </span>
                    <span className="text-xs text-teal-700 font-medium">
                      Kamar {inv.tenancy?.room?.room_number || '-'}
                    </span>
                  </td>

                  {/* Periode */}
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {inv.period}
                  </td>

                  {/* Total */}
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {formatRupiah(inv.total_amount)}
                  </td>

                  {/* Jatuh Tempo */}
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    {inv.due_date}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={inv.status} />
                  </td>

                  {/* Aksi Ubah Status */}
                  <td className="py-3.5 px-4 md:px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {inv.status !== 'lunas' && (
                        <button
                          onClick={() => onQuickStatus(inv, 'lunas')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                          title="Tandai Lunas"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Lunas
                        </button>
                      )}
                      {inv.status === 'lunas' && (
                        <button
                          onClick={() => onQuickStatus(inv, 'belum_bayar')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                          title="Reset Belum Bayar"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
