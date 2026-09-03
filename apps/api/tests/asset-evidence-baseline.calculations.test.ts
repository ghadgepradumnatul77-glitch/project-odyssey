import { describe, expect, it } from 'vitest';
import { compareObservations, describeHistory, describeMetric, evidenceAgeMilliseconds, chronologyMilliseconds, timestamp, present, unavailable } from '../src/modules/assets/asset-evidence-baseline.calculations';
import { evidenceStates, type BaselineObservation } from '../src/modules/assets/asset-evidence-baseline.contracts';

const asOf = '2026-09-04T00:00:00Z';
function observation(id: string, date: string, changes: Partial<BaselineObservation> = {}): BaselineObservation {
  return { inspectionId: id, caseId: `case-${id}`, inspectionDate: date, structuralCondition: 'FAIR', crackSeverity: 'MINOR', corrosionLevel: 'LOW',
    assessment: { id: `risk-${id}`, inspectionId: id, assessmentVersion: 'ODYSSEY_RISK_V1', riskScore: 30 }, ...changes };
}
const early = () => observation('a', '2026-01-01T00:00:00Z');
const late = () => observation('b', '2026-02-01T00:00:00Z');

describe('asset evidence contract and timestamps', () => {
  it('represents all five states without treating zero or false as missing', () => {
    expect(evidenceStates).toEqual(['PRESENT', 'MISSING', 'INVALID', 'NOT_COMPARABLE', 'NOT_APPLICABLE']);
    expect(present(0).value).toBe(0); expect(present(false).value).toBe(false);
    for (const state of evidenceStates.filter(state => state !== 'PRESENT')) expect(unavailable(state, 'EVIDENCE_ABSENT')).toEqual({ state, value: null, reasonCodes: ['EVIDENCE_ABSENT'] });
  });
  it('uses the supplied clock and permits zero age', () => {
    expect(evidenceAgeMilliseconds(asOf, asOf)).toMatchObject({ state: 'PRESENT', value: 0 });
    expect(evidenceAgeMilliseconds('2026-09-03T00:00:00Z', asOf).value).toBe(86_400_000);
    expect(timestamp(new Date(asOf)).value).toBe(Date.parse(asOf));
  });
  it.each([null, undefined])('reports missing timestamp %s without a fallback', value => {
    expect(evidenceAgeMilliseconds(value, asOf).state).toBe('MISSING');
  });
  it.each(['2026-02-30T00:00:00Z', '2026-01-01', 'yesterday', '2026-01-01T25:00:00Z', new Date(NaN)])('rejects invalid or ambiguous time %s', value => {
    expect(timestamp(value).state).toBe('INVALID');
  });
  it('rejects future events and invalid reference clocks rather than clamping ages', () => {
    expect(evidenceAgeMilliseconds('2027-01-01T00:00:00Z', asOf).reasonCodes).toContain('TIMESTAMP_IN_FUTURE');
    expect(evidenceAgeMilliseconds(null, null).state).toBe('INVALID');
  });
  it('separates recording intervals from freshness and detects reversed chronology', () => {
    expect(chronologyMilliseconds('2026-01-01T00:00:00Z', '2026-01-02T00:00:00Z', asOf).value).toBe(86_400_000);
    expect(chronologyMilliseconds('2026-01-02T00:00:00Z', '2026-01-01T00:00:00Z', asOf).reasonCodes).toContain('CHRONOLOGY_REVERSED');
    expect(chronologyMilliseconds(null, '2027-01-01T00:00:00Z', asOf).state).toBe('INVALID');
  });
});

