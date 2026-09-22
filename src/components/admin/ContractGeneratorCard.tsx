'use client';

import React, { useState } from 'react';
import { Contract } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  FileText,
  Download,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface ContractGeneratorCardProps {
  tenancyId: string;
  initialContract?: Contract | null;
  onUpdated?: () => void;
}

export default function ContractGeneratorCard({
  tenancyId,
  initialContract,
  onUpdated,
}: ContractGeneratorCardProps) {
  const [contract, setContract] = useState<Contract | null>(initialContract || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/proxy/admin/tenancies/${tenancyId}/contract`, {
        method: 'POST',
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Gagal menerbitkan draf kontrak.');
      }

      setContract(json.data);
      setMessage({
        type: 'success',
        text: 'Draf kontrak sewa berhasil dibuat dan dikirimkan ke portal penghuni!',
      });
      if (onUpdated) {
        onUpdated();
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Terjadi kesalahan sistem saat membuat draf kontrak.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const isSigned = contract?.status === 'ditandatangani' || contract?.is_signed;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-900">Perjanjian Kontrak Sewa Digital</h3>
            {contract && <StatusBadge status={contract.status} />}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Draf dokumen hukum terbitan sistem dengan klausul hak & kewajiban sewa kos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isSigned && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="gap-2 bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white shadow-sm text-xs px-4 py-2"
            >
              {isGenerating ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{contract ? 'Generate Ulang Draf' : 'Terbitkan Draf Kontrak'}</span>
            </Button>
          )}

          {contract && (
            <a
              href={contract.stream_url}
              target="_blank"
              rel="noreferrer"
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh PDF
            </a>
          )}
        </div>
      </div>

      {/* Details or Empty state */}
      {contract ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[11px] text-slate-500 uppercase font-medium">Nomor Dokumen</span>
              <p className="text-xs font-bold text-slate-900 font-mono mt-0.5">{contract.contract_number}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[11px] text-slate-500 uppercase font-medium">Status Tanda Tangan</span>
              <div className="mt-0.5 flex items-center gap-1.5">
                {isSigned ? (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Sah & Terkunci
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Menunggu Penghuni
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[11px] text-slate-500 uppercase font-medium">Waktu Pengesahan</span>
              <p className="text-xs font-semibold text-slate-900 mt-0.5">
                {contract.signed_at
                  ? new Date(contract.signed_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Belum Ditandatangani'}
              </p>
            </div>
          </div>

          {/* Embedded Viewer */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-100">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-700" /> Lembar Dokumen Kontrak
              </span>
              <a
                href={contract.stream_url}
                target="_blank"
                rel="noreferrer"
                className="text-teal-700 hover:text-teal-800 font-medium inline-flex items-center gap-1"
              >
                Buka Tab Penuh <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="w-full h-[500px]">
              <iframe
                src={`${contract.stream_url}#toolbar=0`}
                className="w-full h-full border-none"
                title="Preview Kontrak"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="py-10 text-center space-y-2">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mx-auto mb-2">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Belum Ada Kontrak Terbit</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Klik tombol &quot;Terbitkan Draf Kontrak&quot; di atas untuk membuat dokumen perjanjian resmi otomatis dari data kamar dan sewa penyewa ini.
          </p>
        </div>
      )}
    </div>
  );
}
