import { apiRequest } from './client';
import type { PriorityLevel, RiskLevel } from './cases.api';

export interface SafeActor { id: string; name: string; designation: string; }
export interface InspectionDto {
  id: string; inspectionDate: string; structuralCondition: string; crackSeverity: string; corrosionLevel: string;
  trafficImportance: string; hospitalRoute: boolean; weatherRisk: string; heavyRainExpected: boolean;
  estimatedDailyUsers: number | null; inspectionNotes: string | null; createdAt: string; inspector?: SafeActor | null;
}
export interface RiskAssessmentDto { id: string; riskScore: number; riskLevel: RiskLevel; priorityLevel: PriorityLevel; reasonCodes: unknown; reasons: unknown; assessmentVersion: string; createdAt: string; }
export interface ComputationReceiptDto { id: string; receiptVersion: string; computationType: string; inputContractVersion: string; inputFingerprint: string; computationVersion: string; providerId: string; runtimeTrustLevel: 'LOCAL_VERIFIED'; resultFingerprint: string; executedAt: string; attestationState: 'NOT_AVAILABLE'; attestationReference: null; createdAt: string; }
export interface ComputationReceiptResponse { status: 'AVAILABLE'|'RECEIPT_MISSING'; assessmentId: string; receipt: ComputationReceiptDto|null; }
export interface ComputationVerificationResponse { status: 'VALID'|'INPUT_MISMATCH'|'RESULT_MISMATCH'|'UNSUPPORTED_VERSION'|'RECEIPT_MISSING'; assessmentId: string; verifiedAt: string; }
export interface GovernedActionSourceDto { policyId: string; policyCode: string; policyVersion: number; policyTitle: string; policySourceReference: string; ruleId: string; ruleCode: string; ruleDescription: string; }
export interface GovernedActionDto { actionId?: string; actionCode: string; actionVersion?: number; title: string; category: string; description: string; sourceReference?: string; classification: string; sources?: GovernedActionSourceDto[]; }
export interface GovernedActionsDto { basis: string; packageId: string; packageVersion: number; MANDATORY: GovernedActionDto[]; RECOMMENDED: GovernedActionDto[]; OPTIONAL: GovernedActionDto[]; PROHIBITED: GovernedActionDto[]; ENGINEERING_RECOMMENDED: GovernedActionDto[]; }
export interface OrpDto { id: string; versionNumber: number; status: string; urgency: string; recommendedActionCodes: unknown; temporaryMeasures: unknown; reasons: unknown; alternativeActionCodes: unknown; planVersion: string; actionPlanContractVersion?: string | null; governanceMode?: 'LEGACY'|'GOVERNED_POLICY'|'GOVERNED_ENGINEERING_NO_POLICY'; governedActions?: GovernedActionsDto | null; decisionPackage?: null | { id: string; packageVersion: number; packageContractVersion: string; preparedAt: string }; createdAt: string; }
export interface DecisionDto { id: string; decisionType: string; reason: string | null; remarks: string | null; createdAt: string; reviewer?: SafeActor | null; orp?: { id: string; versionNumber: number }; }
export interface EvidenceDto { evidenceType: string; }
export interface ExecutionTaskDto { id: string; sequenceNumber: number; sourceActionCode: string; sourceActionVersion?: number|null; sourceTemplateCode?: string|null; sourceTemplateVersion?: number|null; templateTaskKey?:string; titleSnapshot: string; descriptionSnapshot: string; isMandatory: boolean; status: string; plannedStartAt?:string|null;plannedEndAt?:string|null;startedAt?:string|null;completionSubmittedAt?:string|null;verifiedAt?:string|null; assignedTo?: SafeActor | null; completionSubmittedBy?: SafeActor | null; verifiedBy?: SafeActor | null; evidence?: EvidenceDto[];dependencies?:Array<{predecessorTask:{id:string;sequenceNumber:number;titleSnapshot:string;status:string}}> ;blockerEvents?:Array<{id:string;category:string;reason:string;blockedAt:string;resolvedAt:string|null;resolutionReason:string|null}>; }
export interface EligibleAssigneeDto { id: string; name: string; designation: string; employeeCode: string; }
export interface ExecutionPlanDto { id: string; status: string; templateVersion: string; governanceMode?:'LEGACY'|'GOVERNED'; executionContractVersion?:string|null; governedProvenance?:unknown; createdAt: string; startedAt: string | null; completedAt: string | null;plannedStartAt?:string|null;plannedEndAt?:string|null; tasks?: ExecutionTaskDto[]; }

