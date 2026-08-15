import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SignJWT } from 'jose';
import { getAuthConfig } from '../src/config/auth';
import { ReportingError } from '../src/modules/reporting/reporting-error';
const mocks = vi.hoisted(() => ({ brief: vi.fn(), timeline: vi.fn(), userFindUnique: vi.fn() }));
vi.mock('../src/lib/prisma', () => ({ default: { user: { findUnique: mocks.userFindUnique } } }));
vi.mock('../src/modules/reporting/decision-brief.service', () => ({ getDecisionBrief: mocks.brief }));
vi.mock('../src/modules/reporting/case-timeline.service', () => ({ getCaseTimeline: mocks.timeline, TIMELINE_DEFAULT_LIMIT: 100 }));
import routes from '../src/modules/reporting/reporting.routes';
const app = express(); app.use(express.json()); app.use('/api/v1', routes);
async function auth(role: string) { const id = `user-${role}`; mocks.userFindUnique.mockResolvedValue({ id, role, status: 'ACTIVE', departmentId: 'dep', jurisdictionId: 'jur' }); const config = getAuthConfig(); const token = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(id).setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(config.secret); return `Bearer ${token}`; }
beforeEach(() => { vi.clearAllMocks(); mocks.brief.mockResolvedValue({ case: { id: 'case' } }); mocks.timeline.mockResolvedValue({ caseId: 'case', events: [], page: { limit: 100, nextCursor: null } }); });
describe('reporting routes', () => {
  it('requires authentication for both read-only endpoints', async () => { await request(app).get('/api/v1/cases/case/decision-brief').expect(401); await request(app).get('/api/v1/cases/case/timeline').expect(401); });
  it.each(['OFFICER','AUDITOR','POLICY_ADMIN','SYSTEM_ADMIN'])('allows authenticated %s reads', async (role) => { await request(app).get('/api/v1/cases/case/decision-brief').set('Authorization', await auth(role)).expect(200); await request(app).get('/api/v1/cases/case/timeline').set('Authorization', await auth(role)).expect(200); });
  it('passes normalized pagination and rejects malformed limits', async () => { await request(app).get('/api/v1/cases/case/timeline?limit=25&cursor=opaque').set('Authorization', await auth('OFFICER')).expect(200); expect(mocks.timeline).toHaveBeenCalledWith('case', expect.anything(), 25, 'opaque'); await request(app).get('/api/v1/cases/case/timeline?limit=1.5').set('Authorization', await auth('OFFICER')).expect(400); });
  it('preserves scoped not-found and integrity errors', async () => { mocks.brief.mockRejectedValueOnce(new ReportingError('CASE_NOT_FOUND', 404, 'Case not found.')).mockRejectedValueOnce(new ReportingError('REPORTING_DATA_INTEGRITY_ERROR', 409, 'Inconsistent.')); expect((await request(app).get('/api/v1/cases/hidden/decision-brief').set('Authorization', await auth('OFFICER')).expect(404)).body.error.code).toBe('CASE_NOT_FOUND'); expect((await request(app).get('/api/v1/cases/case/decision-brief').set('Authorization', await auth('OFFICER')).expect(409)).body.error.code).toBe('REPORTING_DATA_INTEGRITY_ERROR'); });
  it('has no reporting mutation route', async () => { await request(app).post('/api/v1/cases/case/decision-brief').set('Authorization', await auth('OFFICER')).expect(404); await request(app).post('/api/v1/cases/case/timeline').set('Authorization', await auth('OFFICER')).expect(404); });
});
