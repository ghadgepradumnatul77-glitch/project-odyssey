import request from 'supertest';
import { SignJWT } from 'jose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthConfig } from '../src/config/auth';

const ids = { task: '11111111-1111-4111-8111-111111111111', eligible: '22222222-2222-4222-8222-222222222222', forged: '33333333-3333-4333-8333-333333333333' };
const state = vi.hoisted(() => ({ status: 'PENDING', selected: null as string | null, candidates: [
  { id: '22222222-2222-4222-8222-222222222222', name: 'Asha Officer', designation: 'Executive Engineer', employeeCode: 'ODY-EE-001', status: 'ACTIVE', role: 'OFFICER', departmentId: 'dep', jurisdictionId: 'jur' },
  { id: '33333333-3333-4333-8333-333333333333', name: 'Cross Scope', designation: 'Engineer', employeeCode: 'OTHER-1', status: 'ACTIVE', role: 'OFFICER', departmentId: 'other', jurisdictionId: 'other' }
] }));

vi.mock('../src/lib/prisma', () => {
  const task = () => ({ id: '11111111-1111-4111-8111-111111111111', status: state.status, executionPlanId: 'plan', assignedToId: state.selected, evidence: [], executionPlan: { status: 'PLANNED', createdById: 'actor', case: { status: 'EXECUTION', asset: { departmentId: 'dep', jurisdictionId: 'jur' } } } });
  const eligible = (where: any) => state.candidates.filter((user) => user.status === where.status && user.role === where.role && user.departmentId === where.departmentId && user.jurisdictionId === where.jurisdictionId && (!where.id || user.id === where.id));
  const tx = { executionTask: {
    findUnique: vi.fn(async () => ({ executionPlan: { status: 'PLANNED', case: { status: 'EXECUTION' } } })),
    findUniqueOrThrow: vi.fn(async () => ({ ...task(), assignedTo: state.candidates.find((item) => item.id === state.selected) ?? null, evidence: [] })),
    findMany: vi.fn(async () => [{ status: state.status, isMandatory: true }]),
    updateMany: vi.fn(async ({ where, data }: any) => { if (state.status !== where.status) return { count: 0 }; state.status = data.status; state.selected = data.assignedToId; return { count: 1 }; })
  }, executionPlan: { findUnique: vi.fn(async () => ({ caseId: 'case', status: 'PLANNED' })), update: vi.fn(async () => ({})) } };
  return { default: {
    user: {
      findUnique: vi.fn(async ({ where }: any) => ({ id: where.id, role: 'OFFICER', status: 'ACTIVE', departmentId: 'dep', jurisdictionId: 'jur' })),
      findMany: vi.fn(async ({ where, select }: any) => eligible(where).map((user) => Object.fromEntries(Object.keys(select).map((key) => [key, (user as any)[key]])))),
      findFirst: vi.fn(async ({ where, select }: any) => { const user = eligible(where)[0]; return user ? Object.fromEntries(Object.keys(select).map((key) => [key, (user as any)[key]])) : null; })
    }, executionTask: { findUnique: vi.fn(async () => task()) }, $transaction: vi.fn(async (callback: any) => callback(tx))
  } };
});

import { app } from '../src/server';

async function authorization() { const config = getAuthConfig(); return `Bearer ${await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject('actor').setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(config.secret)}`; }

describe('assembled application scoped task assignment', () => {
  beforeEach(() => { state.status = 'PENDING'; state.selected = null; });
  it('returns only scoped officers, assigns one, and rejects a forged cross-scope candidate', async () => {
    const token = await authorization();
    const candidates = await request(app).get(`/api/v1/execution-tasks/${ids.task}/eligible-assignees`).set('Authorization', token).expect(200);
    expect(candidates.body.data).toEqual({ items: [{ id: ids.eligible, name: 'Asha Officer', designation: 'Executive Engineer', employeeCode: 'ODY-EE-001' }], limit: 100, truncated: false });
    expect(JSON.stringify(candidates.body.data)).not.toMatch(/email|password|token/i);
    const assigned = await request(app).patch(`/api/v1/execution-tasks/${ids.task}/assignment`).set('Authorization', token).send({ assigneeId: ids.eligible }).expect(200);
    expect(assigned.body.data).toMatchObject({ status: 'ASSIGNED', assignedTo: { id: ids.eligible } });
    state.status = 'PENDING'; state.selected = null;
    const rejected = await request(app).patch(`/api/v1/execution-tasks/${ids.task}/assignment`).set('Authorization', token).send({ assigneeId: ids.forged }).expect(404);
    expect(rejected.body.error.code).toBe('ASSIGNEE_NOT_ELIGIBLE'); expect(state.selected).toBeNull();
  });
});
