'use client';

import React, { useState } from 'react';
import { Contract } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import DigitalSignaturePad from './DigitalSignaturePad';
import {
  FileText,
  Download,
  PenTool,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard,
  UserCheck
} from 'lucide-react';

interface ContractViewerProps {
  contract: Contract;
  onSignSuccess?: () => void;
}

export default function ContractViewer({ contract, onSignSuccess }: ContractViewerProps) {
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signMessage, setSignMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSignSubmit = async (signatureDataUrl: string) => {
    setIsSigning(true);
    setSignMessage(null);

    try {
      const res = await fetch('/api/proxy/tenant/contract/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature: signatureDataUrl,
          agree_terms: true,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Gagal menandatangani kontrak.');
      }

      setSignMessage({
        type: 'success',
        text: 'Kontrak sewa berhasil disahkan dan ditandatangani! Dokumen telah terkunci permanen.',
      });
      setIsSignModalOpen(false);
      if (onSignSuccess) {
        onSignSuccess();
      }
    } catch (err: any) {
      setSignMessage({
        type: 'error',
        text: err.message || 'Terjadi kesalahan sistem saat memproses tanda tangan.',
      });
    } finally {
      setIsSigning(false);
    }
  };

  const isSigned = contract.status === 'ditandatangani' || contract.is_signed;

  return (
    <div className="space-y-6">
      {signMessage && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${
            signMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {signMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{signMessage.text}</span>
        </div>
      )}

      {/* Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h2 className="text-xl font-bold text-slate-900">Perjanjian Sewa Hunian</h2>
              <StatusBadge status={contract.status} />
            </div>
            <p className="text-sm text-slate-500 font-mono">
              No. Registrasi: <span className="font-semibold text-slate-800">{contract.contract_number}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isSigned ? (
              <a
                href={contract.stream_url}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium shadow-sm shadow-emerald-600/20 transition-all"
              >
                <Download className="w-4 h-4" />
                Unduh Salinan Sah (PDF)
              </a>
            ) : (
              <Button
                onClick={() => setIsSignModalOpen(true)}
                className="gap-2 bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white shadow-md shadow-teal-700/20 text-sm px-5 py-2.5"
              >
                <PenTool className="w-4 h-4" />
                Tandatangani Sekarang
              </Button>
            )}
          </div>
        </div>

        {/* Tenancy Brief Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Unit Kamar</span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              Kamar {contract.tenancy?.room?.room_number ?? '-'}
            </div>
            <div className="text-xs text-slate-500 capitalize">
              Tipe {contract.tenancy?.room?.type ?? 'Standar'}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>Periode Masuk</span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              {contract.tenancy?.start_date ? new Date(contract.tenancy.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
            </div>
            <div className="text-xs text-slate-500">
              Jatuh Tempo: Tgl {contract.tenancy?.billing_due_day ?? 1}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <CreditCard className="w-4 h-4 text-teal-600" />
              <span>Sewa Bulanan</span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              Rp {new Intl.NumberFormat('id-ID').format(contract.tenancy?.room?.price ?? 0)}
            </div>
            <div className="text-xs text-slate-500">
              Deposit: Rp {new Intl.NumberFormat('id-ID').format(contract.tenancy?.deposit_amount ?? 0)}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>Status Hukum Dokumen</span>
            </div>
            {isSigned ? (
              <div>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" /> Sah & Terkunci
                </span>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  TTE: {contract.signed_at ? new Date(contract.signed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                </div>
              </div>
            ) : (
              <div>
                <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600 inline" /> Menunggu TTE
                </span>
                <div className="text-[11px] text-slate-500 mt-0.5">Belum ditandatangani</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded PDF Viewer & Fallback */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <FileText className="w-4 h-4 text-teal-700" />
            <span>Pratinjau Lembar Kontrak Resmi</span>
          </div>
          <a
            href={contract.stream_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-teal-700 hover:text-teal-800 font-medium inline-flex items-center gap-1"
          >
            Buka di Tab Baru <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="w-full h-[650px] bg-slate-100 relative">
          <iframe
            src={`${contract.stream_url}#toolbar=0`}
            className="w-full h-full border-none"
            title="Dokumen Kontrak Sewa"
          />
        </div>
      </div>

      {/* Signature Modal */}
      <Modal
        isOpen={isSignModalOpen}
        onClose={() => !isSigning && setIsSignModalOpen(false)}
        title="Pembubuhan Tanda Tangan Elektronik"
      >
        <div className="space-y-4">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 leading-relaxed">
            Dokumen <strong>{contract.contract_number}</strong> akan disahkan atas nama <strong>{contract.tenancy?.tenant_name}</strong>. Setelah tanda tangan tersimpan, dokumen terkunci permanen dan tidak dapat diedit kembali.
          </div>

          <DigitalSignaturePad
            onConfirm={handleSignSubmit}
            isLoading={isSigning}
          />
        </div>
      </Modal>
    </div>
  );
}
