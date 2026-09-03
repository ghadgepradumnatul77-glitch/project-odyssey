import { describe, expect, it, vi } from 'vitest';
vi.mock('../src/lib/prisma', () => ({ default: {} }));
import { baselineFreshness, createAssetEvidenceService, projectAssetEvidence } from '../src/modules/assets/asset-evidence-baseline.service';
import type { AssetEvidenceRows } from '../src/modules/assets/asset-evidence-baseline.repository';
import type { OrganizationalPrincipal } from '../src/security/organizational-scope';

const asOf = new Date('2026-09-04T00:00:00Z');
const principal = { id: 'officer', role: 'OFFICER', status: 'ACTIVE', departmentId: 'dep', jurisdictionId: 'jur' } as OrganizationalPrincipal;
function row(): AssetEvidenceRows {
  return { asset: { id: 'a', assetCode: 'BR-1', assetType: 'BRIDGE', departmentId: 'dep', jurisdictionId: 'jur', latitude: null, longitude: null, constructionYear: null, conditionStatus: null, createdAt: asOf, updatedAt: asOf }, cases: [], history: { totalInspectionCount: 0, observationsAnalyzed: 0, fetchedInspectionCount: 0, truncated: false, inspections: [] }, assessments: [], plans: [], tasks: [], evidence: [], blockers: [], revisions: [], dependencies: [], estimates: [], closures: [], reports: [], observations: [], predictive: { availability: 'RESTRICTED', snapshots: null, outcomes: null } };
}
function setup(rows = [row()]) {
  const repo = { page: vi.fn().mockResolvedValue({ items: rows, limit: 25, nextCursor: null }), traverse: vi.fn(async (_p: unknown, _q: unknown, consume: (batch: AssetEvidenceRows[]) => void) => { for (const item of rows) consume([item]); return { totalAssets: rows.length, complete: true as const }; }) };
  return { repo, service: createAssetEvidenceService(repo, () => asOf) };
}
function addHistory(value: AssetEvidenceRows) {
  value.cases = [{ id: 'c', assetId: 'a', status: 'ORP_READY', riskLevel: 'VERY_HIGH', priorityLevel: 'CRITICAL', emergencyFlag: false, createdAt: asOf, updatedAt: asOf, closedAt: null }];
  value.history = { totalInspectionCount: 2, observationsAnalyzed: 2, fetchedInspectionCount: 2, truncated: false, inspections: [1, 0].map(i => ({ id: `i${i}`, caseId: 'c', assetId: 'a', inspectionDate: new Date(`2026-0${i + 1}-01T00:00:00Z`), createdAt: new Date(`2026-0${i + 1}-02T00:00:00Z`), updatedAt: asOf, structuralCondition: i ? 'POOR' : 'FAIR', crackSeverity: 'MINOR', corrosionLevel: 'LOW', trafficImportance: 'HIGH', hospitalRoute: false, weatherRisk: 'LOW', heavyRainExpected: false, estimatedDailyUsers: null, totalInspectionCount: 2n })) };
  value.assessments = [0, 1].map(i => ({ id: `r${i}`, caseId: 'c', inspectionId: `i${i}`, assessmentVersion: 'ODYSSEY_RISK_V1', sourceFingerprint: 'fp', riskScore: 30 + i * 10, riskLevel: 'LOW', priorityLevel: 'LOW', createdAt: asOf }));
}
function task(id: string, status = 'PENDING'): any {
  return { id, executionPlanId: 'plan', status, isMandatory: true, evidenceRequired: true, verificationRequired: true, assignedAt: null, startedAt: null, completionSubmittedAt: null, verifiedAt: null, cancelledAt: null, plannedStartAt: new Date('2026-01-01'), plannedEndAt: new Date('2026-02-01') };
}

