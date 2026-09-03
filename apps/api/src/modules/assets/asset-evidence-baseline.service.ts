import { SystemRole } from '../../generated/prisma';
import { QueryValidationError, parseCursor, parseLimit, parseUuidQuery } from '../../lib/pagination';
import { ScopedResourceNotFoundError, type OrganizationalPrincipal } from '../../security/organizational-scope';
import { createAssetEvidenceRepository, type AssetEvidenceRows, type BaselineQuery } from './asset-evidence-baseline.repository';
import { chronologyMilliseconds, describeHistory, describeMetric, evidenceAgeMilliseconds, present, timestamp, unavailable } from './asset-evidence-baseline.calculations';
import {
  ASSET_EVIDENCE_BASELINE_VERSION, ASSET_EVIDENCE_CALCULATION_VERSION,
  type BaselineEvidenceInventory, type BaselineFreshness, type BaselineMetric,
  type BaselineObservation, type BaselineReasonCode, type Evidence, type MetricCounts, type TimestampInput
} from './asset-evidence-baseline.contracts';

const SOURCE_REFERENCE_LIMIT = 20;
const permittedPredictive = (principal: OrganizationalPrincipal) => principal.role === SystemRole.AUDITOR || principal.role === SystemRole.SYSTEM_ADMIN;
const terminal = (status: string) => status === 'VERIFIED' || status === 'CANCELLED';
const activeCase = (status: string) => status !== 'CLOSED' && status !== 'CANCELLED';

export function validateBaselineQuery(query: Record<string, unknown>, summary = false): BaselineQuery {
  const allowed = ['departmentId', 'jurisdictionId', 'assetId', ...(summary ? [] : ['limit', 'cursor'])];
  if (Object.keys(query).some(key => !allowed.includes(key))) throw new QueryValidationError('Unsupported evidence baseline query.');
  for (const key of ['departmentId', 'jurisdictionId', 'assetId']) parseUuidQuery(query[key], key);
  if (!summary) { parseLimit(query.limit); parseCursor(query.cursor); }
  return Object.fromEntries(allowed.filter(key => query[key] !== undefined).map(key => [key, query[key]]));
}

export function baselineFreshness(values: TimestampInput[], asOf: Date): BaselineFreshness {
  const ages = values.map(value => evidenceAgeMilliseconds(value, asOf));
  const valid = ages.flatMap(value => value.state === 'PRESENT' ? [value.value] : []);
  const missing = ages.filter(value => value.state === 'MISSING').length;
  const invalid = ages.filter(value => value.state === 'INVALID').length;
  const noValue = (): Evidence<number> => !values.length ? unavailable('NOT_APPLICABLE', 'EMPTY_DENOMINATOR')
    : invalid ? unavailable('INVALID', ...new Set(ages.flatMap(value => value.reasonCodes))) : unavailable('MISSING', 'EVIDENCE_ABSENT');
  // Reduction avoids argument-count limits for large related-record populations.
  return { population: values.length, validCount: valid.length, missingCount: missing, invalidCount: invalid,
    newestAgeMilliseconds: valid.length ? present(valid.reduce((a, b) => Math.min(a, b))) : noValue(),
    oldestAgeMilliseconds: valid.length ? present(valid.reduce((a, b) => Math.max(a, b))) : noValue() };
}

