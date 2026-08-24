import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkflowError } from '../src/modules/decisions/workflow-error';
import { SignJWT } from 'jose';
import { getAuthConfig } from '../src/config/auth';

const mocks = vi.hoisted(() => ({ create: vi.fn(), list: vi.fn(), userFindUnique: vi.fn() }));

vi.mock('../src/lib/prisma', () => ({ default: { user: { findUnique: mocks.userFindUnique } } }));

vi.mock('../src/modules/authorities/authority.service', () => ({
  createApprovalAuthority: mocks.create,
  listApprovalAuthorities: mocks.list
}));

import authorityRoutes from '../src/modules/authorities/authority.routes';

const app = express();
app.use(express.json());
app.use('/api/v1', authorityRoutes);

async function token(role: string) {
  const config = getAuthConfig();
  return new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(`user-${role}`)
    .setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(config.secret);
}

beforeEach(() => vi.clearAllMocks());

async function authorize(role: string) {
  mocks.userFindUnique.mockResolvedValue({ id: `user-${role}`, role, status: 'ACTIVE', departmentId: 'dep-1', jurisdictionId: 'jur-1' });
  return `Bearer ${await token(role)}`;
}

describe('approval authority routes', () => {
  it('POST creates an explicit authority grant without designation inference', async () => {
    mocks.create.mockResolvedValue({ id: 'grant-1', canApprove: true, maxPriorityLevel: 'CRITICAL' });
    const response = await request(app).post('/api/v1/approval-authorities').set('Authorization', await authorize('SYSTEM_ADMIN')).send({
      userId: 'user-1',
      departmentId: 'dep-1',
      jurisdictionId: 'jur-1',
      canApprove: true,
      canCloseCase: true,
      maxPriorityLevel: 'CRITICAL'
    }).expect(201);
    expect(response.body.data.id).toBe('grant-1');
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1', canApprove: true, canCloseCase: true }), expect.objectContaining({ id: 'user-SYSTEM_ADMIN', role: 'SYSTEM_ADMIN' }));
  });

  it('POST rejects invalid booleans', async () => {
    const response = await request(app).post('/api/v1/approval-authorities').set('Authorization', await authorize('SYSTEM_ADMIN')).send({
      userId: 'user-1', departmentId: 'dep-1', jurisdictionId: 'jur-1', canApprove: 'yes'
    }).expect(400);
    expect(response.body.error.code).toBe('INVALID_INPUT');
  });

  it('POST returns controlled service errors', async () => {
    mocks.create.mockRejectedValue(new WorkflowError('ACTIVE_AUTHORITY_EXISTS', 409, 'duplicate'));
    const response = await request(app).post('/api/v1/approval-authorities').set('Authorization', await authorize('SYSTEM_ADMIN')).send({
      userId: 'user-1', departmentId: 'dep-1', jurisdictionId: 'jur-1'
    }).expect(409);
    expect(response.body.error.code).toBe('ACTIVE_AUTHORITY_EXISTS');
  });

  it('GET lists grants deterministically through the service', async () => {
    mocks.list.mockResolvedValue([{ id: 'grant-1', user: { employeeCode: 'PWD-EE-001' } }]);
    const response = await request(app).get('/api/v1/approval-authorities').set('Authorization', await authorize('SYSTEM_ADMIN')).expect(200);
    expect(response.body.data[0].user.employeeCode).toBe('PWD-EE-001');
  });

  it('rejects unauthenticated authority access', async () => {
    await request(app).post('/api/v1/approval-authorities').send({}).expect(401);
    await request(app).get('/api/v1/approval-authorities').expect(401);
  });

  it.each(['OFFICER', 'POLICY_ADMIN', 'AUDITOR'])('rejects %s authority administration', async (role) => {
    await request(app).post('/api/v1/approval-authorities').set('Authorization', await authorize(role)).send({}).expect(403);
    await request(app).get('/api/v1/approval-authorities').set('Authorization', await authorize(role)).expect(403);
  });
});
