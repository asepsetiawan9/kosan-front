'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  DoorClosed, 
  Users, 
  Receipt, 
  CheckCircle2, 
  PlusCircle, 
  ArrowUpRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { apiRequest, formatRupiah } from '@/lib/api';
import { Room, Tenancy, Invoice } from '@/lib/types';

export default function DashboardOverviewPage() {
  const { data: roomsData, isLoading: loadingRooms } = useQuery<{ data: Room[] }>({
    queryKey: ['rooms'],
    queryFn: () => apiRequest<{ data: Room[] }>('admin/rooms'),
  });

  const { data: tenanciesData, isLoading: loadingTenancies } = useQuery<{ data: Tenancy[] }>({
    queryKey: ['tenancies'],
    queryFn: () => apiRequest<{ data: Tenancy[] }>('admin/tenancies'),
  });

  const { data: invoicesData, isLoading: loadingInvoices } = useQuery<{ data: Invoice[] }>({
    queryKey: ['invoices'],
    queryFn: () => apiRequest<{ data: Invoice[] }>('admin/invoices'),
  });

  const rooms = roomsData?.data || [];
  const tenancies = tenanciesData?.data || [];
  const invoices = invoicesData?.data || [];

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === 'kosong').length;
  const occupiedRooms = rooms.filter((r) => r.status === 'terisi').length;
  const unpaidInvoices = invoices.filter((i) => i.status === 'belum_bayar' || i.status === 'terlambat');
  const unpaidTotal = unpaidInvoices.reduce((sum, i) => sum + Number(i.total_amount), 0);

  const activeTenancies = tenancies.filter((t) => t.status === 'aktif');

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl p-6 md:p-8 gradient-fresh-horizon border border-slate-200/80 shadow-soft-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-100/80 px-2.5 py-1 rounded-full">
            Hospitality Overview
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-2">
            Selamat Datang di Portal KosanKu
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Pantau ketersediaan kamar secara real-time, pantau pembayaran sewa bulanan, dan kelola pendaftaran penyewa dengan mudah.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/rooms">
            <Button size="sm" variant="outline" className="bg-white">
              <DoorClosed className="w-4 h-4 text-teal-700" />
              Kelola Kamar
            </Button>
          </Link>
          <Link href="/dashboard/tenancies">
            <Button size="sm" className="gradient-emerald-glow shadow-emerald-glow">
              <PlusCircle className="w-4 h-4" />
              Daftar Penyewa
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <DoorClosed className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kamar</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
              {loadingRooms ? '...' : totalRooms}
            </h3>
            <span className="text-[11px] text-teal-700 font-medium">Unit properti terdaftar</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kamar Kosong</p>
            <h3 className="text-2xl font-bold text-emerald-700 mt-0.5">
              {loadingRooms ? '...' : availableRooms}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Siap disewa langsung</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 border border-sky-100">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kamar Terisi</p>
            <h3 className="text-2xl font-bold text-sky-800 mt-0.5">
              {loadingRooms ? '...' : occupiedRooms}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Okupansi {totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0}%
            </span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tagihan Tertunda</p>
            <h3 className="text-lg font-bold text-amber-900 mt-0.5">
              {loadingInvoices ? '...' : formatRupiah(unpaidTotal)}
            </h3>
            <span className="text-[11px] text-amber-700 font-medium">
              {unpaidInvoices.length} invoice belum lunas
            </span>
          </div>
        </Card>
      </div>

      {/* Two Column Layout: Recent Tenancies & Room Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tenancies List */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Penyewa Aktif Saat Ini</h3>
              <p className="text-xs text-slate-500">Daftar penyewa yang sedang menempati unit kosan</p>
            </div>
            <Link href="/dashboard/tenancies">
              <Button size="sm" variant="ghost" className="text-teal-700 gap-1 text-xs">
                Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {activeTenancies.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Belum ada penyewa aktif</p>
              <p className="text-xs text-slate-500 mt-0.5">Daftarkan penyewa baru melalui menu Penyewa & Sewa</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              {activeTenancies.slice(0, 5).map((tenancy) => (
                <div key={tenancy.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {tenancy.room?.room_number || 'KM'}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{tenancy.tenant_name}</h4>
                      <p className="text-xs text-slate-500">
                        No. Telp: {tenancy.tenant_phone} • Mulai: {tenancy.start_date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={tenancy.status} />
                    <p className="text-[11px] text-slate-400 mt-1">Jatuh tempo tgl {tenancy.billing_due_day}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Room Types Summary */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Katalog Tipe Kamar</h3>
              <TrendingUp className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-xs text-slate-500 mb-5">Distribusi inventaris tipe kamar kosan Anda</p>

            <div className="space-y-3.5">
              {[
                { type: 'standar', label: 'Standar', count: rooms.filter((r) => r.type === 'standar').length, color: 'bg-emerald-500' },
                { type: 'deluxe', label: 'Deluxe', count: rooms.filter((r) => r.type === 'deluxe').length, color: 'bg-teal-500' },
                { type: 'vip', label: 'VIP Eksekutif', count: rooms.filter((r) => r.type === 'vip').length, color: 'bg-indigo-500' },
                { type: 'paviliun', label: 'Paviliun Suite', count: rooms.filter((r) => r.type === 'paviliun').length, color: 'bg-amber-500' },
              ].map((item) => (
                <div key={item.type} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {item.count} unit
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link href="/dashboard/invoices">
              <Button variant="outline" className="w-full text-xs">
                <Receipt className="w-4 h-4 text-teal-600" />
                Lihat Tagihan Menunggak ({unpaidInvoices.length})
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
