import express from 'express';
import request from 'supertest';
import { SignJWT } from 'jose';
import { expect, it, vi } from 'vitest';
import { getAuthConfig } from '../src/config/auth';
const mocks = vi.hoisted(() => ({ user: vi.fn(), snapshot: vi.fn() }));
vi.mock('../src/lib/prisma', () => ({ default: { user: { findUnique: mocks.user } } }));
vi.mock('../src/modules/portfolio/maintenance-scenario.repository', async original => ({ ...await original<any>(), createMaintenanceScenarioRepository: () => ({ snapshot: mocks.snapshot }) }));
import router from '../src/modules/portfolio/portfolio.routes';
const app = express(); app.use(express.json()); app.use('/api/v1', router);
const path = '/api/v1/portfolio/maintenance-scenarios/compare';
const body = { envelopes: [{ id: 'e', currency: 'INR', budgetMinor: '0', resourceCapacities: [] }] };
async function auth(role: string) {
  mocks.user.mockResolvedValue({ id: 'u', role, status: 'ACTIVE', departmentId: 'd', jurisdictionId: 'j' });
  const config = getAuthConfig(); return `Bearer ${await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject('u').setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(config.secret)}`;
}
it('requires authentication', async () => { await request(app).post(path).send(body).expect(401); });
it.each(['OFFICER', 'SYSTEM_ADMIN', 'AUDITOR', 'POLICY_ADMIN'])('uses existing authenticated read scope for %s', async role => {
  mocks.snapshot.mockResolvedValue({ complete: true, snapshot: { asOf: '2026-01-01T00:00:00Z', cases: [] }, coverage: { assets: 1, cases: 0, zeroCaseAssets: 1 }, sourceSetFingerprint: 'hash', disclosures: [] });
  const result = await request(app).post(path).set('Authorization', await auth(role)).send(body).expect(200);
  expect(result.body.data.authority.hypotheticalOnly).toBe(true); expect(mocks.snapshot.mock.lastCall?.[0].role).toBe(role);
});
it('validates request and sanitizes unexpected failures', async () => {
  const token = await auth('OFFICER'); await request(app).post(path).set('Authorization', token).send({ ...body, priority: 'CRITICAL' }).expect(400);
  mocks.snapshot.mockRejectedValue(new Error('password database private'));
  const result = await request(app).post(path).set('Authorization', token).send(body).expect(503);
  expect(JSON.stringify(result.body)).not.toMatch(/password|database|private/);
});
