const AUTH_KEYS = ['accessToken', 'userId', 'fullName', 'email', 'roleName', 'refreshToken'] as const;

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  for (const key of AUTH_KEYS) {
    localStorage.removeItem(key);
  }
  window.dispatchEvent(new Event('storage'));
}

export function isAuthApiRequest(url: string): boolean {
  const normalized = url.toLowerCase();
  return (
    normalized.includes('/auth/login') ||
    normalized.includes('/auth/register') ||
    normalized.includes('/auth/forgotpassword') ||
    normalized.includes('/auth/resetpassword') ||
    normalized.includes('/auth/refreshtoken')
  );
}
