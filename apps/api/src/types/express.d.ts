import { SystemRole, UserStatus } from '../generated/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: SystemRole;
        status: UserStatus;
        departmentId: string;
        jurisdictionId: string;
      };
    }
  }
}

export {};
