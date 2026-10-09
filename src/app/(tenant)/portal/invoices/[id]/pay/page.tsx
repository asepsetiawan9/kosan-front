'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TenantInvoicePayRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      router.replace(`/portal/invoices/${id}`);
    } else {
      router.replace('/portal/invoices');
    }
  }, [id, router]);

  return (
    <div className="p-12 text-center text-slate-500 text-sm">
      Mengalihkan ke detail tagihan...
    </div>
  );
}
