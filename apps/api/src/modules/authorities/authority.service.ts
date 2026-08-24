import prisma from '../../lib/prisma';
import { PriorityLevel } from '../../generated/prisma';
import { WorkflowError } from '../decisions/workflow-error';
import { pageFromRows, type StableCursor } from '../../lib/pagination';
import type { OrganizationalPrincipal } from '../../security/organizational-scope';
import { appendIntegrityEvent } from '../integrity/integrity.service';

export interface CreateAuthorityInput {
  userId: string;
  departmentId: string;
  jurisdictionId: string;
  canApprove?: boolean;
  canReject?: boolean;
  canRequestModification?: boolean;
  canRequestReinspection?: boolean;
  canEscalate?: boolean;
  canCloseCase?: boolean;
  maxPriorityLevel?: PriorityLevel | null;
  validFrom?: Date | null;
  validUntil?: Date | null;
}

export async function createApprovalAuthority(input: CreateAuthorityInput, principal: OrganizationalPrincipal) {
  const [user, department, jurisdiction] = await Promise.all([
    prisma.user.findUnique({ where: { id: input.userId } }),
    prisma.department.findUnique({ where: { id: input.departmentId } }),
    prisma.jurisdiction.findUnique({ where: { id: input.jurisdictionId } })
  ]);

  if (!user) throw new WorkflowError('USER_NOT_FOUND', 404, 'User not found.');
  if (!department) throw new WorkflowError('DEPARTMENT_NOT_FOUND', 404, 'Department not found.');
  if (!jurisdiction) throw new WorkflowError('JURISDICTION_NOT_FOUND', 404, 'Jurisdiction not found.');
  if (jurisdiction.departmentId !== department.id) {
    throw new WorkflowError('JURISDICTION_DEPARTMENT_MISMATCH', 400, 'Jurisdiction does not belong to the department.');
  }
  if (user.departmentId !== department.id) {
    throw new WorkflowError('USER_DEPARTMENT_MISMATCH', 400, 'User does not belong to the department.');
  }
  if (user.jurisdictionId !== jurisdiction.id) {
    throw new WorkflowError('USER_JURISDICTION_MISMATCH', 400, 'User does not belong to the jurisdiction.');
  }
  if (input.validFrom && input.validUntil && input.validFrom > input.validUntil) {
    throw new WorkflowError('INVALID_VALIDITY_PERIOD', 400, 'validFrom must not be after validUntil.');
  }

  return prisma.$transaction(async (tx) => {
    const duplicate = await tx.approvalAuthority.findFirst({ where: { userId: user.id, departmentId: department.id, jurisdictionId: jurisdiction.id, isActive: true } });
    if (duplicate) throw new WorkflowError('ACTIVE_AUTHORITY_EXISTS', 409, 'An active authority grant already exists for this user and scope.');
    const created = await tx.approvalAuthority.create({
      data: {
        ...input,
        canApprove: input.canApprove ?? false,
        canReject: input.canReject ?? false,
        canRequestModification: input.canRequestModification ?? false,
        canRequestReinspection: input.canRequestReinspection ?? false,
        canEscalate: input.canEscalate ?? false,
        canCloseCase: input.canCloseCase ?? false
      },
      include: {
        user: { select: { id: true, name: true, employeeCode: true, designation: true, role: true, status: true } },
        department: { select: { id: true, name: true, code: true } },
        jurisdiction: { select: { id: true, name: true, type: true } }
      }
    });
    await appendIntegrityEvent(tx, {
      eventType: 'APPROVAL_AUTHORITY_GRANTED', sourceEventKey: `APPROVAL_AUTHORITY_GRANT:${created.id}`,
      resourceType: 'ApprovalAuthority', resourceId: created.id, actor: principal,
      departmentId: created.departmentId, jurisdictionId: created.jurisdictionId, occurredAt: created.createdAt,
      facts: { grantId: created.id, officerId: created.userId, canApprove: created.canApprove, canReject: created.canReject, canRequestModification: created.canRequestModification, canRequestReinspection: created.canRequestReinspection, canEscalate: created.canEscalate, canCloseCase: created.canCloseCase, maxPriorityLevel: created.maxPriorityLevel, validFrom: created.validFrom?.toISOString() ?? null, validUntil: created.validUntil?.toISOString() ?? null, isActive: created.isActive }
    });
    return created;
  }, { isolationLevel: 'Serializable' });
}

export async function listApprovalAuthorities(options: { limit: number; cursor?: StableCursor; active?: boolean; search?: string; departmentId?: string; jurisdictionId?: string }) {
  const rows=await prisma.approvalAuthority.findMany({
    where:{...(options.active===undefined?{}:{isActive:options.active}),...(options.departmentId?{departmentId:options.departmentId}:{}),...(options.jurisdictionId?{jurisdictionId:options.jurisdictionId}:{}),AND:[options.cursor?{OR:[{createdAt:{lt:new Date(options.cursor.at)}},{createdAt:new Date(options.cursor.at),id:{lt:options.cursor.id}}]}:{},options.search?{OR:[{user:{is:{OR:[{name:{contains:options.search,mode:'insensitive'}},{employeeCode:{contains:options.search,mode:'insensitive'}},{designation:{contains:options.search,mode:'insensitive'}}]}}},{department:{is:{name:{contains:options.search,mode:'insensitive'}}}},{jurisdiction:{is:{name:{contains:options.search,mode:'insensitive'}}}}]}:{}]},
    include: {
      user: { select: { id: true, name: true, employeeCode: true, designation: true, role: true, status: true } },
      department: { select: { id: true, name: true, code: true } },
      jurisdiction: { select: { id: true, name: true, type: true } }
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],take:options.limit+1
  });
  return pageFromRows(rows,options.limit,(item)=>item.createdAt.toISOString());
}
