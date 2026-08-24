import request from 'supertest';
import { SignJWT } from 'jose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthConfig } from '../src/config/auth';

const fixture = vi.hoisted(() => ({
  status: 'INSPECTION_REQUIRED',
  orpStatus: 'AWAITING_REVIEW',
  decisions: [] as any[],
  inspections: [] as any[],
  risks: [] as any[],
  riskLevel: null as string | null,
  priorityLevel: null as string | null,
  caseUpdate: vi.fn()
}));

vi.mock('../src/lib/prisma', () => {
  const caseRecord = () => ({ id: 'case-recovery', status: fixture.status, riskLevel: fixture.riskLevel, priorityLevel: fixture.priorityLevel, asset: { departmentId: 'dep', jurisdictionId: 'jur' } });
  const tx = {
    inspection: { create: vi.fn(async ({ data }: any) => { const row = { id: `inspection-${fixture.inspections.length + 1}`, ...data, createdAt: new Date(), updatedAt: new Date() }; fixture.inspections.push(row); return row; }) },
    riskAssessment: { create: vi.fn(async ({ data }: any) => { const row = { id: `risk-${fixture.risks.length + 1}`, ...data, createdAt: new Date() }; fixture.risks.push(row); return row; }) },
    trustedComputationReceipt: { create: vi.fn(async ({ data }: any) => ({ id: `receipt-${data.riskAssessmentId}`, ...data, createdAt: new Date() })) },
    case: { update: vi.fn(async ({ data }: any) => { fixture.status = data.status; fixture.riskLevel = data.riskLevel ?? fixture.riskLevel; fixture.priorityLevel = data.priorityLevel ?? fixture.priorityLevel; fixture.caseUpdate(data); return caseRecord(); }) },
    operationalResponsePlan: {
      findUnique: vi.fn(async () => ({ status: fixture.orpStatus })),
      findFirst: vi.fn(async () => ({ id: 'orp-old' })),
      update: vi.fn(async ({ data }: any) => { fixture.orpStatus = data.status; return { id: 'orp-old', status: fixture.orpStatus }; })
    },
    orpDecision: {
      findUnique: vi.fn(async () => fixture.decisions[0] ?? null),
      create: vi.fn(async ({ data }: any) => { const row = { id: 'decision-reinspection', ...data, createdAt: new Date() }; fixture.decisions.push(row); return row; })
    }
  };
  return { default: {
    user: { findUnique: vi.fn(async ({ where }: any) => ({ id: where.id, role: 'OFFICER', status: 'ACTIVE', departmentId: 'dep', jurisdictionId: 'jur' })) },
    case: { findUnique: vi.fn(async () => caseRecord()) },
    inspection: { findFirst: vi.fn(async () => fixture.inspections.at(-1) ?? null) },
    operationalResponsePlan: {
      findUnique: vi.fn(async () => ({ id: 'orp-old', caseId: 'case-recovery', status: fixture.orpStatus, decisions: fixture.decisions, case: { ...caseRecord(), priorityLevel: 'CRITICAL', asset: { departmentId: 'dep', jurisdictionId: 'jur' } } })),
      findFirst: vi.fn(async () => ({ id: 'orp-old' }))
    },
    orpDecision: { findFirst: vi.fn(async () => fixture.decisions.at(-1) ?? null) },
    approvalAuthority: { findMany: vi.fn(async () => [{ id: 'authority', userId: 'officer', departmentId: 'dep', jurisdictionId: 'jur', isActive: true, validFrom: null, validUntil: null, maxPriorityLevel: 'CRITICAL', canApprove: true, canReject: true, canRequestModification: true, canRequestReinspection: true, canEscalate: true }]) },
    riskAssessment: { findMany: vi.fn(async () => fixture.risks), findUnique: vi.fn(async ({ where }: any) => fixture.risks.find((item) => item.sourceFingerprint === where.sourceFingerprint) ?? null) },
    $transaction: vi.fn(async (callback: any) => callback(tx))
  } };
});
vi.mock('../src/modules/integrity/integrity.service',()=>({appendIntegrityEvent:vi.fn(async()=>({id:'event'})),riskIntegrityFacts:vi.fn(()=>({protected:true}))}));

