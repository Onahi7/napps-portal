/**
 * Unified API Base URL Configuration for NAPPS Nasarawa Portal
 * Resolves to the Cloudflare Worker backed by D1 and R2.
 * or local/environment override if specified in .env.
 */
import { resolveApiBaseUrl } from './apiBase';

export const API_BASE_URL = resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL as string);

export default API_BASE_URL;
