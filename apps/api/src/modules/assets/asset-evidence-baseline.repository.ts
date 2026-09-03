import prisma from '../../lib/prisma';
import { Prisma, SystemRole } from '../../generated/prisma';
import { buildAssetReadWhere, hasGlobalReadVisibility, type OrganizationalPrincipal } from '../../security/organizational-scope';
import { parseCursor, parseLimit, parseUuidQuery, pageFromRows } from '../../lib/pagination';
import { BASELINE_HISTORY_LIMIT } from './asset-evidence-baseline.contracts';

export const EVIDENCE_BATCH_SIZE = 500;
type Database = Pick<typeof prisma, '$transaction'>;
type Tx = Prisma.TransactionClient;
export interface BaselineQuery { limit?: unknown; cursor?: unknown; departmentId?: unknown; jurisdictionId?: unknown; assetId?: unknown }
const assetSelect = { id: true, assetCode: true, assetType: true, departmentId: true, jurisdictionId: true, latitude: true, longitude: true, constructionYear: true, conditionStatus: true, createdAt: true, updatedAt: true } as const;
type Asset = Prisma.AssetGetPayload<{ select: typeof assetSelect }>;

function filters(principal: OrganizationalPrincipal, query: BaselineQuery): Prisma.AssetWhereInput {
  const departmentId = parseUuidQuery(query.departmentId, 'departmentId');
  const jurisdictionId = parseUuidQuery(query.jurisdictionId, 'jurisdictionId');
  const id = parseUuidQuery(query.assetId, 'assetId');
  return { AND: [buildAssetReadWhere(principal), { ...(departmentId ? { departmentId } : {}), ...(jurisdictionId ? { jurisdictionId } : {}), ...(id ? { id } : {}) }] };
}
const after = (id?: string) => id ? { id: { gt: id } } : {};
async function collect<T extends { id: string }>(read: (cursor?: string) => Promise<T[]>): Promise<T[]> {
  const result: T[] = []; let cursor: string | undefined;
  for (;;) {
    const rows = await read(cursor); result.push(...rows);
    if (rows.length < EVIDENCE_BATCH_SIZE) return result;
    cursor = rows[rows.length - 1].id;
  }
}

export interface InspectionRow {
  id: string; caseId: string; assetId: string; inspectionDate: Date; createdAt: Date; updatedAt: Date;
  structuralCondition: string; crackSeverity: string; corrosionLevel: string;
  trafficImportance: string; hospitalRoute: boolean; weatherRisk: string; heavyRainExpected: boolean;
  estimatedDailyUsers: number | null; totalInspectionCount: bigint;
}

/** Windowed SQL is necessary: Prisma's flat take:101 would cap the whole batch,
 * and a per-asset findMany would be N+1. IDs originate only from scoped Assets. */
async function inspections(tx: Tx, ids: string[]): Promise<InspectionRow[]> {
  return tx.$queryRaw<InspectionRow[]>(Prisma.sql`
    WITH ranked AS (
      SELECT i."id", i."caseId", c."assetId", i."inspectionDate", i."createdAt", i."updatedAt",
        i."structuralCondition", i."crackSeverity", i."corrosionLevel", i."trafficImportance",
        i."hospitalRoute", i."weatherRisk", i."heavyRainExpected", i."estimatedDailyUsers",
        COUNT(*) OVER (PARTITION BY c."assetId") AS "totalInspectionCount",
        ROW_NUMBER() OVER (PARTITION BY c."assetId" ORDER BY i."inspectionDate" DESC, i."id" DESC) AS rn
      FROM "Inspection" i JOIN "Case" c ON c."id" = i."caseId"
      WHERE c."assetId" IN (${Prisma.join(ids)})
    ) SELECT "id", "caseId", "assetId", "inspectionDate", "createdAt", "updatedAt",
      "structuralCondition", "crackSeverity", "corrosionLevel", "trafficImportance",
      "hospitalRoute", "weatherRisk", "heavyRainExpected", "estimatedDailyUsers", "totalInspectionCount"
    FROM ranked WHERE rn <= ${BASELINE_HISTORY_LIMIT + 1}
    ORDER BY "assetId", "inspectionDate" DESC, "id" DESC
  `);
}

