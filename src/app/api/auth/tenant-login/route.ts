import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    const res = await fetch(`${apiUrl}/api/tenant/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || 'Login penghuni gagal. Periksa kembali email/nomor HP dan kata sandi.' },
        { status: res.status }
      );
    }

    const response = NextResponse.json({
      message: data.message || 'Login berhasil',
      user: data.user,
      must_change_password: data.must_change_password,
    });

    // Cek protokol request: hanya gunakan flag secure jika request menggunakan HTTPS
    const isSecure = request.nextUrl.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https';

    // Simpan token ke httpOnly cookie
    response.cookies.set('auth_token', data.token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    response.cookies.set('user_role', 'penyewa', {
      httpOnly: false,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.set('must_change_password', data.must_change_password ? '1' : '0', {
      httpOnly: false,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan sistem internal.';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