function inventory<T extends { id: string }>(rows: T[], fields: Record<string, (row: T) => TimestampInput>, asOf: Date): BaselineEvidenceInventory {
  return { count: present(rows.length), sourceIds: rows.slice(0, SOURCE_REFERENCE_LIMIT).map(row => row.id), sourceIdsTruncated: rows.length > SOURCE_REFERENCE_LIMIT,
    freshness: Object.fromEntries(Object.entries(fields).map(([key, get]) => [key, baselineFreshness(rows.map(get), asOf)])) };
}
function metric(states: ('YES' | 'NO' | 'UNKNOWN' | 'INVALID' | 'EXCLUDED')[]): BaselineMetric {
  return describeMetric({ numerator: states.filter(s => s === 'YES').length, denominator: states.filter(s => s !== 'EXCLUDED').length,
    unknown: states.filter(s => s === 'UNKNOWN').length, invalid: states.filter(s => s === 'INVALID').length, excluded: states.filter(s => s === 'EXCLUDED').length });
}
const yes = (condition: boolean) => condition ? 'YES' as const : 'NO' as const;
function coordinates(row: AssetEvidenceRows): Evidence<{ latitude: number; longitude: number }> {
  const { latitude, longitude } = row.asset;
  if (latitude === null && longitude === null) return unavailable('MISSING', 'EVIDENCE_ABSENT');
  if (latitude === null || longitude === null) return unavailable('INVALID', 'INVALID_VALUE');
  const lat = Number(latitude), lon = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180
    ? present({ latitude: lat, longitude: lon }) : unavailable('INVALID', 'INVALID_VALUE');
}
const stateMetric = (value: Evidence<unknown>) => value.state === 'PRESENT' ? 'YES' as const : value.state === 'INVALID' ? 'INVALID' as const : 'UNKNOWN' as const;

