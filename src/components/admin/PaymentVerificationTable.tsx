'use client';

import React from 'react';
import { CreditCard, Building, Clock, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { Payment } from '@/lib/types';
import { formatRupiah } from '@/lib/api';

interface PaymentVerificationTableProps {
  payments: Payment[];
  isLoading: boolean;
  onSelectPayment: (payment: Payment) => void;
}

export const PaymentVerificationTable: React.FC<PaymentVerificationTableProps> = ({
  payments,
  isLoading,
  onSelectPayment,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-card overflow-hidden">
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Memuat data transaksi...</div>
      ) : payments.length === 0 ? (
        <div className="p-12 text-center">
          <CreditCard className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-800 text-base">Tidak Ada Transaksi</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Belum ada data pembayaran yang sesuai dengan kriteria pencarian Anda.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Invoice & Kamar</th>
                <th className="py-3.5 px-6">Penyewa</th>
                <th className="py-3.5 px-6">Metode & Nominal</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Waktu & Verifikator</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {payments.map((p) => {
                const isManual = p.method === 'manual_transfer';

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Invoice & Room */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">
                        {p.invoice?.invoice_number || '-'}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>
                          {p.invoice?.tenancy?.room?.room_number
                            ? `Kamar ${p.invoice.tenancy.room.room_number}`
                            : 'Kamar -'}
                        </span>
                      </div>
                    </td>

                    {/* Tenant */}
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">
                        {p.invoice?.tenancy?.tenant_name || '-'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {p.invoice?.tenancy?.tenant_phone || '-'}
                      </p>
                    </td>

                    {/* Method & Amount */}
                    <td className="py-4 px-6">
                      <p className="font-black text-slate-900 text-sm">
                        {formatRupiah(p.amount)}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-semibold capitalize mt-0.5">
                        {isManual ? 'Transfer Bank' : `Gateway (${p.gateway_provider || 'online'})`}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      {p.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" />
                          <span>Menunggu Verifikasi</span>
                        </span>
                      )}
                      {p.status === 'success' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Lunas / Berhasil</span>
                        </span>
                      )}
                      {p.status === 'failed' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                          <XCircle className="w-3 h-3" />
                          <span>Ditolak / Gagal</span>
                        </span>
                      )}
                    </td>

                    {/* Date & Verifier */}
                    <td className="py-4 px-6 text-slate-500">
                      <p className="font-medium text-[11px]">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID') : '-'}
                      </p>
                      {p.verified_by ? (
                        <p className="text-[10px] text-slate-400">
                          Verifikator: {p.verified_by.name}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400">Otomatis Sistem</p>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectPayment(p)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          p.status === 'pending'
                            ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{p.status === 'pending' ? 'Verifikasi' : 'Detail'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
