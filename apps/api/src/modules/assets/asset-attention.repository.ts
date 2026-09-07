import { createHash } from 'node:crypto';
import { createAssetEvidenceRepository, type AssetEvidenceRows, type BaselineQuery } from './asset-evidence-baseline.repository';
import type { OrganizationalPrincipal } from '../../security/organizational-scope';
import { ASSET_EVIDENCE_BASELINE_VERSION, ASSET_EVIDENCE_CALCULATION_VERSION, type BaselineObservation } from './asset-evidence-baseline.contracts';
import { describeHistory } from './asset-evidence-baseline.calculations';
import { ATTENTION_SOURCE_REFERENCE_LIMIT, type AssetAttentionInput, type AttentionCaseInput, type AttentionTaskInput } from './asset-attention.contracts';

export const ATTENTION_SUMMARY_BATCH_SIZE = 500;
const terminalCase = (status: string) => status === 'CLOSED' || status === 'CANCELLED';
const terminalTask = (status: string) => status === 'VERIFIED' || status === 'CANCELLED';
export interface AttentionSourceCounts {
  cases: number; activeCases: number; closedOrCancelledCases: number; inspections: number; assessments: number;
  tasks: number; evidence: number; blockers: number; dependencies: number; estimates: number; closures: number;
  publicReports: number; externalObservations: number;
}
export interface AssetAttentionRows {
  asset: AssetEvidenceRows['asset'];
  input: AssetAttentionInput;
  sourceCounts: AttentionSourceCounts;
  closedOrCancelledCaseIds: string[];
  predictiveAvailability: AssetEvidenceRows['predictive']['availability'];
}

/** Converts privacy-allowlisted P4.1 rows into the exact pure-calculation input.
 * No persistence object is spread into a public contract. */
