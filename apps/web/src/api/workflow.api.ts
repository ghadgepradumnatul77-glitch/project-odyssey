import { apiRequest } from './client';
import type { PriorityLevel, RiskLevel } from './cases.api';

export interface SafeActor { name: string; designation: string; }
export interface InspectionDto {
  id: string; inspectionDate: string; structuralCondition: string; crackSeverity: string; corrosionLevel: string;
  trafficImportance: string; hospitalRoute: boolean; weatherRisk: string; heavyRainExpected: boolean;
  estimatedDailyUsers: number | null; inspectionNotes: string | null; createdAt: string; inspector?: SafeActor | null;
}
export interface RiskAssessmentDto { id: string; riskScore: number; riskLevel: RiskLevel; priorityLevel: PriorityLevel; reasonCodes: unknown; reasons: unknown; assessmentVersion: string; createdAt: string; }
export interface OrpDto { id: string; versionNumber: number; status: string; urgency: string; recommendedActionCodes: unknown; temporaryMeasures: unknown; reasons: unknown; alternativeActionCodes: unknown; planVersion: string; createdAt: string; }
export interface DecisionDto { id: string; decisionType: string; reason: string | null; remarks: string | null; createdAt: string; reviewer?: SafeActor | null; orp?: { id: string; versionNumber: number }; }
export interface EvidenceDto { evidenceType: string; }
export interface ExecutionTaskDto { id: string; sequenceNumber: number; titleSnapshot: string; descriptionSnapshot: string; isMandatory: boolean; status: string; assignedTo?: SafeActor | null; completionSubmittedBy?: SafeActor | null; verifiedBy?: SafeActor | null; evidence?: EvidenceDto[]; }
export interface ExecutionPlanDto { id: string; status: string; templateVersion: string; createdAt: string; startedAt: string | null; completedAt: string | null; tasks?: ExecutionTaskDto[]; }

const get = <T>(path: string, accessToken: string, signal?: AbortSignal) => apiRequest<T>(path, { accessToken, signal });
export const listInspections = (caseId: string, token: string, signal?: AbortSignal) => get<InspectionDto[]>(`/cases/${caseId}/inspections`, token, signal);
export const listRiskAssessments = (caseId: string, token: string, signal?: AbortSignal) => get<RiskAssessmentDto[]>(`/cases/${caseId}/risk-assessments`, token, signal);
export const listOrps = (caseId: string, token: string, signal?: AbortSignal) => get<OrpDto[]>(`/cases/${caseId}/orps`, token, signal);
export const getOrp = (orpId: string, token: string, signal?: AbortSignal) => get<OrpDto>(`/orps/${orpId}`, token, signal);
export const listDecisions = (caseId: string, token: string, signal?: AbortSignal) => get<DecisionDto[]>(`/cases/${caseId}/decisions`, token, signal);
export const listExecutionPlans = (caseId: string, token: string, signal?: AbortSignal) => get<ExecutionPlanDto[]>(`/cases/${caseId}/execution-plans`, token, signal);
export const getExecutionPlan = (planId: string, token: string, signal?: AbortSignal) => get<ExecutionPlanDto>(`/execution-plans/${planId}`, token, signal);
export const listExecutionTasks = (planId: string, token: string, signal?: AbortSignal) => get<ExecutionTaskDto[]>(`/execution-plans/${planId}/tasks`, token, signal);
