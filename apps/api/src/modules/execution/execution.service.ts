import prisma from '../../lib/prisma';
import { ExecutionEvidenceType, ExecutionPlanStatus, ExecutionTaskStatus, OrpDecisionType, Prisma, SystemRole, UserStatus } from '../../generated/prisma';
import { buildCaseReadWhere, buildExecutionPlanMutationWhere, buildExecutionPlanReadWhere, buildExecutionTaskMutationWhere, buildExecutionTaskReadWhere, buildOrpMutationWhere, isSameOrganizationalScope, OrganizationalPrincipal } from '../../security/organizational-scope';
import { ExecutionError } from './execution-error';
import { EXECUTION_TEMPLATE_VERSION, translateActionsToTasks } from './execution-templates';

const safeUser = { id: true, employeeCode: true, name: true, designation: true, role: true, status: true } as const;
const taskInclude = { assignedTo: { select: safeUser }, assignedBy: { select: safeUser }, completionSubmittedBy: { select: safeUser }, verifiedBy: { select: safeUser }, cancelledBy: { select: safeUser }, evidence: { include: { submittedBy: { select: safeUser } }, orderBy: { submittedAt: 'asc' as const } } };

function notFound(resource: 'Execution plan' | 'Execution task'): never { throw new ExecutionError(resource === 'Execution plan' ? 'EXECUTION_PLAN_NOT_FOUND' : 'EXECUTION_TASK_NOT_FOUND', 404, `${resource} not found.`); }
function actorFields(body: Record<string, unknown>) {
  return ['createdById', 'assignedById', 'assignedAt', 'submittedById', 'submittedAt', 'completionSubmittedById', 'verifiedById', 'cancelledById', 'startedAt'].some((key) => Object.prototype.hasOwnProperty.call(body, key));
}
export function hasClientActorFields(body: Record<string, unknown>) { return actorFields(body); }

function actionCodes(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : null;
}

export function derivePlanStatus(statuses: Array<{ status: ExecutionTaskStatus; isMandatory: boolean }>): ExecutionPlanStatus {
  const mandatory = statuses.filter((task) => task.isMandatory);
  if (mandatory.length > 0 && mandatory.every((task) => task.status === ExecutionTaskStatus.VERIFIED)) return ExecutionPlanStatus.COMPLETED;
  if (mandatory.length > 0 && mandatory.every((task) => task.status === ExecutionTaskStatus.COMPLETION_SUBMITTED || task.status === ExecutionTaskStatus.VERIFIED)) return ExecutionPlanStatus.VERIFICATION_PENDING;
  if (statuses.some((task) => task.status !== ExecutionTaskStatus.PENDING)) return ExecutionPlanStatus.IN_PROGRESS;
  return ExecutionPlanStatus.PLANNED;
}

async function refreshPlan(tx: Prisma.TransactionClient, planId: string) {
  const plan = await tx.executionPlan.findUnique({ where: { id: planId }, select: { caseId: true, status: true } });
  if (!plan) notFound('Execution plan');
  const tasks = await tx.executionTask.findMany({ where: { executionPlanId: planId }, select: { status: true, isMandatory: true } });
  const status = derivePlanStatus(tasks);
  const now = new Date();
  await tx.executionPlan.update({ where: { id: planId }, data: {
    status,
    startedAt: status !== ExecutionPlanStatus.PLANNED && plan.status === ExecutionPlanStatus.PLANNED ? now : undefined,
    completedAt: status === ExecutionPlanStatus.COMPLETED ? now : undefined
  }});
  if (status === ExecutionPlanStatus.COMPLETED) {
    await tx.case.updateMany({ where: { id: plan.caseId, status: 'EXECUTION' }, data: { status: 'VERIFICATION' } });
  }
}

