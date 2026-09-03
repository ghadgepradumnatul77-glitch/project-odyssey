import request from 'supertest';
import { SignJWT } from 'jose';
import { beforeEach, expect, it, vi } from 'vitest';
import { getAuthConfig } from '../src/config/auth';

// Real assembled app, auth, routes, service and repository; only persistence is
// injected. This is not a substitute for isolated PostgreSQL acceptance.
const state = vi.hoisted(() => ({ role: 'OFFICER', fail: false, writes: vi.fn(), reads: vi.fn(), rows: {} as Record<string, any[]> }));
vi.mock('../src/lib/prisma', () => {
  const delegates = new Map<string, any>();
  const client: any = new Proxy({}, {
    get(_target, name: string) {
      if (name === '$transaction') return async (callback: any, options: any) => {
        expect(options).toEqual({ isolationLevel: 'RepeatableRead', timeout: 30000 });
        return callback(client);
      };
      if (name === '$queryRaw') return async (query: any) => {
        state.reads('history', query);
        if (state.fail) throw new Error('timeout postgresql://SECRET connection refused');
        return [];
      };
      if (name.startsWith('$execute')) return (...args: any[]) => { state.writes(name, args); throw new Error('Unexpected write'); };
      if (!delegates.has(name)) delegates.set(name, new Proxy({}, {
        get(_delegate, method: string) {
          if (name === 'user' && method === 'findUnique') return async () => ({ id: 'actor', role: state.role, status: 'ACTIVE', departmentId: 'd', jurisdictionId: 'j' });
          if (method === 'findMany') return async (args: any) => { state.reads(name, args); return state.rows[name] ?? []; };
          return (...args: any[]) => { state.writes(`${name}.${method}`, args); throw new Error('Unexpected mutation or unsupported read'); };
        }
      }));
      return delegates.get(name);
    }
  });
  return { default: client };
});
import { app } from '../src/server';
async function authorization() {
  const config = getAuthConfig();
  return `Bearer ${await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject('actor').setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(config.secret)}`;
}
beforeEach(() => {
  state.role = 'OFFICER'; state.fail = false; vi.clearAllMocks();
  const date = new Date('2026-01-01');
  state.rows = {
    asset: [{ id: 'a', assetCode: 'SYNTHETIC-TEST', assetType: 'BRIDGE', departmentId: 'd', jurisdictionId: 'j', latitude: null, longitude: null, constructionYear: null, createdAt: date, updatedAt: date }],
    case: [{ id: 'c', assetId: 'a', status: 'ORP_READY', riskLevel: 'VERY_HIGH', priorityLevel: 'CRITICAL', createdAt: date, updatedAt: date, closedAt: null, description: 'SECRET' }],
    publicReport: [{ id: 'report', assetId: 'a', createdCaseId: 'c', status: 'SUBMITTED', submittedAt: date, reviewStartedAt: null, decisionAt: null, reporterName: 'SECRET', reporterContact: 'SECRET', description: 'SECRET' }],
    executionPlan: [{ id: 'plan', caseId: 'c', status: 'PLANNED', createdAt: date }],
    executionTask: [{ id: 'task', executionPlanId: 'plan', status: 'PENDING', evidenceRequired: true, completionNote: 'SECRET', verificationNote: 'SECRET' }],
    executionEvidence: [{ id: 'e', executionTaskId: 'task', capturedAt: null, submittedAt: date, description: 'SECRET', referenceUrl: 'SECRET', documentReference: 'SECRET' }],
    predictiveFeatureSnapshot: [{ id: 'snapshot', assetId: 'a', caseId: 'c', executionTaskId: 'task', status: 'ACTIVE', provenanceClass: 'TEST', predictionTimestamp: date, createdAt: date, featurePayload: { secret: 'SECRET' } }],
    predictiveOutcome: [{ id: 'outcome', snapshotId: 'snapshot', outcomeTimestamp: date, recordedAt: date, sourceReferences: { secret: 'SECRET' } }]
  };
});
it.each(['', '/summary'])('assembled baseline%s is privacy-safe and leaves all persistence fixtures unchanged', async suffix => {
  const before = JSON.stringify(state.rows);
  const response = await request(app).get(`/api/v1/assets/evidence-baseline${suffix}`).set('Authorization', await authorization()).expect(200);
  expect(response.body.data.contractVersion).toBe('ODYSSEY_ASSET_EVIDENCE_BASELINE_V1');
  expect(JSON.stringify(response.body)).not.toContain('SECRET'); expect(state.writes).not.toHaveBeenCalled();
  expect(JSON.stringify(state.rows)).toBe(before);
  expect(state.reads.mock.calls.some(([name]) => name === 'predictiveFeatureSnapshot')).toBe(false);
  if (!suffix) expect(response.body.data.items[0]).toMatchObject({ evidence: { reports: { count: { value: 1 } } }, caseStates: { items: [{ riskLevel: { value: 'VERY_HIGH' }, priorityLevel: { value: 'CRITICAL' } }] } });
});
it('assembled auditor read exposes metadata only, never raw predictive payload', async () => {
  state.role = 'AUDITOR';
  const response = await request(app).get('/api/v1/assets/evidence-baseline').set('Authorization', await authorization()).expect(200);
  expect(response.body.data.items[0].predictive).toMatchObject({ availability: 'AVAILABLE', snapshots: { count: { value: 1 } }, eligibility: { state: 'NOT_COMPARABLE' } });
  expect(JSON.stringify(response.body)).not.toContain('SECRET'); expect(state.writes).not.toHaveBeenCalled();
});
it.each(['', '/summary'])('assembled timeout at baseline%s fails closed without partial data or mutation', async suffix => {
  state.fail = true;
  const response = await request(app).get(`/api/v1/assets/evidence-baseline${suffix}`).set('Authorization', await authorization()).expect(503);
  expect(response.body.data).toBeUndefined(); expect(response.body.error.code).toBe('EVIDENCE_BASELINE_UNAVAILABLE');
  expect(JSON.stringify(response.body)).not.toContain('SECRET'); expect(state.writes).not.toHaveBeenCalled();
});
