'use client';

import React, { useEffect, useState } from 'react';
import { FinancialSummary } from '@/lib/types';
import FinancialCharts from '@/components/admin/FinancialCharts';
import ReportExportDropdown from '@/components/admin/ReportExportDropdown';
import {
  TrendingUp,
  AlertTriangle,
  Building2,
  RefreshCw,
  Wallet,
  Clock,
  PieChart,
  CheckCircle2,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const MONTHS = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

const YEARS = [2024, 2025, 2026, 2027];

export default function FinancialReportsPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [data, setData] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/proxy/admin/reports/income?month=${selectedMonth}&year=${selectedYear}`
      );
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Gagal memuat laporan keuangan.');
      }

      setData(json.data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedMonth, selectedYear]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Period Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan Keuangan & Arus Kas</h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit kas riil (*cash-basis*), estimasi piutang berjalan, dan rasio okupansi properti.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <Button variant="outline" size="sm" onClick={fetchReports} className="text-xs gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>

          {/* Export Dropdown */}
          <ReportExportDropdown month={selectedMonth} year={selectedYear} />
        </div>
      </div>

      {isLoading ? (
        <div className="p-20 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Mengkalkulasi pembukuan kas dan piutang...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 shadow-sm space-y-3">
          <h3 className="text-base font-semibold text-slate-900">Gagal Mengambil Data</h3>
          <p className="text-xs text-slate-500">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchReports} className="mx-auto">
            Coba Lagi
          </Button>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* 3 Pastel Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Metric 1: Pemasukan Kas Bersih */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-teal-50/60 to-white border border-emerald-200/80 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Total Pemasukan Bersih
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shadow-xs">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                Rp {new Intl.NumberFormat('id-ID').format(data.metrics.total_income)}
              </div>
              <div className="mt-2 text-xs text-emerald-700 flex items-center gap-1.5 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{data.transactions_count} transaksi kas berhasil ({data.period.label})</span>
              </div>
            </div>

            {/* Metric 2: Estimasi Tagihan Tertunda */}
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-white border border-amber-200/80 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                  Estimasi Piutang Tertunda
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl lg:text-3xl font-extrabold text-amber-900 tracking-tight">
                Rp {new Intl.NumberFormat('id-ID').format(data.metrics.pending_receivables)}
              </div>
              <div className="mt-2 text-xs text-amber-700 flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Tagihan belum lunas / sebagian dibayar</span>
              </div>
            </div>

            {/* Metric 3: Tingkat Okupansi Properti */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500/10 via-indigo-50/50 to-white border border-indigo-200/80 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-800">
                  Tingkat Okupansi Properti
                </span>
                <div className="w-10 h-10 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl lg:text-3xl font-extrabold text-indigo-950 tracking-tight">
                {data.metrics.occupancy_rate}%
              </div>
              <div className="mt-2 text-xs text-indigo-700 flex items-center gap-1.5 font-medium">
                <PieChart className="w-3.5 h-3.5" />
                <span>
                  {data.metrics.occupied_rooms} dari {data.metrics.total_rooms} unit kamar aktif terisi
                </span>
              </div>
            </div>
          </div>

          {/* Charts & Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart: Tren Arus Kas */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Tren Arus Kas (6 Bulan Terakhir)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Perbandingan realisasi kas masuk vs total tagihan diterbitkan.
                  </p>
                </div>
              </div>
              <FinancialCharts data={data.cashflow_trend} />
            </div>

            {/* Breakdown per Komponen */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Distribusi Komponen</h2>
                <p className="text-xs text-slate-500 mt-0.5 mb-5">
                  Porsi pemasukan riil periode {data.period.label}.
                </p>

                <div className="space-y-4">
                  {data.category_breakdown.map((cat) => (
                    <div key={cat.type} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{cat.name}</span>
                        <span className="text-slate-500 font-mono">
                          Rp {new Intl.NumberFormat('id-ID').format(cat.amount)} ({cat.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-600 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, cat.percentage))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                Kalkulasi dihitung secara otomatis berbasis kas riil yang telah terkonfirmasi lunas oleh sistem.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
