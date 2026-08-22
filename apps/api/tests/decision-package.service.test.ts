import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '../src/generated/prisma';

const mocks = vi.hoisted(() => { const value = { visible: vi.fn(), readiness: vi.fn(), policy: vi.fn(), caseFind: vi.fn(), intelligenceFind:vi.fn(), packageFindUnique: vi.fn(), packageFindMany: vi.fn(), packageFindFirst: vi.fn(), packageCreate: vi.fn(), packageUpdateMany: vi.fn(), transaction: vi.fn() }; return { ...value, packageDelegate: { findUnique: value.packageFindUnique, findMany: value.packageFindMany, findFirst: value.packageFindFirst, create: value.packageCreate, updateMany: value.packageUpdateMany } }; });
vi.mock('../src/lib/prisma', () => ({ default: { case: { findUnique: mocks.caseFind }, infrastructureIntelligenceAssessment:{findFirst:mocks.intelligenceFind}, decisionPackage: mocks.packageDelegate, $transaction: mocks.transaction } }));
vi.mock('../src/security/organizational-scope', async (importOriginal) => ({ ...await importOriginal<typeof import('../src/security/organizational-scope')>(), assertVisibleCase: mocks.visible }));
vi.mock('../src/modules/readiness/readiness.service', () => ({ evaluateCaseReadiness: mocks.readiness }));
vi.mock('../src/modules/policy-registry/policy-registry.service', () => ({ resolveCasePolicy: mocks.policy }));
import { DecisionPackageError, prepareDecisionPackage } from '../src/modules/decision-packages/decision-package.service';

const principal = { id: 'officer', role: 'OFFICER', status: 'ACTIVE', departmentId: 'dep', jurisdictionId: 'jur' } as any;
const at = new Date('2026-08-20T12:00:00Z');
const readiness = { outcome: 'READY', assessmentVersion: 'ODYSSEY_READINESS_V1', evaluatedAt: at, checks: [{ dimension: 'POLICY_GOVERNANCE', label: 'Policy governance', status: 'NOT_REQUIRED', reasons: [], provenance: [] }], reasons: [{ code: 'READINESS_READY', message: 'Ready' }], policySummary: { governanceEstablished: false, status: 'NOT_REQUIRED' } };
const target = { id: 'case', caseNumber: 'CASE-1', title: 'Bridge case', status: 'ORP_READY', emergencyFlag: false, asset: { id: 'asset', assetCode: 'BR-1', name: 'Bridge', assetType: 'BRIDGE', department: { id: 'dep', code: 'PWD', name: 'Public Works' }, jurisdiction: { id: 'jur', name: 'Pune', type: 'DIVISION' } }, inspections: [{ id: 'inspection', inspectionDate: at, structuralCondition: 'POOR', crackSeverity: 'SEVERE', corrosionLevel: 'MODERATE', trafficImportance: 'HIGH', hospitalRoute: true, weatherRisk: 'HIGH', heavyRainExpected: true, estimatedDailyUsers: 42000 }], riskAssessments: [{ id: 'risk', inspectionId: 'inspection', riskScore: 77, riskLevel: 'VERY_HIGH', priorityLevel: 'CRITICAL', reasonCodes: ['R1'], reasons: [{ reasonCode: 'R1', message: 'Risk reason' }], assessmentVersion: 'ODYSSEY_RISK_V1', createdAt: at }] };
const record = { id: 'package', caseId: 'case', inspectionId: 'inspection', riskAssessmentId: 'risk', packageVersion: 1, packageContractVersion: 'ODYSSEY_DECISION_PACKAGE_V1', status: 'PREPARED', sourceFingerprint: 'hash', caseSnapshot: {}, inspectionSnapshot: {}, riskSnapshot: {}, readinessSnapshot: {}, policySnapshot: {}, actionSnapshot: {}, preparedById: 'officer', preparedAt: at, createdAt: at, updatedAt: at, preparedBy: { name: 'Officer', employeeCode: 'O-1', designation: 'Engineer' } };

