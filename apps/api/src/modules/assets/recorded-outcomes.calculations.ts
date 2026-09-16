import { createHash } from 'node:crypto';
import { timestamp } from './asset-evidence-baseline.calculations';
import {
  OUTCOME_CONTRACT_VERSION, OUTCOME_CALCULATION_VERSION, type OutcomeContext, type OutcomeMetric,
  type OutcomeState, type OutcomeReason, type OutcomeCounts, type OutcomePair, type OutcomeAssessment,
  type OutcomeTask, type OutcomeTaskPopulation, type OutcomeClosure, type OutcomeDurationLink
} from './recorded-outcomes.contracts';

type Check = { state: OutcomeState; reason: OutcomeReason };
/** A valid duration is not a valid outcome when its governing record is inconsistent. */
export function gateRecordedMetric<T>(result: OutcomeMetric<T>, prerequisite: OutcomeMetric<unknown>): OutcomeMetric<T> {
  if (prerequisite.state === 'PRESENT') return result;
  return { ...result, state: prerequisite.state, value: null, reasonCodes: [...prerequisite.reasonCodes],
    sourceIds: [...new Set([...result.sourceIds,...prerequisite.sourceIds])].sort(),
    sourceFingerprint: 'sha256:' + createHash('sha256').update(result.sourceFingerprint + prerequisite.sourceFingerprint).digest('hex') };
}
/** Only PRESENT observations contribute to a ratio. Diagnostic counts are retained separately. */
export function summarizeRecordedMetrics(rows: OutcomeMetric<unknown>[], name: string, ctx: OutcomeContext) {
  const stateCounts: Record<OutcomeState,number> = { PRESENT:0,UNKNOWN:0,INVALID:0,NOT_COMPARABLE:0,NOT_APPLICABLE:0 };
  const counts: OutcomeCounts = { numerator:0,denominator:0,unknown:0,invalid:0,excluded:0 };
  for (const row of rows) {
    stateCounts[row.state]++;
    if (row.counts) {
      if (row.state === 'PRESENT') { counts.numerator += row.counts.numerator; counts.denominator += row.counts.denominator; }
      counts.unknown += row.counts.unknown; counts.invalid += row.counts.invalid; counts.excluded += row.counts.excluded;
    }
  }
  const hasRatio = rows.some(r=>r.counts !== null);
  const check = stateCounts.PRESENT ? null : stateCounts.INVALID ? fail('INVALID','VALUE_INVALID') : stateCounts.UNKNOWN ? fail('UNKNOWN','EVIDENCE_MISSING') : stateCounts.NOT_COMPARABLE ? fail('NOT_COMPARABLE','PAIR_AMBIGUOUS') : fail('NOT_APPLICABLE','ZERO_ELIGIBLE');
  return { ...metric(ctx,`PRESENT_ONLY_${name}`,rows.map(r=>r.sourceFingerprint),rows.flatMap(r=>r.sourceIds),{ observations:rows.length },check,hasRatio?counts:null),
    stateCounts, comparableObservations:stateCounts.PRESENT, excludedObservations:rows.length-stateCounts.PRESENT };
}
const fail = (state: OutcomeState, reason: OutcomeReason): Check => ({ state, reason });
function canonical(v: unknown): string {
  if (v === undefined) return 'undefined';
  if (typeof v === 'number' && !Number.isFinite(v)) return JSON.stringify(String(v));
  if (Array.isArray(v)) return '[' + v.map(canonical).sort().join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical((v as Record<string, unknown>)[k])).join(',') + '}';
  return JSON.stringify(v);
}
const ms = (v: string | null) => { const r = timestamp(v); return r.state === 'PRESENT' ? r.value : null; };
function contextCheck(ctx: OutcomeContext): Check | null {
  const a = ms(ctx.asOf), s = ms(ctx.window.start), e = ms(ctx.window.end);
  if (a === null || s === null || e === null || !ctx.cohortId.trim()) return fail('INVALID', 'TIMESTAMP_INVALID');
  if (s > e) return fail('INVALID', 'CHRONOLOGY_REVERSED');
  if (e > a) return fail('INVALID', 'FUTURE_TIMESTAMP');
  return null;
}
function event(v: string | null, ctx: OutcomeContext): Check | null {
  if (v === null) return fail('UNKNOWN', 'EVIDENCE_MISSING');
  const t = ms(v); if (t === null) return fail('INVALID', 'TIMESTAMP_INVALID');
  if (t > ms(ctx.asOf)!) return fail('INVALID', 'FUTURE_TIMESTAMP');
  return null;
}
function interval(start: string | null, end: string | null, ctx: OutcomeContext): Check | null {
  const errors = [event(start, ctx), event(end, ctx)].filter(Boolean) as Check[];
  if (errors.length) return errors.find(e => e.state === 'INVALID') ?? errors[0];
  return ms(start)! > ms(end)! ? fail('INVALID', 'CHRONOLOGY_REVERSED') : null;
}
function metric<T>(ctx: OutcomeContext, rule: string, input: unknown, ids: string[], value: T | null, check: Check | null = null, counts: OutcomeCounts | null = null, engineVersions: string[] = [], templateVersions: string[] = []): OutcomeMetric<T> {
  check = contextCheck(ctx) ?? check;
  return { state: check?.state ?? 'PRESENT', value: check ? null : value, reasonCodes: check ? [check.reason] : [], counts,
    sourceIds: [...new Set(ids)].sort(), sourceFingerprint: 'sha256:' + createHash('sha256').update(canonical({ ctx, rule, input, engineVersions, templateVersions, version: OUTCOME_CALCULATION_VERSION })).digest('hex'),
    asOf: ctx.asOf, cohortId: ctx.cohortId, window: { ...ctx.window }, comparisonRule: rule,
    contractVersion: OUTCOME_CONTRACT_VERSION, calculationVersion: OUTCOME_CALCULATION_VERSION,
    engineVersions: [...new Set(engineVersions)].sort(), templateVersions: [...new Set(templateVersions)].sort(),
    authority: { descriptiveOnly: true, establishesCausation: false, mutatesWorkflow: false } };
}
function pairCheck(pair: OutcomePair, ctx: OutcomeContext): Check | null {
  if (pair.selection !== 'EXPLICIT') return fail('NOT_COMPARABLE', 'PAIR_AMBIGUOUS');
  const { before: b, after: a } = pair;
  if (!b || !a) return fail('UNKNOWN', 'PAIR_REQUIRED');
  if (b.id === a.id) return fail('INVALID', 'DUPLICATE_SOURCE');
  if (b.assetId !== a.assetId) return fail('NOT_COMPARABLE', 'SOURCE_MISMATCH');
  const check = interval(b.observedAt, a.observedAt, ctx); if (check) return check;
  if (ms(b.observedAt) === ms(a.observedAt)) return fail('NOT_COMPARABLE', 'EQUAL_OBSERVATION_TIMES');
  if (ms(b.observedAt)! < ms(ctx.window.start)! || ms(a.observedAt)! > ms(ctx.window.end)!) return fail('NOT_COMPARABLE', 'WINDOW_INCOMPLETE');
  return null;
}
const conditions = { structuralCondition: ['GOOD','FAIR','POOR','CRITICAL'], crackSeverity: ['NONE','MINOR','MODERATE','SEVERE'], corrosionLevel: ['NONE','LOW','MODERATE','HIGH'] };
export function recordedConditionChange(pair: OutcomePair, ctx: OutcomeContext) {
  const check = pairCheck(pair, ctx), ids = [pair.before?.id, pair.after?.id].filter((v): v is string => !!v);
  const field = (name: keyof typeof conditions) => {
    const b = pair.before?.[name] ?? null, a = pair.after?.[name] ?? null, allowed = conditions[name];
    const invalid = (b !== null && !allowed.includes(b)) || (a !== null && !allowed.includes(a));
    const missing = b === null || a === null;
    const direction = b === null || a === null ? null : allowed.indexOf(a) > allowed.indexOf(b) ? 'WORSENING' : allowed.indexOf(a) < allowed.indexOf(b) ? 'IMPROVING' : 'UNCHANGED';
    return metric(ctx, `EXPLICIT_PAIR_${name}`, pair, ids, { before: b, after: a, direction }, check ?? (invalid ? fail('INVALID','CATEGORY_INVALID') : missing ? fail('UNKNOWN','EVIDENCE_MISSING') : null));
  };
  return { structuralCondition: field('structuralCondition'), crackSeverity: field('crackSeverity'), corrosionLevel: field('corrosionLevel') };
}
export function recordedRiskChange(pair: OutcomePair, before: OutcomeAssessment | null, after: OutcomeAssessment | null, ctx: OutcomeContext) {
  let check = pairCheck(pair, ctx);
  if (!check && (!before || !after)) check = fail('UNKNOWN','EVIDENCE_MISSING');
  if (!check && before && after) {
    if (before.inspectionId !== pair.before!.id || after.inspectionId !== pair.after!.id || before.caseId !== pair.before!.caseId || after.caseId !== pair.after!.caseId) check = fail('INVALID','SOURCE_MISMATCH');
    else if (before.id === after.id) check = fail('INVALID','DUPLICATE_SOURCE');
    else if (before.version !== 'ODYSSEY_RISK_V1' || after.version !== before.version) check = fail('NOT_COMPARABLE','VERSION_INCOMPATIBLE');
    else if (![before.score,after.score].every(v => v !== null && Number.isInteger(v) && v >= 0 && v <= 100)) check = fail(before.score === null || after.score === null ? 'UNKNOWN' : 'INVALID','VALUE_INVALID');
    else if ([before,after].some(a => a.riskLevel === null || a.priorityLevel === null)) check = fail('UNKNOWN','EVIDENCE_MISSING');
    else if ([before,after].some(a => !['VERY_LOW','LOW','MODERATE','HIGH','VERY_HIGH','CRITICAL'].includes(a.riskLevel!) || !['LOW','MEDIUM','HIGH','VERY_HIGH','CRITICAL'].includes(a.priorityLevel!))) check = fail('INVALID','CATEGORY_INVALID');
    else check = interval(pair.before!.observedAt,before.recordedAt,ctx) ?? interval(pair.after!.observedAt,after.recordedAt,ctx);
  }
  return metric(ctx,'EXPLICIT_PAIR_SAME_SUPPORTED_ENGINE', { pair,before,after }, [pair.before?.id,pair.after?.id,before?.id,after?.id].filter((v): v is string => !!v), before && after ? { scoreDelta: before.score !== null && after.score !== null ? after.score - before.score : null, beforeScore: before.score, afterScore: after.score, beforeRisk: before.riskLevel, afterRisk: after.riskLevel, beforePriority: before.priorityLevel, afterPriority: after.priorityLevel } : null, check, null, [before?.version,after?.version].filter((v): v is string => !!v));
}

