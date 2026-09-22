'use client';

import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ReportExportDropdownProps {
  month: number;
  year: number;
}

export default function ReportExportDropdown({ month, year }: ReportExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'excel' | 'pdf') => {
    setIsOpen(false);
    setIsExporting(true);

    try {
      const url = `/api/proxy/admin/reports/export?format=${format}&month=${month}&year=${year}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error('Gagal mengunduh laporan.');
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = format === 'excel'
        ? `laporan-keuangan-${month}-${year}.xlsx`
        : `laporan-keuangan-${month}-${year}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengunduh berkas laporan.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="gap-2 bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white text-xs px-4 py-2.5 shadow-sm shadow-teal-700/20"
      >
        {isExporting ? (
          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        <span>{isExporting ? 'Menyiapkan...' : 'Export Laporan'}</span>
        <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-80" />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in-50 zoom-in-95">
            <button
              onClick={() => handleExport('excel')}
              className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors font-medium"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor ke Excel (.xlsx)</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors font-medium"
            >
              <FileText className="w-4 h-4 text-rose-600" />
              <span>Ekspor Dokumen PDF Resmi</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
