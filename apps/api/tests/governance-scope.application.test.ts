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
  policyCreate: vi.fn(), policyUpdate: vi.fn(), departmentCount: vi.fn(), jurisdictionCount: vi.fn(),
  transaction: vi.fn()
}));
vi.mock('../src/lib/prisma', () => ({ default: {
  $transaction: mocks.transaction,
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
    mocks.transaction.mockImplementation((callback: (tx: unknown) => unknown) => callback({
      policyDocument: { create: mocks.policyCreate, update: mocks.policyUpdate }
    }));
    mocks.departmentCount.mockResolvedValue(1);
    mocks.jurisdictionCount.mockResolvedValue(1);
  });

  it('mounts the real application and scopes POLICY_ADMIN registry reads', async () => {
    const response = await request(app).get('/api/v1/policies').set('Authorization', await authorization('POLICY_ADMIN')).expect(200);
    expect(response.body.data.items).toHaveLength(1);
    expect(mocks.policyFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { AND: expect.arrayContaining([{ OR: [
      { departmentId: null, jurisdictionId: null },
      { departmentId: ids.department, jurisdictionId: null },
      { departmentId: ids.department, jurisdictionId: ids.jurisdiction }
    ] }]) }, take: 26 }));
  });

  it('rejects malformed registry traversal through the real application before querying Prisma', async () => {
    const response=await request(app).get('/api/v1/policies?cursor=not-an-opaque-cursor')
      .set('Authorization',await authorization('POLICY_ADMIN')).expect(400);
    expect(response.body.error.code).toBe('INVALID_QUERY');
    expect(mocks.policyFindMany).not.toHaveBeenCalled();
  });

  it('composes governance search with scope before the bounded take',async()=>{
    await request(app).get('/api/v1/policies?limit=2&search=bridge')
      .set('Authorization',await authorization('POLICY_ADMIN')).expect(200);
    expect(mocks.policyFindMany).toHaveBeenCalledWith(expect.objectContaining({
      where:{AND:expect.arrayContaining([
        {OR:[{departmentId:null,jurisdictionId:null},{departmentId:ids.department,jurisdictionId:null},{departmentId:ids.department,jurisdictionId:ids.jurisdiction}]},
        {OR:[{policyCode:{contains:'bridge',mode:'insensitive'}},{title:{contains:'bridge',mode:'insensitive'}}]}
      ])},orderBy:[{createdAt:'desc'},{id:'desc'}],take:3
    }));
  });

  it('traverses a stable mounted registry boundary and exhausts on a final partial page',async()=>{
    const at='2026-08-20T00:00:00.000Z';
    mocks.policyFindMany
      .mockResolvedValueOnce([
        {id:'p-3',createdAt:new Date(at)},{id:'p-2',createdAt:new Date(at)},{id:'p-1',createdAt:new Date(at)}
      ])
      .mockResolvedValueOnce([{id:'p-1',createdAt:new Date(at)}])
      .mockResolvedValueOnce([]);
    const token=await authorization('POLICY_ADMIN');
    const first=await request(app).get('/api/v1/policies?limit=2').set('Authorization',token).expect(200);
    expect(first.body.data.items.map((item:any)=>item.id)).toEqual(['p-3','p-2']);
    expect(first.body.data.nextCursor).toEqual(expect.any(String));
    const second=await request(app).get(`/api/v1/policies?limit=2&cursor=${encodeURIComponent(first.body.data.nextCursor)}`).set('Authorization',token).expect(200);
    expect(second.body.data).toMatchObject({items:[{id:'p-1'}],nextCursor:null,limit:2});
    expect(mocks.policyFindMany.mock.calls[1][0]).toEqual(expect.objectContaining({where:{AND:expect.arrayContaining([
      expect.objectContaining({OR:expect.any(Array)})
    ])},take:3}));
    const exhausted=await request(app).get(`/api/v1/policies?limit=2&cursor=${encodeURIComponent(first.body.data.nextCursor)}`).set('Authorization',token).expect(200);
    expect(exhausted.body.data).toEqual({items:[],nextCursor:null,limit:2});
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
