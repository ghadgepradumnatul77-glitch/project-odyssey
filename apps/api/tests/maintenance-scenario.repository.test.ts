import { describe, it, expect, vi } from 'vitest';
vi.mock('../src/lib/prisma', () => ({ default: {} }));
import { createMaintenanceScenarioRepository } from '../src/modules/portfolio/maintenance-scenario.repository';
import { compareMaintenanceEnvelopes } from '../src/modules/portfolio/maintenance-scenario.calculations';
import type { OrganizationalPrincipal } from '../src/security/organizational-scope';
const principal = { id: 'officer', role: 'OFFICER', status: 'ACTIVE', departmentId: 'dep', jurisdictionId: 'jur' } as OrganizationalPrincipal;
const date = new Date('2026-01-01T00:00:00Z');
const asset = (id = 'a') => ({ id, departmentId: 'dep', jurisdictionId: 'jur' });
const work = (id = 'c', assetId = 'a') => ({ id, assetId, status: 'ORP_READY', priorityLevel: 'CRITICAL', riskLevel: 'VERY_HIGH', emergencyFlag: true, createdAt: date, updatedAt: date, inspections: [{ id: 'i', inspectionDate: date, createdAt: date, hospitalRoute: true }] });
const estimate = (id = 'e', extra = {}) => ({ id, caseId: 'c', estimateVersion: 1, status: 'ACTIVE', currency: 'INR', estimatedCostMinor: 100n, estimatedDurationDays: 2, resourceRequirements: [], preparedAt: date, createdAt: date, estimateBasis: 'private narrative', sourceReference: 'https://private.example/evidence', ...extra });
function setup(assets = [asset()], cases = [work()], estimates = [estimate()]) {
  const tx: any = { asset: { findMany: vi.fn().mockResolvedValue(assets), findFirst: vi.fn().mockResolvedValue(null) }, case: { findMany: vi.fn().mockResolvedValue(cases), findFirst: vi.fn().mockResolvedValue(null) }, caseResourceEstimate: { findMany: vi.fn().mockResolvedValue(estimates) } };
  const db: any = { $transaction: vi.fn((fn: any) => fn(tx)) };
  return { tx, db, repo: createMaintenanceScenarioRepository(db, () => date) };
}
describe('maintenance common-snapshot repository', () => {
  it('retains zero-Case assets and missing-estimate coverage', async () => {
    const { repo } = setup([asset(), asset('zero')], [work()], []);
    expect((await repo.snapshot(principal)).coverage).toEqual({ assets: 2, cases: 1, zeroCaseAssets: 1, noActiveEstimateCases: 1, multipleActiveEstimateCases: 0 });
  });
  it('retains multiple Cases independently and exact ordering facts', async () => {
    const { repo } = setup([asset()], [work('c2'), work()], []);
    const result = await repo.snapshot(principal);
    expect(result.snapshot.cases.map(c => c.caseId)).toEqual(['c', 'c2']);
    expect(result.snapshot.cases[0]).toMatchObject({ priorityLevel: 'CRITICAL', riskLevel: 'VERY_HIGH', emergencyFlag: true, hospitalRoute: true, createdAt: date.toISOString() });
  });
  it('retains multiple ACTIVE and SUPERSEDED versions without fallback', async () => {
    const { repo } = setup(undefined, undefined, [estimate(), estimate('e2', { estimateVersion: 2 }), estimate('old', { status: 'SUPERSEDED' })]);
    const result = await repo.snapshot(principal);
    expect(result.coverage.multipleActiveEstimateCases).toBe(1);
    expect(result.snapshot.cases[0].estimates).toHaveLength(3);
    const oldOnly = await setup(undefined, undefined, [estimate('old', { status: 'SUPERSEDED' })]).repo.snapshot(principal);
    expect(oldOnly.coverage.noActiveEstimateCases).toBe(1);
  });
  it.each([{}, [{ category: 'OTHER', quantity: 1, unit: 'UNIT_DAYS', secret: 'PII' }], [{ category: 'UNCONTROLLED', quantity: 1, unit: 'UNIT_DAYS' }], [{ category: 'OTHER', quantity: -1, unit: 'UNIT_DAYS' }]])('replaces malformed JSON with controlled invalid marker: %j', async resourceRequirements => {
    const result = await setup(undefined, undefined, [estimate('e', { resourceRequirements })]).repo.snapshot(principal);
    expect(result.snapshot.cases[0].estimates[0]).toMatchObject({ resourceRequirements: null, resourcesComplete: null });
    expect(JSON.stringify(result)).not.toContain('PII');
  });
  it('preserves invalid currency/cost/duration for pure validation', async () => {
    const result = await setup(undefined, undefined, [estimate('e', { currency: 'USD', estimatedCostMinor: -1n, estimatedDurationDays: -1 })]).repo.snapshot(principal);
    const compared = compareMaintenanceEnvelopes(result.snapshot, [{ id: 'env', currency: 'INR', budgetMinor: '100', resourceCapacities: [] }]);
    expect(compared.envelopes[0].cases[0].state).toBe('INVALID_DATA');
  });
  it('never infers completeness or missing hospital evidence', async () => {
    const result = await setup(undefined, [{ ...work(), inspections: [] }]).repo.snapshot(principal);
    expect(result.snapshot.cases[0].hospitalRoute).toBeNull();
    expect(result.snapshot.cases[0].estimates[0]).toMatchObject({ resourceRequirements: [], resourcesComplete: null });
  });
  it('scopes every traversal before take', async () => {
    const { repo, tx, db } = setup(); await repo.snapshot(principal);
    expect(tx.asset.findMany.mock.calls[0][0]).toMatchObject({ where: { AND: [{ departmentId: 'dep', jurisdictionId: 'jur' }, {}, {}] }, take: 500 });
    expect(tx.case.findMany.mock.calls[0][0].where.AND[0]).toEqual({ asset: { departmentId: 'dep', jurisdictionId: 'jur' } });
    expect(tx.caseResourceEstimate.findMany.mock.calls[0][0].where.AND[0].case).toEqual({ asset: { departmentId: 'dep', jurisdictionId: 'jur' } });
    expect(db.$transaction.mock.calls[0][1]).toEqual({ isolationLevel: 'RepeatableRead', timeout: 30000, maxWait: 5000 });
  });
  it('preserves global admin read scope', async () => {
    const { repo, tx } = setup(); await repo.snapshot({ ...principal, role: 'SYSTEM_ADMIN' });
    expect(tx.asset.findMany.mock.calls[0][0].where.AND[0]).toEqual({});
  });
  it('independently denies inaccessible Asset and Case filters', async () => {
    const { repo, tx } = setup();
    const id = '11111111-1111-4111-8111-111111111111';
    await expect(repo.snapshot(principal, { assetId: id })).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
    await expect(repo.snapshot(principal, { caseId: id })).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
    expect(tx.asset.findMany).not.toHaveBeenCalled();
    tx.asset.findFirst.mockResolvedValue({ id }); tx.case.findFirst.mockResolvedValue({ assetId: 'different' });
    await expect(repo.snapshot(principal, { assetId: id, caseId: id })).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
  });
  it('traverses >500 Assets and Cases with batched queries', async () => {
    const { repo, tx } = setup();
    tx.asset.findMany.mockReset().mockResolvedValueOnce(Array.from({ length: 500 }, (_, i) => asset(`a${i}`))).mockResolvedValueOnce([asset('z')]);
    tx.case.findMany.mockReset().mockResolvedValueOnce(Array.from({ length: 500 }, (_, i) => work(`c${i}`, 'a0'))).mockResolvedValueOnce([work('z', 'a0')]).mockResolvedValueOnce([]);
    tx.caseResourceEstimate.findMany.mockResolvedValue([]);
    const result = await repo.snapshot(principal);
    expect(result.coverage.assets).toBe(501); expect(result.coverage.cases).toBe(501);
    expect(tx.asset.findMany).toHaveBeenCalledTimes(2); expect(tx.case.findMany).toHaveBeenCalledTimes(3); expect(tx.caseResourceEstimate.findMany).toHaveBeenCalledTimes(2);
    expect(tx.case.findMany.mock.calls[1][0].where.AND[3]).toEqual({ id: { gt: 'c499' } });
  });
  it('batches estimate history without truncation', async () => {
    const { repo, tx } = setup();
    tx.caseResourceEstimate.findMany.mockReset().mockResolvedValueOnce(Array.from({ length: 500 }, (_, i) => estimate(`e${i}`))).mockResolvedValueOnce([estimate('z')]);
    expect((await repo.snapshot(principal)).snapshot.cases[0].estimates).toHaveLength(501);
  });
  it('sanitizes transaction and mid-traversal failure without partial success', async () => {
    const { repo, tx } = setup(); tx.caseResourceEstimate.findMany.mockRejectedValue(new Error('password private database host'));
    await expect(repo.snapshot(principal)).rejects.toThrow('SNAPSHOT_UNAVAILABLE');
  });
  it('uses privacy allowlists and digest-only prose provenance', async () => {
    const { repo, tx } = setup(); const result = await repo.snapshot(principal);
    const text = JSON.stringify(result);
    for (const forbidden of ['private narrative', 'https://', 'reporter', 'predictive', 'evidenceUrl']) expect(text).not.toContain(forbidden);
    expect(tx.case.findMany.mock.calls[0][0].select).not.toHaveProperty('title');
    expect(result.fingerprintInputs.estimateSources[0].sourceReferenceDigest).toMatch(/^[a-f0-9]{64}$/);
    expect(Object.keys(tx)).toEqual(['asset', 'case', 'caseResourceEstimate']);
  });
  it('produces deterministic common-source fingerprints independent of row order', async () => {
    const first = await setup([asset('b'), asset()], [work('d'), work()], [estimate('z'), estimate()]).repo.snapshot(principal);
    const second = await setup([asset(), asset('b')], [work(), work('d')], [estimate(), estimate('z')]).repo.snapshot(principal);
    expect(first.sourceSetFingerprint).toBe(second.sourceSetFingerprint);
    expect(first.snapshot).toEqual(second.snapshot);
  });
});
