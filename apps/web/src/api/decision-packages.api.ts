import { apiRequest } from './client';

export interface DecisionPackageDto {
  id: string; caseId: string; packageVersion: number; packageContractVersion: string; status: 'PREPARED' | 'SUPERSEDED';
  preparedAt: string; createdAt: string; reused: boolean;
  preparedBy: { name: string; employeeCode: string; designation: string };
  caseContext: any; inspection: any; riskAssessment: any; readiness: any;
  policyGovernance: { state: string; message?: string; rules: any[] };
  governedActions: Record<'MANDATORY' | 'RECOMMENDED' | 'OPTIONAL' | 'PROHIBITED', Array<{ actionId: string; actionCode: string; actionVersion: number; title: string; category: string; description: string; sourceReference: string; enforcementClassification: string }>>;
  humanReviewBoundary: { preparedForHumanReview: boolean; humanDecision: boolean; executionAuthorized: boolean; officerRemainsResponsible: boolean };
}

export function listDecisionPackages(caseId: string, token: string, signal?: AbortSignal) { return apiRequest<DecisionPackageDto[]>(`cases/${encodeURIComponent(caseId)}/decision-packages`, { accessToken: token, signal }); }
export function prepareDecisionPackage(caseId: string, token: string) { return apiRequest<DecisionPackageDto>(`cases/${encodeURIComponent(caseId)}/decision-packages`, { accessToken: token, method: 'POST', body: {} }); }
