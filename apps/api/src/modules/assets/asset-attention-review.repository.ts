import { SystemRole, UserStatus, type Prisma } from '../../generated/prisma';
import { buildAssetReadWhere, buildAssetMutationWhere, hasGlobalReadVisibility, type OrganizationalPrincipal } from '../../security/organizational-scope';
import { parseLimit, parseCursor, pageFromRows } from '../../lib/pagination';
import type { CreateAssetAttentionReviewInput, AssetAttentionReviewSignalInput, AssetAttentionReviewErrorCode } from './asset-attention-review.contracts';

const assetSelect = { id: true, departmentId: true, jurisdictionId: true } as const;
const signalSelect = { category: true, signalCode: true, state: true, evidenceReferenceFingerprint: true } as const;
export const attentionReviewSelect = {
  id: true, assetId: true, caseId: true, reviewerId: true, reviewerRole: true,
  departmentId: true, jurisdictionId: true, disposition: true, rationale: true,
  attentionContractVersion: true, attentionCalculationVersion: true, projectionAsOf: true,
  sourceSetFingerprint: true, clientRequestId: true, supersedesReviewId: true, createdAt: true,
  selectedSignals: { select: signalSelect, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] as [{ createdAt: 'asc' }, { id: 'asc' }] }
} as const;
type AssetRow = { id: string; departmentId: string; jurisdictionId: string };
export interface AttentionReviewRow {
  id: string; assetId: string; caseId: string | null; reviewerId: string; reviewerRole: string;
  departmentId: string; jurisdictionId: string; disposition: string; rationale: string;
  attentionContractVersion: string; attentionCalculationVersion: string; projectionAsOf: Date;
  sourceSetFingerprint: string; clientRequestId: string; supersedesReviewId: string | null; createdAt: Date;
  selectedSignals: { category: string; signalCode: string; state: string; evidenceReferenceFingerprint: string }[];
}
interface ReviewWhere {
  id?: string; assetId?: string; caseId?: string | null; reviewerId?: string; clientRequestId?: string;
  departmentId?: string; jurisdictionId?: string; supersededBy?: null;
  asset?: Prisma.AssetWhereInput;
  AND?: ReviewWhere[];
  OR?: ReviewWhere[];
  createdAt?: Date | { lt: Date };
  // Keyset IDs are expressed separately in the paging clause below.
}
type QueryWhere = Omit<ReviewWhere, 'id' | 'AND' | 'OR'> & { id?: string | { lt: string }; AND?: QueryWhere[]; OR?: QueryWhere[] };
export interface ReviewAppendData {
  assetId: string; caseId: string | null; reviewerId: string; reviewerRole: SystemRole;
  departmentId: string; jurisdictionId: string; disposition: CreateAssetAttentionReviewInput['disposition'];
  rationale: string; clientRequestId: string; supersedesReviewId: string | null;
  attentionContractVersion: string; attentionCalculationVersion: string; projectionAsOf: Date; sourceSetFingerprint: string;
  selectedSignals: { create: AssetAttentionReviewSignalInput[] };
}
/** Narrow caller-owned transaction port until the pending schema is integrated with the generated client.
 * No default/global client, transaction creation, commit, raw SQL, update or delete operations. */
export interface AttentionReviewTransaction {
  asset: { findFirst(args: { where: Prisma.AssetWhereInput; select: typeof assetSelect }): PromiseLike<AssetRow | null> };
  case: { findFirst(args: { where: Prisma.CaseWhereInput; select: { id: true; assetId: true } }): PromiseLike<{ id: string; assetId: string } | null> };
  assetAttentionReview: {
    findFirst(args: { where: QueryWhere; select: typeof attentionReviewSelect }): PromiseLike<AttentionReviewRow | null>;
    findMany(args: { where: QueryWhere; select: typeof attentionReviewSelect; orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]; take: number }): PromiseLike<AttentionReviewRow[]>;
    create(args: { data: ReviewAppendData; select: typeof attentionReviewSelect }): PromiseLike<AttentionReviewRow>;
  };
}
export class AttentionReviewRepositoryError extends Error {
  constructor(readonly code: AssetAttentionReviewErrorCode) { super(code); }
}
type ProjectionMetadata = Pick<ReviewAppendData, 'attentionContractVersion' | 'attentionCalculationVersion' | 'projectionAsOf' | 'sourceSetFingerprint'>;

