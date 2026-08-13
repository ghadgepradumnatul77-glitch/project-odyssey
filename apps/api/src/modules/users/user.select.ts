import { Prisma } from '../../generated/prisma';

export const safeUserSelect = {
  id: true,
  employeeCode: true,
  name: true,
  email: true,
  designation: true,
  role: true,
  status: true,
  departmentId: true,
  jurisdictionId: true
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>;