describe('observed change, not prediction', () => {
  it.each([
    ['POOR', 'MINOR', 'WORSENING'], ['GOOD', 'MINOR', 'IMPROVING'],
    ['FAIR', 'MINOR', 'STABLE'], ['POOR', 'NONE', 'MIXED']
  ])('classifies physical changes %s/%s as %s', (structuralCondition, crackSeverity, expected) => {
    expect(compareObservations(early(), { ...late(), structuralCondition, crackSeverity }, asOf).physicalTrend.value).toBe(expected);
  });
  it('keeps risk-score change separate from physical condition', () => {
    const b = late(); b.assessment!.riskScore = 77;
    const value = compareObservations(early(), b, asOf);
    expect(value.physicalTrend.value).toBe('STABLE');
    expect(value.riskScoreChange).toMatchObject({ state: 'PRESENT', value: { delta: 47, assessmentVersion: 'ODYSSEY_RISK_V1', previousAssessmentId: 'risk-a', latestAssessmentId: 'risk-b' } });
  });
  it('does not suppress invalid categories when another field is comparable', () => {
    const value = compareObservations(early(), { ...late(), corrosionLevel: 'SEVERE' }, asOf);
    expect(value.corrosionLevel).toMatchObject({ state: 'INVALID', reasonCodes: ['UNKNOWN_CONDITION_CATEGORY'] });
    expect(value.structuralCondition.state).toBe('PRESENT'); expect(value.physicalTrend.state).toBe('NOT_COMPARABLE');
  });
  it('retains missing condition fields without inventing a complete trend', () => {
    const value = compareObservations(early(), { ...late(), structuralCondition: null }, asOf);
    expect(value.structuralCondition.state).toBe('MISSING'); expect(value.physicalTrend.reasonCodes).toContain('PARTIAL_COMPARISON');
  });
  it('rejects equal observation times even with distinct IDs', () => {
    const value = compareObservations(early(), { ...late(), inspectionDate: early().inspectionDate }, asOf);
    expect(value.intervalMilliseconds.reasonCodes).toContain('EQUAL_OBSERVATION_TIMES');
    expect(value.physicalTrend.state).toBe('NOT_COMPARABLE'); expect(value.riskScoreChange.state).toBe('NOT_COMPARABLE');
  });
  it('rejects reversed, future, and duplicated sources', () => {
    expect(compareObservations(late(), early(), asOf).intervalMilliseconds.state).toBe('INVALID');
    expect(compareObservations(early(), { ...late(), inspectionDate: '2027-01-01T00:00:00Z' }, asOf).riskScoreChange.state).toBe('NOT_COMPARABLE');
    expect(compareObservations(early(), { ...late(), inspectionId: 'a' }, asOf).intervalMilliseconds.reasonCodes).toContain('DUPLICATE_INSPECTION_ID');
  });
  it.each([
    ['ODYSSEY_RISK_V2', 'ASSESSMENT_VERSION_MISMATCH'], [null, 'ASSESSMENT_VERSION_MISSING']
  ])('does not compare risk against version %s', (version, reason) => {
    const b = late(); b.assessment!.assessmentVersion = version;
    expect(compareObservations(early(), b, asOf).riskScoreChange).toMatchObject({ state: 'NOT_COMPARABLE', reasonCodes: [reason] });
  });
  it('rejects identical but unsupported versions', () => {
    const a = early(), b = late(); a.assessment!.assessmentVersion = b.assessment!.assessmentVersion = 'UNKNOWN';
    expect(compareObservations(a, b, asOf).riskScoreChange.reasonCodes).toContain('ASSESSMENT_VERSION_UNSUPPORTED');
  });
  it('requires exact assessment-inspection pairing', () => {
    const b = late(); b.assessment!.inspectionId = 'another';
    expect(compareObservations(early(), b, asOf).riskScoreChange.reasonCodes).toContain('ASSESSMENT_SOURCE_MISMATCH');
    expect(compareObservations(early(), { ...late(), assessment: null }, asOf).riskScoreChange.state).toBe('MISSING');
  });
  it.each([-1, 101, NaN, 1.5])('rejects invalid score %s without changing it', score => {
    const b = late(); b.assessment!.riskScore = score;
    expect(compareObservations(early(), b, asOf).riskScoreChange.reasonCodes).toContain('RISK_SCORE_INVALID');
    expect(b.assessment!.riskScore).toBe(score);
  });
});

