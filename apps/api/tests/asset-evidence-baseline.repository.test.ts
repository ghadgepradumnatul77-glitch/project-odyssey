import { describe, expect, it, vi } from 'vitest';
vi.mock('../src/lib/prisma', () => ({ default: {} }));
import { createAssetEvidenceRepository, EVIDENCE_BATCH_SIZE } from '../src/modules/assets/asset-evidence-baseline.repository';
import { encodeCursor, parseCursor } from '../src/lib/pagination';
import type { OrganizationalPrincipal } from '../src/security/organizational-scope';

const principal = { id: 'officer', role: 'OFFICER', status: 'ACTIVE', departmentId: 'dep', jurisdictionId: 'jur' } as OrganizationalPrincipal;
const asset = (id: string, extra = {}) => ({ id, assetCode: id, assetType: 'BRIDGE', departmentId: 'dep', jurisdictionId: 'jur', latitude: null, longitude: null, constructionYear: null, conditionStatus: null, createdAt: new Date('2026-01-01T00:00:00Z'), updatedAt: new Date('2026-01-01T00:00:00Z'), ...extra });
const names = ['asset', 'case', 'riskAssessment', 'executionPlan', 'executionTask', 'executionEvidence', 'executionTaskBlockerEvent', 'executionScheduleRevision', 'executionTaskDependency', 'caseResourceEstimate', 'caseClosure', 'publicReport', 'externalObservation', 'predictiveFeatureSnapshot', 'predictiveOutcome'];
function setup(rows = [asset('a')]) {
  const tx: any = Object.fromEntries(names.map(name => [name, { findMany: vi.fn().mockResolvedValue([]) }]));
  tx.asset.findMany.mockResolvedValue(rows);
  tx.$queryRaw = vi.fn().mockResolvedValue([]);
  const db: any = { $transaction: vi.fn(async (fn: any) => fn(tx)) };
  return { tx, db, repo: createAssetEvidenceRepository(db) };
}
function selectedNames(select: any): string[] {
  return Object.entries(select).flatMap(([key, value]: any) => [key, ...(value?.select ? selectedNames(value.select) : [])]);
}

