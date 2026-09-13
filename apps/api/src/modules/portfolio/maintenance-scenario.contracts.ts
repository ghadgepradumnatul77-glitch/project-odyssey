export const MAINTENANCE_CONTRACT_VERSION = 'ODYSSEY_MAINTENANCE_ENVELOPE_V1';
export const MAINTENANCE_CALCULATION_VERSION = 'ODYSSEY_MAINTENANCE_GREEDY_V1';
export const MAX_MAINTENANCE_ENVELOPES = 5;
export const MAX_MAINTENANCE_CASES = 10000;
export const MAX_MAINTENANCE_MINOR = '9000000000000000';
export const maintenanceResources = ['GENERAL_CREW', 'STRUCTURAL_ENGINEER', 'HEAVY_EQUIPMENT', 'TRAFFIC_CONTROL', 'ELECTRICAL_CREW', 'WATER_WORKS_CREW', 'OTHER'] as const;
export type MaintenanceResource = typeof maintenanceResources[number];
export interface ResourceDeclaration { category: MaintenanceResource; quantity: number | null; unit: 'UNIT_DAYS' }
export const maintenanceStates = ['FITS_DECLARED_ENVELOPE', 'CONSTRAINT_EXCEEDED', 'INSUFFICIENT_DATA', 'INVALID_DATA', 'OUT_OF_SCOPE'] as const;
export type MaintenanceState = typeof maintenanceStates[number];
export const maintenanceReasons = [
  'OUTSIDE_AUTHORIZED_SCOPE', 'TERMINAL_CASE', 'CASE_CONTEXT_MISSING', 'CASE_CONTEXT_INVALID',
  'ESTIMATE_MISSING', 'MULTIPLE_ACTIVE_ESTIMATES', 'ESTIMATE_INVALID', 'RESOURCE_COMPLETENESS_UNKNOWN',
  'RESOURCE_QUANTITY_UNKNOWN', 'CAPACITY_UNSPECIFIED', 'BUDGET_UNKNOWN', 'COST_UNKNOWN', 'ENVELOPE_INVALID',
  'DURATION_UNKNOWN', 'BUDGET_EXCEEDED', 'RESOURCE_CAPACITY_EXCEEDED', 'DURATION_CEILING_EXCEEDED', 'HYPOTHETICAL_FIT'
] as const;
export type MaintenanceReason = typeof maintenanceReasons[number];
/** Supplied by a future scoped loader, never used as an authorization decision itself. */
export interface MaintenanceCase {
  caseId: string; assetId: string; authorized: boolean; status: string;
  priorityLevel: string | null; riskLevel: string | null;
  emergencyFlag: boolean | null; hospitalRoute: boolean | null; createdAt: string;
  estimates: unknown[];
}
/** Costs are canonical integer minor-unit strings. Null explicitly means unknown. */
export interface MaintenanceEstimate {
  id: string; estimateVersion: number; status: 'ACTIVE' | 'SUPERSEDED'; currency: string;
  estimatedCostMinor: string | null; estimatedDurationDays: number | null;
  resourceRequirements: ResourceDeclaration[]; resourcesComplete: boolean | null;
}
export interface MaintenanceEnvelope {
  id: string; currency: string; budgetMinor: string | null;
  resourceCapacities: ResourceDeclaration[];
  perWorkDurationCeilingDays?: number | null;
}
export interface MaintenanceSnapshot { asOf: string; cases: MaintenanceCase[] }
export interface MaintenanceCaseResult {
  caseId: string; assetId: string; estimateId: string | null; estimateVersion: number | null;
  estimatedCostMinor: string | null; estimatedDurationDays: number | null; resourcesComplete: boolean | null;
  state: MaintenanceState; reasonCodes: MaintenanceReason[];
}
export interface MaintenanceComparison {
  contractVersion: typeof MAINTENANCE_CONTRACT_VERSION;
  calculationVersion: typeof MAINTENANCE_CALCULATION_VERSION;
  inputFingerprint: string;
  envelopes: {
    envelopeId: string; calculationFingerprint: string; reasonCodes: MaintenanceReason[];
    cases: MaintenanceCaseResult[]; remainingBudgetMinor: string | null;
    remainingResources: Record<MaintenanceResource, number | null>;
  }[];
  authority: { hypotheticalOnly: true; authorizesExpenditure: false; mutatesWorkflow: false; optimized: false; scheduleFeasibilityEstablished: false };
  disclosures: string[];
}
