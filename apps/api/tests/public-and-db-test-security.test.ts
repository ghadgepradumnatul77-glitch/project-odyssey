import request from 'supertest';
import { SignJWT } from 'jose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ findUnique: vi.fn(), count: vi.fn(), createReport:vi.fn(), listReports:vi.fn(), detailReport:vi.fn(), review:vi.fn(), route:vi.fn(), reject:vi.fn(), accept:vi.fn() }));
vi.mock('../src/lib/prisma', () => ({
  default: {
    user: { findUnique: mocks.findUnique, count: mocks.count },
    department: { count: mocks.count }, jurisdiction: { count: mocks.count }, asset: { count: mocks.count }
  }
}));
vi.mock('../src/modules/public-reports/public-report.service',()=>{class PublicReportNotFoundError extends Error{};class PublicReportConflictError extends Error{};class PublicReportValidationError extends Error{};return{PublicReportNotFoundError,PublicReportConflictError,PublicReportValidationError,createCitizenPublicReport:mocks.createReport,listPublicReports:mocks.listReports,getPublicReport:mocks.detailReport,beginPublicReportReview:mocks.review,routePublicReport:mocks.route,rejectPublicReport:mocks.reject,acceptPublicReportAsCase:mocks.accept};});

import { getAuthConfig } from '../src/config/auth';
import { app } from '../src/server';

async function authorization(role: string) {
  mocks.findUnique.mockResolvedValue({ id: `user-${role}`, role, status: 'ACTIVE', departmentId: 'dep-1', jurisdictionId: 'jur-1' });
  const config = getAuthConfig();
  return `Bearer ${await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(`user-${role}`)
    .setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(config.secret)}`;
}

beforeEach(() => { vi.clearAllMocks(); mocks.count.mockResolvedValue(1);mocks.createReport.mockResolvedValue({reportNumber:'JNV-PUB-TEST',status:'SUBMITTED',submittedAt:new Date('2026-08-19')});mocks.listReports.mockResolvedValue([]);mocks.detailReport.mockResolvedValue({id:'report-1'});mocks.review.mockResolvedValue({id:'report-1'});mocks.route.mockResolvedValue({id:'report-1'});mocks.reject.mockResolvedValue({id:'report-1'});mocks.accept.mockResolvedValue({id:'case-1'}); });

describe('public and diagnostic surface', () => {
  it('keeps basic health public and minimal', async () => {
    const response = await request(app).get('/api/v1/health').expect(200);
    expect(response.body.data).toEqual(expect.objectContaining({ service: 'odyssey-api', status: 'ok' }));
    expect(JSON.stringify(response.body)).not.toMatch(/database|credential|secret|password/i);
  });

  it('keeps login reachable without authentication', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({}).expect(400);
    expect(response.body.error.code).toBe('INVALID_INPUT');
  });

  it('protects db-test with SYSTEM_ADMIN', async () => {
    await request(app).get('/api/v1/db-test').expect(401);
    for (const role of ['OFFICER', 'POLICY_ADMIN', 'AUDITOR']) {
      await request(app).get('/api/v1/db-test').set('Authorization', await authorization(role)).expect(403);
    }
    const response = await request(app).get('/api/v1/db-test').set('Authorization', await authorization('SYSTEM_ADMIN')).expect(200);
    expect(response.body.data.database).toBe('connected');
  });
  it('preserves the public citizen POST through the real application mount sequence',async()=>{const input={title:'Synthetic road damage',description:'Synthetic road damage requiring government intake review.',category:'ROAD_DAMAGE',locationText:'Test location, Pune'};const response=await request(app).post('/api/v1/public-reports').send(input).expect(201);expect(response.body.data.status).toBe('SUBMITTED');expect(mocks.createReport).toHaveBeenCalledWith(input);});
  it('keeps every intake read and triage operation protected in the real application',async()=>{await request(app).get('/api/v1/public-reports').expect(401);await request(app).get('/api/v1/public-reports/report-1').expect(401);await request(app).post('/api/v1/public-reports/report-1/review').send({}).expect(401);await request(app).patch('/api/v1/public-reports/report-1/routing').send({}).expect(401);await request(app).post('/api/v1/public-reports/report-1/reject').send({reason:'A meaningful synthetic reason'}).expect(401);await request(app).post('/api/v1/public-reports/report-1/accept').send({governmentSummary:'A government reviewed synthetic summary.'}).expect(401);});
  it('allows SYSTEM_ADMIN and OFFICER intake access but rejects read-only operational roles',async()=>{for(const role of ['SYSTEM_ADMIN','OFFICER'])await request(app).get('/api/v1/public-reports').set('Authorization',await authorization(role)).expect(200);for(const role of ['AUDITOR','POLICY_ADMIN'])await request(app).get('/api/v1/public-reports').set('Authorization',await authorization(role)).expect(403);});
});
