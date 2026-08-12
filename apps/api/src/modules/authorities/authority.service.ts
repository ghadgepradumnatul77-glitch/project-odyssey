import prisma from '../../lib/prisma';
import { PriorityLevel } from '../../generated/prisma';
import { WorkflowError } from '../decisions/workflow-error';

export interface CreateAuthorityInput {
  userId: string;
  departmentId: string;
  jurisdictionId: string;
  canApprove?: boolean;
  canReject?: boolean;
  canRequestModification?: boolean;
  canRequestReinspection?: boolean;
  canEscalate?: boolean;
  maxPriorityLevel?: PriorityLevel | null;
  validFrom?: Date | null;
  validUntil?: Date | null;
}

export async function createApprovalAuthority(input: CreateAuthorityInput) {
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

  const duplicate = await prisma.approvalAuthority.findFirst({
    where: {
      userId: user.id,
      departmentId: department.id,
      jurisdictionId: jurisdiction.id,
      isActive: true
    }
  });
  if (duplicate) {
    throw new WorkflowError('ACTIVE_AUTHORITY_EXISTS', 409, 'An active authority grant already exists for this user and scope.');
  }

  return prisma.approvalAuthority.create({
    data: {
      ...input,
      canApprove: input.canApprove ?? false,
      canReject: input.canReject ?? false,
      canRequestModification: input.canRequestModification ?? false,
      canRequestReinspection: input.canRequestReinspection ?? false,
      canEscalate: input.canEscalate ?? false
    },
    include: {
      user: { select: { id: true, name: true, employeeCode: true, designation: true, role: true, status: true } },
      department: { select: { id: true, name: true, code: true } },
      jurisdiction: { select: { id: true, name: true, type: true } }
    }
  });
}

export function listApprovalAuthorities() {
  return prisma.approvalAuthority.findMany({
    include: {
      user: { select: { id: true, name: true, employeeCode: true, designation: true, role: true, status: true } },
      department: { select: { id: true, name: true, code: true } },
      jurisdiction: { select: { id: true, name: true, type: true } }
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }]
  });
}
