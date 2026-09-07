import { evidenceAgeMilliseconds, timestamp } from './asset-evidence-baseline.calculations';
import type { Evidence, TimestampInput } from './asset-evidence-baseline.contracts';
import {
  ASSET_ATTENTION_CALCULATION_VERSION, ASSET_ATTENTION_CONTRACT_VERSION, ATTENTION_SOURCE_REFERENCE_LIMIT,
  attentionCategories, type AssetAttentionInput, type AssetAttentionProjection, type AttentionCategory,
  type AttentionEvidenceReference, type AttentionReasonCode, type AttentionSignal, type AttentionState,
  type CategoryProjection
} from './asset-attention.contracts';

const validRisk = ['VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH', 'CRITICAL'];
const validPriority = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH', 'CRITICAL'];
const terminalCase = (status: string) => status === 'CLOSED' || status === 'CANCELLED';
const terminalTask = (status: string) => status === 'VERIFIED' || status === 'CANCELLED';

function timeReference(resourceType: AttentionEvidenceReference['resourceType'], resourceId: string, value: TimestampInput, asOf: Date, extra: Partial<AttentionEvidenceReference> = {}): AttentionEvidenceReference {
  const parsed = timestamp(value), age = evidenceAgeMilliseconds(value, asOf);
  if (parsed.state === 'PRESENT' && age.state === 'PRESENT') return { resourceType, resourceId, ...extra, timestamp: new Date(parsed.value).toISOString(), timestampState: 'PRESENT', ageMilliseconds: age.value };
  return { resourceType, resourceId, ...extra, timestampState: parsed.state === 'MISSING' ? 'UNKNOWN' : 'INVALID' };
}
function signal(category: AttentionCategory, code: AttentionReasonCode, state: AttentionState, explanation: string, references: AttentionEvidenceReference[] = []): AttentionSignal {
  return { signalCode: code, category, state, reasonCodes: [code], explanation, evidenceReferences: references.slice(0, ATTENTION_SOURCE_REFERENCE_LIMIT), referencesTruncated: references.length > ATTENTION_SOURCE_REFERENCE_LIMIT };
}
const categoryState = (signals: AttentionSignal[]): AttentionState => {
  const order: AttentionState[] = ['CONFLICT', 'INVALID', 'UNKNOWN', 'NOT_COMPARABLE', 'PRESENT', 'ABSENT', 'NOT_APPLICABLE'];
  return order.find(state => signals.some(item => item.state === state)) ?? 'NOT_APPLICABLE';
};
function group(category: AttentionCategory, signals: AttentionSignal[], truncated = false): CategoryProjection {
  return { category, state: categoryState(signals), signals, signalCount: signals.length, referencesTruncated: truncated || signals.some(item => item.referencesTruncated) };
}
function historyState(value: Evidence<unknown>): AttentionState {
  return value.state === 'PRESENT' ? 'PRESENT' : value.state === 'INVALID' ? 'INVALID' : value.state === 'NOT_COMPARABLE' ? 'NOT_COMPARABLE' : value.state === 'NOT_APPLICABLE' ? 'NOT_APPLICABLE' : 'UNKNOWN';
}