export function createAssetAttentionReviewRepository(tx: AttentionReviewTransaction) {
  const missing = () => new AttentionReviewRepositoryError('RESOURCE_NOT_FOUND');
  function assertWriter(principal: OrganizationalPrincipal) {
    if (principal.status !== UserStatus.ACTIVE || principal.role !== SystemRole.OFFICER) throw new AttentionReviewRepositoryError('REVIEW_FORBIDDEN');
  }
  function scope(principal: OrganizationalPrincipal): QueryWhere {
    if (principal.status !== UserStatus.ACTIVE) throw new AttentionReviewRepositoryError('REVIEW_FORBIDDEN');
    return hasGlobalReadVisibility(principal) ? {} : {
      departmentId: principal.departmentId, jurisdictionId: principal.jurisdictionId,
      asset: buildAssetReadWhere(principal)
    };
  }
  async function findAsset(principal: OrganizationalPrincipal, assetId: string, write = false) {
    if (write) assertWriter(principal);
    else scope(principal);
    const asset = await tx.asset.findFirst({ where: { id: assetId, AND: [write ? buildAssetMutationWhere(principal) : buildAssetReadWhere(principal)] }, select: assetSelect });
    if (!asset) throw missing();
    return asset;
  }
  async function validateCaseLink(principal: OrganizationalPrincipal, assetId: string, caseId?: string) {
    await findAsset(principal, assetId, true);
    if (caseId === undefined) return null;
    const row = await tx.case.findFirst({ where: { id: caseId, asset: buildAssetMutationWhere(principal) }, select: { id: true, assetId: true } });
    if (!row) throw missing();
    if (row.assetId !== assetId) throw new AttentionReviewRepositoryError('INVALID_CASE_LINKAGE');
    return row;
  }
  async function validateSupersedesLink(principal: OrganizationalPrincipal, assetId: string, caseId: string | null, reviewId?: string) {
    await findAsset(principal, assetId, true);
    if (reviewId === undefined) return null;
    const row = await tx.assetAttentionReview.findFirst({ where: { id: reviewId, AND: [scope(principal)] }, select: attentionReviewSelect });
    if (!row) throw missing();
    if (row.assetId !== assetId || row.caseId !== caseId || row.reviewerId !== principal.id) throw new AttentionReviewRepositoryError('INVALID_SUPERSESSION_LINKAGE');
    const current = await tx.assetAttentionReview.findFirst({ where: { id: reviewId, supersededBy: null, AND: [scope(principal)] }, select: attentionReviewSelect });
    if (!current) throw new AttentionReviewRepositoryError('INVALID_SUPERSESSION_LINKAGE');
    return current;
  }
  async function findReplay(principal: OrganizationalPrincipal, clientRequestId: string) {
    return tx.assetAttentionReview.findFirst({ where: { reviewerId: principal.id, clientRequestId, AND: [scope(principal)] }, select: attentionReviewSelect });
  }
  async function history(principal: OrganizationalPrincipal, assetId: string, query: { limit?: unknown; cursor?: unknown } = {}) {
    const limit = parseLimit(query.limit), cursor = parseCursor(query.cursor);
    await findAsset(principal, assetId);
    const after: QueryWhere = cursor ? { OR: [{ createdAt: { lt: new Date(cursor.at) } }, { createdAt: new Date(cursor.at), id: { lt: cursor.id } }] } : {};
    const rows = await tx.assetAttentionReview.findMany({ where: { assetId, AND: [scope(principal), after] }, select: attentionReviewSelect, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: limit + 1 });
    return pageFromRows(rows, limit, row => row.createdAt.toISOString());
  }
  async function append(principal: OrganizationalPrincipal, assetId: string, input: CreateAssetAttentionReviewInput, projection: ProjectionMetadata) {
    const asset = await findAsset(principal, assetId, true);
    await validateCaseLink(principal, assetId, input.caseId);
    await validateSupersedesLink(principal, assetId, input.caseId ?? null, input.supersedesReviewId);
    // Explicit copying prevents runtime excess properties from becoming persistence fields.
    return tx.assetAttentionReview.create({ data: {
      assetId: asset.id, caseId: input.caseId ?? null, reviewerId: principal.id, reviewerRole: principal.role,
      departmentId: asset.departmentId, jurisdictionId: asset.jurisdictionId,
      disposition: input.disposition, rationale: input.rationale, clientRequestId: input.clientRequestId,
      supersedesReviewId: input.supersedesReviewId ?? null,
      attentionContractVersion: projection.attentionContractVersion, attentionCalculationVersion: projection.attentionCalculationVersion,
      projectionAsOf: projection.projectionAsOf, sourceSetFingerprint: projection.sourceSetFingerprint,
      selectedSignals: { create: input.selectedSignals.map(s => ({ category: s.category, signalCode: s.signalCode, state: s.state, evidenceReferenceFingerprint: s.evidenceReferenceFingerprint })) }
    }, select: attentionReviewSelect });
  }
  return { findAsset, validateCaseLink, validateSupersedesLink, findReplay, history, append };
}
