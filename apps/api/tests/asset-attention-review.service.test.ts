import { describe, expect, it, vi } from 'vitest';
import { SystemRole, UserStatus } from '../src/generated/prisma';
import { createAssetAttentionReviewService, reviewSignalFingerprint } from '../src/modules/assets/asset-attention-review.service';
import { ASSET_ATTENTION_CONTRACT_VERSION, ASSET_ATTENTION_CALCULATION_VERSION, type AssetAttentionProjection, type AttentionSignal } from '../src/modules/assets/asset-attention.contracts';
import { integrityTextDigest } from '../src/modules/integrity/integrity.service';
import prisma from '../src/lib/prisma';

const officer = { id: 'officer', role: SystemRole.OFFICER, status: UserStatus.ACTIVE, departmentId: 'dep', jurisdictionId: 'jur' };
const now = new Date('2026-09-11T00:00:00Z');
const source = 'sha256:' + 'a'.repeat(64);
const signal: AttentionSignal = { category: 'EVIDENCE_COVERAGE_GAP', signalCode: 'NO_INSPECTION_EVIDENCE', state: 'UNKNOWN', reasonCodes: ['NO_INSPECTION_EVIDENCE'], explanation: 'No inspection.', evidenceReferences: [], referencesTruncated: false };
const projection: AssetAttentionProjection = { contractVersion: ASSET_ATTENTION_CONTRACT_VERSION, calculationVersion: ASSET_ATTENTION_CALCULATION_VERSION, baselineContractVersion: 'baseline', baselineCalculationVersion: 'rules', assetId: 'asset', asOf: now.toISOString(), categories: [{ category: signal.category, state: signal.state, signals: [signal], signalCount: 1, referencesTruncated: false }], provenance: { sourceSetFingerprint: source, history: { state: 'MISSING', reasonCodes: [] }, sourceReferencesTruncated: false }, authority: { classification: 'DESCRIPTIVE_DECISION_SUPPORT', mutatesAuthoritativeRecords: false, disclaimers: [] } };
const request = () => ({ disposition: 'ACKNOWLEDGED', rationale: 'Human rationale must stay private from audit facts.', clientRequestId: 'request', expectedSourceSetFingerprint: source, selectedSignals: [{ category: signal.category, signalCode: signal.signalCode, state: signal.state, evidenceReferenceFingerprint: reviewSignalFingerprint(signal) }] });
function setup() {
  let committed: any[] = [];
  let events: any[] = [];
  const business = Object.freeze({ caseRisk: 77, priority: 'CRITICAL', status: 'ORP_READY', tasks: 0 });
  const tx = {
    asset: { findFirst: vi.fn().mockResolvedValue({ id: 'asset', departmentId: 'dep', jurisdictionId: 'jur' }) },
    case: { findFirst: vi.fn().mockResolvedValue({ id: 'case', assetId: 'asset' }) },
    assetAttentionReview: { findFirst: vi.fn(), create: vi.fn(), findMany: vi.fn() }
  };
  let pending: any[] = [], pendingEvents: any[] = [];
  tx.assetAttentionReview.findFirst.mockImplementation(async ({ where }: any) => committed.find(row => where.id ? row.id === where.id : row.reviewerId === where.reviewerId && row.clientRequestId === where.clientRequestId) ?? null);
  tx.assetAttentionReview.create.mockImplementation(async ({ data }: any) => {
    const row = { ...data, id: `review-${committed.length + 1}`, createdAt: now, selectedSignals: data.selectedSignals.create };
    pending.push(row); return row;
  });
  const transaction = vi.fn(async (run: any) => {
    pending = []; pendingEvents = [];
    const result = await run(tx);
    committed.push(...pending); events.push(...pendingEvents); return result;
  });
  const project = vi.fn().mockResolvedValue(projection);
  const integrity = vi.fn(async (received: any, event: any) => { expect(received).toBe(tx); pendingEvents.push(event); });
  const service = createAssetAttentionReviewService({ transaction, project, integrity, clock: () => now });
  return { service, tx, project, integrity, transaction, committed: () => committed, events: () => events, business };
}
describe('transactional Asset attention review service', () => {
  it('returns allowlisted history DTOs with scoped rationale and no joined private fields', async () => {
    const s = setup(); await s.service.create(officer, 'asset', request());
    s.tx.assetAttentionReview.findMany.mockResolvedValue(s.committed().map(row => ({ ...row, password: 'secret', reporter: 'private', selectedSignals: row.selectedSignals.map((signal: any) => ({ ...signal, narrative: 'hidden' })) })));
    const page = await s.service.history(officer, 'asset');
    expect(page.items[0].rationale).toBe(request().rationale);
    expect(JSON.stringify(page)).not.toMatch(/secret|hidden|password|reporter|narrative/);
    expect(s.tx.assetAttentionReview.findMany.mock.calls[0][0].where.AND[0]).toMatchObject({ departmentId: 'dep', jurisdictionId: 'jur' });
  });
  it('requests bounded serializable isolation on the production transaction runner', async () => {
    const spy = vi.spyOn(prisma, '$transaction').mockRejectedValue(new Error('offline'));
    try {
      await expect(createAssetAttentionReviewService().create(officer, 'asset', request())).rejects.toMatchObject({ code: 'REVIEW_UNAVAILABLE' });
      expect(spy).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: 'Serializable', timeout: 30000, maxWait: 5000 });
    } finally { spy.mockRestore(); }
  });
  it('retries a competing unique insert and returns the committed original', async () => {
    const s = setup(); const first = await s.service.create(officer, 'asset', request());
    s.transaction.mockRejectedValueOnce({ code: 'P2002' });
    const replay = await s.service.create(officer, 'asset', request());
    expect(replay.data.review).toEqual(first.data.review); expect(replay.data.outcome).toBe('IDEMPOTENT_REPLAY');
    expect(s.integrity).toHaveBeenCalledTimes(1);
  });
  it('creates zero-Case review and integrity event on the same transaction without business mutation', async () => {
    const s = setup(); const result = await s.service.create(officer, 'asset', request());
    expect(result.data.outcome).toBe('CREATED'); expect(result.data.review.caseId).toBeNull();
    expect(s.project.mock.calls[0][0]).toBe(s.tx); expect(s.committed()).toHaveLength(1); expect(s.events()).toHaveLength(1);
    expect(s.business).toEqual({ caseRisk: 77, priority: 'CRITICAL', status: 'ORP_READY', tasks: 0 });
    expect(s.events()[0]).toMatchObject({ eventType: 'ASSET_ATTENTION_REVIEW_RECORDED', actor: { id: 'officer', role: 'OFFICER' }, facts: { rationaleDigest: integrityTextDigest(request().rationale), sourceSetFingerprint: source } });
    expect(JSON.stringify(s.events())).not.toContain(request().rationale);
  });
  it('rejects stale source fingerprint before persistence', async () => {
    const s = setup(); await expect(s.service.create(officer, 'asset', { ...request(), expectedSourceSetFingerprint: 'sha256:' + 'b'.repeat(64) })).rejects.toMatchObject({ status: 409, code: 'ATTENTION_PROJECTION_STALE' });
    expect(s.tx.assetAttentionReview.create).not.toHaveBeenCalled(); expect(s.events()).toHaveLength(0);
  });
  it('rejects fabricated selected evidence or state', async () => {
    const s = setup(); const input = request(); input.selectedSignals[0].evidenceReferenceFingerprint = source;
    await expect(s.service.create(officer, 'asset', input)).rejects.toMatchObject({ code: 'ATTENTION_PROJECTION_STALE' });
    expect(s.committed()).toHaveLength(0);
  });
  it('replays original data even if current projection changes, without new integrity event', async () => {
    const s = setup(); const first = await s.service.create(officer, 'asset', request());
    s.project.mockRejectedValue(new Error('should not rederive replay'));
    const replay = await s.service.create(officer, 'asset', request());
    expect(replay.data.outcome).toBe('IDEMPOTENT_REPLAY'); expect(replay.data.review).toEqual(first.data.review);
    expect(s.project).toHaveBeenCalledTimes(1); expect(s.integrity).toHaveBeenCalledTimes(1);
  });
  it.each(['rationale', 'disposition', 'expectedSourceSetFingerprint'])('rejects same key with changed %s', async field => {
    const s = setup(); await s.service.create(officer, 'asset', request());
    const values = { rationale: 'different', disposition: 'DATA_QUALITY_FOLLOW_UP', expectedSourceSetFingerprint: 'sha256:' + 'c'.repeat(64) };
    await expect(s.service.create(officer, 'asset', { ...request(), [field]: values[field as keyof typeof values] })).rejects.toMatchObject({ status: 409, code: 'IDEMPOTENCY_CONFLICT' });
    expect(s.committed()).toHaveLength(1);
  });
  it.each([SystemRole.SYSTEM_ADMIN, SystemRole.AUDITOR, SystemRole.POLICY_ADMIN])('rejects %s before transaction', async role => {
    const s = setup(); await expect(s.service.create({ ...officer, role }, 'asset', request())).rejects.toMatchObject({ status: 403 }); expect(s.transaction).not.toHaveBeenCalled();
  });
  it('requires authentication and active principal', async () => {
    const s = setup(); await expect(s.service.create(undefined, 'asset', request())).rejects.toMatchObject({ status: 401 });
    await expect(s.service.create({ ...officer, status: UserStatus.INACTIVE }, 'asset', request())).rejects.toMatchObject({ status: 403 });
  });
  it('rejects identity injection', async () => {
    const s = setup(); await expect(s.service.create(officer, 'asset', { ...request(), reviewerId: 'attacker' })).rejects.toMatchObject({ status: 400 }); expect(s.transaction).not.toHaveBeenCalled();
  });
  it('denies hidden Asset before projection/replay', async () => {
    const s = setup(); s.tx.asset.findFirst.mockResolvedValue(null);
    await expect(s.service.create(officer, 'asset', request())).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' }); expect(s.project).not.toHaveBeenCalled();
  });
  it.each([null, { id: 'case', assetId: 'other' }])('rejects hidden or mismatched Case %j', async linked => {
    const s = setup(); s.tx.case.findFirst.mockResolvedValue(linked);
    await expect(s.service.create(officer, 'asset', { ...request(), caseId: '123e4567-e89b-42d3-a456-426614174000' })).rejects.toMatchObject({ code: linked ? 'INVALID_CASE_LINKAGE' : 'RESOURCE_NOT_FOUND' }); expect(s.project).not.toHaveBeenCalled();
  });
  it('rejects invalid supersession', async () => {
    const s = setup(); s.tx.assetAttentionReview.findFirst.mockImplementation(async ({ where }: any) => where.id ? { assetId: 'other', caseId: null, reviewerId: 'officer' } : null);
    await expect(s.service.create(officer, 'asset', { ...request(), supersedesReviewId: '123e4567-e89b-42d3-a456-426614174000' })).rejects.toMatchObject({ code: 'INVALID_SUPERSESSION_LINKAGE' });
  });
  it('preserves multiple signals and treats selection ordering as idempotent', async () => {
    const s = setup(); const second: AttentionSignal = { ...signal, state: 'PRESENT', signalCode: 'NO_ASSESSMENT_EVIDENCE' };
    s.project.mockResolvedValue({ ...projection, categories: [{ ...projection.categories[0], signals: [signal, second] }] });
    const input = request(); input.selectedSignals.push({ category: second.category, signalCode: second.signalCode, state: second.state, evidenceReferenceFingerprint: reviewSignalFingerprint(second) });
    expect((await s.service.create(officer, 'asset', input)).data.review.selectedSignals).toHaveLength(2);
    expect((await s.service.create(officer, 'asset', { ...input, selectedSignals: [...input.selectedSignals].reverse() })).data.outcome).toBe('IDEMPOTENT_REPLAY');
  });
  it('rolls back review when integrity fails and sanitizes failure', async () => {
    const s = setup(); s.integrity.mockRejectedValue(new Error('database password secret'));
    await expect(s.service.create(officer, 'asset', request())).rejects.toMatchObject({ code: 'REVIEW_UNAVAILABLE', status: 503 });
    expect(s.committed()).toHaveLength(0); expect(s.events()).toHaveLength(0);
  });
  it('retries whole transactions on serialization failures and bounds retries', async () => {
    const s = setup(); s.transaction.mockRejectedValueOnce({ code: 'P2034' });
    expect((await s.service.create(officer, 'asset', request())).data.outcome).toBe('CREATED'); expect(s.transaction).toHaveBeenCalledTimes(2);
    const failed = setup(); failed.transaction.mockRejectedValue({ code: 'P2034' });
    await expect(failed.service.create(officer, 'asset', request())).rejects.toMatchObject({ code: 'REVIEW_UNAVAILABLE' }); expect(failed.transaction).toHaveBeenCalledTimes(3);
  });
  it('hashes stable reference facts independently of order and elapsed age', () => {
    const refs = [{ resourceType: 'CASE' as const, resourceId: 'one', ageMilliseconds: 10 }, { resourceType: 'CASE' as const, resourceId: 'two' }];
    expect(reviewSignalFingerprint({ ...signal, evidenceReferences: refs })).toBe(reviewSignalFingerprint({ ...signal, evidenceReferences: [...refs].reverse().map(r => ({ ...r, ageMilliseconds: 99 })) }));
    expect(reviewSignalFingerprint(signal)).not.toBe(reviewSignalFingerprint({ ...signal, referencesTruncated: true }));
  });
});