describe('Governed Decision Package', () => {
  beforeEach(() => {
    vi.clearAllMocks(); mocks.visible.mockResolvedValue(target); mocks.readiness.mockResolvedValue(readiness); mocks.caseFind.mockResolvedValue(target);mocks.intelligenceFind.mockResolvedValue(null); mocks.packageFindUnique.mockResolvedValue(null); mocks.packageFindFirst.mockResolvedValue(null); mocks.packageCreate.mockResolvedValue(record); mocks.packageUpdateMany.mockResolvedValue({ count: 0 }); mocks.transaction.mockImplementation((callback: any) => callback({ decisionPackage: mocks.packageDelegate }));
  });
  it('requires G2 READY and creates an immutable v1 package from exact inspection and risk provenance', async () => {
    const result = await prepareDecisionPackage('case', principal, at); expect(result.packageVersion).toBe(1);
    expect(mocks.readiness).toHaveBeenCalledWith('case', principal, at); const data = mocks.packageCreate.mock.calls[0][0].data;
    expect(data).toMatchObject({ inspectionId: 'inspection', riskAssessmentId: 'risk', preparedById: 'officer', packageVersion: 1 });
    expect(data.riskSnapshot).toMatchObject({ riskScore: 77, riskLevel: 'VERY_HIGH', assessmentVersion: 'ODYSSEY_RISK_V1' });
  });
  it.each([['NOT_READY', 'DECISION_PACKAGE_NOT_READY'], ['BLOCKED', 'DECISION_PACKAGE_BLOCKED']])('refuses %s without creating a partial package', async (outcome, code) => {
    mocks.readiness.mockResolvedValue({ ...readiness, outcome, reasons: [{ code: 'SAFE_REASON', message: 'Safe reason' }] });
    await expect(prepareDecisionPackage('case', principal, at)).rejects.toMatchObject({ code, reasons: [{ code: 'SAFE_REASON' }] }); expect(mocks.packageCreate).not.toHaveBeenCalled();
  });
  it('supports READY with no policy governance without inventing policy or actions', async () => {
    await prepareDecisionPackage('case', principal, at); const data = mocks.packageCreate.mock.calls[0][0].data;
    expect(data.policySnapshot).toMatchObject({ state: 'NO_APPLICABLE_ACTIVE_POLICY_GOVERNANCE', rules: [] }); expect(data.actionSnapshot).toEqual({ MANDATORY: [], RECOMMENDED: [], OPTIONAL: [], PROHIBITED: [] }); expect(mocks.policy).not.toHaveBeenCalled();
  });
  it('preserves exact G1 policy/action versions and all enforcement classes', async () => {
    mocks.readiness.mockResolvedValue({ ...readiness, policySummary: { governanceEstablished: true, status: 'PASS' } });
    mocks.policy.mockResolvedValue({ status: 'RESOLVED', applicableRules: ['MANDATORY', 'RECOMMENDED', 'OPTIONAL', 'PROHIBITED'].map((level, index) => ({ rule: { id: `rule-${index}`, code: `R${index}`, description: 'Rule', enforcementLevel: level }, policy: { id: 'policy', policyCode: 'POLICY', versionNumber: 2, title: 'Policy', sourceReference: 'REF' }, action: { id: `action-${index}`, actionCode: `ACT_${index}`, versionNumber: 3, title: `${level} action`, category: 'SAFETY', description: 'Action', sourceReference: 'ACTION-REF', enforcementClassification: level } })) });
    await prepareDecisionPackage('case', principal, at); const data = mocks.packageCreate.mock.calls[0][0].data;
    for (const level of ['MANDATORY', 'RECOMMENDED', 'OPTIONAL', 'PROHIBITED']) expect(data.actionSnapshot[level][0]).toMatchObject({ enforcementClassification: level, actionVersion: 3 });
    expect(data.policySnapshot.rules[0]).toMatchObject({ policy: { id: 'policy', versionNumber: 2 }, rule: { id: 'rule-0' } });
  });
  it('reuses an identical fingerprint and creates no duplicate version', async () => {
    mocks.packageFindUnique.mockResolvedValue(record); const result = await prepareDecisionPackage('case', principal, at); expect(result.reused).toBe(true); expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it('creates the next version and supersedes metadata only when authoritative state materially changed', async () => {
    mocks.packageFindFirst.mockResolvedValue({ packageVersion: 4 }); await prepareDecisionPackage('case', principal, at);
    expect(mocks.packageCreate.mock.calls[0][0].data.packageVersion).toBe(5); expect(mocks.packageUpdateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { status: 'SUPERSEDED' } }));
    expect(mocks.packageUpdateMany.mock.calls[0][0].data).not.toHaveProperty('caseSnapshot');
  });
  it('creates a new package version from recovered inspection and risk lineage', async () => {
    const recovered = { ...target, inspections: [{ ...target.inspections[0], id: 'inspection-recovery' }], riskAssessments: [{ ...target.riskAssessments[0], id: 'risk-recovery', inspectionId: 'inspection-recovery' }] };
    mocks.caseFind.mockResolvedValue(recovered); mocks.packageFindFirst.mockResolvedValue({ packageVersion: 1 });
    await prepareDecisionPackage('case', principal, at);
    expect(mocks.packageCreate.mock.calls[0][0].data).toMatchObject({ packageVersion: 2, inspectionId: 'inspection-recovery', riskAssessmentId: 'risk-recovery' });
    expect(mocks.packageUpdateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { status: 'SUPERSEDED' } }));
  });
  it('recovers concurrent identical creation through the fingerprint uniqueness constraint', async () => {
    const collision = new Prisma.PrismaClientKnownRequestError('unique', { code: 'P2002', clientVersion: 'test' });
    mocks.transaction.mockRejectedValueOnce(collision); mocks.packageFindUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(record);
    const result = await prepareDecisionPackage('case', principal, at); expect(result.reused).toBe(true); expect(result.id).toBe('package');
  });
  it('does not trust client package version, preparedBy, readiness, risk, or bypass inputs because the service accepts none', async () => {
    expect(prepareDecisionPackage).toHaveLength(2); await prepareDecisionPackage('case', principal, at); expect(mocks.packageCreate.mock.calls[0][0].data).toMatchObject({ preparedById: 'officer', packageVersion: 1, riskAssessmentId: 'risk' });
  });
  it('does not recalculate risk or create decisions, execution, closure, or mutate Case state', async () => {
    await prepareDecisionPackage('case', principal, at); expect(Object.keys((await import('../src/lib/prisma')).default).sort()).toEqual(['$transaction', 'case', 'decisionPackage', 'infrastructureIntelligenceAssessment'].sort());
  });
  it('returns a privacy-controlled DTO without reporter, auth, notes, hidden reasoning, or raw actor IDs', async () => {
    const body = JSON.stringify(await prepareDecisionPackage('case', principal, at)); for (const key of ['reporterName', 'reporterContact', 'passwordHash', 'inspectionNotes', 'sourceFingerprint', 'preparedById', 'hiddenReasoning']) expect(body).not.toContain(`\"${key}\"`);
  });
  it('optionally snapshots reconciled intelligence without changing governed action selection',async()=>{mocks.intelligenceFind.mockResolvedValue({id:'intel',status:'COMPLETED',predictedRiskScore:80,predictedRiskLevel:'VERY_HIGH',recommendedPriority:'CRITICAL',confidence:1,provider:'ODYSSEY_REFERENCE_PROVIDER_V1',providerType:'REFERENCE_NON_ML',modelName:'ODYSSEY_REFERENCE_HEURISTIC',modelVersion:'1',featureSchemaVersion:'ODYSSEY_INFRA_FEATURES_V1',contractVersion:'ODYSSEY_INTELLIGENCE_V1',inferredAt:at,reconciliation:{deterministicFloorPreserved:true},governanceReconciliations:[{id:'recon',contractVersion:'ODYSSEY_INTELLIGENCE_GOVERNANCE_V1',policyResolutionStatus:'RESOLVED',policySnapshot:{},reconciledActions:[{actionCode:'ACT_X',resolution:'PROHIBITED'}],issues:[],reconciledAt:at}]});await prepareDecisionPackage('case',principal,at);const data=mocks.packageCreate.mock.calls[0][0].data;expect(data.intelligenceSnapshot).toMatchObject({state:'CURRENT_ADVISORY_WITH_GOVERNANCE',advisoryOnly:true,humanDecision:false,governance:{reconciledActions:[{resolution:'PROHIBITED'}]}});expect(data.actionSnapshot).toEqual({MANDATORY:[],RECOMMENDED:[],OPTIONAL:[],PROHIBITED:[]});});
  it('queries only current completed intelligence matching authoritative inspection and risk',async()=>{await prepareDecisionPackage('case',principal,at);expect(mocks.intelligenceFind).toHaveBeenCalledWith(expect.objectContaining({where:expect.objectContaining({caseId:'case',inspectionId:'inspection',riskAssessmentId:'risk',status:'COMPLETED',OR:expect.any(Array)})}));expect(mocks.packageCreate.mock.calls[0][0].data.intelligenceSnapshot).toEqual(Prisma.JsonNull);});
  it('refuses package preparation outside the Action Plan preparation boundary', async () => {
    mocks.caseFind.mockResolvedValue({ ...target, status: 'CLOSED' }); await expect(prepareDecisionPackage('case', principal, at)).rejects.toBeInstanceOf(DecisionPackageError); expect(mocks.packageCreate).not.toHaveBeenCalled();
  });
});
