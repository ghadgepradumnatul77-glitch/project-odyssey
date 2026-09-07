import type { BaselineHistory, Evidence, TimestampInput } from './asset-evidence-baseline.contracts';

export const ASSET_ATTENTION_CONTRACT_VERSION = 'ODYSSEY_SCOPED_ASSET_ATTENTION_V1';
export const ASSET_ATTENTION_CALCULATION_VERSION = 'ODYSSEY_SCOPED_ASSET_ATTENTION_RULES_V1';
export const ATTENTION_SOURCE_REFERENCE_LIMIT = 20;

export const attentionCategories = [
  'AUTHORITATIVE_CASE_CONTEXT', 'OBSERVED_CONDITION_CHANGE', 'EVIDENCE_COVERAGE_GAP',
  'RECORDED_OPERATIONAL_EXCEPTION', 'PLANNING_GAP', 'UNVERIFIED_PUBLIC_SIGNAL',
  'GOVERNED_EXTERNAL_CONTEXT', 'DATA_CONSISTENCY_CONFLICT'
] as const;
export type AttentionCategory = typeof attentionCategories[number];
export const attentionStates = ['PRESENT', 'ABSENT', 'UNKNOWN', 'INVALID', 'NOT_COMPARABLE', 'NOT_APPLICABLE', 'CONFLICT'] as const;
export type AttentionState = typeof attentionStates[number];

export const attentionReasonCodes = [
  'ACTIVE_CASE_CONTEXT_PRESENT', 'NO_ACTIVE_CASE', 'CASE_RISK_UNKNOWN', 'CASE_PRIORITY_UNKNOWN',
  'CASE_RISK_INVALID', 'CASE_PRIORITY_INVALID', 'HETEROGENEOUS_CASE_CONTEXT',
  'OBSERVED_WORSENING', 'OBSERVED_MIXED_CHANGE', 'NO_OBSERVED_WORSENING',
  'OBSERVED_RISK_INCREASE', 'NO_OBSERVED_RISK_INCREASE', 'RISK_CHANGE_NOT_COMPARABLE', 'RISK_CHANGE_INVALID',
  'NO_INSPECTION_EVIDENCE', 'INSUFFICIENT_HISTORY', 'HISTORY_NOT_COMPARABLE', 'HISTORY_INVALID',
  'HISTORY_TRUNCATED', 'NO_ASSESSMENT_EVIDENCE', 'REQUIRED_EVIDENCE_MISSING',
  'EVIDENCE_TIMESTAMP_UNKNOWN', 'EVIDENCE_TIMESTAMP_INVALID', 'COVERAGE_COMPLETE',
  'OPEN_BLOCKER', 'UNMET_DEPENDENCY', 'WORK_PAST_RECORDED_PLAN', 'AWAITING_VERIFICATION',
  'OPERATIONAL_TIMING_UNKNOWN', 'NO_ACTIVE_EXECUTION_TASK', 'NO_RECORDED_OPERATIONAL_EXCEPTION',
  'ACTIVE_CASE_ESTIMATE_MISSING', 'ESTIMATE_DURATION_UNKNOWN', 'ESTIMATE_INVALID',
  'PLANNING_EVIDENCE_COMPLETE', 'NO_ACTIVE_CASE_FOR_PLANNING',
  'LINKED_PUBLIC_REPORT', 'PUBLIC_REPORT_TIMESTAMP_UNKNOWN', 'PUBLIC_REPORT_TIMESTAMP_INVALID', 'NO_LINKED_PUBLIC_REPORT',
  'ACCEPTED_EXTERNAL_CONTEXT', 'EXTERNAL_CONTEXT_NOT_ACCEPTED', 'EXTERNAL_CONTEXT_TIMESTAMP_UNKNOWN', 'EXTERNAL_CONTEXT_TIMESTAMP_INVALID',
  'NO_LINKED_EXTERNAL_CONTEXT', 'CASE_ASSESSMENT_PROJECTION_MISMATCH', 'EVIDENCE_LINK_MISMATCH',
  'TERMINAL_TASK_OPEN_BLOCKER', 'CLOSURE_RECORD_MISMATCH', 'NO_DATA_CONSISTENCY_CONFLICT'
] as const;
export type AttentionReasonCode = typeof attentionReasonCodes[number];

