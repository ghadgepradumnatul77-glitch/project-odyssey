import request from 'supertest';
import { SignJWT } from 'jose';
import { expect, it, vi } from 'vitest';
import { getAuthConfig } from '../src/config/auth';

const ids = { source: '10000000-0000-4000-8000-000000000001', asset: '20000000-0000-4000-8000-000000000001', department: '30000000-0000-4000-8000-000000000001', jurisdiction: '40000000-0000-4000-8000-000000000001' };
const state = vi.hoisted(() => ({ caseRisk: 'HIGH', casePriority: 'HIGH', observations: [] as unknown[] }));
const workflowWrite = vi.hoisted(() => vi.fn());

vi.mock('../src/lib/prisma', () => ({ default: {
  user: { findUnique: vi.fn(async () => ({ id: 'admin', role: 'SYSTEM_ADMIN', status: 'ACTIVE', departmentId: ids.department, jurisdictionId: ids.jurisdiction })) },
  observationSource: { findUnique: vi.fn(async () => ({ id: ids.source, isActive: true, departmentId: null, jurisdictionId: null })) },
  externalObservation: {
    findUnique: vi.fn(async () => null),
    create: vi.fn(async ({ data }: any) => { const value = { id: 'observation', ...data, ingestedAt: new Date('2026-08-24T01:00:00Z') }; state.observations.push(value); return value; })
  },
  asset: { findUnique: vi.fn(async () => ({ id: ids.asset, departmentId: ids.department, jurisdictionId: ids.jurisdiction })) },
  case: { findUnique: vi.fn(async () => null), update: workflowWrite },
  jurisdiction: { findUnique: vi.fn(async () => ({ id: ids.jurisdiction, departmentId: ids.department })) },
  inspection: { create: workflowWrite, update: workflowWrite }, riskAssessment: { create: workflowWrite, update: workflowWrite },
  operationalResponsePlan: { create: workflowWrite, update: workflowWrite }, decisionPackage: { create: workflowWrite, update: workflowWrite },
  orpDecision: { create: workflowWrite, update: workflowWrite }, executionPlan: { create: workflowWrite, update: workflowWrite },
  caseClosure: { create: workflowWrite, update: workflowWrite }
} }));

import { app } from '../src/server';

it('ingests contextual evidence through the assembled app without mutating authoritative workflow state', async () => {
  const config = getAuthConfig();
  const token = `Bearer ${await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject('admin').setIssuer(config.issuer).setAudience(config.audience).setIssuedAt().setExpirationTime('5m').sign(config.secret)}`;
  const before = { caseRisk: state.caseRisk, casePriority: state.casePriority, observationCount: state.observations.length };
  await request(app).post('/api/v1/external-observations').set('Authorization', token).send({ sourceId: ids.source, sourceRecordId: 'wx-1', sourceVersion: '1', observationType: 'WEATHER', schemaVersion: 'WEATHER_V1', observedAt: '2026-08-24T00:00:00Z', assetId: ids.asset, normalizedData: { rainfallMm: 42 }, sourceMetadata: { batch: 'governed' } }).expect(201);
  expect(state.observations).toHaveLength(before.observationCount + 1);
  expect({ caseRisk: state.caseRisk, casePriority: state.casePriority }).toEqual({ caseRisk: before.caseRisk, casePriority: before.casePriority });
  expect(workflowWrite).not.toHaveBeenCalled();
});
