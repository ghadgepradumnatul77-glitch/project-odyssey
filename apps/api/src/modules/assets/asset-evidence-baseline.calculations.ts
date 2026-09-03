import {
  BASELINE_HISTORY_LIMIT, type BaselineHistory, type BaselineMetric, type BaselineObservation,
  type BaselineReasonCode, type ConditionChange, type Direction, type Evidence,
  type MetricCounts, type ObservationComparison, type RiskChange, type TimestampInput
} from './asset-evidence-baseline.contracts';

export const present = <T>(value: T, reasonCodes: BaselineReasonCode[] = []): Evidence<T> => ({ state: 'PRESENT', value, reasonCodes });
export const unavailable = <T>(state: Exclude<Evidence<T>['state'], 'PRESENT'>, ...reasonCodes: BaselineReasonCode[]): Evidence<T> => ({ state, value: null, reasonCodes });

/** Accept Date objects or canonical UTC ISO timestamps only, never locale/date-only strings. */
export function timestamp(value: TimestampInput): Evidence<number> {
  if (value === null || value === undefined) return unavailable('MISSING', 'EVIDENCE_ABSENT');
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? present(value.getTime()) : unavailable('INVALID', 'TIMESTAMP_INVALID');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) return unavailable('INVALID', 'TIMESTAMP_INVALID');
  const parsed = new Date(value);
  const canonical = value.includes('.') ? value : value.replace('Z', '.000Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString() === canonical
    ? present(parsed.getTime()) : unavailable('INVALID', 'TIMESTAMP_INVALID');
}

export function evidenceAgeMilliseconds(eventAt: TimestampInput, asOf: TimestampInput): Evidence<number> {
  const end = timestamp(asOf), start = timestamp(eventAt);
  if (end.state !== 'PRESENT') return unavailable('INVALID', 'TIMESTAMP_INVALID');
  if (start.state !== 'PRESENT') return start;
  return start.value > end.value ? unavailable('INVALID', 'TIMESTAMP_IN_FUTURE') : present(end.value - start.value);
}

/** Event-to-recording or submission-to-verification interval; zero is valid. */
export function chronologyMilliseconds(startAt: TimestampInput, endAt: TimestampInput, asOf: TimestampInput): Evidence<number> {
  const start = evidenceAgeMilliseconds(startAt, asOf), end = evidenceAgeMilliseconds(endAt, asOf);
  if (start.state === 'INVALID') return start;
  if (end.state === 'INVALID') return end;
  if (start.state !== 'PRESENT') return start;
  if (end.state !== 'PRESENT') return end;
  return start.value < end.value ? unavailable('INVALID', 'CHRONOLOGY_REVERSED') : present(start.value - end.value);
}

const categories = {
  structuralCondition: ['GOOD', 'FAIR', 'POOR', 'CRITICAL'],
  crackSeverity: ['NONE', 'MINOR', 'MODERATE', 'SEVERE'],
  corrosionLevel: ['NONE', 'LOW', 'MODERATE', 'HIGH']
} as const;
type ConditionField = keyof typeof categories;
function conditionChange(field: ConditionField, before: string | null, after: string | null): Evidence<ConditionChange> {
  const values: readonly string[] = categories[field];
  if ((before !== null && !values.includes(before)) || (after !== null && !values.includes(after))) return unavailable('INVALID', 'UNKNOWN_CONDITION_CATEGORY');
  if (before === null || after === null) return unavailable('MISSING', 'EVIDENCE_ABSENT');
  const delta = values.indexOf(after) - values.indexOf(before);
  return present({ before, after, direction: delta > 0 ? 'WORSENING' : delta < 0 ? 'IMPROVING' : 'STABLE' });
}

function riskChange(previous: BaselineObservation, latest: BaselineObservation): Evidence<RiskChange> {
  const before = previous.assessment, after = latest.assessment;
  if (!before || !after) return unavailable('MISSING', 'EVIDENCE_ABSENT');
  if (before.inspectionId !== previous.inspectionId || after.inspectionId !== latest.inspectionId) return unavailable('INVALID', 'ASSESSMENT_SOURCE_MISMATCH');
  if (!before.assessmentVersion || !after.assessmentVersion) return unavailable('NOT_COMPARABLE', 'ASSESSMENT_VERSION_MISSING');
  if (before.assessmentVersion !== after.assessmentVersion) return unavailable('NOT_COMPARABLE', 'ASSESSMENT_VERSION_MISMATCH');
  // Compatibility is explicit; identical unknown versions are not automatically supported.
  if (before.assessmentVersion !== 'ODYSSEY_RISK_V1') return unavailable('NOT_COMPARABLE', 'ASSESSMENT_VERSION_UNSUPPORTED');
  if (![before.riskScore, after.riskScore].every(score => Number.isInteger(score) && score >= 0 && score <= 100)) return unavailable('INVALID', 'RISK_SCORE_INVALID');
  return present({ previousAssessmentId: before.id, latestAssessmentId: after.id, assessmentVersion: before.assessmentVersion, delta: after.riskScore - before.riskScore });
}

