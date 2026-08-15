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