export async function generateExecutionPlan(orpId: string, principal: OrganizationalPrincipal) {
  const existing = await prisma.executionPlan.findFirst({ where: { orpId, ...buildExecutionPlanMutationWhere(principal) }, include: { tasks: { include: taskInclude, orderBy: { sequenceNumber: 'asc' } } } });
  if (existing) return { plan: existing, created: false };
  const orp = await prisma.operationalResponsePlan.findUnique({ where: { id: orpId, AND: [buildOrpMutationWhere(principal)] }, include: { case: true, decisions: true } });
  if (!orp) throw new ExecutionError('ORP_NOT_FOUND', 404, 'Operational response plan not found.');
  if (orp.status !== 'APPROVED') throw new ExecutionError('ORP_NOT_APPROVED', 409, 'Operational response plan is not approved.');
  const decision = orp.decisions.find((item) => item.decisionType === OrpDecisionType.APPROVED);
  if (!decision || decision.orpId !== orp.id || decision.caseId !== orp.caseId) throw new ExecutionError('APPROVED_DECISION_REQUIRED', 409, 'A matching approved decision is required.');
  if (orp.case.status !== 'APPROVED') throw new ExecutionError('INVALID_CASE_STATE', 409, 'Case must be APPROVED before execution planning.');
  const latest = await prisma.operationalResponsePlan.findFirst({ where: { caseId: orp.caseId }, orderBy: [{ versionNumber: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }], select: { id: true } });
  if (latest?.id !== orp.id) throw new ExecutionError('STALE_ORP_VERSION', 409, 'A newer operational response plan exists.');
  const codes = actionCodes(orp.recommendedActionCodes);
  if (!codes) throw new ExecutionError('INVALID_ORP_ACTIONS', 409, 'Approved ORP actions are invalid.');
  const translated = translateActionsToTasks(codes);
  if (translated.missing) throw new ExecutionError('EXECUTION_TEMPLATE_NOT_FOUND', 409, `No execution template exists for ${translated.missing}.`);
  try {
    const plan = await prisma.$transaction(async (tx) => {
      const created = await tx.executionPlan.create({ data: { orpId: orp.id, caseId: orp.caseId, approvalDecisionId: decision.id, createdById: principal.id, templateVersion: EXECUTION_TEMPLATE_VERSION } });
      if (translated.tasks.length) await tx.executionTask.createMany({ data: translated.tasks.map((task) => ({ executionPlanId: created.id, sequenceNumber: task.sequenceNumber, sourceActionCode: task.sourceActionCode, templateTaskKey: task.templateTaskKey, titleSnapshot: task.title, descriptionSnapshot: task.description, categorySnapshot: task.category, isMandatory: task.isMandatory })) });
      const changed = await tx.case.updateMany({ where: { id: orp.caseId, status: 'APPROVED' }, data: { status: 'EXECUTION' } });
      if (changed.count !== 1) throw new ExecutionError('INVALID_CASE_STATE', 409, 'Case state changed before execution planning.');
      return tx.executionPlan.findUniqueOrThrow({ where: { id: created.id }, include: { tasks: { include: taskInclude, orderBy: { sequenceNumber: 'asc' } } } });
    });
    return { plan, created: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const plan = await prisma.executionPlan.findFirst({ where: { orpId, ...buildExecutionPlanMutationWhere(principal) }, include: { tasks: { include: taskInclude, orderBy: { sequenceNumber: 'asc' } } } });
      if (plan) return { plan, created: false };
      throw new ExecutionError('EXECUTION_PLAN_CONFLICT', 409, 'Execution plan creation conflicted.');
    }
    throw error;
  }
}

export async function listCaseExecutionPlans(caseId: string, principal: OrganizationalPrincipal) {
  const target = await prisma.case.findUnique({ where: { id: caseId, AND: [buildCaseReadWhere(principal)] }, select: { id: true } });
  if (!target) throw new ExecutionError('CASE_NOT_FOUND', 404, 'Case not found.');
  return prisma.executionPlan.findMany({ where: { caseId, ...buildExecutionPlanReadWhere(principal) }, orderBy: { createdAt: 'asc' } });
}
export async function getExecutionPlan(planId: string, principal: OrganizationalPrincipal) {
  const plan = await prisma.executionPlan.findUnique({ where: { id: planId, AND: [buildExecutionPlanReadWhere(principal)] }, include: { createdBy: { select: safeUser }, tasks: { include: taskInclude, orderBy: { sequenceNumber: 'asc' } } } });
  if (!plan) notFound('Execution plan'); return plan;
}
export async function listExecutionTasks(planId: string, principal: OrganizationalPrincipal) {
  const plan = await prisma.executionPlan.findUnique({ where: { id: planId, AND: [buildExecutionPlanReadWhere(principal)] }, select: { id: true } });
  if (!plan) notFound('Execution plan');
  return prisma.executionTask.findMany({ where: { executionPlanId: planId, ...buildExecutionTaskReadWhere(principal) }, include: taskInclude, orderBy: { sequenceNumber: 'asc' } });
}

