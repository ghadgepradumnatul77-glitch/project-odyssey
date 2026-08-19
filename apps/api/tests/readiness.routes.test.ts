import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SignJWT } from 'jose';
import { getAuthConfig } from '../src/config/auth';

const mocks = vi.hoisted(() => ({ user: vi.fn(), evaluate: vi.fn() }));
vi.mock('../src/lib/prisma', () => ({ default: { user: { findUnique: mocks.user } } }));
vi.mock('../src/modules/readiness/readiness.service', () => ({ evaluateCaseReadiness: mocks.evaluate }));
import routes from '../src/modules/readiness/readiness.routes';

const app = express(); app.use(express.json()); app.use('/api/v1', routes);
async function auth(role: string) { const id = `user-${role}`; mocks.user.mockResolvedValue({ id, role, status: 'ACTIVE', departmentId: 'dep', jurisdictionId: 'jur' }); const config = getAuthConfig(); return `Bearer ${await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(id).setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(config.secret)}`; }

describe('Decision readiness route authorization', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.evaluate.mockResolvedValue({ caseReference: 'CASE-1', outcome: 'READY', checks: [], reasons: [] }); });
  it.each(['OFFICER', 'AUDITOR', 'SYSTEM_ADMIN'])('allows read-only readiness visibility for %s', async (role) => {
    await request(app).get('/api/v1/cases/case/readiness').set('Authorization', await auth(role)).expect(200);
    expect(mocks.evaluate).toHaveBeenCalledWith('case', expect.objectContaining({ role }));
  });
  it('does not grant operational Case visibility to POLICY_ADMIN', async () => {
    await request(app).get('/api/v1/cases/case/readiness').set('Authorization', await auth('POLICY_ADMIN')).expect(403);
    expect(mocks.evaluate).not.toHaveBeenCalled();
  });
  it('rejects anonymous access', async () => { await request(app).get('/api/v1/cases/case/readiness').expect(401); });
});
