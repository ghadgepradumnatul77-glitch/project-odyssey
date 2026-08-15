import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SignJWT } from 'jose';
import { getAuthConfig } from '../src/config/auth';
import { CaseClosureError } from '../src/modules/closures/case-closure-error';

const mocks = vi.hoisted(() => ({ close: vi.fn(), get: vi.fn(), userFindUnique: vi.fn() }));
vi.mock('../src/lib/prisma', () => ({ default: { user: { findUnique: mocks.userFindUnique } } }));
vi.mock('../src/modules/closures/case-closure.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/modules/closures/case-closure.service')>();
  return { ...actual, closeCase: mocks.close, getCaseClosure: mocks.get };
});

import routes from '../src/modules/closures/case-closure.routes';

const app = express();
app.use(express.json());
app.use('/api/v1', routes);

async function auth(role: string, id = `user-${role}`) {
  mocks.userFindUnique.mockResolvedValue({ id, role, status: 'ACTIVE', departmentId: 'dep', jurisdictionId: 'jur' });
  const config = getAuthConfig();
  const token = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(id)
    .setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(config.secret);
  return `Bearer ${token}`;
}

beforeEach(() => vi.clearAllMocks());

describe('Case closure routes', () => {
  it('creates closure with authenticated principal and normalized input', async () => {
    mocks.close.mockResolvedValue({ closure: { id: 'closure' }, created: true });
    const response = await request(app).post('/api/v1/cases/case/close').set('Authorization', await auth('OFFICER', 'closer')).send({
      closureReason: 'EXECUTION_VERIFIED', closureSummary: '  complete  '
    }).expect(201);
    expect(response.body.data.id).toBe('closure');
    expect(mocks.close).toHaveBeenCalledWith('case', { closureReason: 'EXECUTION_VERIFIED', closureSummary: 'complete' }, expect.objectContaining({ id: 'closer' }));
  });

  it('returns 200 for an exact idempotent retry', async () => {
    mocks.close.mockResolvedValue({ closure: { id: 'closure' }, created: false });
    const response = await request(app).post('/api/v1/cases/case/close').set('Authorization', await auth('OFFICER')).send({
      closureReason: 'EXECUTION_VERIFIED', closureSummary: 'complete'
    }).expect(200);
    expect(response.body.idempotent).toBe(true);
  });

  it.each(['closedById', 'closureAuthorityGrantId', 'executionPlanId', 'caseId', 'closedAt', 'createdAt', 'status', 'authorityId', 'userId'])('rejects trusted field %s', async (field) => {
    const response = await request(app).post('/api/v1/cases/case/close').set('Authorization', await auth('OFFICER')).send({
      closureReason: 'EXECUTION_VERIFIED', closureSummary: 'complete', [field]: 'client-value'
    }).expect(400);
    expect(response.body.error.code).toBe('INVALID_INPUT');
  });

  it('validates the controlled reason and bounded summary', async () => {
    await request(app).post('/api/v1/cases/case/close').set('Authorization', await auth('OFFICER')).send({ closureReason: 'RISK_RESOLVED', closureSummary: 'x' }).expect(400);
    await request(app).post('/api/v1/cases/case/close').set('Authorization', await auth('OFFICER')).send({ closureReason: 'EXECUTION_VERIFIED', closureSummary: 'x'.repeat(2001) }).expect(400);
  });

  it.each(['AUDITOR', 'POLICY_ADMIN', 'SYSTEM_ADMIN'])('rejects %s closure mutation', async (role) => {
    await request(app).post('/api/v1/cases/case/close').set('Authorization', await auth(role)).send({ closureReason: 'EXECUTION_VERIFIED', closureSummary: 'complete' }).expect(403);
  });

  it.each(['OFFICER', 'AUDITOR', 'POLICY_ADMIN', 'SYSTEM_ADMIN'])('allows authenticated %s closure reads through scoped service', async (role) => {
    mocks.get.mockResolvedValue({ id: 'closure' });
    await request(app).get('/api/v1/cases/case/closure').set('Authorization', await auth(role)).expect(200);
  });

  it('preserves controlled service errors', async () => {
    mocks.close.mockRejectedValue(new CaseClosureError('CASE_NOT_FOUND', 404, 'Case not found.'));
    const response = await request(app).post('/api/v1/cases/hidden/close').set('Authorization', await auth('OFFICER')).send({ closureReason: 'EXECUTION_VERIFIED', closureSummary: 'complete' }).expect(404);
    expect(response.body.error.code).toBe('CASE_NOT_FOUND');
  });
});
