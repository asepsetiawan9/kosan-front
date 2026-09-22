'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, MessageSquareWarning, Filter, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { Complaint } from '@/lib/types';
import { ComplaintCard } from '@/components/tenant/ComplaintCard';

export default function TenantComplaintsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: complaints, isLoading } = useQuery<Complaint[]>({
    queryKey: ['tenant-complaints', statusFilter],
    queryFn: async () => {
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await apiRequest<{ data: Complaint[] }>(`/tenant/complaints${query}`);
      return res.data;
    },
  });

  const filterTabs = [
    { id: 'all', label: 'Semua Aduan' },
    { id: 'baru', label: 'Baru Masuk' },
    { id: 'diproses', label: 'Sedang Diproses' },
    { id: 'selesai', label: 'Selesai Ditangani' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Aduan & Keluhan Fasilitas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Laporkan kendala fasilitas kamar atau area umum kos dan pantau status perbaikannya.
          </p>
        </div>

        <Link
          href="/portal/complaints/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-md shadow-indigo-200 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Ajukan Aduan Baru</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              statusFilter === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Memuat daftar aduan...</div>
      ) : !complaints || complaints.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center shadow-soft-card max-w-md mx-auto">
          <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-3" />
          <h3 className="font-bold text-slate-800 text-base">Tidak Ada Aduan</h3>
          <p className="text-xs text-slate-400 mt-1">
            {statusFilter === 'all'
              ? 'Anda belum pernah mengajukan aduan atau fasilitas saat ini dalam kondisi prima.'
              : `Tidak ada tiket aduan berstatus "${statusFilter}".`}
          </p>
          <Link
            href="/portal/complaints/new"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Aduan Pertama</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map((comp) => (
            <ComplaintCard key={comp.id} complaint={comp} />
          ))}
        </div>
      )}
    </div>
  );
}
