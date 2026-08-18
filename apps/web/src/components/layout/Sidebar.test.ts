import { describe, expect, it } from 'vitest';
import { navigationForRole } from './Sidebar';
describe('role-aware navigation', () => {
  it.each(['OFFICER', 'AUDITOR', 'POLICY_ADMIN'] as const)('keeps %s navigation non-administrative', (role) => expect(navigationForRole(role).map((item) => item.label)).toEqual(['Dashboard', 'Cases']));
  it('shows Administration only to SYSTEM_ADMIN', () => expect(navigationForRole('SYSTEM_ADMIN').map((item) => item.label)).toEqual(['Dashboard', 'Cases', 'Administration']));
});
