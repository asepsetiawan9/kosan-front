'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface WaNumberInputProps {
  value: string;
  onChange: (normalized: string, raw: string) => void;
  label?: string;
  placeholder?: string;
  error?: string | null;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  helperText?: string;
}

export const WaNumberInput: React.FC<WaNumberInputProps> = ({
  value,
  onChange,
  label = 'Nomor WhatsApp',
  placeholder = 'Contoh: 0812-3456-7890',
  error,
  disabled = false,
  required = false,
  className = '',
  helperText = 'Format otomatis diubah ke standar WhatsApp internasional (628...)',
}) => {
  const [rawInput, setRawInput] = useState(value || '');

  // Synchronize when outer value changes
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setRawInput(value);
    }
  }, [value]);

  // Live normalization helper
  const normalize = (phone: string): string => {
    const clean = phone.replace(/[^\d]/g, '');
    if (!clean) return '';
    if (clean.startsWith('0')) {
      return '62' + clean.slice(1);
    }
    if (clean.startsWith('8')) {
      return '62' + clean;
    }
    return clean;
  };

  const formatDisplay = (normalized: string): string => {
    if (!normalized.startsWith('62') || normalized.length < 10) {
      return normalized ? `+${normalized}` : '';
    }
    const rest = normalized.slice(2);
    const p1 = rest.slice(0, 3);
    const p2 = rest.slice(3, 7);
    const p3 = rest.slice(7);
    return `+62 ${p1}-${p2}${p3 ? '-' + p3 : ''}`;
  };

  const normalized = normalize(rawInput);
  const isValid = /^628[0-9]{8,12}$/.test(normalized);
  const displayFormatted = formatDisplay(normalized);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setRawInput(raw);
    const norm = normalize(raw);
    onChange(norm, raw);
  };

  return (
    <div className={clsx('space-y-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {rawInput && (
            <span
              className={clsx(
                'text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1',
                isValid
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              )}
            >
              {isValid ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Format Valid
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" />
                  Format Belum Pas
                </>
              )}
            </span>
          )}
        </div>
      )}

      <div className="relative rounded-xl shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            ID +62
          </span>
        </div>
        <input
          type="text"
          value={rawInput}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={clsx(
            'w-full pl-20 pr-4 py-2.5 text-sm rounded-xl border bg-white text-slate-900 transition-all',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600',
            disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed',
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-300'
          )}
        />
      </div>

      {/* Realtime Normalization Preview */}
      {normalized && (
        <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
          <span>
            Standar Sistem:{' '}
            <code className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
              {normalized}
            </code>
          </span>
          {isValid && (
            <span className="text-slate-600 font-medium">
              {displayFormatted}
            </span>
          )}
        </div>
      )}

      {error ? (
        <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      ) : helperText && !normalized ? (
        <p className="text-[11px] text-slate-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};
