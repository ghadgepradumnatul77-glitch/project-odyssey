import express from 'express';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ findUnique: vi.fn(), findUniqueOrThrow: vi.fn() }));
vi.mock('../src/lib/prisma', () => ({
  default: { user: { findUnique: mocks.findUnique, findUniqueOrThrow: mocks.findUniqueOrThrow } }
}));

import { getAuthConfig, resetAuthConfigForTests } from '../src/config/auth';
import { authenticate } from '../src/middleware/authenticate';
import authRoutes from '../src/modules/auth/auth.routes';
import { authenticateCredentials, verifyAccessToken } from '../src/modules/auth/auth.service';

const safeUser = {
  id: 'user-1', employeeCode: 'PWD-EE-001', name: 'Rahul Patil', email: 'rahul@example.test',
  designation: 'Executive Engineer', role: 'OFFICER', status: 'ACTIVE', departmentId: 'dep-1', jurisdictionId: 'jur-1'
};

const app = express();
app.use(express.json());
app.use('/api/v1', authRoutes);
app.get('/protected', authenticate, (req, res) => res.json({ user: req.user }));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';
  process.env.JWT_ISSUER = 'test-issuer';
  process.env.JWT_AUDIENCE = 'test-audience';
  process.env.JWT_ACCESS_TTL_SECONDS = '900';
  resetAuthConfigForTests();
});

async function validToken(subject = 'user-1') {
  const config = getAuthConfig();
  return new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(subject)
    .setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(config.secret);
}

describe('authentication service and endpoints', () => {
  it('fails production configuration for a missing or placeholder secret', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'replace-this-in-development';
    resetAuthConfigForTests();
    expect(() => getAuthConfig()).toThrow(/JWT_SECRET/);
  });

  it('logs in with valid credentials and never returns passwordHash', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 4);
    mocks.findUnique.mockResolvedValue({ ...safeUser, passwordHash });
    mocks.findUniqueOrThrow.mockResolvedValue(safeUser);
    const response = await request(app).post('/api/v1/auth/login').send({ email: ' RAHUL@EXAMPLE.TEST ', password: 'correct-password' }).expect(200);
    expect(response.body.data.tokenType).toBe('Bearer');
    expect(response.body.data.expiresIn).toBe(900);
    expect(response.body.data.user).toEqual(safeUser);
    expect(response.body.data.user).not.toHaveProperty('passwordHash');
  });

  it.each([
    ['wrong password', { ...safeUser, passwordHash: bcrypt.hashSync('correct-password', 4) }, 'wrong-password'],
    ['unknown email', null, 'any-password'],
    ['inactive user', { ...safeUser, status: 'INACTIVE', passwordHash: bcrypt.hashSync('correct-password', 4) }, 'correct-password']
  ])('returns indistinguishable invalid credentials for %s', async (_name, user, password) => {
    mocks.findUnique.mockResolvedValue(user);
    const response = await request(app).post('/api/v1/auth/login').send({ email: safeUser.email, password }).expect(401);
    expect(response.body.error).toEqual({ code: 'INVALID_CREDENTIALS', message: 'The supplied credentials are invalid.' });
  });

  it('returns current database-backed safe user from auth/me', async () => {
    mocks.findUnique.mockResolvedValueOnce({ id: 'user-1', role: 'OFFICER', status: 'ACTIVE', departmentId: 'dep-1', jurisdictionId: 'jur-1' })
      .mockResolvedValueOnce(safeUser);
    const response = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${await validToken()}`).expect(200);
    expect(response.body.data).toEqual(safeUser);
    expect(response.body.data).not.toHaveProperty('passwordHash');
  });

  it('issues a token accepted by configured verification', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 4);
    mocks.findUnique.mockResolvedValue({ ...safeUser, passwordHash });
    mocks.findUniqueOrThrow.mockResolvedValue(safeUser);
    const result = await authenticateCredentials(safeUser.email, 'correct-password');
    await expect(verifyAccessToken(result.accessToken)).resolves.toBe('user-1');
  });

  it.each([
    ['expired', { issuer: 'test-issuer', audience: 'test-audience', expiration: '0s', secret: 'configured' }],
    ['wrong issuer', { issuer: 'wrong', audience: 'test-audience', expiration: '5m', secret: 'configured' }],
    ['wrong audience', { issuer: 'test-issuer', audience: 'wrong', expiration: '5m', secret: 'configured' }],
    ['tampered signature', { issuer: 'test-issuer', audience: 'test-audience', expiration: '5m', secret: 'other' }]
  ])('rejects %s tokens', async (_name, options) => {
    const config = getAuthConfig();
    const secret = options.secret === 'configured' ? config.secret : new TextEncoder().encode('another-secret-with-at-least-thirty-two-chars');
    const token = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject('user-1')
      .setIssuer(options.issuer).setAudience(options.audience).setIssuedAt().setExpirationTime(options.expiration).sign(secret);
    await expect(verifyAccessToken(token)).rejects.toBeTruthy();
  });
});

describe('authentication middleware', () => {
  it('rejects missing and malformed authorization', async () => {
    expect((await request(app).get('/protected').expect(401)).body.error.code).toBe('AUTHENTICATION_REQUIRED');
    expect((await request(app).get('/protected').set('Authorization', 'Basic abc').expect(401)).body.error.code).toBe('INVALID_AUTHENTICATION');
  });

  it('populates req.user from the current database user', async () => {
    mocks.findUnique.mockResolvedValue({ id: 'user-1', role: 'OFFICER', status: 'ACTIVE', departmentId: 'dep-1', jurisdictionId: 'jur-1' });
    const response = await request(app).get('/protected').set('Authorization', `Bearer ${await validToken()}`).expect(200);
    expect(response.body.user).toEqual({ id: 'user-1', role: 'OFFICER', status: 'ACTIVE', departmentId: 'dep-1', jurisdictionId: 'jur-1' });
  });

  it.each([null, { ...safeUser, status: 'INACTIVE' }])('rejects deleted or inactive current users', async (user) => {
    mocks.findUnique.mockResolvedValue(user);
    expect((await request(app).get('/protected').set('Authorization', `Bearer ${await validToken()}`).expect(401)).body.error.code).toBe('INVALID_TOKEN');
  });
});
