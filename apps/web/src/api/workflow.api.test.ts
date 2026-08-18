import { afterEach, describe, expect, it, vi } from 'vitest';
import { listCases } from './cases.api';
import { getExecutionPlan, listDecisions, listExecutionPlans, listInspections, listOrps, listRiskAssessments } from './workflow.api';
import { ApiClientError } from './errors';
const ok = (data: unknown = []) => new Response(JSON.stringify({ success: true, data }), { status: 200 });
afterEach(() => vi.unstubAllGlobals());
describe('read-only workflow APIs', () => {
  it.each([
    ['cases', (s: AbortSignal) => listCases('token', s), '/cases'],
    ['inspections', (s: AbortSignal) => listInspections('case-1', 'token', s), '/cases/case-1/inspections'],
    ['risk', (s: AbortSignal) => listRiskAssessments('case-1', 'token', s), '/cases/case-1/risk-assessments'],
    ['ORPs', (s: AbortSignal) => listOrps('case-1', 'token', s), '/cases/case-1/orps'],
    ['decisions', (s: AbortSignal) => listDecisions('case-1', 'token', s), '/cases/case-1/decisions'],
    ['execution plans', (s: AbortSignal) => listExecutionPlans('case-1', 'token', s), '/cases/case-1/execution-plans'],
    ['execution detail', (s: AbortSignal) => getExecutionPlan('plan-1', 'token', s), '/execution-plans/plan-1']
  ])('authenticates and forwards AbortSignal for %s', async (_name, call, path) => {
    const fetchMock = vi.fn().mockResolvedValue(ok()); vi.stubGlobal('fetch', fetchMock); const controller = new AbortController(); await call(controller.signal);
    expect(fetchMock.mock.calls[0][0]).toContain(path); expect((fetchMock.mock.calls[0][1].headers as Headers).get('Authorization')).toBe('Bearer token'); expect(fetchMock.mock.calls[0][1].signal).toBe(controller.signal);
  });
  it('preserves a controlled API error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, error: { code: 'FORBIDDEN', message: 'Denied.' } }), { status: 403 })));
    const error = await listCases('token').catch((reason: unknown) => reason); expect(error).toBeInstanceOf(ApiClientError); expect(error).toMatchObject({ status: 403, code: 'FORBIDDEN' });
  });
});
