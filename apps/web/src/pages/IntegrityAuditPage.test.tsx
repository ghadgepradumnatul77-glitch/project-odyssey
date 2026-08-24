import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '../auth/AuthProvider';
import IntegrityAuditPage from './IntegrityAuditPage';

const auth: AuthContextValue = {
  user: { id: 'u', name: 'Auditor', email: 'a@test', employeeCode: 'A', designation: 'Auditor', role: 'AUDITOR', status: 'ACTIVE', departmentId: 'd', jurisdictionId: 'j' },
  token: 'token', organization: null, isAuthenticated: true, authStatus: 'authenticated', sessionMessage: null, login: vi.fn(), logout: vi.fn()
};
const ok = (data: unknown) => Promise.resolve(new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
const summary = {
  coverageContractVersion: 'ODYSSEY_P3_4_GOVERNANCE_COVERAGE_V2',
  protectedEventTypes: ['CASE_CLOSED', 'HUMAN_DECISION_RECORDED'],
  eventCountsByType: { CASE_CLOSED: 1, HUMAN_DECISION_RECORDED: 2 },
  coverageDisclosure: 'Tamper-evident coverage applies to governance events recorded under the P3.4 integrity contract from their P3.4 genesis onward.',
  historicalBackfill: false
};
const chains = [{ chainKey: 'scope:d:j', chainVersion: 'ODYSSEY_INTEGRITY_CHAIN_V1', departmentId: 'd', jurisdictionId: 'j', latestSequence: 501, latestEventId: 'e', latestEventHash: `sha256:${'a'.repeat(64)}`, createdAt: 'x', updatedAt: 'x' }];
const fetchFor = (chainRows: unknown = chains) => vi.fn((url: string, init?: RequestInit) => {
  if (init?.method === 'POST') return ok({ status: 'VALID', chainKey: 'scope:d:j', eventsChecked: 501, genesisSequence: 1, complete: true });
  return url.endsWith('/integrity/summary') ? ok(summary) : ok(chainRows);
});

afterEach(() => vi.unstubAllGlobals());

describe('Integrity audit workspace', () => {
  it('shows truthful coverage, event counts and complete verification', async () => {
    vi.stubGlobal('fetch', fetchFor());
    render(<AuthContext.Provider value={auth}><IntegrityAuditPage /></AuthContext.Provider>);
    expect(await screen.findByText(/does not make the database tamper-proof/i)).toBeInTheDocument();
    expect(screen.getByText('CASE CLOSED')).toBeInTheDocument();
    expect(screen.getByText('HUMAN DECISION RECORDED')).toBeInTheDocument();
    expect(screen.getByText(/2 governed event types are covered prospectively/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Verify complete chain' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('501 events checked · Complete verification'));
    expect(document.body.textContent).not.toMatch(/blockchain verified|immutable database|hardware secured/i);
  });

  it('shows truthful empty-chain coverage without implying backfill', async () => {
    vi.stubGlobal('fetch', fetchFor([]));
    render(<AuthContext.Provider value={auth}><IntegrityAuditPage /></AuthContext.Provider>);
    expect(await screen.findByText('Empty integrity history')).toBeInTheDocument();
    expect(screen.getByText(/Earlier records remain legacy and unverified/)).toBeInTheDocument();
    expect(screen.getByText(/No historical events were fabricated or backfilled/)).toBeInTheDocument();
  });
});
