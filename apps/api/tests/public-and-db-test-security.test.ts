import request from 'supertest';
import { SignJWT } from 'jose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ findUnique: vi.fn(), count: vi.fn() }));
vi.mock('../src/lib/prisma', () => ({
  default: {
    user: { findUnique: mocks.findUnique, count: mocks.count },
    department: { count: mocks.count }, jurisdiction: { count: mocks.count }, asset: { count: mocks.count }
  }
}));

import { getAuthConfig } from '../src/config/auth';
import { app } from '../src/server';

async function authorization(role: string) {
  mocks.findUnique.mockResolvedValue({ id: `user-${role}`, role, status: 'ACTIVE', departmentId: 'dep-1', jurisdictionId: 'jur-1' });
  const config = getAuthConfig();
  return `Bearer ${await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(`user-${role}`)
    .setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(config.secret)}`;
}

beforeEach(() => { vi.clearAllMocks(); mocks.count.mockResolvedValue(1); });

describe('public and diagnostic surface', () => {
  it('keeps basic health public and minimal', async () => {
    const response = await request(app).get('/api/v1/health').expect(200);
    expect(response.body.data).toEqual(expect.objectContaining({ service: 'odyssey-api', status: 'ok' }));
    expect(JSON.stringify(response.body)).not.toMatch(/database|credential|secret|password/i);
  });

  it('keeps login reachable without authentication', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({}).expect(400);
    expect(response.body.error.code).toBe('INVALID_INPUT');
  });

  it('protects db-test with SYSTEM_ADMIN', async () => {
    await request(app).get('/api/v1/db-test').expect(401);
    for (const role of ['OFFICER', 'POLICY_ADMIN', 'AUDITOR']) {
      await request(app).get('/api/v1/db-test').set('Authorization', await authorization(role)).expect(403);
    }
    const response = await request(app).get('/api/v1/db-test').set('Authorization', await authorization('SYSTEM_ADMIN')).expect(200);
    expect(response.body.data.database).toBe('connected');
  });
});
