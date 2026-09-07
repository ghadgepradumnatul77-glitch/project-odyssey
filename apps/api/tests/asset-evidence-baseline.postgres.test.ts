import { afterAll, beforeAll, expect, it, describe } from 'vitest';
import { randomUUID } from 'node:crypto';
import { SignJWT } from 'jose';
import request from 'supertest';
import { PrismaClient } from '../src/generated/prisma';
import prisma from '../src/lib/prisma';
import { app } from '../src/server';
import { getAuthConfig } from '../src/config/auth';

// Opt-in only. Operator supplies a NEW migrated, disposable PostgreSQL 16 DB.
// Never reset or clean existing data. Container disposal is an operator action.
const enabled = process.env.P4_1_ISOLATED_DB === 'true';
if (enabled) {
  const url = new URL(process.env.DATABASE_URL ?? '');
  if (url.hostname !== '127.0.0.1' || url.pathname !== '/odyssey_p41_isolated' || !url.port || url.port === '5432') throw new Error('P4.1 requires the dedicated disposable database on a noncanonical loopback port.');
}
describe.runIf(enabled)('P4.1 isolated PostgreSQL assembled acceptance', () => {
  let fixture: PrismaClient;
  const d = randomUUID(), j = randomUUID(), d2 = randomUUID(), j2 = randomUUID(), j3 = randomUUID();
  const officer = randomUUID(), auditor = randomUUID(), foreign = randomUUID(), neighbor = randomUUID();
  const a = randomUUID(), b = randomUUID(), c = randomUUID();
  let before: unknown;
  async function token(id: string) {
    const cfg = getAuthConfig();
    return `Bearer ${await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(id).setIssuer(cfg.issuer).setAudience(cfg.audience).setIssuedAt().setExpirationTime('5m').sign(cfg.secret)}`;
  }
  async function fingerprints() {
    const tables = await fixture.$queryRaw<{ tablename: string }[]>`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`;
    const result: Record<string, unknown> = {};
    for (const { tablename } of tables) {
      // Identifiers are catalog-derived and quoted, never request input.
      const quoted = '"' + tablename.replaceAll('"', '""') + '"';
      result[tablename] = await fixture.$queryRawUnsafe(`SELECT count(*)::int AS count, md5(coalesce(string_agg(t::text, '' ORDER BY t::text), '')) AS digest FROM (SELECT row_to_json(r) AS t FROM ${quoted} r) s`);
    }
    return result;
  }
  beforeAll(async () => {
    fixture = new PrismaClient();
    expect(await fixture.asset.count()).toBe(0); expect(await fixture.department.count()).toBe(0);
    const version = await fixture.$queryRaw<{ server_version: string }[]>`SHOW server_version`;
    expect(version[0].server_version).toMatch(/^16\./);
    await fixture.department.createMany({ data: [{ id: d, name: 'Synthetic P4.1', code: 'P41-A' }, { id: d2, name: 'Synthetic P4.1 other', code: 'P41-B' }] });
    await fixture.jurisdiction.createMany({ data: [{ id: j, departmentId: d, name: 'Synthetic A', type: 'TEST' }, { id: j2, departmentId: d2, name: 'Synthetic B', type: 'TEST' }, { id: j3, departmentId: d, name: 'Synthetic C', type: 'TEST' }] });
    await fixture.user.createMany({ data: [
      { id: officer, role: 'OFFICER' as const, departmentId: d, jurisdictionId: j },
      { id: auditor, role: 'AUDITOR' as const, departmentId: d, jurisdictionId: j },
      { id: foreign, role: 'OFFICER' as const, departmentId: d2, jurisdictionId: j2 },
      { id: neighbor, role: 'OFFICER' as const, departmentId: d, jurisdictionId: j3 }
    ].map(u => ({ ...u, employeeCode: u.id, email: `${u.id}@example.invalid`, name: 'Synthetic test user', passwordHash: 'NOT_A_LOGIN_HASH', designation: 'TEST' })) });
    const assets = Array.from({ length: 501 }, (_, i) => ({ id: i === 0 ? a : i === 1 ? b : randomUUID(), assetCode: `P41-SYNTHETIC-${String(i).padStart(3, '0')}`, assetType: 'BRIDGE' as const, name: 'Synthetic asset', departmentId: d, jurisdictionId: j, createdAt: new Date('2026-01-01') }));
    await fixture.asset.createMany({ data: [...assets, { ...assets[0], id: c, assetCode: 'P41-FOREIGN', departmentId: d2, jurisdictionId: j2, createdAt: new Date('2026-02-01') }] });
    const caseA = await fixture.case.create({ data: { assetId: a, caseNumber: 'P41-CASE-A', title: 'Synthetic', status: 'ORP_READY', riskLevel: 'VERY_HIGH', priorityLevel: 'CRITICAL' } });
    await fixture.case.create({ data: { assetId: a, caseNumber: 'P42-CASE-A2', title: 'Synthetic second active Case', status: 'NEW', riskLevel: 'LOW', priorityLevel: 'LOW' } });
    const caseB = await fixture.case.create({ data: { assetId: b, caseNumber: 'P41-CASE-B', title: 'Synthetic', status: 'NEW' } });
    const inspections = [caseA, caseB].flatMap((cs, k) => Array.from({ length: k === 0 ? 101 : 100 }, (_, i) => ({ id: randomUUID(), caseId: cs.id, inspectorId: officer, inspectionDate: new Date(Date.UTC(2025, 0, i + 1)), structuralCondition: 'POOR', crackSeverity: 'SEVERE', corrosionLevel: 'MODERATE', trafficImportance: 'HIGH', hospitalRoute: true, weatherRisk: 'HIGH', heavyRainExpected: true, estimatedDailyUsers: 42000, inspectionNotes: 'PRIVATE_SENTINEL' })));
    await fixture.inspection.createMany({ data: inspections });
    const risk = await fixture.riskAssessment.create({ data: { caseId: caseA.id, inspectionId: inspections[100].id, riskScore: 77, riskLevel: 'VERY_HIGH', priorityLevel: 'CRITICAL', reasons: [], reasonCodes: [], sourceFingerprint: randomUUID() } });
    await fixture.publicReport.create({ data: { reportNumber: 'P41-REPORT', title: 'PRIVATE_SENTINEL', description: 'PRIVATE_SENTINEL', category: 'OTHER', locationText: 'PRIVATE_SENTINEL', reporterName: 'PRIVATE_SENTINEL', reporterContact: 'PRIVATE_SENTINEL', assetId: a, createdCaseId: caseA.id, departmentId: d, jurisdictionId: j } });
    const source = await fixture.observationSource.create({ data: { sourceCode: 'P41-SOURCE', versionNumber: 1, name: 'Synthetic source', sourceType: 'WEATHER_PROVIDER', providerReference: 'TEST', contractVersion: 'TEST', provenanceMetadata: {}, createdById: officer } });
    await fixture.externalObservation.createMany({ data: [
      { id: randomUUID(), departmentId: d, jurisdictionId: j, sourceRecordId: 'visible' },
      { id: randomUUID(), departmentId: d2, jurisdictionId: j2, sourceRecordId: 'foreign-metadata' }
    ].map(o => ({ ...o, assetId: a, caseId: caseA.id, sourceId: source.id, sourceVersion: 'TEST', observationType: 'WEATHER' as const, schemaVersion: 'TEST', normalizedData: { private: 'PRIVATE_SENTINEL' }, sourceMetadata: {}, observedAt: new Date('2026-01-01'), qualityState: 'VALID' as const, validationState: 'ACCEPTED' as const, fingerprint: randomUUID(), ingestedById: officer })) });
    const orp = await fixture.operationalResponsePlan.create({ data: { caseId: caseA.id, riskAssessmentId: risk.id, versionNumber: 1, urgency: 'TEST', recommendedActionCodes: [], temporaryMeasures: [], reasons: [], alternativeActionCodes: [] } });
    const authority = await fixture.approvalAuthority.create({ data: { userId: officer, departmentId: d, jurisdictionId: j } });
    const decision = await fixture.orpDecision.create({ data: { caseId: caseA.id, orpId: orp.id, reviewerId: officer, authorityGrantId: authority.id, decisionType: 'APPROVED' } });
    const plan = await fixture.executionPlan.create({ data: { caseId: caseA.id, orpId: orp.id, approvalDecisionId: decision.id, createdById: officer } });
    const task = await fixture.executionTask.create({ data: { executionPlanId: plan.id, sequenceNumber: 1, sourceActionCode: 'TEST', templateTaskKey: 'TEST', titleSnapshot: 'PRIVATE_SENTINEL', descriptionSnapshot: 'PRIVATE_SENTINEL', categorySnapshot: 'TEST' } });
    const dependent = await fixture.executionTask.create({ data: { executionPlanId: plan.id, sequenceNumber: 2, sourceActionCode: 'TEST-2', templateTaskKey: 'TEST-2', titleSnapshot: 'PRIVATE_SENTINEL', descriptionSnapshot: 'PRIVATE_SENTINEL', categorySnapshot: 'TEST', status: 'BLOCKED', evidenceRequired: true } });
    await fixture.executionTaskDependency.create({ data: { executionPlanId: plan.id, dependentTaskId: dependent.id, predecessorTaskId: task.id, createdById: officer } });
    await fixture.executionTaskBlockerEvent.create({ data: { executionTaskId: dependent.id, category: 'DEPENDENCY', reason: 'PRIVATE_SENTINEL', blockedById: officer } });
    await fixture.executionEvidence.create({ data: { executionTaskId: task.id, submittedById: officer, evidenceType: 'DOCUMENT_REFERENCE', description: 'PRIVATE_SENTINEL', referenceUrl: 'https://example.invalid/PRIVATE_SENTINEL' } });
    const snapshot = await fixture.predictiveFeatureSnapshot.create({ data: { targetType: 'TASK_LATENESS', executionTaskId: task.id, caseId: caseA.id, assetId: a, departmentId: d, jurisdictionId: j, predictionTimestamp: new Date('2026-01-01'), featureContractVersion: 'TEST', featurePayload: { private: 'PRIVATE_SENTINEL' }, provenanceClass: 'TEST', sourceReferences: {}, sourceFingerprint: randomUUID(), createdById: officer } });
    await fixture.predictiveOutcome.create({ data: { snapshotId: snapshot.id, outcomeContractVersion: 'TEST', outcomeTimestamp: new Date('2026-02-01'), outcomeValue: 'LATE', provenanceClass: 'TEST', sourceReferences: {}, sourceFingerprint: randomUUID(), recordedById: officer } });
    before = await fingerprints();
    // Only this guarded disposable DB: newly opened app sessions are read-only.
    await fixture.$executeRawUnsafe('ALTER ROLE postgres SET default_transaction_read_only = on');
  }, 60000);
  afterAll(async () => { await prisma.$disconnect(); if (fixture) await fixture.$disconnect(); });
  it('enforces read-only app sessions, complete scoped pagination and zero-Case inclusion', async () => {
    expect((await prisma.$queryRaw<any[]>`SHOW default_transaction_read_only`)[0].default_transaction_read_only).toBe('on');
    const seen = new Set<string>(); let cursor: string | null = null;
    do {
      const response = await request(app).get('/api/v1/assets/evidence-baseline').query({ limit: '100', ...(cursor ? { cursor } : {}) }).set('Authorization', await token(officer)).expect(200);
      for (const item of response.body.data.items) { expect(item.asset.id).not.toBe(c); expect(seen.has(item.asset.id)).toBe(false); seen.add(item.asset.id); }
      cursor = response.body.data.nextCursor;
    } while (cursor);
    expect(seen.size).toBe(501);
    const response = await request(app).get('/api/v1/assets/evidence-baseline/summary').set('Authorization', await token(officer)).expect(200);
    expect(response.body.data.totalAssets).toBe(501);
    expect(response.body.data.metrics.assetsWithCases.counts.value).toMatchObject({ numerator: 2, denominator: 501 });
  }, 60000);
  it('denies cross-department/jurisdiction reads and applies scope before page limit', async () => {
    for (const id of [foreign, neighbor]) await request(app).get('/api/v1/assets/evidence-baseline').query({ assetId: a }).set('Authorization', await token(id)).expect(404);
    const response = await request(app).get('/api/v1/assets/evidence-baseline').query({ departmentId: d2, limit: '1' }).set('Authorization', await token(officer)).expect(200);
    expect(response.body.data.items).toEqual([]);
    const first = await request(app).get('/api/v1/assets/evidence-baseline?limit=1').set('Authorization', await token(officer)).expect(200);
    expect(first.body.data.items).toHaveLength(1); expect(first.body.data.items[0].asset.id).not.toBe(c);
  });
  it('proves 100/101 window SQL, link deduplication, independent observation scope and DTO privacy', async () => {
    for (const [id, total, truncated] of [[a, 101, true], [b, 100, false]] as const) {
      const response = await request(app).get('/api/v1/assets/evidence-baseline').query({ assetId: id }).set('Authorization', await token(officer)).expect(200);
      const item = response.body.data.items[0];
      expect(item.history.window.value).toMatchObject({ totalInspectionCount: total, observationsAnalyzed: 100, truncated });
      expect(JSON.stringify(response.body)).not.toContain('PRIVATE_SENTINEL');
      if (id === a) { expect(item.evidence.reports.count.value).toBe(1); expect(item.evidence.observations.count.value).toBe(1); }
    }
  });
  it('restricts predictive metadata to permitted roles and never returns raw payload', async () => {
    for (const [id, availability] of [[officer, 'RESTRICTED'], [auditor, 'AVAILABLE']]) {
      const response = await request(app).get('/api/v1/assets/evidence-baseline').query({ assetId: a }).set('Authorization', await token(id)).expect(200);
      expect(response.body.data.items[0].predictive.availability).toBe(availability);
      if (availability === 'AVAILABLE') expect(response.body.data.items[0].predictive.snapshots.count.value).toBe(1);
      expect(JSON.stringify(response.body)).not.toContain('PRIVATE_SENTINEL');
    }
  });
  it('validates P4.2 Asset-first paging, scope, filters and complete summary traversal', async () => {
    const seen = new Set<string>(); let cursor: string | null = null;
    do {
      const response = await request(app).get('/api/v1/assets/attention').query({ limit: '100', ...(cursor ? { cursor } : {}) }).set('Authorization', await token(officer)).expect(200);
      for (const item of response.body.data.items) { expect(item.asset.id).not.toBe(c); expect(seen.has(item.asset.id)).toBe(false); seen.add(item.asset.id); }
      cursor = response.body.data.nextCursor;
    } while (cursor);
    expect(seen.size).toBe(501);
    for (const id of [foreign, neighbor]) await request(app).get('/api/v1/assets/attention').query({ assetId: a }).set('Authorization', await token(id)).expect(404);
    expect((await request(app).get('/api/v1/assets/attention').query({ departmentId: d2, limit: 1 }).set('Authorization', await token(officer)).expect(200)).body.data.items).toEqual([]);
    const filtered = await request(app).get('/api/v1/assets/attention').query({ assetId: a, category: 'RECORDED_OPERATIONAL_EXCEPTION', state: 'PRESENT' }).set('Authorization', await token(officer)).expect(200);
    expect(filtered.body.data.items[0].attention.categories).toEqual([expect.objectContaining({ category: 'RECORDED_OPERATIONAL_EXCEPTION', signals: expect.arrayContaining([expect.objectContaining({ state: 'PRESENT' })]) })]);
    const summary = await request(app).get('/api/v1/assets/attention/summary').set('Authorization', await token(officer)).expect(200);
    expect(summary.body.data).toMatchObject({ totalAssets: 501, assetsWithMatchingProjection: 501, complete: true });
    expect(summary.body.data.categoryStates.EVIDENCE_COVERAGE_GAP.PRESENT).toBeGreaterThan(0);
    expect(summary.body.data.signalStates.UNKNOWN).toBeGreaterThan(0);
  }, 60000);
  it('preserves multiple Cases, operational ownership, exact counts, deduplication and truncation', async () => {
    const item = (await request(app).get('/api/v1/assets/attention').query({ assetId: a }).set('Authorization', await token(officer)).expect(200)).body.data.items[0];
    const authority = item.attention.categories.find((entry: any) => entry.category === 'AUTHORITATIVE_CASE_CONTEXT');
    expect(authority.signals.filter((entry: any) => entry.signalCode === 'ACTIVE_CASE_CONTEXT_PRESENT')).toHaveLength(2);
    expect(authority.signals).toContainEqual(expect.objectContaining({ signalCode: 'HETEROGENEOUS_CASE_CONTEXT', state: 'PRESENT' }));
    const operational = item.attention.categories.find((entry: any) => entry.category === 'RECORDED_OPERATIONAL_EXCEPTION');
    expect(operational.signals.map((entry: any) => entry.signalCode)).toEqual(expect.arrayContaining(['OPEN_BLOCKER', 'UNMET_DEPENDENCY']));
    expect(item.sourceCounts).toMatchObject({ cases: 2, publicReports: 1, externalObservations: 1, inspections: 101, blockers: 1, dependencies: 1, evidence: 1 });
    expect(item.attention.provenance).toMatchObject({ sourceReferencesTruncated: true, history: { value: { totalInspectionCount: 101, observationsAnalyzed: 100, truncated: true } } });
  });
  it('returns deterministic provenance and privacy-safe, non-ranked, predictively restricted DTOs', async () => {
    const first = (await request(app).get('/api/v1/assets/attention').query({ assetId: a }).set('Authorization', await token(officer)).expect(200)).body.data.items[0];
    const second = (await request(app).get('/api/v1/assets/attention').query({ assetId: a }).set('Authorization', await token(officer)).expect(200)).body.data.items[0];
    expect(first.attention.provenance.sourceSetFingerprint).toBe(second.attention.provenance.sourceSetFingerprint);
    expect(first.predictiveAvailability).toBe('RESTRICTED');
    const serialized = JSON.stringify(first);
    expect(serialized).not.toContain('PRIVATE_SENTINEL');
    for (const forbidden of ['reporterName', 'reporterContact', 'description', 'referenceUrl', 'featurePayload', 'normalizedData', 'attentionScore', 'ranking']) expect(serialized).not.toContain(`\"${forbidden}\"`);
    expect(serialized).not.toMatch(/threshold-derived|urgencyLevel/i);
  });
  it('leaves every public table count and content hash unchanged after acceptance reads', async () => {
    expect(await fingerprints()).toEqual(before);
  });
});
