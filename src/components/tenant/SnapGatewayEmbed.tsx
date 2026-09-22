'use client';

import React from 'react';
import { QrCode, CreditCard, AlertTriangle, ExternalLink, Sparkles } from 'lucide-react';
import { formatRupiah } from '@/lib/api';

export interface GatewayInitResponse {
  snap_token: string;
  redirect_url: string;
  order_id: string;
  gross_amount: number;
}

interface SnapGatewayEmbedProps {
  remaining: number;
  gatewayData: GatewayInitResponse | null;
  gatewayError: string | null;
  isInitializing: boolean;
  isSimulating: boolean;
  onInitGateway: () => void;
  onSimulateSettlement: () => void;
}

export const SnapGatewayEmbed: React.FC<SnapGatewayEmbedProps> = ({
  remaining,
  gatewayData,
  gatewayError,
  isInitializing,
  isSimulating,
  onInitGateway,
  onSimulateSettlement,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-slate-900">
            Midtrans Snap Payment Gateway
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Layanan pembayaran digital 24 jam non-stop dengan verifikasi instan. Pembayaran Anda akan otomatis terkonfirmasi oleh sistem tanpa perlu upload slip transfer.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
          <QrCode className="w-5 h-5" />
        </div>
      </div>

      {!gatewayData ? (
        <div>
          {gatewayError && (
            <div className="p-3 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{gatewayError}</span>
            </div>
          )}

          <button
            type="button"
            onClick={onInitGateway}
            disabled={isInitializing}
            className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-300 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>
              {isInitializing
                ? 'Menghubungi Server Gateway...'
                : `Lanjutkan Pembayaran Instan (${formatRupiah(remaining)})`}
            </span>
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-white border border-indigo-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Nomor Transaksi Gateway
              </span>
              <p className="text-xs font-extrabold text-slate-800">{gatewayData.order_id}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Nominal Tagihan
              </span>
              <p className="text-sm font-extrabold text-indigo-700">
                {formatRupiah(gatewayData.gross_amount)}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Midtrans Web Checkout Link */}
            <a
              href={gatewayData.redirect_url}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <span>Buka Layar Pembayaran (VA / QRIS / GoPay)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Sandbox Simulation Button */}
            <button
              type="button"
              onClick={onSimulateSettlement}
              disabled={isSimulating}
              className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Simulasi Callback Webhook Berhasil (Testing Sandbox)"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isSimulating ? 'Memproses...' : 'Simulasi Bayar Sukses'}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 text-center leading-relaxed">
            💡 Sistem melakukan polling status otomatis di latar belakang. Setelah pembayaran selesai pada jendela Midtrans, halaman ini akan otomatis diperbarui menjadi lunas.
          </div>
        </div>
      )}
    </div>
  );
};
