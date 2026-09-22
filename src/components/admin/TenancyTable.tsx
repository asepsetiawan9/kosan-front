'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Phone, FileText, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Tenancy } from '@/lib/types';
import { formatRupiah } from '@/lib/api';

interface TenancyTableProps {
  tenancies: Tenancy[];
  isLoading: boolean;
  onCheckout: (tenancy: Tenancy) => void;
}

export const TenancyTable: React.FC<TenancyTableProps> = ({
  tenancies,
  isLoading,
  onCheckout,
}) => {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4 md:px-6">Kamar</th>
              <th className="py-3.5 px-4">Nama Penyewa & Kontak</th>
              <th className="py-3.5 px-4">Periode Mulai</th>
              <th className="py-3.5 px-4">Uang Deposit</th>
              <th className="py-3.5 px-4">Jatuh Tempo</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 md:px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Memuat data penyewa...
                </td>
              </tr>
            ) : tenancies.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Belum ada data penyewa terdaftar.
                </td>
              </tr>
            ) : (
              tenancies.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Kamar */}
                  <td className="py-3.5 px-4 md:px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {t.room?.room_number || 'KM'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">
                          Kamar {t.room?.room_number}
                        </span>
                        <p className="text-[11px] text-slate-400 capitalize">{t.room?.type}</p>
                      </div>
                    </div>
                  </td>

                  {/* Nama & Kontak */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 block">{t.tenant_name}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {t.tenant_phone}
                    </span>
                  </td>

                  {/* Periode */}
                  <td className="py-3.5 px-4">
                    <div className="text-xs text-slate-700 font-medium">{t.start_date}</div>
                    {t.checkout_date && (
                      <div className="text-[11px] text-rose-600 mt-0.5">
                        Checkout: {t.checkout_date}
                      </div>
                    )}
                  </td>

                  {/* Uang Deposit */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">
                      {formatRupiah(t.deposit_amount)}
                    </span>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                      Status: {t.deposit_status}
                    </span>
                  </td>

                  {/* Jatuh Tempo */}
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    Tgl {t.billing_due_day} / bln
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={t.status} />
                  </td>

                  {/* Aksi */}
                  <td className="py-3.5 px-4 md:px-6 text-right whitespace-nowrap">
                    <Link
                      href={`/dashboard/tenancies/${t.id}/contract`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-teal-200 text-teal-700 bg-teal-50/60 hover:bg-teal-100 text-xs font-semibold transition-colors mr-2 shadow-xs cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Kontrak</span>
                    </Link>

                    {t.status === 'aktif' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCheckout(t)}
                        className="border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Checkout
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Selesai</span>
                    )}
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
