import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CaseStatus, Prisma } from '../src/generated/prisma';

const mocks = vi.hoisted(() => ({ scope: vi.fn(), inspectionFind: vi.fn(), riskFind: vi.fn(), caseFind: vi.fn(), riskCreate: vi.fn(), caseUpdate: vi.fn(), transaction: vi.fn() }));
vi.mock('../src/security/organizational-scope', async (original) => ({ ...await original<typeof import('../src/security/organizational-scope')>(), assertOperationalCaseScope: mocks.scope }));
vi.mock('../src/lib/prisma', () => ({ default: {
  inspection: { findFirst: mocks.inspectionFind },
  riskAssessment: { findUnique: mocks.riskFind },
  case: { findUnique: mocks.caseFind },
  $transaction: mocks.transaction
} }));

import { riskSourceFingerprint, runAssessmentForCase } from '../src/modules/risk/risk.service';
const principal = { id: 'officer', role: 'OFFICER', status: 'ACTIVE', departmentId: 'dep', jurisdictionId: 'jur' } as any;
const inspection = { id: 'inspection-new', caseId: 'case', inspectorId: 'officer', inspectionDate: new Date(), structuralCondition: 'POOR', crackSeverity: 'SEVERE', corrosionLevel: 'MODERATE', trafficImportance: 'HIGH', hospitalRoute: true, weatherRisk: 'HIGH', heavyRainExpected: true, estimatedDailyUsers: 42000, inspectionNotes: null, createdAt: new Date(), updatedAt: new Date() };

