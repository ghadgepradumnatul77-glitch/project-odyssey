export const OUTCOME_CONTRACT_VERSION = 'ODYSSEY_RECORDED_OUTCOMES_V1';
export const OUTCOME_CALCULATION_VERSION = 'ODYSSEY_RECORDED_OUTCOME_RULES_V1';
export type OutcomeState = 'PRESENT' | 'UNKNOWN' | 'INVALID' | 'NOT_COMPARABLE' | 'NOT_APPLICABLE';
export type OutcomeReason = 'EVIDENCE_MISSING' | 'TIMESTAMP_INVALID' | 'FUTURE_TIMESTAMP' | 'CHRONOLOGY_REVERSED'
  | 'PAIR_AMBIGUOUS' | 'PAIR_REQUIRED' | 'SOURCE_MISMATCH' | 'DUPLICATE_SOURCE' | 'EQUAL_OBSERVATION_TIMES'
  | 'CATEGORY_INVALID' | 'VERSION_INCOMPATIBLE' | 'VALUE_INVALID' | 'STATUS_INCONSISTENT' | 'IDENTITY_INCONSISTENT'
  | 'ZERO_ELIGIBLE' | 'UNFINISHED' | 'INCOMPLETE_POPULATION' | 'LINKAGE_AMBIGUOUS' | 'WINDOW_INCOMPLETE';
export interface OutcomeContext {
  asOf: string;
  cohortId: string;
  window: { start: string; end: string };
}
export interface OutcomeCounts { numerator: number; denominator: number; unknown: number; invalid: number; excluded: number }
export interface OutcomeMetric<T> {
  state: OutcomeState; value: T | null; reasonCodes: OutcomeReason[];
  counts: OutcomeCounts | null;
  sourceIds: string[]; sourceFingerprint: string;
  asOf: string; cohortId: string; window: OutcomeContext['window']; comparisonRule: string;
  contractVersion: typeof OUTCOME_CONTRACT_VERSION; calculationVersion: typeof OUTCOME_CALCULATION_VERSION;
  engineVersions: string[]; templateVersions: string[];
  authority: { descriptiveOnly: true; establishesCausation: false; mutatesWorkflow: false };
}
export interface OutcomeInspection {
  id: string; assetId: string; caseId: string; observedAt: string | null;
  structuralCondition: string | null; crackSeverity: string | null; corrosionLevel: string | null;
}
export interface OutcomeAssessment {
  id: string; inspectionId: string; caseId: string; recordedAt: string | null;
  version: string | null; score: number | null; riskLevel: string | null; priorityLevel: string | null;
}
export interface OutcomePair {
  selection: 'EXPLICIT' | 'AMBIGUOUS'; before: OutcomeInspection | null; after: OutcomeInspection | null;
}
export interface OutcomeTask {
  id: string; planId: string; templateVersion: string | null; status: string;
  mandatory: boolean | null; verificationRequired: boolean | null; evidenceRequired: boolean | null;
  assignedToId: string | null; submittedById: string | null; verifiedById: string | null;
  startedAt: string | null; submittedAt: string | null; verifiedAt: string | null;
  evidence: { id: string; taskId: string; submittedAt: string | null }[] | null;
}
export interface OutcomeTaskPopulation { planId: string; complete: boolean; tasks: OutcomeTask[] }
export interface OutcomeClosure {
  caseId: string; caseStatus: string; caseCreatedAt: string | null; closedAt: string | null;
  record: null | { id: string; caseId: string; planId: string; recordedAt: string | null; reason: string };
  plan: null | { id: string; caseId: string; status: string; completedAt: string | null };
}
export interface OutcomeDurationLink {
  linkage: 'EXPLICIT_SAME_WORK' | 'AMBIGUOUS'; caseId: string;
  estimate: null | { id: string; caseId: string; version: number; preparedAt: string | null; durationDays: number | null; provenanceFingerprint: string | null };
  plan: null | { id: string; caseId: string; templateVersion: string | null; startedAt: string | null; completedAt: string | null };
}