describe('baseline service projection', () => {
  it('includes zero-Case assets without inventing low risk or a trend', async () => {
    const { service, repo } = setup(); const result = await service.page(principal);
    expect(result.items[0].asset.id).toBe('a'); expect(result.items[0].issueCodes).toEqual(expect.arrayContaining(['NO_CASE', 'NO_INSPECTION', 'NO_ASSESSMENT']));
    expect(result.items[0].caseStates.items).toEqual([]); expect(result.items[0].history.latestPair.state).toBe('NOT_COMPARABLE');
    expect(repo.page).toHaveBeenCalledWith(principal, {});
  });
  it('preserves repository pagination metadata and scope', async () => {
    const { service, repo } = setup(); repo.page.mockResolvedValue({ items: [row()], limit: 1, nextCursor: 'next' });
    const result = await service.page(principal, { limit: '1' });
    expect(result).toMatchObject({ limit: 1, nextCursor: 'next', scope: { mode: 'ORGANIZATIONAL', departmentId: 'dep', jurisdictionId: 'jur' }, asOf: asOf.toISOString() });
  });
  it('compares exact latest assessment pairs without modifying persisted risk', () => {
    const value = row(); addHistory(value); const before = JSON.stringify(value, (_, v) => typeof v === 'bigint' ? String(v) : v);
    const result = projectAssetEvidence(value, principal, asOf);
    expect(result.history.latestPair.value?.riskScoreChange.value?.delta).toBe(10);
    expect(result.history.latestPair.value?.physicalTrend.value).toBe('WORSENING');
    expect(result.caseStates.items[0].riskLevel.value).toBe('VERY_HIGH');
    expect(JSON.stringify(value, (_, v) => typeof v === 'bigint' ? String(v) : v)).toBe(before);
    expect(() => JSON.stringify(result)).not.toThrow();
  });
  it('does not bypass a new incompatible version to find an older comparable assessment', () => {
    const value = row(); addHistory(value);
    value.assessments.push({ ...value.assessments[1], id: 'z', createdAt: new Date('2026-09-04T00:00:01Z'), assessmentVersion: 'ODYSSEY_RISK_V2' });
    const result = projectAssetEvidence(value, principal, asOf);
    expect(result.history.latestPair.value?.riskScoreChange.reasonCodes).toContain('ASSESSMENT_VERSION_MISMATCH');
  });
  it('rejects assessment/Case link mismatch and reports missing pairing', () => {
    const value = row(); addHistory(value); value.assessments[1].caseId = 'another';
    const result = projectAssetEvidence(value, principal, asOf);
    expect(result.issueCodes).toContain('EVIDENCE_LINK_MISMATCH'); expect(result.metrics.analyzedInspectionsWithAssessment.counts.value?.numerator).toBe(1);
  });
  it('discloses exact history count, analysis limit and truncation', () => {
    const value = row(); addHistory(value);
    const source = value.history.inspections[0];
    value.history = { totalInspectionCount: 150, fetchedInspectionCount: 101, observationsAnalyzed: 100, truncated: true, inspections: Array.from({ length: 100 }, (_, i) => ({ ...source, id: `i${i}`, inspectionDate: new Date(Date.UTC(2026, 0, i + 1)) })) };
    const result = projectAssetEvidence(value, principal, asOf);
    expect(result.history.window.value).toMatchObject({ totalInspectionCount: 150, observationsAnalyzed: 100, truncated: true });
    expect(result.metrics.analyzedInspectionsWithAssessment.counts.value?.denominator).toBe(100);
  });
  it('reports raw freshness, missing capture dates and invalid future chronology without thresholds', () => {
    const result = baselineFreshness([new Date('2026-09-03'), null, new Date('2027-01-01')], asOf);
    expect(result).toMatchObject({ validCount: 1, missingCount: 1, invalidCount: 1, newestAgeMilliseconds: { value: 86400000 } });
    expect(baselineFreshness([null], asOf).newestAgeMilliseconds.state).toBe('MISSING');
    expect(baselineFreshness([], asOf).newestAgeMilliseconds.state).toBe('NOT_APPLICABLE');
    expect(JSON.stringify(result)).not.toMatch(/STALE|ATTENTION_SCORE/);
  });
  it('excludes terminal work and keeps submission separate from verification', () => {
    const value = row(); value.tasks = [task('pending'), task('cancelled', 'CANCELLED'), { ...task('submitted', 'COMPLETION_SUBMITTED'), completionSubmittedAt: new Date('2026-03-01') }, { ...task('verified', 'VERIFIED'), verifiedAt: new Date('2026-03-02') }];
    const result = projectAssetEvidence(value, principal, asOf);
    expect(result.operationalFacts.pendingWorkPastPlannedEnd).toBe(1); expect(result.operationalFacts.awaitingVerification).toBe(1);
    expect(result.metrics.nonterminalTasksWithSchedule.counts.value).toMatchObject({ numerator: 2, denominator: 2, excluded: 2 });
    expect(result.metrics.submittedTasksWithVerification.counts.value).toMatchObject({ denominator: 1, unknown: 1 });
  });
  it('detects open terminal blockers, absent evidence and invalid schedules', () => {
    const value = row(); value.tasks = [task('a', 'VERIFIED'), { ...task('b'), plannedStartAt: new Date('2026-05-01') }];
    value.blockers = [{ id: 'block', executionTaskId: 'a', category: 'OTHER', blockedAt: asOf, resolvedAt: null }];
    expect(projectAssetEvidence(value, principal, asOf).issueCodes).toEqual(expect.arrayContaining(['TERMINAL_TASK_OPEN_BLOCKER', 'REQUIRED_EVIDENCE_ABSENT', 'SCHEDULE_INVALID']));
  });
  it('keeps missing and invalid coordinates distinct, preserving zero coordinates', () => {
    const value = row(); expect(projectAssetEvidence(value, principal, asOf).asset.coordinates.state).toBe('MISSING');
    value.asset.latitude = 0 as any; expect(projectAssetEvidence(value, principal, asOf).asset.coordinates.state).toBe('INVALID');
    value.asset.longitude = 0 as any; expect(projectAssetEvidence(value, principal, asOf).asset.coordinates.value).toEqual({ latitude: 0, longitude: 0 });
    value.asset.latitude = 100 as any; expect(projectAssetEvidence(value, principal, asOf).asset.coordinates.state).toBe('INVALID');
  });
  it('never returns extra persistence fields, raw payloads, URLs, people or notes', () => {
    const value = row(); addHistory(value);
    (value.asset as any).reporterContact = 'SECRET'; (value.cases[0] as any).description = 'SECRET';
    value.evidence = [{ id: 'e', executionTaskId: 't', evidenceType: 'PHOTO_REFERENCE', capturedAt: null, submittedAt: asOf, referenceUrl: 'SECRET', measurementData: { password: 'SECRET' } } as any];
    expect(JSON.stringify(projectAssetEvidence(value, principal, asOf))).not.toContain('SECRET');
  });
  it('bounds source references while keeping exact counts', () => {
    const value = row(); value.reports = Array.from({ length: 30 }, (_, i) => ({ id: `r${i}`, assetId: 'a', createdCaseId: null, status: 'SUBMITTED', submittedAt: asOf, reviewStartedAt: null, decisionAt: null }));
    const result = projectAssetEvidence(value, principal, asOf).evidence.reports;
    expect(result.count.value).toBe(30); expect(result.sourceIds).toHaveLength(20); expect(result.sourceIdsTruncated).toBe(true);
  });
  it.each(['OFFICER', 'POLICY_ADMIN'])('preserves predictive restriction for %s even if a stub supplies records', role => {
    const value = row(); value.predictive = { availability: 'AVAILABLE', snapshots: [{ id: 'secret-snapshot' }] as any, outcomes: [] };
    const result = projectAssetEvidence(value, { ...principal, role: role as any }, asOf);
    expect(result.predictive).toEqual({ availability: 'RESTRICTED', snapshots: null, outcomes: null }); expect(JSON.stringify(result)).not.toContain('secret-snapshot');
  });
  it('does not claim model eligibility from permitted metadata', () => {
    const value = row(); value.predictive = { availability: 'AVAILABLE', snapshots: [], outcomes: [] };
    expect(projectAssetEvidence(value, { ...principal, role: 'AUDITOR' }, asOf).predictive).toMatchObject({ availability: 'AVAILABLE', eligibility: { state: 'NOT_COMPARABLE' } });
  });
});

