import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExecutionTaskStatus, SystemRole, UserStatus } from '../src/generated/prisma';

const mocks = vi.hoisted(() => ({ task: vi.fn(), users: vi.fn(), user: vi.fn(), updateMany: vi.fn(), taskResult: vi.fn(), plan: vi.fn(), planTasks: vi.fn(), planUpdate: vi.fn() }));
vi.mock('../src/lib/prisma', () => ({ default: {
  executionTask: { findUnique: mocks.task }, user: { findMany: mocks.users, findFirst: mocks.user },
  $transaction: vi.fn(async (callback: any) => callback({ executionTask: { findUnique: mocks.taskResult, findUniqueOrThrow: mocks.taskResult, findMany: mocks.planTasks, updateMany: mocks.updateMany }, executionPlan: { findUnique: mocks.plan, update: mocks.planUpdate } }))
} }));

import { assignTask, resolveEligibleExecutionAssignees } from '../src/modules/execution/execution.service';

const principal = { id: 'actor', role: SystemRole.OFFICER, status: UserStatus.ACTIVE, departmentId: 'dep', jurisdictionId: 'jur' };
const task = (status: ExecutionTaskStatus = ExecutionTaskStatus.PENDING) => ({ id: 'task', status, executionPlanId: 'plan', evidence: [], executionPlan: { status: 'PLANNED', createdById: 'creator', case: { status: 'EXECUTION', asset: { departmentId: 'dep', jurisdictionId: 'jur' } } } });

describe('scoped execution assignment eligibility', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.task.mockResolvedValue(task()); mocks.users.mockResolvedValue([]); mocks.user.mockResolvedValue({ id: 'candidate', name: 'Asha', designation: 'Engineer', employeeCode: 'E-1' }); mocks.updateMany.mockResolvedValue({ count: 1 }); mocks.taskResult.mockResolvedValue({ id: 'task', status: 'ASSIGNED', executionPlan: { status: 'IN_PROGRESS', case: { status: 'EXECUTION' } } }); mocks.plan.mockResolvedValue({ caseId: 'case', status: 'PLANNED' }); mocks.planTasks.mockResolvedValue([{ status: 'ASSIGNED', isMandatory: true }]); mocks.planUpdate.mockResolvedValue({}); });

  it('lists only active same-scope officers with a minimal DTO and deterministic order', async () => {
    await resolveEligibleExecutionAssignees('task', principal);
    expect(mocks.users).toHaveBeenCalledWith({ where: { status: 'ACTIVE', role: 'OFFICER', departmentId: 'dep', jurisdictionId: 'jur' }, select: { id: true, employeeCode: true, name: true, designation: true }, orderBy: [{ name: 'asc' }, { employeeCode: 'asc' }, { id: 'asc' }], take: 101 });
    expect(JSON.stringify(mocks.users.mock.calls[0][0])).not.toMatch(/passwordHash|email|token/i);
  });

  it.each([ExecutionTaskStatus.ASSIGNED, ExecutionTaskStatus.IN_PROGRESS, ExecutionTaskStatus.COMPLETION_SUBMITTED, ExecutionTaskStatus.VERIFIED, ExecutionTaskStatus.CANCELLED])('rejects assignment in %s without changing task progress', async (status) => {
    mocks.task.mockResolvedValue(task(status));
    await expect(resolveEligibleExecutionAssignees('task', principal)).rejects.toMatchObject({ code: 'INVALID_EXECUTION_TASK_STATE', status: 409 });
    expect(mocks.users).not.toHaveBeenCalled(); expect(mocks.updateMany).not.toHaveBeenCalled();
  });

  it('revalidates the selected candidate with the same active officer and exact-scope rule', async () => {
    await assignTask('task', 'candidate', principal);
    expect(mocks.user).toHaveBeenCalledWith({ where: { id: 'candidate', status: 'ACTIVE', role: 'OFFICER', departmentId: 'dep', jurisdictionId: 'jur' }, select: { id: true, employeeCode: true, name: true, designation: true } });
    expect(mocks.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'task', status: 'PENDING' }, data: expect.objectContaining({ assignedToId: 'candidate', assignedById: 'actor', status: 'ASSIGNED' }) }));
  });

  it.each(['inactive officer', 'policy admin', 'auditor', 'system admin', 'cross department', 'cross jurisdiction', 'unknown id'])('fails safely when candidate is %s', async () => {
    mocks.user.mockResolvedValue(null);
    await expect(assignTask('task', 'candidate', principal)).rejects.toMatchObject({ code: 'ASSIGNEE_NOT_ELIGIBLE', status: 404 });
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });
});
