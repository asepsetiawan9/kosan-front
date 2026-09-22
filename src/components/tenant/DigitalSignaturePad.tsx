'use client';

import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DigitalSignaturePadProps {
  onConfirm: (signatureDataUrl: string) => void;
  isLoading?: boolean;
}

export default function DigitalSignaturePad({ onConfirm, isLoading = false }: DigitalSignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high DPI scaling for crisp smooth lines
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = '#0F766E';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ('clientX' in e) {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
    setError(null);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    setError(null);
  };

  const handleSubmit = () => {
    if (!hasDrawn) {
      setError('Harap bubuhkan tanda tangan Anda terlebih dahulu pada area kanvas.');
      return;
    }
    if (!agreeTerms) {
      setError('Anda wajib mencentang persetujuan keabsahan tanda tangan elektronik.');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL('image/png');
    onConfirm(signatureData);
  };

  return (
    <div className="space-y-4">
      <div className="relative border-2 border-dashed border-teal-200 bg-teal-50/20 rounded-xl p-2 transition-colors focus-within:border-teal-600">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-44 bg-white rounded-lg cursor-crosshair touch-none shadow-inner"
          style={{ width: '100%', height: '176px' }}
        />

        {!hasDrawn && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
            <span className="font-medium text-slate-500">Bubuhkan Tanda Tangan Anda di Sini</span>
            <span>(Gunakan kursor mouse, pena digital, atau layar sentuh jari)</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Terms Agreement Checkbox */}
      <label className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
        <input
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => {
            setAgreeTerms(e.target.checked);
            if (error) setError(null);
          }}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
        />
        <div className="text-xs text-slate-700 leading-relaxed">
          <span className="font-semibold text-slate-900 block mb-0.5">Persetujuan Keabsahan Tanda Tangan Elektronik</span>
          Saya memahami bahwa tanda tangan ini bersifat <strong className="text-teal-700">final dan tidak dapat diubah</strong> setelah dikirimkan, serta memiliki kekuatan hukum mengikat atas perjanjian sewa ini.
        </div>
      </label>

      {/* Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleClear}
          disabled={!hasDrawn || isLoading}
          className="gap-1.5 text-xs text-slate-600 hover:text-slate-800"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Bersihkan
        </Button>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!hasDrawn || !agreeTerms || isLoading}
          className="gap-2 bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white shadow-md shadow-teal-700/20 text-xs px-5"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <ShieldCheck className="w-4 h-4" />
          )}
          <span>{isLoading ? 'Mengunci Dokumen...' : 'Tandatangani & Sahkan Kontrak'}</span>
        </Button>
      </div>
    </div>
  );
}