describe('complete scoped aggregate service', () => {
  it('uses complete traversal, not the paginated endpoint, and sums buckets not percentages', async () => {
    const a = row(), b = row(); addHistory(b); b.asset.id = 'b';
    const { service, repo } = setup([a, b]); const result = await service.summary(principal);
    expect(repo.page).not.toHaveBeenCalled(); expect(repo.traverse).toHaveBeenCalledWith(principal, {}, expect.any(Function));
    expect(result.totalAssets).toBe(2); expect(result.metrics.assetsWithCases).toMatchObject({ counts: { value: { numerator: 1, denominator: 2, unknown: 0, excluded: 0 } }, percentage: { value: 50 } });
    expect(result.metrics.analyzedInspectionsWithAssessment.counts.value?.denominator).toBe(2);
    expect(result.predictive).toMatchObject({ availability: 'RESTRICTED', snapshotCount: null });
  });
  it('returns not applicable percentages for empty authorized populations', async () => {
    const { service } = setup([]); const result = await service.summary(principal);
    expect(result.totalAssets).toBe(0); expect(Object.keys(result.metrics).length).toBeGreaterThan(10);
    for (const metric of Object.values(result.metrics)) expect(metric.percentage.state).toBe('NOT_APPLICABLE');
  });
  it('merges raw age extrema and explicit missing/invalid populations', async () => {
    const a = row(), b = row(); addHistory(a); addHistory(b); b.history.inspections[0].inspectionDate = new Date('2027-01-01');
    const result = await setup([a, b]).service.summary(principal);
    expect(result.freshness['inspectionsAnalyzed.inspectionDate']).toMatchObject({ population: 4, validCount: 3, invalidCount: 1 });
  });
  it('does not return partial summary on timeout or inconsistent traversal', async () => {
    const { repo, service } = setup(); repo.traverse.mockRejectedValue(new Error('timeout SECRET'));
    await expect(service.summary(principal)).rejects.toThrow();
    repo.traverse.mockResolvedValue({ totalAssets: 5, complete: true }); await expect(service.summary(principal)).rejects.toThrow('BASELINE_TRAVERSAL_INCOMPLETE');
  });
  it.each(['page', 'summary'] as const)('gives identical not-found behavior for absent/hidden explicit Asset in %s', async method => {
    await expect(setup([]).service[method](principal, { assetId: '10000000-0000-4000-8000-000000000001' })).rejects.toMatchObject({ code: 'ASSET_NOT_FOUND' });
  });
  it('rejects unsupported/ranking/asOf and summary-pagination parameters', async () => {
    const { repo, service } = setup();
    for (const query of [{ ranking: 'risk' }, { asOf: '2020-01-01' }, { limit: '101' }]) await expect(service.page(principal, query)).rejects.toThrow();
    await expect(service.summary(principal, { limit: '1' })).rejects.toThrow(); expect(repo.page).not.toHaveBeenCalled(); expect(repo.traverse).not.toHaveBeenCalled();
  });
});
