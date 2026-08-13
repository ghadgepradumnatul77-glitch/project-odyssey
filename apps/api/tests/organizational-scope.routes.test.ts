import express from 'express';
import request from 'supertest';
import { SignJWT } from 'jose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthConfig } from '../src/config/auth';

const mocks = vi.hoisted(() => ({
  userFindUnique: vi.fn(),
  departmentFindMany: vi.fn(),
  jurisdictionFindMany: vi.fn(),
  assetFindMany: vi.fn(),
  assetFindUnique: vi.fn(),
  caseFindMany: vi.fn(),
  caseFindUnique: vi.fn(),
  caseCreate: vi.fn(),
  inspectionFindMany: vi.fn(),
  riskFindMany: vi.fn(),
  orpFindMany: vi.fn(),
  orpFindUnique: vi.fn()
}));

vi.mock('../src/lib/prisma', () => ({
  default: {
    user: { findUnique: mocks.userFindUnique },
    department: { findMany: mocks.departmentFindMany },
    jurisdiction: { findMany: mocks.jurisdictionFindMany },
    asset: { findMany: mocks.assetFindMany, findUnique: mocks.assetFindUnique },
    case: { findMany: mocks.caseFindMany, findUnique: mocks.caseFindUnique, create: mocks.caseCreate },
    inspection: { findMany: mocks.inspectionFindMany },
    riskAssessment: { findMany: mocks.riskFindMany },
    operationalResponsePlan: {
      findMany: mocks.orpFindMany,
      findUnique: mocks.orpFindUnique
    }
  }
}));

import assetRoutes from '../src/modules/assets/asset.routes';
import departmentRoutes from '../src/modules/departments/department.routes';
import jurisdictionRoutes from '../src/modules/jurisdictions/jurisdiction.routes';
import caseRoutes from '../src/modules/cases/case.routes';
import inspectionRoutes from '../src/modules/inspections/inspection.routes';
import riskRoutes from '../src/modules/risk/risk.routes';
import orpRoutes from '../src/modules/orp/orp.routes';
import decisionRoutes from '../src/modules/decisions/decision.routes';

const app = express();
app.use(express.json());
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/jurisdictions', jurisdictionRoutes);
app.use('/api/v1/cases', caseRoutes);
app.use('/api/v1/inspections', inspectionRoutes);
app.use('/api/v1/cases', riskRoutes);
app.use('/api/v1', orpRoutes);
app.use('/api/v1', decisionRoutes);

async function auth(role = 'OFFICER', departmentId = 'dep-A', jurisdictionId = 'jur-A') {
  const user = { id: `user-${role}`, role, status: 'ACTIVE', departmentId, jurisdictionId };
  mocks.userFindUnique.mockResolvedValue(user);
  const config = getAuthConfig();
  const token = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(user.id)
    .setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(config.secret);
  return `Bearer ${token}`;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.assetFindMany.mockResolvedValue([]);
  mocks.departmentFindMany.mockResolvedValue([]);
  mocks.jurisdictionFindMany.mockResolvedValue([]);
  mocks.caseFindMany.mockResolvedValue([]);
  mocks.inspectionFindMany.mockResolvedValue([]);
  mocks.riskFindMany.mockResolvedValue([]);
  mocks.orpFindMany.mockResolvedValue([]);
});

