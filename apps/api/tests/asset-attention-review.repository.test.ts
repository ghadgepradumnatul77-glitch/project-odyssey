import { describe, it, expect, vi } from 'vitest';
import { SystemRole, UserStatus } from '../src/generated/prisma';
import { encodeCursor } from '../src/lib/pagination';
import { createAssetAttentionReviewRepository, attentionReviewSelect, type AttentionReviewTransaction } from '../src/modules/assets/asset-attention-review.repository';
import type { CreateAssetAttentionReviewInput } from '../src/modules/assets/asset-attention-review.contracts';

const principal = { id: 'officer', role: SystemRole.OFFICER, status: UserStatus.ACTIVE, departmentId: 'dep', jurisdictionId: 'jur' };
const asset = { id: 'asset', departmentId: 'dep', jurisdictionId: 'jur' };
const input: CreateAssetAttentionReviewInput = { disposition: 'ACKNOWLEDGED', rationale: 'Reviewed.', clientRequestId: 'request', expectedSourceSetFingerprint: 'sha256:' + 'a'.repeat(64), selectedSignals: [{ category: 'EVIDENCE_COVERAGE_GAP', signalCode: 'NO_INSPECTION_EVIDENCE', state: 'UNKNOWN', evidenceReferenceFingerprint: 'sha256:' + 'b'.repeat(64) }] };
const projection = { attentionContractVersion: 'v1', attentionCalculationVersion: 'c1', projectionAsOf: new Date('2026-01-01'), sourceSetFingerprint: input.expectedSourceSetFingerprint };
const row = { id: 'review', assetId: 'asset', caseId: null, reviewerId: 'officer', reviewerRole: SystemRole.OFFICER, departmentId: 'dep', jurisdictionId: 'jur', disposition: input.disposition, rationale: input.rationale, clientRequestId: 'request', supersedesReviewId: null, createdAt: new Date('2026-01-01'), ...projection, selectedSignals: input.selectedSignals };
function setup() {
  const tx = { asset: { findFirst: vi.fn().mockResolvedValue(asset) }, case: { findFirst: vi.fn().mockResolvedValue({ id: 'case', assetId: 'asset' }) }, assetAttentionReview: { findFirst: vi.fn().mockResolvedValue(row), findMany: vi.fn().mockResolvedValue([]), create: vi.fn().mockResolvedValue(row) } };
  return { tx, repo: createAssetAttentionReviewRepository(tx as AttentionReviewTransaction) };
}
describe('attention review repository', () => {
  it('scopes Asset reads and includes zero-Case Assets', async () => {
    const { repo, tx } = setup();
    expect(await repo.findAsset(principal, 'asset')).toEqual(asset);
    expect(tx.asset.findFirst).toHaveBeenCalledWith({ where: { id: 'asset', AND: [{ departmentId: 'dep', jurisdictionId: 'jur' }] }, select: { id: true, departmentId: true, jurisdictionId: true } });
    expect(tx.case.findFirst).not.toHaveBeenCalled();
  });
  it('preserves global administrator reads without granting writes', async () => {
    const { repo, tx } = setup(); const admin = { ...principal, role: SystemRole.SYSTEM_ADMIN };
    await repo.history(admin, 'asset');
    expect(tx.asset.findFirst.mock.calls[0][0].where.AND).toEqual([{}]);
    expect(tx.assetAttentionReview.findMany.mock.calls[0][0].where.AND[0]).toEqual({});
    await expect(repo.append(admin, 'asset', input, projection)).rejects.toMatchObject({ code: 'REVIEW_FORBIDDEN' });
    expect(tx.assetAttentionReview.create).not.toHaveBeenCalled();
  });
  it('denies unavailable/out-of-scope Assets before writes or history reads', async () => {
    const { repo, tx } = setup(); tx.asset.findFirst.mockResolvedValue(null);
    await expect(repo.append(principal, 'asset', input, projection)).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
    await expect(repo.history(principal, 'asset')).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
    expect(tx.assetAttentionReview.create).not.toHaveBeenCalled(); expect(tx.assetAttentionReview.findMany).not.toHaveBeenCalled();
  });
  it('rejects inactive callers', async () => {
    const { repo, tx } = setup(); const inactive = { ...principal, status: UserStatus.INACTIVE };
    await expect(repo.findReplay(inactive, 'request')).rejects.toMatchObject({ code: 'REVIEW_FORBIDDEN' });
    await expect(repo.append(inactive, 'asset', input, projection)).rejects.toMatchObject({ code: 'REVIEW_FORBIDDEN' });
    expect(tx.asset.findFirst).not.toHaveBeenCalled();
  });
  it('validates optional Case linkage with independent scope', async () => {
    const { repo, tx } = setup();
    expect(await repo.validateCaseLink(principal, 'asset')).toBeNull();
    await repo.validateCaseLink(principal, 'asset', 'case');
    expect(tx.case.findFirst.mock.calls[0][0].where).toEqual({ id: 'case', asset: { departmentId: 'dep', jurisdictionId: 'jur' } });
    tx.case.findFirst.mockResolvedValue({ id: 'case', assetId: 'other' });
    await expect(repo.validateCaseLink(principal, 'asset', 'case')).rejects.toMatchObject({ code: 'INVALID_CASE_LINKAGE' });
    tx.case.findFirst.mockResolvedValue(null);
    await expect(repo.validateCaseLink(principal, 'asset', 'case')).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
  });
  it.each([{ assetId: 'other' }, { caseId: 'other' }, { reviewerId: 'other' }])('rejects mismatched supersession %j', async difference => {
    const { repo, tx } = setup(); tx.assetAttentionReview.findFirst.mockResolvedValue({ ...row, ...difference });
    await expect(repo.validateSupersedesLink(principal, 'asset', null, 'review')).rejects.toMatchObject({ code: 'INVALID_SUPERSESSION_LINKAGE' });
  });
  it('checks supersession scope and rejects an already superseded review', async () => {
    const { repo, tx } = setup();
    expect(await repo.validateSupersedesLink(principal, 'asset', null)).toBeNull();
    await repo.validateSupersedesLink(principal, 'asset', null, 'review');
    expect(tx.assetAttentionReview.findFirst.mock.calls[1][0].where).toMatchObject({ id: 'review', supersededBy: null, AND: [{ departmentId: 'dep', jurisdictionId: 'jur', asset: { departmentId: 'dep', jurisdictionId: 'jur' } }] });
    tx.assetAttentionReview.findFirst.mockReset().mockResolvedValueOnce(row).mockResolvedValueOnce(null);
    await expect(repo.validateSupersedesLink(principal, 'asset', null, 'review')).rejects.toMatchObject({ code: 'INVALID_SUPERSESSION_LINKAGE' });
  });
  it('retrieves exact replay rows for the internal reviewer and current/snapshot scope', async () => {
    const { repo, tx } = setup();
    expect(await repo.findReplay(principal, 'request')).toEqual(row);
    expect(tx.assetAttentionReview.findFirst.mock.calls[0][0]).toEqual({ where: { reviewerId: 'officer', clientRequestId: 'request', AND: [{ departmentId: 'dep', jurisdictionId: 'jur', asset: { departmentId: 'dep', jurisdictionId: 'jur' } }] }, select: attentionReviewSelect });
  });
  it('appends one nested create using only allowlisted internally supplied values', async () => {
    const { repo, tx } = setup();
    const hostile = { ...input, reviewerId: 'attacker', reviewerRole: 'SYSTEM_ADMIN', departmentId: 'other', riskScore: 0, selectedSignals: [{ ...input.selectedSignals[0], payload: 'secret' }] };
    expect(await repo.append(principal, 'asset', hostile, projection)).toEqual(row);
    const data = tx.assetAttentionReview.create.mock.calls[0][0].data;
    expect(data).toMatchObject({ reviewerId: 'officer', reviewerRole: 'OFFICER', departmentId: 'dep', jurisdictionId: 'jur', assetId: 'asset', caseId: null, supersedesReviewId: null });
    expect(data.selectedSignals.create).toEqual(input.selectedSignals);
    expect(JSON.stringify(data)).not.toMatch(/attacker|payload|riskScore/);
    expect(tx.assetAttentionReview.create).toHaveBeenCalledTimes(1);
    expect(Object.keys(repo).sort()).toEqual(['append', 'findAsset', 'findReplay', 'history', 'validateCaseLink', 'validateSupersedesLink'].sort());
  });
  it('uses descending timestamp/id keyset after scope and one-row lookahead', async () => {
    const { repo, tx } = setup(); tx.assetAttentionReview.findMany.mockResolvedValue([row, { ...row, id: 'older' }]);
    const cursor = encodeCursor({ at: row.createdAt.toISOString(), id: 'cursor-id' });
    const page = await repo.history(principal, 'asset', { limit: '1', cursor });
    expect(page.items).toEqual([row]); expect(page.nextCursor).toBe(encodeCursor({ at: row.createdAt.toISOString(), id: row.id }));
    expect(tx.assetAttentionReview.findMany.mock.calls[0][0]).toMatchObject({ take: 2, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], where: { assetId: 'asset', AND: [{ departmentId: 'dep', jurisdictionId: 'jur' }, { OR: [{ createdAt: { lt: row.createdAt } }, { createdAt: row.createdAt, id: { lt: 'cursor-id' } }] }] } });
  });
  it('uses default 25/max 100 and rejects invalid pagination', async () => {
    const { repo, tx } = setup(); await repo.history(principal, 'asset'); expect(tx.assetAttentionReview.findMany.mock.calls[0][0].take).toBe(26);
    await repo.history(principal, 'asset', { limit: '100' }); expect(tx.assetAttentionReview.findMany.mock.calls[1][0].take).toBe(101);
    for (const limit of ['0', '101', '-1', 25]) await expect(repo.history(principal, 'asset', { limit })).rejects.toThrow();
    await expect(repo.history(principal, 'asset', { cursor: 'invalid' })).rejects.toThrow();
  });
  it('selects no User joins, evidence URLs, narratives or raw JSON', () => {
    expect(JSON.stringify(attentionReviewSelect)).not.toMatch(/email|password|phone|payload|narrative|url|include|reviewer"/i);
    expect(attentionReviewSelect.selectedSignals.select).toEqual({ category: true, signalCode: true, state: true, evidenceReferenceFingerprint: true });
  });
  it('propagates transaction/unique failures without retrying or returning partial success', async () => {
    const { repo, tx } = setup(); const conflict = Object.assign(new Error('unique'), { code: 'P2002' }); tx.assetAttentionReview.create.mockRejectedValue(conflict);
    await expect(repo.append(principal, 'asset', input, projection)).rejects.toBe(conflict);
    expect(tx.assetAttentionReview.create).toHaveBeenCalledTimes(1);
    tx.assetAttentionReview.findMany.mockRejectedValue(new Error('timeout'));
    await expect(repo.history(principal, 'asset')).rejects.toThrow('timeout');
  });
});