describe('bounded history disclosure', () => {
  it('retains an empty inventory without fabricating comparisons', () => {
    expect(describeHistory([], 0, asOf)).toMatchObject({ window: { state: 'PRESENT', value: { totalInspectionCount: 0, observationsAnalyzed: 0, truncated: false, latestInspectionDate: null } }, latestPair: { state: 'NOT_COMPARABLE' } });
    expect(describeHistory([early()], 1, asOf).windowComparison.reasonCodes).toContain('INSUFFICIENT_HISTORY');
  });
  it('sorts without mutation and separates latest-pair and window sources', () => {
    const rows = [observation('c', '2026-03-01T00:00:00Z'), early(), late()];
    const before = JSON.stringify(rows), value = describeHistory(rows, 3, asOf);
    expect(value.latestPair.value?.previousInspectionId).toBe('b'); expect(value.windowComparison.value?.previousInspectionId).toBe('a');
    expect(JSON.stringify(rows)).toBe(before);
  });
  it('discloses truncation and exact population independently', () => {
    const rows = Array.from({ length: 101 }, (_, i) => observation(String(i).padStart(3, '0'), new Date(Date.UTC(2026, 0, i + 1)).toISOString()));
    expect(describeHistory(rows, 300, asOf).window).toMatchObject({ state: 'PRESENT', reasonCodes: ['HISTORY_TRUNCATED'], value: { totalInspectionCount: 300, observationsAnalyzed: 100, truncated: true, latestInspectionDate: rows[100].inspectionDate, oldestInspectionDate: rows[1].inspectionDate } });
  });
  it('uses stable IDs for ties without deriving temporal direction', () => {
    const value = describeHistory([early(), { ...early(), inspectionId: 'z' }], 2, asOf);
    expect(value.window.value?.sourceInspectionIds).toEqual(['z', 'a']);
    expect(value.latestPair.value?.physicalTrend.state).toBe('NOT_COMPARABLE');
  });
  it('rejects incomplete fetches, impossible counts and duplicate IDs', () => {
    expect(describeHistory([early()], 2, asOf).window.reasonCodes).toContain('HISTORY_INPUT_INCOMPLETE');
    expect(describeHistory([early()], 0, asOf).window.state).toBe('INVALID');
    expect(describeHistory([], -1, asOf).window.state).toBe('INVALID');
    expect(describeHistory([early(), early()], 2, asOf).window.reasonCodes).toContain('DUPLICATE_INSPECTION_ID');
  });
  it('never skips invalid recent evidence to produce an older comparison', () => {
    expect(describeHistory([early(), late(), observation('c', 'bad')], 3, asOf).window.state).toBe('INVALID');
    expect(describeHistory([observation('c', '2027-01-01T00:00:00Z')], 1, asOf).window.reasonCodes).toContain('TIMESTAMP_IN_FUTURE');
    expect(describeHistory([], 0, null).window.state).toBe('INVALID');
  });
});

describe('data-quality metrics', () => {
  const counts = { numerator: 2, denominator: 5, unknown: 1, invalid: 1, excluded: 9 };
  it('keeps unknown and invalid in denominator, exclusions outside', () => {
    expect(describeMetric(counts)).toEqual({ counts: present(counts), percentage: present(40) });
  });
  it('makes zero denominator not applicable rather than 100 percent', () => {
    expect(describeMetric({ numerator: 0, denominator: 0, unknown: 0, invalid: 0, excluded: 3 }).percentage).toMatchObject({ state: 'NOT_APPLICABLE', value: null });
  });
  it('preserves measured zero with a nonempty denominator', () => {
    expect(describeMetric({ ...counts, numerator: 0 }).percentage.value).toBe(0);
  });
  it.each([
    { numerator: 4 }, { denominator: -1 }, { unknown: 5 }, { invalid: 6 }, { excluded: NaN }, { numerator: 1.5 }, { denominator: Infinity }
  ])('rejects invalid/non-reconciling buckets %s', change => {
    expect(describeMetric({ ...counts, ...change }).counts.state).toBe('INVALID');
  });
  it('does not retain a mutable counts reference', () => {
    const input = { ...counts }, result = describeMetric(input); input.numerator = 0;
    expect(result.counts.value?.numerator).toBe(2);
  });
});