const get = <T>(path: string, accessToken: string, signal?: AbortSignal) => apiRequest<T>(path, { accessToken, signal });
export type Page<T>={items:T[];nextCursor:string|null;limit:number;truncated?:boolean};
const asPage=<T>(value:Page<T>|T[]):Page<T>=>Array.isArray(value)?{items:value,nextCursor:null,limit:value.length}:value;
const withQuery=(path:string,query='')=>query?`${path}?${query}`:path;
export const getInspectionsPage = (caseId: string, token: string, query='', signal?: AbortSignal) => get<Page<InspectionDto>|InspectionDto[]>(withQuery(`/cases/${caseId}/inspections`,query), token, signal).then(asPage);
export const listInspections = (caseId: string, token: string, signal?: AbortSignal) => getInspectionsPage(caseId,token,'',signal).then(page=>page.items);
export const getRiskAssessmentsPage = (caseId: string, token: string, query='', signal?: AbortSignal) => get<Page<RiskAssessmentDto>|RiskAssessmentDto[]>(withQuery(`/cases/${caseId}/risk-assessments`,query), token, signal).then(asPage);
export const listRiskAssessments = (caseId: string, token: string, signal?: AbortSignal) => getRiskAssessmentsPage(caseId,token,'',signal).then(page=>page.items);
export const getComputationReceipt = (assessmentId: string, token: string, signal?: AbortSignal) => get<ComputationReceiptResponse>(`/risk-assessments/${assessmentId}/computation-receipt`,token,signal);
export const verifyComputation = (assessmentId: string, token: string, signal?: AbortSignal) => mutate<ComputationVerificationResponse>(`/risk-assessments/${assessmentId}/verify-computation`,'POST',token,undefined,signal);
export const getOrpsPage = (caseId: string, token: string, query='', signal?: AbortSignal) => get<Page<OrpDto>|OrpDto[]>(withQuery(`/cases/${caseId}/orps`,query), token, signal).then(asPage).then(page=>({...page,items:page.items.map(item=>({...item,governanceMode:item.governanceMode??'LEGACY' as const}))}));
export const listOrps = (caseId: string, token: string, signal?: AbortSignal) => getOrpsPage(caseId,token,'',signal).then(page=>page.items);
export const getOrp = (orpId: string, token: string, signal?: AbortSignal) => get<OrpDto>(`/orps/${orpId}`, token, signal);
export const getDecisionsPage = (caseId: string, token: string, query='', signal?: AbortSignal) => get<Page<DecisionDto>|DecisionDto[]>(withQuery(`/cases/${caseId}/decisions`,query), token, signal).then(asPage);
export const listDecisions = (caseId: string, token: string, signal?: AbortSignal) => getDecisionsPage(caseId,token,'',signal).then(page=>page.items);
export const getExecutionPlansPage = (caseId: string, token: string, query='', signal?: AbortSignal) => get<Page<ExecutionPlanDto>|ExecutionPlanDto[]>(withQuery(`/cases/${caseId}/execution-plans`,query), token, signal).then(asPage);
export const listExecutionPlans = (caseId: string, token: string, signal?: AbortSignal) => getExecutionPlansPage(caseId,token,'',signal).then(page=>page.items);
export const getExecutionPlan = (planId: string, token: string, signal?: AbortSignal) => get<ExecutionPlanDto>(`/execution-plans/${planId}`, token, signal);
export const getExecutionTasksPage = (planId: string, token: string, query='', signal?: AbortSignal) => get<Page<ExecutionTaskDto>|ExecutionTaskDto[]>(withQuery(`/execution-plans/${planId}/tasks`,query), token, signal).then(asPage);
export const listExecutionTasks = (planId: string, token: string, signal?: AbortSignal) => getExecutionTasksPage(planId,token,'',signal).then(page=>page.items);
function isEligibleAssignee(value: unknown): value is EligibleAssigneeDto {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return ['id', 'name', 'designation', 'employeeCode'].every((key) => typeof item[key] === 'string')
    && Object.keys(item).every((key) => ['id', 'name', 'designation', 'employeeCode'].includes(key));
}
export const listEligibleExecutionAssignees = (taskId: string, token: string, signal?: AbortSignal) =>
  get<unknown>(`/execution-tasks/${taskId}/eligible-assignees`, token, signal).then((value) => {
    const candidates=Array.isArray(value)?value:(value&&typeof value==='object'&&Array.isArray((value as any).items)?(value as any).items:null);
    if (!candidates || !candidates.every(isEligibleAssignee)) throw new Error('Invalid eligible-assignee response.');
    return {items:candidates as EligibleAssigneeDto[],truncated:!Array.isArray(value)&&Boolean((value as any).truncated)};
  });

