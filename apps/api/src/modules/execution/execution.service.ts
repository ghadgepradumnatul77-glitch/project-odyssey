import prisma from '../../lib/prisma';
import { ExecutionBlockerCategory, ExecutionEvidenceType, ExecutionPlanStatus, ExecutionTaskStatus, OrpDecisionType, Prisma, SystemRole, UserStatus } from '../../generated/prisma';
import { buildCaseReadWhere, buildExecutionPlanMutationWhere, buildExecutionPlanReadWhere, buildExecutionTaskMutationWhere, buildExecutionTaskReadWhere, buildOrpMutationWhere, isSameOrganizationalScope, OrganizationalPrincipal } from '../../security/organizational-scope';
import { ExecutionError } from './execution-error';
import { EXECUTION_TEMPLATE_VERSION, translateActionsToTasks } from './execution-templates';
import { z } from 'zod';
import { GovernedTemplateError, resolveGovernedTemplate } from '../execution-templates/governed-execution-template.service';
import { pageFromRows, type StableCursor } from '../../lib/pagination';

export const GOVERNED_EXECUTION_CONTRACT_VERSION='ODYSSEY_GOVERNED_EXECUTION_V1';
const governedAction=z.object({actionId:z.string().uuid(),actionCode:z.string().min(1),actionVersion:z.number().int().positive(),classification:z.enum(['MANDATORY','RECOMMENDED','OPTIONAL','PROHIBITED'])}).passthrough();
const governedProjection=z.object({packageId:z.string().min(1),packageVersion:z.number().int().positive(),MANDATORY:z.array(governedAction),RECOMMENDED:z.array(governedAction),OPTIONAL:z.array(governedAction),PROHIBITED:z.array(governedAction),ENGINEERING_RECOMMENDED:z.array(z.unknown())}).passthrough();
export function governedExecutableActions(value:unknown,recommendedActionCodes:unknown){const projection=governedProjection.safeParse(value),selected=actionCodes(recommendedActionCodes);if(!projection.success||!selected)throw new ExecutionError('GOVERNED_ORP_INTEGRITY_ERROR',409,'Governed executable action selection is inconsistent.');const executable=[...projection.data.MANDATORY,...projection.data.RECOMMENDED];if(selected.length!==executable.length||selected.some((code,index)=>code!==executable[index].actionCode)||projection.data.PROHIBITED.some(item=>selected.includes(item.actionCode)))throw new ExecutionError('GOVERNED_ORP_INTEGRITY_ERROR',409,'Governed executable action selection is inconsistent.');return{projection:projection.data,executable};}

const safeUser = { id: true, employeeCode: true, name: true, designation: true, role: true, status: true } as const;
const safeAssigneeCandidate = { id: true, employeeCode: true, name: true, designation: true } as const;
const taskInclude = { assignedTo: { select: safeUser }, assignedBy: { select: safeUser }, completionSubmittedBy: { select: safeUser }, verifiedBy: { select: safeUser }, cancelledBy: { select: safeUser }, evidence: { include: { submittedBy: { select: safeUser } }, orderBy: { submittedAt: 'asc' as const }, take: 101 }, dependencies:{include:{predecessorTask:{select:{id:true,sequenceNumber:true,titleSnapshot:true,status:true}}}}, blockerEvents:{include:{blockedBy:{select:safeUser},resolvedBy:{select:safeUser}},orderBy:{blockedAt:'desc' as const},take:50}, scheduleRevisions:{orderBy:{changedAt:'desc' as const},take:20} };
const presentTask = <T extends { evidence: unknown[] }>(task: T) => ({ ...task, evidence: task.evidence.slice(0, 100), evidenceTruncated: task.evidence.length > 100 });

