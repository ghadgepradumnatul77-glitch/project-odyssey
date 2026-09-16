import { createHash } from 'node:crypto';
import prisma from '../../lib/prisma';
import { Prisma } from '../../generated/prisma';
import { parseUuidQuery } from '../../lib/pagination';
import { buildAssetReadWhere, buildCaseReadWhere, type OrganizationalPrincipal } from '../../security/organizational-scope';

export const OUTCOME_SOURCE_BATCH_SIZE = 500;
// Safety bound is not a history window: exceeding it fails the entire request.
export const OUTCOME_SOURCE_ROW_LIMIT = 100000;
export class OutcomeRepositoryError extends Error {
  constructor(public readonly code: 'ASSET_NOT_FOUND' | 'OUTCOME_SOURCE_LIMIT' | 'OUTCOME_SOURCE_UNAVAILABLE') { super(code); }
}
const assetSelect = { id: true, departmentId: true, jurisdictionId: true, createdAt: true, updatedAt: true } as const;
const caseSelect = { id: true, assetId: true, status: true, riskLevel: true, priorityLevel: true, createdAt: true, updatedAt: true, closedAt: true } as const;
const inspectionSelect = { id: true, caseId: true, inspectionDate: true, createdAt: true, updatedAt: true, structuralCondition: true, crackSeverity: true, corrosionLevel: true } as const;
const riskSelect = { id: true, caseId: true, inspectionId: true, riskScore: true, riskLevel: true, priorityLevel: true, assessmentVersion: true, sourceFingerprint: true, createdAt: true } as const;
const orpSelect = { id: true, caseId: true, riskAssessmentId: true, versionNumber: true, planVersion: true, governanceMode: true, actionPlanContractVersion: true, decisionPackageId: true, status: true, createdAt: true, updatedAt: true } as const;
const decisionSelect = { id: true, caseId: true, orpId: true, decisionType: true, authorityGrantId: true, createdAt: true } as const;
const planSelect = { id: true, caseId: true, orpId: true, approvalDecisionId: true, status: true, templateVersion: true, executionContractVersion: true, governanceMode: true, createdAt: true, updatedAt: true, startedAt: true, completedAt: true, cancelledAt: true, plannedStartAt: true, plannedEndAt: true } as const;
const taskSelect = { id: true, executionPlanId: true, sequenceNumber: true, sourceActionCode: true, templateTaskKey: true, isMandatory: true, status: true, evidenceRequired: true, verificationRequired: true, assignedToId: true, assignedAt: true, completionSubmittedById: true, completionSubmittedAt: true, verifiedById: true, verifiedAt: true, startedAt: true, cancelledAt: true, createdAt: true, updatedAt: true, sourceTemplateCode: true, sourceTemplateVersion: true, approvedActionVersionId: true, governedExecutionTemplateId: true, governedTaskTemplateId: true, sourceActionVersion: true, plannedStartAt: true, plannedEndAt: true } as const;
const evidenceSelect = { id: true, executionTaskId: true, capturedAt: true, submittedAt: true, evidenceType: true } as const;
const closureSelect = { id: true, caseId: true, executionPlanId: true, closureReason: true, createdAt: true } as const;
const estimateSelect = { id: true, caseId: true, estimateVersion: true, status: true, estimatedDurationDays: true, preparedAt: true, createdAt: true, preparedById: true, estimateBasis: true, sourceReference: true } as const;
const hash = (text: string) => 'sha256:' + createHash('sha256').update(text).digest('hex');
const compareId = (a: { id: string }, b: { id: string }) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
const after = (id?: string) => id ? { id: { gt: id } } : {};
type Budget = { rows: number };
async function collect<T extends { id: string }>(read: (cursor?: string) => Promise<T[]>, budget: Budget): Promise<T[]> {
  const all: T[] = []; let cursor: string | undefined;
  for (;;) {
    const rows = await read(cursor);
    budget.rows += rows.length;
    if (budget.rows > OUTCOME_SOURCE_ROW_LIMIT) throw new OutcomeRepositoryError('OUTCOME_SOURCE_LIMIT');
    all.push(...rows);
    if (rows.length < OUTCOME_SOURCE_BATCH_SIZE) return all.sort(compareId);
    const next = rows.at(-1)!.id;
    if (cursor !== undefined && next <= cursor) throw new OutcomeRepositoryError('OUTCOME_SOURCE_UNAVAILABLE');
    cursor = next;
  }
}

