import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Sesi login tidak valid atau telah kedaluwarsa.' }, { status: 401 });
    }

    const res = await fetch(`${apiUrl}/api/tenant/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || 'Gagal mengubah kata sandi.', errors: data.errors },
        { status: res.status }
      );
    }

    const response = NextResponse.json({
      message: data.message || 'Kata sandi berhasil diperbarui.',
    });

    const isSecure = request.nextUrl.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https';

    // Update must_change_password cookie flag to 0
    response.cookies.set('must_change_password', '0', {
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
