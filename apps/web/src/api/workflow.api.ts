import { apiRequest } from './client';
import type { PriorityLevel, RiskLevel } from './cases.api';

export interface SafeActor { id: string; name: string; designation: string; }
export interface InspectionDto {
  id: string; inspectionDate: string; structuralCondition: string; crackSeverity: string; corrosionLevel: string;
  trafficImportance: string; hospitalRoute: boolean; weatherRisk: string; heavyRainExpected: boolean;
  estimatedDailyUsers: number | null; inspectionNotes: string | null; createdAt: string; inspector?: SafeActor | null;
}
export interface RiskAssessmentDto { id: string; riskScore: number; riskLevel: RiskLevel; priorityLevel: PriorityLevel; reasonCodes: unknown; reasons: unknown; assessmentVersion: string; createdAt: string; }
export interface GovernedActionSourceDto { policyId: string; policyCode: string; policyVersion: number; policyTitle: string; policySourceReference: string; ruleId: string; ruleCode: string; ruleDescription: string; }
export interface GovernedActionDto { actionId?: string; actionCode: string; actionVersion?: number; title: string; category: string; description: string; sourceReference?: string; classification: string; sources?: GovernedActionSourceDto[]; }
export interface GovernedActionsDto { basis: string; packageId: string; packageVersion: number; MANDATORY: GovernedActionDto[]; RECOMMENDED: GovernedActionDto[]; OPTIONAL: GovernedActionDto[]; PROHIBITED: GovernedActionDto[]; ENGINEERING_RECOMMENDED: GovernedActionDto[]; }
export interface OrpDto { id: string; versionNumber: number; status: string; urgency: string; recommendedActionCodes: unknown; temporaryMeasures: unknown; reasons: unknown; alternativeActionCodes: unknown; planVersion: string; actionPlanContractVersion?: string | null; governanceMode?: 'LEGACY'|'GOVERNED_POLICY'|'GOVERNED_ENGINEERING_NO_POLICY'; governedActions?: GovernedActionsDto | null; decisionPackage?: null | { id: string; packageVersion: number; packageContractVersion: string; preparedAt: string }; createdAt: string; }
export interface DecisionDto { id: string; decisionType: string; reason: string | null; remarks: string | null; createdAt: string; reviewer?: SafeActor | null; orp?: { id: string; versionNumber: number }; }
export interface EvidenceDto { evidenceType: string; }
export interface ExecutionTaskDto { id: string; sequenceNumber: number; sourceActionCode: string; sourceActionVersion?: number|null; sourceTemplateCode?: string|null; sourceTemplateVersion?: number|null; templateTaskKey?:string; titleSnapshot: string; descriptionSnapshot: string; isMandatory: boolean; status: string; assignedTo?: SafeActor | null; completionSubmittedBy?: SafeActor | null; verifiedBy?: SafeActor | null; evidence?: EvidenceDto[]; }
export interface ExecutionPlanDto { id: string; status: string; templateVersion: string; governanceMode?:'LEGACY'|'GOVERNED'; executionContractVersion?:string|null; governedProvenance?:unknown; createdAt: string; startedAt: string | null; completedAt: string | null; tasks?: ExecutionTaskDto[]; }

const get = <T>(path: string, accessToken: string, signal?: AbortSignal) => apiRequest<T>(path, { accessToken, signal });
export const listInspections = (caseId: string, token: string, signal?: AbortSignal) => get<InspectionDto[]>(`/cases/${caseId}/inspections`, token, signal);
export const listRiskAssessments = (caseId: string, token: string, signal?: AbortSignal) => get<RiskAssessmentDto[]>(`/cases/${caseId}/risk-assessments`, token, signal);
export const listOrps = (caseId: string, token: string, signal?: AbortSignal) => get<OrpDto[]>(`/cases/${caseId}/orps`, token, signal).then((items)=>items.map((item)=>({...item,governanceMode:item.governanceMode??'LEGACY'})));
export const getOrp = (orpId: string, token: string, signal?: AbortSignal) => get<OrpDto>(`/orps/${orpId}`, token, signal);
export const listDecisions = (caseId: string, token: string, signal?: AbortSignal) => get<DecisionDto[]>(`/cases/${caseId}/decisions`, token, signal);
export const listExecutionPlans = (caseId: string, token: string, signal?: AbortSignal) => get<ExecutionPlanDto[]>(`/cases/${caseId}/execution-plans`, token, signal);
export const getExecutionPlan = (planId: string, token: string, signal?: AbortSignal) => get<ExecutionPlanDto>(`/execution-plans/${planId}`, token, signal);
export const listExecutionTasks = (planId: string, token: string, signal?: AbortSignal) => get<ExecutionTaskDto[]>(`/execution-plans/${planId}/tasks`, token, signal);

export interface InspectionInput { caseId: string; inspectionDate: string; structuralCondition: string; crackSeverity: string; corrosionLevel: string; trafficImportance: string; hospitalRoute: boolean; weatherRisk: string; heavyRainExpected: boolean; estimatedDailyUsers?: number | null; inspectionNotes?: string; }
export type DecisionType = 'APPROVED'|'REJECTED'|'MODIFICATION_REQUESTED'|'REINSPECTION_REQUESTED'|'ESCALATED';
export interface DecisionInput { decisionType: DecisionType; reason?: string; remarks?: string; requestedChanges?: unknown; forwardToUserId?: string; }
export type TaskStatusInput = { status: 'IN_PROGRESS'|'BLOCKED'|'CANCELLED'; reason?: string };
export type EvidenceType = 'PHOTO_REFERENCE'|'DOCUMENT_REFERENCE'|'MEASUREMENT'|'COMPLETION_NOTE'|'INSPECTION_REPORT'|'OTHER';
export interface EvidenceInput { evidenceType: EvidenceType; description: string; referenceUrl?: string; documentReference?: string; measurementData?: unknown; capturedAt?: string; }
const mutate = <T>(path: string, method: 'POST'|'PATCH', token: string, body?: unknown, signal?: AbortSignal) => apiRequest<T>(path, { method, accessToken: token, body, signal });
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
export const closeCaseWorkflow = (caseId: string, closureSummary: string, token: string, signal?: AbortSignal) => mutate<unknown>(`/cases/${caseId}/close`,'POST',token,{closureReason:'EXECUTION_VERIFIED',closureSummary},signal);