/** Explicit DTO projection: never spread persistence records into the response. */
export function projectAssetEvidence(row: AssetEvidenceRows, principal: OrganizationalPrincipal, asOf: Date) {
  const issues = new Set<BaselineReasonCode>();
  if (!row.cases.length) issues.add('NO_CASE');
  if (!row.history.totalInspectionCount) issues.add('NO_INSPECTION');
  if (!row.assessments.length) issues.add('NO_ASSESSMENT');
  const orderedAssessments = [...row.assessments].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0));
  const latestAssessment = new Map<string, typeof row.assessments[number]>();
  for (const assessment of orderedAssessments) if (!latestAssessment.has(assessment.inspectionId)) latestAssessment.set(assessment.inspectionId, assessment);
  const observations: BaselineObservation[] = row.history.inspections.map(item => {
    const paired = latestAssessment.get(item.id);
    if (paired && paired.caseId !== item.caseId) issues.add('EVIDENCE_LINK_MISMATCH');
    return { inspectionId: item.id, caseId: item.caseId, inspectionDate: item.inspectionDate,
      structuralCondition: item.structuralCondition, crackSeverity: item.crackSeverity, corrosionLevel: item.corrosionLevel,
      assessment: paired && paired.caseId === item.caseId ? { id: paired.id, inspectionId: paired.inspectionId, assessmentVersion: paired.assessmentVersion, riskScore: paired.riskScore } : null };
  });
  const history = describeHistory(observations, row.history.totalInspectionCount, asOf);
  for (const result of [history.window, history.latestPair, history.windowComparison]) for (const code of result.reasonCodes) issues.add(code);
  for (const comparison of [history.latestPair.value, history.windowComparison.value]) if (comparison) {
    for (const result of [comparison.intervalMilliseconds, comparison.structuralCondition, comparison.crackSeverity, comparison.corrosionLevel, comparison.physicalTrend, comparison.riskScoreChange]) for (const code of result.reasonCodes) issues.add(code);
  }
  const location = coordinates(row);
  const constructionYear = row.asset.constructionYear === null ? unavailable<number>('MISSING', 'EVIDENCE_ABSENT')
    : Number.isInteger(row.asset.constructionYear) && row.asset.constructionYear > 0 && row.asset.constructionYear <= asOf.getUTCFullYear()
      ? present(row.asset.constructionYear) : unavailable<number>('INVALID', 'INVALID_VALUE');
  const evidenceTasks = new Set(row.evidence.map(item => item.executionTaskId));
  const tasks = new Map(row.tasks.map(item => [item.id, item]));
  const openBlockers = row.blockers.filter(item => item.resolvedAt === null);
  if (openBlockers.some(item => terminal(tasks.get(item.executionTaskId)?.status ?? ''))) issues.add('TERMINAL_TASK_OPEN_BLOCKER');
  const schedule = (task: typeof row.tasks[number]) => {
    const start = timestamp(task.plannedStartAt), end = timestamp(task.plannedEndAt);
    if (start.state === 'INVALID' || end.state === 'INVALID') return 'INVALID' as const;
    if (start.state !== 'PRESENT' || end.state !== 'PRESENT') return 'UNKNOWN' as const;
    return start.value > end.value ? 'INVALID' as const : 'YES' as const;
  };
  const requiredMissing = row.tasks.filter(task => task.evidenceRequired && task.status !== 'CANCELLED' && !evidenceTasks.has(task.id));
  if (requiredMissing.length) issues.add('REQUIRED_EVIDENCE_ABSENT');
  if (row.tasks.some(task => schedule(task) === 'INVALID')) issues.add('SCHEDULE_INVALID');
  const closureFor = new Map(row.closures.map(item => [item.caseId, item]));
  const closureMismatch = row.cases.filter(item => (item.status === 'CLOSED') !== closureFor.has(item.id) || (item.status === 'CLOSED' && !item.closedAt));
  if (closureMismatch.length) issues.add('CLOSURE_RECORD_MISMATCH');
  const chronological = <T>(items: T[], from: (item: T) => TimestampInput, to: (item: T) => TimestampInput) => metric(items.map(item => stateMetric(chronologyMilliseconds(from(item), to(item), asOf))));
  const metrics: Record<string, BaselineMetric> = {
    assetsWithCases: metric([yes(row.cases.length > 0)]), assetsWithInspections: metric([yes(row.history.totalInspectionCount > 0)]),
    assetsWithAssessments: metric([yes(row.assessments.length > 0)]), assetsWithValidCoordinates: metric([stateMetric(location)]),
    assetsWithValidConstructionYear: metric([stateMetric(constructionYear)]),
    assetsWithComparableLatestPhysicalChange: metric([history.latestPair.value ? stateMetric(history.latestPair.value.physicalTrend) : 'UNKNOWN']),
    assetsWithTruncatedHistory: metric([yes(row.history.truncated)]),
    analyzedInspectionsWithAssessment: metric(observations.map(item => yes(item.assessment !== null))),
    analyzedInspectionsWithValidTimestamp: metric(observations.map(item => stateMetric(evidenceAgeMilliseconds(item.inspectionDate, asOf)))),
    analyzedInspectionRecordingChronology: chronological(row.history.inspections, item => item.inspectionDate, item => item.createdAt),
    nonterminalTasksWithAssignmentTimestamp: metric(row.tasks.map(task => terminal(task.status) ? 'EXCLUDED' : stateMetric(evidenceAgeMilliseconds(task.assignedAt, asOf)))),
    nonterminalTasksWithSchedule: metric(row.tasks.map(task => terminal(task.status) ? 'EXCLUDED' : schedule(task))),
    requiredTasksWithEvidence: metric(row.tasks.map(task => !task.evidenceRequired || task.status === 'CANCELLED' ? 'EXCLUDED' : yes(evidenceTasks.has(task.id)))),
    submittedTasksWithVerification: metric(row.tasks.map(task => task.status === 'CANCELLED' || !task.completionSubmittedAt ? 'EXCLUDED' : task.verifiedAt ? stateMetric(chronologyMilliseconds(task.completionSubmittedAt, task.verifiedAt, asOf)) : 'UNKNOWN')),
    evidenceCaptureSubmissionChronology: chronological(row.evidence, item => item.capturedAt, item => item.submittedAt),
    closedCasesWithClosureRecord: metric(row.cases.map(item => item.status !== 'CLOSED' ? 'EXCLUDED' : yes(closureFor.has(item.id)))),
    activeCasesWithEstimate: metric(row.cases.map(item => !activeCase(item.status) ? 'EXCLUDED' : yes(row.estimates.some(estimate => estimate.caseId === item.id && estimate.status === 'ACTIVE')))),
    activeEstimatesWithDuration: metric(row.estimates.map(item => item.status !== 'ACTIVE' ? 'EXCLUDED' : item.estimatedDurationDays === null ? 'UNKNOWN' : Number.isInteger(item.estimatedDurationDays) && item.estimatedDurationDays > 0 ? 'YES' : 'INVALID')),
    linkedObservationsAccepted: metric(row.observations.map(item => yes(item.qualityState === 'VALID' && item.validationState === 'ACCEPTED'))),
    linkedObservationIngestionChronology: chronological(row.observations, item => item.observedAt, item => item.ingestedAt)
  };
  const sections = {
    cases: inventory(row.cases, { createdAt: item => item.createdAt, closedAt: item => item.closedAt }, asOf),
    inspectionsAnalyzed: inventory(row.history.inspections, { inspectionDate: item => item.inspectionDate, recordedAt: item => item.createdAt }, asOf),
    assessments: inventory(row.assessments, { calculatedAt: item => item.createdAt }, asOf),
    executionPlans: inventory(row.plans, { createdAt: item => item.createdAt, startedAt: item => item.startedAt, completedAt: item => item.completedAt }, asOf),
    tasks: inventory(row.tasks, { assignedAt: item => item.assignedAt, startedAt: item => item.startedAt, completionSubmittedAt: item => item.completionSubmittedAt, verifiedAt: item => item.verifiedAt }, asOf),
    evidence: inventory(row.evidence, { capturedAt: item => item.capturedAt, submittedAt: item => item.submittedAt }, asOf),
    blockers: inventory(row.blockers, { blockedAt: item => item.blockedAt, resolvedAt: item => item.resolvedAt }, asOf),
    scheduleRevisions: inventory(row.revisions, { changedAt: item => item.changedAt }, asOf),
    dependencies: inventory(row.dependencies, {}, asOf),
    closures: inventory(row.closures, { closedAt: item => item.createdAt }, asOf),
    reports: inventory(row.reports, { submittedAt: item => item.submittedAt, reviewStartedAt: item => item.reviewStartedAt, decisionAt: item => item.decisionAt }, asOf),
    observations: inventory(row.observations, { observedOrProviderValidAt: item => item.observedAt, ingestedAt: item => item.ingestedAt }, asOf),
    estimates: inventory(row.estimates, { preparedAt: item => item.preparedAt }, asOf)
  };
  const predictive = permittedPredictive(principal) && row.predictive.availability === 'AVAILABLE'
    ? { availability: 'AVAILABLE' as const,
      snapshots: inventory(row.predictive.snapshots ?? [], { predictionTimestamp: item => item.predictionTimestamp, recordedAt: item => item.createdAt }, asOf),
      outcomes: inventory(row.predictive.outcomes ?? [], { outcomeTimestamp: item => item.outcomeTimestamp, recordedAt: item => item.recordedAt }, asOf),
      provenanceCounts: Object.fromEntries(['PRODUCTION', 'PILOT', 'DEMO', 'SYNTHETIC', 'TEST'].map(key => [key, (row.predictive.snapshots ?? []).filter(item => item.provenanceClass === key).length])),
      activeSnapshots: (row.predictive.snapshots ?? []).filter(item => item.status === 'ACTIVE').length,
      eligibility: unavailable('NOT_COMPARABLE', 'PREDICTIVE_ELIGIBILITY_NOT_EVALUATED') }
    : { availability: 'RESTRICTED' as const, snapshots: null, outcomes: null };
  return {
    asset: { id: row.asset.id, assetCode: row.asset.assetCode, assetType: row.asset.assetType, departmentId: row.asset.departmentId, jurisdictionId: row.asset.jurisdictionId, coordinates: location, constructionYear },
    evidence: sections, history, metrics, predictive, issueCodes: [...issues].sort(),
    caseStates: { total: row.cases.length, truncated: row.cases.length > SOURCE_REFERENCE_LIMIT, items: row.cases.slice(0, SOURCE_REFERENCE_LIMIT).map(item => ({ id: item.id, status: item.status, riskLevel: item.riskLevel === null ? unavailable('MISSING', 'NO_ASSESSMENT') : present(item.riskLevel), priorityLevel: item.priorityLevel === null ? unavailable('MISSING', 'NO_ASSESSMENT') : present(item.priorityLevel) })) },
    operationalFacts: {
      blockedNonterminalTasks: row.tasks.filter(task => !terminal(task.status) && task.status === 'BLOCKED').length,
      openBlockerEvents: openBlockers.length,
      pendingWorkPastPlannedEnd: row.tasks.filter(task => !terminal(task.status) && !task.completionSubmittedAt && schedule(task) === 'YES' && task.plannedEndAt!.getTime() < asOf.getTime()).length,
      awaitingVerification: row.tasks.filter(task => !terminal(task.status) && !!task.completionSubmittedAt && !task.verifiedAt).length,
      unmetNonterminalDependencies: row.dependencies.filter(item => { const dependent = tasks.get(item.dependentTaskId), predecessor = tasks.get(item.predecessorTaskId); return dependent && !terminal(dependent.status) && predecessor && predecessor.status !== 'VERIFIED'; }).length,
      requiredEvidenceAbsent: requiredMissing.length, closureInconsistencies: closureMismatch.length
    }
  };
}
export type AssetEvidenceBaselineDto = ReturnType<typeof projectAssetEvidence>;