export interface InspectionInput { caseId: string; inspectionDate: string; structuralCondition: string; crackSeverity: string; corrosionLevel: string; trafficImportance: string; hospitalRoute: boolean; weatherRisk: string; heavyRainExpected: boolean; estimatedDailyUsers?: number | null; inspectionNotes?: string; }
export type DecisionType = 'APPROVED'|'REJECTED'|'MODIFICATION_REQUESTED'|'REINSPECTION_REQUESTED'|'ESCALATED';
export interface DecisionInput { decisionType: DecisionType; reason?: string; remarks?: string; requestedChanges?: unknown; forwardToUserId?: string; }
export type TaskStatusInput = { status: 'IN_PROGRESS'|'BLOCKED'|'CANCELLED'; reason?: string;blockerCategory?:string };
export type EvidenceType = 'PHOTO_REFERENCE'|'DOCUMENT_REFERENCE'|'MEASUREMENT'|'COMPLETION_NOTE'|'INSPECTION_REPORT'|'OTHER';
export interface EvidenceInput { evidenceType: EvidenceType; description: string; referenceUrl?: string; documentReference?: string; measurementData?: unknown; capturedAt?: string; }
const mutate = <T>(path: string, method: 'POST'|'PATCH'|'DELETE', token: string, body?: unknown, signal?: AbortSignal) => apiRequest<T>(path, { method, accessToken: token, body, signal });
export const recordInspection = (input: InspectionInput, token: string, signal?: AbortSignal) => mutate<InspectionDto>('/inspections','POST',token,input,signal);
export const runRiskAssessment = (caseId: string, token: string, signal?: AbortSignal) => mutate<RiskAssessmentDto>(`/cases/${caseId}/assess-risk`,'POST',token,undefined,signal);
export const generateOrp = (caseId: string, token: string, signal?: AbortSignal) => mutate<OrpDto>(`/cases/${caseId}/orps`,'POST',token,undefined,signal);
export const recordDecision = (orpId: string, input: DecisionInput, token: string, signal?: AbortSignal) => mutate<DecisionDto>(`/orps/${orpId}/decisions`,'POST',token,input,signal);
export const createExecutionPlan = (orpId: string, token: string, signal?: AbortSignal) => mutate<ExecutionPlanDto>(`/orps/${orpId}/execution-plan`,'POST',token,undefined,signal);
export const assignExecutionTask = (taskId: string, assigneeId: string, token: string, signal?: AbortSignal) => mutate<ExecutionTaskDto>(`/execution-tasks/${taskId}/assignment`,'PATCH',token,{assigneeId},signal);
export const changeExecutionTaskStatus = (taskId: string, input: TaskStatusInput, token: string, signal?: AbortSignal) => mutate<ExecutionTaskDto>(`/execution-tasks/${taskId}/status`,'PATCH',token,input,signal);
export const recordExecutionEvidence = (taskId: string, input: EvidenceInput, token: string, signal?: AbortSignal) => mutate<unknown>(`/execution-tasks/${taskId}/evidence`,'POST',token,input,signal);
export const submitTaskCompletion = (taskId: string, completionNote: string, token: string, signal?: AbortSignal) => mutate<ExecutionTaskDto>(`/execution-tasks/${taskId}/submit-completion`,'POST',token,{completionNote},signal);
export const verifyTaskCompletion = (taskId: string, verificationNote: string, token: string, signal?: AbortSignal) => mutate<ExecutionTaskDto>(`/execution-tasks/${taskId}/verify`,'POST',token,{verificationNote},signal);
export const getScheduleAnalysis=(planId:string,token:string,signal?:AbortSignal)=>get<any>(`/execution-plans/${planId}/schedule-analysis`,token,signal);
export const updatePlanSchedule=(planId:string,body:unknown,token:string)=>mutate<ExecutionPlanDto>(`/execution-plans/${planId}/schedule`,'PATCH',token,body);
export const updateTaskSchedule=(taskId:string,body:unknown,token:string)=>mutate<ExecutionTaskDto>(`/execution-tasks/${taskId}/schedule`,'PATCH',token,body);
export const addTaskDependency=(taskId:string,predecessorTaskId:string,token:string)=>mutate<unknown>(`/execution-tasks/${taskId}/dependencies`,'POST',token,{predecessorTaskId});
export const removeTaskDependency=(taskId:string,predecessorTaskId:string,token:string)=>mutate<unknown>(`/execution-tasks/${taskId}/dependencies/${predecessorTaskId}`,'DELETE',token);
export const closeCaseWorkflow = (caseId: string, closureSummary: string, token: string, signal?: AbortSignal) => mutate<unknown>(`/cases/${caseId}/close`,'POST',token,{closureReason:'EXECUTION_VERIFIED',closureSummary},signal);
