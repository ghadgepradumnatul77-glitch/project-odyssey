/** Pure projection contracts. These types grant no operational authority. */
export const ASSET_EVIDENCE_BASELINE_VERSION = 'ODYSSEY_ASSET_EVIDENCE_BASELINE_V1';
export const ASSET_EVIDENCE_CALCULATION_VERSION = 'ODYSSEY_ASSET_EVIDENCE_CALCULATIONS_V1';
export const BASELINE_HISTORY_LIMIT = 100;

export const evidenceStates = ['PRESENT', 'MISSING', 'INVALID', 'NOT_COMPARABLE', 'NOT_APPLICABLE'] as const;
export type EvidenceState = typeof evidenceStates[number];
export const baselineReasonCodes = [
  'EVIDENCE_ABSENT', 'INVALID_VALUE', 'TIMESTAMP_INVALID', 'TIMESTAMP_IN_FUTURE',
  'CHRONOLOGY_REVERSED', 'EQUAL_OBSERVATION_TIMES', 'INSUFFICIENT_HISTORY',
  'UNKNOWN_CONDITION_CATEGORY', 'ASSESSMENT_VERSION_MISSING', 'ASSESSMENT_VERSION_MISMATCH',
  'ASSESSMENT_VERSION_UNSUPPORTED', 'ASSESSMENT_SOURCE_MISMATCH', 'RISK_SCORE_INVALID',
  'PARTIAL_COMPARISON', 'EMPTY_DENOMINATOR', 'INVALID_METRIC_COUNTS',
  'HISTORY_TRUNCATED', 'HISTORY_COUNT_INVALID', 'HISTORY_INPUT_INCOMPLETE',
  'DUPLICATE_INSPECTION_ID', 'NO_CASE', 'NO_INSPECTION', 'NO_ASSESSMENT',
  'EVIDENCE_LINK_MISMATCH', 'SOURCE_SET_CHANGED', 'RECORDS_NOT_PROJECTED',
  'PREDICTIVE_ELIGIBILITY_NOT_EVALUATED', 'REQUIRED_EVIDENCE_ABSENT',
  'TERMINAL_TASK_OPEN_BLOCKER', 'CLOSURE_RECORD_MISMATCH', 'SCHEDULE_INVALID'
] as const;
export type BaselineReasonCode = typeof baselineReasonCodes[number];

export type Evidence<T> =
  | { state: 'PRESENT'; value: T; reasonCodes: BaselineReasonCode[] }
  | { state: Exclude<EvidenceState, 'PRESENT'>; value: null; reasonCodes: BaselineReasonCode[] };

// Access restrictions are not missing evidence. Resolve this before exposing a section.
export type EvidenceSection<T> =
  | { availability: 'AVAILABLE'; evidence: Evidence<T> }
  | { availability: 'RESTRICTED'; evidence: null };

export type TimestampInput = Date | string | null | undefined;
export type Direction = 'WORSENING' | 'IMPROVING' | 'STABLE' | 'MIXED';
export interface BaselineAssessment {
  id: string;
  inspectionId: string;
  assessmentVersion: string | null;
  riskScore: number;
}
export interface BaselineObservation {
  inspectionId: string;
  caseId: string;
  inspectionDate: TimestampInput;
  structuralCondition: string | null;
  crackSeverity: string | null;
  corrosionLevel: string | null;
  assessment: BaselineAssessment | null;
}
export interface ConditionChange { before: string; after: string; direction: Exclude<Direction, 'MIXED'> }
export interface RiskChange {
  previousAssessmentId: string;
  latestAssessmentId: string;
  assessmentVersion: string;
  delta: number;
}
export interface ObservationComparison {
  previousInspectionId: string;
  latestInspectionId: string;
  intervalMilliseconds: Evidence<number>;
  structuralCondition: Evidence<ConditionChange>;
  crackSeverity: Evidence<ConditionChange>;
  corrosionLevel: Evidence<ConditionChange>;
  physicalTrend: Evidence<Direction>;
  riskScoreChange: Evidence<RiskChange>;
}
export interface HistoryWindow {
  totalInspectionCount: number;
  observationsAnalyzed: number;
  maximumObservations: number;
  truncated: boolean;
  selection: 'LATEST_BY_INSPECTION_DATE_THEN_ID';
  oldestInspectionDate: string | null;
  latestInspectionDate: string | null;
  sourceInspectionIds: string[];
}
export interface BaselineHistory {
  window: Evidence<HistoryWindow>;
  latestPair: Evidence<ObservationComparison>;
  windowComparison: Evidence<ObservationComparison>;
}
/** denominator includes unknown/invalid eligible records; excluded is outside it.
 * numerator counts qualifying valid records. Buckets must be disjoint. */
export interface MetricCounts { numerator: number; denominator: number; unknown: number; invalid: number; excluded: number }
export interface BaselineMetric {
  counts: Evidence<MetricCounts>;
  percentage: Evidence<number>;
}

export interface BaselineFreshness {
  population: number;
  validCount: number;
  missingCount: number;
  invalidCount: number;
  newestAgeMilliseconds: Evidence<number>;
  oldestAgeMilliseconds: Evidence<number>;
}
export interface BaselineEvidenceInventory {
  count: Evidence<number>;
  sourceIds: string[];
  sourceIdsTruncated: boolean;
  freshness: Record<string, BaselineFreshness>;
}