async function loadBatch(tx: Prisma.TransactionClient, ids: string[], principal: OrganizationalPrincipal, budget: Budget) {
  const casesWhere: Prisma.CaseWhereInput = { AND: [buildCaseReadWhere(principal), { assetId: { in: ids } }] };
  const linked = { case: casesWhere };
  const planWhere = { executionPlan: linked };
  const paging = (cursor?: string) => ({ orderBy: { id: 'asc' as const }, take: OUTCOME_SOURCE_BATCH_SIZE, where: after(cursor) });
  // Flat queries, never nested per-parent take or per-Asset/Case queries.
  const cases = await collect(cursor => tx.case.findMany({ ...paging(cursor), where: { AND: [casesWhere, after(cursor)] }, select: caseSelect }), budget);
  const inspections = await collect(cursor => tx.inspection.findMany({ ...paging(cursor), where: { ...linked, ...after(cursor) }, select: inspectionSelect }), budget);
  const assessments = await collect(cursor => tx.riskAssessment.findMany({ ...paging(cursor), where: { ...linked, ...after(cursor) }, select: riskSelect }), budget);
  const orps = await collect(cursor => tx.operationalResponsePlan.findMany({ ...paging(cursor), where: { ...linked, ...after(cursor) }, select: orpSelect }), budget);
  const decisions = await collect(cursor => tx.orpDecision.findMany({ ...paging(cursor), where: { ...linked, ...after(cursor) }, select: decisionSelect }), budget);
  const plans = await collect(cursor => tx.executionPlan.findMany({ ...paging(cursor), where: { ...linked, ...after(cursor) }, select: planSelect }), budget);
  const tasks = await collect(cursor => tx.executionTask.findMany({ ...paging(cursor), where: { ...planWhere, ...after(cursor) }, select: taskSelect }), budget);
  const evidence = await collect(cursor => tx.executionEvidence.findMany({ ...paging(cursor), where: { executionTask: planWhere, ...after(cursor) }, select: evidenceSelect }), budget);
  const closures = await collect(cursor => tx.caseClosure.findMany({ ...paging(cursor), where: { ...linked, ...after(cursor) }, select: closureSelect }), budget);
  const estimateRows = await collect(cursor => tx.caseResourceEstimate.findMany({ ...paging(cursor), where: { ...linked, ...after(cursor) }, select: estimateSelect }), budget);
  const estimates = estimateRows.map(({ estimateBasis, sourceReference, ...facts }) => ({ ...facts, estimateBasisDigest: hash(estimateBasis), sourceReferenceDigest: hash(sourceReference) }));
  return { cases, inspections, assessments, orps, decisions, plans, tasks, evidence, closures, estimates };
}
type Iso<T> = T extends Date ? string : T extends Array<infer V> ? Iso<V>[] : T extends object ? { [K in keyof T]: Iso<T[K]> } : T;
const iso = <T>(value: T): Iso<T> => JSON.parse(JSON.stringify(value)) as Iso<T>;

/** Complete source facts, not outcome metrics. All history is retained; no implicit pair selection.
 * Window/cohort selection belongs to the future service, not this source repository. */
export function createRecordedOutcomesRepository(db: Pick<typeof prisma, '$transaction'> = prisma, clock = () => new Date()) {
  return {
    async snapshot(principal: OrganizationalPrincipal, query: { assetId?: unknown } = {}) {
      const assetId = parseUuidQuery(query.assetId, 'assetId');
      try {
        return await db.$transaction(async tx => {
          if (assetId && !await tx.asset.findFirst({ where: { AND: [buildAssetReadWhere(principal), { id: assetId }] }, select: { id: true } })) throw new OutcomeRepositoryError('ASSET_NOT_FOUND');
          const asOf = clock().toISOString();
          const budget = { rows: 0 };
          const assets: Prisma.AssetGetPayload<{ select: typeof assetSelect }>[] = [];
          const batches: Awaited<ReturnType<typeof loadBatch>>[] = [];
          let cursor: string | undefined;
          for (;;) {
            const rows = await tx.asset.findMany({ where: { AND: [buildAssetReadWhere(principal), assetId ? { id: assetId } : {}, after(cursor)] }, select: assetSelect, orderBy: { id: 'asc' }, take: OUTCOME_SOURCE_BATCH_SIZE });
            budget.rows += rows.length;
            if (budget.rows > OUTCOME_SOURCE_ROW_LIMIT) throw new OutcomeRepositoryError('OUTCOME_SOURCE_LIMIT');
            assets.push(...rows);
            if (rows.length) batches.push(await loadBatch(tx, rows.map(a => a.id), principal, budget));
            if (rows.length < OUTCOME_SOURCE_BATCH_SIZE) break;
            const next = rows.at(-1)!.id;
            if (cursor !== undefined && next <= cursor) throw new OutcomeRepositoryError('OUTCOME_SOURCE_UNAVAILABLE');
            cursor = next;
          }
          const sources = iso({ assets: assets.sort(compareId),
            cases: batches.flatMap(b=>b.cases).sort(compareId), inspections: batches.flatMap(b=>b.inspections).sort(compareId),
            assessments: batches.flatMap(b=>b.assessments).sort(compareId), orps: batches.flatMap(b=>b.orps).sort(compareId),
            decisions: batches.flatMap(b=>b.decisions).sort(compareId), plans: batches.flatMap(b=>b.plans).sort(compareId),
            tasks: batches.flatMap(b=>b.tasks).sort(compareId), evidence: batches.flatMap(b=>b.evidence).sort(compareId),
            closures: batches.flatMap(b=>b.closures).sort(compareId), estimates: batches.flatMap(b=>b.estimates).sort(compareId) });
          const withCases = new Set(sources.cases.map(c=>c.assetId));
          return { asOf, complete: true as const, sources,
            sourceFingerprint: hash(JSON.stringify(sources)), fingerprintRule: 'SORTED_SOURCE_IDS_ISO_TIMESTAMPS_V1',
            coverage: { counts: Object.fromEntries(Object.entries(sources).map(([key,rows])=>[key,rows.length])), zeroCaseAssets: sources.assets.filter(a=>!withCases.has(a.id)).length,
              historyTruncated: false as const, referencesTruncated: false as const, sourceRowLimit: OUTCOME_SOURCE_ROW_LIMIT, selection: 'ALL_SCOPED_HISTORY_NO_PAIR_SELECTION' as const },
            disclosures: ['Source facts only; no outcomes or recurrence inferred.', 'Estimate-to-execution work linkage is not established by shared Case identity.', 'Empty related arrays mean no recorded rows in this complete snapshot; null timestamps remain unknown.'] };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead, timeout: 30000, maxWait: 5000 });
      } catch (error) {
        if (error instanceof OutcomeRepositoryError) throw error;
        throw new OutcomeRepositoryError('OUTCOME_SOURCE_UNAVAILABLE');
      }
    }
  };
}