describe('deterministic risk recovery state boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.scope.mockResolvedValue({ id: 'case', status: CaseStatus.INSPECTION_IN_PROGRESS });
    mocks.inspectionFind.mockResolvedValue(inspection);
    mocks.riskFind.mockResolvedValue(null);
    mocks.caseFind.mockResolvedValue({ status: CaseStatus.ORP_READY, riskLevel: 'VERY_HIGH', priorityLevel: 'CRITICAL' });
    mocks.riskCreate.mockImplementation(({ data }: any) => Promise.resolve({ id: 'risk-new', ...data }));
    mocks.caseUpdate.mockResolvedValue({});
    mocks.transaction.mockImplementation((callback: any) => callback({ riskAssessment: { create: mocks.riskCreate }, case: { update: mocks.caseUpdate } }));
  });

  it('selects the deterministic latest inspection and links the new risk to it', async () => {
    const result = await runAssessmentForCase('case', principal);
    expect(mocks.inspectionFind).toHaveBeenCalledWith({ where: { caseId: 'case' }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
    expect(result.inspectionId).toBe('inspection-new');
    expect(mocks.riskCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ inspectionId: 'inspection-new' }) }));
    expect(mocks.caseUpdate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: CaseStatus.ORP_READY }) }));
  });

  it('reuses the canonical assessment without Case churn or exposing its fingerprint', async () => {
    const canonical = { id: 'risk-canonical', caseId: 'case', inspectionId: inspection.id, riskScore: 77, riskLevel: 'VERY_HIGH', priorityLevel: 'CRITICAL', assessmentVersion: 'ODYSSEY_RISK_V1', reasonCodes: ['R1'], reasons: [{ reasonCode: 'R1', message: 'Reason' }], sourceFingerprint: riskSourceFingerprint('case', inspection) };
    mocks.scope.mockResolvedValue({ id: 'case', status: CaseStatus.ORP_READY }); mocks.riskFind.mockResolvedValue(canonical);
    const reused = await runAssessmentForCase('case', principal);
    expect(reused).toMatchObject({ id: 'risk-canonical', reused: true, assessmentVersion: 'ODYSSEY_RISK_V1', riskScore: 77 });
    expect(reused).not.toHaveProperty('sourceFingerprint'); expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it('fails closed when the canonical assessment disagrees with the Case projection', async () => {
    mocks.scope.mockResolvedValue({ id: 'case', status: CaseStatus.ORP_READY });
    mocks.riskFind.mockResolvedValue({ id: 'risk', caseId: 'case', inspectionId: inspection.id, riskScore: 77, riskLevel: 'VERY_HIGH', priorityLevel: 'CRITICAL', assessmentVersion: 'ODYSSEY_RISK_V1', reasonCodes: [], reasons: [] });
    mocks.caseFind.mockResolvedValue({ status: CaseStatus.ORP_READY, riskLevel: 'HIGH', priorityLevel: 'HIGH' });
    await expect(runAssessmentForCase('case', principal)).rejects.toThrow('RISK_CASE_PROJECTION_INCONSISTENT');
    expect(mocks.caseUpdate).not.toHaveBeenCalled();
  });

  it('resolves a uniqueness race to the single winning canonical assessment', async () => {
    const winner = { id: 'risk-winner', caseId: 'case', inspectionId: inspection.id, riskScore: 77, riskLevel: 'VERY_HIGH', priorityLevel: 'CRITICAL', assessmentVersion: 'ODYSSEY_RISK_V1', reasonCodes: [], reasons: [] };
    let lookups = 0, transactions = 0;
    mocks.riskFind.mockImplementation(() => Promise.resolve(++lookups <= 2 ? null : winner));
    mocks.transaction.mockImplementation(async (callback: any) => {
      if (++transactions === 2) throw new Prisma.PrismaClientKnownRequestError('unique', { code: 'P2002', clientVersion: 'test' });
      return callback({ riskAssessment: { create: vi.fn().mockResolvedValue(winner) }, case: { update: mocks.caseUpdate } });
    });
    const [first, second] = await Promise.all([runAssessmentForCase('case', principal), runAssessmentForCase('case', principal)]);
    expect(first.id).toBe('risk-winner'); expect(second.id).toBe('risk-winner');
    expect([first.reused, second.reused].sort()).toEqual([false, true]);
  });

  it('derives a stable privacy-minimal fingerprint from all deterministic source fields', () => {
    const base = { ...inspection, inspectionNotes: 'private note', reporterName: 'private person' } as any;
    const fingerprint = riskSourceFingerprint('case', base);
    expect(fingerprint).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(riskSourceFingerprint('case', { ...base, inspectionNotes: 'different', reporterName: 'different' })).toBe(fingerprint);
    for (const changed of [
      ['structuralCondition', 'CRITICAL'], ['crackSeverity', 'MODERATE'], ['corrosionLevel', 'HIGH'], ['trafficImportance', 'LOW'],
      ['hospitalRoute', false], ['weatherRisk', 'LOW'], ['heavyRainExpected', false], ['estimatedDailyUsers', 1]
    ] as const) expect(riskSourceFingerprint('case', { ...base, [changed[0]]: changed[1] })).not.toBe(fingerprint);
    expect(riskSourceFingerprint('case', { ...base, id: 'inspection-other' })).not.toBe(fingerprint);
    expect(riskSourceFingerprint('case-other', base)).not.toBe(fingerprint);
    expect(riskSourceFingerprint('case', base, 'ODYSSEY_RISK_V2')).not.toBe(fingerprint);
  });

  it.each([CaseStatus.NEW, CaseStatus.INSPECTION_REQUIRED, CaseStatus.UNDER_ANALYSIS, CaseStatus.ORP_READY, CaseStatus.UNDER_REVIEW, CaseStatus.APPROVED, CaseStatus.EXECUTION, CaseStatus.VERIFICATION, CaseStatus.CLOSED, CaseStatus.CANCELLED])(
    'does not let %s jump to ORP_READY through risk', async (status) => {
      mocks.scope.mockResolvedValue({ id: 'case', status });
      await expect(runAssessmentForCase('case', principal)).rejects.toThrow('INVALID_CASE_STATE');
      expect(mocks.riskCreate).not.toHaveBeenCalled();
      expect(mocks.transaction).not.toHaveBeenCalled();
    }
  );
});
