import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  caseFindUnique: vi.fn(),
  inspectionFindFirst: vi.fn(),
  riskFindFirst: vi.fn(),
  orpFindUnique: vi.fn(),
  userFindUnique: vi.fn(),
  departmentCount: vi.fn(),
  jurisdictionCount: vi.fn(),
  transaction: vi.fn()
}));

vi.mock('../src/lib/prisma', () => ({
  default: {
    case: { findUnique: mocks.caseFindUnique },
    inspection: { findFirst: mocks.inspectionFindFirst },
    riskAssessment: { findFirst: mocks.riskFindFirst },
    operationalResponsePlan: { findUnique: mocks.orpFindUnique },
    user: { findUnique: mocks.userFindUnique },
    department: { count: mocks.departmentCount },
    jurisdiction: { count: mocks.jurisdictionCount },
    $transaction: mocks.transaction
  }
}));
import { OrpDecisionType, SystemRole, UserStatus } from '../src/generated/prisma';
import {
  buildAssetReadWhere,
  buildCaseMutationWhere,
  buildCaseReadWhere,
  buildDecisionReadWhere,
  buildInspectionReadWhere,
  buildOrpReadWhere,
  buildRiskAssessmentReadWhere,
  assertOperationalCaseScope,
  assertGovernanceCreateScope,
  assertGovernanceEntityMutationScope,
  buildGovernanceRegistryReadWhere,
  canMutateGovernanceScope,
  defaultGovernanceCreateScope,
  governanceScopeAppliesToTarget,
  hasGlobalReadVisibility,
  isSameOrganizationalScope,
  OrganizationalPrincipal
} from '../src/security/organizational-scope';
import { runAssessmentForCase } from '../src/modules/risk/risk.service';
import { createORPForCase } from '../src/modules/orp/orp.service';
import { submitOrpDecision } from '../src/modules/decisions/decision.service';

function principal(role: SystemRole, departmentId = 'dep-A', jurisdictionId = 'jur-A'): OrganizationalPrincipal {
  return { id: `user-${role}`, role, status: UserStatus.ACTIVE, departmentId, jurisdictionId };
}