async function scopedTask(taskId: string, principal: OrganizationalPrincipal) {
  const task = await prisma.executionTask.findUnique({ where: { id: taskId, AND: [buildExecutionTaskMutationWhere(principal)] }, include: { executionPlan: { include: { case: { include: { asset: true } } } }, evidence: { select: { id: true } } } });
  if (!task) notFound('Execution task'); return task;
}

export async function assignTask(taskId: string, assigneeId: string, principal: OrganizationalPrincipal) {
  const task = await scopedTask(taskId, principal);
  const assignee = await prisma.user.findUnique({ where: { id: assigneeId, departmentId: task.executionPlan.case.asset.departmentId, jurisdictionId: task.executionPlan.case.asset.jurisdictionId } });
  if (!assignee) throw new ExecutionError('ASSIGNEE_NOT_FOUND', 404, 'Assignee not found.');
  if (assignee.status !== UserStatus.ACTIVE || assignee.role !== SystemRole.OFFICER) throw new ExecutionError('ASSIGNEE_NOT_ELIGIBLE', 403, 'Assignee must be an active OFFICER.');
  return prisma.$transaction(async (tx) => {
    const changed = await tx.executionTask.updateMany({ where: { id: taskId, status: ExecutionTaskStatus.PENDING }, data: { assignedToId: assignee.id, assignedById: principal.id, assignedAt: new Date(), status: ExecutionTaskStatus.ASSIGNED } });
    if (changed.count !== 1) throw new ExecutionError('INVALID_EXECUTION_TASK_STATE', 409, 'Task is not pending.');
    await refreshPlan(tx, task.executionPlanId);
    return tx.executionTask.findUniqueOrThrow({ where: { id: taskId }, include: taskInclude });
  });
}

export async function changeTaskStatus(taskId: string, requested: 'IN_PROGRESS' | 'BLOCKED' | 'CANCELLED', reason: string | undefined, principal: OrganizationalPrincipal) {
  const task = await scopedTask(taskId, principal);
  if (requested === 'CANCELLED') {
    if (task.executionPlan.createdById !== principal.id) throw new ExecutionError('FORBIDDEN', 403, 'Only the plan creator may cancel this task.');
    if (!reason?.trim()) throw new ExecutionError('INVALID_INPUT', 400, 'Cancellation reason is required.');
    if (task.status !== ExecutionTaskStatus.PENDING && task.status !== ExecutionTaskStatus.ASSIGNED) throw new ExecutionError('INVALID_EXECUTION_TASK_STATE', 409, 'Task cannot be cancelled in its current state.');
  } else {
    if (task.assignedToId !== principal.id) throw new ExecutionError('FORBIDDEN', 403, 'Only the assigned officer may update this task.');
    const valid = requested === 'BLOCKED' ? (task.status === ExecutionTaskStatus.ASSIGNED || task.status === ExecutionTaskStatus.IN_PROGRESS) : (task.status === ExecutionTaskStatus.ASSIGNED || task.status === ExecutionTaskStatus.BLOCKED);
    if (!valid) throw new ExecutionError('INVALID_EXECUTION_TASK_STATE', 409, 'Invalid task status transition.');
    if (requested === 'BLOCKED' && !reason?.trim()) throw new ExecutionError('INVALID_INPUT', 400, 'Blocked reason is required.');
  }
  return prisma.$transaction(async (tx) => {
    const data = requested === 'CANCELLED' ? { status: ExecutionTaskStatus.CANCELLED, cancelledById: principal.id, cancelledAt: new Date(), cancellationReason: reason!.trim() } : requested === 'BLOCKED' ? { status: ExecutionTaskStatus.BLOCKED, blockedReason: reason!.trim() } : { status: ExecutionTaskStatus.IN_PROGRESS, startedAt: task.startedAt ?? new Date() };
    const changed = await tx.executionTask.updateMany({ where: { id: taskId, status: task.status }, data });
    if (changed.count !== 1) throw new ExecutionError('INVALID_EXECUTION_TASK_STATE', 409, 'Task state changed concurrently.');
    await refreshPlan(tx, task.executionPlanId);
    return tx.executionTask.findUniqueOrThrow({ where: { id: taskId }, include: taskInclude });
  });
}