import { app } from '../src/server';

async function authorization() {
  const config = getAuthConfig();
  const token = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject('officer')
    .setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(config.secret);
  return `Bearer ${token}`;
}

describe('assembled application reinspection recovery', () => {
  beforeEach(() => {
    fixture.status = 'ORP_READY';
    fixture.orpStatus = 'AWAITING_REVIEW';
    fixture.riskLevel = null;
    fixture.priorityLevel = null;
    fixture.decisions.splice(0);
    fixture.inspections.splice(0, fixture.inspections.length, { id: 'inspection-old', caseId: 'case-recovery', createdAt: new Date('2026-01-01'), structuralCondition: 'FAIR', crackSeverity: 'MINOR', corrosionLevel: 'LOW', trafficImportance: 'LOW', hospitalRoute: false, weatherRisk: 'LOW', heavyRainExpected: false, estimatedDailyUsers: 100 });
    fixture.risks.splice(0, fixture.risks.length, { id: 'risk-old', caseId: 'case-recovery', inspectionId: 'inspection-old' });
    fixture.caseUpdate.mockClear();
  });

  it('uses real mounted routes to create new inspection/risk lineage and return to planning', async () => {
    const auth = await authorization();
    await request(app).post('/api/v1/orps/orp-old/decisions').set('Authorization', auth).send({
      decisionType: 'REINSPECTION_REQUESTED', reason: 'A new authoritative inspection is required.'
    }).expect(201);
    expect(fixture.status).toBe('INSPECTION_REQUIRED');
    expect(fixture.orpStatus).toBe('REINSPECTION_REQUESTED');
    expect(fixture.decisions).toHaveLength(1);
    await request(app).post('/api/v1/orps/orp-old/decisions').set('Authorization', auth).send({ decisionType: 'APPROVED' }).expect(409);
    expect(fixture.decisions).toHaveLength(1);

    const inspection = await request(app).post('/api/v1/inspections').set('Authorization', auth).send({
      caseId: 'case-recovery', inspectionDate: '2026-08-22T00:00:00Z', structuralCondition: 'POOR',
      crackSeverity: 'SEVERE', corrosionLevel: 'MODERATE', trafficImportance: 'HIGH', hospitalRoute: true,
      weatherRisk: 'HIGH', heavyRainExpected: true, estimatedDailyUsers: 42000
    }).expect(201);
    expect(inspection.body.data.id).toBe('inspection-2');
    expect(fixture.status).toBe('INSPECTION_IN_PROGRESS');

    const risk = await request(app).post('/api/v1/cases/case-recovery/assess-risk').set('Authorization', auth).expect(200);
    expect(risk.body.data.inspectionId).toBe('inspection-2');
    expect(risk.body.data.reused).toBe(false);
    expect(fixture.status).toBe('ORP_READY');
    const repeated = await request(app).post('/api/v1/cases/case-recovery/assess-risk').set('Authorization', auth).expect(200);
    expect(repeated.body.data).toMatchObject({ id: risk.body.data.id, inspectionId: 'inspection-2', reused: true, riskScore: risk.body.data.riskScore });
    expect(fixture.inspections.map(({ id }) => id)).toEqual(['inspection-old', 'inspection-2']);
    expect(fixture.risks.map(({ id }) => id)).toEqual(['risk-old', 'risk-2']);
    expect(fixture.decisions).toHaveLength(1);
    expect(fixture.decisions[0]).toMatchObject({ id: 'decision-reinspection', orpId: 'orp-old', decisionType: 'REINSPECTION_REQUESTED', authorityGrantId: 'authority' });
    expect(fixture.orpStatus).toBe('REINSPECTION_REQUESTED');
  });
});
