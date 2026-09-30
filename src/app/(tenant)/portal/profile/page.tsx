'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User as UserIcon, 
  Phone, 
  Mail, 
  Home, 
  ShieldCheck, 
  FileCheck2, 
  AlertCircle, 
  CheckCircle2, 
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { NikInput } from '@/components/ui/NikInput';
import { DocumentCard } from '@/components/tenant/DocumentCard';
import { DocumentUploaderModal } from '@/components/tenant/DocumentUploaderModal';
import { apiRequest } from '@/lib/api';
import { TenantProfile, TenantDocument, DocumentType } from '@/lib/types';

export default function TenantProfilePage() {
  const queryClient = useQueryClient();

  // State modal upload
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType>('ktp');
  const [previewDoc, setPreviewDoc] = useState<TenantDocument | null>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch profil penghuni
  const { data: profile, isLoading: isProfileLoading } = useQuery<TenantProfile>({
    queryKey: ['tenant-profile'],
    queryFn: async () => {
      const res = await apiRequest<{ data: TenantProfile }>('tenant/profile');
      return res.data;
    },
  });

  // Fetch dokumen penghuni
  const { data: documentsData, isLoading: isDocsLoading } = useQuery<{ data: TenantDocument[] }>({
    queryKey: ['tenant-documents'],
    queryFn: () => apiRequest<{ data: TenantDocument[] }>('tenant/documents'),
  });

  const documents = documentsData?.data || [];

  // Helper mencari dokumen berdasarkan tipe
  const getDoc = (type: DocumentType): TenantDocument | undefined => {
    return documents.find((d) => d.document_type === type);
  };

  // Mutation simpan NIK
  const saveNikMutation = useMutation({
    mutationFn: (nik: string) =>
      apiRequest('tenant/profile/nik', {
        method: 'PATCH',
        body: JSON.stringify({ nik }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-profile'] });
      setNotification({
        type: 'success',
        message: 'Nomor Induk Kependudukan (NIK) berhasil diperbarui.',
      });
      setTimeout(() => setNotification(null), 4000);
    },
    onError: (err: unknown) => {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Gagal menyimpan NIK.',
      });
    },
  });

  // Mutation upload dokumen
  const uploadDocMutation = useMutation({
    mutationFn: async ({ type, file }: { type: DocumentType; file: File }) => {
      const formData = new FormData();
      formData.append('document_type', type);
      formData.append('file', file);

      return apiRequest('tenant/documents', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-documents'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-profile'] });
      setNotification({
        type: 'success',
        message: 'Berkas identitas berhasil diunggah dan siap diverifikasi.',
      });
      setTimeout(() => setNotification(null), 4000);
    },
    onError: (err: unknown) => {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Gagal mengunggah berkas.',
      });
    },
  });

  // Mutation hapus dokumen
  const deleteDocMutation = useMutation({
    mutationFn: (docId: string) =>
      apiRequest(`tenant/documents/${docId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-documents'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-profile'] });
      setNotification({
        type: 'success',
        message: 'Berkas berhasil dihapus.',
      });
      setTimeout(() => setNotification(null), 4000);
    },
    onError: (err: unknown) => {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Gagal menghapus berkas.',
      });
    },
  });

  const handleOpenUploader = (type: DocumentType) => {
    setSelectedType(type);
    setIsUploaderOpen(true);
  };

  const handleUploadFile = async (type: DocumentType, file: File) => {
    await uploadDocMutation.mutateAsync({ type, file });
  };

  const handleDeleteDoc = async (doc: TenantDocument) => {
    if (confirm(`Hapus berkas ${doc.document_type.toUpperCase()} ini?`)) {
      await deleteDocMutation.mutateAsync(doc.id);
    }
  };

  const getDocTypeTitle = (type: DocumentType) => {
    switch (type) {
      case 'ktp':
        return 'Kartu Tanda Penduduk (KTP)';
      case 'kk':
        return 'Kartu Keluarga (KK)';
      case 'sim':
        return 'Surat Izin Mengemudi (SIM)';
      default:
        return 'Dokumen Pendukung Lainnya';
    }
  };

  // Hitung kelengkapan dokumen
  const uploadedCount = documents.length;
  const verifiedCount = documents.filter((d) => d.is_verified).length;

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-soft-card relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-bold text-2xl shadow-inner">
              {profile?.name
                ? profile.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()
                : 'P'}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {profile?.name || 'Profil Penghuni'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  Penyewa Aktif
                </span>
              </div>
              <p className="text-teal-100/80 text-xs sm:text-sm mt-1">
                Kelola identitas resmi kependudukan dan kelengkapan berkas bukti dukung sewa kos.
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 px-5 self-start sm:self-auto">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-emerald-300 font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-teal-200 uppercase font-semibold tracking-wider">
                Kelengkapan Berkas
              </p>
              <p className="text-base font-black text-white">
                {verifiedCount} Sah / {uploadedCount} Terunggah
              </p>
            </div>
          </div>
        </div>

        {/* Ambient Decorative Shapes */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-semibold transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid: Data Diri & NIK Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom 1: Ringkasan Akun */}
        <Card className="lg:col-span-1 p-6 space-y-4">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-sm border-b border-slate-100 pb-3">
            <UserIcon className="w-4 h-4" />
            <span>Informasi Akun Penyewa</span>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-medium">Nama Lengkap</p>
              <p className="font-bold text-slate-900 mt-0.5">{profile?.name || '-'}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400 font-medium">Nomor WhatsApp / HP</p>
              <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {profile?.phone || '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400 font-medium">Alamat Email</p>
              <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {profile?.email || '-'}
              </p>
            </div>

            {profile?.active_tenancy?.room && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-medium">Unit Kamar Aktif</p>
                <div className="mt-1 flex items-center gap-2 p-2.5 rounded-xl bg-teal-50/70 border border-teal-100">
                  <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Kamar {profile.active_tenancy.room.room_number}
                    </p>
                    <p className="text-[11px] text-teal-700 capitalize">
                      Tipe {profile.active_tenancy.room.type}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Kolom 2: Form NIK 16 Digit */}
        <div className="lg:col-span-2 space-y-4">
          <NikInput
            initialValue={profile?.nik}
            onSave={async (nik) => {
              await saveNikMutation.mutateAsync(nik);
            }}
            disabled={saveNikMutation.isPending}
          />

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-3 leading-relaxed">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-indigo-900">Kerahasiaan & Keamanan Data Kependudukan</p>
              <p className="text-indigo-800/80 mt-0.5">
                Nomor Induk Kependudukan (NIK) dan berkas identitas Anda disimpan terenkripsi di server terisolasi. Dokumen hanya digunakan untuk pencatatan kontrak perjanjian sewa resmi dan pelaporan keamanan lingkungan kos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Berkas Bukti Dukung (KTP, KK, SIM) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-teal-700" />
              <span>Berkas Bukti Dukung Identitas</span>
            </h2>
            <p className="text-xs text-slate-500">
              Lampirkan dokumen pendukung resmi (KTP, Kartu Keluarga, SIM, atau dokumen lainnya).
            </p>
          </div>

          <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100 self-start sm:self-auto">
            Maks. 5MB per berkas (JPG/PNG/PDF)
          </span>
        </div>

        {/* Grid 4 Cards Dokumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: KTP */}
          <DocumentCard
            type="ktp"
            title="Kartu Tanda Penduduk (KTP)"
            description="Wajib untuk verifikasi identitas utama penyewa"
            document={getDoc('ktp')}
            onUploadClick={handleOpenUploader}
            onDeleteClick={handleDeleteDoc}
            onPreviewClick={(doc) => setPreviewDoc(doc)}
            isDeleting={deleteDocMutation.isPending}
          />

          {/* Card 2: Kartu Keluarga (KK) */}
          <DocumentCard
            type="kk"
            title="Kartu Keluarga (KK)"
            description="Bukti dukung data keluarga atau darurat"
            document={getDoc('kk')}
            onUploadClick={handleOpenUploader}
            onDeleteClick={handleDeleteDoc}
            onPreviewClick={(doc) => setPreviewDoc(doc)}
            isDeleting={deleteDocMutation.isPending}
          />

          {/* Card 3: SIM */}
          <DocumentCard
            type="sim"
            title="Surat Izin Mengemudi (SIM)"
            description="Bukti pendukung kepemilikan kendaraan bermotor"
            document={getDoc('sim')}
            onUploadClick={handleOpenUploader}
            onDeleteClick={handleDeleteDoc}
            onPreviewClick={(doc) => setPreviewDoc(doc)}
            isDeleting={deleteDocMutation.isPending}
          />

          {/* Card 4: Dokumen Lainnya */}
          <DocumentCard
            type="lainnya"
            title="Dokumen Lainnya"
            description="Kartu Mahasiswa, Surat Tugas Kerja, atau lainnya"
            document={getDoc('lainnya')}
            onUploadClick={handleOpenUploader}
            onDeleteClick={handleDeleteDoc}
            onPreviewClick={(doc) => setPreviewDoc(doc)}
            isDeleting={deleteDocMutation.isPending}
          />
        </div>
      </div>

      {/* Modal Upload */}
      <DocumentUploaderModal
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        documentType={selectedType}
        typeTitle={getDocTypeTitle(selectedType)}
        onUpload={handleUploadFile}
      />

      {/* Modal Lightbox Preview */}
      {previewDoc && previewDoc.stream_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Pratinjau {getDocTypeTitle(previewDoc.document_type)}
                </h3>
                <p className="text-xs text-slate-400">{previewDoc.original_filename}</p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.stream_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Tab Baru
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-slate-50/50 flex items-center justify-center min-h-[350px]">
              {previewDoc.mime_type === 'application/pdf' ? (
                <iframe
                  src={previewDoc.stream_url}
                  className="w-full h-[600px] rounded-xl border border-slate-200"
                  title="PDF Viewer"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewDoc.stream_url}
                  alt="Dokumen"
                  className="max-h-[600px] w-auto object-contain rounded-xl border border-slate-200 shadow-sm"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
