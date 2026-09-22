export type UserRole = 'admin' | 'penyewa';

export interface AuthSession {
  isAuthenticated: boolean;
  role: UserRole | null;
  mustChangePassword: boolean;
}

/**
 * Membaca nilai cookie berdasarkan nama pada environment browser client.
 */
export function getClientCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Mengambil peran pengguna saat ini dari cookie browser.
 */
export function getUserRole(): UserRole | null {
  const role = getClientCookie('user_role');
  if (role === 'admin' || role === 'penyewa') {
    return role;
  }
  return null;
}

/**
 * Mengecek apakah pengguna memiliki flag wajib ganti kata sandi.
 */
export function getMustChangePassword(): boolean {
  const flag = getClientCookie('must_change_password');
  return flag === '1' || flag === 'true';
}

/**
 * Memeriksa status sesi otentikasi di client.
 */
export function getAuthSession(): AuthSession {
  const role = getUserRole();
  const mustChangePassword = getMustChangePassword();
  return {
    isAuthenticated: !!role,
    role,
    mustChangePassword,
  };
}

/**
 * Mengecek apakah user aktif adalah admin.
 */
export function isAdmin(): boolean {
  return getUserRole() === 'admin';
}

/**
 * Mengecek apakah user aktif adalah penghuni/penyewa.
 */
export function isTenant(): boolean {
  return getUserRole() === 'penyewa';
}

/**
 * Menentukan target URL pengalihan (redirect) sesuai status sesi.
 */
export function getRedirectUrlForUser(
  role: UserRole | null,
  mustChangePassword = false
): string {
  if (!role) return '/login';
  if (role === 'admin') return '/dashboard';
  if (role === 'penyewa') {
    return mustChangePassword ? '/portal/change-password' : '/portal/dashboard';
  }
  return '/';
}

/**
 * Melakukan proses logout aman dengan memanggil endpoint BFF logout
 * dan mengarahkan kembali pengguna ke halaman login yang sesuai.
 */
export async function logoutUser(redirectToLogin = true): Promise<void> {
  const role = getUserRole();
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  }

  if (redirectToLogin && typeof window !== 'undefined') {
    const targetUrl = role === 'penyewa' ? '/portal/login' : '/login';
    window.location.href = targetUrl;
  }
}
