import { apiRequest } from './client';
import type { IntelligenceSnapshot } from './intelligence.api';

export interface DecisionPackageDto {
  id: string; caseId: string; packageVersion: number; packageContractVersion: string; status: 'PREPARED' | 'SUPERSEDED';
  preparedAt: string; createdAt: string; reused: boolean;
  preparedBy: { name: string; employeeCode: string; designation: string };
  caseContext: any; inspection: any; riskAssessment: any; readiness: any;
  policyGovernance: { state: string; message?: string; rules: any[] };
  governedActions: Record<'MANDATORY' | 'RECOMMENDED' | 'OPTIONAL' | 'PROHIBITED', Array<{ actionId: string; actionCode: string; actionVersion: number; title: string; category: string; description: string; sourceReference: string; enforcementClassification: string }>>;
  humanReviewBoundary: { preparedForHumanReview: boolean; humanDecision: boolean; executionAuthorized: boolean; officerRemainsResponsible: boolean };
  intelligence?: IntelligenceSnapshot | null;
}

export interface DecisionPackagePage { items:DecisionPackageDto[]; nextCursor:string|null; limit:number }
export function getDecisionPackagesPage(caseId:string,token:string,query='',signal?:AbortSignal){const suffix=query?`?${query}`:'';return apiRequest<DecisionPackagePage|DecisionPackageDto[]>(`cases/${encodeURIComponent(caseId)}/decision-packages${suffix}`,{accessToken:token,signal}).then(value=>Array.isArray(value)?{items:value,nextCursor:null,limit:value.length}:value)}
export function listDecisionPackages(caseId: string, token: string, signal?: AbortSignal) { return getDecisionPackagesPage(caseId,token,'',signal).then(value=>value.items); }
export function prepareDecisionPackage(caseId: string, token: string) { return apiRequest<DecisionPackageDto>(`cases/${encodeURIComponent(caseId)}/decision-packages`, { accessToken: token, method: 'POST', body: {} }); }
