'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, ArrowRight } from 'lucide-react';

export default function RoomCatalogRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/properti');
  }, [router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 shadow-xs animate-pulse">
        <Building2 className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">Mengalihkan ke Katalog Properti Kos...</h2>
      <p className="text-sm text-slate-500 mt-2 max-w-md">
        Pilihan unit kamar kini dapat dilihat dan dipilih langsung di dalam halaman masing-masing Properti Kos.
      </p>
      <Link
        href="/properti"
        className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
      >
        <span>Lihat Semua Properti Kos</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
