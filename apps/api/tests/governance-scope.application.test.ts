import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SignJWT } from 'jose';
import { getAuthConfig } from '../src/config/auth';

const ids = {
  department: '11111111-1111-4111-8111-111111111111',
  jurisdiction: '22222222-2222-4222-8222-222222222222',
  crossDepartment: '33333333-3333-4333-8333-333333333333',
  crossJurisdiction: '44444444-4444-4444-8444-444444444444'
};
const mocks = vi.hoisted(() => ({
  userFindUnique: vi.fn(), policyFindMany: vi.fn(), policyFindUnique: vi.fn(),
  policyCreate: vi.fn(), policyUpdate: vi.fn(), departmentCount: vi.fn(), jurisdictionCount: vi.fn()
}));
vi.mock('../src/lib/prisma', () => ({ default: {
  user: { findUnique: mocks.userFindUnique },
  policyDocument: { findMany: mocks.policyFindMany, findUnique: mocks.policyFindUnique, create: mocks.policyCreate, update: mocks.policyUpdate },
  department: { count: mocks.departmentCount }, jurisdiction: { count: mocks.jurisdictionCount }
} }));

import { app } from '../src/server';

async function authorization(role: string) {
  const id = `assembled-${role}`;
  const config = getAuthConfig();
  const token = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(id)
    .setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(config.secret);
  return `Bearer ${token}`;
}

describe('assembled application governance authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.userFindUnique.mockImplementation(({ where: { id } }: any) => Promise.resolve({
      id, role: id.replace('assembled-', ''), status: 'ACTIVE', departmentId: ids.department, jurisdictionId: ids.jurisdiction
    }));
    mocks.policyFindMany.mockResolvedValue([{ id: 'own-policy', department: { id: ids.department }, jurisdiction: null }]);
    mocks.policyFindUnique.mockResolvedValue({ status: 'DRAFT', validationState: 'NOT_VALIDATED', departmentId: ids.crossDepartment, jurisdictionId: ids.crossJurisdiction, _count: { rules: 1 } });
    mocks.policyCreate.mockImplementation(({ data }: any) => Promise.resolve({ id: 'global-policy', ...data }));
    mocks.policyUpdate.mockResolvedValue({ id: 'unexpected-update' });
    mocks.departmentCount.mockResolvedValue(1);
    mocks.jurisdictionCount.mockResolvedValue(1);
  });

  it('mounts the real application and scopes POLICY_ADMIN registry reads', async () => {
    const response = await request(app).get('/api/v1/policies').set('Authorization', await authorization('POLICY_ADMIN')).expect(200);
    expect(response.body.data).toHaveLength(1);
    expect(mocks.policyFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { OR: [
      { departmentId: null, jurisdictionId: null },
      { departmentId: ids.department, jurisdictionId: null },
      { departmentId: ids.department, jurisdictionId: ids.jurisdiction }
    ] } }));
  });

  it('returns a non-disclosing 404 before cross-scope lifecycle mutation', async () => {
    const response = await request(app).patch('/api/v1/policies/cross/lifecycle')
      .set('Authorization', await authorization('POLICY_ADMIN')).send({ status: 'VALIDATION' }).expect(404);
    expect(response.body.error).toEqual({ code: 'GOVERNANCE_RESOURCE_NOT_FOUND', message: 'Governance registry resource not found.' });
    expect(mocks.policyUpdate).not.toHaveBeenCalled();
  });

  it('preserves SYSTEM_ADMIN global creation through the real mount', async () => {
    await request(app).post('/api/v1/policies').set('Authorization', await authorization('SYSTEM_ADMIN')).send({
      policyCode: 'POLICY_GLOBAL', versionNumber: 1, title: 'Global test policy', sourceTitle: 'Controlled test source',
      sourceReference: 'TEST-ONLY', effectiveFrom: '2026-08-20T00:00:00.000Z'
    }).expect(201);
    const data = mocks.policyCreate.mock.calls[0][0].data;
    expect(data).not.toHaveProperty('departmentId');
    expect(data).not.toHaveProperty('jurisdictionId');
  });

  it('does not grant OFFICER governance administration', async () => {
    await request(app).get('/api/v1/policies').set('Authorization', await authorization('OFFICER')).expect(403);
    expect(mocks.policyFindMany).not.toHaveBeenCalled();
  });
});
