'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { TenantProfile } from '@/lib/types';
import { TenantSidebar } from '@/components/tenant/TenantSidebar';
import { TenantHeader } from '@/components/tenant/TenantHeader';

export default function TenantPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Jangan tampilkan shell sidebar/header di halaman login dan change-password
  const isAuthPage = pathname === '/portal/login' || pathname === '/portal/change-password';

  const { data: profile } = useQuery<TenantProfile>({
    queryKey: ['tenant-profile'],
    queryFn: async () => {
      const res = await apiRequest<{ data: TenantProfile }>('/tenant/profile');
      return res.data;
    },
    enabled: !isAuthPage,
    staleTime: 1000 * 60 * 5, // 5 menit
  });

  if (isAuthPage) {
    return <>{children}</>;
  }

  const roomNumber = profile?.active_tenancy?.room?.room_number;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <TenantSidebar roomNumber={roomNumber} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TenantHeader profile={profile} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
