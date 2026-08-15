const DEVELOPMENT_API_BASE_URL = 'http://localhost:4000/api/v1';

export function normalizeApiBaseUrl(value: string): string {
  const normalized = value.trim().replace(/\/+$/, '');
  if (!normalized) throw new Error('VITE_API_BASE_URL must not be empty.');

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error('VITE_API_BASE_URL must be a valid absolute URL.');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('VITE_API_BASE_URL must use HTTP or HTTPS.');
  }
  return normalized;
}

export function getApiBaseUrl(value = import.meta.env.VITE_API_BASE_URL): string {
  return normalizeApiBaseUrl(value ?? DEVELOPMENT_API_BASE_URL);
}

export const API_BASE_URL = getApiBaseUrl();