describe('centralized organizational scope policy', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.departmentCount.mockResolvedValue(1); mocks.jurisdictionCount.mockResolvedValue(1); });
  it('defaults omitted POLICY_ADMIN creation to exact actor scope while preserving SYSTEM_ADMIN global creation',()=>{expect(defaultGovernanceCreateScope({},principal(SystemRole.POLICY_ADMIN))).toEqual({departmentId:'dep-A',jurisdictionId:'jur-A'});expect(defaultGovernanceCreateScope({},principal(SystemRole.SYSTEM_ADMIN))).toEqual({});expect(defaultGovernanceCreateScope({departmentId:'dep-A',jurisdictionId:null},principal(SystemRole.POLICY_ADMIN))).toEqual({departmentId:'dep-A',jurisdictionId:null});});
  it.each([
    ['dep-A', 'jur-A', true],
    ['dep-A', 'jur-B', false],
    ['dep-B', 'jur-A', false],
    ['dep-B', 'jur-B', false]
  ])('requires both dimensions: %s/%s => %s', (departmentId, jurisdictionId, allowed) => {
    expect(isSameOrganizationalScope(principal(SystemRole.OFFICER), { departmentId, jurisdictionId })).toBe(allowed);
  });

  it.each([SystemRole.OFFICER, SystemRole.AUDITOR, SystemRole.POLICY_ADMIN])(
    'builds database predicates for scoped %s reads',
    (role) => {
      const actor = principal(role);
      const asset = { departmentId: 'dep-A', jurisdictionId: 'jur-A' };
      expect(buildAssetReadWhere(actor)).toEqual(asset);
      expect(buildCaseReadWhere(actor)).toEqual({ asset });
      expect(buildInspectionReadWhere(actor)).toEqual({ case: { asset } });
      expect(buildRiskAssessmentReadWhere(actor)).toEqual({ case: { asset } });
      expect(buildOrpReadWhere(actor)).toEqual({ case: { asset } });
      expect(buildDecisionReadWhere(actor)).toEqual({ case: { asset } });
    }
  );

  it('makes SYSTEM_ADMIN global read visibility explicit', () => {
    const admin = principal(SystemRole.SYSTEM_ADMIN);
    expect(hasGlobalReadVisibility(admin)).toBe(true);
    expect(buildAssetReadWhere(admin)).toEqual({});
    expect(buildCaseReadWhere(admin)).toEqual({});
    expect(buildInspectionReadWhere(admin)).toEqual({});
    expect(buildOrpReadWhere(admin)).toEqual({});
  });

  it('does not give SYSTEM_ADMIN a mutation-scope bypass', () => {
    expect(buildCaseMutationWhere(principal(SystemRole.SYSTEM_ADMIN))).toEqual({
      asset: { departmentId: 'dep-A', jurisdictionId: 'jur-A' }
    });
  });

  it('separates applicable governance reads from governance write authority', () => {
    const actor = principal(SystemRole.POLICY_ADMIN);
    expect(buildGovernanceRegistryReadWhere(actor)).toEqual({ OR: [
      { departmentId: null, jurisdictionId: null },
      { departmentId: 'dep-A', jurisdictionId: null },
      { departmentId: 'dep-A', jurisdictionId: 'jur-A' }
    ] });
    expect(canMutateGovernanceScope(actor, { departmentId: null, jurisdictionId: null })).toBe(false);
    expect(canMutateGovernanceScope(actor, { departmentId: 'dep-A', jurisdictionId: null })).toBe(true);
    expect(canMutateGovernanceScope(actor, { departmentId: 'dep-A', jurisdictionId: 'jur-A' })).toBe(true);
  });

  it('preserves global governance administration for SYSTEM_ADMIN', async () => {
    const actor = principal(SystemRole.SYSTEM_ADMIN);
    expect(buildGovernanceRegistryReadWhere(actor)).toEqual({});
    expect(canMutateGovernanceScope(actor, { departmentId: null, jurisdictionId: null })).toBe(true);
    await expect(assertGovernanceCreateScope(actor)).resolves.toEqual({ departmentId: null, jurisdictionId: null });
  });

  it.each([
    [undefined, undefined],
    ['dep-B', undefined],
    ['dep-A', 'jur-B'],
    [undefined, 'jur-A']
  ])('denies POLICY_ADMIN forged governance scope %s/%s without existence leakage', async (departmentId, jurisdictionId) => {
    await expect(assertGovernanceCreateScope(principal(SystemRole.POLICY_ADMIN), departmentId, jurisdictionId))
      .rejects.toMatchObject({ message: 'GOVERNANCE_RESOURCE_NOT_FOUND' });
  });

  it('accepts own department-wide and own-jurisdiction governance scopes', async () => {
    const actor = principal(SystemRole.POLICY_ADMIN);
    await expect(assertGovernanceCreateScope(actor, 'dep-A')).resolves.toEqual({ departmentId: 'dep-A', jurisdictionId: null });
    await expect(assertGovernanceCreateScope(actor, 'dep-A', 'jur-A')).resolves.toEqual({ departmentId: 'dep-A', jurisdictionId: 'jur-A' });
  });

  it('derives ID-based mutation authority from the server-loaded target', () => {
    const actor = principal(SystemRole.POLICY_ADMIN);
    expect(() => assertGovernanceEntityMutationScope(actor, { departmentId: 'dep-B', jurisdictionId: 'jur-B' }))
      .toThrow('GOVERNANCE_RESOURCE_NOT_FOUND');
    expect(() => assertGovernanceEntityMutationScope(actor, { departmentId: null, jurisdictionId: null }))
      .toThrow('GOVERNANCE_RESOURCE_NOT_FOUND');
  });

  it('allows only equally or more broadly scoped references to govern a target', () => {
    expect(governanceScopeAppliesToTarget({ departmentId: null, jurisdictionId: null }, { departmentId: 'dep-A', jurisdictionId: 'jur-A' })).toBe(true);
    expect(governanceScopeAppliesToTarget({ departmentId: 'dep-A', jurisdictionId: null }, { departmentId: 'dep-A', jurisdictionId: 'jur-A' })).toBe(true);
    expect(governanceScopeAppliesToTarget({ departmentId: 'dep-A', jurisdictionId: 'jur-B' }, { departmentId: 'dep-A', jurisdictionId: 'jur-A' })).toBe(false);
    expect(governanceScopeAppliesToTarget({ departmentId: 'dep-B', jurisdictionId: null }, { departmentId: 'dep-A', jurisdictionId: 'jur-A' })).toBe(false);
  });

  it.each([
    ['dep-A', 'jur-A', true],
    ['dep-A', 'jur-B', false],
    ['dep-B', 'jur-A', false],
    ['dep-B', 'jur-B', false]
  ])('asserts service-boundary Case scope for %s/%s', async (departmentId, jurisdictionId, allowed) => {
    mocks.caseFindUnique.mockResolvedValue({
      id: 'case-A',
      asset: { departmentId: 'dep-A', jurisdictionId: 'jur-A' }
    });
    const operation = assertOperationalCaseScope(
      'case-A',
      principal(SystemRole.OFFICER, departmentId, jurisdictionId)
    );
    if (allowed) await expect(operation).resolves.toMatchObject({ id: 'case-A' });
    else await expect(operation).rejects.toMatchObject({ code: 'CASE_NOT_FOUND' });
    expect(mocks.caseFindUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        id: 'case-A',
        AND: [{ asset: { departmentId, jurisdictionId } }]
      })
    }));
  });

  it('denies risk and ORP work before loading workflow inputs', async () => {
    mocks.caseFindUnique.mockResolvedValue({
      id: 'case-A', status: 'ORP_READY', asset: { departmentId: 'dep-B', jurisdictionId: 'jur-B' }
    });
    const actor = principal(SystemRole.OFFICER);
    await expect(runAssessmentForCase('case-A', actor)).rejects.toMatchObject({ code: 'CASE_NOT_FOUND' });
    await expect(createORPForCase('case-A', actor)).rejects.toMatchObject({ code: 'CASE_NOT_FOUND' });
    expect(mocks.inspectionFindFirst).not.toHaveBeenCalled();
    expect(mocks.riskFindFirst).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it('denies a cross-scope decision before reviewer or authority evaluation', async () => {
    mocks.orpFindUnique.mockResolvedValue(null);
    await expect(submitOrpDecision('orp-B', principal(SystemRole.OFFICER), {
      decisionType: OrpDecisionType.APPROVED
    })).rejects.toMatchObject({ code: 'ORP_NOT_FOUND', status: 404 });
    expect(mocks.orpFindUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        id: 'orp-B',
        AND: [{ case: { asset: { departmentId: 'dep-A', jurisdictionId: 'jur-A' } } }]
      }
    }));
    expect(mocks.userFindUnique).not.toHaveBeenCalled();
  });
});
