import express from 'express';
import request from 'supertest';
import { SignJWT } from 'jose';
import { beforeEach, expect, it, vi } from 'vitest';
import { getAuthConfig } from '../src/config/auth';
import { ScopedResourceNotFoundError } from '../src/security/organizational-scope';
const mocks = vi.hoisted(() => ({ user: vi.fn(), page: vi.fn(), summary: vi.fn(), assetRead: vi.fn() }));
vi.mock('../src/lib/prisma', () => ({ default: { user: { findUnique: mocks.user }, asset: { findMany: mocks.assetRead } } }));
vi.mock('../src/modules/assets/asset-evidence-baseline.service', async importOriginal => {
  const original = await importOriginal<typeof import('../src/modules/assets/asset-evidence-baseline.service')>();
  return { ...original, assetEvidenceService: { page: mocks.page, summary: mocks.summary } };
});
import assetRoutes from '../src/modules/assets/asset.routes';
const app = express(); app.use(express.json()); app.use('/api/v1/assets', assetRoutes);
const paths = ['/api/v1/assets/evidence-baseline', '/api/v1/assets/evidence-baseline/summary'];
async function auth(role: string, status = 'ACTIVE') {
  const user = { id: `u-${role}`, role, status, departmentId: 'dep', jurisdictionId: 'jur' };
  mocks.user.mockResolvedValue(user);
  const config = getAuthConfig();
  return `Bearer ${await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(user.id).setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(config.secret)}`;
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.page.mockResolvedValue({ contractVersion: 'ODYSSEY_ASSET_EVIDENCE_BASELINE_V1', items: [], limit: 25, nextCursor: null });
  mocks.summary.mockResolvedValue({ contractVersion: 'ODYSSEY_ASSET_EVIDENCE_BASELINE_V1', totalAssets: 0, complete: true, metrics: {} });
});
it.each(paths)('denies unauthenticated access to %s', async path => {
  await request(app).get(path).expect(401); expect(mocks.page).not.toHaveBeenCalled(); expect(mocks.summary).not.toHaveBeenCalled();
});
it.each(['OFFICER', 'AUDITOR', 'POLICY_ADMIN', 'SYSTEM_ADMIN'])('allows existing Asset visibility for %s and passes trusted scope', async role => {
  for (const path of paths) await request(app).get(path).set('Authorization', await auth(role)).expect(200);
  for (const fn of [mocks.page, mocks.summary]) expect(fn).toHaveBeenCalledWith(expect.objectContaining({ id: `u-${role}`, role, departmentId: 'dep', jurisdictionId: 'jur' }), {});
  expect(mocks.assetRead).not.toHaveBeenCalled();
});
it('mounts static endpoints in the Asset router without interpreting them as asset IDs', async () => {
  const page = await request(app).get(paths[0]).set('Authorization', await auth('OFFICER')).expect(200);
  expect(page.body).toMatchObject({ success: true, data: { items: [], limit: 25 } });
  const summary = await request(app).get(paths[1]).set('Authorization', await auth('OFFICER')).expect(200);
  expect(summary.body.data.totalAssets).toBe(0);
});
it.each(['?departmentId=bad', '?limit=101', '?cursor=bad', '?asOf=2026-01-01', '?role=SYSTEM_ADMIN', '?ranking=risk'])('rejects query %s before service invocation', async query => {
  await request(app).get(paths[0] + query).set('Authorization', await auth('OFFICER')).expect(400);
  expect(mocks.page).not.toHaveBeenCalled();
});
it('does not allow summary pagination to silently restrict the population', async () => {
  await request(app).get(paths[1] + '?limit=1').set('Authorization', await auth('OFFICER')).expect(400);
  expect(mocks.summary).not.toHaveBeenCalled();
});
it('passes validated narrowing filters without changing the authenticated organization', async () => {
  const id = '10000000-0000-4000-8000-000000000001';
  await request(app).get(paths[0] + `?departmentId=${id}&limit=1`).set('Authorization', await auth('OFFICER')).expect(200);
  expect(mocks.page).toHaveBeenCalledWith(expect.objectContaining({ departmentId: 'dep' }), { departmentId: id, limit: '1' });
});
it.each(paths)('returns uniform not-found errors for inaccessible or absent Asset at %s', async path => {
  mocks.page.mockRejectedValue(new ScopedResourceNotFoundError('ASSET_NOT_FOUND'));
  mocks.summary.mockRejectedValue(new ScopedResourceNotFoundError('ASSET_NOT_FOUND'));
  const result = await request(app).get(path).set('Authorization', await auth('OFFICER')).expect(404);
  expect(result.body.error).toEqual({ code: 'ASSET_NOT_FOUND', message: 'Asset not found.' });
});
it.each(paths)('redacts internal failures and does not log secrets at %s', async path => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    mocks.page.mockRejectedValue(new Error('postgres://SECRET password=SECRET'));
    mocks.summary.mockRejectedValue(new Error('Bearer SECRET'));
    const result = await request(app).get(path).set('Authorization', await auth('OFFICER')).expect(503);
    expect(result.body.error.code).toBe('EVIDENCE_BASELINE_UNAVAILABLE'); expect(JSON.stringify(result.body)).not.toContain('SECRET'); expect(log).not.toHaveBeenCalled();
  } finally { log.mockRestore(); }
});
it('rejects inactive principals before invoking either service', async () => {
  const result = await request(app).get(paths[0]).set('Authorization', await auth('OFFICER', 'INACTIVE'));
  expect([401, 403]).toContain(result.status); expect(mocks.page).not.toHaveBeenCalled();
});
it.each(paths)('does not expose mutation methods at %s', async path => {
  await request(app).post(path).set('Authorization', await auth('OFFICER')).send({ status: 'CLOSED' }).expect(404);
  expect(mocks.page).not.toHaveBeenCalled(); expect(mocks.summary).not.toHaveBeenCalled();
});
