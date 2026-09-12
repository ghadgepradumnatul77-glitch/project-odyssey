import { Prisma, SystemRole, UserStatus } from '../../generated/prisma';
import prisma from '../../lib/prisma';
import type { OrganizationalPrincipal } from '../../security/organizational-scope';
import { sha256Fingerprint } from '../trusted-computation/trusted-computation.provider';
import { appendIntegrityEvent, integrityTextDigest, type AppendIntegrityInput } from '../integrity/integrity.service';
import { loadAssetEvidenceInTransaction } from './asset-evidence-baseline.repository';
import { projectAttentionRows } from './asset-attention.repository';
import { deriveAssetAttention } from './asset-attention.calculations';
import type { AssetAttentionProjection, AttentionSignal } from './asset-attention.contracts';
import { createAssetAttentionReviewRepository, AttentionReviewRepositoryError, type AttentionReviewTransaction, type AttentionReviewRow } from './asset-attention-review.repository';
import { validateAssetAttentionReview } from './asset-attention-review.validation';
import { ASSET_ATTENTION_REVIEW_CONTRACT_VERSION, attentionReviewErrors, type AssetAttentionReviewErrorCode, type AssetAttentionReviewSuccess, type AssetAttentionReviewSignalInput, type CreateAssetAttentionReviewInput } from './asset-attention-review.contracts';

type Transaction = Prisma.TransactionClient & AttentionReviewTransaction;
interface Dependencies {
  transaction<T>(run: (tx: Transaction) => Promise<T>): Promise<T>;
  project(tx: Transaction, principal: OrganizationalPrincipal, assetId: string, asOf: Date): Promise<AssetAttentionProjection>;
  integrity(tx: Transaction, input: AppendIntegrityInput): Promise<unknown>;
  clock(): Date;
}
export class AttentionReviewServiceError extends Error {
  readonly status: number;
  constructor(readonly code: AssetAttentionReviewErrorCode) {
    super(attentionReviewErrors[code].message); this.status = attentionReviewErrors[code].status;
  }
}
const defaults: Dependencies = {
  transaction: run => prisma.$transaction(async tx => {
    return run(tx);
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000, maxWait: 5000 }),
  async project(tx, principal, assetId, asOf) {
    const row = await loadAssetEvidenceInTransaction(tx, principal, assetId);
    if (!row) throw new AttentionReviewServiceError('RESOURCE_NOT_FOUND');
    return deriveAssetAttention(projectAttentionRows(row, asOf).input, asOf);
  },
  integrity: appendIntegrityEvent,
  clock: () => new Date()
};

