import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AdministrationPage from './AdministrationPage';
import { AuthContext, type AuthContextValue } from '../auth/AuthProvider';

const department = { id: 'd', name: 'Public Works', code: 'PWD', createdAt: '2026' };
const roadsDepartment = { id: 'd2', name: 'Roads', code: 'RD', createdAt: '2026' };
const jurisdiction = {
  id: 'j', name: 'Pune', type: 'DIVISION', departmentId: 'd', createdAt: '2026', department,
};
const roadsJurisdiction = {
  id: 'j2', name: 'Mumbai', type: 'DIVISION', departmentId: 'd2', createdAt: '2026',
  department: roadsDepartment,
};
const user = {
  id: 'u', name: 'Officer', designation: 'Engineer', employeeCode: 'E', email: 'u@test',
  role: 'OFFICER' as const, status: 'ACTIVE' as const, departmentId: 'd',
  jurisdictionId: 'j', createdAt: '2026',
};
const ok = (data: unknown) => new Response(JSON.stringify({ success: true, data }), { status: 200 });
const authValue: AuthContextValue = {
  user, token: 't', organization: null, isAuthenticated: true, authStatus: 'authenticated',
  sessionMessage: null, login: vi.fn(), logout: vi.fn(),
};

function show() {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (init?.method === 'POST') return ok({ id: 'new' });
    if (url.endsWith('/departments')) return ok([department, roadsDepartment]);
    if (url.endsWith('/jurisdictions')) return ok([jurisdiction, roadsJurisdiction]);
    if (url.endsWith('/users')) return ok([user]);
    return ok([]);
  });
  vi.stubGlobal('fetch', fetchMock);
  render(<AuthContext.Provider value={authValue}><AdministrationPage /></AuthContext.Provider>);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe('Administration', () => {
  it('creates a department and authoritatively refetches registries', async () => {
    const fetchMock = show();
    await screen.findByText('Public Works');
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Roads' } });
    fireEvent.change(screen.getByLabelText('Code'), { target: { value: 'RD' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create record' }));
    expect(await screen.findByText('Departments record created.')).toBeInTheDocument();
    await waitFor(() => expect(fetchMock.mock.calls.filter(
      (call) => String(call[0]).endsWith('/departments'),
    ).length).toBeGreaterThan(1));
    const postCall = fetchMock.mock.calls.find((call) => call[1]?.method === 'POST');
    expect(JSON.parse(String(postCall?.[1]?.body))).toEqual({ name: 'Roads', code: 'RD' });
  });

  it('provides selector-backed create forms for every registry without edit/delete controls', async () => {
    show();
    await screen.findByText('Public Works');
    for (const tab of ['Jurisdictions', 'Assets', 'Users', 'Approval Authorities']) {
      fireEvent.click(screen.getByRole('button', { name: tab }));
      expect(screen.getByRole('heading', { name: `Create ${tab}` })).toBeInTheDocument();
      if (tab === 'Users') expect(screen.getByText(/OFFICER role alone/)).toBeInTheDocument();
    }
    expect(screen.getAllByText(/Public Works/).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /delete|edit|revoke/i })).not.toBeInTheDocument();
  });

  it('limits jurisdiction choices to the selected department', async () => {
    show();
    await screen.findByText('Public Works');
    fireEvent.click(screen.getByRole('button', { name: 'Assets' }));
    const jurisdictionSelect = screen.getByLabelText('Jurisdiction');
    expect(jurisdictionSelect).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Department'), { target: { value: 'd' } });
    expect(jurisdictionSelect).toBeEnabled();
    expect(screen.getByRole('option', { name: 'Pune' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Mumbai' })).not.toBeInTheDocument();
  });

  it('filters the current persisted registry without changing server data', async () => {
    show();
    await screen.findByText('Public Works');
    fireEvent.change(screen.getByLabelText('Search departments'), { target: { value: 'PWD' } });
    expect(screen.getByText('Public Works')).toBeInTheDocument();
    expect(screen.queryByText('Roads')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Search departments'), { target: { value: 'missing' } });
    expect(screen.getByText(/No departments match this search/)).toBeInTheDocument();
  });
});
