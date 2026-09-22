'use client';

import React, { useEffect, useState } from 'react';
import ContractViewer from '@/components/tenant/ContractViewer';
import { Contract } from '@/lib/types';
import { FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function TenantContractPage() {
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContract = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/proxy/tenant/contract');
      if (res.status === 404) {
        setContract(null);
        return;
      }
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Gagal memuat kontrak sewa.');
      }
      setContract(json.data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContract();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dokumen Kontrak Sewa</h1>
        <p className="text-sm text-slate-500 mt-1">
          Perjanjian sewa sah berlandaskan hukum yang mengatur hak, kewajiban, dan masa tinggal Anda.
        </p>
      </div>

      {isLoading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Memuat berkas dokumen kontrak...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 shadow-sm space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900">Gagal Memuat Dokumen</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchContract} className="gap-2 mx-auto">
            <RefreshCw className="w-3.5 h-3.5" />
            Coba Lagi
          </Button>
        </div>
      ) : contract ? (
        <ContractViewer contract={contract} onSignSuccess={fetchContract} />
      ) : (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Draf Kontrak Sedang Dipersiapkan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Pengelola kos sedang menyusun draf perjanjian sewa unit Anda. Dokumen akan muncul di halaman ini segera setelah diterbitkan oleh pihak manajemen.
          </p>
          <Button variant="outline" size="sm" onClick={fetchContract} className="gap-2 mx-auto mt-2">
            <RefreshCw className="w-3.5 h-3.5" />
            Periksa Pembaruan
          </Button>
        </div>
      )}
    </div>
  );
}
