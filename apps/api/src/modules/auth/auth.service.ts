import bcrypt from 'bcryptjs';
import { jwtVerify, SignJWT } from 'jose';
import { getAuthConfig } from '../../config/auth';
import prisma from '../../lib/prisma';
import { safeUserSelect } from '../users/user.select';

const INVALID_CREDENTIALS = 'INVALID_CREDENTIALS';
const dummyPasswordHash = bcrypt.hash('odyssey-invalid-credential-placeholder', 12);

export async function authenticateCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  const passwordMatches = await bcrypt.compare(password, user?.passwordHash || await dummyPasswordHash);
  if (!user || !passwordMatches || user.status !== 'ACTIVE') {
    throw new Error(INVALID_CREDENTIALS);
  }

  const config = getAuthConfig();
  const accessToken = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(user.id)
    .setIssuer(config.issuer)
    .setAudience(config.audience)
    .setIssuedAt()
    .setExpirationTime(`${config.accessTtlSeconds}s`)
    .sign(config.secret);

  const safeUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: safeUserSelect });
  return { accessToken, expiresIn: config.accessTtlSeconds, user: safeUser };
}

export async function verifyAccessToken(token: string): Promise<string> {
  const config = getAuthConfig();
  const { payload, protectedHeader } = await jwtVerify(token, config.secret, {
    algorithms: ['HS256'],
    issuer: config.issuer,
    audience: config.audience
  });
  if (protectedHeader.alg !== 'HS256' || typeof payload.sub !== 'string' || !payload.sub) {
    throw new Error('INVALID_TOKEN');
  }
  return payload.sub;
}

export { INVALID_CREDENTIALS };
