'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ComplaintForm } from '@/components/tenant/ComplaintForm';
import { apiRequest } from '@/lib/api';

export default function NewComplaintPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setErrorMessage('');

    try {
      await apiRequest('/tenant/complaints', {
        method: 'POST',
        body: formData,
      });

      router.push('/portal/complaints');
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal mengirim tiket aduan.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Link */}
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Aduan</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Ajukan Tiket Aduan Baru</h1>
        <p className="text-sm text-slate-500 mt-1">
          Laporkan kendala fasilitas kamar kos Anda. Pengelola akan segera menerima notifikasi langsung via WhatsApp.
        </p>
      </div>

      {/* Extracted ComplaintForm Component */}
      <ComplaintForm
        onSubmit={handleSubmit}
        isSubmitting={loading}
        errorMessage={errorMessage}
      />
    </div>
  );
}
