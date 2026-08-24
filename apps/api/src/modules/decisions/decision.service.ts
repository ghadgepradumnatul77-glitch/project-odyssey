import prisma from '../../lib/prisma';
import { pageFromRows, type StableCursor } from '../../lib/pagination';
import {
  ApprovalAuthority,
  CaseStatus,
  OrpDecisionType,
  Prisma,
  PriorityLevel,
  SystemRole,
  UserStatus
} from '../../generated/prisma';
import { WorkflowError } from './workflow-error';
import {
  buildCaseReadWhere,
  buildDecisionReadWhere,
  buildOrpMutationWhere,
  buildOrpReadWhere,
  isSameOrganizationalScope,
  OrganizationalPrincipal
} from '../../security/organizational-scope';

export interface SubmitDecisionInput {
  decisionType: OrpDecisionType;
  reason?: string | null;
  remarks?: string | null;
  forwardToUserId?: string | null;
  requestedChanges?: unknown;
}

export const PRIORITY_ORDER: PriorityLevel[] = [
  PriorityLevel.LOW,
  PriorityLevel.MEDIUM,
  PriorityLevel.HIGH,
  PriorityLevel.VERY_HIGH,
  PriorityLevel.CRITICAL
];

export function isAuthorityActive(
  grant: Pick<ApprovalAuthority, 'isActive' | 'validFrom' | 'validUntil'>,
  at: Date
): boolean {
  return grant.isActive && (!grant.validFrom || grant.validFrom <= at) && (!grant.validUntil || grant.validUntil >= at);
}

export function isPriorityWithinAuthority(casePriority: PriorityLevel | null, maximum: PriorityLevel | null): boolean {
  if (!maximum || !casePriority) return true;
  return PRIORITY_ORDER.indexOf(casePriority) <= PRIORITY_ORDER.indexOf(maximum);
}

export function authorityAllowsDecision(
  grant: Pick<ApprovalAuthority, 'canApprove' | 'canReject' | 'canRequestModification' | 'canRequestReinspection' | 'canEscalate'>,
  decisionType: OrpDecisionType
): boolean {
  const permission = {
    [OrpDecisionType.APPROVED]: grant.canApprove,
    [OrpDecisionType.REJECTED]: grant.canReject,
    [OrpDecisionType.MODIFICATION_REQUESTED]: grant.canRequestModification,
    [OrpDecisionType.REINSPECTION_REQUESTED]: grant.canRequestReinspection,
    [OrpDecisionType.ESCALATED]: grant.canEscalate
  };
  return permission[decisionType];
}

export function isLatestOrp(requestedOrpId: string, latestOrpId: string | null | undefined): boolean {
  return requestedOrpId === latestOrpId;
}

export function reviewerScopeError(
  reviewer: { departmentId: string; jurisdictionId: string },
  asset: { departmentId: string; jurisdictionId: string }
): 'REVIEWER_DEPARTMENT_MISMATCH' | 'REVIEWER_JURISDICTION_MISMATCH' | null {
  if (isSameOrganizationalScope(reviewer, asset)) return null;
  if (reviewer.departmentId !== asset.departmentId) return 'REVIEWER_DEPARTMENT_MISMATCH';
  if (reviewer.jurisdictionId !== asset.jurisdictionId) return 'REVIEWER_JURISDICTION_MISMATCH';
  return null;
}

export function decisionStateTransition(decisionType: OrpDecisionType): { orpStatus: string; caseStatus: CaseStatus } {
  return {
    [OrpDecisionType.APPROVED]: { orpStatus: 'APPROVED', caseStatus: CaseStatus.APPROVED },
    [OrpDecisionType.REJECTED]: { orpStatus: 'REJECTED', caseStatus: CaseStatus.UNDER_REVIEW },
    [OrpDecisionType.MODIFICATION_REQUESTED]: { orpStatus: 'MODIFICATION_REQUESTED', caseStatus: CaseStatus.UNDER_REVIEW },
    [OrpDecisionType.REINSPECTION_REQUESTED]: { orpStatus: 'REINSPECTION_REQUESTED', caseStatus: CaseStatus.INSPECTION_REQUIRED },
    [OrpDecisionType.ESCALATED]: { orpStatus: 'ESCALATED', caseStatus: CaseStatus.UNDER_REVIEW }
  }[decisionType];
}

