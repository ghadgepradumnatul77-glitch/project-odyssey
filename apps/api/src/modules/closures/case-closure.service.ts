import prisma from '../../lib/prisma';
import {
  CaseClosureReason,
  CaseStatus,
  ExecutionPlanStatus,
  ExecutionTaskStatus,
  OrpDecisionType,
  Prisma,
  SystemRole,
  UserStatus
} from '../../generated/prisma';
import {
  buildCaseClosureReadWhere,
  buildCaseMutationWhere,
  buildCaseReadWhere,
  OrganizationalPrincipal
} from '../../security/organizational-scope';
import { isAuthorityActive, isPriorityWithinAuthority } from '../decisions/decision.service';
import { CaseClosureError } from './case-closure-error';
import { appendIntegrityEvent, integrityTextDigest } from '../integrity/integrity.service';

export const MAX_CLOSURE_SUMMARY_LENGTH = 2000;

const safeUser = {
  id: true,
  employeeCode: true,
  name: true,
  designation: true,
  role: true,
  status: true
} as const;

const closureInclude = {
  closedBy: { select: safeUser },
  closureAuthorityGrant: { select: { id: true } },
  executionPlan: { select: { id: true, orpId: true, approvalDecisionId: true, status: true, completedAt: true } }
} satisfies Prisma.CaseClosureInclude;

export interface CloseCaseInput {
  closureReason: CaseClosureReason;
  closureSummary: string;
}

export function isExactClosureRetry(
  closure: { closedById: string; closureReason: CaseClosureReason; closureSummary: string },
  principal: OrganizationalPrincipal,
  input: CloseCaseInput
) {
  return closure.closedById === principal.id &&
    closure.closureReason === input.closureReason &&
    closure.closureSummary === input.closureSummary;
}

export function closureTaskPreconditionError(tasks: Array<{
  isMandatory: boolean;
  status: ExecutionTaskStatus;
  assignedToId: string | null;
  completionSubmittedById: string | null;
  verifiedById: string | null;
  evidence: Array<{ id: string }>;
}>, closerId: string): 'CLOSURE_PRECONDITIONS_NOT_MET' | 'FORBIDDEN' | null {
  const mandatory = tasks.filter((task) => task.isMandatory);
  const optional = tasks.filter((task) => !task.isMandatory);
  const mandatoryValid = mandatory.length > 0 && mandatory.every((task) =>
    task.status === ExecutionTaskStatus.VERIFIED && task.evidence.length > 0 &&
    Boolean(task.verifiedById) && task.verifiedById !== task.assignedToId &&
    task.verifiedById !== task.completionSubmittedById
  );
  const optionalTerminal = optional.every((task) =>
    task.status === ExecutionTaskStatus.VERIFIED || task.status === ExecutionTaskStatus.CANCELLED
  );
  if (!mandatoryValid || !optionalTerminal) return 'CLOSURE_PRECONDITIONS_NOT_MET';
  if (mandatory.some((task) => task.assignedToId === closerId || task.completionSubmittedById === closerId)) return 'FORBIDDEN';
  return null;
}

function conflict(code: string, message: string): never {
  throw new CaseClosureError(code, 409, message);
}

async function findScopedExisting(caseId: string, principal: OrganizationalPrincipal) {
  return prisma.caseClosure.findFirst({
    where: { caseId, ...buildCaseClosureReadWhere(principal) },
    include: closureInclude
  });
}