describe('asset-first evidence repository', () => {
  it('includes zero-Case assets with empty relations and measured zero history', async () => {
    const { repo } = setup();
    const result = await repo.page(principal);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({ asset: { id: 'a' }, cases: [], tasks: [], reports: [], history: { totalInspectionCount: 0, observationsAnalyzed: 0, truncated: false, inspections: [] }, predictive: { availability: 'RESTRICTED', snapshots: null } });
  });
  it('does no related reads for an empty authorized page', async () => {
    const { repo, tx } = setup([]);
    expect((await repo.page(principal)).items).toEqual([]);
    expect(tx.$queryRaw).not.toHaveBeenCalled();
    for (const name of names.filter(name => name !== 'asset')) expect(tx[name].findMany).not.toHaveBeenCalled();
  });
  it('applies scope before take and combines client filters instead of replacing it', async () => {
    const { repo, tx } = setup([]);
    const otherDepartment = '11111111-1111-4111-8111-111111111111';
    await repo.page(principal, { departmentId: otherDepartment });
    expect(tx.asset.findMany.mock.calls[0][0]).toMatchObject({ where: { AND: [{ AND: [{ departmentId: 'dep', jurisdictionId: 'jur' }, { departmentId: otherDepartment }] }, {}] }, take: 26, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
  });
  it('queries only authorized Asset IDs for descendants, including raw history SQL', async () => {
    const { repo, tx } = setup([asset('allowed-a'), asset('allowed-b')]);
    await repo.page(principal);
    expect(tx.case.findMany.mock.calls[0][0].where.assetId.in).toEqual(['allowed-a', 'allowed-b']);
    expect(tx.executionTask.findMany.mock.calls[0][0].where.executionPlan.case.assetId.in).toEqual(['allowed-a', 'allowed-b']);
    const sql = tx.$queryRaw.mock.calls[0][0];
    expect(sql.values).toEqual(['allowed-a', 'allowed-b', 101]);
    expect(sql.sql).not.toContain('allowed-a');
  });
  it('independently scopes reports and external observations, with OR only inside scope', async () => {
    const { repo, tx } = setup(); await repo.page(principal);
    for (const name of ['publicReport', 'externalObservation']) {
      const where = tx[name].findMany.mock.calls[0][0].where;
      expect(where.AND[0]).toEqual({ departmentId: 'dep', jurisdictionId: 'jur' });
      expect(where.AND[1].OR).toHaveLength(2);
    }
  });
  it('retains system-admin global reads without granting predictive reads to policy-admin', async () => {
    const admin = setup(); await admin.repo.page({ ...principal, role: 'SYSTEM_ADMIN' });
    expect(admin.tx.asset.findMany.mock.calls[0][0].where.AND[0].AND[0]).toEqual({});
    expect(admin.tx.predictiveFeatureSnapshot.findMany).toHaveBeenCalledOnce();
    const policy = setup(); await policy.repo.page({ ...principal, role: 'POLICY_ADMIN' });
    expect(policy.tx.predictiveFeatureSnapshot.findMany).not.toHaveBeenCalled();
    expect(policy.tx.predictiveOutcome.findMany).not.toHaveBeenCalled();
  });
  it('scopes auditor predictive reads by both stored organization and authoritative task ancestry', async () => {
    const { repo, tx } = setup(); await repo.page({ ...principal, role: 'AUDITOR' });
    expect(tx.predictiveFeatureSnapshot.findMany.mock.calls[0][0].where.AND).toEqual(expect.arrayContaining([
      { departmentId: 'dep', jurisdictionId: 'jur' }, { assetId: { in: ['a'] } }, { executionTask: { executionPlan: { case: { assetId: { in: ['a'] } } } } }
    ]));
  });
  it('uses limit+1 but does not load evidence for the pagination sentinel', async () => {
    const { repo, tx } = setup([asset('c'), asset('b'), asset('a')]);
    const result = await repo.page(principal, { limit: '2' });
    expect(result.items.map(row => row.asset.id)).toEqual(['c', 'b']);
    expect(parseCursor(result.nextCursor)).toEqual({ id: 'b', at: '2026-01-01T00:00:00.000Z' });
    expect(tx.case.findMany.mock.calls[0][0].where.assetId.in).toEqual(['c', 'b']);
  });
  it('enforces both createdAt and ID cursor boundaries inside the scoped query', async () => {
    const { repo, tx } = setup([]);
    await repo.page(principal, { cursor: encodeCursor({ id: 'b', at: '2026-01-01T00:00:00Z' }), limit: '100' });
    expect(tx.asset.findMany.mock.calls[0][0]).toMatchObject({ take: 101, where: { AND: [expect.anything(), { OR: [{ createdAt: { lt: new Date('2026-01-01') } }, { createdAt: new Date('2026-01-01'), id: { lt: 'b' } }] }] } });
  });
  it.each([{ limit: '0' }, { limit: '101' }, { limit: '-1' }, { cursor: 'invalid' }, { assetId: 'invalid' }])('rejects invalid query before database reads %s', async query => {
    const { repo, db } = setup(); await expect(repo.page(principal, query)).rejects.toThrow(); expect(db.$transaction).not.toHaveBeenCalled();
  });
  it('has constant related query counts for one versus 100 assets', async () => {
    const one = setup(), many = setup(Array.from({ length: 100 }, (_, i) => asset(`a${i}`)));
    await one.repo.page(principal); await many.repo.page(principal, { limit: '100' });
    for (const name of names.filter(name => name !== 'asset')) expect(many.tx[name].findMany.mock.calls.length).toBe(one.tx[name].findMany.mock.calls.length);
    expect(many.tx.$queryRaw).toHaveBeenCalledOnce();
  });
  it('continues related-record batches without silently capping them', async () => {
    const { repo, tx } = setup();
    tx.case.findMany.mockResolvedValueOnce(Array.from({ length: 500 }, (_, i) => ({ id: `c${i}`, assetId: 'a' }))).mockResolvedValueOnce([{ id: 'last', assetId: 'a' }]);
    const result = await repo.page(principal);
    expect(result.items[0].cases).toHaveLength(501);
    expect(tx.case.findMany.mock.calls[1][0]).toMatchObject({ where: { id: { gt: 'c499' } }, take: 500 });
  });
  it('deduplicates direct and Case-derived report/observation links', async () => {
    const { repo, tx } = setup();
    tx.case.findMany.mockResolvedValue([{ id: 'c', assetId: 'a' }]);
    tx.publicReport.findMany.mockResolvedValue([{ id: 'r', assetId: 'a', createdCaseId: 'c' }]);
    tx.externalObservation.findMany.mockResolvedValue([{ id: 'o', assetId: 'a', caseId: 'c' }]);
    const value = (await repo.page(principal)).items[0];
    expect(value.reports).toHaveLength(1); expect(value.observations).toHaveLength(1);
  });
  it('attaches Case-only links and leaves unrelated records unattached', async () => {
    const { repo, tx } = setup(); tx.case.findMany.mockResolvedValue([{ id: 'c', assetId: 'a' }]);
    tx.publicReport.findMany.mockResolvedValue([{ id: 'r', assetId: null, createdCaseId: 'c' }, { id: 'foreign', assetId: 'elsewhere', createdCaseId: null }]);
    expect((await repo.page(principal)).items[0].reports.map(row => row.id)).toEqual(['r']);
  });
  it('requests 101 per asset with exact total counts and retains 100', async () => {
    const { repo, tx } = setup();
    tx.$queryRaw.mockResolvedValue(Array.from({ length: 101 }, (_, i) => ({ id: `i${i}`, assetId: 'a', totalInspectionCount: 200n })));
    const history = (await repo.page(principal)).items[0].history;
    expect(history).toMatchObject({ totalInspectionCount: 200, fetchedInspectionCount: 101, observationsAnalyzed: 100, truncated: true });
    expect(history.inspections).toHaveLength(100);
    const sql = tx.$queryRaw.mock.calls[0][0];
    expect(sql.sql).toContain('PARTITION BY c."assetId"'); expect(sql.sql).toContain('ROW_NUMBER()'); expect(sql.sql).toContain('COUNT(*) OVER'); expect(sql.values.at(-1)).toBe(101);
  });
  it('traverses every Asset batch under one repeatable-read transaction', async () => {
    const { repo, tx, db } = setup();
    tx.asset.findMany.mockResolvedValueOnce(Array.from({ length: EVIDENCE_BATCH_SIZE }, (_, i) => asset(`a${i}`))).mockResolvedValueOnce([asset('last')]);
    const batches: number[] = [];
    expect(await repo.traverse(principal, {}, rows => { batches.push(rows.length); })).toEqual({ totalAssets: 501, complete: true });
    expect(batches).toEqual([500, 1]);
    expect(tx.asset.findMany.mock.calls[1][0]).toMatchObject({ where: { AND: [expect.anything(), { id: { gt: 'a499' } }] }, orderBy: { id: 'asc' } });
    expect(db.$transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: 'RepeatableRead', timeout: 30000 });
  });
  it('propagates traversal failures instead of reporting partial completion', async () => {
    const { repo, tx } = setup(); tx.$queryRaw.mockRejectedValue(new Error('timeout'));
    const consume = vi.fn(); await expect(repo.traverse(principal, {}, consume)).rejects.toThrow('timeout'); expect(consume).not.toHaveBeenCalled();
  });
  it('selects allowlisted fields only and never selects raw JSON/personnel/narrative fields', async () => {
    const { repo, tx } = setup(); await repo.page({ ...principal, role: 'AUDITOR' });
    const forbidden = ['reporterName', 'reporterContact', 'description', 'title', 'inspectionNotes', 'referenceUrl', 'documentReference', 'measurementData', 'sourceMetadata', 'normalizedData', 'featurePayload', 'sourceReferences', 'assignedToId', 'assignedById', 'completionNote', 'verificationNote', 'reason', 'closureSummary', 'estimateBasis'];
    for (const name of names) {
      const args = tx[name].findMany.mock.calls[0][0];
      expect(args.include).toBeUndefined();
      expect(selectedNames(args.select).filter(key => forbidden.includes(key))).toEqual([]);
    }
    const sql = tx.$queryRaw.mock.calls[0][0].sql;
    for (const key of forbidden) expect(sql).not.toContain(`"${key}"`);
  });
});
