import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  try {
    const res = await fetch(`${apiUrl}/api/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      const response = NextResponse.json({ user: null }, { status: 401 });
      response.cookies.delete('auth_token');
      return response;
    }

    const data = await res.json();
    return NextResponse.json({ user: data.user });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