function notFound(resource: 'Execution plan' | 'Execution task'): never { throw new ExecutionError(resource === 'Execution plan' ? 'EXECUTION_PLAN_NOT_FOUND' : 'EXECUTION_TASK_NOT_FOUND', 404, `${resource} not found.`); }
function actorFields(body: Record<string, unknown>) {
  return ['createdById', 'assignedById', 'assignedAt', 'submittedById', 'submittedAt', 'completionSubmittedById', 'verifiedById', 'cancelledById', 'startedAt'].some((key) => Object.prototype.hasOwnProperty.call(body, key));
}
export function hasClientActorFields(body: Record<string, unknown>) { return actorFields(body); }
export function unmetDependencyMessage(rows:Array<{predecessorTask:{id:string;status:ExecutionTaskStatus}}>){return rows.length?`Task cannot start until predecessors are verified: ${rows.map(item=>`${item.predecessorTask.id} (${item.predecessorTask.status})`).join(', ')}.`:null;}
export function findUnmetTaskDependencies(tx:Prisma.TransactionClient,taskId:string){return tx.executionTaskDependency.findMany({where:{dependentTaskId:taskId,predecessorTask:{status:{not:ExecutionTaskStatus.VERIFIED}}},select:{predecessorTask:{select:{id:true,status:true}}}});}

function actionCodes(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : null;
}
export function executionGovernanceMode(governanceMode: string, decisionPackageId: string | null) {
  if (governanceMode === 'LEGACY' && decisionPackageId === null) return 'LEGACY' as const;
  if (governanceMode !== 'LEGACY' && decisionPackageId !== null) return 'GOVERNED' as const;
  return 'INVALID' as const;
}

export function derivePlanStatus(statuses: Array<{ status: ExecutionTaskStatus; isMandatory: boolean }>): ExecutionPlanStatus {
  const mandatory = statuses.filter((task) => task.isMandatory);
  const optional = statuses.filter((task) => !task.isMandatory);
  const optionalTerminal = optional.every((task) => task.status === ExecutionTaskStatus.VERIFIED || task.status === ExecutionTaskStatus.CANCELLED);
  if (mandatory.length > 0 && mandatory.every((task) => task.status === ExecutionTaskStatus.VERIFIED) && optionalTerminal) return ExecutionPlanStatus.COMPLETED;
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
    completedAt: status === ExecutionPlanStatus.COMPLETED && plan.status !== ExecutionPlanStatus.COMPLETED ? now : undefined
  }});
  if (status === ExecutionPlanStatus.COMPLETED) {
    await tx.case.updateMany({ where: { id: plan.caseId, status: 'EXECUTION' }, data: { status: 'VERIFICATION' } });
  }
}

