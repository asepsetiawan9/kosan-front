'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPaymentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/invoices');
  }, [router]);

  return (
    <div className="p-8 text-center text-slate-500 text-sm">
      Mengalihkan ke halaman Tagihan & Invoice...
    </div>
  );
}
