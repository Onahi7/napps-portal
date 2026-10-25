/**
 * Unified API Base URL Configuration for NAPPS Nasarawa Portal
 * Resolves to the high-performance Cloudflare Edge Worker gateway
 * or local/environment override if specified in .env.
 */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  'https://napps-api.dicksonhardy7.workers.dev/api/v1';

export default API_BASE_URL;
