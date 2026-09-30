'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  Send, 
  Settings, 
  ShieldCheck, 
  RefreshCw,
  Info
} from 'lucide-react';
import { WaConnectionStatus } from '@/components/admin/WaConnectionStatus';
import { WaHealthWidget } from '@/components/admin/WaHealthWidget';
import { WaTestSendModal } from '@/components/admin/WaTestSendModal';
import { WaMessageTable } from '@/components/admin/WaMessageTable';
import { 
  WaConnectionStatus as IWaConnectionStatus, 
  WaMessage, 
  WaTemplate 
} from '@/lib/types';

export default function WaConnectionSettingsPage() {
  const [status, setStatus] = useState<IWaConnectionStatus | null>(null);
  const [templates, setTemplates] = useState<WaTemplate[]>([]);
  const [placeholders, setPlaceholders] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<WaMessage[]>([]);
  
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [resendingId, setResendingId] = useState<string | null>(null);
  
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [directionFilter, setDirectionFilter] = useState('');

  // 1. Fetch Connection Status
  const fetchStatus = useCallback(async () => {
    try {
      setIsLoadingStatus(true);
      const res = await fetch('/api/proxy/admin/wa/connection-status');
      if (res.ok) {
        const json = await res.json();
        setStatus(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch WA connection status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  // 2. Fetch Templates
  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/proxy/admin/wa/templates');
      if (res.ok) {
        const json = await res.json();
        setTemplates(json.data || []);
        setPlaceholders(json.placeholders || {});
      }
    } catch (err) {
      console.error('Failed to fetch WA templates:', err);
    }
  }, []);

  // 3. Fetch Message Logs
  const fetchMessages = useCallback(async () => {
    try {
      setIsLoadingMessages(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (directionFilter) params.append('direction', directionFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/proxy/admin/wa/messages?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setMessages(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch WA messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [statusFilter, directionFilter, searchTerm]);

  // Initial load
  useEffect(() => {
    fetchStatus();
    fetchTemplates();
  }, [fetchStatus, fetchTemplates]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMessages();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchMessages]);

  // Handle Resend
  const handleResend = async (id: string) => {
    try {
      setResendingId(id);
      const res = await fetch(`/api/proxy/admin/wa/messages/${id}/resend`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchMessages();
        fetchStatus();
      }
    } catch (err) {
      console.error('Failed to resend message:', err);
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </span>
            Koneksi & Pengaturan WhatsApp
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Status gateway pengiriman pesan, konfigurasi webhook provider, dan log transmisi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTestModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-sm hover:shadow transition-all"
          >
            <Send className="w-4 h-4" />
            Kirim Pesan Uji
          </button>
        </div>
      </div>

      {/* Comprehensive WhatsApp Health Diagnostics Widget */}
      <WaHealthWidget onOpenTestModal={() => setIsTestModalOpen(true)} />

      {/* Gateway Connection Details & Webhook Configuration */}
      <WaConnectionStatus
        status={status}
        isLoading={isLoadingStatus}
        onRefresh={() => {
          fetchStatus();
          fetchMessages();
        }}
        onOpenTestModal={() => setIsTestModalOpen(true)}
      />

      {/* Section Header for Logs */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Riwayat Pesan WhatsApp
          </h2>
          <p className="text-xs text-slate-500">
            Log seluruh pesan notifikasi terkirim dan pesan masuk secara real-time
          </p>
        </div>
        <button
          onClick={fetchMessages}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
          title="Segarkan Log"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Message Logs Table */}
      <WaMessageTable
        messages={messages}
        isLoading={isLoadingMessages}
        onResend={handleResend}
        resendingId={resendingId}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        directionFilter={directionFilter}
        onDirectionFilterChange={setDirectionFilter}
      />

      {/* Test Send Modal */}
      <WaTestSendModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        templates={templates}
        placeholders={placeholders}
        onSendSuccess={() => {
          fetchMessages();
          fetchStatus();
        }}
      />
    </div>
  );
}
