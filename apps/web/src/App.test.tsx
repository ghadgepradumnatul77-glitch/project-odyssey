import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { apiRequest } from './api/client';

const user = { id: 'u1', employeeCode: 'PWD-1', name: 'Rahul Patil', email: 'rahul@example.test', designation: 'Executive Engineer', role: 'OFFICER', status: 'ACTIVE', departmentId: 'dep', jurisdictionId: 'jur' };
const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });
function successfulLoginFetch() {
  return vi.fn()
    .mockResolvedValueOnce(response({ success: true, data: { accessToken: 'secret-token', tokenType: 'Bearer', expiresIn: 900, user } }))
    .mockResolvedValueOnce(response({ success: true, data: user }))
    .mockResolvedValueOnce(response({ success: true, data: [{ id: 'dep', name: 'Public Works Department', code: 'PWD' }] }))
    .mockResolvedValueOnce(response({ success: true, data: [{ id: 'jur', name: 'Pune Division', type: 'DIVISION' }] }))
    .mockResolvedValueOnce(response({ success: true, data: [] }));
}
async function submitLogin() {
  fireEvent.change(screen.getByLabelText(/organizational email/i), { target: { value: 'rahul@example.test' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
  fireEvent.click(screen.getByRole('button', { name: /sign in securely/i }));
  await screen.findByRole('heading', { name: 'Operational overview' });
}

afterEach(() => vi.unstubAllGlobals());

describe('authenticated application', () => {
  it('starts unauthenticated with no restored session', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /public infrastructure decision intelligence/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Operational overview' })).not.toBeInTheDocument();
  });
  it('validates identity with auth/me, renders organization, and logs out', async () => {
    const fetchMock = successfulLoginFetch(); vi.stubGlobal('fetch', fetchMock);
    render(<App />); await submitLogin();
    expect(fetchMock.mock.calls[1][0]).toContain('/auth/me');
    expect((fetchMock.mock.calls[1][1].headers as Headers).get('Authorization')).toBe('Bearer secret-token');
    expect(screen.getByText('Rahul Patil')).toBeInTheDocument();
    expect(screen.getByText('JanSeva IntelliGov')).toBeInTheDocument();
    expect(screen.getByText('Decision Intelligence for Explainable & Accountable Public Infrastructure')).toBeInTheDocument();
    expect(screen.getAllByText(/Public Works Department/).find((node) => node.textContent?.includes('Pune Division'))).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /log out/i }));
    expect(screen.getByRole('heading', { name: /public infrastructure decision intelligence/i })).toBeInTheDocument();
  });
  it('does not authenticate when auth/me fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response({ success: true, data: { accessToken: 'token', tokenType: 'Bearer', expiresIn: 900, user } })).mockResolvedValueOnce(response({ success: false, error: { code: 'INVALID_TOKEN', message: 'Expired.' } }, 401)));
    render(<App />);
    fireEvent.change(screen.getByLabelText(/organizational email/i), { target: { value: 'a@b.test' } }); fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } }); fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Operational overview' })).not.toBeInTheDocument();
  });
  it('clears an authenticated session after a 401 and shows one safe message', async () => {
    const fetchMock = successfulLoginFetch(); vi.stubGlobal('fetch', fetchMock);
    render(<App />); await submitLogin();
    fetchMock.mockResolvedValueOnce(response({ success: false, error: { code: 'INVALID_TOKEN', message: 'Raw backend expiry.' } }, 401));
    await apiRequest('/protected', { accessToken: 'secret-token' }).catch(() => undefined);
    expect(await screen.findByText('Your session expired. Please sign in again.')).toBeInTheDocument();
  });
  it('never persists the token in browser storage', async () => {
    const storageSpy = vi.spyOn(Storage.prototype, 'setItem'); const fetchMock = successfulLoginFetch(); vi.stubGlobal('fetch', fetchMock);
    render(<App />); await submitLogin();
    expect(storageSpy).not.toHaveBeenCalled();
    storageSpy.mockRestore();
  });
});
