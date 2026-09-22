'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import ContractGeneratorCard from '@/components/admin/ContractGeneratorCard';
import { Tenancy, Contract } from '@/lib/types';
import { ArrowLeft, Building2, User, Calendar, CreditCard, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminTenancyContractPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const tenancyId = resolvedParams.id;

  const [tenancy, setTenancy] = useState<Tenancy | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch tenancy
      const resTenancy = await fetch(`/api/proxy/admin/tenancies/${tenancyId}`);
      const jsonTenancy = await resTenancy.json();
      if (!resTenancy.ok) throw new Error(jsonTenancy.message || 'Gagal memuat data sewa.');
      setTenancy(jsonTenancy.data);

      // 2. Fetch contract
      const resContract = await fetch(`/api/proxy/admin/tenancies/${tenancyId}/contract`);
      if (resContract.ok) {
        const jsonContract = await resContract.json();
        setContract(jsonContract.data);
      } else {
        setContract(null);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan memuat data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenancyId]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/tenancies"
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Kelola Kontrak Sewa</h1>
            <p className="text-xs text-slate-500">
              Penerbitan dan pengawasan status tanda tangan dokumen perjanjian sewa.
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={fetchData} className="gap-2 text-xs">
          <RefreshCw className="w-3.5 h-3.5" />
          Muat Ulang
        </Button>
      </div>

      {isLoading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Memuat rincian sewa & kontrak...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 shadow-sm space-y-3">
          <h3 className="text-base font-semibold text-slate-900">Gagal Mengambil Data</h3>
          <p className="text-xs text-slate-500">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-2 mx-auto">
            Coba Lagi
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tenancy Quick Summary */}
          {tenancy && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-1 flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-teal-700" /> Nama Penghuni
                </span>
                <span className="font-bold text-slate-900 text-sm">{tenancy.tenant_name}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">{tenancy.tenant_phone}</span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1 flex items-center gap-1.5 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-teal-700" /> Kamar Disewa
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  Kamar {tenancy.room?.room_number ?? '-'}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5 capitalize">
                  Tipe {tenancy.room?.type ?? '-'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1 flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-teal-700" /> Periode Sewa
                </span>
                <span className="font-semibold text-slate-800">
                  {tenancy.start_date ? new Date(tenancy.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Due: Tgl {tenancy.billing_due_day}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1 flex items-center gap-1.5 font-medium">
                  <CreditCard className="w-3.5 h-3.5 text-teal-700" /> Nilai Sewa & Deposit
                </span>
                <span className="font-semibold text-slate-800">
                  Rp {new Intl.NumberFormat('id-ID').format(tenancy.room?.base_price ?? 0)}/bln
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Deposit: Rp {new Intl.NumberFormat('id-ID').format(tenancy.deposit_amount ?? 0)}
                </span>
              </div>
            </div>
          )}

          {/* Generator & Viewer Card */}
          <ContractGeneratorCard
            tenancyId={tenancyId}
            initialContract={contract}
            onUpdated={fetchData}
          />
        </div>
      )}
    </div>
  );
}