export type EvidenceResourceType = 'ASSET' | 'CASE' | 'INSPECTION' | 'RISK_ASSESSMENT' | 'EXECUTION_TASK' |
  'BLOCKER' | 'DEPENDENCY' | 'EXECUTION_EVIDENCE' | 'ESTIMATE' | 'PUBLIC_REPORT' |
  'EXTERNAL_OBSERVATION' | 'OBSERVATION_SOURCE' | 'CASE_CLOSURE';
export interface AttentionEvidenceReference {
  resourceType: EvidenceResourceType;
  resourceId: string;
  caseId?: string;
  version?: string;
  timestamp?: string;
  timestampState?: AttentionState;
  ageMilliseconds?: number;
}
export interface AttentionSignal {
  signalCode: AttentionReasonCode;
  category: AttentionCategory;
  state: AttentionState;
  reasonCodes: AttentionReasonCode[];
  explanation: string;
  evidenceReferences: AttentionEvidenceReference[];
  referencesTruncated: boolean;
}
export interface CategoryProjection {
  category: AttentionCategory;
  state: AttentionState;
  signals: AttentionSignal[];
  signalCount: number;
  referencesTruncated: boolean;
}
export interface AttentionCaseInput {
  id: string; status: string; riskLevel: string | null; priorityLevel: string | null; emergencyFlag: boolean;
  currentInspectionId: string | null;
  latestAssessment: null | { id: string; inspectionId: string; assessmentVersion: string; riskLevel: string; priorityLevel: string };
  activeEstimate: null | { id: string; estimatedDurationDays: number | null; valid: boolean };
}
export interface AttentionTaskInput {
  id: string; caseId: string; status: string; plannedEndAt: TimestampInput; completionSubmittedAt: TimestampInput;
  verifiedAt: TimestampInput; evidenceRequired: boolean; evidenceCount: number;
  openBlockerIds: string[]; unmetDependencyIds: string[];
}
export interface AttentionPublicReportInput { id: string; submittedAt: TimestampInput }
export interface AttentionExternalObservationInput {
  id: string; observedAt: TimestampInput; sourceId: string; sourceVersion: string; schemaVersion: string;
  qualityState: string; validationState: string; sourceActive: boolean;
}
export interface AssetAttentionInput {
  assetId: string;
  baselineContractVersion: string;
  baselineCalculationVersion: string;
  cases: AttentionCaseInput[];
  totalInspectionCount: number;
  history: BaselineHistory;
  evidenceTimestamps: TimestampInput[];
  tasks: AttentionTaskInput[];
  publicReports: AttentionPublicReportInput[];
  externalObservations: AttentionExternalObservationInput[];
  linkMismatchIds: string[];
  terminalTaskOpenBlockerIds: string[];
  closureMismatchCaseIds: string[];
  sourceSetFingerprint: string;
  sourceReferencesTruncated: boolean;
}
export interface AssetAttentionProjection {
  contractVersion: typeof ASSET_ATTENTION_CONTRACT_VERSION;
  calculationVersion: typeof ASSET_ATTENTION_CALCULATION_VERSION;
  baselineContractVersion: string;
  baselineCalculationVersion: string;
  assetId: string;
  asOf: string;
  categories: CategoryProjection[];
  provenance: { sourceSetFingerprint: string; history: Evidence<unknown>; sourceReferencesTruncated: boolean };
  authority: {
    classification: 'DESCRIPTIVE_DECISION_SUPPORT';
    mutatesAuthoritativeRecords: false;
    disclaimers: string[];
  };
}
