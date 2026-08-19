import { apiRequest } from './client';

export type ReadinessOutcome = 'READY' | 'NOT_READY' | 'BLOCKED';
export type ReadinessCheckStatus = 'PASS' | 'NOT_REQUIRED' | 'NOT_APPLICABLE' | 'INCOMPLETE' | 'BLOCKED';

export interface ReadinessDto {
  caseReference: string;
  outcome: ReadinessOutcome;
  assessmentVersion: string;
  evaluatedAt: string;
  checks: Array<{
    dimension: string;
    label: string;
    status: ReadinessCheckStatus;
    reasons: Array<{ code: string; message: string }>;
    provenance: Array<{ type: string; id: string; version?: string | number }>;
  }>;
  reasons: Array<{ code: string; message: string }>;
  policySummary: { governanceEstablished: boolean; status: ReadinessCheckStatus };
  governance: { readOnly: boolean; caseMutated: boolean; approvalGranted: boolean; officerJudgmentRequired: boolean };
}

export function getCaseReadiness(caseId: string, accessToken: string, signal?: AbortSignal) {
  return apiRequest<ReadinessDto>(`cases/${encodeURIComponent(caseId)}/readiness`, { accessToken, signal });
}
