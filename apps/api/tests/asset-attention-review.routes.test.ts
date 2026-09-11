import express from 'express';
import request from 'supertest';
import { SignJWT } from 'jose';
import { beforeEach, expect, it, vi } from 'vitest';
import { getAuthConfig } from '../src/config/auth';
import { encodeCursor } from '../src/lib/pagination';
const mocks = vi.hoisted(() => ({ user: vi.fn(), create: vi.fn(), history: vi.fn() }));
vi.mock('../src/lib/prisma', () => ({ default: { user: { findUnique: mocks.user } } }));
vi.mock('../src/modules/assets/asset-attention-review.service', async original => {
  const module = await original<typeof import('../src/modules/assets/asset-attention-review.service')>();
  return { ...module, assetAttentionReviewService: { create: mocks.create, history: mocks.history } };
});
import { AttentionReviewServiceError } from '../src/modules/assets/asset-attention-review.service';
import assetRoutes from '../src/modules/assets/asset.routes';
const app = express(); app.use(express.json()); app.use('/api/v1/assets', assetRoutes);
const assetId = '10000000-0000-4000-8000-000000000001';
const path = `/api/v1/assets/${assetId}/attention-reviews`;
const body = { disposition: 'ACKNOWLEDGED', rationale: ' Reviewed. ', clientRequestId: 'request-1', expectedSourceSetFingerprint: 'sha256:' + 'a'.repeat(64), selectedSignals: [{ category: 'EVIDENCE_COVERAGE_GAP', signalCode: 'NO_INSPECTION_EVIDENCE', state: 'UNKNOWN', evidenceReferenceFingerprint: 'sha256:' + 'b'.repeat(64) }] };
const review = { id: 'review', assetId, rationale: 'Reviewed.', selectedSignals: body.selectedSignals };
async function auth(role = 'OFFICER', status = 'ACTIVE') {
  const user = { id: `u-${role}`, role, status, departmentId: 'dep', jurisdictionId: 'jur' }; mocks.user.mockResolvedValue(user);
  const config = getAuthConfig(); return `Bearer ${await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(user.id).setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(config.secret)}`;
}
beforeEach(() => { vi.clearAllMocks(); mocks.create.mockResolvedValue({ success: true, data: { outcome: 'CREATED', review } }); mocks.history.mockResolvedValue({ items: [review], limit: 25, nextCursor: null }); });
it('requires authentication on both endpoints', async () => {
  await request(app).post(path).send(body).expect(401); await request(app).get(path).expect(401);
  expect(mocks.create).not.toHaveBeenCalled(); expect(mocks.history).not.toHaveBeenCalled();
});
it('creates through mounted Asset router using only authenticated identity and normalized input', async () => {
  const result = await request(app).post(path).set('Authorization', await auth()).send(body).expect(201);
  expect(result.body.data.review).toEqual(review);
  expect(mocks.create).toHaveBeenCalledWith({ id: 'u-OFFICER', role: 'OFFICER', status: 'ACTIVE', departmentId: 'dep', jurisdictionId: 'jur' }, assetId, { ...body, rationale: 'Reviewed.' });
});
it.each(['SYSTEM_ADMIN', 'AUDITOR', 'POLICY_ADMIN'])('denies create for %s', async role => {
  await request(app).post(path).set('Authorization', await auth(role)).send(body).expect(403); expect(mocks.create).not.toHaveBeenCalled();
});
it.each(['OFFICER', 'SYSTEM_ADMIN', 'AUDITOR', 'POLICY_ADMIN'])('preserves scoped read principal for %s', async role => {
  await request(app).get(path).set('Authorization', await auth(role)).expect(200);
  expect(mocks.history).toHaveBeenCalledWith(expect.objectContaining({ role, departmentId: 'dep', jurisdictionId: 'jur' }), assetId, {});
});
it.each(['reviewerId', 'reviewerRole', 'role', 'riskScore', 'priorityLevel', 'taskId'])('rejects injected %s', async field => {
  await request(app).post(path).set('Authorization', await auth()).send({ ...body, [field]: 'malicious' }).expect(400); expect(mocks.create).not.toHaveBeenCalled();
});
it('returns exact replay as 200', async () => {
  mocks.create.mockResolvedValue({ success: true, data: { outcome: 'IDEMPOTENT_REPLAY', review } });
  expect((await request(app).post(path).set('Authorization', await auth()).send(body).expect(200)).body.data.review).toEqual(review);
});
it.each([
  ['ATTENTION_PROJECTION_STALE', 409], ['IDEMPOTENCY_CONFLICT', 409], ['INVALID_REVIEW_INPUT', 400],
  ['REVIEW_FORBIDDEN', 403], ['RESOURCE_NOT_FOUND', 404], ['INVALID_ASSET_LINKAGE', 404],
  ['INVALID_CASE_LINKAGE', 404], ['INVALID_SUPERSESSION_LINKAGE', 404], ['REVIEW_UNAVAILABLE', 503]
] as const)('maps %s safely', async (code, status) => {
  mocks.create.mockRejectedValue(new AttentionReviewServiceError(code));
  const result = await request(app).post(path).set('Authorization', await auth()).send(body).expect(status);
  expect(result.body.error.code).toBe(code.startsWith('INVALID_') && code.endsWith('LINKAGE') ? 'RESOURCE_NOT_FOUND' : code);
  expect(Object.keys(result.body.error).sort()).toEqual(['code', 'message']);
});
it('hides out-of-scope history and sanitizes arbitrary failures', async () => {
  mocks.history.mockRejectedValue(new AttentionReviewServiceError('RESOURCE_NOT_FOUND'));
  await request(app).get(path).set('Authorization', await auth()).expect(404);
  mocks.history.mockRejectedValue(new Error('postgres://password reporter@example.com'));
  const result = await request(app).get(path).set('Authorization', await auth()).expect(503);
  expect(JSON.stringify(result.body)).not.toMatch(/password|reporter|postgres/);
});
it('passes stable pagination and returns cursor unchanged', async () => {
  const cursor = encodeCursor({ at: '2026-01-01T00:00:00Z', id: 'review' }); mocks.history.mockResolvedValue({ items: [review], nextCursor: cursor, limit: 1 });
  const result = await request(app).get(path).query({ limit: '1', cursor }).set('Authorization', await auth()).expect(200);
  expect(result.body.data.nextCursor).toBe(cursor); expect(mocks.history).toHaveBeenCalledWith(expect.anything(), assetId, { limit: '1', cursor });
});
it.each(['limit=101', 'limit=0', 'cursor=bad', 'departmentId=other', 'reviewerId=other'])('rejects invalid history query %s', async query => {
  await request(app).get(`${path}?${query}`).set('Authorization', await auth()).expect(400); expect(mocks.history).not.toHaveBeenCalled();
});
it('rejects invalid Asset UUID, missing body, and inactive identity', async () => {
  await request(app).post('/api/v1/assets/bad/attention-reviews').set('Authorization', await auth()).send(body).expect(400);
  await request(app).post(path).set('Authorization', await auth()).send({}).expect(400);
  const result = await request(app).get(path).set('Authorization', await auth('OFFICER', 'INACTIVE')); expect([401, 403]).toContain(result.status);
});
