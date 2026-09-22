'use client';

import React, { useState } from 'react';
import { 
  AlertCircle, 
  Wrench, 
  Sparkles, 
  ShieldAlert, 
  HelpCircle, 
  MessageSquare, 
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Complaint, ComplaintCategory } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ComplaintTimeline } from './ComplaintTimeline';

interface ComplaintCardProps {
  complaint: Complaint;
}

const categoryIcons: Record<ComplaintCategory, React.ElementType> = {
  fasilitas_rusak: Wrench,
  kebersihan: Sparkles,
  keamanan: ShieldAlert,
  lainnya: HelpCircle,
};

const categoryLabels: Record<ComplaintCategory, string> = {
  fasilitas_rusak: 'Fasilitas Rusak',
  kebersihan: 'Kebersihan',
  keamanan: 'Keamanan',
  lainnya: 'Lainnya',
};

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const Icon = categoryIcons[complaint.category] || AlertCircle;
  const categoryLabel = categoryLabels[complaint.category] || complaint.category;

  const getFullPhotoUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    return `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-card p-5 transition-all hover:border-slate-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{categoryLabel}</h4>
            <p className="text-[11px] text-slate-400">
              {complaint.created_at ? new Date(complaint.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }) : '-'}
            </p>
          </div>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      {/* Description */}
      <p className="text-sm text-slate-700 leading-relaxed mb-4 whitespace-pre-line">
        {complaint.description}
      </p>

      {/* Attached Photo */}
      {complaint.photo_url && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-indigo-600" />
            <span>Lihat Foto Bukti Lampiran</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      )}

      {/* Status Progression Timeline */}
      <div className="pt-2 border-t border-slate-100">
        <ComplaintTimeline
          status={complaint.status}
          createdAt={complaint.created_at}
          resolvedAt={complaint.resolved_at}
          adminResponse={complaint.admin_response}
        />
      </div>

      {/* Photo Lightbox Modal */}
      {showImageModal && complaint.photo_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-soft-modal border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h5 className="font-bold text-slate-900 text-sm">Foto Bukti Keluhan</h5>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-slate-50 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={getFullPhotoUrl(complaint.photo_url)}
                alt="Foto Bukti Keluhan"
                className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