/** Flat, independently batched relations: query count depends on row batches, not asset count.
 * No free text, personnel identities, evidence locators, or predictive payloads are selected. */
async function loadBatch(tx: Tx, assets: Asset[], principal: OrganizationalPrincipal) {
  const ids = assets.map(asset => asset.id);
  if (!ids.length) return [];
  const assetWhere = { assetId: { in: ids } };
  const caseWhere = { case: assetWhere };
  const planWhere = { executionPlan: caseWhere };
  const taskWhere = { executionTask: planWhere };
  const org = hasGlobalReadVisibility(principal) ? {} : { departmentId: principal.departmentId, jurisdictionId: principal.jurisdictionId };
  const predictiveAllowed = principal.role === SystemRole.SYSTEM_ADMIN || principal.role === SystemRole.AUDITOR;
  const [cases, history, assessments, plans, tasks, evidence, blockers, revisions, dependencies, estimates, closures, reports, observations, snapshots, outcomes] = await Promise.all([
    collect(cursor => tx.case.findMany({ where: { ...assetWhere, ...after(cursor) }, select: { id: true, assetId: true, status: true, riskLevel: true, priorityLevel: true, emergencyFlag: true, createdAt: true, updatedAt: true, closedAt: true }, orderBy: { id: 'asc' }, take: EVIDENCE_BATCH_SIZE })),
    inspections(tx, ids),
    collect(cursor => tx.riskAssessment.findMany({ where: { ...caseWhere, ...after(cursor) }, select: { id: true, caseId: true, inspectionId: true, assessmentVersion: true, sourceFingerprint: true, riskScore: true, riskLevel: true, priorityLevel: true, createdAt: true }, orderBy: { id: 'asc' }, take: EVIDENCE_BATCH_SIZE })),
    collect(cursor => tx.executionPlan.findMany({ where: { ...caseWhere, ...after(cursor) }, select: { id: true, caseId: true, status: true, createdAt: true, startedAt: true, completedAt: true, cancelledAt: true, plannedStartAt: true, plannedEndAt: true }, orderBy: { id: 'asc' }, take: EVIDENCE_BATCH_SIZE })),
    collect(cursor => tx.executionTask.findMany({ where: { ...planWhere, ...after(cursor) }, select: { id: true, executionPlanId: true, status: true, isMandatory: true, evidenceRequired: true, verificationRequired: true, assignedAt: true, startedAt: true, completionSubmittedAt: true, verifiedAt: true, cancelledAt: true, plannedStartAt: true, plannedEndAt: true }, orderBy: { id: 'asc' }, take: EVIDENCE_BATCH_SIZE })),
    collect(cursor => tx.executionEvidence.findMany({ where: { ...taskWhere, ...after(cursor) }, select: { id: true, executionTaskId: true, evidenceType: true, capturedAt: true, submittedAt: true }, orderBy: { id: 'asc' }, take: EVIDENCE_BATCH_SIZE })),
    collect(cursor => tx.executionTaskBlockerEvent.findMany({ where: { ...taskWhere, ...after(cursor) }, select: { id: true, executionTaskId: true, category: true, blockedAt: true, resolvedAt: true }, orderBy: { id: 'asc' }, take: EVIDENCE_BATCH_SIZE })),
    collect(cursor => tx.executionScheduleRevision.findMany({ where: { ...planWhere, ...after(cursor) }, select: { id: true, executionPlanId: true, executionTaskId: true, previousStartAt: true, previousEndAt: true, newStartAt: true, newEndAt: true, changedAt: true }, orderBy: { id: 'asc' }, take: EVIDENCE_BATCH_SIZE })),
    collect(cursor => tx.executionTaskDependency.findMany({ where: { ...planWhere, ...after(cursor) }, select: { id: true, executionPlanId: true, predecessorTaskId: true, dependentTaskId: true }, orderBy: { id: 'asc' }, take: EVIDENCE_BATCH_SIZE })),
    collect(cursor => tx.caseResourceEstimate.findMany({ where: { ...caseWhere, ...after(cursor) }, select: { id: true, caseId: true, estimateVersion: true, status: true, currency: true, estimatedCostMinor: true, estimatedDurationDays: true, preparedAt: true }, orderBy: { id: 'asc' }, take: EVIDENCE_BATCH_SIZE })),
    collect(cursor => tx.caseClosure.findMany({ where: { ...caseWhere, ...after(cursor) }, select: { id: true, caseId: true, executionPlanId: true, closureReason: true, createdAt: true }, orderBy: { id: 'asc' }, take: EVIDENCE_BATCH_SIZE })),
    collect(cursor => tx.publicReport.findMany({ where: { AND: [org, { OR: [assetWhere, { createdCase: assetWhere }] }, after(cursor)] }, select: { id: true, assetId: true, createdCaseId: true, status: true, submittedAt: true, reviewStartedAt: true, decisionAt: true }, orderBy: { id: 'asc' }, take: EVIDENCE_BATCH_SIZE })),
    collect(cursor => tx.externalObservation.findMany({ where: { AND: [org, { OR: [assetWhere, caseWhere] }, after(cursor)] }, select: { id: true, assetId: true, caseId: true, sourceId: true, sourceVersion: true, schemaVersion: true, observationType: true, observedAt: true, ingestedAt: true, qualityState: true, validationState: true, source: { select: { isActive: true, contractVersion: true } } }, orderBy: { id: 'asc' }, take: EVIDENCE_BATCH_SIZE })),
    predictiveAllowed ? collect(cursor => tx.predictiveFeatureSnapshot.findMany({ where: { AND: [org, assetWhere, { executionTask: planWhere }, after(cursor)] }, select: { id: true, assetId: true, caseId: true, executionTaskId: true, targetType: true, predictionTimestamp: true, featureContractVersion: true, provenanceClass: true, status: true, createdAt: true, voidedAt: true, replacementSnapshotId: true }, orderBy: { id: 'asc' }, take: EVIDENCE_BATCH_SIZE })) : Promise.resolve([]),
    predictiveAllowed ? collect(cursor => tx.predictiveOutcome.findMany({ where: { AND: [{ snapshot: { AND: [org, assetWhere, { executionTask: planWhere }] } }, after(cursor)] }, select: { id: true, snapshotId: true, outcomeContractVersion: true, outcomeTimestamp: true, outcomeValue: true, provenanceClass: true, status: true, recordedAt: true, voidedAt: true, replacementOutcomeId: true }, orderBy: { id: 'asc' }, take: EVIDENCE_BATCH_SIZE })) : Promise.resolve([])
  ]);
  const caseAsset = new Map(cases.map(row => [row.id, row.assetId]));
  const planAsset = new Map(plans.map(row => [row.id, caseAsset.get(row.caseId)]));
  const taskAsset = new Map(tasks.map(row => [row.id, planAsset.get(row.executionPlanId)]));
  const snapshotAsset = new Map(snapshots.map(row => [row.id, row.assetId]));
  // OR queries already return each database row once. Map buckets also deduplicate by ID.
  function bucket<T extends { id: string }>(rows: T[], owner: (row: T) => (string | null | undefined)[]) {
    const groups = new Map<string, Map<string, T>>();
    for (const row of rows) for (const id of new Set(owner(row))) if (id && ids.includes(id)) {
      if (!groups.has(id)) groups.set(id, new Map()); groups.get(id)!.set(row.id, row);
    }
    return (id: string) => [...(groups.get(id)?.values() ?? [])];
  }
  const byCase = <T extends { id: string; caseId: string }>(rows: T[]) => bucket(rows, row => [caseAsset.get(row.caseId)]);
  const byPlan = <T extends { id: string; executionPlanId: string }>(rows: T[]) => bucket(rows, row => [planAsset.get(row.executionPlanId)]);
  const byTask = <T extends { id: string; executionTaskId: string }>(rows: T[]) => bucket(rows, row => [taskAsset.get(row.executionTaskId)]);
  const group = { cases: bucket(cases, row => [row.assetId]), history: bucket(history, row => [row.assetId]), assessments: byCase(assessments), plans: byCase(plans), tasks: byPlan(tasks), evidence: byTask(evidence), blockers: byTask(blockers), revisions: byPlan(revisions), dependencies: byPlan(dependencies), estimates: byCase(estimates), closures: byCase(closures), reports: bucket(reports, row => [row.assetId, row.createdCaseId ? caseAsset.get(row.createdCaseId) : null]), observations: bucket(observations, row => [row.assetId, row.caseId ? caseAsset.get(row.caseId) : null]), snapshots: bucket(snapshots, row => [row.assetId]), outcomes: bucket(outcomes, row => [snapshotAsset.get(row.snapshotId)]) };
  return assets.map(asset => {
    const fetched = group.history(asset.id);
    const count = Number(fetched[0]?.totalInspectionCount ?? 0n);
    if (!Number.isSafeInteger(count)) throw new Error('BASELINE_INSPECTION_COUNT_UNSAFE');
    return { asset, cases: group.cases(asset.id), history: { totalInspectionCount: count, fetchedInspectionCount: fetched.length, observationsAnalyzed: Math.min(fetched.length, BASELINE_HISTORY_LIMIT), truncated: count > BASELINE_HISTORY_LIMIT, inspections: fetched.slice(0, BASELINE_HISTORY_LIMIT) }, assessments: group.assessments(asset.id), plans: group.plans(asset.id), tasks: group.tasks(asset.id), evidence: group.evidence(asset.id), blockers: group.blockers(asset.id), revisions: group.revisions(asset.id), dependencies: group.dependencies(asset.id), estimates: group.estimates(asset.id), closures: group.closures(asset.id), reports: group.reports(asset.id), observations: group.observations(asset.id), predictive: predictiveAllowed ? { availability: 'AVAILABLE' as const, snapshots: group.snapshots(asset.id), outcomes: group.outcomes(asset.id) } : { availability: 'RESTRICTED' as const, snapshots: null, outcomes: null } };
  });
}
export type AssetEvidenceRows = Awaited<ReturnType<typeof loadBatch>>[number];

