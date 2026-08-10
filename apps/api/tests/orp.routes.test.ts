import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createORPForCase: vi.fn(),
  caseFindUnique: vi.fn(),
  orpFindMany: vi.fn(),
  orpFindUnique: vi.fn()
}));

vi.mock('../src/lib/prisma', () => ({
  default: {
    case: { findUnique: mocks.caseFindUnique },
    operationalResponsePlan: {
      findMany: mocks.orpFindMany,
      findUnique: mocks.orpFindUnique
    }
  }
}));

vi.mock('../src/modules/orp/orp.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/modules/orp/orp.service')>();
  return { ...actual, createORPForCase: mocks.createORPForCase };
});

import orpRoutes from '../src/modules/orp/orp.routes';

const app = express();
app.use(express.json());
app.use('/api/v1', orpRoutes);

const storedOrp = {
  id: 'orp-1',
  caseId: 'case-1',
  riskAssessmentId: 'risk-1',
  versionNumber: 1,
  status: 'AWAITING_REVIEW',
  urgency: 'IMMEDIATE',
  recommendedActionCodes: ['ACT_INSPECT_DETAILED'],
  temporaryMeasures: [],
  reasons: [{ reasonCode: 'ORP_RULE_A002', message: 'reason' }],
  alternativeActionCodes: ['ACT_INCREASE_MONITORING'],
  planVersion: 'ODYSSEY_ORP_V1',
  createdAt: new Date('2026-08-10T00:00:00Z'),
  updatedAt: new Date('2026-08-10T00:00:00Z')
};

beforeEach(() => vi.clearAllMocks());

describe('ORP routes', () => {
  it('POST creates an ORP through the service', async () => {
    mocks.createORPForCase.mockResolvedValue(storedOrp);
    const response = await request(app).post('/api/v1/cases/case-1/orps').expect(201);
    expect(mocks.createORPForCase).toHaveBeenCalledWith('case-1');
    expect(response.body.data.versionNumber).toBe(1);
  });

  it.each([
    ['CASE_NOT_FOUND', 404],
    ['RISK_ASSESSMENT_REQUIRED', 400],
    ['CASE_NOT_READY_FOR_ORP', 409],
    ['ORP_VERSION_CONFLICT', 409]
  ])('POST maps %s to HTTP %s', async (code, status) => {
    mocks.createORPForCase.mockRejectedValue(new Error(code));
    const response = await request(app).post('/api/v1/cases/case-1/orps').expect(status);
    expect(response.body.error.code).toBe(code);
  });

  it('GET returns ORP history newest first', async () => {
    mocks.caseFindUnique.mockResolvedValue({ id: 'case-1' });
    mocks.orpFindMany.mockResolvedValue([storedOrp]);
    const response = await request(app).get('/api/v1/cases/case-1/orps').expect(200);
    expect(response.body.data[0].versionNumber).toBe(1);
    expect(mocks.orpFindMany).toHaveBeenCalledWith(expect.objectContaining({
      orderBy: [{ createdAt: 'desc' }, { versionNumber: 'desc' }]
    }));
  });

  it('GET history returns CASE_NOT_FOUND', async () => {
    mocks.caseFindUnique.mockResolvedValue(null);
    const response = await request(app).get('/api/v1/cases/missing/orps').expect(404);
    expect(response.body.error.code).toBe('CASE_NOT_FOUND');
  });

  it('GET returns one ORP with expanded actions and related records', async () => {
    mocks.orpFindUnique.mockResolvedValue({
      ...storedOrp,
      case: { id: 'case-1', asset: { id: 'asset-1' } },
      riskAssessment: { id: 'risk-1' }
    });
    const response = await request(app).get('/api/v1/orps/orp-1').expect(200);
    expect(response.body.data.case.asset.id).toBe('asset-1');
    expect(response.body.data.riskAssessment.id).toBe('risk-1');
    expect(response.body.data.recommendedActions[0].actionCode).toBe('ACT_INSPECT_DETAILED');
    expect(response.body.data.alternativeActions[0].actionCode).toBe('ACT_INCREASE_MONITORING');
    expect(response.body.data.reasons).toHaveLength(1);
  });

  it('safely expands malformed stored action JSON as empty arrays', async () => {
    mocks.orpFindUnique.mockResolvedValue({
      ...storedOrp,
      recommendedActionCodes: { invalid: true },
      alternativeActionCodes: [42],
      case: { id: 'case-1', asset: { id: 'asset-1' } },
      riskAssessment: { id: 'risk-1' }
    });
    const response = await request(app).get('/api/v1/orps/orp-1').expect(200);
    expect(response.body.data.recommendedActions).toEqual([]);
    expect(response.body.data.alternativeActions).toEqual([]);
  });

  it('rejects whitespace-only route IDs', async () => {
    const post = await request(app).post('/api/v1/cases/%20/orps').expect(400);
    const detail = await request(app).get('/api/v1/orps/%20').expect(400);
    expect(post.body.error.code).toBe('INVALID_INPUT');
    expect(detail.body.error.code).toBe('INVALID_INPUT');
  });
});
