import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ caseFindFirst: vi.fn(), inspection: vi.fn(), risk: vi.fn(), orp: vi.fn(), decision: vi.fn(), plan: vi.fn(), task: vi.fn(), evidence: vi.fn(), closure: vi.fn() }));
vi.mock('../src/lib/prisma', () => ({ default: { case: { findFirst: mocks.caseFindFirst }, inspection: { findMany: mocks.inspection }, riskAssessment: { findMany: mocks.risk }, operationalResponsePlan: { findMany: mocks.orp }, orpDecision: { findMany: mocks.decision }, executionPlan: { findMany: mocks.plan }, executionTask: { findMany: mocks.task }, executionEvidence: { findMany: mocks.evidence }, caseClosure: { findMany: mocks.closure } } }));
import { getCaseTimeline } from '../src/modules/reporting/case-timeline.service';
const principal = { id: 'u', role: 'OFFICER', status: 'ACTIVE', departmentId: 'd', jurisdictionId: 'j' } as const;
const actor = { id: 'u', name: 'Officer', designation: 'Engineer' };
const when = new Date('2026-01-01T00:00:00Z');
beforeEach(() => { vi.clearAllMocks(); mocks.caseFindFirst.mockResolvedValue({ id: 'case', createdAt: when }); for (const mock of [mocks.inspection,mocks.risk,mocks.orp,mocks.decision,mocks.plan,mocks.task,mocks.evidence,mocks.closure]) mock.mockResolvedValue([]); });
describe('Case timeline projection', () => {
  it('emits only proven milestones in deterministic equal-time order', async () => {
    mocks.inspection.mockResolvedValue([{ id: 'i', createdAt: when, inspector: actor }]);
    mocks.risk.mockResolvedValue([{ id: 'r', createdAt: when }]);
    mocks.orp.mockResolvedValue([{ id: 'o', createdAt: when, versionNumber: 1 }]);
    mocks.decision.mockResolvedValue([{ id: 'd', createdAt: when, decisionType: 'APPROVED', reviewer: actor }]);
    mocks.plan.mockResolvedValue([{ id: 'p', createdAt: when, startedAt: when, completedAt: when, createdBy: actor }]);
    mocks.task.mockResolvedValue([{ id: 't', executionPlanId: 'p', sequenceNumber: 1, createdAt: when, assignedAt: when, startedAt: when, completionSubmittedAt: when, verifiedAt: when, cancelledAt: null, assignedTo: actor, assignedBy: actor, completionSubmittedBy: actor, verifiedBy: actor, cancelledBy: null }]);
    mocks.evidence.mockResolvedValue([{ id: 'e', executionTaskId: 't', evidenceType: 'PHOTO_REFERENCE', submittedAt: when, capturedAt: when, submittedBy: actor, executionTask: { sequenceNumber: 1 }, referenceUrl: 'must-not-appear' }]);
    mocks.closure.mockResolvedValue([{ id: 'c', createdAt: when, closedBy: actor }]);
    const result = await getCaseTimeline('case', principal);
    expect(result.events.map((item) => item.eventType)).toEqual(['CASE_CREATED','INSPECTION_RECORDED','RISK_ASSESSED','ORP_GENERATED','ORP_DECIDED','EXECUTION_PLAN_CREATED','EXECUTION_STARTED','TASK_CREATED','TASK_ASSIGNED','TASK_STARTED','EVIDENCE_SUBMITTED','TASK_COMPLETION_SUBMITTED','TASK_VERIFIED','EXECUTION_PLAN_COMPLETED','CASE_CLOSED']);
    expect(result.events.find((item) => item.eventType === 'RISK_ASSESSED')?.actor).toBeNull();
    expect(JSON.stringify(result)).not.toMatch(/referenceUrl|documentReference|measurementData|TASK_BLOCKED|TASK_RESUMED/);
  });
  it('paginates stably and validates cursor and limits', async () => {
    mocks.inspection.mockResolvedValue([{ id: 'b', createdAt: when, inspector: actor }, { id: 'a', createdAt: when, inspector: actor }]);
    const first = await getCaseTimeline('case', principal, 2);
    expect(first.events.map((item) => item.source.id)).toEqual(['case', 'a']);
    expect(first.page.nextCursor).toBeTruthy();
    const second = await getCaseTimeline('case', principal, 2, first.page.nextCursor!);
    expect(second.events.map((item) => item.source.id)).toEqual(['b']);
    await expect(getCaseTimeline('case', principal, 0)).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    await expect(getCaseTimeline('case', principal, 201)).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    await expect(getCaseTimeline('case', principal, 100, 'invalid')).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });
  it('returns scoped not-found without querying domain histories', async () => {
    mocks.caseFindFirst.mockResolvedValue(null);
    await expect(getCaseTimeline('hidden', principal)).rejects.toMatchObject({ code: 'CASE_NOT_FOUND', status: 404 });
    expect(mocks.inspection).not.toHaveBeenCalled();
  });
});