function metadata(principal: OrganizationalPrincipal, query: BaselineQuery, asOf: Date) {
  return { contractVersion: ASSET_EVIDENCE_BASELINE_VERSION, calculationVersion: ASSET_EVIDENCE_CALCULATION_VERSION, asOf: asOf.toISOString(),
    scope: { mode: principal.role === SystemRole.SYSTEM_ADMIN ? 'GLOBAL_READ' : 'ORGANIZATIONAL', departmentId: principal.role === SystemRole.SYSTEM_ADMIN ? null : principal.departmentId, jurisdictionId: principal.role === SystemRole.SYSTEM_ADMIN ? null : principal.jurisdictionId,
      filters: { departmentId: query.departmentId ?? null, jurisdictionId: query.jurisdictionId ?? null, assetId: query.assetId ?? null } },
    consistency: 'REPEATABLE_READ_PER_REQUEST',
    disclosures: ['Descriptive evidence only; no attention score, prediction or freshness threshold.', 'asOf is a calculation clock, not a historical database snapshot. Separate requests may observe different snapshots.', 'Inspection metrics use the disclosed latest-100 window. Other metrics use loaded scoped records.', 'Linked report/observation metrics count asset-evidence associations, not unique jurisdiction-wide records. Unlinked records are not projected.', 'Reports are unverified signals; external timestamps can represent provider validity, not field measurement.', 'Assessment calculation time does not refresh its inspection evidence. Closure does not prove physical improvement.', 'Predictive eligibility is not evaluated from metadata alone. Provenance labels do not establish training quality.', 'Estimate resource completeness and unlinked-record coverage are not evaluated by this projection.'] };
}