export function compareObservations(previous: BaselineObservation, latest: BaselineObservation, asOf: TimestampInput): ObservationComparison {
  let interval = chronologyMilliseconds(previous.inspectionDate, latest.inspectionDate, asOf);
  if (previous.inspectionId === latest.inspectionId) interval = unavailable('INVALID', 'DUPLICATE_INSPECTION_ID');
  else if (interval.state === 'PRESENT' && interval.value === 0) interval = unavailable('NOT_COMPARABLE', 'EQUAL_OBSERVATION_TIMES');
  const blocked = <T>(): Evidence<T> => unavailable('NOT_COMPARABLE', ...interval.reasonCodes);
  const structuralCondition = interval.state === 'PRESENT' ? conditionChange('structuralCondition', previous.structuralCondition, latest.structuralCondition) : blocked<ConditionChange>();
  const crackSeverity = interval.state === 'PRESENT' ? conditionChange('crackSeverity', previous.crackSeverity, latest.crackSeverity) : blocked<ConditionChange>();
  const corrosionLevel = interval.state === 'PRESENT' ? conditionChange('corrosionLevel', previous.corrosionLevel, latest.corrosionLevel) : blocked<ConditionChange>();
  const fields = [structuralCondition, crackSeverity, corrosionLevel];
  let physicalTrend: Evidence<Direction>;
  if (interval.state !== 'PRESENT') physicalTrend = blocked();
  else if (fields.some(field => field.state !== 'PRESENT')) physicalTrend = unavailable('NOT_COMPARABLE', 'PARTIAL_COMPARISON');
  else {
    const directions = fields.flatMap(field => field.state === 'PRESENT' ? [field.value.direction] : []);
    const worse = directions.includes('WORSENING'), better = directions.includes('IMPROVING');
    physicalTrend = present(worse && better ? 'MIXED' : worse ? 'WORSENING' : better ? 'IMPROVING' : 'STABLE');
  }
  return { previousInspectionId: previous.inspectionId, latestInspectionId: latest.inspectionId,
    intervalMilliseconds: interval, structuralCondition, crackSeverity, corrosionLevel, physicalTrend,
    riskScoreChange: interval.state === 'PRESENT' ? riskChange(previous, latest) : blocked<RiskChange>() };
}

/** Input must be the complete set or the latest bounded selection, not an arbitrary page.
 * totalInspectionCount is an exact count supplied by a future scoped repository.
 * Invalid dates invalidate selection: never silently replace suspect recent evidence with older evidence. */
export function describeHistory(observations: readonly BaselineObservation[], totalInspectionCount: number, asOf: TimestampInput): BaselineHistory {
  const fail = (state: 'INVALID' | 'NOT_COMPARABLE', code: BaselineReasonCode): BaselineHistory => ({
    window: unavailable(state, code), latestPair: unavailable('NOT_COMPARABLE', code), windowComparison: unavailable('NOT_COMPARABLE', code)
  });
  if (!Number.isSafeInteger(totalInspectionCount) || totalInspectionCount < 0 || observations.length > totalInspectionCount) return fail('INVALID', 'HISTORY_COUNT_INVALID');
  if (observations.length < Math.min(totalInspectionCount, BASELINE_HISTORY_LIMIT)) return fail('INVALID', 'HISTORY_INPUT_INCOMPLETE');
  if (new Set(observations.map(item => item.inspectionId)).size !== observations.length) return fail('INVALID', 'DUPLICATE_INSPECTION_ID');
  if (timestamp(asOf).state !== 'PRESENT') return fail('INVALID', 'TIMESTAMP_INVALID');
  for (const item of observations) {
    const age = evidenceAgeMilliseconds(item.inspectionDate, asOf);
    if (age.state !== 'PRESENT') return fail('INVALID', age.state === 'MISSING' ? 'TIMESTAMP_INVALID' : age.reasonCodes[0]);
  }
  const time = (item: BaselineObservation) => new Date(item.inspectionDate!).getTime();
  const selected = [...observations].sort((a, b) => time(b) - time(a) || (a.inspectionId < b.inspectionId ? 1 : a.inspectionId > b.inspectionId ? -1 : 0)).slice(0, BASELINE_HISTORY_LIMIT);
  const latest = selected[0], oldest = selected.at(-1);
  const truncated = totalInspectionCount > selected.length;
  const missingPair = () => unavailable<ObservationComparison>('NOT_COMPARABLE', 'INSUFFICIENT_HISTORY');
  return {
    window: present({ totalInspectionCount, observationsAnalyzed: selected.length, maximumObservations: BASELINE_HISTORY_LIMIT,
      truncated, selection: 'LATEST_BY_INSPECTION_DATE_THEN_ID', sourceInspectionIds: selected.map(item => item.inspectionId),
      oldestInspectionDate: oldest ? new Date(time(oldest)).toISOString() : null,
      latestInspectionDate: latest ? new Date(time(latest)).toISOString() : null }, truncated ? ['HISTORY_TRUNCATED'] : []),
    latestPair: selected.length < 2 ? missingPair() : present(compareObservations(selected[1], latest, asOf)),
    windowComparison: selected.length < 2 ? missingPair() : present(compareObservations(oldest!, latest, asOf))
  };
}

export function describeMetric(counts: MetricCounts): BaselineMetric {
  const { numerator, denominator, unknown, invalid, excluded } = counts;
  if (![numerator, denominator, unknown, invalid, excluded].every(value => Number.isSafeInteger(value) && value >= 0)
    || unknown > denominator || invalid > denominator - unknown || numerator > denominator - unknown - invalid) {
    return { counts: unavailable('INVALID', 'INVALID_METRIC_COUNTS'), percentage: unavailable('INVALID', 'INVALID_METRIC_COUNTS') };
  }
  return { counts: present({ ...counts }), percentage: denominator === 0
    ? unavailable('NOT_APPLICABLE', 'EMPTY_DENOMINATOR') : present(numerator / denominator * 100) };
}