export async function generateExecutionPlan(orpId: string, principal: OrganizationalPrincipal) {
  const existing = await prisma.executionPlan.findFirst({ where: { orpId, ...buildExecutionPlanMutationWhere(principal) }, include: { tasks: { include: taskInclude, orderBy: { sequenceNumber: 'asc' } } } });
  if (existing) {
    const existingCase = await prisma.case.findUnique({ where: { id: existing.caseId }, select: { status: true } });
    if (existingCase?.status === 'CLOSED') throw new ExecutionError('INVALID_CASE_STATE', 409, 'A closed Case cannot generate an execution plan.');
    return { plan: existing, created: false };
  }
  const orp = await prisma.operationalResponsePlan.findUnique({ where: { id: orpId, AND: [buildOrpMutationWhere(principal)] }, include: { case: { include: { asset: true } }, decisions: true, decisionPackage: { select: { id:true,packageVersion:true,status:true } } } });
  if (!orp) throw new ExecutionError('ORP_NOT_FOUND', 404, 'Operational response plan not found.');
  if (orp.status !== 'APPROVED') throw new ExecutionError('ORP_NOT_APPROVED', 409, 'Operational response plan is not approved.');
  const decision = orp.decisions.find((item) => item.decisionType === OrpDecisionType.APPROVED);
  if (!decision || decision.orpId !== orp.id || decision.caseId !== orp.caseId) throw new ExecutionError('APPROVED_DECISION_REQUIRED', 409, 'A matching approved decision is required.');
  if (orp.case.status !== 'APPROVED') throw new ExecutionError('INVALID_CASE_STATE', 409, 'Case must be APPROVED before execution planning.');
  const latest = await prisma.operationalResponsePlan.findFirst({ where: { caseId: orp.caseId }, orderBy: [{ versionNumber: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }], select: { id: true } });
  if (latest?.id !== orp.id) throw new ExecutionError('STALE_ORP_VERSION', 409, 'A newer operational response plan exists.');
  const governance = executionGovernanceMode(orp.governanceMode, orp.decisionPackageId);
  if (governance === 'INVALID') throw new ExecutionError('GOVERNED_ORP_INTEGRITY_ERROR', 409, 'Action Plan governance mode and Decision Package provenance are inconsistent.');
  if (governance === 'GOVERNED') {
    const {projection,executable}=governedExecutableActions(orp.governedActions,orp.recommendedActionCodes);
    if(projection.packageId!==orp.decisionPackageId||orp.decisionPackage?.id!==orp.decisionPackageId||orp.decisionPackage.status!=='PREPARED')throw new ExecutionError('GOVERNED_ORP_INTEGRITY_ERROR',409,'Governed Action Plan and Decision Package provenance are inconsistent.');
    if(projection.ENGINEERING_RECOMMENDED.length)throw new ExecutionError('EXECUTION_TEMPLATE_NOT_GOVERNED',409,'Engineering recommendations without an Approved Action Version cannot generate governed execution.');
    let resolved;
    try{resolved=await Promise.all(executable.map(async action=>({action,template:await resolveGovernedTemplate(action.actionId,orp.case.asset.departmentId,orp.case.asset.jurisdictionId)})));}catch(error){if(error instanceof GovernedTemplateError)throw new ExecutionError(error.code,error.status,error.message);throw error;}
    const provenance={contractVersion:GOVERNED_EXECUTION_CONTRACT_VERSION,orp:{id:orp.id,versionNumber:orp.versionNumber},decisionPackage:{id:orp.decisionPackage.id,versionNumber:orp.decisionPackage.packageVersion},humanDecision:{id:decision.id},actions:resolved.map(({action,template})=>({approvedActionVersion:{id:action.actionId,code:action.actionCode,versionNumber:action.actionVersion},executionTemplate:{id:template.id,code:template.templateCode,versionNumber:template.versionNumber},tasks:template.tasks.map(task=>({id:task.id,code:task.taskCode,sequenceNumber:task.sequenceNumber}))}))};
    try{const plan=await prisma.$transaction(async tx=>{const created=await tx.executionPlan.create({data:{orpId:orp.id,caseId:orp.caseId,approvalDecisionId:decision.id,createdById:principal.id,templateVersion:GOVERNED_EXECUTION_CONTRACT_VERSION,governanceMode:'GOVERNED',executionContractVersion:GOVERNED_EXECUTION_CONTRACT_VERSION,governedProvenance:provenance}});let sequence=1;const rows=resolved.flatMap(({action,template})=>template.tasks.map(task=>({executionPlanId:created.id,sequenceNumber:sequence++,sourceActionCode:action.actionCode,templateTaskKey:task.taskCode,titleSnapshot:task.title,descriptionSnapshot:task.description,categorySnapshot:template.approvedActionVersion.category,isMandatory:task.mandatory,approvedActionVersionId:action.actionId,governedExecutionTemplateId:template.id,governedTaskTemplateId:task.id,sourceActionVersion:action.actionVersion,sourceTemplateCode:template.templateCode,sourceTemplateVersion:template.versionNumber,evidenceRequired:task.evidenceRequired,verificationRequired:task.verificationRequired})));if(rows.length)await tx.executionTask.createMany({data:rows});const changed=await tx.case.updateMany({where:{id:orp.caseId,status:'APPROVED'},data:{status:'EXECUTION'}});if(changed.count!==1)throw new ExecutionError('INVALID_CASE_STATE',409,'Case state changed before execution planning.');return tx.executionPlan.findUniqueOrThrow({where:{id:created.id},include:{tasks:{include:taskInclude,orderBy:{sequenceNumber:'asc'}}}});});return{plan,created:true};}catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002'){const plan=await prisma.executionPlan.findFirst({where:{orpId,...buildExecutionPlanMutationWhere(principal)},include:{tasks:{include:taskInclude,orderBy:{sequenceNumber:'asc'}}}});if(plan)return{plan,created:false};throw new ExecutionError('EXECUTION_PLAN_CONFLICT',409,'Execution plan creation conflicted.');}throw error;}
  }
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

export async function listCaseExecutionPlans(caseId: string, principal: OrganizationalPrincipal, query: { limit: number; cursor?: StableCursor } = { limit: 25 }) {
  const target = await prisma.case.findUnique({ where: { id: caseId, AND: [buildCaseReadWhere(principal)] }, select: { id: true } });
  if (!target) throw new ExecutionError('CASE_NOT_FOUND', 404, 'Case not found.');
  const rows = await prisma.executionPlan.findMany({ where: { caseId, ...buildExecutionPlanReadWhere(principal), ...(query.cursor ? { OR: [{ createdAt: { lt: new Date(query.cursor.at) } }, { createdAt: new Date(query.cursor.at), id: { lt: query.cursor.id } }] } : {}) }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: query.limit + 1 });
  return pageFromRows(rows, query.limit, (item) => item.createdAt.toISOString());
}
export async function getExecutionPlan(planId: string, principal: OrganizationalPrincipal) {
  const plan = await prisma.executionPlan.findUnique({ where: { id: planId, AND: [buildExecutionPlanReadWhere(principal)] }, include: { createdBy: { select: safeUser }, tasks: { include: taskInclude, orderBy: { sequenceNumber: 'asc' }, take: 101 } } });
  if (!plan) notFound('Execution plan');
  return { ...plan, tasks: plan.tasks.slice(0, 100).map(presentTask), tasksTruncated: plan.tasks.length > 100 };
}
export async function listExecutionTasks(planId: string, principal: OrganizationalPrincipal, query: { limit: number; cursor?: StableCursor } = { limit: 25 }) {
  const plan = await prisma.executionPlan.findUnique({ where: { id: planId, AND: [buildExecutionPlanReadWhere(principal)] }, select: { id: true } });
  if (!plan) notFound('Execution plan');
  const rows = await prisma.executionTask.findMany({ where: { executionPlanId: planId, ...buildExecutionTaskReadWhere(principal), ...(query.cursor ? { OR: [{ createdAt: { lt: new Date(query.cursor.at) } }, { createdAt: new Date(query.cursor.at), id: { lt: query.cursor.id } }] } : {}) }, include: taskInclude, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: query.limit + 1 });
  const page = pageFromRows(rows, query.limit, (item) => item.createdAt.toISOString());
  return { ...page, items: page.items.map(presentTask) };
}

async function scopedTask(taskId: string, principal: OrganizationalPrincipal) {
  const task = await prisma.executionTask.findUnique({ where: { id: taskId, AND: [buildExecutionTaskMutationWhere(principal)] }, include: { executionPlan: { include: { case: { include: { asset: true } } } }, evidence: { select: { id: true } } } });
  if (!task) notFound('Execution task');
  if (task.executionPlan.status === ExecutionPlanStatus.COMPLETED || task.executionPlan.case.status === 'CLOSED') {
    throw new ExecutionError('INVALID_EXECUTION_TASK_STATE', 409, 'Completed execution or a closed Case cannot be mutated.');
  }
  return task;
}

async function assignmentContext(taskId: string, principal: OrganizationalPrincipal) {
  const task = await scopedTask(taskId, principal);
  if (task.status !== ExecutionTaskStatus.PENDING) {
    throw new ExecutionError('INVALID_EXECUTION_TASK_STATE', 409, 'Task is not pending.');
  }
  return {
    task,
    eligibility: {
      status: UserStatus.ACTIVE,
      role: SystemRole.OFFICER,
      departmentId: task.executionPlan.case.asset.departmentId,
      jurisdictionId: task.executionPlan.case.asset.jurisdictionId
    }
  };
}

export async function resolveEligibleExecutionAssignees(taskId: string, principal: OrganizationalPrincipal) {
  const { eligibility } = await assignmentContext(taskId, principal);
  const rows=await prisma.user.findMany({ where: eligibility, select: safeAssigneeCandidate,
    orderBy: [{ name: 'asc' }, { employeeCode: 'asc' }, { id: 'asc' }],take:101 });
  return {items:rows.slice(0,100),limit:100,truncated:rows.length>100};
}

export async function assertEligibleExecutionAssignee(taskId: string, assigneeId: string, principal: OrganizationalPrincipal) {
  const context = await assignmentContext(taskId, principal);
  const assignee = await prisma.user.findFirst({ where: { id: assigneeId, ...context.eligibility }, select: safeAssigneeCandidate });
  if (!assignee) throw new ExecutionError('ASSIGNEE_NOT_ELIGIBLE', 404, 'Eligible assignee not found.');
  return { ...context, assignee };
}

async function assertTaskMutable(tx: Prisma.TransactionClient, taskId: string) {
  const current = await tx.executionTask.findUnique({
    where: { id: taskId },
    select: { executionPlan: { select: { status: true, case: { select: { status: true } } } } }
  });
  if (!current || current.executionPlan.status === ExecutionPlanStatus.COMPLETED || current.executionPlan.case.status === 'CLOSED') {
    throw new ExecutionError('INVALID_EXECUTION_TASK_STATE', 409, 'Completed execution or a closed Case cannot be mutated.');
  }
}

export async function assignTask(taskId: string, assigneeId: string, principal: OrganizationalPrincipal) {
  const { task, assignee } = await assertEligibleExecutionAssignee(taskId, assigneeId, principal);
  return prisma.$transaction(async (tx) => {
    await assertTaskMutable(tx, taskId);
    const changed = await tx.executionTask.updateMany({ where: { id: taskId, status: ExecutionTaskStatus.PENDING }, data: { assignedToId: assignee.id, assignedById: principal.id, assignedAt: new Date(), status: ExecutionTaskStatus.ASSIGNED } });
    if (changed.count !== 1) throw new ExecutionError('INVALID_EXECUTION_TASK_STATE', 409, 'Task is not pending.');
    await refreshPlan(tx, task.executionPlanId);
    return tx.executionTask.findUniqueOrThrow({ where: { id: taskId }, include: taskInclude });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function changeTaskStatus(taskId: string, requested: 'IN_PROGRESS' | 'BLOCKED' | 'CANCELLED', reason: string | undefined, principal: OrganizationalPrincipal, blockerCategory?: ExecutionBlockerCategory) {
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
    if (requested === 'BLOCKED' && !blockerCategory) throw new ExecutionError('INVALID_INPUT', 400, 'Blocker category is required.');
    if (requested === 'IN_PROGRESS' && task.status === ExecutionTaskStatus.BLOCKED && !reason?.trim()) throw new ExecutionError('INVALID_INPUT', 400, 'Resolution reason is required.');
  }
  return prisma.$transaction(async (tx) => {
    await assertTaskMutable(tx, taskId);
    if(requested==='IN_PROGRESS'){
      const unmet=await findUnmetTaskDependencies(tx,taskId);
      const message=unmetDependencyMessage(unmet);if(message)throw new ExecutionError('UNMET_TASK_DEPENDENCIES',409,message);
    }
    const data = requested === 'CANCELLED' ? { status: ExecutionTaskStatus.CANCELLED, cancelledById: principal.id, cancelledAt: new Date(), cancellationReason: reason!.trim() } : requested === 'BLOCKED' ? { status: ExecutionTaskStatus.BLOCKED, blockedReason: reason!.trim() } : { status: ExecutionTaskStatus.IN_PROGRESS, startedAt: task.startedAt ?? new Date() };
    const changed = await tx.executionTask.updateMany({ where: { id: taskId, status: task.status }, data });
    if (changed.count !== 1) throw new ExecutionError('INVALID_EXECUTION_TASK_STATE', 409, 'Task state changed concurrently.');
    if(requested==='BLOCKED')await tx.executionTaskBlockerEvent.create({data:{executionTaskId:taskId,category:blockerCategory!,reason:reason!.trim(),blockedById:principal.id}});
    if(requested==='IN_PROGRESS'&&task.status===ExecutionTaskStatus.BLOCKED){const open=await tx.executionTaskBlockerEvent.findFirst({where:{executionTaskId:taskId,resolvedAt:null},orderBy:{blockedAt:'desc'}});if(open)await tx.executionTaskBlockerEvent.update({where:{id:open.id},data:{resolvedAt:new Date(),resolvedById:principal.id,resolutionReason:reason!.trim()}});}
    await refreshPlan(tx, task.executionPlanId);
    return tx.executionTask.findUniqueOrThrow({ where: { id: taskId }, include: taskInclude });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function addEvidence(taskId: string, input: { evidenceType: ExecutionEvidenceType; description: string; referenceUrl?: string; documentReference?: string; measurementData?: unknown; capturedAt?: Date }, principal: OrganizationalPrincipal) {
  const task = await scopedTask(taskId, principal);
  if (task.assignedToId !== principal.id) throw new ExecutionError('FORBIDDEN', 403, 'Only the assigned officer may submit evidence.');
  if (task.status !== ExecutionTaskStatus.IN_PROGRESS && task.status !== ExecutionTaskStatus.BLOCKED) throw new ExecutionError('INVALID_EXECUTION_TASK_STATE', 409, 'Evidence is not allowed in the current state.');
  return prisma.$transaction(async (tx) => {
    await assertTaskMutable(tx, taskId);
    return tx.executionEvidence.create({ data: { executionTaskId: task.id, submittedById: principal.id, evidenceType: input.evidenceType, description: input.description.trim(), referenceUrl: input.referenceUrl, documentReference: input.documentReference, measurementData: input.measurementData as Prisma.InputJsonValue | undefined, capturedAt: input.capturedAt }, include: { submittedBy: { select: safeUser } } });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function submitCompletion(taskId: string, note: string, principal: OrganizationalPrincipal) {
  const task = await scopedTask(taskId, principal);
  if (task.assignedToId !== principal.id) throw new ExecutionError('FORBIDDEN', 403, 'Only the assigned officer may submit completion.');
  if (task.status !== ExecutionTaskStatus.IN_PROGRESS) throw new ExecutionError('INVALID_EXECUTION_TASK_STATE', 409, 'Task is not in progress.');
  if (!task.evidence.length) throw new ExecutionError('EVIDENCE_REQUIRED', 409, 'At least one evidence record is required.');
  return prisma.$transaction(async (tx) => {
    await assertTaskMutable(tx, taskId);
    const changed = await tx.executionTask.updateMany({ where: { id: taskId, status: ExecutionTaskStatus.IN_PROGRESS, assignedToId: principal.id }, data: { status: ExecutionTaskStatus.COMPLETION_SUBMITTED, completionSubmittedById: principal.id, completionSubmittedAt: new Date(), completionNote: note.trim() } });
    if (changed.count !== 1) throw new ExecutionError('INVALID_EXECUTION_TASK_STATE', 409, 'Task state changed concurrently.');
    await refreshPlan(tx, task.executionPlanId);
    return tx.executionTask.findUniqueOrThrow({ where: { id: taskId }, include: taskInclude });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function verifyTask(taskId: string, note: string, principal: OrganizationalPrincipal) {
  const task = await scopedTask(taskId, principal);
  if (task.status !== ExecutionTaskStatus.COMPLETION_SUBMITTED) throw new ExecutionError('INVALID_EXECUTION_TASK_STATE', 409, 'Task is not awaiting verification.');
  if (principal.id === task.assignedToId || principal.id === task.completionSubmittedById) throw new ExecutionError('FOUR_EYES_VIOLATION', 409, 'A different officer must verify completion.');
  if (!task.evidence.length) throw new ExecutionError('EVIDENCE_REQUIRED', 409, 'At least one evidence record is required.');
  return prisma.$transaction(async (tx) => {
    await assertTaskMutable(tx, taskId);
    const currentEvidence = await tx.executionEvidence.count({ where: { executionTaskId: taskId } });
    if (!currentEvidence) throw new ExecutionError('EVIDENCE_REQUIRED', 409, 'At least one evidence record is required.');
    const changed = await tx.executionTask.updateMany({ where: { id: taskId, status: ExecutionTaskStatus.COMPLETION_SUBMITTED }, data: { status: ExecutionTaskStatus.VERIFIED, verifiedById: principal.id, verifiedAt: new Date(), verificationNote: note.trim() } });
    if (changed.count !== 1) throw new ExecutionError('INVALID_EXECUTION_TASK_STATE', 409, 'Task state changed concurrently.');
    await refreshPlan(tx, task.executionPlanId);
    return tx.executionTask.findUniqueOrThrow({ where: { id: taskId }, include: taskInclude });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
