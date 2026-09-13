import { createHash } from 'node:crypto';
import { z } from 'zod';
import prisma from '../../lib/prisma';
import { Prisma } from '../../generated/prisma';
import { parseUuidQuery } from '../../lib/pagination';
import { buildAssetReadWhere, buildCaseReadWhere, type OrganizationalPrincipal } from '../../security/organizational-scope';
import { maintenanceResources, MAX_MAINTENANCE_CASES, type MaintenanceCase } from './maintenance-scenario.contracts';

export const MAINTENANCE_BATCH_SIZE = 500;
export class MaintenanceSnapshotError extends Error {
  constructor(public readonly code: 'RESOURCE_NOT_FOUND' | 'SNAPSHOT_LIMIT_EXCEEDED' | 'SNAPSHOT_UNAVAILABLE') { super(code); }
}
const assetSelect = { id: true, departmentId: true, jurisdictionId: true } as const;
const caseSelect = {
  id: true, assetId: true, status: true, priorityLevel: true, riskLevel: true,
  emergencyFlag: true, createdAt: true, updatedAt: true,
  inspections: { take: 1, orderBy: [{ inspectionDate: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
    select: { id: true, inspectionDate: true, createdAt: true, hospitalRoute: true } }
} satisfies Prisma.CaseSelect;
const estimateSelect = {
  id: true, caseId: true, estimateVersion: true, status: true, currency: true,
  estimatedCostMinor: true, estimatedDurationDays: true, resourceRequirements: true,
  preparedAt: true, createdAt: true, estimateBasis: true, sourceReference: true
} as const;
const resources = z.array(z.object({ category: z.enum(maintenanceResources), quantity: z.number().int().nonnegative().safe().nullable(), unit: z.literal('UNIT_DAYS') }).strict()).max(maintenanceResources.length)
  .refine(rows => new Set(rows.map(r => r.category)).size === rows.length);
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const after = (id?: string) => id ? { id: { gt: id } } : {};
const lexical = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;

/** All reads share one repeatable-read snapshot. No partial result is returned on failure.
 * Source prose is represented only by digests; JSON is validated, never spread into DTOs. */
export function createMaintenanceScenarioRepository(db: Pick<typeof prisma, '$transaction'> = prisma, clock = () => new Date()) {
  return {
    async snapshot(principal: OrganizationalPrincipal, query: { assetId?: unknown; caseId?: unknown } = {}) {
      const requestedAsset = parseUuidQuery(query.assetId, 'assetId');
      const requestedCase = parseUuidQuery(query.caseId, 'caseId');
      try {
        return await db.$transaction(async tx => {
          let assetId = requestedAsset;
          if (assetId && !await tx.asset.findFirst({ where: { AND: [buildAssetReadWhere(principal), { id: assetId }] }, select: { id: true } })) throw new MaintenanceSnapshotError('RESOURCE_NOT_FOUND');
          if (requestedCase) {
            const linked = await tx.case.findFirst({ where: { AND: [buildCaseReadWhere(principal), { id: requestedCase }] }, select: { assetId: true } });
            if (!linked || (assetId && linked.assetId !== assetId)) throw new MaintenanceSnapshotError('RESOURCE_NOT_FOUND');
            assetId = linked.assetId;
          }
          const asOf = clock().toISOString();
          const assets: Prisma.AssetGetPayload<{ select: typeof assetSelect }>[] = [];
          const cases: MaintenanceCase[] = [];
          const caseSources: { caseId: string; updatedAt: string; inspectionId: string | null; inspectionDate: string | null }[] = [];
          const estimateSources: { id: string; caseId: string; version: number; status: string; preparedAt: string; createdAt: string; basisDigest: string; sourceReferenceDigest: string }[] = [];
          let assetCursor: string | undefined;
          for (;;) {
            const batch = await tx.asset.findMany({ where: { AND: [buildAssetReadWhere(principal), assetId ? { id: assetId } : {}, after(assetCursor)] }, select: assetSelect, orderBy: { id: 'asc' }, take: MAINTENANCE_BATCH_SIZE });
            assets.push(...batch);
            if (batch.length) {
              let caseCursor: string | undefined;
              for (;;) {
                const work = await tx.case.findMany({ where: { AND: [buildCaseReadWhere(principal), { assetId: { in: batch.map(a => a.id) } }, requestedCase ? { id: requestedCase } : {}, after(caseCursor)] }, select: caseSelect, orderBy: { id: 'asc' }, take: MAINTENANCE_BATCH_SIZE });
                if (cases.length + work.length > MAX_MAINTENANCE_CASES) throw new MaintenanceSnapshotError('SNAPSHOT_LIMIT_EXCEEDED');
                const byCase = new Map<string, unknown[]>(work.map(c => [c.id, []]));
                if (work.length) {
                  let estimateCursor: string | undefined;
                  for (;;) {
                    const estimates = await tx.caseResourceEstimate.findMany({ where: { AND: [{ caseId: { in: work.map(c => c.id) }, case: buildCaseReadWhere(principal) }, after(estimateCursor)] }, select: estimateSelect, orderBy: { id: 'asc' }, take: MAINTENANCE_BATCH_SIZE });
                    for (const e of estimates) {
                      const parsed = resources.safeParse(e.resourceRequirements);
                      const target = byCase.get(e.caseId)!;
                      // null is a controlled invalid-resource marker, not an empty valid declaration.
                      target.push({ id: e.id, estimateVersion: e.estimateVersion, status: e.status, currency: e.currency,
                        estimatedCostMinor: e.estimatedCostMinor?.toString() ?? null, estimatedDurationDays: e.estimatedDurationDays,
                        resourceRequirements: parsed.success ? parsed.data.sort((a, b) => lexical(a.category, b.category)) : null,
                        resourcesComplete: null });
                      if (target.length > 1000) throw new MaintenanceSnapshotError('SNAPSHOT_LIMIT_EXCEEDED');
                      estimateSources.push({ id: e.id, caseId: e.caseId, version: e.estimateVersion, status: e.status, preparedAt: e.preparedAt.toISOString(), createdAt: e.createdAt.toISOString(), basisDigest: digest(e.estimateBasis), sourceReferenceDigest: digest(e.sourceReference) });
                    }
                    if (estimates.length < MAINTENANCE_BATCH_SIZE) break;
                    estimateCursor = estimates[estimates.length - 1].id;
                  }
                }
                for (const c of work) {
                  cases.push({ caseId: c.id, assetId: c.assetId, authorized: true, status: c.status, priorityLevel: c.priorityLevel, riskLevel: c.riskLevel, emergencyFlag: c.emergencyFlag, hospitalRoute: c.inspections[0]?.hospitalRoute ?? null, createdAt: c.createdAt.toISOString(), estimates: byCase.get(c.id)! });
                  caseSources.push({ caseId: c.id, updatedAt: c.updatedAt.toISOString(), inspectionId: c.inspections[0]?.id ?? null, inspectionDate: c.inspections[0]?.inspectionDate.toISOString() ?? null });
                }
                if (work.length < MAINTENANCE_BATCH_SIZE) break;
                caseCursor = work[work.length - 1].id;
              }
            }
            if (batch.length < MAINTENANCE_BATCH_SIZE) break;
            assetCursor = batch[batch.length - 1].id;
          }
          cases.sort((a, b) => lexical(a.caseId, b.caseId));
          for (const c of cases) c.estimates.sort((a, b) => lexical((a as { id: string }).id, (b as { id: string }).id));
          assets.sort((a, b) => lexical(a.id, b.id));
          caseSources.sort((a, b) => lexical(a.caseId, b.caseId));
          estimateSources.sort((a, b) => lexical(a.id, b.id));
          const activeCount = (c: MaintenanceCase) => c.estimates.filter(e => (e as { status: string }).status === 'ACTIVE').length;
          const represented = new Set(cases.map(c => c.assetId));
          const fingerprintInputs = { assets, cases, caseSources, estimateSources };
          return { complete: true as const, snapshot: { asOf, cases }, fingerprintInputs, sourceSetFingerprint: digest(JSON.stringify(fingerprintInputs)),
            coverage: { assets: assets.length, cases: cases.length, zeroCaseAssets: assets.filter(a => !represented.has(a.id)).length, noActiveEstimateCases: cases.filter(c => activeCount(c) === 0).length, multipleActiveEstimateCases: cases.filter(c => activeCount(c) > 1).length },
            disclosures: ['Resource completeness is not recorded; it remains unknown.', 'Terminal Cases are retained for explicit OUT_OF_SCOPE calculation.', 'Case filters restrict both work and Asset coverage. No history is silently truncated.'] };
        }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead, timeout: 30000, maxWait: 5000 });
      } catch (error) {
        if (error instanceof MaintenanceSnapshotError) throw error;
        throw new MaintenanceSnapshotError('SNAPSHOT_UNAVAILABLE');
      }
    }
  };
}
