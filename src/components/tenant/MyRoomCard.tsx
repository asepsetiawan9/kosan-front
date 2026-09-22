'use client';

import React from 'react';
import { Home, Sparkles, Calendar, Key, Check } from 'lucide-react';
import { formatRupiah } from '@/lib/api';
import { TenantProfile } from '@/lib/types';

interface MyRoomCardProps {
  tenancy: TenantProfile['active_tenancy'];
}

export const MyRoomCard: React.FC<MyRoomCardProps> = ({ tenancy }) => {
  if (!tenancy || !tenancy.room) {
    return (
      <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 shadow-soft-card">
        <Home className="w-10 h-10 mx-auto text-slate-300 mb-2" />
        <p className="font-semibold text-slate-700">Tidak Ada Kamar Aktif</p>
        <p className="text-xs text-slate-400 mt-1">Saat ini Anda tidak memiliki masa sewa aktif.</p>
      </div>
    );
  }

  const { room } = tenancy;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-card overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Kamar {room.room_number}</h3>
            <p className="text-xs text-slate-500 capitalize">{room.name} • Tipe {room.type}</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          Sewa Aktif
        </span>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] text-slate-400 font-medium">Harga Sewa Pokok</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{formatRupiah(room.base_price)}/bln</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] text-slate-400 font-medium">Jatuh Tempo Bulanan</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">Tanggal {tenancy.billing_due_day}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
            <p className="text-[11px] text-slate-400 font-medium">Uang Jaminan (Deposit)</p>
            <p className="text-sm font-bold text-indigo-700 mt-0.5">{formatRupiah(tenancy.deposit_amount)}</p>
          </div>
        </div>

        {/* Fasilitas Kamar */}
        {room.facilities && room.facilities.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Fasilitas Kamar yang Disediakan:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {room.facilities.map((fac) => (
                <span
                  key={fac.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                >
                  <Check className="w-3 h-3 text-emerald-600" />
                  {fac.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Mulai Sewa: <strong className="text-slate-700 ml-1">{tenancy.start_date || '-'}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-slate-400" />
            Deposit: <strong className="text-slate-700 capitalize ml-1">{tenancy.deposit_status}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
