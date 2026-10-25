export const CLOUDFLARE_API_BASE = 'https://napps-backend.dicksonhardy7.workers.dev/api/v1';

export function resolveApiBaseUrl(configured?: string): string {
  const value = configured?.trim().replace(/\/+$/, '');
  if (!value) return CLOUDFLARE_API_BASE;
  // Older hosting environments still set one of these retired endpoints.
  // Both registration and lookup must use the D1-backed Worker.
  const retired = /^https?:\/\/(napps-api\.dicksonhardy7\.workers\.dev|napps-backend-5ty7\.onrender\.com)(\/|$)/i;
  return retired.test(value) ? CLOUDFLARE_API_BASE : value;
}
