import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from './DashboardPage';
import { AuthContext, type AuthContextValue } from '../auth/AuthProvider';
import type { SystemRole } from '../types/api';

const cases = [{
  id: 'c', caseNumber: 'CASE-1', title: 'Bridge', description: null, status: 'ORP_READY',
  riskLevel: 'VERY_HIGH', priorityLevel: 'CRITICAL', emergencyFlag: true,
  createdAt: '2026-01-01', updatedAt: '2026-01-01', closedAt: null,
  asset: { id: 'a', assetCode: 'A', name: 'Bridge', assetType: 'BRIDGE', departmentId: 'd',
    jurisdictionId: 'j', department: { id: 'd', name: 'Works' }, jurisdiction: { id: 'j', name: 'Pune' } },
}];
const ok = (data: unknown) => new Response(JSON.stringify({ success: true, data }), { status: 200 });
const failure = () => new Response(JSON.stringify({
  success: false, error: { code: 'SERVER_ERROR', message: 'internal detail' },
}), { status: 500 });

function show(role: SystemRole, fetchMock = vi.fn(async (url: string) =>
  url.endsWith('/cases') ? ok(cases) : ok([]))) {
  vi.stubGlobal('fetch', fetchMock);
  const value: AuthContextValue = {
    user: { id: 'u', employeeCode: 'E', name: 'User', email: 'u@test', designation: 'Officer',
      role, status: 'ACTIVE', departmentId: 'd', jurisdictionId: 'j' },
    token: 't', organization: null, isAuthenticated: true, authStatus: 'authenticated',
    sessionMessage: null, login: vi.fn(), logout: vi.fn(),
  };
  const onCases = vi.fn(); const onAdmin = vi.fn();
  render(<AuthContext.Provider value={value}>
    <DashboardPage onCases={onCases} onAdmin={onAdmin} />
  </AuthContext.Provider>);
  return { onCases, onAdmin };
}

afterEach(() => vi.unstubAllGlobals());

describe('role dashboards', () => {
  it.each([
    ['OFFICER', 'Operational overview'], ['AUDITOR', 'Governance and accountability overview'],
    ['POLICY_ADMIN', 'Persisted policy and risk overview'],
  ] as const)('renders %s persisted numeric summary', async (role, title) => {
    show(role);
    expect(await screen.findByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.getByText('Visible cases').previousSibling).toHaveTextContent('1');
    expect(screen.queryByText(/assigned to me|policy edit/i)).not.toBeInTheDocument();
  });

  it('renders SYSTEM_ADMIN administration navigation without operational controls', async () => {
    const { onAdmin } = show('SYSTEM_ADMIN');
    expect(await screen.findByRole('heading', { name: 'System administration overview' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open Administration' }));
    expect(onAdmin).toHaveBeenCalled();
    expect(screen.queryByText(/Run deterministic assessment|Record inspection/)).not.toBeInTheDocument();
  });

  it('navigates into the existing Cases experience', async () => {
    const { onCases } = show('AUDITOR');
    await screen.findByText('CASE-1');
    fireEvent.click(screen.getByRole('button', { name: /CASE-1/ }));
    expect(onCases).toHaveBeenCalled();
  });

  it('recovers from a failed dashboard request when retried', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(failure()).mockResolvedValueOnce(ok(cases));
    show('OFFICER', fetchMock);
    expect(await screen.findByRole('alert')).toHaveTextContent('currently unavailable');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('heading', { name: 'Operational overview' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
