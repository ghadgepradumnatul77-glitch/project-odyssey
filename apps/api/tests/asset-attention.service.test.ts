import { describe, expect, it, vi } from 'vitest';
vi.mock('../src/lib/prisma', () => ({ default: {} }));
import { createAssetAttentionService, validateAttentionQuery } from '../src/modules/assets/asset-attention.service';
import { describeHistory } from '../src/modules/assets/asset-evidence-baseline.calculations';
import type { AssetAttentionRows } from '../src/modules/assets/asset-attention.repository';
import type { OrganizationalPrincipal } from '../src/security/organizational-scope';

const asOf = new Date('2026-09-07T00:00:00Z');
const principal = { id: 'officer', role: 'OFFICER', status: 'ACTIVE', departmentId: 'dep', jurisdictionId: 'jur' } as OrganizationalPrincipal;
function row(changes: Partial<AssetAttentionRows['input']> = {}): AssetAttentionRows {
  return { asset: { id: 'asset-1', assetCode: 'A-1', assetType: 'BRIDGE', departmentId: 'dep', jurisdictionId: 'jur', latitude: null, longitude: null, constructionYear: null, conditionStatus: null, createdAt: asOf, updatedAt: asOf },
    input: { assetId: 'asset-1', baselineContractVersion: 'ODYSSEY_ASSET_EVIDENCE_BASELINE_V1', baselineCalculationVersion: 'ODYSSEY_ASSET_EVIDENCE_BASELINE_RULES_V1', cases: [], totalInspectionCount: 0, history: describeHistory([], 0, asOf), evidenceTimestamps: [], tasks: [], publicReports: [], externalObservations: [], linkMismatchIds: [], terminalTaskOpenBlockerIds: [], closureMismatchCaseIds: [], sourceSetFingerprint: 'sha256:abc', sourceReferencesTruncated: false, ...changes },
    sourceCounts: { cases: 0, activeCases: 0, closedOrCancelledCases: 0, inspections: 0, assessments: 0, tasks: 0, evidence: 0, blockers: 0, dependencies: 0, estimates: 0, closures: 0, publicReports: 0, externalObservations: 0 }, closedOrCancelledCaseIds: [], predictiveAvailability: 'RESTRICTED' };
}
function active(id: string, riskLevel = 'VERY_HIGH') { return { id, status: 'ORP_READY', riskLevel, priorityLevel: 'CRITICAL', emergencyFlag: false, currentInspectionId: null, latestAssessment: null, activeEstimate: null }; }
function setup(items = [row()]) {
  const repository = { page: vi.fn().mockResolvedValue({ items, limit: 25, nextCursor: null }), traverse: vi.fn(async (_p, _q, consume) => { consume(items); return { totalAssets: items.length, complete: true }; }) } as any;
  return { repository, service: createAssetAttentionService(repository, () => asOf) };
}

