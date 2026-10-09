'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BillingStatCards } from '@/components/admin/BillingStatCards';
import { BillingDueTimeline } from '@/components/admin/BillingDueTimeline';
import { BillingTargetList } from '@/components/admin/BillingTargetList';
import { BillingPreviewModal } from '@/components/admin/BillingPreviewModal';
import { BillingBulkModal } from '@/components/admin/BillingBulkModal';
import { BillingTarget, BillingTemplate } from '@/lib/types';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  History,
  RefreshCw,
  Smartphone,
  Sparkles,
} from 'lucide-react';

interface BillingSummaryData {
  jatuh_tempo_hari_ini: number;
  mendekati: number;
  tunggakan: number;
  lunas_bulan_ini: number;
  total_target: number;
}

export default function BillingCenterPage() {
  const [summary, setSummary] = useState<BillingSummaryData>({
    jatuh_tempo_hari_ini: 0,
    mendekati: 0,
    tunggakan: 0,
    lunas_bulan_ini: 0,
    total_target: 0,
  });

  const [targets, setTargets] = useState<BillingTarget[]>([]);
  const [templates, setTemplates] = useState<BillingTemplate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [previewTarget, setPreviewTarget] = useState<BillingTarget | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [summaryRes, targetsRes, templatesRes] = await Promise.all([
        apiRequest<{ data: BillingSummaryData }>('admin/billing/summary'),
        apiRequest<{ data: BillingTarget[] }>(
          `admin/billing/targets?status=${activeFilter === 'all' ? '' : activeFilter}&search=${encodeURIComponent(
            searchQuery
          )}`
        ),
        apiRequest<{ data: BillingTemplate[] }>('admin/billing/templates'),
      ]);

      setSummary(summaryRes.data);
      setTargets(targetsRes.data);
      setTemplates(templatesRes.data);
    } catch (err) {
      console.error('Failed to load billing data', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenPreview = (target: BillingTarget) => {
    setPreviewTarget(target);
  };

  const handleBulkSend = (selectedIds: string[]) => {
    setBulkSelectedIds(selectedIds);
    setIsBulkModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Smartphone className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Pusat Penagihan
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Kirim pengingat sewa dan bukti tagihan langsung ke WhatsApp penghuni tanpa gateway eksternal
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={loadData}
            disabled={isLoading}
            className="text-xs h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Perbarui Data
          </Button>

          <Link href="/dashboard/billing/templates">
            <Button size="sm" variant="outline" className="text-xs h-9">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Template Pesan
            </Button>
          </Link>

          <Link href="/dashboard/billing/history">
            <Button size="sm" variant="outline" className="text-xs h-9">
              <History className="w-3.5 h-3.5 mr-1.5" />
              Riwayat
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <BillingStatCards
        summary={summary}
        activeFilter={activeFilter}
        onSelectFilter={(filter) => setActiveFilter(filter)}
      />

      {/* Filter Timeline Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <BillingDueTimeline
          activeFilter={activeFilter}
          onFilterChange={(filter) => setActiveFilter(filter)}
          counts={{
            all: summary.total_target,
            jatuh_tempo_hari_ini: summary.jatuh_tempo_hari_ini,
            mendekati: summary.mendekati,
            tunggakan: summary.tunggakan,
            lunas: summary.lunas_bulan_ini,
          }}
        />

        <div className="text-xs text-slate-400 self-end sm:self-center">
          Menampilkan <strong className="text-slate-700">{targets.length}</strong> target penagihan
        </div>
      </div>

      {/* Target Table List */}
      <BillingTargetList
        targets={targets}
        isLoading={isLoading}
        onOpenPreview={handleOpenPreview}
        onBulkSend={handleBulkSend}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Preview Modal */}
      <BillingPreviewModal
        isOpen={!!previewTarget}
        onClose={() => setPreviewTarget(null)}
        target={previewTarget}
        templates={templates}
        onBillingSent={loadData}
      />

      {/* Bulk Processing Modal */}
      <BillingBulkModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        selectedTenancyIds={bulkSelectedIds}
        templates={templates}
        onFinished={loadData}
      />
    </div>
  );
}
