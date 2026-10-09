'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  CheckCircle2, 
  Image as ImageIcon,
  Loader2,
  Users,
  Globe,
  Phone
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { Complaint, ComplaintStatus, PublicComplaint, PublicComplaintStatus } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function AdminComplaintsPage() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'tenant' | 'public'>('tenant');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // Selected complaint for response modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedPublicComplaint, setSelectedPublicComplaint] = useState<PublicComplaint | null>(null);

  const [newStatus, setNewStatus] = useState<ComplaintStatus>('diproses');
  const [newPublicStatus, setNewPublicStatus] = useState<PublicComplaintStatus>('diproses');
  const [adminResponse, setAdminResponse] = useState<string>('');
  const [modalImagePreview, setModalImagePreview] = useState<string | null>(null);

  // Fetch Tenant complaints
  const { data: tenantData, isLoading: isLoadingTenant } = useQuery<{ data: Complaint[]; meta: { total: number } }>({
    queryKey: ['admin-complaints', statusFilter, categoryFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (search.trim()) params.append('search', search.trim());

      return apiRequest<{ data: Complaint[]; meta: { total: number } }>(
        `/admin/complaints?${params.toString()}`
      );
    },
    enabled: activeTab === 'tenant',
  });

  // Fetch Public complaints
  const { data: publicData, isLoading: isLoadingPublic } = useQuery<{ data: PublicComplaint[]; meta: { total: number } }>({
    queryKey: ['admin-public-complaints', statusFilter, categoryFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (search.trim()) params.append('search', search.trim());

      return apiRequest<{ data: PublicComplaint[]; meta: { total: number } }>(
        `/admin/public-complaints?${params.toString()}`
      );
    },
    enabled: activeTab === 'public',
  });

  const tenantComplaints = tenantData?.data || [];
  const publicComplaints = publicData?.data || [];

  // Update tenant complaint mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, status, admin_response }: { id: string; status: ComplaintStatus; admin_response: string }) => {
      return apiRequest(`/admin/complaints/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, admin_response }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-complaints'] });
      setSelectedComplaint(null);
    },
  });

  // Update public complaint mutation
  const updatePublicMutation = useMutation({
    mutationFn: async ({ id, status, admin_response }: { id: string; status: PublicComplaintStatus; admin_response: string }) => {
      return apiRequest(`/admin/public-complaints/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, admin_response }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-public-complaints'] });
      setSelectedPublicComplaint(null);
    },
  });

  const handleOpenTenantModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setAdminResponse(complaint.admin_response || '');
  };

  const handleOpenPublicModal = (complaint: PublicComplaint) => {
    setSelectedPublicComplaint(complaint);
    setNewPublicStatus(complaint.status);
    setAdminResponse(complaint.admin_response || '');
  };

  const handleSaveTenantResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    updateMutation.mutate({
      id: selectedComplaint.id,
      status: newStatus,
      admin_response: adminResponse,
    });
  };

  const handleSavePublicResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPublicComplaint) return;

    updatePublicMutation.mutate({
      id: selectedPublicComplaint.id,
      status: newPublicStatus,
      admin_response: adminResponse,
    });
  };

  const getFullPhotoUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001';
    return `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const isLoading = activeTab === 'tenant' ? isLoadingTenant : isLoadingPublic;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pusat Aduan & Penanganan Kendala
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau dan tangani tiket keluhan fasilitas dari penghuni kos dan laporan publik secara terpadu.
          </p>
        </div>

        {/* Source Tabs Switcher */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('tenant');
              setStatusFilter('all');
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tenant'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Aduan Penghuni (Portal)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('public');
              setStatusFilter('all');
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'public'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Aduan Publik (Halaman Utama)</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft-card flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {(activeTab === 'tenant' 
            ? ['all', 'baru', 'diproses', 'selesai'] 
            : ['all', 'baru', 'diproses', 'selesai', 'ditolak']
          ).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 cursor-pointer ${
                statusFilter === st
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'all' ? 'Semua Status' : st}
            </button>
          ))}
        </div>

        {/* Category & Search Input */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:bg-white outline-none cursor-pointer"
          >
            <option value="all">Semua Kategori</option>
            <option value="fasilitas_rusak">Fasilitas Rusak</option>
            <option value="kebersihan">Kebersihan</option>
            <option value="keamanan">Keamanan</option>
            {activeTab === 'public' && <option value="air_listrik">Air / Listrik</option>}
            <option value="lainnya">Lainnya</option>
          </select>

          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari keluhan atau nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 outline-none"
            />
          </div>
        </div>
      </div>

      {/* CONTENT: TENANT COMPLAINTS TABLE */}
      {activeTab === 'tenant' && (
        isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Memuat data aduan penghuni...</div>
        ) : tenantComplaints.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center shadow-soft-card">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-3" />
            <h3 className="font-bold text-slate-800 text-base">Tidak Ada Aduan Penghuni Ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1">
              Semua fasilitas dalam kondisi normal atau tidak ada data yang cocok dengan filter.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Penghuni & Kamar</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Rincian Keluhan</th>
                    <th className="py-3.5 px-4">Lampiran</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Tanggal Masuk</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenantComplaints.map((comp) => {
                    const roomNumber = comp.tenancy?.room?.room_number || '-';
                    const tenantName = comp.tenancy?.tenant_name || 'Penghuni';
                    const tenantPhone = comp.tenancy?.tenant_phone || '';

                    return (
                      <tr key={comp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-bold text-slate-900">{tenantName}</p>
                          <p className="text-[11px] text-emerald-700 font-semibold">Kamar {roomNumber}</p>
                          {tenantPhone && <p className="text-[10px] text-slate-400">{tenantPhone}</p>}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/70 capitalize">
                            {comp.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="line-clamp-2 text-slate-800 text-xs">{comp.description}</p>
                          {comp.admin_response && (
                            <p className="text-[11px] text-indigo-700 font-medium mt-1 truncate">
                              ↳ Respon: {comp.admin_response}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {comp.photo_url ? (
                            <button
                              type="button"
                              onClick={() => setModalImagePreview(comp.photo_url || null)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>Lihat Foto</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <StatusBadge status={comp.status} />
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                          {comp.created_at ? new Date(comp.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }) : '-'}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenTenantModal(comp)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-xs transition-colors cursor-pointer"
                          >
                            Tanggapi
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* CONTENT: PUBLIC COMPLAINTS TABLE */}
      {activeTab === 'public' && (
        isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Memuat data aduan publik...</div>
        ) : publicComplaints.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center shadow-soft-card">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-3" />
            <h3 className="font-bold text-slate-800 text-base">Tidak Ada Aduan Publik Ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1">
              Belum ada keluhan masuk dari formulir aduan publik halaman beranda.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Pelapor (Publik)</th>
                    <th className="py-3.5 px-4">Kosan / Unit</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Rincian Keluhan</th>
                    <th className="py-3.5 px-4">Lampiran</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Tanggal Masuk</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {publicComplaints.map((comp) => {
                    const propName = comp.property?.name || 'Umum';
                    const roomInfo = comp.room_number ? `Kamar ${comp.room_number}` : '-';

                    return (
                      <tr key={comp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-bold text-slate-900">{comp.reporter_name}</p>
                          <a 
                            href={`https://wa.me/${comp.reporter_phone.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-teal-700 font-semibold hover:underline"
                          >
                            <Phone className="w-3 h-3" />
                            {comp.reporter_phone}
                          </a>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-semibold text-slate-800">{propName}</p>
                          <p className="text-[11px] text-slate-500">{roomInfo}</p>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/70 capitalize">
                            {comp.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="line-clamp-2 text-slate-800 text-xs">{comp.description}</p>
                          {comp.admin_response && (
                            <p className="text-[11px] text-indigo-700 font-medium mt-1 truncate">
                              ↳ Respon: {comp.admin_response}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {comp.photos && comp.photos.length > 0 ? (
                            <div className="flex items-center gap-1">
                              {comp.photos.map((photoUrl, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() => setModalImagePreview(photoUrl)}
                                  className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200 hover:opacity-80 transition-opacity"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={getFullPhotoUrl(photoUrl)} alt="Thumbnail" className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <StatusBadge status={comp.status} />
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                          {comp.created_at ? new Date(comp.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }) : '-'}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenPublicModal(comp)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-xs transition-colors cursor-pointer"
                          >
                            Tanggapi
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Response Modal for Tenant Complaint */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-soft-modal border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Tanggapi Aduan Penghuni</h3>
                <p className="text-xs text-slate-500">
                  {selectedComplaint.tenancy?.tenant_name} • Kamar {selectedComplaint.tenancy?.room?.room_number}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTenantResponse} className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Keluhan Penghuni ({selectedComplaint.category.replace('_', ' ')}):
                </span>
                <p className="text-slate-800 whitespace-pre-line leading-relaxed">
                  {selectedComplaint.description}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Ubah Status Penanganan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['baru', 'diproses', 'selesai'] as ComplaintStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${
                        newStatus === st
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Catatan Tindakan / Respon untuk Penghuni
                </label>
                <textarea
                  rows={3}
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Contoh: Teknisi telah dikonfirmasi dan akan datang hari ini pukul 14.00 WIB untuk perbaikan..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  {updateMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Response Modal for Public Complaint */}
      {selectedPublicComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-soft-modal border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Tanggapi Aduan Publik</h3>
                <p className="text-xs text-slate-500">
                  {selectedPublicComplaint.reporter_name} • {selectedPublicComplaint.reporter_phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPublicComplaint(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePublicResponse} className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">
                    Keluhan ({selectedPublicComplaint.category.replace('_', ' ')})
                  </span>
                  <span className="text-[11px] text-teal-700 font-semibold">
                    {selectedPublicComplaint.property?.name || 'Lokasi Kosan'} {selectedPublicComplaint.room_number ? `(${selectedPublicComplaint.room_number})` : ''}
                  </span>
                </div>
                <p className="text-slate-800 whitespace-pre-line leading-relaxed">
                  {selectedPublicComplaint.description}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Ubah Status Penanganan
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['baru', 'diproses', 'selesai', 'ditolak'] as PublicComplaintStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewPublicStatus(st)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${
                        newPublicStatus === st
                          ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Catatan Tindakan / Respon Admin
                </label>
                <textarea
                  rows={3}
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Contoh: Petugas keamanan sudah memeriksa lokasi dan menertibkan area parkir..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-600 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPublicComplaint(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updatePublicMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 transition-colors flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  {updatePublicMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Lightbox */}
      {modalImagePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-soft-modal border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h5 className="font-bold text-slate-900 text-sm">Foto Bukti Keluhan</h5>
              <button
                type="button"
                onClick={() => setModalImagePreview(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-slate-50 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={getFullPhotoUrl(modalImagePreview)}
                alt="Foto Bukti Keluhan"
                className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
