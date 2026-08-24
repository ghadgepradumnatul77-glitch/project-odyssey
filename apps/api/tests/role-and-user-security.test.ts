import express from 'express';
import request from 'supertest';
import { SignJWT } from 'jose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ findUnique: vi.fn(), findMany: vi.fn() }));
vi.mock('../src/lib/prisma', () => ({
  default: {
    user: { findUnique: mocks.findUnique, findMany: mocks.findMany },
    department: { findUnique: vi.fn() },
    jurisdiction: { findUnique: vi.fn() }
  }
}));

import { getAuthConfig } from '../src/config/auth';
import userRoutes from '../src/modules/users/user.routes';

const app = express();
app.use(express.json());
app.use('/api/v1/users', userRoutes);

async function authorization(role: string) {
  const id = `user-${role}`;
  mocks.findUnique.mockResolvedValue({ id, role, status: 'ACTIVE', departmentId: 'dep-1', jurisdictionId: 'jur-1' });
  const config = getAuthConfig();
  const token = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(id)
    .setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(config.secret);
  return `Bearer ${token}`;
}

beforeEach(() => vi.clearAllMocks());

describe('role and user endpoint security', () => {
  it('closes public user enumeration and creation', async () => {
    await request(app).get('/api/v1/users').expect(401);
    await request(app).post('/api/v1/users').send({}).expect(401);
  });

  it.each(['OFFICER', 'POLICY_ADMIN', 'AUDITOR'])('rejects %s user administration', async (role) => {
    await request(app).get('/api/v1/users').set('Authorization', await authorization(role)).expect(403);
    await request(app).post('/api/v1/users').set('Authorization', await authorization(role)).send({}).expect(403);
  });

  it('allows SYSTEM_ADMIN to reach existing user listing logic without passwordHash', async () => {
    mocks.findMany.mockResolvedValue([{ id: 'officer-1', email: 'officer@example.test', role: 'OFFICER' }]);
    const response = await request(app).get('/api/v1/users').set('Authorization', await authorization('SYSTEM_ADMIN')).expect(200);
    expect(response.body.data.items[0]).not.toHaveProperty('passwordHash');
    expect(response.body.data.limit).toBe(25);
  });

  it('allows SYSTEM_ADMIN to reach existing create validation', async () => {
    const response = await request(app).post('/api/v1/users').set('Authorization', await authorization('SYSTEM_ADMIN')).send({}).expect(400);
    expect(response.body.error.code).toBe('INVALID_INPUT');
  });

  it('rejects user mass assignment and excessive passwords before persistence', async () => {
    const token = await authorization('SYSTEM_ADMIN');
    const body = {
      employeeCode: 'PWD-SEC-1', name: 'Security Test', email: 'security@example.test',
      password: 'a-secure-test-password', designation: 'Officer', role: 'OFFICER',
      departmentId: '10000000-0000-4000-8000-000000000001',
      jurisdictionId: '20000000-0000-4000-8000-000000000001'
    };
    expect((await request(app).post('/api/v1/users').set('Authorization', token).send({ ...body, status: 'ACTIVE' }).expect(400)).body.error.code).toBe('INVALID_INPUT');
    expect((await request(app).post('/api/v1/users').set('Authorization', token).send({ ...body, password: 'x'.repeat(129) }).expect(400)).body.error.code).toBe('WEAK_PASSWORD');
  });
});
