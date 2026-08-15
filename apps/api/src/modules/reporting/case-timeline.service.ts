import prisma from '../../lib/prisma';
import { buildCaseReadWhere, OrganizationalPrincipal } from '../../security/organizational-scope';
import { ReportingError } from './reporting-error';

const actorSelect = { id: true, name: true, designation: true } as const;
export const TIMELINE_DEFAULT_LIMIT = 100;
export const TIMELINE_MAX_LIMIT = 200;
export const EVENT_PRECEDENCE = {
  CASE_CREATED: 10, INSPECTION_RECORDED: 20, RISK_ASSESSED: 30, ORP_GENERATED: 40, ORP_DECIDED: 50,
  EXECUTION_PLAN_CREATED: 60, EXECUTION_STARTED: 70, TASK_CREATED: 80, TASK_ASSIGNED: 90,
  TASK_STARTED: 100, EVIDENCE_SUBMITTED: 110, TASK_COMPLETION_SUBMITTED: 120, TASK_VERIFIED: 130,
  TASK_CANCELLED: 140, EXECUTION_PLAN_COMPLETED: 150, CASE_CLOSED: 160
} as const;
type EventType = keyof typeof EVENT_PRECEDENCE;
type Actor = { id: string; name: string; designation: string } | null;
export interface TimelineEvent { eventType: EventType; occurredAt: Date; actor: Actor; source: { type: string; id: string }; summary: string; metadata: Record<string, unknown>; }

const summaries: Record<EventType, string> = {
  CASE_CREATED: 'Case was registered.', INSPECTION_RECORDED: 'An inspection was recorded.',
  RISK_ASSESSED: 'Risk and priority assessment was recorded.', ORP_GENERATED: 'An operational response plan was generated.',
  ORP_DECIDED: 'A human decision was recorded for the operational response plan.',
  EXECUTION_PLAN_CREATED: 'An execution plan was created.', EXECUTION_STARTED: 'Execution work started.',
  TASK_CREATED: 'An execution task was created.', TASK_ASSIGNED: 'An execution task was assigned.',
  TASK_STARTED: 'Work on an execution task started.', EVIDENCE_SUBMITTED: 'Evidence was submitted for an execution task.',
  TASK_COMPLETION_SUBMITTED: 'Execution task completion was submitted for verification.',
  TASK_VERIFIED: 'Execution task completion was independently verified.', TASK_CANCELLED: 'An execution task was cancelled.',
  EXECUTION_PLAN_COMPLETED: 'The execution plan was completed.', CASE_CLOSED: 'The verified workflow was formally closed by an authorized officer.'
};
function event(eventType: EventType, occurredAt: Date, actor: Actor, sourceType: string, sourceId: string, metadata: Record<string, unknown> = {}): TimelineEvent {
  return { eventType, occurredAt, actor, source: { type: sourceType, id: sourceId }, summary: summaries[eventType], metadata };
}
function compare(a: TimelineEvent, b: TimelineEvent) {
  return a.occurredAt.getTime() - b.occurredAt.getTime() || EVENT_PRECEDENCE[a.eventType] - EVENT_PRECEDENCE[b.eventType] || a.source.type.localeCompare(b.source.type) || a.source.id.localeCompare(b.source.id) || a.eventType.localeCompare(b.eventType);
}
function tuple(item: TimelineEvent) { return [item.occurredAt.toISOString(), EVENT_PRECEDENCE[item.eventType], item.source.type, item.source.id, item.eventType] as const; }
function encodeCursor(item: TimelineEvent) { return Buffer.from(JSON.stringify(tuple(item)), 'utf8').toString('base64url'); }
function decodeCursor(value: string): readonly [string, number, string, string, EventType] {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
    if (!Array.isArray(parsed) || parsed.length !== 5 || typeof parsed[0] !== 'string' || Number.isNaN(new Date(parsed[0]).getTime()) || typeof parsed[1] !== 'number' || typeof parsed[2] !== 'string' || typeof parsed[3] !== 'string' || typeof parsed[4] !== 'string' || !(parsed[4] in EVENT_PRECEDENCE) || EVENT_PRECEDENCE[parsed[4] as EventType] !== parsed[1]) throw new Error();
    return parsed as unknown as readonly [string, number, string, string, EventType];
  } catch { throw new ReportingError('INVALID_INPUT', 400, 'cursor is invalid.'); }
}
function after(item: TimelineEvent, cursor: readonly [string, number, string, string, EventType]) {
  const synthetic: TimelineEvent = { eventType: cursor[4], occurredAt: new Date(cursor[0]), actor: null, source: { type: cursor[2], id: cursor[3] }, summary: '', metadata: {} };
  return compare(item, synthetic) > 0;
}