const statuses = ['PENDING','ASSIGNED','IN_PROGRESS','BLOCKED','COMPLETION_SUBMITTED','VERIFIED','CANCELLED'];
function taskCheck(t: OutcomeTask, ctx: OutcomeContext): Check | null {
  if (!statuses.includes(t.status)) return fail('INVALID','STATUS_INCONSISTENT');
  if (['PENDING','ASSIGNED'].includes(t.status) && t.startedAt !== null) return fail('INVALID','STATUS_INCONSISTENT');
  if (!['VERIFIED','COMPLETION_SUBMITTED','CANCELLED'].includes(t.status) && (t.submittedAt !== null || t.submittedById !== null)) return fail('INVALID','STATUS_INCONSISTENT');
  for (const at of [t.startedAt,t.submittedAt,t.verifiedAt]) if (at !== null) { const check = event(at,ctx); if (check) return check; }
  if (t.status === 'VERIFIED' && (!t.verifiedAt || !t.verifiedById)) return fail('INVALID','STATUS_INCONSISTENT');
  if (t.status !== 'VERIFIED' && (t.verifiedAt !== null || t.verifiedById !== null)) return fail('INVALID','STATUS_INCONSISTENT');
  if (['VERIFIED','COMPLETION_SUBMITTED'].includes(t.status)) {
    if (!t.submittedAt || !t.submittedById || !t.startedAt || !t.assignedToId) return fail('INVALID','STATUS_INCONSISTENT');
    if (t.assignedToId !== t.submittedById || (t.status === 'VERIFIED' && [t.assignedToId,t.submittedById].includes(t.verifiedById!))) return fail('INVALID','IDENTITY_INCONSISTENT');
  }
  if (t.submittedAt !== null) { const check = interval(t.startedAt,t.submittedAt,ctx); if (check) return check; }
  if (t.verifiedAt !== null) return interval(t.submittedAt,t.verifiedAt,ctx);
  return null;
}
function populationCheck(p: OutcomeTaskPopulation): Check | null {
  if (!p.complete) return fail('UNKNOWN','INCOMPLETE_POPULATION');
  if (new Set(p.tasks.map(t => t.id)).size !== p.tasks.length) return fail('INVALID','DUPLICATE_SOURCE');
  if (p.tasks.some(t => t.planId !== p.planId)) return fail('INVALID','SOURCE_MISMATCH');
  return null;
}
/** Exact cohort counts; invalid eligible members stay in the denominator, never disappear. */
export function recordedTaskCoverage(p: OutcomeTaskPopulation, kind: 'EXECUTION' | 'VERIFICATION' | 'EVIDENCE', ctx: OutcomeContext) {
  const counts: OutcomeCounts = { numerator:0, denominator:0, unknown:0, invalid:0, excluded:0 };
  const byStatus = Object.fromEntries(statuses.map(s => [s,0]));
  let submittedUnverified = 0;
  for (const t of p.tasks) {
    if (statuses.includes(t.status)) byStatus[t.status]++;
    const required = kind === 'EXECUTION' ? t.mandatory : kind === 'VERIFICATION' ? t.verificationRequired : t.evidenceRequired;
    if (required === null) { counts.unknown++; continue; }
    if (!required) { counts.excluded++; continue; }
    counts.denominator++;
    if (taskCheck(t,ctx)) { counts.invalid++; continue; }
    if (kind === 'EVIDENCE') {
      if (t.evidence === null) { counts.unknown++; continue; }
      if (new Set(t.evidence.map(e => e.id)).size !== t.evidence.length || t.evidence.some(e => e.taskId !== t.id || event(e.submittedAt,ctx)?.state === 'INVALID')) { counts.invalid++; continue; }
      if (t.evidence.some(e => e.submittedAt === null)) { counts.unknown++; continue; }
      if (t.evidence.length) counts.numerator++;
    } else {
      if (t.status === 'VERIFIED') counts.numerator++;
      else if (t.status === 'COMPLETION_SUBMITTED') submittedUnverified++;
    }
  }
  const check = populationCheck(p) ?? (counts.invalid ? fail('INVALID','STATUS_INCONSISTENT') : counts.unknown ? fail('UNKNOWN','EVIDENCE_MISSING') : !counts.denominator ? fail('NOT_APPLICABLE','ZERO_ELIGIBLE') : null);
  return { ...metric(ctx,`${kind}_COVERAGE_CURRENT_RECORDED_COHORT`,p,[p.planId,...p.tasks.map(t=>t.id),...(kind === 'EVIDENCE' ? p.tasks.flatMap(t => t.evidence?.map(e=>e.id) ?? []) : [])],{ byStatus, submittedUnverified, evidencePresenceImpliesQuality:false },check,counts,[],p.tasks.flatMap(t=>t.templateVersion ? [t.templateVersion] : [])),
    recordedStatusCounts: byStatus, submittedUnverifiedCount: submittedUnverified };
}
export function recordedElapsedTime(sourceId: string, startAt: string | null, endAt: string | null, kind: 'CASE_CREATION_TO_CLOSURE' | 'TASK_START_TO_SUBMISSION' | 'SUBMISSION_TO_VERIFICATION', ctx: OutcomeContext) {
  let check = interval(startAt,endAt,ctx);
  if (endAt === null && !event(startAt,ctx)) check = fail('UNKNOWN','UNFINISHED');
  return metric(ctx,kind,{ sourceId,startAt,endAt },[sourceId],check ? null : { milliseconds: ms(endAt)!-ms(startAt)!, completed:true },check);
}
export function recordedClosureConsistency(c: OutcomeClosure, ctx: OutcomeContext) {
  let check: Check | null = null;
  if (!['NEW','INSPECTION_REQUIRED','INSPECTION_IN_PROGRESS','UNDER_ANALYSIS','ORP_READY','UNDER_REVIEW','APPROVED','EXECUTION','VERIFICATION','CLOSED','CANCELLED'].includes(c.caseStatus)) check = fail('INVALID','STATUS_INCONSISTENT');
  else if (c.caseStatus !== 'CLOSED') check = c.record || c.closedAt ? fail('INVALID','STATUS_INCONSISTENT') : fail('UNKNOWN','UNFINISHED');
  else if (!c.record || !c.plan || !c.closedAt) check = fail('INVALID','STATUS_INCONSISTENT');
  else if (c.record.caseId !== c.caseId || c.plan.caseId !== c.caseId || c.record.planId !== c.plan.id) check = fail('INVALID','SOURCE_MISMATCH');
  else if (c.record.reason !== 'EXECUTION_VERIFIED' || c.plan.status !== 'COMPLETED') check = fail('INVALID','STATUS_INCONSISTENT');
  else check = interval(c.caseCreatedAt,c.plan.completedAt,ctx) ?? interval(c.plan.completedAt,c.closedAt,ctx) ?? interval(c.closedAt,c.record.recordedAt,ctx);
  return metric(ctx,'RECORDED_CLOSURE_LINKAGE_AND_CHRONOLOGY',c,[c.caseId,...(c.record ? [c.record.id] : []),...(c.plan ? [c.plan.id] : [])],{ recordedClosureConsistent:true, provesPhysicalImprovement:false },check);
}
export function subsequentRecordedCases(input: { assetId: string; closedCaseId: string; closedAt: string | null; complete: boolean; cases: { id: string; assetId: string; createdAt: string | null }[] }, ctx: OutcomeContext) {
  let check = event(input.closedAt,ctx);
  if (!check && !input.complete) check = fail('UNKNOWN','INCOMPLETE_POPULATION');
  if (!check && (ms(input.closedAt)! > ms(ctx.window.start)!)) check = fail('NOT_COMPARABLE','WINDOW_INCOMPLETE');
  if (!check && new Set(input.cases.map(c=>c.id)).size !== input.cases.length) check = fail('INVALID','DUPLICATE_SOURCE');
  if (!check && input.cases.some(c=>c.assetId !== input.assetId)) check = fail('INVALID','SOURCE_MISMATCH');
  if (!check) for (const c of input.cases) { const e = event(c.createdAt,ctx); if (e) { check=e; break; } }
  const selected = check ? [] : input.cases.filter(c=>c.id !== input.closedCaseId && ms(c.createdAt)! > ms(input.closedAt)! && ms(c.createdAt)! >= ms(ctx.window.start)! && ms(c.createdAt)! <= ms(ctx.window.end)!);
  return metric(ctx,'SUBSEQUENT_CASE_CREATION_IN_DECLARED_WINDOW',input,[input.assetId,input.closedCaseId,...input.cases.map(c=>c.id)],{ count:selected.length, caseIds:selected.map(c=>c.id).sort(), provesRecurrence:false },check);
}
export function estimateRecordedDuration(link: OutcomeDurationLink, ctx: OutcomeContext) {
  let check: Check | null = link.linkage !== 'EXPLICIT_SAME_WORK' ? fail('NOT_COMPARABLE','LINKAGE_AMBIGUOUS') : null;
  const e=link.estimate,p=link.plan;
  if (!check && (!e || !p)) check=fail('UNKNOWN','EVIDENCE_MISSING');
  if (!check && e && p) {
    if (e.caseId !== link.caseId || p.caseId !== link.caseId) check=fail('INVALID','SOURCE_MISMATCH');
    else if (!e.provenanceFingerprint || !p.templateVersion) check=fail('NOT_COMPARABLE','LINKAGE_AMBIGUOUS');
    else if (!/^sha256:[a-f0-9]{64}$/.test(e.provenanceFingerprint)) check=fail('INVALID','VALUE_INVALID');
    else if (!Number.isSafeInteger(e.version) || e.version < 1 || (e.durationDays !== null && (!Number.isSafeInteger(e.durationDays) || e.durationDays <= 0))) check=fail('INVALID','VALUE_INVALID');
    else if (e.durationDays === null) check=fail('UNKNOWN','EVIDENCE_MISSING');
    else check=interval(e.preparedAt,p.startedAt,ctx) ?? interval(p.startedAt,p.completedAt,ctx);
  }
  return metric(ctx,'EXPLICIT_SAME_WORK_ESTIMATE_VS_RECORDED_ELAPSED',link,[link.caseId,...(e?[e.id]:[]),...(p?[p.id]:[])],check ? null : { estimatedDays:e!.durationDays, recordedElapsedMilliseconds:ms(p!.completedAt)!-ms(p!.startedAt)!, comparableUnits:'CALENDAR_ELAPSED_ONLY', measuresLabourEffort:false },check,null,[],p?.templateVersion?[p.templateVersion]:[]);
}
