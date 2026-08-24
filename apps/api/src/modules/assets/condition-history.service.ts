import { createHash } from 'node:crypto';
import type { OrganizationalPrincipal } from '../../security/organizational-scope';
import { assertVisibleAsset } from '../../security/organizational-scope';
import prisma from '../../lib/prisma';

export const CONDITION_HISTORY_CONTRACT_VERSION = 'ODYSSEY_CONDITION_HISTORY_V1';
export const CONDITION_HISTORY_METHOD_VERSION = 'ODYSSEY_LONGITUDINAL_RULES_V1';
export const CONDITION_HISTORY_MAX_OBSERVATIONS = 100;

export type TrendState = 'IMPROVING' | 'STABLE' | 'WORSENING' | 'MIXED' | 'INSUFFICIENT_DATA';
export type ReadinessState = 'SUFFICIENT_FOR_TREND' | 'LIMITED' | 'INSUFFICIENT';

export interface ConditionSourceObservation {
  inspectionId: string; caseId: string; inspectionDate: Date; createdAt: Date;
  structuralCondition: string | null; crackSeverity: string | null; corrosionLevel: string | null;
  trafficImportance: string | null; hospitalRoute: boolean | null; weatherRisk: string | null;
  heavyRainExpected: boolean | null; estimatedDailyUsers: number | null;
  assessment: null | { id: string; riskScore: number; riskLevel: string; priorityLevel: string; assessmentVersion: string; createdAt: Date };
}

const severity: Record<string, number> = { NONE: 0, LOW: 1, MINOR: 1, FAIR: 1, MODERATE: 2, MEDIUM: 2, GOOD: 0, POOR: 3, HIGH: 3, SEVERE: 4, CRITICAL: 5 };
const day = 86_400_000;
const iso = (value: Date) => value.toISOString();

function ordered(values: ConditionSourceObservation[]) {
  return [...values].sort((a, b) => a.inspectionDate.getTime() - b.inspectionDate.getTime() || a.inspectionId.localeCompare(b.inspectionId));
}

function change(previous: ConditionSourceObservation, latest: ConditionSourceObservation) {
  return {
    available: true as const,
    previousInspectionId: previous.inspectionId,
    latestInspectionId: latest.inspectionId,
    observationIntervalDays: Math.floor((latest.inspectionDate.getTime() - previous.inspectionDate.getTime()) / day),
    riskScoreDelta: previous.assessment && latest.assessment ? latest.assessment.riskScore - previous.assessment.riskScore : null,
    riskLevelChanged: previous.assessment && latest.assessment ? previous.assessment.riskLevel !== latest.assessment.riskLevel : null,
    priorityLevelChanged: previous.assessment && latest.assessment ? previous.assessment.priorityLevel !== latest.assessment.priorityLevel : null,
    structuralConditionChanged: previous.structuralCondition !== null && latest.structuralCondition !== null ? previous.structuralCondition !== latest.structuralCondition : null,
    crackSeverityChanged: previous.crackSeverity !== null && latest.crackSeverity !== null ? previous.crackSeverity !== latest.crackSeverity : null,
    corrosionLevelChanged: previous.corrosionLevel !== null && latest.corrosionLevel !== null ? previous.corrosionLevel !== latest.corrosionLevel : null
  };
}

function trend(values: ConditionSourceObservation[]): { state: TrendState; reasons: string[] } {
  if (values.length < 2) return { state: 'INSUFFICIENT_DATA', reasons: ['At least two historical observations are required to describe change.'] };
  const first = values[0], latest = values.at(-1)!; const signals: number[] = []; const reasons: string[] = [];
  if (first.assessment && latest.assessment) {
    const delta = latest.assessment.riskScore - first.assessment.riskScore; signals.push(Math.sign(delta));
    reasons.push(delta === 0 ? `Risk score remained ${latest.assessment.riskScore}.` : `Risk score ${delta > 0 ? 'increased' : 'decreased'} from ${first.assessment.riskScore} to ${latest.assessment.riskScore}.`);
  } else reasons.push('A risk-score comparison is unavailable because an assessment is not paired with both boundary inspections.');
  for (const [field, label] of [['structuralCondition', 'Structural condition'], ['crackSeverity', 'Crack severity'], ['corrosionLevel', 'Corrosion level']] as const) {
    const before = first[field], after = latest[field];
    if (before && after && severity[before] !== undefined && severity[after] !== undefined) {
      const delta = severity[after] - severity[before]; signals.push(Math.sign(delta));
      if (delta !== 0) reasons.push(`${label} changed from ${before} to ${after}.`);
    }
  }
  const span = Math.floor((latest.inspectionDate.getTime() - first.inspectionDate.getTime()) / day);
  reasons.push(`The ${values.length} observations span ${span} days.`);
  const meaningful = signals.filter((value) => value !== 0);
  if (!signals.length) return { state: 'INSUFFICIENT_DATA', reasons };
  if (!meaningful.length) return { state: 'STABLE', reasons };
  if (meaningful.some((value) => value > 0) && meaningful.some((value) => value < 0)) return { state: 'MIXED', reasons };
  return { state: meaningful[0] > 0 ? 'WORSENING' : 'IMPROVING', reasons };
}

