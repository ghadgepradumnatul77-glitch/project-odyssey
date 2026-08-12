import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkflowError } from '../src/modules/decisions/workflow-error';

const mocks = vi.hoisted(() => ({ create: vi.fn(), list: vi.fn() }));

vi.mock('../src/modules/authorities/authority.service', () => ({
  createApprovalAuthority: mocks.create,
  listApprovalAuthorities: mocks.list
}));

import authorityRoutes from '../src/modules/authorities/authority.routes';

const app = express();
app.use(express.json());
app.use('/api/v1', authorityRoutes);

beforeEach(() => vi.clearAllMocks());

describe('approval authority routes', () => {
  it('POST creates an explicit authority grant without designation inference', async () => {
    mocks.create.mockResolvedValue({ id: 'grant-1', canApprove: true, maxPriorityLevel: 'CRITICAL' });
    const response = await request(app).post('/api/v1/approval-authorities').send({
      userId: 'user-1',
      departmentId: 'dep-1',
      jurisdictionId: 'jur-1',
      canApprove: true,
      maxPriorityLevel: 'CRITICAL'
    }).expect(201);
    expect(response.body.data.id).toBe('grant-1');
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1', canApprove: true }));
  });

  it('POST rejects invalid booleans', async () => {
    const response = await request(app).post('/api/v1/approval-authorities').send({
      userId: 'user-1', departmentId: 'dep-1', jurisdictionId: 'jur-1', canApprove: 'yes'
    }).expect(400);
    expect(response.body.error.code).toBe('INVALID_INPUT');
  });

  it('POST returns controlled service errors', async () => {
    mocks.create.mockRejectedValue(new WorkflowError('ACTIVE_AUTHORITY_EXISTS', 409, 'duplicate'));
    const response = await request(app).post('/api/v1/approval-authorities').send({
      userId: 'user-1', departmentId: 'dep-1', jurisdictionId: 'jur-1'
    }).expect(409);
    expect(response.body.error.code).toBe('ACTIVE_AUTHORITY_EXISTS');
  });

  it('GET lists grants deterministically through the service', async () => {
    mocks.list.mockResolvedValue([{ id: 'grant-1', user: { employeeCode: 'PWD-EE-001' } }]);
    const response = await request(app).get('/api/v1/approval-authorities').expect(200);
    expect(response.body.data[0].user.employeeCode).toBe('PWD-EE-001');
  });
});