export function projectAttentionRows(row: AssetEvidenceRows, asOf: Date): AssetAttentionRows {
  const assessments = [...row.assessments].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || b.id.localeCompare(a.id));
  const latestAssessment = new Map<string, typeof row.assessments[number]>();
  for (const item of assessments) if (!latestAssessment.has(item.caseId)) latestAssessment.set(item.caseId, item);
  const latestInspection = new Map<string, typeof row.history.inspections[number]>();
  for (const item of row.history.inspections) if (!latestInspection.has(item.caseId)) latestInspection.set(item.caseId, item);
  const estimates = [...row.estimates].sort((a, b) => b.estimateVersion - a.estimateVersion || b.id.localeCompare(a.id));
  const activeEstimate = new Map<string, typeof row.estimates[number]>();
  for (const item of estimates) if (item.status === 'ACTIVE' && !activeEstimate.has(item.caseId)) activeEstimate.set(item.caseId, item);
  const cases: AttentionCaseInput[] = row.cases.map(item => {
    const assessment = latestAssessment.get(item.id), estimate = activeEstimate.get(item.id);
    return { id: item.id, status: item.status, riskLevel: item.riskLevel, priorityLevel: item.priorityLevel, emergencyFlag: item.emergencyFlag,
      currentInspectionId: latestInspection.get(item.id)?.id ?? null,
      latestAssessment: assessment ? { id: assessment.id, inspectionId: assessment.inspectionId, assessmentVersion: assessment.assessmentVersion, riskLevel: assessment.riskLevel, priorityLevel: assessment.priorityLevel } : null,
      activeEstimate: estimate ? { id: estimate.id, estimatedDurationDays: estimate.estimatedDurationDays, valid: estimate.estimatedDurationDays === null || (Number.isInteger(estimate.estimatedDurationDays) && estimate.estimatedDurationDays > 0) } : null };
  });
  const caseByPlan = new Map(row.plans.map(item => [item.id, item.caseId]));
  const taskById = new Map(row.tasks.map(item => [item.id, item]));
  const evidenceCounts = new Map<string, number>();
  for (const item of row.evidence) evidenceCounts.set(item.executionTaskId, (evidenceCounts.get(item.executionTaskId) ?? 0) + 1);
  const blockers = new Map<string, string[]>();
  for (const item of row.blockers) if (item.resolvedAt === null) blockers.set(item.executionTaskId, [...(blockers.get(item.executionTaskId) ?? []), item.id]);
  const dependencies = new Map<string, string[]>();
  for (const item of row.dependencies) if (taskById.get(item.predecessorTaskId)?.status !== 'VERIFIED') dependencies.set(item.dependentTaskId, [...(dependencies.get(item.dependentTaskId) ?? []), item.predecessorTaskId]);
  const tasks: AttentionTaskInput[] = row.tasks.map(item => ({ id: item.id, caseId: caseByPlan.get(item.executionPlanId) ?? '', status: item.status,
    plannedEndAt: item.plannedEndAt, completionSubmittedAt: item.completionSubmittedAt, verifiedAt: item.verifiedAt,
    evidenceRequired: item.evidenceRequired, evidenceCount: evidenceCounts.get(item.id) ?? 0,
    openBlockerIds: blockers.get(item.id) ?? [], unmetDependencyIds: dependencies.get(item.id) ?? [] }));
  const observations: BaselineObservation[] = row.history.inspections.map(item => {
    const assessment = assessments.find(candidate => candidate.inspectionId === item.id && candidate.caseId === item.caseId);
    return { inspectionId: item.id, caseId: item.caseId, inspectionDate: item.inspectionDate, structuralCondition: item.structuralCondition,
      crackSeverity: item.crackSeverity, corrosionLevel: item.corrosionLevel,
      assessment: assessment ? { id: assessment.id, inspectionId: assessment.inspectionId, assessmentVersion: assessment.assessmentVersion, riskScore: assessment.riskScore } : null };
  });
  const closureCases = new Set(row.closures.map(item => item.caseId));
  const closureMismatchCaseIds = row.cases.filter(item => (item.status === 'CLOSED') !== closureCases.has(item.id) || (item.status === 'CLOSED' && !item.closedAt)).map(item => item.id);
  const terminalTaskOpenBlockerIds = row.tasks.filter(item => terminalTask(item.status) && (blockers.get(item.id)?.length ?? 0) > 0).map(item => item.id);
  const linkMismatchIds = row.assessments.filter(item => {
    const inspection = row.history.inspections.find(candidate => candidate.id === item.inspectionId);
    return !row.cases.some(candidate => candidate.id === item.caseId) || (!!inspection && inspection.caseId !== item.caseId);
  }).map(item => item.caseId);
  const sourceCounts: AttentionSourceCounts = { cases: row.cases.length, activeCases: row.cases.filter(item => !terminalCase(item.status)).length,
    closedOrCancelledCases: row.cases.filter(item => terminalCase(item.status)).length, inspections: row.history.totalInspectionCount,
    assessments: row.assessments.length, tasks: row.tasks.length, evidence: row.evidence.length, blockers: row.blockers.length,
    dependencies: row.dependencies.length, estimates: row.estimates.length, closures: row.closures.length,
    publicReports: row.reports.length, externalObservations: row.observations.length };
  const fingerprintParts = [row.asset.id,
    ...row.cases.map(item => `case:${item.id}:${item.status}:${item.riskLevel ?? ''}:${item.priorityLevel ?? ''}`),
    ...row.history.inspections.map(item => `inspection:${item.id}:${item.inspectionDate.toISOString()}`),
    ...row.assessments.map(item => `assessment:${item.id}:${item.assessmentVersion}`),
    ...row.tasks.map(item => `task:${item.id}:${item.status}`), ...row.evidence.map(item => `evidence:${item.id}`),
    ...row.blockers.map(item => `blocker:${item.id}:${item.resolvedAt?.toISOString() ?? ''}`), ...row.dependencies.map(item => `dependency:${item.id}`),
    ...row.estimates.map(item => `estimate:${item.id}:${item.status}:${item.estimateVersion}`), ...row.closures.map(item => `closure:${item.id}`),
    ...row.reports.map(item => `report:${item.id}`), ...row.observations.map(item => `observation:${item.id}:${item.sourceVersion}:${item.schemaVersion}`)
  ].sort();
  const sourceSetFingerprint = `sha256:${createHash('sha256').update(JSON.stringify(fingerprintParts)).digest('hex')}`;
  const referencesTruncated = row.history.truncated || row.reports.length > ATTENTION_SOURCE_REFERENCE_LIMIT || row.observations.length > ATTENTION_SOURCE_REFERENCE_LIMIT;
  return { asset: row.asset, sourceCounts, closedOrCancelledCaseIds: row.cases.filter(item => terminalCase(item.status)).map(item => item.id), predictiveAvailability: row.predictive.availability,
    input: { assetId: row.asset.id, baselineContractVersion: ASSET_EVIDENCE_BASELINE_VERSION, baselineCalculationVersion: ASSET_EVIDENCE_CALCULATION_VERSION,
      cases, totalInspectionCount: row.history.totalInspectionCount, history: describeHistory(observations, row.history.totalInspectionCount, asOf),
      evidenceTimestamps: row.evidence.map(item => item.capturedAt), tasks,
      publicReports: row.reports.slice(0, ATTENTION_SOURCE_REFERENCE_LIMIT).map(item => ({ id: item.id, submittedAt: item.submittedAt })),
      externalObservations: row.observations.slice(0, ATTENTION_SOURCE_REFERENCE_LIMIT).map(item => ({ id: item.id, observedAt: item.observedAt, sourceId: item.sourceId, sourceVersion: item.sourceVersion, schemaVersion: item.schemaVersion, qualityState: item.qualityState, validationState: item.validationState, sourceActive: item.source.isActive })),
      linkMismatchIds: [...new Set(linkMismatchIds)], terminalTaskOpenBlockerIds, closureMismatchCaseIds,
      sourceSetFingerprint, sourceReferencesTruncated: referencesTruncated } };
}

type EvidenceRepository = ReturnType<typeof createAssetEvidenceRepository>;
export function createAssetAttentionRepository(repository: EvidenceRepository = createAssetEvidenceRepository(), clock: () => Date = () => new Date()) {
  return {
    async page(principal: OrganizationalPrincipal, query: BaselineQuery = {}) {
      const asOf = clock(), result = await repository.page(principal, query);
      return { ...result, items: result.items.map(row => projectAttentionRows(row, asOf)) };
    },
    async traverse(principal: OrganizationalPrincipal, query: Omit<BaselineQuery, 'cursor' | 'limit'>, consume: (rows: AssetAttentionRows[]) => void) {
      const asOf = clock();
      return repository.traverse(principal, query, rows => consume(rows.map(row => projectAttentionRows(row, asOf))));
    }
  };
}
