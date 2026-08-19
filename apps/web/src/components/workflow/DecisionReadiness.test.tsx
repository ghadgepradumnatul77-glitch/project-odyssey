import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../auth/AuthProvider';
import DecisionReadiness from './DecisionReadiness';

const auth = { token: 'token', accessToken: 'token', user: { role: 'OFFICER' }, isAuthenticated: true } as any;
const success = (data: unknown) => new Response(JSON.stringify({ success: true, data }), { status: 200 });
const base = { caseReference: 'CASE-1', assessmentVersion: 'ODYSSEY_READINESS_V1', evaluatedAt: '2026-08-20T12:00:00Z', policySummary: { governanceEstablished: false, status: 'NOT_REQUIRED' }, governance: { readOnly: true, caseMutated: false, approvalGranted: false, officerJudgmentRequired: true } };
const check = (label: string, status: string, message?: string) => ({ dimension: label.toUpperCase().replaceAll(' ', '_'), label, status, reasons: message ? [{ code: `READINESS_${status}`, message }] : [], provenance: [] });
function show(data: unknown) { vi.stubGlobal('fetch', vi.fn().mockResolvedValue(success(data))); return render(<AuthContext.Provider value={auth}><DecisionReadiness caseId="case" /></AuthContext.Provider>); }
afterEach(() => vi.unstubAllGlobals());

describe('Decision Readiness', () => {
  it('shows loading and then READY with checks and the approval disclaimer', async () => {
    show({ ...base, outcome: 'READY', checks: [check('Case context', 'PASS'), check('Policy governance', 'NOT_REQUIRED')], reasons: [{ code: 'READINESS_READY', message: 'Ready.' }] });
    expect(screen.getByText(/Loading decision readiness/)).toBeInTheDocument();
    expect(await screen.findByText('READY')).toBeInTheDocument();
    expect(screen.getByText('Case context')).toBeInTheDocument(); expect(screen.getByText('Policy governance')).toBeInTheDocument();
    expect(screen.getByText(/does not approve an action or replace officer judgment/i)).toBeInTheDocument();
  });
  it('shows NOT READY and officer-readable missing-input reasons', async () => {
    show({ ...base, outcome: 'NOT_READY', checks: [check('Inspection & evidence', 'INCOMPLETE', 'A persisted inspection is required.')], reasons: [] });
    expect(await screen.findByText('NOT READY')).toBeInTheDocument(); expect(screen.getByText('A persisted inspection is required.')).toBeInTheDocument();
  });
  it('shows BLOCKED and the governance blocker without AI confidence language', async () => {
    show({ ...base, outcome: 'BLOCKED', checks: [check('Policy governance', 'BLOCKED', 'Active policy rules conflict.')], reasons: [] });
    expect(await screen.findByText('Active policy rules conflict.')).toBeInTheDocument(); expect(screen.getAllByText('BLOCKED')).toHaveLength(2);
    expect(screen.queryByText(/AI confidence/i)).not.toBeInTheDocument(); expect(screen.queryByText(/probability/i)).not.toBeInTheDocument();
  });
  it('renders a controlled error state', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, error: { code: 'FORBIDDEN', message: 'internal' } }), { status: 403 })));
    render(<AuthContext.Provider value={auth}><DecisionReadiness caseId="case" /></AuthContext.Provider>);
    expect(await screen.findByText(/do not have authority/i)).toBeInTheDocument(); expect(screen.queryByText('internal')).not.toBeInTheDocument();
  });
});
