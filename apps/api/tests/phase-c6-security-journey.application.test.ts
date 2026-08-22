import request from 'supertest';
import { SignJWT } from 'jose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  userFindUnique: vi.fn(),
  count: vi.fn(),
  createPublicReport: vi.fn(),
  getPublicTracking: vi.fn()
}));

vi.mock('../src/lib/prisma', () => ({
  default: {
    user: { findUnique: mocks.userFindUnique, count: mocks.count },
    department: { count: mocks.count },
    jurisdiction: { count: mocks.count },
    asset: { count: mocks.count }
  }
}));

vi.mock('../src/modules/public-reports/public-report.service', () => {
  class PublicReportNotFoundError extends Error {}
  class PublicReportConflictError extends Error {}
  class PublicReportValidationError extends Error {}
  return {
    PublicReportNotFoundError,
    PublicReportConflictError,
    PublicReportValidationError,
    createCitizenPublicReport: mocks.createPublicReport,
    listPublicReports: vi.fn(),
    getPublicReport: vi.fn(),
    beginPublicReportReview: vi.fn(),
    routePublicReport: vi.fn(),
    rejectPublicReport: vi.fn(),
    acceptPublicReportAsCase: vi.fn()
  };
});

vi.mock('../src/modules/public-reports/public-tracking.service', () => {
  class PublicTrackingNotFoundError extends Error {}
  return {
    PublicTrackingNotFoundError,
    PUBLIC_REPORT_REFERENCE_PATTERN: /^JNV-PUB-\d{8}-[A-F0-9]{6}$/,
    getPublicTracking: mocks.getPublicTracking
  };
});

import { getAuthConfig } from '../src/config/auth';
import { app } from '../src/server';

const reportReference = 'JNV-PUB-20260823-C60001';
const uuid = '11111111-1111-4111-8111-111111111111';

async function authorization(role: string) {
  const actorId = `c6-${role.toLowerCase()}`;
  mocks.userFindUnique.mockResolvedValue({
    id: actorId,
    role,
    status: 'ACTIVE',
    departmentId: 'c6-department',
    jurisdictionId: 'c6-jurisdiction'
  });
  const config = getAuthConfig();
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(actorId)
    .setIssuer(config.issuer)
    .setAudience(config.audience)
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(config.secret);
  return `Bearer ${token}`;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.count.mockResolvedValue(1);
  mocks.createPublicReport.mockResolvedValue({
    reportNumber: reportReference,
    status: 'SUBMITTED',
    submittedAt: new Date('2026-08-23T06:00:00.000Z')
  });
  mocks.getPublicTracking.mockResolvedValue({
    reportReference,
    caseReference: 'CASE-C6-0001',
    title: 'Synthetic C6 infrastructure report',
    category: 'BRIDGE_OR_FLYOVER',
    locationText: 'Synthetic C6 test location',
    submittedAt: new Date('2026-08-23T06:00:00.000Z'),
    status: 'RESOLVED',
    statusLabel: 'Resolved',
    outcome: 'The reported issue has completed the governed process.',
    governedCaseCreated: true,
    lastProgressAt: new Date('2026-08-23T08:00:00.000Z'),
    timeline: [{ key: 'RESOLVED', label: 'Resolved', occurredAt: new Date('2026-08-23T08:00:00.000Z'), complete: true }]
  });
});

describe('Phase C6 assembled application security journey', () => {
  it('preserves anonymous public submission and tracking through the complete server mount order', async () => {
    const submitted = await request(app).post('/api/v1/public-reports').send({
      title: 'Synthetic C6 infrastructure report',
      description: 'Synthetic C6 report used only to verify the assembled application security boundary.',
      category: 'BRIDGE_OR_FLYOVER',
      locationText: 'Synthetic C6 test location',
      reporterName: 'Private C6 Reporter',
      reporterContact: 'private-c6@example.test'
    }).expect(201);
    expect(submitted.body.data).toMatchObject({ reportNumber: reportReference, status: 'SUBMITTED' });
    expect(JSON.stringify(submitted.body)).not.toMatch(/Private C6 Reporter|private-c6@example\.test/);

    const tracked = await request(app).get(`/api/v1/public/tracking/${reportReference}`).expect(200);
    expect(tracked.headers['cache-control']).toContain('no-store');
    expect(tracked.body.data).toMatchObject({ reportReference, status: 'RESOLVED', governedCaseCreated: true });
    expect(JSON.stringify(tracked.body)).not.toMatch(/reporter(Name|Contact)|officer|reviewer|verifier|closer|decisionNote|inspectionNote|passwordHash|authorization|bearer|jwt/i);
  });

  it('denies anonymous and invalid-token access to protected intake and operational routes', async () => {
    for (const [method, path] of [
      ['get', '/api/v1/public-reports'],
      ['get', '/api/v1/cases'],
      ['post', `/api/v1/cases/${uuid}/assess-risk`],
      ['post', `/api/v1/cases/${uuid}/orps`],
      ['post', `/api/v1/execution-tasks/${uuid}/verify`]
    ] as const) {
      await request(app)[method](path).send({ verificationNote: 'Synthetic verification note' }).expect(401);
      await request(app)[method](path).set('Authorization', 'Bearer malformed.c6.token').send({ verificationNote: 'Synthetic verification note' }).expect(401);
    }
  });

  it('keeps governance administration unavailable to operational and read-only roles', async () => {
    for (const role of ['OFFICER', 'AUDITOR']) {
      const token = await authorization(role);
      await request(app).post('/api/v1/policies').set('Authorization', token).send({}).expect(403);
      await request(app).post('/api/v1/approved-actions').set('Authorization', token).send({}).expect(403);
      await request(app).post('/api/v1/execution-templates').set('Authorization', token).send({}).expect(403);
    }
  });

  it.each(['POLICY_ADMIN', 'AUDITOR', 'SYSTEM_ADMIN'])('does not give %s an operational mutation bypass', async (role) => {
    const token = await authorization(role);
    const attempts: Array<[string, string, object]> = [
      ['post', '/api/v1/inspections', {}],
      ['post', `/api/v1/cases/${uuid}/assess-risk`, {}],
      ['post', `/api/v1/cases/${uuid}/orps`, {}],
      ['post', `/api/v1/orps/${uuid}/decisions`, { decisionType: 'APPROVED' }],
      ['post', `/api/v1/orps/${uuid}/execution-plan`, {}],
      ['patch', `/api/v1/execution-tasks/${uuid}/assignment`, { assigneeId: uuid }],
      ['patch', `/api/v1/execution-tasks/${uuid}/status`, { status: 'IN_PROGRESS' }],
      ['post', `/api/v1/execution-tasks/${uuid}/evidence`, { evidenceType: 'PHOTO', description: 'Synthetic evidence' }],
      ['post', `/api/v1/execution-tasks/${uuid}/submit-completion`, { completionNote: 'Synthetic completion' }],
      ['post', `/api/v1/execution-tasks/${uuid}/verify`, { verificationNote: 'Synthetic verification' }],
      ['post', `/api/v1/cases/${uuid}/close`, { closureReason: 'EXECUTION_VERIFIED', closureSummary: 'Synthetic closure' }]
    ];
    for (const [method, path, body] of attempts) {
      await request(app)[method as 'post'](path).set('Authorization', token).send(body).expect(403);
    }
  });
});
