import { describe, expect, it } from 'vitest';
import { CaseClosureReason, ExecutionTaskStatus } from '../src/generated/prisma';
import {
  closureTaskPreconditionError,
  isExactClosureRetry
} from '../src/modules/closures/case-closure.service';

const principal = {
  id: 'closer', role: 'OFFICER', status: 'ACTIVE', departmentId: 'dep', jurisdictionId: 'jur'
} as const;

function task(status: ExecutionTaskStatus, overrides: Record<string, unknown> = {}) {
  return {
    isMandatory: true,
    status,
    assignedToId: 'executor',
    completionSubmittedById: 'executor',
    verifiedById: 'verifier',
    evidence: [{ id: 'evidence' }],
    ...overrides
  };
}

describe('Case closure invariants', () => {
  it('accepts independently verified mandatory work', () => {
    expect(closureTaskPreconditionError([task(ExecutionTaskStatus.VERIFIED)], 'closer')).toBeNull();
  });

  it.each([
    ExecutionTaskStatus.PENDING,
    ExecutionTaskStatus.ASSIGNED,
    ExecutionTaskStatus.IN_PROGRESS,
    ExecutionTaskStatus.BLOCKED,
    ExecutionTaskStatus.COMPLETION_SUBMITTED,
    ExecutionTaskStatus.CANCELLED
  ])('rejects mandatory task state %s', (status) => {
    expect(closureTaskPreconditionError([task(status)], 'closer')).toBe('CLOSURE_PRECONDITIONS_NOT_MET');
  });

  it('rejects missing evidence and invalid historical four-eyes data', () => {
    expect(closureTaskPreconditionError([task(ExecutionTaskStatus.VERIFIED, { evidence: [] })], 'closer')).toBe('CLOSURE_PRECONDITIONS_NOT_MET');
    expect(closureTaskPreconditionError([task(ExecutionTaskStatus.VERIFIED, { verifiedById: 'executor' })], 'closer')).toBe('CLOSURE_PRECONDITIONS_NOT_MET');
  });

  it('rejects a mandatory executor or completion submitter as closer', () => {
    expect(closureTaskPreconditionError([task(ExecutionTaskStatus.VERIFIED)], 'executor')).toBe('FORBIDDEN');
  });

  it('allows a mandatory verifier to close', () => {
    expect(closureTaskPreconditionError([task(ExecutionTaskStatus.VERIFIED)], 'verifier')).toBeNull();
  });

  it.each([ExecutionTaskStatus.VERIFIED, ExecutionTaskStatus.CANCELLED])('accepts optional terminal state %s', (status) => {
    expect(closureTaskPreconditionError([
      task(ExecutionTaskStatus.VERIFIED),
      task(status, { isMandatory: false })
    ], 'closer')).toBeNull();
  });

  it.each([
    ExecutionTaskStatus.PENDING,
    ExecutionTaskStatus.ASSIGNED,
    ExecutionTaskStatus.IN_PROGRESS,
    ExecutionTaskStatus.BLOCKED,
    ExecutionTaskStatus.COMPLETION_SUBMITTED
  ])('rejects optional active state %s', (status) => {
    expect(closureTaskPreconditionError([
      task(ExecutionTaskStatus.VERIFIED),
      task(status, { isMandatory: false })
    ], 'closer')).toBe('CLOSURE_PRECONDITIONS_NOT_MET');
  });

  it('recognizes only exact immutable retries', () => {
    const closure = { closedById: 'closer', closureReason: CaseClosureReason.EXECUTION_VERIFIED, closureSummary: 'done' };
    const input = { closureReason: CaseClosureReason.EXECUTION_VERIFIED, closureSummary: 'done' };
    expect(isExactClosureRetry(closure, principal, input)).toBe(true);
    expect(isExactClosureRetry({ ...closure, closureSummary: 'different' }, principal, input)).toBe(false);
    expect(isExactClosureRetry(closure, { ...principal, id: 'other' }, input)).toBe(false);
  });
});
