const DEVELOPMENT_API_BASE_URL = 'http://localhost:4000/api/v1';
const DEPLOYMENT_API_BASE_URL = '/api/v1';
export type PublicEnvironment = 'development' | 'test' | 'staging' | 'production';

export function normalizeApiBaseUrl(value: string): string {
  const normalized = value.trim().replace(/\/+$/, '');
  if (!normalized) throw new Error('VITE_API_BASE_URL must not be empty.');
  if (normalized.startsWith('/') && !normalized.startsWith('//')) return normalized;

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error('VITE_API_BASE_URL must be an absolute HTTP(S) URL or a root-relative path.');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('VITE_API_BASE_URL must use HTTP or HTTPS.');
  }
  return normalized;
}

export function getApiBaseUrl(value = import.meta.env.VITE_API_BASE_URL, mode = import.meta.env.MODE): string {
  if (!['development', 'test', 'staging', 'production'].includes(mode)) throw new Error('Frontend environment mode is unsupported.');
  return normalizeApiBaseUrl(value ?? (mode === 'development' || mode === 'test' ? DEVELOPMENT_API_BASE_URL : DEPLOYMENT_API_BASE_URL));
}

export const API_BASE_URL = getApiBaseUrl();
