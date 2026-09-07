import { describe, expect, it } from 'vitest';
import { deriveAssetAttention } from '../src/modules/assets/asset-attention.calculations';
import {
  ASSET_ATTENTION_CALCULATION_VERSION, ASSET_ATTENTION_CONTRACT_VERSION, attentionCategories, attentionStates,
  type AssetAttentionInput, type AttentionCaseInput, type AttentionTaskInput
} from '../src/modules/assets/asset-attention.contracts';
import { describeHistory } from '../src/modules/assets/asset-evidence-baseline.calculations';
import type { BaselineObservation } from '../src/modules/assets/asset-evidence-baseline.contracts';

const now = new Date('2026-09-07T00:00:00.000Z');
function observation(id: string, date: string, changes: Partial<BaselineObservation> = {}): BaselineObservation {
  return { inspectionId: id, caseId: `case-${id}`, inspectionDate: date, structuralCondition: 'FAIR', crackSeverity: 'MINOR', corrosionLevel: 'LOW', assessment: { id: `risk-${id}`, inspectionId: id, assessmentVersion: 'ODYSSEY_RISK_V1', riskScore: 30 }, ...changes };
}
function activeCase(changes: Partial<AttentionCaseInput> = {}): AttentionCaseInput {
  return { id: 'case-1', status: 'ORP_READY', riskLevel: 'VERY_HIGH', priorityLevel: 'CRITICAL', emergencyFlag: false, currentInspectionId: 'inspection-2', latestAssessment: { id: 'risk-2', inspectionId: 'inspection-2', assessmentVersion: 'ODYSSEY_RISK_V1', riskLevel: 'VERY_HIGH', priorityLevel: 'CRITICAL' }, activeEstimate: { id: 'estimate-1', estimatedDurationDays: 10, valid: true }, ...changes };
}
function task(changes: Partial<AttentionTaskInput> = {}): AttentionTaskInput {
  return { id: 'task-1', caseId: 'case-1', status: 'IN_PROGRESS', plannedEndAt: '2026-09-10T00:00:00.000Z', completionSubmittedAt: null, verifiedAt: null, evidenceRequired: false, evidenceCount: 0, openBlockerIds: [], unmetDependencyIds: [], ...changes };
}
function base(changes: Partial<AssetAttentionInput> = {}): AssetAttentionInput {
  const rows = [observation('inspection-1', '2026-08-01T00:00:00.000Z'), observation('inspection-2', '2026-09-01T00:00:00.000Z')];
  return { assetId: 'asset-1', baselineContractVersion: 'ODYSSEY_ASSET_EVIDENCE_BASELINE_V1', baselineCalculationVersion: 'ODYSSEY_ASSET_EVIDENCE_BASELINE_RULES_V1', cases: [activeCase()], totalInspectionCount: 2, history: describeHistory(rows, 2, now), evidenceTimestamps: ['2026-09-02T00:00:00.000Z'], tasks: [task()], publicReports: [], externalObservations: [], linkMismatchIds: [], terminalTaskOpenBlockerIds: [], closureMismatchCaseIds: [], sourceSetFingerprint: 'sha256:test', sourceReferencesTruncated: false, ...changes };
}
const category = (input: AssetAttentionInput, name: typeof attentionCategories[number]) => deriveAssetAttention(input, now).categories.find(item => item.category === name)!;