function requireReason(decisionType: OrpDecisionType, reason?: string | null): string | null {
  const normalized = reason?.trim() || null;
  if (decisionType !== OrpDecisionType.APPROVED && !normalized) {
    throw new WorkflowError('DECISION_REASON_REQUIRED', 400, 'A reason is required for this decision.');
  }
  return normalized;
}

export async function submitOrpDecision(orpId: string, principal: OrganizationalPrincipal, input: SubmitDecisionInput) {
  const now = new Date();
  const reason = requireReason(input.decisionType, input.reason);
  const orp = await prisma.operationalResponsePlan.findUnique({
    where: { id: orpId, AND: [buildOrpMutationWhere(principal)] },
    include: { case: { include: { asset: true } }, decisions: { select: { id: true } } }
  });
  if (!orp) throw new WorkflowError('ORP_NOT_FOUND', 404, 'Operational response plan not found.');
  if (orp.case.status === CaseStatus.CLOSED) {
    throw new WorkflowError('INVALID_CASE_STATE', 409, 'A closed Case cannot receive an ORP decision.');
  }

  const latest = await prisma.operationalResponsePlan.findFirst({
    where: { caseId: orp.caseId },
    orderBy: [{ versionNumber: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
    select: { id: true }
  });
  if (!isLatestOrp(orp.id, latest?.id)) {
    throw new WorkflowError('STALE_ORP_VERSION', 409, 'A newer operational response plan exists for this case.');
  }
  if (orp.decisions.length || orp.status !== 'AWAITING_REVIEW') {
    throw new WorkflowError('ORP_ALREADY_DECIDED', 409, 'This operational response plan has already been decided.');
  }

  const reviewer = await prisma.user.findUnique({ where: { id: principal.id } });
  if (!reviewer) throw new WorkflowError('REVIEWER_NOT_FOUND', 404, 'Reviewer not found.');
  if (reviewer.status !== UserStatus.ACTIVE) throw new WorkflowError('REVIEWER_INACTIVE', 403, 'Reviewer is inactive.');
  if (reviewer.role !== SystemRole.OFFICER) throw new WorkflowError('REVIEWER_ROLE_INVALID', 403, 'Reviewer must have the OFFICER system role.');
  const scopeError = reviewerScopeError(reviewer, orp.case.asset);
  if (scopeError === 'REVIEWER_DEPARTMENT_MISMATCH') {
    throw new WorkflowError('REVIEWER_DEPARTMENT_MISMATCH', 403, 'Reviewer does not belong to the case department.');
  }
  if (scopeError === 'REVIEWER_JURISDICTION_MISMATCH') {
    throw new WorkflowError('REVIEWER_JURISDICTION_MISMATCH', 403, 'Reviewer does not belong to the case jurisdiction.');
  }

  const grants = await prisma.approvalAuthority.findMany({
    where: {
      userId: reviewer.id,
      departmentId: orp.case.asset.departmentId,
      jurisdictionId: orp.case.asset.jurisdictionId,
      isActive: true
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }]
  });
  const activeGrants = grants.filter((grant) => isAuthorityActive(grant, now));
  if (!activeGrants.length) throw new WorkflowError('AUTHORITY_NOT_GRANTED', 403, 'No active approval authority grant matches this reviewer and scope.');
  const permittedGrants = activeGrants.filter((grant) => authorityAllowsDecision(grant, input.decisionType));
  if (!permittedGrants.length) throw new WorkflowError('DECISION_NOT_AUTHORIZED', 403, 'The authority grant does not permit this decision type.');
  const authority = permittedGrants.find((grant) => isPriorityWithinAuthority(orp.case.priorityLevel, grant.maxPriorityLevel));
  if (!authority) throw new WorkflowError('PRIORITY_AUTHORITY_EXCEEDED', 403, 'Case priority exceeds the authority grant limit.');

  let forwardToUserId: string | null = null;
  if (input.decisionType === OrpDecisionType.ESCALATED) {
    forwardToUserId = input.forwardToUserId?.trim() || null;
    if (!forwardToUserId) throw new WorkflowError('ESCALATION_TARGET_REQUIRED', 400, 'forwardToUserId is required for escalation.');
    const target = await prisma.user.findUnique({ where: { id: forwardToUserId } });
    if (!target) throw new WorkflowError('FORWARD_USER_NOT_FOUND', 404, 'Escalation target user not found.');
    if (target.status !== UserStatus.ACTIVE) throw new WorkflowError('FORWARD_USER_INACTIVE', 403, 'Escalation target user is inactive.');
    if (target.role !== SystemRole.OFFICER) throw new WorkflowError('FORWARD_USER_ROLE_INVALID', 403, 'Escalation target must have the OFFICER role.');
    if (target.departmentId !== orp.case.asset.departmentId) throw new WorkflowError('FORWARD_USER_DEPARTMENT_MISMATCH', 403, 'Escalation target does not belong to the case department.');
    if (target.jurisdictionId !== orp.case.asset.jurisdictionId) throw new WorkflowError('FORWARD_USER_JURISDICTION_MISMATCH', 403, 'Escalation target does not belong to the case jurisdiction.');
  }

  const transition = decisionStateTransition(input.decisionType);
  try {
    return await prisma.$transaction(async (tx) => {
      const current = await tx.operationalResponsePlan.findUnique({ where: { id: orp.id }, select: { status: true } });
      const currentLatest = await tx.operationalResponsePlan.findFirst({
        where: { caseId: orp.caseId },
        orderBy: [{ versionNumber: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
        select: { id: true }
      });
      const existingDecision = await tx.orpDecision.findUnique({ where: { orpId: orp.id }, select: { id: true } });
      if (!isLatestOrp(orp.id, currentLatest?.id)) throw new WorkflowError('STALE_ORP_VERSION', 409, 'A newer operational response plan exists for this case.');
      if (!current || current.status !== 'AWAITING_REVIEW' || existingDecision) {
        throw new WorkflowError('ORP_ALREADY_DECIDED', 409, 'This operational response plan has already been decided.');
      }

      const decision = await tx.orpDecision.create({
        data: {
          caseId: orp.caseId,
          orpId: orp.id,
          reviewerId: reviewer.id,
          authorityGrantId: authority.id,
          decisionType: input.decisionType,
          reason,
          remarks: input.remarks?.trim() || null,
          requestedChanges: input.requestedChanges === undefined || input.requestedChanges === null
            ? undefined
            : input.requestedChanges as Prisma.InputJsonValue,
          forwardToUserId
        }
      });
      await tx.operationalResponsePlan.update({ where: { id: orp.id }, data: { status: transition.orpStatus } });
      await tx.case.update({ where: { id: orp.caseId }, data: { status: transition.caseStatus } });
      return decision;
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new WorkflowError('ORP_ALREADY_DECIDED', 409, 'This operational response plan has already been decided.');
    }
    throw error;
  }
}

const decisionInclude = {
  reviewer: { select: { id: true, name: true, employeeCode: true, designation: true } },
  authorityGrant: { select: { id: true } },
  forwardedUser: { select: { id: true, name: true, employeeCode: true, designation: true } },
  orp: { select: { id: true, versionNumber: true } }
} satisfies Prisma.OrpDecisionInclude;

export async function getOrpDecisionHistory(orpId: string, principal: OrganizationalPrincipal, options: { limit: number; cursor?: StableCursor }) {
  const orp = await prisma.operationalResponsePlan.findUnique({ where: { id: orpId, AND: [buildOrpReadWhere(principal)] }, select: { id: true } });
  if (!orp) throw new WorkflowError('ORP_NOT_FOUND', 404, 'Operational response plan not found.');
  const rows = await prisma.orpDecision.findMany({ where: { orpId, ...buildDecisionReadWhere(principal), ...(options.cursor ? { OR: [{ createdAt: { lt: new Date(options.cursor.at) } }, { createdAt: new Date(options.cursor.at), id: { lt: options.cursor.id } }] } : {}) }, include: decisionInclude, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: options.limit + 1 });
  return pageFromRows(rows, options.limit, (item) => item.createdAt.toISOString());
}

export async function getCaseDecisionHistory(caseId: string, principal: OrganizationalPrincipal, options: { limit: number; cursor?: StableCursor }) {
  const existingCase = await prisma.case.findUnique({ where: { id: caseId, AND: [buildCaseReadWhere(principal)] }, select: { id: true } });
  if (!existingCase) throw new WorkflowError('CASE_NOT_FOUND', 404, 'Case not found.');
  const rows = await prisma.orpDecision.findMany({ where: { caseId, ...buildDecisionReadWhere(principal), ...(options.cursor ? { OR: [{ createdAt: { lt: new Date(options.cursor.at) } }, { createdAt: new Date(options.cursor.at), id: { lt: options.cursor.id } }] } : {}) }, include: decisionInclude, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: options.limit + 1 });
  return pageFromRows(rows, options.limit, (item) => item.createdAt.toISOString());
}