export async function addEvidence(taskId: string, input: { evidenceType: ExecutionEvidenceType; description: string; referenceUrl?: string; documentReference?: string; measurementData?: unknown; capturedAt?: Date }, principal: OrganizationalPrincipal) {
  const task = await scopedTask(taskId, principal);
  if (task.assignedToId !== principal.id) throw new ExecutionError('FORBIDDEN', 403, 'Only the assigned officer may submit evidence.');
  if (task.status !== ExecutionTaskStatus.IN_PROGRESS && task.status !== ExecutionTaskStatus.BLOCKED) throw new ExecutionError('INVALID_EXECUTION_TASK_STATE', 409, 'Evidence is not allowed in the current state.');
  return prisma.executionEvidence.create({ data: { executionTaskId: task.id, submittedById: principal.id, evidenceType: input.evidenceType, description: input.description.trim(), referenceUrl: input.referenceUrl, documentReference: input.documentReference, measurementData: input.measurementData as Prisma.InputJsonValue | undefined, capturedAt: input.capturedAt }, include: { submittedBy: { select: safeUser } } });
}

export async function submitCompletion(taskId: string, note: string, principal: OrganizationalPrincipal) {
  const task = await scopedTask(taskId, principal);
  if (task.assignedToId !== principal.id) throw new ExecutionError('FORBIDDEN', 403, 'Only the assigned officer may submit completion.');
  if (task.status !== ExecutionTaskStatus.IN_PROGRESS) throw new ExecutionError('INVALID_EXECUTION_TASK_STATE', 409, 'Task is not in progress.');
  if (!task.evidence.length) throw new ExecutionError('EVIDENCE_REQUIRED', 409, 'At least one evidence record is required.');
  return prisma.$transaction(async (tx) => {
    const changed = await tx.executionTask.updateMany({ where: { id: taskId, status: ExecutionTaskStatus.IN_PROGRESS, assignedToId: principal.id }, data: { status: ExecutionTaskStatus.COMPLETION_SUBMITTED, completionSubmittedById: principal.id, completionSubmittedAt: new Date(), completionNote: note.trim() } });
    if (changed.count !== 1) throw new ExecutionError('INVALID_EXECUTION_TASK_STATE', 409, 'Task state changed concurrently.');
    await refreshPlan(tx, task.executionPlanId);
    return tx.executionTask.findUniqueOrThrow({ where: { id: taskId }, include: taskInclude });
  });
}

export async function verifyTask(taskId: string, note: string, principal: OrganizationalPrincipal) {
  const task = await scopedTask(taskId, principal);
  if (task.status !== ExecutionTaskStatus.COMPLETION_SUBMITTED) throw new ExecutionError('INVALID_EXECUTION_TASK_STATE', 409, 'Task is not awaiting verification.');
  if (principal.id === task.assignedToId || principal.id === task.completionSubmittedById) throw new ExecutionError('FOUR_EYES_VIOLATION', 409, 'A different officer must verify completion.');
  if (!task.evidence.length) throw new ExecutionError('EVIDENCE_REQUIRED', 409, 'At least one evidence record is required.');
  return prisma.$transaction(async (tx) => {
    const currentEvidence = await tx.executionEvidence.count({ where: { executionTaskId: taskId } });
    if (!currentEvidence) throw new ExecutionError('EVIDENCE_REQUIRED', 409, 'At least one evidence record is required.');
    const changed = await tx.executionTask.updateMany({ where: { id: taskId, status: ExecutionTaskStatus.COMPLETION_SUBMITTED }, data: { status: ExecutionTaskStatus.VERIFIED, verifiedById: principal.id, verifiedAt: new Date(), verificationNote: note.trim() } });
    if (changed.count !== 1) throw new ExecutionError('INVALID_EXECUTION_TASK_STATE', 409, 'Task state changed concurrently.');
    await refreshPlan(tx, task.executionPlanId);
    return tx.executionTask.findUniqueOrThrow({ where: { id: taskId }, include: taskInclude });
  });
}
