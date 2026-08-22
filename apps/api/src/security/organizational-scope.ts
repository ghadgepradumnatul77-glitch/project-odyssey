import { Prisma, SystemRole, UserStatus } from '../generated/prisma';
import prisma from '../lib/prisma';

export interface OrganizationalPrincipal {
  id: string;
  role: SystemRole;
  status: UserStatus;
  departmentId: string;
  jurisdictionId: string;
}

export interface OrganizationalScope {
  departmentId: string;
  jurisdictionId: string;
}

export interface GovernanceRegistryScope {
  departmentId: string | null;
  jurisdictionId: string | null;
}

export function defaultGovernanceCreateScope<T extends { departmentId?: string | null; jurisdictionId?: string | null }>(input: T, principal: OrganizationalPrincipal): T {
  if (principal.role !== SystemRole.POLICY_ADMIN || input.departmentId !== undefined || input.jurisdictionId !== undefined) return input;
  return { ...input, departmentId: principal.departmentId, jurisdictionId: principal.jurisdictionId };
}

export class GovernanceResourceNotFoundError extends Error {
  constructor() {
    super('GOVERNANCE_RESOURCE_NOT_FOUND');
    this.name = 'GovernanceResourceNotFoundError';
  }
}

export class ScopedResourceNotFoundError extends Error {
  constructor(public readonly code: 'ASSET_NOT_FOUND' | 'CASE_NOT_FOUND' | 'ORP_NOT_FOUND') {
    super(code);
    this.name = 'ScopedResourceNotFoundError';
  }
}

export function isSameOrganizationalScope(
  principal: Pick<OrganizationalPrincipal, 'departmentId' | 'jurisdictionId'>,
  resource: OrganizationalScope
): boolean {
  return principal.departmentId === resource.departmentId &&
    principal.jurisdictionId === resource.jurisdictionId;
}

export function hasGlobalReadVisibility(principal: OrganizationalPrincipal): boolean {
  return principal.role === SystemRole.SYSTEM_ADMIN;
}

/** Global governance records are readable by scoped policy administrators because they apply to every scope. */
export function buildGovernanceRegistryReadWhere(principal: OrganizationalPrincipal) {
  if (principal.role === SystemRole.SYSTEM_ADMIN) return {};
  return {
    OR: [
      { departmentId: null, jurisdictionId: null },
      { departmentId: principal.departmentId, jurisdictionId: null },
      { departmentId: principal.departmentId, jurisdictionId: principal.jurisdictionId }
    ]
  };
}

export function canMutateGovernanceScope(
  principal: OrganizationalPrincipal,
  target: GovernanceRegistryScope
): boolean {
  if (principal.role === SystemRole.SYSTEM_ADMIN) return true;
  if (principal.role !== SystemRole.POLICY_ADMIN || target.departmentId !== principal.departmentId) return false;
  return target.jurisdictionId === null || target.jurisdictionId === principal.jurisdictionId;
}

/** A global source applies everywhere; department-wide applies below that department; jurisdiction scope is exact. */
export function governanceScopeAppliesToTarget(
  source: GovernanceRegistryScope,
  target: GovernanceRegistryScope
): boolean {
  if (source.departmentId === null) return source.jurisdictionId === null;
  if (source.departmentId !== target.departmentId) return false;
  return source.jurisdictionId === null || source.jurisdictionId === target.jurisdictionId;
}

export function assertGovernanceEntityMutationScope(
  principal: OrganizationalPrincipal,
  target: GovernanceRegistryScope | null | undefined
) {
  if (!target || !canMutateGovernanceScope(principal, target)) throw new GovernanceResourceNotFoundError();
  return target;
}

export async function assertGovernanceCreateScope(
  principal: OrganizationalPrincipal,
  departmentId?: string | null,
  jurisdictionId?: string | null
): Promise<GovernanceRegistryScope> {
  const target = { departmentId: departmentId ?? null, jurisdictionId: jurisdictionId ?? null };
  if (!canMutateGovernanceScope(principal, target) || (target.jurisdictionId !== null && target.departmentId === null)) {
    throw new GovernanceResourceNotFoundError();
  }
  const exists = target.jurisdictionId !== null
    ? await prisma.jurisdiction.count({ where: { id: target.jurisdictionId, departmentId: target.departmentId! } })
    : target.departmentId !== null
      ? await prisma.department.count({ where: { id: target.departmentId } })
      : 1;
  if (!exists) throw new GovernanceResourceNotFoundError();
  return target;
}

function assetScope(principal: OrganizationalPrincipal): Prisma.AssetWhereInput {
  return { departmentId: principal.departmentId, jurisdictionId: principal.jurisdictionId };
}

export function buildAssetReadWhere(principal: OrganizationalPrincipal): Prisma.AssetWhereInput {
  return hasGlobalReadVisibility(principal) ? {} : assetScope(principal);
}

export function buildCaseReadWhere(principal: OrganizationalPrincipal): Prisma.CaseWhereInput {
  return hasGlobalReadVisibility(principal) ? {} : { asset: assetScope(principal) };
}

