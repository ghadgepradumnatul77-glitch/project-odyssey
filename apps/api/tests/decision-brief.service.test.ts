import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExecutionTaskStatus } from '../src/generated/prisma';

const mocks = vi.hoisted(() => ({ caseFindFirst: vi.fn() }));
vi.mock('../src/lib/prisma', () => ({ default: { case: { findFirst: mocks.caseFindFirst } } }));
import { executionMetrics, getDecisionBrief } from '../src/modules/reporting/decision-brief.service';

const principal = { id: 'u', role: 'OFFICER', status: 'ACTIVE', departmentId: 'd', jurisdictionId: 'j' } as const;
const actor = { id: 'u1', name: 'Officer One', designation: 'Engineer' };
const date = new Date('2026-01-01T00:00:00.000Z');
function baseCase() {
  return { id: 'case', caseNumber: 'CASE-1', title: 'Bridge', description: null, status: 'NEW', emergencyFlag: false, createdAt: date, updatedAt: date, closedAt: null,
    asset: { id: 'asset', assetCode: 'A-1', name: 'Bridge', assetType: 'BRIDGE', department: { id: 'd', code: 'PWD', name: 'Public Works' }, jurisdiction: { id: 'j', name: 'Pune', type: 'DIVISION' } },
    closure: null, executionPlans: [], operationalResponsePlans: [], riskAssessments: [], inspections: [] };
}

