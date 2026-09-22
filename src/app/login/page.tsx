'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@kosan.com',
      password: 'password123',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login gagal.');
      }

      window.location.href = '/dashboard';
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Background Decorative Soft Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-emerald-glow text-white shadow-emerald-glow mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Portal Manajemen Kosan</h1>
          <p className="text-sm text-slate-500 mt-1">Masuk untuk mengelola kamar, penyewa, dan keuangan</p>
        </div>

        <Card className="border border-slate-200/80 shadow-soft-modal bg-white">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                {serverError}
              </div>
            )}

            <div>
              <div className="relative">
                <Input
                  label="Email Administrator"
                  type="email"
                  placeholder="admin@kosan.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Input
                  label="Kata Sandi"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full py-3 text-sm font-semibold shadow-emerald-glow"
                isLoading={isSubmitting}
              >
                Masuk ke Dashboard
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-800 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Akses Terlindungi:</span> Masuk menggunakan kredensial bawaan admin (<code className="font-mono text-[11px] bg-emerald-100/70 px-1 py-0.5 rounded">admin@kosan.com</code> / <code className="font-mono text-[11px] bg-emerald-100/70 px-1 py-0.5 rounded">password123</code>).
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
