'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  PlusCircle, 
  ArrowRight, 
  Receipt, 
  MessageSquareWarning, 
  Clock, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { apiRequest, formatRupiah } from '@/lib/api';
import { TenantProfile, Invoice, Complaint } from '@/lib/types';
import { ActiveBillCard } from '@/components/tenant/ActiveBillCard';
import { MyRoomCard } from '@/components/tenant/MyRoomCard';
import { ComplaintCard } from '@/components/tenant/ComplaintCard';

export default function TenantDashboardPage() {
  // 1. Fetch Tenant Profile
  const { data: profile, isLoading: profileLoading } = useQuery<TenantProfile>({
    queryKey: ['tenant-profile'],
    queryFn: async () => {
      const res = await apiRequest<{ data: TenantProfile }>('/tenant/profile');
      return res.data;
    },
  });

  // 2. Fetch Invoices for Active Bill Card
  const { data: invoices } = useQuery<Invoice[]>({
    queryKey: ['tenant-invoices'],
    queryFn: async () => {
      const res = await apiRequest<{ data: Invoice[] }>('/tenant/invoices');
      return res.data;
    },
  });

  // 3. Fetch Recent Complaints
  const { data: complaints } = useQuery<Complaint[]>({
    queryKey: ['tenant-complaints'],
    queryFn: async () => {
      const res = await apiRequest<{ data: Complaint[] }>('/tenant/complaints');
      return res.data;
    },
  });

  const unpaidInvoice = invoices?.find(
    (inv) => inv.status === 'belum_bayar' || inv.status === 'sebagian_dibayar' || inv.status === 'terlambat'
  );

  const recentComplaints = complaints?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 text-white shadow-lg shadow-indigo-950/20 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-indigo-100 backdrop-blur-sm inline-block mb-3">
            Portal Hunian Mandiri
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Halo, {profile?.name || 'Penghuni'}!
          </h1>
          <p className="mt-2 text-indigo-100 text-sm leading-relaxed">
            Kelola tagihan sewa bulanan dan ajukan keluhan kerusakan fasilitas kos secara mandiri di sini.
          </p>
        </div>

        {/* Decorative Circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Active Bill Alert */}
      <ActiveBillCard invoice={unpaidInvoice} totalUnpaid={profile?.stats?.total_unpaid_amount} />

      {/* Grid: My Room & Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Room Details */}
        <div className="lg:col-span-2 space-y-6">
          <MyRoomCard tenancy={profile?.active_tenancy} />

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/portal/invoices"
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft-card hover:border-indigo-300 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                    Semua Tagihan
                  </h4>
                  <p className="text-xs text-slate-400">Lihat histori & kwitansi pembayaran</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              href="/portal/complaints/new"
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft-card hover:border-indigo-300 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                    Lapor Kerusakan
                  </h4>
                  <p className="text-xs text-slate-400">Ajukan tiket fasilitas bermasalah</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Recent Complaints Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Aduan Terbaru</h3>
            <Link
              href="/portal/complaints"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentComplaints.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center shadow-soft-card">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="font-bold text-slate-800 text-sm">Tidak Ada Aduan</p>
              <p className="text-xs text-slate-400 mt-1">
                Semua fasilitas berfungsi optimal. Klik tombol di bawah jika ada kendala.
              </p>
              <Link
                href="/portal/complaints/new"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Buat Aduan</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentComplaints.map((comp) => (
                <ComplaintCard key={comp.id} complaint={comp} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
