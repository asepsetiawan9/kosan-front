'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  X, 
  ShieldCheck, 
  FileCheck2, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  Eye, 
  Loader2, 
  Phone, 
  Mail, 
  CreditCard,
  FileText
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { apiRequest } from '@/lib/api';
import { TenantDocument, DocumentType } from '@/lib/types';

interface TenantDocumentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail?: string;
}

export const TenantDocumentsDrawer: React.FC<TenantDocumentsDrawerProps> = ({
  isOpen,
  onClose,
  userId,
  tenantName,
  tenantPhone,
  tenantEmail,
}) => {
  const queryClient = useQueryClient();
  const [activePreviewDoc, setActivePreviewDoc] = useState<TenantDocument | null>(null);
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null);
  const [verifyNotes, setVerifyNotes] = useState<string>('');

  // Fetch dokumen tenant
  const { data: responseData, isLoading } = useQuery<{
    tenant: { id: string; name: string; nik?: string; phone: string; email: string };
    data: TenantDocument[];
  }>({
    queryKey: ['admin-tenant-documents', userId],
    queryFn: () => apiRequest(`admin/tenants/${userId}/documents`),
    enabled: isOpen && !!userId,
  });

  const tenant = responseData?.tenant;
  const documents = responseData?.data || [];

  // Mutation verifikasi
  const verifyMutation = useMutation({
    mutationFn: ({ docId, isVerified, notes }: { docId: string; isVerified: boolean; notes?: string }) =>
      apiRequest(`admin/tenants/${userId}/documents/${docId}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ is_verified: isVerified, notes }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tenant-documents', userId] });
      setVerifyingDocId(null);
      setVerifyNotes('');
    },
  });

  const handleVerify = async (docId: string, isVerified: boolean, notes?: string) => {
    await verifyMutation.mutateAsync({ docId, isVerified, notes });
  };

  const getDocTypeTitle = (type: DocumentType) => {
    switch (type) {
      case 'ktp':
        return 'KTP (Kartu Tanda Penduduk)';
      case 'kk':
        return 'KK (Kartu Keluarga)';
      case 'sim':
        return 'SIM (Surat Izin Mengemudi)';
      default:
        return 'Dokumen Lainnya';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Berkas Identitas Penghuni">
      <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
        {/* Profile Info Header */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">{tenantName}</h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {tenantPhone}
                </span>
                {tenantEmail && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {tenantEmail}
                  </span>
                )}
              </div>
            </div>

            {/* NIK Status Badge */}
            <div>
              {tenant?.nik ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-mono font-bold">
                  <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                  <span>NIK: {tenant.nik}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>NIK Belum Diisi</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Periksa keaslian berkas identitas resmi kependudukan (KTP, KK, SIM) untuk kepatuhan hukum dan ketertiban administrasi hunian.
          </p>
        </div>

        {/* Document List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-teal-700" />
            <span>Daftar Dokumen ({documents.length})</span>
          </h4>

          {isLoading ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
              Memuat dokumen identitas...
            </div>
          ) : documents.length === 0 ? (
            <div className="py-10 text-center rounded-2xl border border-dashed border-slate-200 p-6">
              <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">Belum Ada Dokumen</p>
              <p className="text-xs text-slate-400 mt-1">
                Penghuni belum mengunggah berkas identitas atau dokumen dukung di portal mereka.
              </p>
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className={`p-4 rounded-2xl border transition-all ${
                  doc.is_verified
                    ? 'border-emerald-200 bg-emerald-50/15'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        doc.is_verified
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {doc.is_verified ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-700" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-slate-900 text-sm">
                          {getDocTypeTitle(doc.document_type)}
                        </h5>
                        {doc.is_verified ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Terverifikasi Sah
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Menunggu Verifikasi
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {doc.original_filename} • {formatFileSize(doc.file_size)}
                      </p>

                      {doc.verified_by && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Diverifikasi oleh: <span className="font-semibold text-slate-600">{doc.verified_by.name}</span>
                        </p>
                      )}

                      {doc.notes && (
                        <p className="text-[11px] text-slate-600 mt-1 italic bg-slate-100/60 p-1.5 rounded-lg">
                          Catatan: {doc.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {doc.stream_url && (
                      <button
                        type="button"
                        onClick={() => setActivePreviewDoc(doc)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-teal-700" />
                        Pratinjau
                      </button>
                    )}

                    {!doc.is_verified ? (
                      <Button
                        size="sm"
                        onClick={() => handleVerify(doc.id, true)}
                        disabled={verifyMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs cursor-pointer shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        Verifikasi Sah
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerify(doc.id, false)}
                        disabled={verifyMutation.isPending}
                        className="border-rose-200 text-rose-700 hover:bg-rose-50 text-xs cursor-pointer"
                      >
                        Batalkan
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Lightbox Preview In-Drawer */}
        {activePreviewDoc && activePreviewDoc.stream_url && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl flex flex-col max-h-[92vh]">
              <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {getDocTypeTitle(activePreviewDoc.document_type)} — {tenantName}
                  </h3>
                  <p className="text-xs text-slate-400">{activePreviewDoc.original_filename}</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={activePreviewDoc.stream_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Buka Tab Baru
                  </a>
                  <button
                    onClick={() => setActivePreviewDoc(null)}
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 bg-slate-50/50 flex items-center justify-center min-h-[400px]">
                {activePreviewDoc.mime_type === 'application/pdf' ? (
                  <iframe
                    src={activePreviewDoc.stream_url}
                    className="w-full h-[650px] rounded-xl border border-slate-200"
                    title="PDF Viewer"
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={activePreviewDoc.stream_url}
                    alt="Dokumen"
                    className="max-h-[650px] w-auto object-contain rounded-xl border border-slate-200 shadow-sm"
                  />
                )}
              </div>

              <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
                {!activePreviewDoc.is_verified && (
                  <Button
                    size="sm"
                    onClick={() => {
                      handleVerify(activePreviewDoc.id, true);
                      setActivePreviewDoc(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                    Verifikasi Sah Sekarang
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActivePreviewDoc(null)}
                  className="cursor-pointer"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
