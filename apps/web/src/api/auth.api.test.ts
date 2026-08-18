import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCurrentUser, loginRequest } from './auth.api';
const user = { id: 'u', employeeCode: 'E', name: 'User', email: 'user@test', designation: 'Engineer', role: 'OFFICER', status: 'ACTIVE', departmentId: 'd', jurisdictionId: 'j' };
const ok = (data: unknown) => new Response(JSON.stringify({ success: true, data }), { status: 200 });
afterEach(() => vi.unstubAllGlobals());
describe('auth API', () => {
  it('sends the login body and returns the controlled result', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ accessToken: 'token', tokenType: 'Bearer', expiresIn: 900, user })); vi.stubGlobal('fetch', fetchMock);
    await expect(loginRequest('user@test', 'private-password')).resolves.toMatchObject({ accessToken: 'token', user });
    const init = fetchMock.mock.calls[0][1]; expect(init.method).toBe('POST'); expect(JSON.parse(init.body)).toEqual({ email: 'user@test', password: 'private-password' });
  });
  it('sends the Bearer token to auth/me', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok(user)); vi.stubGlobal('fetch', fetchMock);
    await getCurrentUser('private-token');
    expect((fetchMock.mock.calls[0][1].headers as Headers).get('Authorization')).toBe('Bearer private-token');
  });
  it('does not surface credentials through a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('private-password private-token')));
    const error = await loginRequest('user@test', 'private-password').catch((reason: unknown) => reason);
    expect((error as Error).message).not.toMatch(/private-password|private-token/);
  });
});
