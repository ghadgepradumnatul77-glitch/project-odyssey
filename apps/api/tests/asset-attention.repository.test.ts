import { describe, expect, it, vi } from 'vitest';
vi.mock('../src/lib/prisma', () => ({ default: {} }));
import { createAssetAttentionRepository, projectAttentionRows } from '../src/modules/assets/asset-attention.repository';
import type { OrganizationalPrincipal } from '../src/security/organizational-scope';

const now = new Date('2026-09-07T00:00:00Z');
const principal = { id: 'officer', role: 'OFFICER', status: 'ACTIVE', departmentId: 'dep', jurisdictionId: 'jur' } as OrganizationalPrincipal;
function rows(changes: Record<string, unknown> = {}): any {
  return { asset: { id: 'asset-1', assetCode: 'A-1', assetType: 'BRIDGE', departmentId: 'dep', jurisdictionId: 'jur', latitude: null, longitude: null, constructionYear: null, conditionStatus: null, createdAt: now, updatedAt: now },
    cases: [], history: { totalInspectionCount: 0, fetchedInspectionCount: 0, observationsAnalyzed: 0, truncated: false, inspections: [] }, assessments: [], plans: [], tasks: [], evidence: [], blockers: [], revisions: [], dependencies: [], estimates: [], closures: [], reports: [], observations: [], predictive: { availability: 'RESTRICTED', snapshots: null, outcomes: null }, ...changes };
}
const caseRow = (id: string, status = 'ORP_READY') => ({ id, assetId: 'asset-1', status, riskLevel: 'VERY_HIGH', priorityLevel: 'CRITICAL', emergencyFlag: false, createdAt: now, updatedAt: now, closedAt: status === 'CLOSED' ? now : null });
function repository(items = [rows()]) {
  return { page: vi.fn().mockResolvedValue({ items, limit: 25, nextCursor: null }), traverse: vi.fn(async (_p, _q, consume) => { consume(items); return { totalAssets: items.length, complete: true }; }) } as any;
}

