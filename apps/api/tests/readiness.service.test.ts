import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ visible: vi.fn(), caseFind: vi.fn(), policyCount: vi.fn(), resolvePolicy: vi.fn() }));
vi.mock('../src/lib/prisma', () => ({ default: { case: { findUnique: mocks.caseFind }, policyDocument: { count: mocks.policyCount } } }));
vi.mock('../src/security/organizational-scope', async (importOriginal) => ({ ...await importOriginal<typeof import('../src/security/organizational-scope')>(), assertVisibleCase: mocks.visible }));
vi.mock('../src/modules/policy-registry/policy-registry.service', () => ({ resolveCasePolicy: mocks.resolvePolicy }));

import { evaluateCaseReadiness } from '../src/modules/readiness/readiness.service';

const principal = { id: 'officer', role: 'OFFICER', status: 'ACTIVE', departmentId: 'dep', jurisdictionId: 'jur' } as any;
const evaluatedAt = new Date('2026-08-20T12:00:00Z');
const target = {
  id: 'case', caseNumber: 'CASE-1', status: 'ORP_READY', riskLevel: 'VERY_HIGH', priorityLevel: 'CRITICAL',
  asset: { id: 'asset', departmentId: 'dep', jurisdictionId: 'jur', department: { id: 'dep' }, jurisdiction: { id: 'jur', departmentId: 'dep' } },
  inspections: [{ id: 'inspection', createdAt: new Date('2026-08-20T10:00:00Z') }],
  riskAssessments: [{ id: 'risk', inspectionId: 'inspection', riskLevel: 'VERY_HIGH', priorityLevel: 'CRITICAL', assessmentVersion: 'ODYSSEY_RISK_V1', createdAt: new Date('2026-08-20T11:00:00Z') }]
};

