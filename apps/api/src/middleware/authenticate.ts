import { NextFunction, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { verifyAccessToken } from '../modules/auth/auth.service';

function authenticationError(res: Response, code: string, message: string) {
  return res.status(401).json({ success: false, error: { code, message } });
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization');
  if (!header) {
    console.warn('Security: authentication rejected (credentials missing).');
    return authenticationError(res, 'AUTHENTICATION_REQUIRED', 'Authentication is required.');
  }

  const match = /^Bearer ([^\s]+)$/.exec(header);
  if (!match) {
    console.warn('Security: authentication rejected (malformed credentials).');
    return authenticationError(res, 'INVALID_AUTHENTICATION', 'The authentication credentials are malformed.');
  }

  try {
    const userId = await verifyAccessToken(match[1]);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, status: true, departmentId: true, jurisdictionId: true }
    });
    if (!user || user.status !== 'ACTIVE') throw new Error('INVALID_CURRENT_USER');
    req.user = user;
    return next();
  } catch {
    console.warn('Security: authentication rejected (invalid token or current user).');
    return authenticationError(res, 'INVALID_TOKEN', 'The access token is invalid or expired.');
  }
}