export function createAssetEvidenceService(repository = createAssetEvidenceRepository(), clock: () => Date = () => new Date()) {
  const referenceTime = () => { const value = clock(); if (timestamp(value).state !== 'PRESENT') throw new Error('BASELINE_CLOCK_INVALID'); return value; };
  return {
    async page(principal: OrganizationalPrincipal, input: Record<string, unknown> = {}) {
      const query = validateBaselineQuery(input), asOf = referenceTime();
      const result = await repository.page(principal, query);
      if (query.assetId && !result.items.length) throw new ScopedResourceNotFoundError('ASSET_NOT_FOUND');
      return { ...metadata(principal, query, asOf), items: result.items.map(row => projectAssetEvidence(row, principal, asOf)), limit: result.limit, nextCursor: result.nextCursor };
    },
    async summary(principal: OrganizationalPrincipal, input: Record<string, unknown> = {}) {
      const query = validateBaselineQuery(input, true), asOf = referenceTime();
      const totals: Record<string, MetricCounts> = {};
      const inventoryCounts: Record<string, number> = {};
      const freshness: Record<string, BaselineFreshness> = {};
      const issueCounts: Partial<Record<BaselineReasonCode, number>> = {};
      let assetsVisited = 0, snapshots = 0, outcomes = 0;
      // Initialize fixed metric keys even when the authorized population is empty.
      const empty = emptyEvidenceRows();
      for (const key of Object.keys(projectAssetEvidence(empty, principal, asOf).metrics)) totals[key] = { numerator: 0, denominator: 0, unknown: 0, invalid: 0, excluded: 0 };
      const result = await repository.traverse(principal, query, rows => {
        for (const row of rows) {
          const dto = projectAssetEvidence(row, principal, asOf); assetsVisited++;
          for (const [key, value] of Object.entries(dto.metrics)) {
            if (value.counts.state !== 'PRESENT') throw new Error('BASELINE_METRIC_INVALID');
            for (const field of ['numerator', 'denominator', 'unknown', 'invalid', 'excluded'] as const) totals[key][field] += value.counts.value[field];
          }
          for (const code of dto.issueCodes) issueCounts[code] = (issueCounts[code] ?? 0) + 1;
          for (const [name, section] of Object.entries(dto.evidence)) {
            inventoryCounts[name] = (inventoryCounts[name] ?? 0) + (section.count.state === 'PRESENT' ? section.count.value : 0);
            for (const [field, value] of Object.entries(section.freshness)) {
              const key = `${name}.${field}`, current = freshness[key];
              if (!current) freshness[key] = { ...value };
              else {
                current.population += value.population; current.validCount += value.validCount; current.missingCount += value.missingCount; current.invalidCount += value.invalidCount;
                for (const ageKey of ['newestAgeMilliseconds', 'oldestAgeMilliseconds'] as const) {
                  const incoming = value[ageKey], existing = current[ageKey];
                  if (incoming.state === 'PRESENT') current[ageKey] = existing.state === 'PRESENT' ? present(ageKey === 'newestAgeMilliseconds' ? Math.min(existing.value, incoming.value) : Math.max(existing.value, incoming.value)) : incoming;
                  else if (existing.state !== 'PRESENT' && (incoming.state === 'INVALID' || existing.state === 'NOT_APPLICABLE')) current[ageKey] = incoming;
                }
              }
            }
          }
          if (dto.predictive.availability === 'AVAILABLE') { snapshots += dto.predictive.snapshots.count.value ?? 0; outcomes += dto.predictive.outcomes.count.value ?? 0; }
        }
      });
      if (result.totalAssets !== assetsVisited || !result.complete) throw new Error('BASELINE_TRAVERSAL_INCOMPLETE');
      if (query.assetId && !assetsVisited) throw new ScopedResourceNotFoundError('ASSET_NOT_FOUND');
      return { ...metadata(principal, query, asOf), totalAssets: assetsVisited, complete: true,
        metrics: Object.fromEntries(Object.entries(totals).map(([key, counts]) => [key, describeMetric(counts)])), inventoryCounts, freshness, issueAssetCounts: issueCounts,
        predictive: permittedPredictive(principal) ? { availability: 'AVAILABLE', snapshotCount: snapshots, outcomeCount: outcomes, eligibility: unavailable('NOT_COMPARABLE', 'PREDICTIVE_ELIGIBILITY_NOT_EVALUATED') } : { availability: 'RESTRICTED', snapshotCount: null, outcomeCount: null } };
    }
  };
}

/** Empty shape supplies metric definitions only; never represents a persisted Asset. */
function emptyEvidenceRows(): AssetEvidenceRows {
  return { asset: { id: '', assetCode: '', assetType: 'BRIDGE', departmentId: '', jurisdictionId: '', latitude: null, longitude: null, constructionYear: null, conditionStatus: null, createdAt: new Date(0), updatedAt: new Date(0) }, cases: [], history: { totalInspectionCount: 0, fetchedInspectionCount: 0, observationsAnalyzed: 0, truncated: false, inspections: [] }, assessments: [], plans: [], tasks: [], evidence: [], blockers: [], revisions: [], dependencies: [], estimates: [], closures: [], reports: [], observations: [], predictive: { availability: 'RESTRICTED', snapshots: null, outcomes: null } };
}
export const assetEvidenceService = createAssetEvidenceService();
