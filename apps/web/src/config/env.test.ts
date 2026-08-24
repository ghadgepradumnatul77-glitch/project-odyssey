import { describe, expect, it } from 'vitest';
import { getApiBaseUrl, normalizeApiBaseUrl } from './env';

describe('API environment configuration', () => {
  it('normalizes trailing slashes', () => expect(normalizeApiBaseUrl(' https://api.example.test/api/v1/// ')).toBe('https://api.example.test/api/v1'));
  it('uses the documented development fallback', () => expect(getApiBaseUrl(undefined, 'development')).toBe('http://localhost:4000/api/v1'));
  it('uses a production-safe same-origin default', () => expect(getApiBaseUrl(undefined, 'production')).toBe('/api/v1'));
  it('accepts a configured non-local production API', () => expect(getApiBaseUrl('https://api.example.gov.in/api/v1', 'production')).toBe('https://api.example.gov.in/api/v1'));
  it('rejects unknown build environments', () => expect(() => getApiBaseUrl('/api/v1', 'preview')).toThrow(/environment mode/));
  it('accepts a same-origin root-relative deployment URL', () => expect(normalizeApiBaseUrl('/api/v1/')).toBe('/api/v1'));
  it.each(['', 'relative/path', 'ftp://api.example.test'])('rejects unsafe or invalid value %j', (value) => expect(() => normalizeApiBaseUrl(value)).toThrow());
});
