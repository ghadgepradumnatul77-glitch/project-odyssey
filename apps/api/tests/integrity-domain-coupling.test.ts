import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CaseClosureReason, CaseStatus, ExecutionPlanStatus, ExecutionTaskStatus, OrpDecisionType } from '../src/generated/prisma';

const mocks = vi.hoisted(() => {
  const tx = {
    case: { findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    caseClosure: { create: vi.fn(), findUniqueOrThrow: vi.fn() },
    user: { findUnique: vi.fn() },
    executionPlan: { findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    operationalResponsePlan: { findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    riskAssessment: { findFirst: vi.fn() },
    inspection: { findFirst: vi.fn() },
    approvalAuthority: { findMany: vi.fn() },
    orpDecision: { findUnique: vi.fn(), create: vi.fn() },
    executionTask: { findUnique: vi.fn(), updateMany: vi.fn(), findMany: vi.fn(), findUniqueOrThrow: vi.fn() },
    executionEvidence: { count: vi.fn() }
  };
  return {
    tx, append: vi.fn(), transaction: vi.fn(),
    caseFindFirst: vi.fn(), closureFindFirst: vi.fn(), orpFindUnique: vi.fn(), orpFindFirst: vi.fn(),
    userFindUnique: vi.fn(), authorityFindMany: vi.fn(), taskFindUnique: vi.fn()
  };
});

vi.mock('../src/lib/prisma', () => ({ default: {
  $transaction: mocks.transaction,
  case: { findFirst: mocks.caseFindFirst },
  caseClosure: { findFirst: mocks.closureFindFirst },
  operationalResponsePlan: { findUnique: mocks.orpFindUnique, findFirst: mocks.orpFindFirst },
  user: { findUnique: mocks.userFindUnique },
  approvalAuthority: { findMany: mocks.authorityFindMany },
  executionTask: { findUnique: mocks.taskFindUnique }
} }));
vi.mock('../src/modules/integrity/integrity.service', async (original) => ({
  ...await original<typeof import('../src/modules/integrity/integrity.service')>(),
  appendIntegrityEvent: mocks.append
}));

import { closeCase } from '../src/modules/closures/case-closure.service';
import { submitOrpDecision } from '../src/modules/decisions/decision.service';
import { verifyTask } from '../src/modules/execution/execution.service';

const principal = { id: 'officer-verifier', role: 'OFFICER', status: 'ACTIVE', departmentId: 'dep', jurisdictionId: 'jur' } as any;
const at = new Date('2026-08-24T00:00:00.000Z');

beforeEach(() => {
  vi.clearAllMocks();
  mocks.append.mockReset();
  mocks.append.mockResolvedValue({ id: 'integrity-event' });
});

function closureFixture() {
  const state: { caseStatus: CaseStatus; closure: any } = { caseStatus: CaseStatus.VERIFICATION, closure: null };
  const closure = {
    id: 'closure-1', caseId: 'case-1', executionPlanId: 'plan-1', closedById: principal.id,
    closureAuthorityGrantId: 'authority-1', closureReason: CaseClosureReason.EXECUTION_VERIFIED,
    closureSummary: 'All mandatory work independently verified.', createdAt: at
  };
  const plan = {
    id: 'plan-1', caseId: 'case-1', orpId: 'orp-1', approvalDecisionId: 'decision-1',
    status: ExecutionPlanStatus.COMPLETED, completedAt: at,
    orp: { id: 'orp-1', status: 'APPROVED', riskAssessmentId: 'risk-1', riskAssessment: { inspectionId: 'inspection-1' } },
    approvalDecision: { id: 'decision-1', orpId: 'orp-1', caseId: 'case-1', decisionType: OrpDecisionType.APPROVED },
    tasks: [{ isMandatory: true, status: ExecutionTaskStatus.VERIFIED, assignedToId: 'executor', completionSubmittedById: 'executor', verifiedById: principal.id, evidence: [{ id: 'evidence-1' }] }]
  };
  mocks.caseFindFirst.mockResolvedValue({ id: 'case-1' });
  mocks.closureFindFirst.mockImplementation(async () => state.closure);
  mocks.tx.case.findFirst.mockImplementation(async () => ({ id: 'case-1', status: state.caseStatus, closedAt: null, closure: state.closure, priorityLevel: 'CRITICAL', asset: { departmentId: 'dep', jurisdictionId: 'jur' } }));
  mocks.tx.user.findUnique.mockResolvedValue({ id: principal.id, status: 'ACTIVE', role: 'OFFICER' });
  mocks.tx.executionPlan.findMany.mockResolvedValue([plan]);
  mocks.tx.operationalResponsePlan.findFirst.mockResolvedValue({ id: 'orp-1' });
  mocks.tx.riskAssessment.findFirst.mockResolvedValue({ id: 'risk-1', inspectionId: 'inspection-1' });
  mocks.tx.inspection.findFirst.mockResolvedValue({ id: 'inspection-1' });
  mocks.tx.approvalAuthority.findMany.mockResolvedValue([{ id: 'authority-1', isActive: true, validFrom: null, validUntil: null, maxPriorityLevel: 'CRITICAL' }]);
  mocks.tx.case.updateMany.mockResolvedValue({ count: 1 });
  mocks.tx.caseClosure.create.mockResolvedValue(closure);
  mocks.transaction.mockImplementation(async (callback: (tx: any) => Promise<any>) => {
    const result = await callback(mocks.tx);
    if (result.created) { state.caseStatus = CaseStatus.CLOSED; state.closure = closure; }
    return result;
  });
  return state;
}

function decisionFixture() {
  const state: { orpStatus: string; decision: any } = { orpStatus: 'AWAITING_REVIEW', decision: null };
  const orp = () => ({
    id: 'orp-1', caseId: 'case-1', status: state.orpStatus,
    case: { status: CaseStatus.ORP_READY, priorityLevel: 'CRITICAL', asset: { departmentId: 'dep', jurisdictionId: 'jur' } },
    decisions: state.decision ? [{ id: state.decision.id }] : []
  });
  const decision = {
    id: 'decision-1', caseId: 'case-1', orpId: 'orp-1', reviewerId: principal.id,
    authorityGrantId: 'authority-1', decisionType: OrpDecisionType.APPROVED,
    reason: null, remarks: null, forwardToUserId: null, createdAt: at
  };
  mocks.orpFindUnique.mockImplementation(async () => orp());
  mocks.orpFindFirst.mockResolvedValue({ id: 'orp-1' });
  mocks.userFindUnique.mockResolvedValue({ ...principal });
  mocks.authorityFindMany.mockResolvedValue([{ id: 'authority-1', isActive: true, validFrom: null, validUntil: null, maxPriorityLevel: 'CRITICAL', canApprove: true, canReject: true, canRequestModification: true, canRequestReinspection: true, canEscalate: true }]);
  mocks.tx.operationalResponsePlan.findUnique.mockImplementation(async () => ({ status: state.orpStatus }));
  mocks.tx.operationalResponsePlan.findFirst.mockResolvedValue({ id: 'orp-1' });
  mocks.tx.orpDecision.findUnique.mockImplementation(async () => state.decision && { id: state.decision.id });
  mocks.tx.orpDecision.create.mockResolvedValue(decision);
  mocks.tx.operationalResponsePlan.update.mockResolvedValue({});
  mocks.tx.case.update.mockResolvedValue({});
  mocks.tx.case.updateMany.mockResolvedValue({ count: 1 });
  mocks.transaction.mockImplementation(async (callback: (tx: any) => Promise<any>) => {
    const result = await callback(mocks.tx);
    state.orpStatus = 'APPROVED';
    state.decision = decision;
    return result;
  });
  return state;
}

function verificationFixture() {
  const state = { taskStatus: ExecutionTaskStatus.COMPLETION_SUBMITTED };
  const task = () => ({
    id: 'task-1', executionPlanId: 'plan-1', status: state.taskStatus,
    assignedToId: 'executor', completionSubmittedById: 'executor', evidence: [{ id: 'evidence-1' }],
    executionPlan: { id: 'plan-1', status: ExecutionPlanStatus.IN_PROGRESS, createdById: 'planner', case: { status: CaseStatus.EXECUTION, asset: { departmentId: 'dep', jurisdictionId: 'jur' } } }
  });
  mocks.taskFindUnique.mockImplementation(async () => task());
  mocks.tx.executionTask.findUnique.mockResolvedValue({ executionPlan: { status: ExecutionPlanStatus.IN_PROGRESS, case: { status: CaseStatus.EXECUTION } } });
  mocks.tx.executionEvidence.count.mockResolvedValue(1);
  mocks.tx.executionTask.updateMany.mockResolvedValue({ count: 1 });
  mocks.tx.executionPlan.findUnique.mockResolvedValue({ caseId: 'case-1', status: ExecutionPlanStatus.IN_PROGRESS });
  mocks.tx.executionTask.findMany.mockResolvedValue([{ status: ExecutionTaskStatus.VERIFIED, isMandatory: true }]);
  mocks.tx.executionPlan.update.mockResolvedValue({});
  mocks.tx.case.updateMany.mockResolvedValue({ count: 1 });
  mocks.tx.executionTask.findUniqueOrThrow.mockResolvedValue({ ...task(), status: ExecutionTaskStatus.VERIFIED, verifiedById: principal.id, verifiedAt: at });
  mocks.transaction.mockImplementation(async (callback: (tx: any) => Promise<any>) => {
    const result = await callback(mocks.tx);
    state.taskStatus = ExecutionTaskStatus.VERIFIED;
    return result;
  });
  return state;
}

describe('P3.4 authoritative domain coupling', () => {
  it('records one closure event with the actual closer and preserves exact retry idempotency', async () => {
    closureFixture();
    const input = { closureReason: CaseClosureReason.EXECUTION_VERIFIED, closureSummary: 'All mandatory work independently verified.' };
    expect(await closeCase('case-1', input, principal)).toMatchObject({ created: true, closure: { id: 'closure-1' } });
    expect(mocks.append).toHaveBeenCalledWith(mocks.tx, expect.objectContaining({
      eventType: 'CASE_CLOSED', sourceEventKey: 'CASE_CLOSURE:closure-1', resourceId: 'closure-1', actor: principal
    }));
    expect(await closeCase('case-1', input, principal)).toMatchObject({ created: false });
    expect(mocks.append).toHaveBeenCalledTimes(1);
  });

  it('rolls back closure state when integrity append fails', async () => {
    const state = closureFixture();
    mocks.append.mockRejectedValueOnce(new Error('forced integrity failure'));
    await expect(closeCase('case-1', { closureReason: CaseClosureReason.EXECUTION_VERIFIED, closureSummary: 'All mandatory work independently verified.' }, principal)).rejects.toThrow('forced integrity failure');
    expect(state).toEqual({ caseStatus: CaseStatus.VERIFICATION, closure: null });
  });

  it('records one server-actor HumanDecision event and a rejected retry cannot duplicate it', async () => {
    decisionFixture();
    await submitOrpDecision('orp-1', principal, { decisionType: OrpDecisionType.APPROVED, reviewerId: 'forged-user' } as any);
    expect(mocks.append).toHaveBeenCalledWith(mocks.tx, expect.objectContaining({
      eventType: 'HUMAN_DECISION_RECORDED', sourceEventKey: 'HUMAN_DECISION:decision-1', actor: principal,
      facts: expect.objectContaining({ reviewerId: principal.id })
    }));
    await expect(submitOrpDecision('orp-1', principal, { decisionType: OrpDecisionType.APPROVED })).rejects.toMatchObject({ code: 'ORP_ALREADY_DECIDED' });
    expect(mocks.append).toHaveBeenCalledTimes(1);
  });

  it('rolls back HumanDecision state when integrity append fails', async () => {
    const state = decisionFixture();
    mocks.append.mockRejectedValueOnce(new Error('forced integrity failure'));
    await expect(submitOrpDecision('orp-1', principal, { decisionType: OrpDecisionType.APPROVED })).rejects.toThrow('forced integrity failure');
    expect(state).toEqual({ orpStatus: 'AWAITING_REVIEW', decision: null });
  });

  it('commits independent task verification and its server-derived audit actor together', async () => {
    const state = verificationFixture();
    await verifyTask('task-1', 'Independent verification complete.', principal);
    expect(state.taskStatus).toBe(ExecutionTaskStatus.VERIFIED);
    expect(mocks.append).toHaveBeenCalledWith(mocks.tx, expect.objectContaining({
      eventType: 'EXECUTION_TASK_VERIFIED', sourceEventKey: 'EXECUTION_TASK_VERIFIED:task-1', actor: principal,
      facts: expect.objectContaining({ verifiedById: principal.id, assignedToId: 'executor' })
    }));
  });

  it('preserves four-eyes and rolls back task verification when integrity append fails', async () => {
    verificationFixture();
    await expect(verifyTask('task-1', 'Self verification.', { ...principal, id: 'executor' })).rejects.toMatchObject({ code: 'FOUR_EYES_VIOLATION' });
    expect(mocks.append).not.toHaveBeenCalled();

    const state = verificationFixture();
    mocks.append.mockRejectedValueOnce(new Error('forced integrity failure'));
    await expect(verifyTask('task-1', 'Independent verification complete.', principal)).rejects.toThrow('forced integrity failure');
    expect(state.taskStatus).toBe(ExecutionTaskStatus.COMPLETION_SUBMITTED);
  });
});
