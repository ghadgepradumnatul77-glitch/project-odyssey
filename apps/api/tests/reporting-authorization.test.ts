import { describe, expect, it } from 'vitest';
import { buildCaseReadWhere } from '../src/security/organizational-scope';
describe('reporting organizational authorization', () => {
  it.each(['OFFICER','AUDITOR','POLICY_ADMIN'] as const)('scopes %s through Case to Asset department and jurisdiction', (role) => expect(buildCaseReadWhere({ id: 'u', role, status: 'ACTIVE', departmentId: 'dep-A', jurisdictionId: 'jur-A' })).toEqual({ asset: { departmentId: 'dep-A', jurisdictionId: 'jur-A' } }));
  it('gives SYSTEM_ADMIN global read visibility without mutation permission', () => expect(buildCaseReadWhere({ id: 'u', role: 'SYSTEM_ADMIN', status: 'ACTIVE', departmentId: 'dep-A', jurisdictionId: 'jur-A' })).toEqual({}));
});
