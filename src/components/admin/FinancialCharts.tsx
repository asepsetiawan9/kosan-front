'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface TrendItem {
  month: string;
  short_month: string;
  income: number;
  invoiced: number;
}

interface FinancialChartsProps {
  data: TrendItem[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-3 rounded-xl shadow-lg text-xs space-y-1">
        <p className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1">{label}</p>
        <p className="text-emerald-700 font-semibold flex items-center justify-between gap-4">
          <span>Kas Masuk Riil:</span>
          <span>Rp {new Intl.NumberFormat('id-ID').format(payload[0]?.value || 0)}</span>
        </p>
        {payload[1] && (
          <p className="text-indigo-700 font-semibold flex items-center justify-between gap-4">
            <span>Tagihan Terbit:</span>
            <span>Rp {new Intl.NumberFormat('id-ID').format(payload[1]?.value || 0)}</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function FinancialCharts({ data }: FinancialChartsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400 text-xs">
        Data arus kas belum tersedia.
      </div>
    );
  }

  const formatRupiahK = (val: number) => {
    if (val >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(1)} jt`;
    }
    if (val >= 1_000) {
      return `${(val / 1_000).toFixed(0)} rb`;
    }
    return `${val}`;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0F766E" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#0F766E" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="invoicedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="short_month"
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            tick={{ fill: '#64748b', fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={formatRupiahK}
            tick={{ fill: '#64748b', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
          />
          <Area
            type="monotone"
            name="Pemasukan Kas Riil (Rp)"
            dataKey="income"
            stroke="#0F766E"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#incomeGradient)"
          />
          <Area
            type="monotone"
            name="Total Tagihan Diterbitkan (Rp)"
            dataKey="invoiced"
            stroke="#4F46E5"
            strokeWidth={2}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#invoicedGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
