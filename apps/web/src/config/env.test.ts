import { describe, expect, it } from 'vitest';
import { getApiBaseUrl, normalizeApiBaseUrl } from './env';

describe('API environment configuration', () => {
  it('normalizes trailing slashes', () => expect(normalizeApiBaseUrl(' https://api.example.test/api/v1/// ')).toBe('https://api.example.test/api/v1'));
  it('uses the documented development fallback', () => expect(getApiBaseUrl(undefined)).toBe('http://localhost:4000/api/v1'));
  it.each(['', 'relative/path', 'ftp://api.example.test'])('rejects unsafe or invalid value %j', (value) => expect(() => normalizeApiBaseUrl(value)).toThrow());
});