describe('ODYSSEY scoped Asset attention contract', () => {
  it('publishes the controlled contract, all categories and states without a score or rank', () => {
    const value = deriveAssetAttention(base(), now);
    expect(value.contractVersion).toBe(ASSET_ATTENTION_CONTRACT_VERSION);
    expect(value.calculationVersion).toBe(ASSET_ATTENTION_CALCULATION_VERSION);
    expect(value.categories.map(item => item.category)).toEqual(attentionCategories);
    expect(attentionStates).toEqual(['PRESENT', 'ABSENT', 'UNKNOWN', 'INVALID', 'NOT_COMPARABLE', 'NOT_APPLICABLE', 'CONFLICT']);
    expect(JSON.stringify(value)).not.toMatch(/attentionScore|ranking|failureProbability/i);
  });

  it('retains each active Case independently and calls heterogeneity context, not conflict', () => {
    const input = base({ cases: [activeCase(), activeCase({ id: 'case-2', riskLevel: 'LOW', priorityLevel: 'LOW', currentInspectionId: null, latestAssessment: null })] });
    const authority = category(input, 'AUTHORITATIVE_CASE_CONTEXT');
    expect(authority.signals.filter(item => item.signalCode === 'ACTIVE_CASE_CONTEXT_PRESENT')).toHaveLength(2);
    expect(authority.signals).toContainEqual(expect.objectContaining({ signalCode: 'HETEROGENEOUS_CASE_CONTEXT', state: 'PRESENT' }));
    expect(category(input, 'DATA_CONSISTENCY_CONFLICT').state).toBe('ABSENT');
  });

  it('preserves unknown and invalid Case context instead of treating either as absence', () => {
    expect(category(base({ cases: [activeCase({ riskLevel: null })] }), 'AUTHORITATIVE_CASE_CONTEXT').state).toBe('UNKNOWN');
    expect(category(base({ cases: [activeCase({ priorityLevel: 'URGENT' })] }), 'AUTHORITATIVE_CASE_CONTEXT').state).toBe('INVALID');
    expect(category(base({ cases: [] }), 'AUTHORITATIVE_CASE_CONTEXT').state).toBe('NOT_APPLICABLE');
  });

  it('describes worsening, mixed and unchanged observations without a threshold', () => {
    const history = (condition: string, crack: string) => describeHistory([observation('a', '2026-08-01T00:00:00Z'), observation('b', '2026-09-01T00:00:00Z', { structuralCondition: condition, crackSeverity: crack })], 2, now);
    expect(category(base({ history: history('POOR', 'MINOR') }), 'OBSERVED_CONDITION_CHANGE').state).toBe('PRESENT');
    expect(category(base({ history: history('POOR', 'NONE') }), 'OBSERVED_CONDITION_CHANGE').signals).toContainEqual(expect.objectContaining({ signalCode: 'OBSERVED_MIXED_CHANGE' }));
    expect(category(base({ history: history('FAIR', 'MINOR') }), 'OBSERVED_CONDITION_CHANGE').signals).toContainEqual(expect.objectContaining({ signalCode: 'NO_OBSERVED_WORSENING', state: 'ABSENT' }));
  });

  it('compares assessment scores only within a supported matching version', () => {
    const earlier = observation('a', '2026-08-01T00:00:00Z');
    const later = observation('b', '2026-09-01T00:00:00Z'); later.assessment!.riskScore = 77;
    expect(category(base({ history: describeHistory([earlier, later], 2, now) }), 'OBSERVED_CONDITION_CHANGE').signals).toContainEqual(expect.objectContaining({ signalCode: 'OBSERVED_RISK_INCREASE', state: 'PRESENT' }));
    later.assessment!.assessmentVersion = 'ODYSSEY_RISK_V2';
    expect(category(base({ history: describeHistory([earlier, later], 2, now) }), 'OBSERVED_CONDITION_CHANGE').signals).toContainEqual(expect.objectContaining({ signalCode: 'RISK_CHANGE_NOT_COMPARABLE', state: 'NOT_COMPARABLE' }));
  });

  it('keeps no-inspection, insufficient, equal-time and malformed history explicit', () => {
    expect(category(base({ totalInspectionCount: 0, history: describeHistory([], 0, now) }), 'OBSERVED_CONDITION_CHANGE').state).toBe('UNKNOWN');
    expect(category(base({ totalInspectionCount: 1, history: describeHistory([observation('a', '2026-08-01T00:00:00Z')], 1, now) }), 'OBSERVED_CONDITION_CHANGE').state).toBe('NOT_COMPARABLE');
    const equal = describeHistory([observation('a', '2026-08-01T00:00:00Z'), observation('b', '2026-08-01T00:00:00Z')], 2, now);
    expect(category(base({ history: equal }), 'OBSERVED_CONDITION_CHANGE').state).toBe('NOT_COMPARABLE');
    expect(category(base({ history: describeHistory([observation('a', 'bad')], 1, now) }), 'OBSERVED_CONDITION_CHANGE').state).toBe('INVALID');
  });

  it('reports coverage gaps and retains missing, future and invalid evidence times', () => {
    const input = base({ cases: [], totalInspectionCount: 0, history: describeHistory([], 0, now), evidenceTimestamps: [null, '2027-01-01T00:00:00Z', 'bad'], tasks: [task({ evidenceRequired: true })] });
    const value = category(input, 'EVIDENCE_COVERAGE_GAP');
    expect(value.state).toBe('INVALID');
    expect(value.signals.map(item => item.signalCode)).toEqual(expect.arrayContaining(['NO_ACTIVE_CASE', 'NO_INSPECTION_EVIDENCE', 'EVIDENCE_TIMESTAMP_UNKNOWN', 'EVIDENCE_TIMESTAMP_INVALID', 'REQUIRED_EVIDENCE_MISSING']));
  });

  it('detects blockers, dependencies, evidence and verification gaps while preserving raw task timing', () => {
    const input = base({ tasks: [task({ plannedEndAt: '2026-09-01T00:00:00Z', openBlockerIds: ['block-1'], unmetDependencyIds: ['task-0'], evidenceRequired: true }), task({ id: 'task-2', completionSubmittedAt: '2026-09-05T00:00:00Z' })] });
    expect(category(input, 'RECORDED_OPERATIONAL_EXCEPTION').signals.map(item => item.signalCode)).toEqual(expect.arrayContaining(['OPEN_BLOCKER', 'UNMET_DEPENDENCY', 'WORK_PAST_RECORDED_PLAN', 'AWAITING_VERIFICATION']));
    expect(category(input, 'EVIDENCE_COVERAGE_GAP').signals).toContainEqual(expect.objectContaining({ signalCode: 'REQUIRED_EVIDENCE_MISSING' }));
  });

  it('does not turn a future plan into an exception and keeps missing/invalid timing distinct', () => {
    expect(category(base(), 'RECORDED_OPERATIONAL_EXCEPTION').state).toBe('ABSENT');
    expect(category(base({ tasks: [task({ plannedEndAt: null })] }), 'RECORDED_OPERATIONAL_EXCEPTION').state).toBe('UNKNOWN');
    expect(category(base({ tasks: [task({ plannedEndAt: 'bad' })] }), 'RECORDED_OPERATIONAL_EXCEPTION').state).toBe('INVALID');
    expect(category(base({ tasks: [] }), 'RECORDED_OPERATIONAL_EXCEPTION').state).toBe('NOT_APPLICABLE');
  });

  it('derives planning gaps per Case without inventing an estimate', () => {
    expect(category(base({ cases: [activeCase({ activeEstimate: null })] }), 'PLANNING_GAP').state).toBe('PRESENT');
    expect(category(base({ cases: [activeCase({ activeEstimate: { id: 'e', estimatedDurationDays: null, valid: true } })] }), 'PLANNING_GAP').state).toBe('UNKNOWN');
    expect(category(base({ cases: [activeCase({ activeEstimate: { id: 'e', estimatedDurationDays: 5, valid: false } })] }), 'PLANNING_GAP').state).toBe('INVALID');
    expect(category(base(), 'PLANNING_GAP').state).toBe('ABSENT');
    expect(category(base({ cases: [] }), 'PLANNING_GAP').state).toBe('NOT_APPLICABLE');
  });

  it('keeps Public Reports unverified and preserves raw age, missing and future timestamps', () => {
    expect(category(base(), 'UNVERIFIED_PUBLIC_SIGNAL').state).toBe('NOT_APPLICABLE');
    const valid = category(base({ publicReports: [{ id: 'report-1', submittedAt: '2026-09-06T00:00:00Z' }] }), 'UNVERIFIED_PUBLIC_SIGNAL');
    expect(valid.signals[0]).toMatchObject({ state: 'PRESENT', evidenceReferences: [{ ageMilliseconds: 86_400_000 }] });
    expect(category(base({ publicReports: [{ id: 'r', submittedAt: null }] }), 'UNVERIFIED_PUBLIC_SIGNAL').state).toBe('UNKNOWN');
    expect(category(base({ publicReports: [{ id: 'r', submittedAt: '2027-01-01T00:00:00Z' }] }), 'UNVERIFIED_PUBLIC_SIGNAL').state).toBe('INVALID');
  });

  it('accepts only governed external context and preserves source versions', () => {
    const valid = { id: 'obs-1', observedAt: '2026-09-06T00:00:00Z', sourceId: 'source-1', sourceVersion: '2', schemaVersion: '1', qualityState: 'VALID', validationState: 'ACCEPTED', sourceActive: true };
    expect(category(base(), 'GOVERNED_EXTERNAL_CONTEXT').state).toBe('NOT_APPLICABLE');
    const present = category(base({ externalObservations: [valid] }), 'GOVERNED_EXTERNAL_CONTEXT');
    expect(present.state).toBe('PRESENT'); expect(present.signals[0].evidenceReferences.map(item => item.version)).toEqual(['2/1', '2']);
    expect(category(base({ externalObservations: [{ ...valid, sourceActive: false }] }), 'GOVERNED_EXTERNAL_CONTEXT').state).toBe('UNKNOWN');
    expect(category(base({ externalObservations: [{ ...valid, observedAt: 'bad' }] }), 'GOVERNED_EXTERNAL_CONTEXT').state).toBe('INVALID');
  });

  it('distinguishes genuine consistency conflicts from heterogeneous context', () => {
    const mismatch = activeCase({ riskLevel: 'LOW' });
    expect(category(base({ cases: [mismatch] }), 'DATA_CONSISTENCY_CONFLICT').signals).toContainEqual(expect.objectContaining({ signalCode: 'CASE_ASSESSMENT_PROJECTION_MISMATCH', state: 'CONFLICT' }));
    const all = category(base({ linkMismatchIds: ['case-x'], terminalTaskOpenBlockerIds: ['task-x'], closureMismatchCaseIds: ['case-y'] }), 'DATA_CONSISTENCY_CONFLICT');
    expect(all.state).toBe('CONFLICT'); expect(all.signals).toHaveLength(3);
  });

  it('discloses history and evidence-reference truncation', () => {
    const many = Array.from({ length: 25 }, (_, index) => `block-${index}`);
    const value = deriveAssetAttention(base({ tasks: [task({ openBlockerIds: many })], sourceReferencesTruncated: true }), now);
    const item = category(base({ tasks: [task({ openBlockerIds: many })] }), 'RECORDED_OPERATIONAL_EXCEPTION').signals.find(entry => entry.signalCode === 'OPEN_BLOCKER')!;
    expect(item.evidenceReferences).toHaveLength(20); expect(item.referencesTruncated).toBe(true);
    expect(value.provenance).toMatchObject({ sourceSetFingerprint: 'sha256:test', sourceReferencesTruncated: true });
    expect(value.categories.every(entry => entry.referencesTruncated)).toBe(true);
  });

  it('states its authority boundary and does not mutate inputs', () => {
    const input = base(), before = JSON.stringify(input), value = deriveAssetAttention(input, now);
    expect(JSON.stringify(input)).toBe(before);
    expect(value.authority).toMatchObject({ classification: 'DESCRIPTIVE_DECISION_SUPPORT', mutatesAuthoritativeRecords: false });
    expect(value.authority.disclaimers.join(' ')).toMatch(/not Case priority/i);
    expect(value.authority.disclaimers.join(' ')).toMatch(/rank, score, prediction or failure probability/i);
    expect(value.authority.disclaimers.join(' ')).toMatch(/Unknown or conflicting evidence is never treated as low risk/i);
  });

  it('rejects an invalid reference clock', () => {
    expect(() => deriveAssetAttention(base(), new Date(NaN))).toThrow('ATTENTION_AS_OF_INVALID');
  });
});