export function createAssetEvidenceRepository(db: Database = prisma) {
  return {
    async page(principal: OrganizationalPrincipal, query: BaselineQuery = {}) {
      const scope = filters(principal, query), limit = parseLimit(query.limit), cursor = parseCursor(query.cursor);
      return db.$transaction(async tx => {
        const rows = await tx.asset.findMany({ where: { AND: [scope, cursor ? { OR: [{ createdAt: { lt: new Date(cursor.at) } }, { createdAt: new Date(cursor.at), id: { lt: cursor.id } }] } : {}] }, select: assetSelect, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: limit + 1 });
        const page = pageFromRows(rows, limit, row => row.createdAt.toISOString());
        return { ...page, items: await loadBatch(tx, page.items, principal) };
      }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead, timeout: 30000 });
    },
    /** Internal streaming traversal; callback must only accumulate in-memory results.
     * On any failure callers must discard accumulators. No partial summary is returned. */
    async traverse(principal: OrganizationalPrincipal, query: Omit<BaselineQuery, 'cursor' | 'limit'>, consume: (rows: AssetEvidenceRows[]) => void) {
      const scope = filters(principal, query);
      return db.$transaction(async tx => {
        let cursor: string | undefined; let total = 0;
        for (;;) {
          const assets = await tx.asset.findMany({ where: { AND: [scope, after(cursor)] }, select: assetSelect, orderBy: { id: 'asc' }, take: EVIDENCE_BATCH_SIZE });
          if (assets.length) consume(await loadBatch(tx, assets, principal));
          total += assets.length;
          if (assets.length < EVIDENCE_BATCH_SIZE) return { totalAssets: total, complete: true as const };
          cursor = assets[assets.length - 1].id;
        }
      }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead, timeout: 30000 });
    }
  };
}
