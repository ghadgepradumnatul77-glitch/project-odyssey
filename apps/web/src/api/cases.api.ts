import { apiRequest } from './client';

export type CaseStatus = 'NEW' | 'INSPECTION_REQUIRED' | 'INSPECTION_IN_PROGRESS' | 'UNDER_ANALYSIS' | 'ORP_READY' | 'UNDER_REVIEW' | 'APPROVED' | 'EXECUTION' | 'VERIFICATION' | 'CLOSED' | 'CANCELLED';
export type RiskLevel = 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'CRITICAL';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' | 'CRITICAL';

export interface OrganizationRef { id: string; name: string; code?: string; type?: string; }
export interface AssetSummary { id: string; assetCode: string; name: string; assetType: string; departmentId: string; jurisdictionId: string; latitude?: number | string | null; longitude?: number | string | null; department: OrganizationRef; jurisdiction: OrganizationRef; }
export interface CaseSummary {
  id: string; caseNumber: string; title: string; description: string | null; status: CaseStatus;
  riskLevel: RiskLevel | null; priorityLevel: PriorityLevel | null; emergencyFlag: boolean;
  createdAt: string; updatedAt: string; closedAt: string | null; asset: AssetSummary;
  sourcePublicReport?: { id: string; reportNumber: string } | null;
}
export interface Page<T>{items:T[];nextCursor:string|null;limit:number;truncated?:boolean}

const normalizePage = <T>(value: Page<T> | T[]): Page<T> => Array.isArray(value)
  ? { items: value, nextCursor: null, limit: value.length }
  : value;

export function getCasesPage(accessToken: string, query = '', signal?: AbortSignal) {
  return apiRequest<Page<CaseSummary>|CaseSummary[]>(`/cases${query ? `?${query}` : ''}`, { accessToken, signal }).then(normalizePage);
}

export function listCases(accessToken: string, signal?: AbortSignal) {
  return getCasesPage(accessToken, '', signal).then((page) => page.items);
}

export const listMapCases = (accessToken: string, signal?: AbortSignal) => getCasesPage(accessToken, 'map=true', signal);
