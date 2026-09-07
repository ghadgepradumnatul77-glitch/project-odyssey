import express from 'express';
import request from 'supertest';
import { SignJWT } from 'jose';
import { beforeEach, expect, it, vi } from 'vitest';
import { getAuthConfig } from '../src/config/auth';
import { ScopedResourceNotFoundError } from '../src/security/organizational-scope';
const mocks = vi.hoisted(() => ({ user: vi.fn(), page: vi.fn(), summary: vi.fn(), assetRead: vi.fn() }));
vi.mock('../src/lib/prisma', () => ({ default: { user: { findUnique: mocks.user }, asset: { findMany: mocks.assetRead } } }));
vi.mock('../src/modules/assets/asset-attention.service', async importOriginal => {
  const original = await importOriginal<typeof import('../src/modules/assets/asset-attention.service')>();
  return { ...original, assetAttentionService: { page: mocks.page, summary: mocks.summary } };
});
import assetRoutes from '../src/modules/assets/asset.routes';
const app = express(); app.use(express.json()); app.use('/api/v1/assets', assetRoutes);
const paths = ['/api/v1/assets/attention', '/api/v1/assets/attention/summary'];
async function auth(role = 'OFFICER', status = 'ACTIVE') {
  const user = { id: `u-${role}`, role, status, departmentId: 'dep', jurisdictionId: 'jur' }; mocks.user.mockResolvedValue(user);
  const config = getAuthConfig(); return `Bearer ${await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(user.id).setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(config.secret)}`;
}
beforeEach(() => { vi.clearAllMocks(); mocks.page.mockResolvedValue({ contractVersion: 'ODYSSEY_SCOPED_ASSET_ATTENTION_V1', items: [], limit: 25, nextCursor: null }); mocks.summary.mockResolvedValue({ contractVersion: 'ODYSSEY_SCOPED_ASSET_ATTENTION_V1', totalAssets: 0, complete: true }); });

it.each(paths)('requires authentication for %s', async path => { await request(app).get(path).expect(401); expect(mocks.page).not.toHaveBeenCalled(); expect(mocks.summary).not.toHaveBeenCalled(); });
it.each(['OFFICER', 'AUDITOR', 'POLICY_ADMIN', 'SYSTEM_ADMIN'])('passes trusted organizational identity for %s', async role => {
  for (const path of paths) await request(app).get(path).set('Authorization', await auth(role)).expect(200);
  for (const fn of [mocks.page, mocks.summary]) expect(fn).toHaveBeenCalledWith(expect.objectContaining({ id: `u-${role}`, role, departmentId: 'dep', jurisdictionId: 'jur' }), {});
  expect(mocks.assetRead).not.toHaveBeenCalled();
});
it('mounts attention endpoints before the dynamic Asset route', async () => {
  expect((await request(app).get(paths[0]).set('Authorization', await auth()).expect(200)).body.data.items).toEqual([]);
  expect((await request(app).get(paths[1]).set('Authorization', await auth()).expect(200)).body.data.complete).toBe(true);
});
it('passes validated scope and signal filters', async () => {
  const id = '10000000-0000-4000-8000-000000000001';
  await request(app).get(`${paths[0]}?departmentId=${id}&limit=1&category=PLANNING_GAP&state=UNKNOWN`).set('Authorization', await auth()).expect(200);
  expect(mocks.page).toHaveBeenCalledWith(expect.objectContaining({ departmentId: 'dep' }), { departmentId: id, limit: '1', category: 'PLANNING_GAP', state: 'UNKNOWN' });
});
it.each(['?category=RISK', '?state=LOW', '?limit=101', '?ranking=risk', '?thresholdDays=30'])('rejects invalid query %s before invocation', async query => {
  await request(app).get(paths[0] + query).set('Authorization', await auth()).expect(400); expect(mocks.page).not.toHaveBeenCalled();
});
it('rejects summary pagination', async () => { await request(app).get(paths[1] + '?limit=1').set('Authorization', await auth()).expect(400); expect(mocks.summary).not.toHaveBeenCalled(); });
it.each(paths)('returns a uniform scoped not-found response for %s', async path => {
  mocks.page.mockRejectedValue(new ScopedResourceNotFoundError('ASSET_NOT_FOUND')); mocks.summary.mockRejectedValue(new ScopedResourceNotFoundError('ASSET_NOT_FOUND'));
  expect((await request(app).get(path).set('Authorization', await auth()).expect(404)).body.error).toEqual({ code: 'ASSET_NOT_FOUND', message: 'Asset not found.' });
});
it.each(paths)('sanitizes internal failures for %s', async path => {
  mocks.page.mockRejectedValue(new Error('postgres://SECRET')); mocks.summary.mockRejectedValue(new Error('Bearer SECRET'));
  const result = await request(app).get(path).set('Authorization', await auth()).expect(503);
  expect(result.body.error).toEqual({ code: 'ASSET_ATTENTION_UNAVAILABLE', message: 'Asset attention is currently unavailable.' }); expect(JSON.stringify(result.body)).not.toContain('SECRET');
});
it('denies inactive principals before service execution', async () => {
  const result = await request(app).get(paths[0]).set('Authorization', await auth('OFFICER', 'INACTIVE')); expect([401, 403]).toContain(result.status); expect(mocks.page).not.toHaveBeenCalled();
});
it.each(paths)('exposes no mutation method at %s', async path => { await request(app).post(path).set('Authorization', await auth()).send({ riskLevel: 'LOW' }).expect(404); expect(mocks.page).not.toHaveBeenCalled(); expect(mocks.summary).not.toHaveBeenCalled(); });
