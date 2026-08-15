import { describe, expect, it } from 'vitest';
import { SystemRole } from '../src/generated/prisma';
import { buildCaseClosureMutationWhere, buildCaseClosureReadWhere } from '../src/security/organizational-scope';

const principal = (role: SystemRole) => ({ id: 'u', role, status: 'ACTIVE' as const, departmentId: 'dep', jurisdictionId: 'jur' });

describe('Case closure organizational scope', () => {
  it.each([SystemRole.OFFICER, SystemRole.AUDITOR, SystemRole.POLICY_ADMIN])('scopes %s reads through Case Asset', (role) => {
    expect(buildCaseClosureReadWhere(principal(role))).toEqual({ case: { asset: { departmentId: 'dep', jurisdictionId: 'jur' } } });
  });

  it('gives SYSTEM_ADMIN global reads but never a mutation bypass', () => {
    expect(buildCaseClosureReadWhere(principal(SystemRole.SYSTEM_ADMIN))).toEqual({});
    expect(buildCaseClosureMutationWhere(principal(SystemRole.SYSTEM_ADMIN))).toEqual({ case: { asset: { departmentId: 'dep', jurisdictionId: 'jur' } } });
  });
});