describe('scoped Asset attention repository adapter', () => {
  it('includes an authorized zero-Case Asset with exact zero counts', () => {
    const value = projectAttentionRows(rows(), now);
    expect(value.input.cases).toEqual([]); expect(value.sourceCounts).toMatchObject({ cases: 0, activeCases: 0, inspections: 0, publicReports: 0 });
  });

  it('preserves multiple active Cases independently and separates terminal history', () => {
    const value = projectAttentionRows(rows({ cases: [caseRow('active-1'), caseRow('active-2'), caseRow('closed', 'CLOSED'), caseRow('cancelled', 'CANCELLED')] }), now);
    expect(value.input.cases.map(item => item.id)).toEqual(['active-1', 'active-2', 'closed', 'cancelled']);
    expect(value.sourceCounts).toMatchObject({ activeCases: 2, closedOrCancelledCases: 2 });
    expect(value.closedOrCancelledCaseIds).toEqual(['closed', 'cancelled']);
  });

  it('delegates scope, filters, stable pagination and defaults to the P4.1 repository', async () => {
    const evidence = repository(), repo = createAssetAttentionRepository(evidence, () => now);
    const query = { limit: '100', cursor: 'opaque', departmentId: 'dep-filter' };
    await repo.page(principal, query);
    expect(evidence.page).toHaveBeenCalledWith(principal, query);
    expect(evidence.page).toHaveBeenCalledOnce();
  });

  it('deduplicates direct and Case-derived records already bucketed by P4.1 and bounds contextual references', () => {
    const report = { id: 'report', submittedAt: now }, observation = { id: 'obs', observedAt: now, sourceId: 'source', sourceVersion: '1', schemaVersion: '1', qualityState: 'VALID', validationState: 'ACCEPTED', source: { isActive: true } };
    const value = projectAttentionRows(rows({ reports: Array(25).fill(report), observations: Array(25).fill(observation) }), now);
    expect(value.sourceCounts).toMatchObject({ publicReports: 25, externalObservations: 25 });
    expect(value.input.publicReports).toHaveLength(20); expect(value.input.externalObservations).toHaveLength(20);
    expect(value.input.sourceReferencesTruncated).toBe(true);
  });

  it('preserves blocker, dependency, evidence and verification ownership', () => {
    const data = rows({ cases: [caseRow('case-1')], plans: [{ id: 'plan-1', caseId: 'case-1' }],
      tasks: [{ id: 'pre', executionPlanId: 'plan-1', status: 'IN_PROGRESS', evidenceRequired: false, plannedEndAt: now, completionSubmittedAt: null, verifiedAt: null }, { id: 'task', executionPlanId: 'plan-1', status: 'COMPLETION_SUBMITTED', evidenceRequired: true, plannedEndAt: now, completionSubmittedAt: now, verifiedAt: null }],
      evidence: [{ id: 'evidence', executionTaskId: 'task', capturedAt: now }], blockers: [{ id: 'blocker', executionTaskId: 'task', resolvedAt: null }],
      dependencies: [{ id: 'dependency', executionPlanId: 'plan-1', dependentTaskId: 'task', predecessorTaskId: 'pre' }] });
    const value = projectAttentionRows(data, now).input.tasks.find(item => item.id === 'task')!;
    expect(value).toMatchObject({ caseId: 'case-1', evidenceCount: 1, openBlockerIds: ['blocker'], unmetDependencyIds: ['pre'], completionSubmittedAt: now, verifiedAt: null });
  });

  it('preserves estimate presence and duration only, selecting the latest active version', () => {
    const value = projectAttentionRows(rows({ cases: [caseRow('case-1')], estimates: [{ id: 'old', caseId: 'case-1', estimateVersion: 1, status: 'SUPERSEDED', estimatedDurationDays: 2 }, { id: 'new', caseId: 'case-1', estimateVersion: 2, status: 'ACTIVE', estimatedDurationDays: 7, estimatedCostMinor: 999n, resourceRequirements: { secret: true } }] }), now);
    expect(value.input.cases[0].activeEstimate).toEqual({ id: 'new', estimatedDurationDays: 7, valid: true });
    expect(JSON.stringify(value.input.cases[0])).not.toContain('estimatedCostMinor');
  });

  it('retains exact inspection counts and history truncation disclosure', () => {
    const inspections = Array.from({ length: 100 }, (_, i) => ({ id: `i-${i}`, caseId: 'case-1', inspectionDate: new Date(Date.UTC(2026, 0, i + 1)), structuralCondition: 'FAIR', crackSeverity: 'MINOR', corrosionLevel: 'LOW' }));
    const value = projectAttentionRows(rows({ cases: [caseRow('case-1')], history: { totalInspectionCount: 101, fetchedInspectionCount: 101, observationsAnalyzed: 100, truncated: true, inspections } }), now);
    expect(value.sourceCounts.inspections).toBe(101); expect(value.input.history.window).toMatchObject({ state: 'PRESENT', value: { totalInspectionCount: 101, observationsAnalyzed: 100, truncated: true } });
    expect(value.input.sourceReferencesTruncated).toBe(true);
  });

  it('does not misclassify assessments outside the bounded inspection window as link conflicts', () => {
    const value = projectAttentionRows(rows({ cases: [caseRow('case-1')], assessments: [{ id: 'risk-old', caseId: 'case-1', inspectionId: 'outside-window', assessmentVersion: 'ODYSSEY_RISK_V1', riskScore: 20, riskLevel: 'LOW', priorityLevel: 'LOW', createdAt: now }] }), now);
    expect(value.input.linkMismatchIds).toEqual([]);
    expect(value.input.sourceSetFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it('preserves predictive restrictions and emits a privacy-safe allowlisted projection', () => {
    const raw = rows({ cases: [{ ...caseRow('case-1'), title: 'private', description: 'narrative' }], reports: [{ id: 'r', submittedAt: now, reporterName: 'PII', description: 'narrative' }], predictive: { availability: 'RESTRICTED', snapshots: null, outcomes: null } });
    const value = projectAttentionRows(raw, now), serialized = JSON.stringify(value);
    expect(value.predictiveAvailability).toBe('RESTRICTED');
    for (const forbidden of ['reporterName', 'description', 'featurePayload', 'normalizedData', 'resourceRequirements']) expect(serialized).not.toContain(forbidden);
  });

  it('uses one delegated batched page read regardless of Asset count', async () => {
    const evidence = repository(Array.from({ length: 100 }, (_, i) => rows({ asset: { ...rows().asset, id: `asset-${i}` } })));
    const result = await createAssetAttentionRepository(evidence, () => now).page(principal, { limit: '100' });
    expect(result.items).toHaveLength(100); expect(evidence.page).toHaveBeenCalledOnce();
  });

  it('traverses complete 500-row P4.1 batches and propagates timeout/failure without partial success', async () => {
    const evidence = repository([rows()]), consume = vi.fn();
    expect(await createAssetAttentionRepository(evidence, () => now).traverse(principal, {}, consume)).toEqual({ totalAssets: 1, complete: true });
    expect(consume).toHaveBeenCalledOnce();
    evidence.traverse.mockRejectedValueOnce(new Error('timeout')); consume.mockClear();
    await expect(createAssetAttentionRepository(evidence, () => now).traverse(principal, {}, consume)).rejects.toThrow('timeout');
    expect(consume).not.toHaveBeenCalled();
  });
});