export function analyzeConditionHistory(values: ConditionSourceObservation[], coordinatesAvailable: boolean) {
  const observations = ordered(values); const first = observations[0], latest = observations.at(-1);
  const spanDays = first && latest ? Math.floor((latest.inspectionDate.getTime() - first.inspectionDate.getTime()) / day) : 0;
  const paired = observations.filter((item) => item.assessment).length;
  const fields = ['structuralCondition', 'crackSeverity', 'corrosionLevel', 'trafficImportance', 'hospitalRoute', 'weatherRisk', 'heavyRainExpected', 'estimatedDailyUsers'] as const;
  const completeness = Object.fromEntries(fields.map((field) => {
    const present = observations.filter((item) => item[field] !== null && item[field] !== undefined).length;
    return [field, { present, missing: observations.length - present, status: !observations.length || !present ? 'UNAVAILABLE' : present === observations.length ? 'COMPLETE' : 'PARTIAL' }];
  }));
  const readinessReasons: string[] = [];
  let readiness: ReadinessState;
  if (!observations.length) { readiness = 'INSUFFICIENT'; readinessReasons.push('No inspections are recorded for this asset.'); }
  else if (observations.length === 1) { readiness = 'INSUFFICIENT'; readinessReasons.push('Only one inspection is recorded; it provides a baseline but not a trend.'); }
  else {
    readiness = observations.length >= 3 && spanDays >= 30 && paired === observations.length ? 'SUFFICIENT_FOR_TREND' : 'LIMITED';
    if (observations.length < 3) readinessReasons.push(`Only ${observations.length} observations are available.`);
    if (spanDays < 30) readinessReasons.push(`The observation window spans only ${spanDays} days.`);
    if (paired < observations.length) readinessReasons.push(`${observations.length - paired} inspection${observations.length - paired === 1 ? '' : 's'} do not have a paired risk assessment.`);
    if (readiness === 'SUFFICIENT_FOR_TREND') readinessReasons.push('At least three paired observations span 30 days or more.');
  }
  if ((completeness.estimatedDailyUsers as { missing: number }).missing) readinessReasons.push('Estimated daily users are missing from one or more inspections.');
  if (!coordinatesAvailable) readinessReasons.push('Asset coordinates are unavailable for future geospatial analysis.');
  return {
    observationCount: observations.length, spanDays, pairedAssessmentCount: paired,
    latestVsPrevious: observations.length >= 2 ? change(observations.at(-2)!, observations.at(-1)!) : null,
    trend: trend(observations), readiness: { state: readiness, reasons: readinessReasons },
    completeness: { fields: completeness, coordinates: { available: coordinatesAvailable, status: coordinatesAvailable ? 'COMPLETE' : 'UNAVAILABLE' } }
  };
}

export async function getAssetConditionHistory(assetId: string, principal: OrganizationalPrincipal) {
  const asset = await assertVisibleAsset(assetId, principal);
  const rows = await prisma.inspection.findMany({
    where: { case: { assetId } }, orderBy: [{ inspectionDate: 'desc' }, { id: 'desc' }], take: CONDITION_HISTORY_MAX_OBSERVATIONS + 1,
    select: { id: true, caseId: true, inspectionDate: true, createdAt: true, structuralCondition: true, crackSeverity: true, corrosionLevel: true, trafficImportance: true, hospitalRoute: true, weatherRisk: true, heavyRainExpected: true, estimatedDailyUsers: true,
      riskAssessments: { orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 1, select: { id: true, riskScore: true, riskLevel: true, priorityLevel: true, assessmentVersion: true, createdAt: true } } }
  });
  const truncated = rows.length > CONDITION_HISTORY_MAX_OBSERVATIONS; const selected = rows.slice(0, CONDITION_HISTORY_MAX_OBSERVATIONS);
  const sources: ConditionSourceObservation[] = selected.map(({ id, riskAssessments, ...inspection }) => ({ ...inspection, inspectionId: id, assessment: riskAssessments[0] ?? null }));
  const analytics = analyzeConditionHistory(sources, asset.latitude !== null && asset.longitude !== null);
  const fingerprint = createHash('sha256').update(sources.map((item) => `${item.inspectionId}:${item.assessment?.id ?? 'unpaired'}`).join('|')).digest('hex');
  return {
    contractVersion: CONDITION_HISTORY_CONTRACT_VERSION, methodVersion: CONDITION_HISTORY_METHOD_VERSION,
    asset: { id: asset.id, assetCode: asset.assetCode, name: asset.name, assetType: asset.assetType, departmentId: asset.departmentId, jurisdictionId: asset.jurisdictionId },
    analysisWindow: { maximumObservations: CONDITION_HISTORY_MAX_OBSERVATIONS, observationsAnalyzed: sources.length, truncated, oldestInspectionDate: sources.length ? iso(ordered(sources)[0].inspectionDate) : null, latestInspectionDate: sources.length ? iso(ordered(sources).at(-1)!.inspectionDate) : null },
    summary: analytics,
    observations: ordered(sources).reverse().map((item) => ({ ...item, inspectionDate: iso(item.inspectionDate), createdAt: iso(item.createdAt), assessment: item.assessment ? { ...item.assessment, createdAt: iso(item.assessment.createdAt) } : null })),
    provenance: { sourceInspectionIds: sources.map((item) => item.inspectionId), sourceRiskAssessmentIds: sources.flatMap((item) => item.assessment ? [item.assessment.id] : []), sourceFingerprint: `sha256:${fingerprint}` }
  };
}