describe('Asset attention service', () => {
  it('returns paginated Asset-first zero-Case projections with provenance and truncation', async () => {
    const item = row({ sourceReferencesTruncated: true }); const { service, repository } = setup([item]); repository.page.mockResolvedValue({ items: [item], limit: 1, nextCursor: 'next' });
    const result = await service.page(principal, { limit: '1' });
    expect(result).toMatchObject({ limit: 1, nextCursor: 'next', scope: { mode: 'ORGANIZATIONAL' }, items: [{ asset: { id: 'asset-1' }, attention: { provenance: { sourceSetFingerprint: 'sha256:abc', sourceReferencesTruncated: true } } }] });
    expect(result.items[0].attention.categories.find(item => item.category === 'AUTHORITATIVE_CASE_CONTEXT')?.state).toBe('NOT_APPLICABLE');
  });

  it('preserves multiple simultaneous Case signals rather than collapsing them', async () => {
    const result = await setup([row({ cases: [active('c1'), active('c2', 'LOW')] })]).service.page(principal);
    const signals = result.items[0].attention.categories.find(item => item.category === 'AUTHORITATIVE_CASE_CONTEXT')!.signals;
    expect(signals.filter(item => item.signalCode === 'ACTIVE_CASE_CONTEXT_PRESENT')).toHaveLength(2);
    expect(signals).toContainEqual(expect.objectContaining({ signalCode: 'HETEROGENEOUS_CASE_CONTEXT' }));
  });

  it('applies category/state filters after full derivation without changing repository filters', async () => {
    const { service, repository } = setup();
    const result = await service.page(principal, { category: 'EVIDENCE_COVERAGE_GAP', state: 'PRESENT' });
    expect(result.items[0].attention.categories).toHaveLength(1);
    expect(result.items[0].attention.categories[0]).toMatchObject({ category: 'EVIDENCE_COVERAGE_GAP', state: 'PRESENT' });
    expect(repository.page).toHaveBeenCalledWith(principal, { departmentId: undefined, jurisdictionId: undefined, assetId: undefined, limit: undefined, cursor: undefined });
  });

  it('matches a requested signal state without erasing simultaneous unknown signals', async () => {
    const item = row({ tasks: [{ id: 'task', caseId: 'c1', status: 'BLOCKED', plannedEndAt: null, completionSubmittedAt: null, verifiedAt: null, evidenceRequired: false, evidenceCount: 0, openBlockerIds: ['block'], unmetDependencyIds: [] }] });
    const result = await setup([item]).service.page(principal, { category: 'RECORDED_OPERATIONAL_EXCEPTION', state: 'PRESENT' });
    expect(result.items[0].attention.categories[0]).toMatchObject({ state: 'UNKNOWN', signals: expect.arrayContaining([expect.objectContaining({ state: 'PRESENT' }), expect.objectContaining({ state: 'UNKNOWN' })]) });
  });

  it('preserves UNKNOWN and CONFLICT states in full projections', async () => {
    const conflict = row({ cases: [active('c1')], evidenceTimestamps: [null], linkMismatchIds: ['c1'] });
    const result = await setup([conflict]).service.page(principal);
    expect(result.items[0].attention.categories.map(item => item.state)).toEqual(expect.arrayContaining(['UNKNOWN', 'CONFLICT']));
  });

  it('summarizes the complete traversal with explicit category and signal states', async () => {
    const values = [row(), row({ assetId: 'asset-2', cases: [active('c2')], linkMismatchIds: ['c2'] })]; values[1].asset.id = 'asset-2';
    const { service, repository } = setup(values); const result = await service.summary(principal);
    expect(repository.page).not.toHaveBeenCalled(); expect(repository.traverse).toHaveBeenCalledOnce();
    expect(result).toMatchObject({ totalAssets: 2, assetsWithMatchingProjection: 2, complete: true });
    expect(result.categoryStates.DATA_CONSISTENCY_CONFLICT).toMatchObject({ ABSENT: 1, CONFLICT: 1 });
    expect(result.signalStates.UNKNOWN).toBeGreaterThan(0); expect(result.signalStates.CONFLICT).toBe(1);
  });

  it('honors summary filters without altering complete population traversal', async () => {
    const { service } = setup([row(), row({ linkMismatchIds: ['x'] })]);
    const result = await service.summary(principal, { category: 'DATA_CONSISTENCY_CONFLICT', state: 'CONFLICT' });
    expect(result.totalAssets).toBe(2); expect(result.assetsWithMatchingProjection).toBe(1);
    expect(Object.keys(result.categoryStates)).toEqual(['DATA_CONSISTENCY_CONFLICT']);
  });

  it('returns no partial result after timeout or inconsistent traversal', async () => {
    const { service, repository } = setup(); repository.traverse.mockRejectedValueOnce(new Error('timeout SECRET'));
    await expect(service.summary(principal)).rejects.toThrow('timeout SECRET');
    repository.traverse.mockResolvedValueOnce({ totalAssets: 9, complete: true });
    await expect(service.summary(principal)).rejects.toThrow('ATTENTION_TRAVERSAL_INCOMPLETE');
  });

  it('returns scoped not-found for an explicit inaccessible Asset', async () => {
    await expect(setup([]).service.page(principal, { assetId: '10000000-0000-4000-8000-000000000001' })).rejects.toMatchObject({ code: 'ASSET_NOT_FOUND' });
  });

  it('uses privacy-safe DTO projection and does not mutate repository rows', async () => {
    const value = row(); (value as any).reporterName = 'SECRET'; (value.asset as any).description = 'SECRET';
    const before = JSON.stringify(value), result = await setup([value]).service.page(principal);
    expect(JSON.stringify(value)).toBe(before); expect(JSON.stringify(result)).not.toContain('SECRET');
    const keys = (input: unknown): string[] => input && typeof input === 'object' ? Object.entries(input).flatMap(([key, child]) => [key, ...keys(child)]) : [];
    expect(keys(result)).not.toEqual(expect.arrayContaining(['attentionScore', 'severity', 'ranking']));
  });

  it('validates every filter and rejects ranking, thresholds, pagination on summary and invalid clock', async () => {
    expect(validateAttentionQuery({ category: 'PLANNING_GAP', state: 'UNKNOWN' })).toMatchObject({ category: 'PLANNING_GAP', state: 'UNKNOWN' });
    for (const query of [{ category: 'RISK' }, { state: 'LOW' }, { ranking: 'risk' }, { thresholdDays: 30 }]) expect(() => validateAttentionQuery(query)).toThrow();
    expect(() => validateAttentionQuery({ limit: '1' }, true)).toThrow();
    await expect(createAssetAttentionService(setup().repository, () => new Date(NaN)).page(principal)).rejects.toThrow('ATTENTION_CLOCK_INVALID');
  });
});