export async function closeCase(caseId: string, input: CloseCaseInput, principal: OrganizationalPrincipal) {
  const visibleCase = await prisma.case.findFirst({
    where: { id: caseId, ...buildCaseMutationWhere(principal) },
    select: { id: true }
  });
  if (!visibleCase) throw new CaseClosureError('CASE_NOT_FOUND', 404, 'Case not found.');

  const existing = await findScopedExisting(caseId, principal);
  if (existing) {
    if (isExactClosureRetry(existing, principal, input)) return { closure: existing, created: false };
    conflict('CASE_ALREADY_CLOSED', 'The Case already has a different immutable closure.');
  }

  const perform = () => prisma.$transaction(async (tx) => {
    const now = new Date();
    const targetCase = await tx.case.findFirst({
      where: { id: caseId, ...buildCaseMutationWhere(principal) },
      include: { asset: true, closure: true }
    });
    if (!targetCase) throw new CaseClosureError('CASE_NOT_FOUND', 404, 'Case not found.');
    if (targetCase.closure) {
      if (isExactClosureRetry(targetCase.closure, principal, input)) {
        return { closure: await tx.caseClosure.findUniqueOrThrow({ where: { id: targetCase.closure.id }, include: closureInclude }), created: false };
      }
      conflict('CASE_ALREADY_CLOSED', 'The Case already has a different immutable closure.');
    }
    if (targetCase.status !== CaseStatus.VERIFICATION || targetCase.closedAt) {
      conflict('INVALID_CASE_STATE', 'Case must be awaiting final verification closure.');
    }

    const closer = await tx.user.findUnique({ where: { id: principal.id } });
    if (!closer || closer.status !== UserStatus.ACTIVE || closer.role !== SystemRole.OFFICER) {
      throw new CaseClosureError('FORBIDDEN', 403, 'Only an active OFFICER may close a Case.');
    }

    const plans = await tx.executionPlan.findMany({
      where: { caseId },
      include: {
        orp: { include: { riskAssessment: true } },
        approvalDecision: true,
        tasks: { include: { evidence: { select: { id: true } } } }
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
    });
    const plan = plans[0];
    if (!plan || plan.status !== ExecutionPlanStatus.COMPLETED) {
      conflict('EXECUTION_NOT_COMPLETED', 'The current execution plan is not completed.');
    }
    const latestOrp = await tx.operationalResponsePlan.findFirst({
      where: { caseId },
      orderBy: [{ versionNumber: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
      select: { id: true }
    });
    const latestAssessment = await tx.riskAssessment.findFirst({
      where: { caseId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: { id: true, inspectionId: true }
    });
    const latestInspection = await tx.inspection.findFirst({
      where: { caseId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: { id: true }
    });
    if (latestOrp?.id !== plan.orpId || latestAssessment?.id !== plan.orp.riskAssessmentId ||
        latestInspection?.id !== plan.orp.riskAssessment.inspectionId) {
      conflict('STALE_EXECUTION_WORKFLOW', 'A newer inspection, assessment, or ORP conflicts with closure.');
    }
    if (plan.orp.status !== 'APPROVED' || plan.approvalDecision.decisionType !== OrpDecisionType.APPROVED ||
        plan.approvalDecision.id !== plan.approvalDecisionId || plan.approvalDecision.orpId !== plan.orpId ||
        plan.approvalDecision.caseId !== caseId) {
      conflict('CLOSURE_PRECONDITIONS_NOT_MET', 'Approved ORP and decision invariants are not satisfied.');
    }

    const taskError = closureTaskPreconditionError(plan.tasks, principal.id);
    if (taskError === 'CLOSURE_PRECONDITIONS_NOT_MET') {
      conflict('CLOSURE_PRECONDITIONS_NOT_MET', 'Execution task and evidence invariants are not satisfied.');
    }
    if (taskError === 'FORBIDDEN') {
      throw new CaseClosureError('FORBIDDEN', 403, 'The closer must be independent from mandatory task execution.');
    }

    const grants = await tx.approvalAuthority.findMany({
      where: {
        userId: principal.id,
        departmentId: targetCase.asset.departmentId,
        jurisdictionId: targetCase.asset.jurisdictionId,
        isActive: true,
        canCloseCase: true
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }]
    });
    const authority = grants.find((grant) =>
      isAuthorityActive(grant, now) && isPriorityWithinAuthority(targetCase.priorityLevel, grant.maxPriorityLevel)
    );
    if (!authority) throw new CaseClosureError('FORBIDDEN', 403, 'No valid closure authority permits this Case closure.');

    const changed = await tx.case.updateMany({
      where: { id: caseId, status: CaseStatus.VERIFICATION, closedAt: null },
      data: { status: CaseStatus.CLOSED, closedAt: now }
    });
    if (changed.count !== 1) conflict('CASE_CLOSURE_CONFLICT', 'Case closure conflicted with another state change.');

    const closure = await tx.caseClosure.create({
      data: {
        caseId,
        executionPlanId: plan.id,
        closedById: principal.id,
        closureAuthorityGrantId: authority.id,
        closureReason: input.closureReason,
        closureSummary: input.closureSummary,
        createdAt: now
      },
      include: closureInclude
    });
    await appendIntegrityEvent(tx, {
      eventType: 'CASE_CLOSED', sourceEventKey: `CASE_CLOSURE:${closure.id}`,
      resourceType: 'CaseClosure', resourceId: closure.id, actor: principal,
      departmentId: targetCase.asset.departmentId, jurisdictionId: targetCase.asset.jurisdictionId,
      occurredAt: closure.createdAt,
      facts: { closureId: closure.id, caseId, executionPlanId: plan.id, finalOrpId: plan.orpId, approvalDecisionId: plan.approvalDecisionId, closedById: principal.id, closureAuthorityGrantId: authority.id, closureReason: closure.closureReason, closureSummaryDigest: integrityTextDigest(closure.closureSummary), executionCompletedAt: plan.completedAt?.toISOString() ?? null }
    });
    return { closure, created: true };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await perform();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034' && attempt === 0) continue;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const raced = await findScopedExisting(caseId, principal);
        if (raced && isExactClosureRetry(raced, principal, input)) return { closure: raced, created: false };
        conflict('CASE_CLOSURE_CONFLICT', 'Case closure conflicted with another request.');
      }
      throw error;
    }
  }
  conflict('CASE_CLOSURE_CONFLICT', 'Case closure conflicted with another request.');
}

export async function getCaseClosure(caseId: string, principal: OrganizationalPrincipal) {
  const targetCase = await prisma.case.findFirst({
    where: { id: caseId, ...buildCaseReadWhere(principal) },
    select: { id: true }
  });
  if (!targetCase) throw new CaseClosureError('CASE_NOT_FOUND', 404, 'Case not found.');
  const closure = await findScopedExisting(caseId, principal);
  if (!closure) throw new CaseClosureError('CASE_CLOSURE_NOT_FOUND', 404, 'Case closure not found.');
  return closure;
}
