import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;
  const mustChangePassword = request.cookies.get('must_change_password')?.value === '1';
  const { pathname } = request.nextUrl;

  // 1. Proteksi rute admin (/dashboard/*)
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Jika sudah login dan mengakses /login admin
  if (pathname === '/login' && token && userRole !== 'penyewa') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. Proteksi rute portal penghuni (/portal/*)
  if (pathname.startsWith('/portal')) {
    // Halaman login penghuni
    if (pathname === '/portal/login') {
      if (token) {
        if (mustChangePassword) {
          return NextResponse.redirect(new URL('/portal/change-password', request.url));
        }
        return NextResponse.redirect(new URL('/portal/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // Rute selain /portal/login wajib punya token
    if (!token) {
      const tenantLoginUrl = new URL('/portal/login', request.url);
      tenantLoginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(tenantLoginUrl);
    }

    // Jika wajib ganti password tapi mengakses halaman portal lain
    if (mustChangePassword && pathname !== '/portal/change-password') {
      return NextResponse.redirect(new URL('/portal/change-password', request.url));
    }

    // Jika sudah tidak perlu ganti password tapi mencoba buka /portal/change-password
    if (!mustChangePassword && pathname === '/portal/change-password') {
      return NextResponse.redirect(new URL('/portal/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/portal/:path*'],
};
