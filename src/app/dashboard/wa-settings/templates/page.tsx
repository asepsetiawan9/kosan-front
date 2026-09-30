'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WaTemplate } from '@/lib/types';
import { WaTemplateEditorModal } from '@/components/admin/WaTemplateEditorModal';
import {
  FileText,
  Search,
  Edit3,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  BellRing,
  CreditCard,
  Bot,
  MessageSquare,
} from 'lucide-react';

export default function WaTemplatesPage() {
  const [templates, setTemplates] = useState<WaTemplate[]>([]);
  const [placeholders, setPlaceholders] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [selectedTemplate, setSelectedTemplate] = useState<WaTemplate | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/proxy/admin/wa/templates');
      const json = await res.json();
      if (res.ok) {
        setTemplates(json.data || []);
        setPlaceholders(json.placeholders || {});
      }
    } catch (err) {
      console.error('Failed fetching WA templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const getCategory = (key: string) => {
    if (key.startsWith('reminder_')) return 'reminder';
    if (key.startsWith('proof_')) return 'proof';
    if (key.startsWith('bot_')) return 'bot';
    return 'other';
  };

  const filteredTemplates = templates.filter((tpl) => {
    const matchesSearch =
      tpl.title.toLowerCase().includes(search.toLowerCase()) ||
      tpl.key.toLowerCase().includes(search.toLowerCase()) ||
      tpl.body.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (categoryFilter === 'reminder') return getCategory(tpl.key) === 'reminder';
    if (categoryFilter === 'proof') return getCategory(tpl.key) === 'proof';
    if (categoryFilter === 'bot') return getCategory(tpl.key) === 'bot';

    return true;
  });

  const getCategoryBadge = (key: string) => {
    const cat = getCategory(key);
    switch (cat) {
      case 'reminder':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
            <BellRing className="w-2.5 h-2.5" /> Pengingat Tagihan
          </span>
        );
      case 'proof':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
            <CreditCard className="w-2.5 h-2.5" /> Bukti Pembayaran
          </span>
        );
      case 'bot':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200/60">
            <Bot className="w-2.5 h-2.5" /> Layanan Chatbot
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
            <MessageSquare className="w-2.5 h-2.5" /> Umum
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Template Pesan WhatsApp
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
              {templates.length} Template
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sesuaikan teks dan parameter placeholder otomatis untuk seluruh notifikasi sistem dan balasan bot kosan.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={fetchTemplates}
          isLoading={loading}
          className="self-start sm:self-auto text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Segarkan
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul, kunci, atau teks template..."
              className="pl-9 text-xs w-full"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({templates.length})
            </button>
            <button
              onClick={() => setCategoryFilter('reminder')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === 'reminder'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pengingat Tagihan ({templates.filter((t) => getCategory(t.key) === 'reminder').length})
            </button>
            <button
              onClick={() => setCategoryFilter('proof')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === 'proof'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Bukti Bayar ({templates.filter((t) => getCategory(t.key) === 'proof').length})
            </button>
            <button
              onClick={() => setCategoryFilter('bot')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === 'bot'
                  ? 'bg-indigo-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Bot ({templates.filter((t) => getCategory(t.key) === 'bot').length})
            </button>
          </div>
        </div>
      </Card>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-5 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-100 rounded w-1/4" />
              <div className="h-16 bg-slate-50 rounded" />
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card className="p-10 text-center border-dashed border-slate-200">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">Tidak ada template yang cocok</p>
          <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((tpl) => (
            <Card
              key={tpl.id}
              className="p-5 border-slate-200 hover:border-teal-200 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Card */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getCategoryBadge(tpl.key)}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tpl.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {tpl.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{tpl.title}</h3>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedTemplate(tpl);
                      setIsEditorOpen(true);
                    }}
                    className="text-xs shrink-0 hover:border-teal-400 hover:text-teal-700"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                </div>

                {/* Key identifier */}
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500">Key:</span>
                  <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                    {tpl.key}
                  </code>
                </div>

                {/* Body snippet */}
                <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-700 font-sans leading-relaxed line-clamp-3 whitespace-pre-wrap">
                  {tpl.body}
                </div>
              </div>

              {/* Bottom footer metadata */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Format Bahasa Indonesia
                </span>
                <span>
                  Diperbarui: {new Date(tpl.updated_at).toLocaleDateString('id-ID')}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <WaTemplateEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
        placeholders={placeholders}
        onSaved={fetchTemplates}
      />
    </div>
  );
}
