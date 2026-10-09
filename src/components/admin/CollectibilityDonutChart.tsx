'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '@/components/ui/Card';
import { formatRupiah } from '@/lib/api';
import { PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

interface CollectibilityDonutChartProps {
  data: {
    lunas: number;
    belumBayar: number;
    terlambat: number;
    lunasNominal?: number;
    belumBayarNominal?: number;
    terlambatNominal?: number;
  };
  isLoading?: boolean;
}

const COLORS = {
  lunas: '#10b981',       // Emerald 500
  belumBayar: '#f59e0b',  // Amber 500
  terlambat: '#f43f5e',   // Rose 500
};

export const CollectibilityDonutChart: React.FC<CollectibilityDonutChartProps> = ({
  data,
  isLoading,
}) => {
  const total = (data.lunas || 0) + (data.belumBayar || 0) + (data.terlambat || 0);
  const percentage = total > 0 ? Math.round(((data.lunas || 0) / total) * 100) : 100;

  const chartData = [
    { name: 'Lunas', value: data.lunas || 0, color: COLORS.lunas, nominal: data.lunasNominal || 0 },
    { name: 'Belum Bayar', value: data.belumBayar || 0, color: COLORS.belumBayar, nominal: data.belumBayarNominal || 0 },
    { name: 'Terlambat', value: data.terlambat || 0, color: COLORS.terlambat, nominal: data.terlambatNominal || 0 },
  ].filter((item) => item.value > 0);

  // Jika semua 0, buat dummy slice transparan untuk visual lingkaran
  const displayChartData = chartData.length > 0 ? chartData : [{ name: 'Belum Ada Data', value: 1, color: '#e2e8f0', nominal: 0 }];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 p-3 rounded-xl shadow-lg text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="font-bold text-slate-800">{item.name}</span>
          </div>
          <p className="text-slate-600 flex justify-between gap-4">
            <span>Jumlah:</span>
            <span className="font-semibold text-slate-900">{item.value} invoice</span>
          </p>
          {item.nominal > 0 && (
            <p className="text-slate-600 flex justify-between gap-4">
              <span>Nominal:</span>
              <span className="font-semibold text-slate-900">{formatRupiah(item.nominal)}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-100">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Kolektibilitas Bulan Ini</h3>
          </div>
          <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md">
            Periode Berjalan
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Rasio realisasi penerimaan sewa vs tagihan tertunda
        </p>

        {isLoading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-4 border-slate-100 border-t-teal-600 animate-spin" />
          </div>
        ) : (
          <div className="relative h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={80}
                  paddingAngle={chartData.length > 1 ? 4 : 0}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {displayChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Percentage Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {percentage}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Kolektibilitas
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Breakdown */}
      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-700">Lunas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{data.lunas}</span>
            <span className="text-[11px] text-slate-400">unit</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="font-medium text-slate-700">Belum Bayar</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{data.belumBayar}</span>
            <span className="text-[11px] text-slate-400">unit</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="font-medium text-slate-700">Terlambat</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{data.terlambat}</span>
            <span className="text-[11px] text-slate-400">unit</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
