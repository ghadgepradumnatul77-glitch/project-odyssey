import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/prisma', () => ({ default: {} }));
import { app } from '../src/server';
import { helmetOptions } from '../src/security/http-security';

describe('P3.2 HTTP security controls', () => {
  it('uses deployment-only HSTS while retaining Helmet API protections', async () => {
    expect(helmetOptions('development').hsts).toBe(false);
    expect(helmetOptions('test').hsts).toBe(false);
    expect(helmetOptions('staging').hsts).toMatchObject({ maxAge: 31_536_000, includeSubDomains: true });
    expect(helmetOptions('production').hsts).toMatchObject({ maxAge: 31_536_000, includeSubDomains: true });
    const response = await request(app).get('/api/v1/health').expect(200);
    expect(response.headers['strict-transport-security']).toBeUndefined();
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['referrer-policy']).toBeTruthy();
    expect(response.headers['content-security-policy']).toBeTruthy();
  });

  it('returns controlled JSON for malformed JSON without internal disclosure', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const response = await request(app).post('/api/v1/public-reports')
      .set('Content-Type', 'application/json').send('{').expect(400);
    const records = log.mock.calls.map(([line]) => String(line)).filter(line => line.startsWith('{')).map(line => JSON.parse(line));
    log.mockRestore();
    expect(response.body).toEqual({ success: false, error: { code: 'MALFORMED_JSON', message: 'The request body must contain valid JSON.' } });
    expect(response.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    expect(records).toEqual(expect.arrayContaining([
      expect.objectContaining({ event: 'CONTROLLED_REQUEST_ERROR', requestId: response.headers['x-request-id'], errorCode: 'MALFORMED_JSON' }),
      expect.objectContaining({ event: 'HTTP_REQUEST_COMPLETED', requestId: response.headers['x-request-id'], statusCode: 400 })
    ]));
    expect(JSON.stringify(response.body)).not.toMatch(/stack|prisma|node_modules|\\|:\//i);
  });

  it('rejects oversized JSON through a controlled bounded response', async () => {
    const response = await request(app).post('/api/v1/public-reports')
      .send({ title: 'Oversized report', description: 'x'.repeat(270_000) }).expect(413);
    expect(response.body.error.code).toBe('REQUEST_TOO_LARGE');
  });

  it('does not treat identity-like headers as authentication', async () => {
    await request(app).get('/api/v1/cases')
      .set('X-User-Id', 'system-admin').set('X-Role', 'SYSTEM_ADMIN')
      .set('X-Department-Id', 'forged').set('X-Jurisdiction-Id', 'forged')
      .expect(401);
  });
});
