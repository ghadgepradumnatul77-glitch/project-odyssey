import express from 'express';
import request from 'supertest';
import { SignJWT } from 'jose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  userFindUnique: vi.fn(),
  departmentFindMany: vi.fn(),
  departmentFindUnique: vi.fn(),
  departmentCreate: vi.fn(),
  inspectionFindMany: vi.fn(),
  caseFindUnique: vi.fn(),
  inspectionCreate: vi.fn(),
  orpDecisionFindFirst: vi.fn(),
  caseUpdate: vi.fn(),
  departmentCount: vi.fn(), jurisdictionCount: vi.fn(), userCount: vi.fn(), assetCount: vi.fn()
}));

vi.mock('../src/lib/prisma', () => ({
  default: {
    user: { findUnique: mocks.userFindUnique, count: mocks.userCount },
    department: { findMany: mocks.departmentFindMany, findUnique: mocks.departmentFindUnique, create: mocks.departmentCreate, count: mocks.departmentCount },
    jurisdiction: { count: mocks.jurisdictionCount },
    asset: { count: mocks.assetCount },
    inspection: { findMany: mocks.inspectionFindMany },
    orpDecision: { findFirst: mocks.orpDecisionFindFirst },
    case: { findUnique: mocks.caseFindUnique },
    $transaction: (callback: (tx: unknown) => unknown) => callback({
      inspection: { create: mocks.inspectionCreate }, case: { update: mocks.caseUpdate }
    })
  }
}));

import { getAuthConfig } from '../src/config/auth';
import departmentRoutes from '../src/modules/departments/department.routes';
import inspectionRoutes from '../src/modules/inspections/inspection.routes';

const app = express();
app.use(express.json());
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/inspections', inspectionRoutes);

async function authorization(role: string, id = `user-${role}`) {
  mocks.userFindUnique.mockResolvedValue({ id, role, status: 'ACTIVE', departmentId: 'dep-1', jurisdictionId: 'jur-1' });
  const config = getAuthConfig();
  const token = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(id)
    .setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(config.secret);
  return `Bearer ${token}`;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.departmentFindMany.mockResolvedValue([]);
  mocks.inspectionFindMany.mockResolvedValue([]);
});

