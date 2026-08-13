import { NextFunction, Request, Response } from 'express';
import { SystemRole } from '../generated/prisma';

export function requireRole(...roles: SystemRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      console.warn('Security: administrative authorization rejected.', { userId: req.user?.id });
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not authorized to perform this operation.' }
      });
    }
    return next();
  };
}
