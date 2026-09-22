import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/components/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'KosanKu — Sistem Manajemen Kos & Kontrakan Modern',
  description: 'Aplikasi pengelolaan kamar kos, hunian sewa, tagihan otomatis, dan pendaftaran penyewa modern berstandar perhotelan.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800 antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
