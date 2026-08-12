import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrpDecisionType } from '../src/generated/prisma';
import { WorkflowError } from '../src/modules/decisions/workflow-error';

const mocks = vi.hoisted(() => ({
  submit: vi.fn(),
  orpHistory: vi.fn(),
  caseHistory: vi.fn()
}));

vi.mock('../src/modules/decisions/decision.service', () => ({
  submitOrpDecision: mocks.submit,
  getOrpDecisionHistory: mocks.orpHistory,
  getCaseDecisionHistory: mocks.caseHistory
}));

import decisionRoutes from '../src/modules/decisions/decision.routes';

const app = express();
app.use(express.json());
app.use('/api/v1', decisionRoutes);

beforeEach(() => vi.clearAllMocks());

describe('decision routes', () => {
  it.each(Object.values(OrpDecisionType))('POST accepts %s through the decision service', async (decisionType) => {
    mocks.submit.mockResolvedValue({ id: `decision-${decisionType}`, decisionType });
    const body: Record<string, unknown> = { reviewerId: 'reviewer-1', decisionType };
    if (decisionType !== OrpDecisionType.APPROVED) body.reason = 'Required reason';
    if (decisionType === OrpDecisionType.ESCALATED) body.forwardToUserId = 'officer-2';
    const response = await request(app).post('/api/v1/orps/orp-1/decisions').send(body).expect(201);
    expect(response.body.data.decisionType).toBe(decisionType);
    expect(mocks.submit).toHaveBeenCalledWith('orp-1', expect.objectContaining({ reviewerId: 'reviewer-1', decisionType }));
  });

  it.each([
    ['STALE_ORP_VERSION', 409],
    ['ORP_ALREADY_DECIDED', 409],
    ['AUTHORITY_NOT_GRANTED', 403],
    ['DECISION_NOT_AUTHORIZED', 403],
    ['PRIORITY_AUTHORITY_EXCEEDED', 403],
    ['REVIEWER_INACTIVE', 403],
    ['REVIEWER_DEPARTMENT_MISMATCH', 403],
    ['REVIEWER_JURISDICTION_MISMATCH', 403]
  ])('POST maps %s to HTTP %s', async (code, status) => {
    mocks.submit.mockRejectedValue(new WorkflowError(code, status, 'controlled'));
    const response = await request(app).post('/api/v1/orps/orp-1/decisions').send({
      reviewerId: 'reviewer-1', decisionType: 'APPROVED'
    }).expect(status);
    expect(response.body.error.code).toBe(code);
  });

  it('GET returns deterministic ORP decision history', async () => {
    mocks.orpHistory.mockResolvedValue([{ id: 'decision-1', reviewer: { employeeCode: 'PWD-EE-001' } }]);
    const response = await request(app).get('/api/v1/orps/orp-1/decisions').expect(200);
    expect(response.body.data[0].reviewer.employeeCode).toBe('PWD-EE-001');
    expect(response.body.ordering).toBe('createdAt ASC, id ASC');
  });

  it('GET returns deterministic case decision history', async () => {
    mocks.caseHistory.mockResolvedValue([{ id: 'decision-1', orp: { versionNumber: 1 } }]);
    const response = await request(app).get('/api/v1/cases/case-1/decisions').expect(200);
    expect(response.body.data[0].orp.versionNumber).toBe(1);
    expect(response.body.ordering).toBe('createdAt ASC, id ASC');
  });
});
