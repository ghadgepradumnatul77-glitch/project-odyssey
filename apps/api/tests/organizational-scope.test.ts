import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  caseFindUnique: vi.fn(),
  inspectionFindFirst: vi.fn(),
  riskFindFirst: vi.fn(),
  orpFindUnique: vi.fn(),
  userFindUnique: vi.fn(),
  transaction: vi.fn()
}));

vi.mock('../src/lib/prisma', () => ({
  default: {
    case: { findUnique: mocks.caseFindUnique },
    inspection: { findFirst: mocks.inspectionFindFirst },
    riskAssessment: { findFirst: mocks.riskFindFirst },
    operationalResponsePlan: { findUnique: mocks.orpFindUnique },
    user: { findUnique: mocks.userFindUnique },
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
  beforeEach(() => vi.clearAllMocks());
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
