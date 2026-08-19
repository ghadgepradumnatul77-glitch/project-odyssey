import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from './client';
import { ApiClientError } from './errors';

afterEach(() => vi.unstubAllGlobals());

describe('API client', () => {
  it('returns data from a valid success envelope and supports AbortSignal', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: { status: 'ok' } }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();
    await expect(apiRequest<{ status: string }>('/health', { signal: controller.signal })).resolves.toEqual({ status: 'ok' });
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:4000/api/v1/health', expect.objectContaining({ signal: controller.signal }));
  });

  it('preserves controlled API status, code, and safe message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, error: { code: 'CASE_NOT_FOUND', message: 'Case not found.' } }), { status: 404 })));
    await expect(apiRequest('/cases/hidden')).rejects.toEqual(expect.objectContaining({ kind: 'api', status: 404, code: 'CASE_NOT_FOUND', message: 'Case not found.' }));
  });

  it('uses a safe error for network failures without exposing raw internals', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('socket details and credentials')));
    await expect(apiRequest('/health')).rejects.toEqual(expect.objectContaining({ kind: 'network', status: null, code: 'NETWORK_ERROR', message: 'The JanSeva IntelliGov service could not be reached.' }));
  });

  it('rejects malformed responses without returning their raw content', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('database password leaked here', { status: 500 })));
    const error = await apiRequest('/health').catch((reason: unknown) => reason);
    expect(error).toEqual(expect.objectContaining({ kind: 'malformed_response', code: 'MALFORMED_RESPONSE' }));
    expect((error as Error).message).not.toContain('password');
  });
});
