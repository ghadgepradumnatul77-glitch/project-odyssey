import { apiRequest } from './client';

export interface ReportingActor { id: string; name: string; designation: string; }
export interface ReportingReason { code: string | null; message: string; }
export interface DecisionBriefDto {
  case: { id: string; caseNumber: string; title: string; description: string | null; status: string; statusExplanation: string; emergencyFlag: boolean; createdAt: string; updatedAt: string; closedAt: string | null };
  asset: { id: string; assetCode: string; name: string; assetType: string; department: { id: string; code: string; name: string }; jurisdiction: { id: string; name: string; type: string } };
  workflow: { coherent: boolean; warnings: string[]; statusExplanationVersion: string; anchor: string };
  inspection: null | { id: string; inspectionDate: string; structuralCondition: string; crackSeverity: string; corrosionLevel: string; trafficImportance: string; hospitalRoute: boolean; weatherRisk: string; heavyRainExpected: boolean; estimatedDailyUsers: number | null; createdAt: string; inspector: ReportingActor };
  risk: null | { id: string; riskScore: number; riskLevel: string; priorityLevel: string; reasonCodes: string[]; reasons: ReportingReason[]; assessmentVersion: string; createdAt: string };
  orp: null | { id: string; versionNumber: number; status: string; urgency: string; recommendedActionCodes: string[]; temporaryMeasures: string[]; alternativeActionCodes: string[]; reasons: ReportingReason[]; planVersion: string; createdAt: string };
  decision: null | { id: string; decisionType: string; reason: string | null; remarks: string | null; createdAt: string; reviewer: ReportingActor };
  execution: null | { id: string; status: string; templateVersion: string; createdAt: string; startedAt: string | null; completedAt: string | null; metrics: { totalTasks: number; mandatoryTasks: number; verifiedMandatoryTasks: number; optionalTasks: number; terminalOptionalTasks: number; verifiedTasks: number; blockedTasks: number; cancelledTasks: number; evidenceCount: number; completionPercentage: number | null }; accountability: { assignees: ReportingActor[]; completionSubmitters: ReportingActor[]; verifiers: ReportingActor[] } };
  evidence: null | { totalEvidence: number; countsByType: Record<string, number> };
  closure: null | { id: string; closureReason: string; closureSummary: string; createdAt: string; closedBy: ReportingActor };
}
export type TimelineEventType = 'CASE_CREATED'|'INSPECTION_RECORDED'|'RISK_ASSESSED'|'ORP_GENERATED'|'ORP_DECIDED'|'EXECUTION_PLAN_CREATED'|'EXECUTION_STARTED'|'TASK_CREATED'|'TASK_ASSIGNED'|'TASK_STARTED'|'EVIDENCE_SUBMITTED'|'TASK_COMPLETION_SUBMITTED'|'TASK_VERIFIED'|'TASK_CANCELLED'|'EXECUTION_PLAN_COMPLETED'|'CASE_CLOSED';
export interface TimelineEventDto { eventType: TimelineEventType; occurredAt: string; actor: ReportingActor | null; source: { type: string; id: string }; summary: string; metadata: Record<string, unknown>; }
export interface TimelinePageDto { caseId: string; events: TimelineEventDto[]; page: { limit: number; nextCursor: string | null } }
export interface TimelineOptions { limit?: number; cursor?: string; }

export const getDecisionBrief = (caseId: string, token: string, signal?: AbortSignal) => apiRequest<DecisionBriefDto>(`/cases/${caseId}/decision-brief`, { accessToken: token, signal });
export function getCaseTimeline(caseId: string, token: string, options: TimelineOptions = {}, signal?: AbortSignal) {
  const parameters = new URLSearchParams();
  if (options.limit !== undefined) parameters.set('limit', String(options.limit));
  if (options.cursor !== undefined) parameters.set('cursor', options.cursor);
  const query = parameters.size ? `?${parameters.toString()}` : '';
  return apiRequest<TimelinePageDto>(`/cases/${caseId}/timeline${query}`, { accessToken: token, signal });
}