export function buildInspectionReadWhere(principal: OrganizationalPrincipal): Prisma.InspectionWhereInput {
  return hasGlobalReadVisibility(principal) ? {} : { case: { asset: assetScope(principal) } };
}

export function buildRiskAssessmentReadWhere(principal: OrganizationalPrincipal): Prisma.RiskAssessmentWhereInput {
  return hasGlobalReadVisibility(principal) ? {} : { case: { asset: assetScope(principal) } };
}

export function buildOrpReadWhere(principal: OrganizationalPrincipal): Prisma.OperationalResponsePlanWhereInput {
  return hasGlobalReadVisibility(principal) ? {} : { case: { asset: assetScope(principal) } };
}

export function buildDecisionReadWhere(principal: OrganizationalPrincipal): Prisma.OrpDecisionWhereInput {
  return hasGlobalReadVisibility(principal) ? {} : { case: { asset: assetScope(principal) } };
}

export function buildExecutionPlanReadWhere(principal: OrganizationalPrincipal): Prisma.ExecutionPlanWhereInput {
  return hasGlobalReadVisibility(principal) ? {} : { case: { asset: assetScope(principal) } };
}

export function buildExecutionTaskReadWhere(principal: OrganizationalPrincipal): Prisma.ExecutionTaskWhereInput {
  return hasGlobalReadVisibility(principal) ? {} : { executionPlan: { case: { asset: assetScope(principal) } } };
}

export function buildExecutionEvidenceReadWhere(principal: OrganizationalPrincipal): Prisma.ExecutionEvidenceWhereInput {
  return hasGlobalReadVisibility(principal) ? {} : { executionTask: { executionPlan: { case: { asset: assetScope(principal) } } } };
}

export function buildCaseClosureReadWhere(principal: OrganizationalPrincipal): Prisma.CaseClosureWhereInput {
  return hasGlobalReadVisibility(principal) ? {} : { case: { asset: assetScope(principal) } };
}

export function buildCaseClosureMutationWhere(principal: OrganizationalPrincipal): Prisma.CaseClosureWhereInput {
  return { case: { asset: assetScope(principal) } };
}

export function buildExecutionPlanMutationWhere(principal: OrganizationalPrincipal): Prisma.ExecutionPlanWhereInput {
  return { case: { asset: assetScope(principal) } };
}

export function buildExecutionTaskMutationWhere(principal: OrganizationalPrincipal): Prisma.ExecutionTaskWhereInput {
  return { executionPlan: { case: { asset: assetScope(principal) } } };
}

export function buildAssetMutationWhere(principal: OrganizationalPrincipal): Prisma.AssetWhereInput {
  return assetScope(principal);
}

export function buildCaseMutationWhere(principal: OrganizationalPrincipal): Prisma.CaseWhereInput {
  return { asset: assetScope(principal) };
}

export function buildOrpMutationWhere(principal: OrganizationalPrincipal): Prisma.OperationalResponsePlanWhereInput {
  return { case: { asset: assetScope(principal) } };
}

export async function assertVisibleAsset(assetId: string, principal: OrganizationalPrincipal) {
  const asset = await prisma.asset.findUnique({ where: { id: assetId, AND: [buildAssetReadWhere(principal)] } });
  if (!asset) throw new ScopedResourceNotFoundError('ASSET_NOT_FOUND');
  return asset;
}

export async function assertCaseCreationAsset(assetId: string, principal: OrganizationalPrincipal) {
  const scope = principal.role === SystemRole.SYSTEM_ADMIN ? {} : buildAssetMutationWhere(principal);
  const asset = await prisma.asset.findUnique({ where: { id: assetId, AND: [scope] } });
  if (!asset) throw new ScopedResourceNotFoundError('ASSET_NOT_FOUND');
  return asset;
}

export async function assertVisibleCase(caseId: string, principal: OrganizationalPrincipal) {
  const targetCase = await prisma.case.findUnique({ where: { id: caseId, AND: [buildCaseReadWhere(principal)] } });
  if (!targetCase) throw new ScopedResourceNotFoundError('CASE_NOT_FOUND');
  return targetCase;
}

export async function assertOperationalCaseScope(caseId: string, principal: OrganizationalPrincipal) {
  const targetCase = await prisma.case.findUnique({
    where: { id: caseId, AND: [buildCaseMutationWhere(principal)] },
    include: { asset: true }
  });
  if (!targetCase || !isSameOrganizationalScope(principal, targetCase.asset)) {
    throw new ScopedResourceNotFoundError('CASE_NOT_FOUND');
  }
  return targetCase;
}

export async function assertVisibleOrp(orpId: string, principal: OrganizationalPrincipal) {
  const orp = await prisma.operationalResponsePlan.findUnique({
    where: { id: orpId, AND: [buildOrpReadWhere(principal)] },
    include: { case: { include: { asset: true } } }
  });
  if (!orp) throw new ScopedResourceNotFoundError('ORP_NOT_FOUND');
  return orp;
}