describe('authorization surface', () => {
  it('rejects unauthenticated operational reads', async () => {
    await request(app).get('/api/v1/departments').expect(401);
    await request(app).get('/api/v1/inspections').expect(401);
  });

  it.each(['OFFICER', 'POLICY_ADMIN', 'AUDITOR', 'SYSTEM_ADMIN'])('allows authenticated %s operational reads', async (role) => {
    await request(app).get('/api/v1/departments').set('Authorization', await authorization(role)).expect(200);
    await request(app).get('/api/v1/inspections').set('Authorization', await authorization(role)).expect(200);
  });

  it.each(['OFFICER', 'POLICY_ADMIN', 'AUDITOR'])('rejects %s registry writes', async (role) => {
    await request(app).post('/api/v1/departments').set('Authorization', await authorization(role)).send({ name: 'New', code: 'NEW' }).expect(403);
    expect(mocks.departmentCreate).not.toHaveBeenCalled();
  });

  it('allows SYSTEM_ADMIN to reach existing registry validation', async () => {
    await request(app).post('/api/v1/departments').set('Authorization', await authorization('SYSTEM_ADMIN')).send({}).expect(400);
  });

  it.each(['POLICY_ADMIN', 'AUDITOR', 'SYSTEM_ADMIN'])('rejects %s inspection mutation', async (role) => {
    await request(app).post('/api/v1/inspections').set('Authorization', await authorization(role)).send({}).expect(403);
  });

  it('rejects client-controlled inspectorId for an authenticated officer', async () => {
    const body = {
      caseId: 'case-1', inspectorId: 'impersonated-user', inspectionDate: '2026-08-13T00:00:00Z',
      structuralCondition: 'POOR', crackSeverity: 'SEVERE', corrosionLevel: 'MODERATE',
      trafficImportance: 'HIGH', hospitalRoute: true, weatherRisk: 'HIGH', heavyRainExpected: true
    };
    const response = await request(app).post('/api/v1/inspections')
      .set('Authorization', await authorization('OFFICER', 'authenticated-inspector')).send(body).expect(400);
    expect(response.body.error.code).toBe('INSPECTOR_ID_NOT_ALLOWED');
    expect(mocks.inspectionCreate).not.toHaveBeenCalled();
  });

  it('uses authenticated officer identity and preserves inspection scope validation', async () => {
    mocks.caseFindUnique.mockResolvedValue({ id: 'case-1', status: 'NEW', asset: { departmentId: 'dep-1', jurisdictionId: 'jur-1' } });
    mocks.inspectionCreate.mockResolvedValue({ id: 'inspection-1', inspectorId: 'authenticated-inspector' });
    const body = {
      caseId: 'case-1', inspectionDate: '2026-08-13T00:00:00Z', structuralCondition: 'POOR',
      crackSeverity: 'SEVERE', corrosionLevel: 'MODERATE', trafficImportance: 'HIGH',
      hospitalRoute: true, weatherRisk: 'HIGH', heavyRainExpected: true
    };
    await request(app).post('/api/v1/inspections')
      .set('Authorization', await authorization('OFFICER', 'authenticated-inspector')).send(body).expect(201);
    expect(mocks.userFindUnique).toHaveBeenLastCalledWith({ where: { id: 'authenticated-inspector' } });
    expect(mocks.inspectionCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ inspectorId: 'authenticated-inspector' })
    }));
  });

  it.each(['MODIFICATION_REQUESTED', 'REJECTED', 'ESCALATED'])(
    'allows explicit UNDER_REVIEW recovery after %s only by creating a new inspection', async (decisionType) => {
      mocks.caseFindUnique.mockResolvedValue({ id: 'case-1', status: 'UNDER_REVIEW', asset: { departmentId: 'dep-1', jurisdictionId: 'jur-1' } });
      mocks.orpDecisionFindFirst.mockResolvedValue({ decisionType });
      mocks.inspectionCreate.mockResolvedValue({ id: `inspection-${decisionType}`, inspectorId: 'authenticated-inspector' });
      const body = { caseId: 'case-1', inspectionDate: '2026-08-22T00:00:00Z', structuralCondition: 'POOR', crackSeverity: 'SEVERE', corrosionLevel: 'MODERATE', trafficImportance: 'HIGH', hospitalRoute: true, weatherRisk: 'HIGH', heavyRainExpected: true };
      await request(app).post('/api/v1/inspections').set('Authorization', await authorization('OFFICER', 'authenticated-inspector')).send(body).expect(201);
      expect(mocks.caseUpdate).toHaveBeenCalledWith({ where: { id: 'case-1' }, data: { status: 'INSPECTION_IN_PROGRESS' } });
    }
  );

  it.each(['ORP_READY', 'APPROVED', 'EXECUTION', 'VERIFICATION', 'CLOSED', 'CANCELLED'])(
    'does not reopen %s through the inspection endpoint', async (status) => {
      mocks.caseFindUnique.mockResolvedValue({ id: 'case-1', status, asset: { departmentId: 'dep-1', jurisdictionId: 'jur-1' } });
      const body = { caseId: 'case-1', inspectionDate: '2026-08-22T00:00:00Z', structuralCondition: 'POOR', crackSeverity: 'SEVERE', corrosionLevel: 'MODERATE', trafficImportance: 'HIGH', hospitalRoute: true, weatherRisk: 'HIGH', heavyRainExpected: true };
      await request(app).post('/api/v1/inspections').set('Authorization', await authorization('OFFICER')).send(body).expect(409);
      expect(mocks.inspectionCreate).not.toHaveBeenCalled();
    }
  );

  it('hides a cross-scope inspection target from the authenticated inspector', async () => {
    mocks.caseFindUnique.mockResolvedValue({ id: 'case-1', asset: { departmentId: 'dep-2', jurisdictionId: 'jur-1' } });
    const body = {
      caseId: 'case-1', inspectionDate: '2026-08-13T00:00:00Z', structuralCondition: 'POOR',
      crackSeverity: 'SEVERE', corrosionLevel: 'MODERATE', trafficImportance: 'HIGH',
      hospitalRoute: true, weatherRisk: 'HIGH', heavyRainExpected: true
    };
    expect((await request(app).post('/api/v1/inspections')
      .set('Authorization', await authorization('OFFICER')).send(body).expect(404)).body.error.code)
      .toBe('CASE_NOT_FOUND');
  });
});