describe('Decision readiness evaluation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.visible.mockResolvedValue(target);
    mocks.caseFind.mockResolvedValue(target);
    mocks.policyCount.mockResolvedValue(0);
    mocks.resolvePolicy.mockResolvedValue({ status: 'RESOLVED', issues: [], applicableRules: [] });
  });

  it('returns READY for consistent governed inputs without requiring a nonexistent policy registry', async () => {
    const result = await evaluateCaseReadiness('case', principal, evaluatedAt);
    expect(result.outcome).toBe('READY');
    expect(result.policySummary).toEqual({ governanceEstablished: false, status: 'NOT_REQUIRED' });
    expect(result.reasons).toContainEqual(expect.objectContaining({ code: 'READINESS_READY' }));
    expect(mocks.resolvePolicy).not.toHaveBeenCalled();
  });

  it('returns NOT_READY when inspection is missing', async () => {
    mocks.caseFind.mockResolvedValue({ ...target, inspections: [], riskAssessments: [] });
    const result = await evaluateCaseReadiness('case', principal, evaluatedAt);
    expect(result.outcome).toBe('NOT_READY');
    expect(result.reasons.map((item) => item.code)).toContain('READINESS_INSPECTION_MISSING');
  });

  it('returns NOT_READY when the Risk Assessment is missing', async () => {
    mocks.caseFind.mockResolvedValue({ ...target, riskLevel: null, priorityLevel: null, riskAssessments: [] });
    const result = await evaluateCaseReadiness('case', principal, evaluatedAt);
    expect(result.outcome).toBe('NOT_READY');
    expect(result.reasons.map((item) => item.code)).toContain('READINESS_RISK_ASSESSMENT_MISSING');
  });

  it('blocks invalid organizational context', async () => {
    mocks.caseFind.mockResolvedValue({ ...target, asset: { ...target.asset, jurisdiction: { id: 'jur', departmentId: 'other' } } });
    const result = await evaluateCaseReadiness('case', principal, evaluatedAt);
    expect(result.outcome).toBe('BLOCKED');
    expect(result.reasons.map((item) => item.code)).toContain('READINESS_CONTEXT_INVALID');
  });

  it.each([['riskLevel', 'HIGH'], ['priorityLevel', 'HIGH']])('blocks when persisted Case %s contradicts the latest assessment', async (field, value) => {
    mocks.caseFind.mockResolvedValue({ ...target, [field]: value });
    const result = await evaluateCaseReadiness('case', principal, evaluatedAt);
    expect(result.outcome).toBe('BLOCKED');
    expect(result.reasons.map((item) => item.code)).toContain('READINESS_RISK_STATE_INCONSISTENT');
  });

  it('blocks a Risk Assessment that does not govern the latest inspection', async () => {
    mocks.caseFind.mockResolvedValue({ ...target, riskAssessments: [{ ...target.riskAssessments[0], inspectionId: 'older-inspection' }] });
    expect((await evaluateCaseReadiness('case', principal, evaluatedAt)).reasons.map((item) => item.code)).toContain('READINESS_RISK_SOURCE_STALE');
  });

  it('passes successful G1 resolution and retains exact policy/action provenance', async () => {
    mocks.policyCount.mockResolvedValue(1);
    mocks.resolvePolicy.mockResolvedValue({ status: 'RESOLVED', issues: [], applicableRules: [{ rule: { id: 'rule' }, policy: { id: 'policy', versionNumber: 2 }, action: { id: 'action', versionNumber: 3 } }] });
    const result = await evaluateCaseReadiness('case', principal, evaluatedAt);
    expect(result.outcome).toBe('READY');
    expect(result.checks.find((item) => item.dimension === 'POLICY_GOVERNANCE')?.provenance).toEqual(expect.arrayContaining([{ type: 'POLICY_DOCUMENT', id: 'policy', version: 2 }, { type: 'APPROVED_ACTION', id: 'action', version: 3 }]));
  });

  it.each([
    ['NO_APPLICABLE_ACTIVE_POLICY', 'NOT_READY', 'READINESS_POLICY_UNRESOLVED'],
    ['MISSING_CASE_CONTEXT', 'NOT_READY', 'READINESS_POLICY_REQUIRED'],
    ['CONFLICTING_ENFORCEMENT', 'BLOCKED', 'READINESS_POLICY_CONFLICT'],
    ['MULTIPLE_ACTIVE_ACTION_VERSIONS', 'BLOCKED', 'READINESS_POLICY_CONFLICT'],
    ['INVALID_RULE_CONDITIONS', 'BLOCKED', 'READINESS_POLICY_UNSUPPORTED'],
    ['INVALID_ACTION_APPLICABILITY', 'BLOCKED', 'READINESS_POLICY_UNSUPPORTED']
  ])('maps G1 issue %s to %s', async (code, outcome, readinessCode) => {
    mocks.policyCount.mockResolvedValue(1);
    mocks.resolvePolicy.mockResolvedValue({ status: 'ABSTAINED', issues: [{ code, message: 'internal detail' }], applicableRules: [] });
    const result = await evaluateCaseReadiness('case', principal, evaluatedAt);
    expect(result.outcome).toBe(outcome);
    expect(result.reasons.map((item) => item.code)).toContain(readinessCode);
  });

  it('is deterministic for a fixed evaluated time and exposes only allow-listed data', async () => {
    const first = await evaluateCaseReadiness('case', principal, evaluatedAt);
    const second = await evaluateCaseReadiness('case', principal, evaluatedAt);
    expect(second).toEqual(first);
    const body = JSON.stringify(first);
    for (const field of ['reporterName', 'reporterContact', 'passwordHash', 'inspectionNotes', 'humanDecision', 'executionPlan']) expect(body).not.toContain(`\"${field}\"`);
  });

  it('is read-only and cannot create or mutate workflow records', async () => {
    const result = await evaluateCaseReadiness('case', principal, evaluatedAt);
    expect(result.governance).toEqual({ readOnly: true, caseMutated: false, approvalGranted: false, officerJudgmentRequired: true });
    expect(Object.keys((await import('../src/lib/prisma')).default).sort()).toEqual(['case', 'policyDocument']);
  });
});
