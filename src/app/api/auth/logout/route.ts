import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  if (token) {
    try {
      await fetch(`${apiUrl}/api/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
    } catch {
      // Abaikan jika network error saat logout di backend
    }
  }

  const response = NextResponse.json({ message: 'Logout berhasil' });
  response.cookies.delete('auth_token');
  response.cookies.delete('user_role');
  response.cookies.delete('must_change_password');
  return response;
}
