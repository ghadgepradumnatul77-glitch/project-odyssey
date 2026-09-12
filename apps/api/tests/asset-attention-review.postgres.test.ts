import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { SignJWT } from 'jose';
import request from 'supertest';
import prisma from '../src/lib/prisma';
import { app } from '../src/server';
import { getAuthConfig } from '../src/config/auth';
import { createAssetAttentionReviewService, reviewSignalFingerprint } from '../src/modules/assets/asset-attention-review.service';
import { integrityTextDigest } from '../src/modules/integrity/integrity.service';
import type { AttentionSignal } from '../src/modules/assets/asset-attention.contracts';

const enabled = process.env.P4_3_ISOLATED_DB === 'true';
if (enabled) {
  const url = new URL(process.env.DATABASE_URL ?? '');
  if (url.hostname !== '127.0.0.1' || url.pathname !== '/odyssey_p43_isolated' || !url.port || url.port === '5432') throw new Error('P4.3 requires a disposable loopback database on a noncanonical port.');
}
describe.runIf(enabled)('P4.3 isolated PostgreSQL review acceptance', () => {
  const departmentId = randomUUID(), jurisdictionId = randomUUID(), otherJurisdiction = randomUUID();
  const assetId = randomUUID(), zeroCaseAssetId = randomUUID(), otherAssetId = randomUUID(), caseId = randomUUID();
  const ids = { OFFICER: randomUUID(), SYSTEM_ADMIN: randomUUID(), AUDITOR: randomUUID(), POLICY_ADMIN: randomUUID(), FOREIGN: randomUUID() };
  let before: unknown;
  let firstId: string;
  const principal = { id: ids.OFFICER, role: 'OFFICER' as const, status: 'ACTIVE' as const, departmentId, jurisdictionId };
  const path = (id = assetId) => `/api/v1/assets/${id}/attention-reviews`;
  async function token(role: keyof typeof ids = 'OFFICER') {
    const cfg = getAuthConfig();
    return `Bearer ${await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(ids[role]).setIssuer(cfg.issuer).setAudience(cfg.audience).setIssuedAt().setExpirationTime('10m').sign(cfg.secret)}`;
  }
  async function input(id = assetId) {
    const result = await request(app).get('/api/v1/assets/attention').query({ assetId: id }).set('Authorization', await token()).expect(200);
    const projection = result.body.data.items[0].attention;
    const signals: AttentionSignal[] = projection.categories.flatMap((category: { signals: AttentionSignal[] }) => category.signals);
    return { disposition: 'ACKNOWLEDGED', rationale: 'Synthetic review rationale', clientRequestId: randomUUID(), expectedSourceSetFingerprint: projection.provenance.sourceSetFingerprint,
      selectedSignals: signals.slice(0, 3).map(s => ({ category: s.category, signalCode: s.signalCode, state: s.state, evidenceReferenceFingerprint: reviewSignalFingerprint(s) })) };
  }
  async function businessState() {
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`;
    const values: Record<string, unknown> = {};
    for (const { tablename } of tables) {
      if (['AssetAttentionReview', 'AssetAttentionReviewSignal', 'IntegrityAuditEvent', 'IntegrityChainHead'].includes(tablename)) continue;
      const quoted = '"' + tablename.replaceAll('"', '""') + '"';
      values[tablename] = await prisma.$queryRawUnsafe(`SELECT count(*)::int AS count, md5(coalesce(string_agg(t::text, '' ORDER BY t::text), '')) AS digest FROM (SELECT row_to_json(r) AS t FROM ${quoted} r) s`);
    }
    return values;
  }
  beforeAll(async () => {
    expect(await prisma.department.count()).toBe(0);
    expect((await prisma.$queryRaw<{ server_version: string }[]>`SHOW server_version`)[0].server_version).toMatch(/^16\./);
    expect(await prisma.$queryRaw<{ count: bigint }[]>`SELECT count(*) FROM "_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL`).toEqual([{ count: 28n }]);
    await prisma.department.create({ data: { id: departmentId, name: 'Synthetic P43', code: 'P43' } });
    await prisma.jurisdiction.createMany({ data: [jurisdictionId, otherJurisdiction].map(id => ({ id, departmentId, name: 'Synthetic', type: 'TEST' })) });
    await prisma.user.createMany({ data: Object.entries(ids).map(([role, id]) => ({ id, employeeCode: id, email: `${id}@example.invalid`, name: 'Synthetic reviewer', designation: 'TEST', passwordHash: 'NOT_A_LOGIN_HASH', role: role === 'FOREIGN' ? 'OFFICER' : role as 'OFFICER' | 'SYSTEM_ADMIN' | 'AUDITOR' | 'POLICY_ADMIN', departmentId, jurisdictionId: role === 'FOREIGN' ? otherJurisdiction : jurisdictionId })) });
    await prisma.asset.createMany({ data: [assetId, zeroCaseAssetId, otherAssetId].map(id => ({ id, assetCode: id, assetType: 'BRIDGE', name: 'Synthetic asset', departmentId, jurisdictionId: id === otherAssetId ? otherJurisdiction : jurisdictionId })) });
    await prisma.case.create({ data: { id: caseId, assetId, caseNumber: 'P43-SYNTHETIC', title: 'Synthetic', riskLevel: 'VERY_HIGH', priorityLevel: 'CRITICAL', status: 'ORP_READY' } });
    await prisma.publicReport.create({ data: { reportNumber: 'P43-REPORT', title: 'PRIVATE_SENTINEL', description: 'PRIVATE_SENTINEL', category: 'OTHER', locationText: 'PRIVATE_SENTINEL', reporterName: 'PRIVATE_SENTINEL', reporterContact: 'PRIVATE_SENTINEL', assetId, departmentId, jurisdictionId } });
    before = await businessState();
  }, 30000);
  afterAll(async () => { await prisma.$disconnect(); });
  it('creates a multi-signal review atomically and records only rationale digest', async () => {
    const body = { ...await input(), caseId };
    const result = await request(app).post(path()).set('Authorization', await token()).send(body).expect(201);
    firstId = result.body.data.review.id;
    expect(result.body.data.review.selectedSignals).toHaveLength(3);
    expect(JSON.stringify(result.body)).not.toMatch(/PRIVATE_SENTINEL|passwordHash|reporterContact|referenceUrl|normalizedData/);
    const event = await prisma.integrityAuditEvent.findUniqueOrThrow({ where: { sourceEventKey: `asset-attention-review:${firstId}` } });
    expect(event.eventType).toBe('ASSET_ATTENTION_REVIEW_RECORDED');
    expect((event.payload as any).facts.rationaleDigest).toBe(integrityTextDigest(body.rationale));
    expect(JSON.stringify(event.payload)).not.toContain(body.rationale);
    const replay = await request(app).post(path()).set('Authorization', await token()).send(body).expect(200);
    expect(replay.body.data.review).toEqual(result.body.data.review);
    await request(app).post(path()).set('Authorization', await token()).send({ ...body, rationale: 'Different' }).expect(409);
    expect(await prisma.integrityAuditEvent.count({ where: { resourceId: firstId } })).toBe(1);
  });
  it('denies forbidden roles and preserves scoped versus global reads', async () => {
    for (const role of ['SYSTEM_ADMIN', 'AUDITOR', 'POLICY_ADMIN'] as const) await request(app).post(path()).set('Authorization', await token(role)).send(await input()).expect(403);
    await request(app).get(path()).set('Authorization', await token('FOREIGN')).expect(404);
    await request(app).post(path()).set('Authorization', await token('FOREIGN')).send(await input()).expect(404);
    for (const role of ['SYSTEM_ADMIN', 'AUDITOR', 'POLICY_ADMIN'] as const) await request(app).get(path()).set('Authorization', await token(role)).expect(200);
    await request(app).get(path(otherAssetId)).set('Authorization', await token('SYSTEM_ADMIN')).expect(200);
  });
  it('supports zero-Case Assets and rejects mismatched Case or supersession links', async () => {
    const body = await input(zeroCaseAssetId);
    await request(app).post(path(zeroCaseAssetId)).set('Authorization', await token()).send(body).expect(201);
    await request(app).post(path(zeroCaseAssetId)).set('Authorization', await token()).send({ ...body, clientRequestId: randomUUID(), caseId }).expect(404);
    await request(app).post(path(zeroCaseAssetId)).set('Authorization', await token()).send({ ...body, clientRequestId: randomUUID(), supersedesReviewId: firstId }).expect(404);
    const original = await prisma.assetAttentionReview.findUniqueOrThrow({ where: { id: firstId } });
    await request(app).post(path()).set('Authorization', await token()).send({ ...await input(), caseId, supersedesReviewId: firstId }).expect(201);
    expect(await prisma.assetAttentionReview.findUnique({ where: { id: firstId } })).toEqual(original);
    await request(app).post(path()).set('Authorization', await token()).send({ ...await input(), caseId, supersedesReviewId: firstId }).expect(404);
  });
  it('rejects stale fingerprints and serializes concurrent duplicate submissions', async () => {
    const body = await input();
    const stale = await request(app).post(path()).set('Authorization', await token()).send({ ...body, expectedSourceSetFingerprint: 'sha256:' + '0'.repeat(64) }).expect(409);
    expect(stale.body.error.code).toBe('ATTENTION_PROJECTION_STALE');
    const auth = await token();
    const replies = await Promise.all([1, 2].map(() => request(app).post(path()).set('Authorization', auth).send(body)));
    expect(replies.map(r => r.status).sort()).toEqual([200, 201]);
    expect(replies[0].body.data.review).toEqual(replies[1].body.data.review);
    expect(await prisma.assetAttentionReview.count({ where: { reviewerId: ids.OFFICER, clientRequestId: body.clientRequestId } })).toBe(1);
  }, 30000);
  it('rolls back the actual transaction when integrity fails', async () => {
    const count = await prisma.assetAttentionReview.count(), signals = await prisma.assetAttentionReviewSignal.count(), events = await prisma.integrityAuditEvent.count();
    const service = createAssetAttentionReviewService({ integrity: async () => { throw new Error('injected integrity failure'); } });
    await expect(service.create(principal, assetId, await input())).rejects.toMatchObject({ code: 'REVIEW_UNAVAILABLE' });
    expect(await prisma.assetAttentionReview.count()).toBe(count); expect(await prisma.assetAttentionReviewSignal.count()).toBe(signals); expect(await prisma.integrityAuditEvent.count()).toBe(events);
  });
  it('paginates full immutable history and leaves all business tables unchanged', async () => {
    let cursor: string | null = null; const seen: string[] = [];
    do {
      const result = await request(app).get(path()).query({ limit: '1', ...(cursor ? { cursor } : {}) }).set('Authorization', await token()).expect(200);
      seen.push(...result.body.data.items.map((r: { id: string }) => r.id)); cursor = result.body.data.nextCursor;
    } while (cursor);
    const expected = await prisma.assetAttentionReview.findMany({ where: { assetId }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { id: true } });
    expect(seen).toEqual(expected.map(r => r.id)); expect(new Set(seen).size).toBe(seen.length);
    await request(app).patch(path()).set('Authorization', await token()).send({ rationale: 'changed' }).expect(404);
    await request(app).delete(path()).set('Authorization', await token()).expect(404);
    expect(await businessState()).toEqual(before);
  }, 30000);
});