export function deriveAssetAttention(input: AssetAttentionInput, asOf: Date): AssetAttentionProjection {
  if (timestamp(asOf).state !== 'PRESENT') throw new Error('ATTENTION_AS_OF_INVALID');
  const activeCases = input.cases.filter(item => !terminalCase(item.status));
  const categorySignals = new Map<AttentionCategory, AttentionSignal[]>(attentionCategories.map(category => [category, []]));
  const add = (item: AttentionSignal) => categorySignals.get(item.category)!.push(item);

  if (!activeCases.length) add(signal('AUTHORITATIVE_CASE_CONTEXT', 'NO_ACTIVE_CASE', 'NOT_APPLICABLE', 'No active Case provides authoritative risk or priority context for this Asset.'));
  for (const item of activeCases) {
    const ref = [{ resourceType: 'CASE' as const, resourceId: item.id, caseId: item.id }];
    if (item.riskLevel !== null && !validRisk.includes(item.riskLevel)) add(signal('AUTHORITATIVE_CASE_CONTEXT', 'CASE_RISK_INVALID', 'INVALID', 'The active Case contains an unrecognized authoritative risk value.', ref));
    else if (item.riskLevel === null) add(signal('AUTHORITATIVE_CASE_CONTEXT', 'CASE_RISK_UNKNOWN', 'UNKNOWN', 'Authoritative risk has not been recorded for this active Case.', ref));
    if (item.priorityLevel !== null && !validPriority.includes(item.priorityLevel)) add(signal('AUTHORITATIVE_CASE_CONTEXT', 'CASE_PRIORITY_INVALID', 'INVALID', 'The active Case contains an unrecognized authoritative priority value.', ref));
    else if (item.priorityLevel === null) add(signal('AUTHORITATIVE_CASE_CONTEXT', 'CASE_PRIORITY_UNKNOWN', 'UNKNOWN', 'Authoritative priority has not been recorded for this active Case.', ref));
    if (item.riskLevel !== null && validRisk.includes(item.riskLevel) && item.priorityLevel !== null && validPriority.includes(item.priorityLevel)) add(signal('AUTHORITATIVE_CASE_CONTEXT', 'ACTIVE_CASE_CONTEXT_PRESENT', 'PRESENT', `Active Case context records risk ${item.riskLevel} and priority ${item.priorityLevel}; these remain Case-level authoritative values.`, ref));
  }
  const contexts = new Set(activeCases.filter(item => validRisk.includes(item.riskLevel ?? '') && validPriority.includes(item.priorityLevel ?? '')).map(item => `${item.riskLevel}\u001f${item.priorityLevel}`));
  if (contexts.size > 1) add(signal('AUTHORITATIVE_CASE_CONTEXT', 'HETEROGENEOUS_CASE_CONTEXT', 'PRESENT', 'Active Cases record different risk or priority values; they remain independent Case contexts.', activeCases.map(item => ({ resourceType: 'CASE', resourceId: item.id, caseId: item.id }))));

  const pair = input.history.latestPair;
  if (!input.totalInspectionCount) add(signal('OBSERVED_CONDITION_CHANGE', 'NO_INSPECTION_EVIDENCE', 'UNKNOWN', 'No inspection evidence exists from which to describe condition change.'));
  else if (input.history.window.state === 'INVALID') add(signal('OBSERVED_CONDITION_CHANGE', 'HISTORY_INVALID', 'INVALID', 'Recorded inspection history is structurally invalid and cannot support an observed-change conclusion.'));
  else if (pair.state !== 'PRESENT') add(signal('OBSERVED_CONDITION_CHANGE', pair.state === 'INVALID' ? 'HISTORY_INVALID' : pair.reasonCodes.includes('INSUFFICIENT_HISTORY') ? 'INSUFFICIENT_HISTORY' : 'HISTORY_NOT_COMPARABLE', historyState(pair), 'Recorded inspection history cannot support a comparable observed-change conclusion.'));
  else {
    const trend = pair.value.physicalTrend;
    const refs: AttentionEvidenceReference[] = [pair.value.previousInspectionId, pair.value.latestInspectionId].map(id => ({ resourceType: 'INSPECTION', resourceId: id }));
    if (trend.state === 'PRESENT' && trend.value === 'WORSENING') add(signal('OBSERVED_CONDITION_CHANGE', 'OBSERVED_WORSENING', 'PRESENT', 'Comparable recorded condition fields worsened between the latest two inspections.', refs));
    else if (trend.state === 'PRESENT' && trend.value === 'MIXED') add(signal('OBSERVED_CONDITION_CHANGE', 'OBSERVED_MIXED_CHANGE', 'PRESENT', 'Comparable recorded condition fields changed in different directions.', refs));
    else if (trend.state === 'PRESENT') add(signal('OBSERVED_CONDITION_CHANGE', 'NO_OBSERVED_WORSENING', 'ABSENT', 'The latest comparable inspection pair does not record worsening condition fields.', refs));
    else add(signal('OBSERVED_CONDITION_CHANGE', trend.state === 'INVALID' ? 'HISTORY_INVALID' : 'HISTORY_NOT_COMPARABLE', historyState(trend), 'The latest inspection pair does not support a complete physical-condition comparison.', refs));
    const riskChange = pair.value.riskScoreChange;
    const riskRefs: AttentionEvidenceReference[] = riskChange.state === 'PRESENT'
      ? [{ resourceType: 'RISK_ASSESSMENT', resourceId: riskChange.value.previousAssessmentId, version: riskChange.value.assessmentVersion }, { resourceType: 'RISK_ASSESSMENT', resourceId: riskChange.value.latestAssessmentId, version: riskChange.value.assessmentVersion }]
      : refs;
    if (riskChange.state === 'PRESENT') add(signal('OBSERVED_CONDITION_CHANGE', riskChange.value.delta > 0 ? 'OBSERVED_RISK_INCREASE' : 'NO_OBSERVED_RISK_INCREASE', riskChange.value.delta > 0 ? 'PRESENT' : 'ABSENT', riskChange.value.delta > 0 ? 'The same-version deterministic assessment score increased between the latest two inspections.' : 'The same-version deterministic assessment score did not increase between the latest two inspections.', riskRefs));
    else if (riskChange.state === 'INVALID') add(signal('OBSERVED_CONDITION_CHANGE', 'RISK_CHANGE_INVALID', 'INVALID', 'Recorded assessment evidence is invalid and cannot support a score-change comparison.', riskRefs));
    else if (riskChange.state === 'NOT_COMPARABLE') add(signal('OBSERVED_CONDITION_CHANGE', 'RISK_CHANGE_NOT_COMPARABLE', 'NOT_COMPARABLE', 'Assessment scores are not compared unless their supported calculation versions and source lineage are comparable.', riskRefs));
    else add(signal('OBSERVED_CONDITION_CHANGE', 'RISK_CHANGE_NOT_COMPARABLE', 'UNKNOWN', 'Assessment evidence is missing and no score-change conclusion is inferred.', riskRefs));
  }

  const coverage: AttentionSignal[] = [];
  if (!input.cases.length) coverage.push(signal('EVIDENCE_COVERAGE_GAP', 'NO_ACTIVE_CASE', 'PRESENT', 'No Case is recorded for this Asset.'));
  if (!input.totalInspectionCount) coverage.push(signal('EVIDENCE_COVERAGE_GAP', 'NO_INSPECTION_EVIDENCE', 'PRESENT', 'No inspection is recorded for this Asset.'));
  if (input.totalInspectionCount && !input.cases.some(item => item.latestAssessment)) coverage.push(signal('EVIDENCE_COVERAGE_GAP', 'NO_ASSESSMENT_EVIDENCE', 'PRESENT', 'No latest assessment is available for the recorded Case evidence.'));
  const evidenceTimes = input.evidenceTimestamps.map((value, index) => timeReference('EXECUTION_EVIDENCE', `evidence-${index}`, value, asOf));
  if (evidenceTimes.some(item => item.timestampState === 'UNKNOWN')) coverage.push(signal('EVIDENCE_COVERAGE_GAP', 'EVIDENCE_TIMESTAMP_UNKNOWN', 'UNKNOWN', 'At least one evidence capture timestamp is unavailable.', evidenceTimes.filter(item => item.timestampState === 'UNKNOWN')));
  if (evidenceTimes.some(item => item.timestampState === 'INVALID')) coverage.push(signal('EVIDENCE_COVERAGE_GAP', 'EVIDENCE_TIMESTAMP_INVALID', 'INVALID', 'At least one evidence timestamp is invalid or in the future.', evidenceTimes.filter(item => item.timestampState === 'INVALID')));
  const missingEvidence = input.tasks.filter(item => item.evidenceRequired && item.status !== 'CANCELLED' && item.evidenceCount === 0);
  if (missingEvidence.length) coverage.push(signal('EVIDENCE_COVERAGE_GAP', 'REQUIRED_EVIDENCE_MISSING', 'PRESENT', 'One or more non-cancelled tasks lack required evidence.', missingEvidence.map(item => ({ resourceType: 'EXECUTION_TASK', resourceId: item.id, caseId: item.caseId }))));
  add(coverage.length ? coverage[0] : signal('EVIDENCE_COVERAGE_GAP', 'COVERAGE_COMPLETE', 'ABSENT', 'No implemented evidence-coverage gap is recorded.'));
  for (const item of coverage.slice(1)) add(item);

  const activeTasks = input.tasks.filter(item => !terminalTask(item.status));
  if (!activeTasks.length) add(signal('RECORDED_OPERATIONAL_EXCEPTION', 'NO_ACTIVE_EXECUTION_TASK', 'NOT_APPLICABLE', 'No active execution task exists for operational-exception analysis.'));
  for (const task of activeTasks) {
    const taskRef = [{ resourceType: 'EXECUTION_TASK' as const, resourceId: task.id, caseId: task.caseId }];
    if (task.openBlockerIds.length) add(signal('RECORDED_OPERATIONAL_EXCEPTION', 'OPEN_BLOCKER', 'PRESENT', 'The task has a recorded unresolved blocker.', [...taskRef, ...task.openBlockerIds.map(id => ({ resourceType: 'BLOCKER' as const, resourceId: id, caseId: task.caseId }))]));
    if (task.unmetDependencyIds.length) add(signal('RECORDED_OPERATIONAL_EXCEPTION', 'UNMET_DEPENDENCY', 'PRESENT', 'The task has a predecessor that is not verified.', [...taskRef, ...task.unmetDependencyIds.map(id => ({ resourceType: 'DEPENDENCY' as const, resourceId: id, caseId: task.caseId }))]));
    if (task.completionSubmittedAt && !task.verifiedAt) add(signal('RECORDED_OPERATIONAL_EXCEPTION', 'AWAITING_VERIFICATION', 'PRESENT', 'Completion was submitted and remains unverified.', [timeReference('EXECUTION_TASK', task.id, task.completionSubmittedAt, asOf, { caseId: task.caseId })]));
    if (!task.completionSubmittedAt) {
      const end = timestamp(task.plannedEndAt);
      if (end.state === 'PRESENT' && end.value < asOf.getTime()) add(signal('RECORDED_OPERATIONAL_EXCEPTION', 'WORK_PAST_RECORDED_PLAN', 'PRESENT', 'Incomplete work is past its recorded planned end.', [{ resourceType: 'EXECUTION_TASK', resourceId: task.id, caseId: task.caseId, timestamp: new Date(end.value).toISOString(), timestampState: 'PRESENT', ageMilliseconds: asOf.getTime() - end.value }]));
      else if (end.state === 'MISSING') add(signal('RECORDED_OPERATIONAL_EXCEPTION', 'OPERATIONAL_TIMING_UNKNOWN', 'UNKNOWN', 'The task has no recorded planned end; lateness is not inferred.', taskRef));
      else if (end.state === 'INVALID') add(signal('RECORDED_OPERATIONAL_EXCEPTION', 'OPERATIONAL_TIMING_UNKNOWN', 'INVALID', 'The recorded planned end is invalid.', [{ resourceType: 'EXECUTION_TASK', resourceId: task.id, caseId: task.caseId, timestampState: 'INVALID' }]));
    }
  }
  if (activeTasks.length && !categorySignals.get('RECORDED_OPERATIONAL_EXCEPTION')!.length) add(signal('RECORDED_OPERATIONAL_EXCEPTION', 'NO_RECORDED_OPERATIONAL_EXCEPTION', 'ABSENT', 'No implemented operational exception is recorded for active tasks.'));

  if (!activeCases.length) add(signal('PLANNING_GAP', 'NO_ACTIVE_CASE_FOR_PLANNING', 'NOT_APPLICABLE', 'No active Case is eligible for Case planning evidence.'));
  for (const item of activeCases) {
    const ref = [{ resourceType: 'CASE' as const, resourceId: item.id, caseId: item.id }];
    if (!item.activeEstimate) add(signal('PLANNING_GAP', 'ACTIVE_CASE_ESTIMATE_MISSING', 'PRESENT', 'The active Case has no active planning estimate.', ref));
    else if (!item.activeEstimate.valid) add(signal('PLANNING_GAP', 'ESTIMATE_INVALID', 'INVALID', 'The active planning estimate fails implemented structural validation.', [...ref, { resourceType: 'ESTIMATE', resourceId: item.activeEstimate.id, caseId: item.id }]));
    else if (item.activeEstimate.estimatedDurationDays === null) add(signal('PLANNING_GAP', 'ESTIMATE_DURATION_UNKNOWN', 'UNKNOWN', 'The active estimate has no recorded duration.', [...ref, { resourceType: 'ESTIMATE', resourceId: item.activeEstimate.id, caseId: item.id }]));
  }
  if (activeCases.length && !categorySignals.get('PLANNING_GAP')!.length) add(signal('PLANNING_GAP', 'PLANNING_EVIDENCE_COMPLETE', 'ABSENT', 'Every active Case has an implemented valid estimate and duration.'));

  if (!input.publicReports.length) add(signal('UNVERIFIED_PUBLIC_SIGNAL', 'NO_LINKED_PUBLIC_REPORT', 'NOT_APPLICABLE', 'No Public Report is explicitly linked to this Asset evidence.'));
  for (const report of input.publicReports) {
    const ref = timeReference('PUBLIC_REPORT', report.id, report.submittedAt, asOf);
    add(signal('UNVERIFIED_PUBLIC_SIGNAL', ref.timestampState === 'INVALID' ? 'PUBLIC_REPORT_TIMESTAMP_INVALID' : ref.timestampState === 'UNKNOWN' ? 'PUBLIC_REPORT_TIMESTAMP_UNKNOWN' : 'LINKED_PUBLIC_REPORT', ref.timestampState === 'INVALID' ? 'INVALID' : ref.timestampState === 'UNKNOWN' ? 'UNKNOWN' : 'PRESENT', ref.timestampState === 'INVALID' ? 'A linked unverified Public Report has an invalid submission timestamp.' : ref.timestampState === 'UNKNOWN' ? 'A linked unverified Public Report has no valid submission timestamp.' : 'An explicitly linked Public Report is present as an unverified contextual signal.', [ref]));
  }
  if (!input.externalObservations.length) add(signal('GOVERNED_EXTERNAL_CONTEXT', 'NO_LINKED_EXTERNAL_CONTEXT', 'NOT_APPLICABLE', 'No governed External Observation is explicitly linked to this Asset evidence.'));
  for (const observation of input.externalObservations) {
    const refs = [timeReference('EXTERNAL_OBSERVATION', observation.id, observation.observedAt, asOf, { version: `${observation.sourceVersion}/${observation.schemaVersion}` }), { resourceType: 'OBSERVATION_SOURCE' as const, resourceId: observation.sourceId, version: observation.sourceVersion }];
    if (refs[0].timestampState === 'INVALID') add(signal('GOVERNED_EXTERNAL_CONTEXT', 'EXTERNAL_CONTEXT_TIMESTAMP_INVALID', 'INVALID', 'A linked external observation has an invalid or future observation timestamp.', refs));
    else if (refs[0].timestampState === 'UNKNOWN') add(signal('GOVERNED_EXTERNAL_CONTEXT', 'EXTERNAL_CONTEXT_TIMESTAMP_UNKNOWN', 'UNKNOWN', 'A linked external observation has no valid observation timestamp.', refs));
    else if (observation.sourceActive && observation.qualityState === 'VALID' && observation.validationState === 'ACCEPTED') add(signal('GOVERNED_EXTERNAL_CONTEXT', 'ACCEPTED_EXTERNAL_CONTEXT', 'PRESENT', 'A linked observation is accepted under an active governed source; it remains contextual evidence.', refs));
    else add(signal('GOVERNED_EXTERNAL_CONTEXT', 'EXTERNAL_CONTEXT_NOT_ACCEPTED', 'UNKNOWN', 'A linked external observation is inactive, unaccepted, or has non-valid quality and is not treated as accepted context.', refs));
  }

  for (const item of activeCases) if (item.currentInspectionId && item.latestAssessment && (item.latestAssessment.inspectionId !== item.currentInspectionId || item.latestAssessment.riskLevel !== item.riskLevel || item.latestAssessment.priorityLevel !== item.priorityLevel))
    add(signal('DATA_CONSISTENCY_CONFLICT', 'CASE_ASSESSMENT_PROJECTION_MISMATCH', 'CONFLICT', 'The active Case projection differs from its referenced latest assessment lineage or values.', [{ resourceType: 'CASE', resourceId: item.id, caseId: item.id }, { resourceType: 'RISK_ASSESSMENT', resourceId: item.latestAssessment.id, caseId: item.id, version: item.latestAssessment.assessmentVersion }, { resourceType: 'INSPECTION', resourceId: item.currentInspectionId, caseId: item.id }]));
  for (const id of input.linkMismatchIds) add(signal('DATA_CONSISTENCY_CONFLICT', 'EVIDENCE_LINK_MISMATCH', 'CONFLICT', 'Evidence lineage points to inconsistent Asset or Case ownership.', [{ resourceType: 'ASSET', resourceId: input.assetId }, { resourceType: 'CASE', resourceId: id }]));
  for (const id of input.terminalTaskOpenBlockerIds) add(signal('DATA_CONSISTENCY_CONFLICT', 'TERMINAL_TASK_OPEN_BLOCKER', 'CONFLICT', 'A terminal task retains an unresolved blocker record.', [{ resourceType: 'EXECUTION_TASK', resourceId: id }]));
  for (const id of input.closureMismatchCaseIds) add(signal('DATA_CONSISTENCY_CONFLICT', 'CLOSURE_RECORD_MISMATCH', 'CONFLICT', 'Case lifecycle and closure records are inconsistent.', [{ resourceType: 'CASE', resourceId: id, caseId: id }]));
  if (!categorySignals.get('DATA_CONSISTENCY_CONFLICT')!.length) add(signal('DATA_CONSISTENCY_CONFLICT', 'NO_DATA_CONSISTENCY_CONFLICT', 'ABSENT', 'No implemented evidence consistency conflict is recorded.'));

  const historyTruncated = input.history.window.state === 'PRESENT' && input.history.window.value.truncated;
  return {
    contractVersion: ASSET_ATTENTION_CONTRACT_VERSION, calculationVersion: ASSET_ATTENTION_CALCULATION_VERSION,
    baselineContractVersion: input.baselineContractVersion, baselineCalculationVersion: input.baselineCalculationVersion,
    assetId: input.assetId, asOf: asOf.toISOString(),
    categories: attentionCategories.map(category => group(category, categorySignals.get(category)!, input.sourceReferencesTruncated || historyTruncated)),
    provenance: { sourceSetFingerprint: input.sourceSetFingerprint, history: input.history.window, sourceReferencesTruncated: input.sourceReferencesTruncated || historyTruncated },
    authority: { classification: 'DESCRIPTIVE_DECISION_SUPPORT', mutatesAuthoritativeRecords: false,
      disclaimers: ['Attention signals are not Case priority, an Asset risk level, a rank, score, prediction or failure probability.', 'Unknown or conflicting evidence is never treated as low risk.', 'Raw ages are reported without an invented freshness threshold.', 'Signals do not approve, execute, verify, close or mutate any workflow record.', 'Public Reports and external observations remain contextual and do not change authoritative risk or priority.'] }
  };
}
