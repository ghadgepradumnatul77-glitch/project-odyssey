import { afterEach, describe, expect, it, vi } from 'vitest';
import { listCases } from './cases.api';
import { assignExecutionTask, changeExecutionTaskStatus, closeCaseWorkflow, createExecutionPlan, generateOrp, getExecutionPlan, listDecisions, listEligibleExecutionAssignees, listExecutionPlans, listInspections, listOrps, listRiskAssessments, recordDecision, recordExecutionEvidence, recordInspection, runRiskAssessment, submitTaskCompletion, verifyTaskCompletion } from './workflow.api';
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
    ,['eligible assignees', (s: AbortSignal) => listEligibleExecutionAssignees('task-1', 'token', s), '/execution-tasks/task-1/eligible-assignees']
  ])('authenticates and forwards AbortSignal for %s', async (_name, call, path) => {
    const fetchMock = vi.fn().mockResolvedValue(ok()); vi.stubGlobal('fetch', fetchMock); const controller = new AbortController(); await call(controller.signal);
    expect(fetchMock.mock.calls[0][0]).toContain(path); expect((fetchMock.mock.calls[0][1].headers as Headers).get('Authorization')).toBe('Bearer token'); expect(fetchMock.mock.calls[0][1].signal).toBe(controller.signal);
  });
  it('preserves a controlled API error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, error: { code: 'FORBIDDEN', message: 'Denied.' } }), { status: 403 })));
    const error = await listCases('token').catch((reason: unknown) => reason); expect(error).toBeInstanceOf(ApiClientError); expect(error).toMatchObject({ status: 403, code: 'FORBIDDEN' });
  });
});

describe('governed workflow mutation APIs', () => {
  const inspection={caseId:'case-1',inspectionDate:'2026-08-18T10:00',structuralCondition:'POOR',crackSeverity:'SEVERE',corrosionLevel:'MODERATE',trafficImportance:'HIGH',hospitalRoute:true,weatherRisk:'HIGH',heavyRainExpected:true,estimatedDailyUsers:42000,inspectionNotes:'Observed'};
  it.each([
    ['inspection', (s:AbortSignal)=>recordInspection(inspection,'token',s), 'POST','/inspections',inspection],
    ['risk', (s:AbortSignal)=>runRiskAssessment('case-1','token',s), 'POST','/cases/case-1/assess-risk',undefined],
    ['ORP', (s:AbortSignal)=>generateOrp('case-1','token',s), 'POST','/cases/case-1/orps',undefined],
    ['decision', (s:AbortSignal)=>recordDecision('orp-1',{decisionType:'APPROVED',reason:'reviewed'},'token',s), 'POST','/orps/orp-1/decisions',{decisionType:'APPROVED',reason:'reviewed'}],
    ['execution plan', (s:AbortSignal)=>createExecutionPlan('orp-1','token',s), 'POST','/orps/orp-1/execution-plan',undefined],
    ['assignment', (s:AbortSignal)=>assignExecutionTask('task-1','officer-2','token',s), 'PATCH','/execution-tasks/task-1/assignment',{assigneeId:'officer-2'}],
    ['task status', (s:AbortSignal)=>changeExecutionTaskStatus('task-1',{status:'BLOCKED',reason:'weather'},'token',s), 'PATCH','/execution-tasks/task-1/status',{status:'BLOCKED',reason:'weather'}],
    ['evidence', (s:AbortSignal)=>recordExecutionEvidence('task-1',{evidenceType:'PHOTO_REFERENCE',description:'record'},'token',s), 'POST','/execution-tasks/task-1/evidence',{evidenceType:'PHOTO_REFERENCE',description:'record'}],
    ['completion', (s:AbortSignal)=>submitTaskCompletion('task-1','complete','token',s), 'POST','/execution-tasks/task-1/submit-completion',{completionNote:'complete'}],
    ['verification', (s:AbortSignal)=>verifyTaskCompletion('task-1','verified','token',s), 'POST','/execution-tasks/task-1/verify',{verificationNote:'verified'}],
    ['closure', (s:AbortSignal)=>closeCaseWorkflow('case-1','verified complete','token',s), 'POST','/cases/case-1/close',{closureReason:'EXECUTION_VERIFIED',closureSummary:'verified complete'}]
  ])('sends exact %s contract without trusted actor fields',async(_name,call,method,path,body)=>{const fetchMock=vi.fn().mockResolvedValue(ok({}));vi.stubGlobal('fetch',fetchMock);const controller=new AbortController();await call(controller.signal);const [url,init]=fetchMock.mock.calls[0];expect(url).toContain(path);expect(init.method).toBe(method);expect((init.headers as Headers).get('Authorization')).toBe('Bearer token');expect(init.signal).toBe(controller.signal);expect(init.body===undefined?undefined:JSON.parse(init.body)).toEqual(body);expect(init.body??'').not.toMatch(/inspectorId|reviewerId|createdById|submittedById|verifiedById|closedById|authorityId|departmentId|jurisdictionId/);});
});