describe('organizationally scoped routes', () => {
  it.each(['OFFICER', 'AUDITOR', 'POLICY_ADMIN'])(
    'sends both scope dimensions to Prisma for %s collections',
    async (role) => {
      const authorization = await auth(role);
      await request(app).get('/api/v1/assets').set('Authorization', authorization).expect(200);
      await request(app).get('/api/v1/cases').set('Authorization', authorization).expect(200);
      await request(app).get('/api/v1/inspections').set('Authorization', authorization).expect(200);
      const scope = { departmentId: 'dep-A', jurisdictionId: 'jur-A' };
      expect(mocks.assetFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: scope }));
      expect(mocks.caseFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { asset: scope } }));
      expect(mocks.inspectionFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { case: { asset: scope } } }));
    }
  );

  it('keeps SYSTEM_ADMIN collection reads global', async () => {
    const authorization = await auth('SYSTEM_ADMIN');
    await request(app).get('/api/v1/assets').set('Authorization', authorization).expect(200);
    await request(app).get('/api/v1/cases').set('Authorization', authorization).expect(200);
    expect(mocks.assetFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
    expect(mocks.caseFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
  });

  it.each(['OFFICER', 'AUDITOR', 'POLICY_ADMIN'])(
    'restricts registry reads to the identity records for %s',
    async (role) => {
      const authorization = await auth(role);
      await request(app).get('/api/v1/departments').set('Authorization', authorization).expect(200);
      await request(app).get('/api/v1/jurisdictions').set('Authorization', authorization).expect(200);
      expect(mocks.departmentFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'dep-A' } }));
      expect(mocks.jurisdictionFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'jur-A' } }));
    }
  );

  it('allows same-scope OFFICER Case creation and scopes the Asset lookup', async () => {
    mocks.assetFindUnique.mockResolvedValue({ id: 'asset-A', departmentId: 'dep-A', jurisdictionId: 'jur-A' });
    mocks.caseFindUnique.mockResolvedValue(null);
    mocks.caseCreate.mockResolvedValue({ id: 'case-A' });
    await request(app).post('/api/v1/cases').set('Authorization', await auth()).send({
      caseNumber: 'CASE-A', assetId: 'asset-A', title: 'Scoped case'
    }).expect(201);
    expect(mocks.assetFindUnique).toHaveBeenCalledWith({
      where: { id: 'asset-A', AND: [{ departmentId: 'dep-A', jurisdictionId: 'jur-A' }] }
    });
  });

  it.each([
    ['dep-A', 'jur-B'],
    ['dep-B', 'jur-A'],
    ['dep-B', 'jur-B']
  ])('returns 404 for unavailable OFFICER Asset scope %s/%s', async (departmentId, jurisdictionId) => {
    mocks.assetFindUnique.mockResolvedValue(null);
    const response = await request(app).post('/api/v1/cases').set('Authorization', await auth('OFFICER', departmentId, jurisdictionId)).send({
      caseNumber: 'CASE-X', assetId: 'asset-A', title: 'Cross-scope case'
    }).expect(404);
    expect(response.body.error.code).toBe('ASSET_NOT_FOUND');
    expect(mocks.caseCreate).not.toHaveBeenCalled();
  });

  it('retains explicit global SYSTEM_ADMIN Case creation', async () => {
    mocks.assetFindUnique.mockResolvedValue({ id: 'asset-B', departmentId: 'dep-B', jurisdictionId: 'jur-B' });
    mocks.caseFindUnique.mockResolvedValue(null);
    mocks.caseCreate.mockResolvedValue({ id: 'case-B' });
    await request(app).post('/api/v1/cases').set('Authorization', await auth('SYSTEM_ADMIN')).send({
      caseNumber: 'CASE-B', assetId: 'asset-B', title: 'Administrative case'
    }).expect(201);
    expect(mocks.assetFindUnique).toHaveBeenCalledWith({ where: { id: 'asset-B', AND: [{}] } });
  });

  it('makes missing and cross-scope direct Case reads indistinguishable', async () => {
    mocks.caseFindUnique.mockResolvedValue(null);
    for (const id of ['missing', 'cross-scope']) {
      const response = await request(app).get(`/api/v1/cases/${id}/risk-assessments`)
        .set('Authorization', await auth()).expect(404);
      expect(response.body.error).toEqual({ code: 'CASE_NOT_FOUND', message: 'Case not found.' });
    }
  });

  it('makes missing and cross-scope direct ORP reads indistinguishable', async () => {
    mocks.orpFindUnique.mockResolvedValue(null);
    for (const id of ['missing', 'cross-scope']) {
      const response = await request(app).get(`/api/v1/orps/${id}`).set('Authorization', await auth()).expect(404);
      expect(response.body.error).toEqual({ code: 'ORP_NOT_FOUND', message: 'Operational response plan not found.' });
    }
    expect(mocks.orpFindUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'cross-scope', AND: [{ case: { asset: { departmentId: 'dep-A', jurisdictionId: 'jur-A' } } }] }
    }));
  });

  it.each([
    ['/api/v1/inspections', {}],
    ['/api/v1/cases/case-A/assess-risk', {}],
    ['/api/v1/cases/case-A/orps', {}],
    ['/api/v1/orps/orp-A/decisions', { decisionType: 'APPROVED' }]
  ])('does not turn SYSTEM_ADMIN global reads into OFFICER mutation permission for %s', async (path, body) => {
    await request(app).post(path).set('Authorization', await auth('SYSTEM_ADMIN')).send(body).expect(403);
  });
});