/** Hash only stable, allowlisted reference facts; elapsed ages change without evidence changes. */
export function reviewSignalFingerprint(signal: AttentionSignal): string {
  const references = signal.evidenceReferences.map(r => ({ resourceType: r.resourceType, resourceId: r.resourceId,
    caseId: r.caseId ?? null, version: r.version ?? null, timestamp: r.timestamp ?? null, timestampState: r.timestampState ?? null }));
  references.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return sha256Fingerprint({ references, referencesTruncated: signal.referencesTruncated });
}
const signalKey = (s: AssetAttentionReviewSignalInput) => JSON.stringify([s.category, s.signalCode, s.state, s.evidenceReferenceFingerprint]);
function payload(assetId: string, input: CreateAssetAttentionReviewInput) {
  return JSON.stringify([assetId, input.caseId ?? null, input.supersedesReviewId ?? null, input.disposition,
    input.rationale, input.expectedSourceSetFingerprint, input.selectedSignals.map(signalKey).sort()]);
}
function replayMatches(row: AttentionReviewRow, assetId: string, input: CreateAssetAttentionReviewInput) {
  return payload(assetId, input) === payload(row.assetId, {
    disposition: row.disposition as CreateAssetAttentionReviewInput['disposition'], rationale: row.rationale,
    clientRequestId: row.clientRequestId, expectedSourceSetFingerprint: row.sourceSetFingerprint,
    caseId: row.caseId ?? undefined, supersedesReviewId: row.supersedesReviewId ?? undefined,
    selectedSignals: row.selectedSignals as AssetAttentionReviewSignalInput[]
  });
}
function response(row: AttentionReviewRow, outcome: 'CREATED' | 'IDEMPOTENT_REPLAY'): AssetAttentionReviewSuccess {
  return { success: true, data: { contractVersion: ASSET_ATTENTION_REVIEW_CONTRACT_VERSION, outcome, review: {
    id: row.id, assetId: row.assetId, caseId: row.caseId, reviewerId: row.reviewerId, reviewerRole: row.reviewerRole,
    departmentId: row.departmentId, jurisdictionId: row.jurisdictionId, disposition: row.disposition as CreateAssetAttentionReviewInput['disposition'],
    rationale: row.rationale, attentionContractVersion: row.attentionContractVersion, attentionCalculationVersion: row.attentionCalculationVersion,
    projectionAsOf: row.projectionAsOf.toISOString(), sourceSetFingerprint: row.sourceSetFingerprint, clientRequestId: row.clientRequestId,
    supersedesReviewId: row.supersedesReviewId, createdAt: row.createdAt.toISOString(),
    selectedSignals: row.selectedSignals.map(s => ({ category: s.category, signalCode: s.signalCode, state: s.state, evidenceReferenceFingerprint: s.evidenceReferenceFingerprint })) as AssetAttentionReviewSignalInput[]
  } } };
}
export function createAssetAttentionReviewService(dependencies: Partial<Dependencies> = {}) {
  const deps = { ...defaults, ...dependencies };
  return {
    async history(principal: OrganizationalPrincipal | undefined, assetId: string, query: { limit?: unknown; cursor?: unknown } = {}) {
      if (!principal) throw new AttentionReviewServiceError('AUTHENTICATION_REQUIRED');
      try {
        return await deps.transaction(async tx => {
          const page = await createAssetAttentionReviewRepository(tx).history(principal, assetId, query);
          return { items: page.items.map(row => response(row, 'CREATED').data.review), limit: page.limit, nextCursor: page.nextCursor };
        });
      } catch (error) {
        if (error instanceof AttentionReviewServiceError) throw error;
        if (error instanceof AttentionReviewRepositoryError) throw new AttentionReviewServiceError(error.code);
        throw new AttentionReviewServiceError('REVIEW_UNAVAILABLE');
      }
    },
    async create(principal: OrganizationalPrincipal | undefined, assetId: string, raw: unknown): Promise<AssetAttentionReviewSuccess> {
      if (!principal) throw new AttentionReviewServiceError('AUTHENTICATION_REQUIRED');
      if (principal.status !== UserStatus.ACTIVE || principal.role !== SystemRole.OFFICER) throw new AttentionReviewServiceError('REVIEW_FORBIDDEN');
      const parsed = validateAssetAttentionReview(raw);
      if (!parsed.success) throw new AttentionReviewServiceError('INVALID_REVIEW_INPUT');
      const input = parsed.data;
      // Retry the entire transaction after unique/serialization races, never a partial operation.
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          return await deps.transaction(async tx => {
            const repository = createAssetAttentionReviewRepository(tx);
            await repository.findAsset(principal, assetId, true);
            await repository.validateCaseLink(principal, assetId, input.caseId);
            const existing = await repository.findReplay(principal, input.clientRequestId);
            if (existing) {
              if (!replayMatches(existing, assetId, input)) throw new AttentionReviewServiceError('IDEMPOTENCY_CONFLICT');
              return response(existing, 'IDEMPOTENT_REPLAY');
            }
            await repository.validateSupersedesLink(principal, assetId, input.caseId ?? null, input.supersedesReviewId);
            const asOf = deps.clock();
            if (!Number.isFinite(asOf.getTime())) throw new AttentionReviewServiceError('REVIEW_UNAVAILABLE');
            const projection = await deps.project(tx, principal, assetId, asOf);
            if (projection.assetId !== assetId) throw new AttentionReviewServiceError('INVALID_ASSET_LINKAGE');
            if (projection.provenance.sourceSetFingerprint !== input.expectedSourceSetFingerprint) throw new AttentionReviewServiceError('ATTENTION_PROJECTION_STALE');
            const signals = projection.categories.flatMap(c => c.signals);
            const allowed = new Set(signals.map(s => signalKey({ ...s, evidenceReferenceFingerprint: reviewSignalFingerprint(s) })));
            if (input.selectedSignals.some(s => !allowed.has(signalKey(s)))) throw new AttentionReviewServiceError('ATTENTION_PROJECTION_STALE');
            const review = await repository.append(principal, assetId, input, {
              attentionContractVersion: projection.contractVersion, attentionCalculationVersion: projection.calculationVersion,
              projectionAsOf: new Date(projection.asOf), sourceSetFingerprint: projection.provenance.sourceSetFingerprint
            });
            await deps.integrity(tx, { eventType: 'ASSET_ATTENTION_REVIEW_RECORDED', sourceEventKey: `asset-attention-review:${review.id}`,
              resourceType: 'AssetAttentionReview', resourceId: review.id, actor: { id: principal.id, role: principal.role },
              departmentId: review.departmentId, jurisdictionId: review.jurisdictionId, occurredAt: review.createdAt,
              facts: { reviewId: review.id, reviewerId: review.reviewerId, reviewerRole: review.reviewerRole,
                assetId: review.assetId, caseId: review.caseId, disposition: review.disposition, rationaleDigest: integrityTextDigest(review.rationale),
                sourceSetFingerprint: review.sourceSetFingerprint, attentionContractVersion: review.attentionContractVersion,
                attentionCalculationVersion: review.attentionCalculationVersion, projectionAsOf: review.projectionAsOf.toISOString(),
                selectedSignalFingerprints: review.selectedSignals.map(s => sha256Fingerprint([s.category, s.signalCode, s.state, s.evidenceReferenceFingerprint])).sort() }
            });
            return response(review, 'CREATED');
          });
        } catch (error) {
          if (error instanceof AttentionReviewServiceError) throw error;
          if (error instanceof AttentionReviewRepositoryError) throw new AttentionReviewServiceError(error.code);
          const code = (error as { code?: string } | null)?.code;
          if ((code === 'P2034' || code === 'P2002') && attempt < 2) continue;
          throw new AttentionReviewServiceError('REVIEW_UNAVAILABLE');
        }
      }
      throw new AttentionReviewServiceError('REVIEW_UNAVAILABLE');
    }
  };
}

export const assetAttentionReviewService = createAssetAttentionReviewService();