export async function getCaseTimeline(caseId: string, principal: OrganizationalPrincipal, limit = TIMELINE_DEFAULT_LIMIT, cursor?: string) {
  if (!Number.isInteger(limit) || limit < 1 || limit > TIMELINE_MAX_LIMIT) throw new ReportingError('INVALID_INPUT', 400, `limit must be an integer from 1 to ${TIMELINE_MAX_LIMIT}.`);
  const cursorTuple = cursor ? decodeCursor(cursor) : null;
  const target = await prisma.case.findFirst({ where: { id: caseId, ...buildCaseReadWhere(principal) }, select: { id: true, createdAt: true } });
  if (!target) throw new ReportingError('CASE_NOT_FOUND', 404, 'Case not found.');
  const [inspections, risks, orps, decisions, plans, tasks, evidence, closures] = await Promise.all([
    prisma.inspection.findMany({ where: { caseId }, select: { id: true, createdAt: true, inspector: { select: actorSelect } } }),
    prisma.riskAssessment.findMany({ where: { caseId }, select: { id: true, createdAt: true } }),
    prisma.operationalResponsePlan.findMany({ where: { caseId }, select: { id: true, createdAt: true, versionNumber: true } }),
    prisma.orpDecision.findMany({ where: { caseId }, select: { id: true, createdAt: true, decisionType: true, reviewer: { select: actorSelect } } }),
    prisma.executionPlan.findMany({ where: { caseId }, select: { id: true, createdAt: true, startedAt: true, completedAt: true, createdBy: { select: actorSelect } } }),
    prisma.executionTask.findMany({ where: { executionPlan: { caseId } }, select: { id: true, executionPlanId: true, sequenceNumber: true, createdAt: true, assignedAt: true, startedAt: true, completionSubmittedAt: true, verifiedAt: true, cancelledAt: true, assignedTo: { select: actorSelect }, assignedBy: { select: actorSelect }, completionSubmittedBy: { select: actorSelect }, verifiedBy: { select: actorSelect }, cancelledBy: { select: actorSelect } } }),
    prisma.executionEvidence.findMany({ where: { executionTask: { executionPlan: { caseId } } }, select: { id: true, executionTaskId: true, evidenceType: true, submittedAt: true, capturedAt: true, submittedBy: { select: actorSelect }, executionTask: { select: { sequenceNumber: true } } } }),
    prisma.caseClosure.findMany({ where: { caseId }, select: { id: true, createdAt: true, closedBy: { select: actorSelect } } })
  ]);
  const events: TimelineEvent[] = [event('CASE_CREATED', target.createdAt, null, 'CASE', target.id)];
  inspections.forEach((item) => events.push(event('INSPECTION_RECORDED', item.createdAt, item.inspector, 'INSPECTION', item.id)));
  risks.forEach((item) => events.push(event('RISK_ASSESSED', item.createdAt, null, 'RISK_ASSESSMENT', item.id)));
  orps.forEach((item) => events.push(event('ORP_GENERATED', item.createdAt, null, 'ORP', item.id, { versionNumber: item.versionNumber })));
  decisions.forEach((item) => events.push(event('ORP_DECIDED', item.createdAt, item.reviewer, 'ORP_DECISION', item.id, { decisionType: item.decisionType })));
  plans.forEach((item) => { events.push(event('EXECUTION_PLAN_CREATED', item.createdAt, item.createdBy, 'EXECUTION_PLAN', item.id)); if (item.startedAt) events.push(event('EXECUTION_STARTED', item.startedAt, null, 'EXECUTION_PLAN', item.id)); if (item.completedAt) events.push(event('EXECUTION_PLAN_COMPLETED', item.completedAt, null, 'EXECUTION_PLAN', item.id)); });
  tasks.forEach((item) => { const meta = { executionPlanId: item.executionPlanId, sequenceNumber: item.sequenceNumber }; events.push(event('TASK_CREATED', item.createdAt, null, 'EXECUTION_TASK', item.id, meta)); if (item.assignedAt) events.push(event('TASK_ASSIGNED', item.assignedAt, item.assignedBy, 'EXECUTION_TASK', item.id, meta)); if (item.startedAt) events.push(event('TASK_STARTED', item.startedAt, item.assignedTo, 'EXECUTION_TASK', item.id, meta)); if (item.completionSubmittedAt) events.push(event('TASK_COMPLETION_SUBMITTED', item.completionSubmittedAt, item.completionSubmittedBy, 'EXECUTION_TASK', item.id, meta)); if (item.verifiedAt) events.push(event('TASK_VERIFIED', item.verifiedAt, item.verifiedBy, 'EXECUTION_TASK', item.id, meta)); if (item.cancelledAt) events.push(event('TASK_CANCELLED', item.cancelledAt, item.cancelledBy, 'EXECUTION_TASK', item.id, meta)); });
  evidence.forEach((item) => events.push(event('EVIDENCE_SUBMITTED', item.submittedAt, item.submittedBy, 'EXECUTION_EVIDENCE', item.id, { evidenceType: item.evidenceType, executionTaskId: item.executionTaskId, taskSequenceNumber: item.executionTask.sequenceNumber, capturedAt: item.capturedAt })));
  closures.forEach((item) => events.push(event('CASE_CLOSED', item.createdAt, item.closedBy, 'CASE_CLOSURE', item.id)));
  events.sort(compare);
  const remaining = cursorTuple ? events.filter((item) => after(item, cursorTuple)) : events;
  const pageEvents = remaining.slice(0, limit);
  return { caseId, events: pageEvents, page: { limit, nextCursor: remaining.length > limit ? encodeCursor(pageEvents[pageEvents.length - 1]) : null } };
}