describe('Decision Brief projection', () => {
  beforeEach(() => vi.clearAllMocks());
  it('returns explicit null lifecycle sections for a NEW Case', async () => {
    mocks.caseFindFirst.mockResolvedValue(baseCase());
    const brief = await getDecisionBrief('case', principal);
    expect(brief.workflow.anchor).toBe('CASE');
    expect([brief.inspection, brief.risk, brief.orp, brief.decision, brief.execution, brief.evidence, brief.closure]).toEqual([null, null, null, null, null, null, null]);
    expect(brief.case.statusExplanation).toBeTruthy();
  });
  it('uses the execution relationship chain and returns privacy-safe persisted projections', async () => {
    const inspection = { id: 'inspection-linked', caseId: 'case', inspectionDate: date, structuralCondition: 'POOR', crackSeverity: 'SEVERE', corrosionLevel: 'MODERATE', trafficImportance: 'HIGH', hospitalRoute: true, weatherRisk: 'HIGH', heavyRainExpected: true, estimatedDailyUsers: 42000, createdAt: date, inspector: actor };
    const risk = { id: 'risk-linked', caseId: 'case', inspectionId: inspection.id, riskScore: 77, riskLevel: 'VERY_HIGH', priorityLevel: 'CRITICAL', reasonCodes: ['POLICY_R002'], reasons: ['Persisted risk reason'], assessmentVersion: 'ODYSSEY_RISK_V1', createdAt: date, inspection };
    const orp: any = { id: 'orp-linked', caseId: 'case', riskAssessmentId: risk.id, versionNumber: 1, status: 'APPROVED', urgency: 'IMMEDIATE', recommendedActionCodes: ['ACT_TEMP_STABILIZATION'], temporaryMeasures: ['Persisted measure'], alternativeActionCodes: [], reasons: ['Persisted ORP reason'], planVersion: 'ODYSSEY_ORP_V1', createdAt: date, riskAssessment: risk, decisions: [] };
    const decision = { id: 'decision', caseId: 'case', orpId: orp.id, decisionType: 'APPROVED', reason: 'Approved', remarks: null, createdAt: date, reviewer: actor };
    orp.decisions = [decision];
    const tasks = [{ id: 'task', isMandatory: true, status: ExecutionTaskStatus.VERIFIED, assignedTo: actor, completionSubmittedBy: actor, verifiedBy: { id: 'u2', name: 'Verifier', designation: 'Engineer' }, evidence: [{ evidenceType: 'PHOTO_REFERENCE' }] }];
    const plan = { id: 'plan', caseId: 'case', orpId: orp.id, approvalDecisionId: decision.id, status: 'COMPLETED', templateVersion: 'V1', createdAt: date, startedAt: date, completedAt: date, approvalDecision: decision, orp, tasks };
    mocks.caseFindFirst.mockResolvedValue({ ...baseCase(), status: 'VERIFICATION', executionPlans: [plan], operationalResponsePlans: [{ ...orp, id: 'newer-unrelated' }], riskAssessments: [], inspections: [] });
    const brief = await getDecisionBrief('case', principal);
    expect(brief.orp?.id).toBe('orp-linked');
    expect(brief.risk?.reasons).toEqual(['Persisted risk reason']);
    expect(brief.execution?.metrics.completionPercentage).toBe(100);
    expect(brief.evidence).toEqual({ totalEvidence: 1, countsByType: { PHOTO_REFERENCE: 1 } });
    expect(JSON.stringify(brief)).not.toMatch(/email|employeeCode|passwordHash|referenceUrl|measurementData|authorityGrant/i);
  });
  it('projects the selected ORP human decision before execution planning', async () => {
    const inspection: any = { id: 'i', caseId: 'case', inspectionDate: date, structuralCondition: 'POOR', crackSeverity: 'SEVERE', corrosionLevel: 'MODERATE', trafficImportance: 'HIGH', hospitalRoute: true, weatherRisk: 'HIGH', heavyRainExpected: true, estimatedDailyUsers: 1, createdAt: date, inspector: actor };
    const risk: any = { id: 'r', caseId: 'case', inspectionId: 'i', riskScore: 77, riskLevel: 'VERY_HIGH', priorityLevel: 'CRITICAL', reasonCodes: [], reasons: [], assessmentVersion: 'v', createdAt: date, inspection };
    const decision = { id: 'd', caseId: 'case', orpId: 'o', decisionType: 'APPROVED', reason: 'Human approval', remarks: null, createdAt: date, reviewer: actor };
    const orp: any = { id: 'o', caseId: 'case', riskAssessmentId: 'r', versionNumber: 1, status: 'APPROVED', urgency: 'IMMEDIATE', recommendedActionCodes: [], temporaryMeasures: [], alternativeActionCodes: [], reasons: [], planVersion: 'v', createdAt: date, riskAssessment: risk, decisions: [decision] };
    mocks.caseFindFirst.mockResolvedValue({ ...baseCase(), status: 'APPROVED', operationalResponsePlans: [orp] });
    expect((await getDecisionBrief('case', principal)).decision).toMatchObject({ id: 'd', reason: 'Human approval' });
  });
  it('rejects contradictory authoritative relationships and malformed JSON', async () => {
    const data = baseCase();
    data.riskAssessments = [{ id: 'risk', caseId: 'other', inspectionId: 'inspection', riskScore: 1, riskLevel: 'LOW', priorityLevel: 'LOW', reasonCodes: [], reasons: [], assessmentVersion: 'v', createdAt: date, inspection: { id: 'inspection', caseId: 'case', inspectionDate: date, structuralCondition: '', crackSeverity: '', corrosionLevel: '', trafficImportance: '', hospitalRoute: false, weatherRisk: '', heavyRainExpected: false, estimatedDailyUsers: null, createdAt: date, inspector: actor } }] as never;
    mocks.caseFindFirst.mockResolvedValue(data);
    await expect(getDecisionBrief('case', principal)).rejects.toMatchObject({ code: 'REPORTING_DATA_INTEGRITY_ERROR', status: 409 });
    const malformed = baseCase();
    malformed.riskAssessments = [{ ...(data.riskAssessments as any)[0], caseId: 'case', reasonCodes: { bad: true } }] as never;
    mocks.caseFindFirst.mockResolvedValue(malformed);
    await expect(getDecisionBrief('case', principal)).rejects.toMatchObject({ code: 'REPORTING_DATA_INTEGRITY_ERROR' });
  });
  it('computes mandatory-only completion metrics and handles zero mandatory tasks', () => {
    expect(executionMetrics([{ isMandatory: true, status: ExecutionTaskStatus.VERIFIED, evidence: [{}] }, { isMandatory: true, status: ExecutionTaskStatus.PENDING, evidence: [] }, { isMandatory: false, status: ExecutionTaskStatus.CANCELLED, evidence: [] }])).toMatchObject({ mandatoryTasks: 2, verifiedMandatoryTasks: 1, optionalTasks: 1, terminalOptionalTasks: 1, completionPercentage: 50, evidenceCount: 1 });
    expect(executionMetrics([{ isMandatory: false, status: ExecutionTaskStatus.VERIFIED, evidence: [] }]).completionPercentage).toBeNull();
  });
});
