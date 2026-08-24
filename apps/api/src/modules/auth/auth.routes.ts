import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import prisma from '../../lib/prisma';
import { authenticate } from '../../middleware/authenticate';
import { authenticateCredentials, INVALID_CREDENTIALS } from './auth.service';
import { safeUserSelect } from '../users/user.select';
import { getRuntimeConfig } from '../../config/runtime';

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: getRuntimeConfig().environment === 'test' ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({
    success: false,
    error: { code: 'AUTH_RATE_LIMITED', message: 'Too many authentication attempts. Please try again later.' }
  })
});

router.post('/auth/login', loginLimiter, async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!email || !password) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'email and password are required.' } });
  }

  try {
    const result = await authenticateCredentials(email, password);
    console.info('Security: login succeeded.', { userId: result.user.id });
    return res.status(200).json({
      success: true,
      data: { accessToken: result.accessToken, tokenType: 'Bearer', expiresIn: result.expiresIn, user: result.user }
    });
  } catch (error) {
    if (error instanceof Error && error.message === INVALID_CREDENTIALS) {
      console.warn('Security: login failed.');
      return res.status(401).json({ success: false, error: { code: INVALID_CREDENTIALS, message: 'The supplied credentials are invalid.' } });
    }
    console.error('Authentication failed unexpectedly:', error);
    return res.status(500).json({ success: false, error: { code: 'AUTHENTICATION_FAILED', message: 'Authentication could not be completed.' } });
  }
});

router.get('/auth/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: safeUserSelect });
  if (!user || user.status !== 'ACTIVE') {
    return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'The access token is invalid or expired.' } });
  }
  return res.status(200).json({ success: true, data: user });
});

export default router;
