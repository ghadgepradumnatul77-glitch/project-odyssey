import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ upsert: vi.fn(), findMany: vi.fn(), inspectionFind: vi.fn(), riskFind: vi.fn(), caseUpdate: vi.fn(), riskUpdate: vi.fn() }));
vi.mock('../src/lib/prisma', () => ({ default: {
  infrastructureIntelligenceAssessment: { upsert: mocks.upsert, findMany: mocks.findMany },
  inspection: { findUnique: mocks.inspectionFind },
  case: { update: mocks.caseUpdate }, riskAssessment: { findUnique: mocks.riskFind, update: mocks.riskUpdate }
} }));

import { appendIntelligenceAssessment, listIntelligenceAssessments } from '../src/modules/intelligence/intelligence.repository';

const input = {
  caseId: 'case', inspectionId: 'inspection', riskAssessmentId: 'risk', status: 'UNAVAILABLE' as const,
  provider: 'controlled-provider', providerType: 'REFERENCE_NON_ML', modelName: 'reference-contract', modelVersion: '1',
  featureSchemaVersion: 'FEATURES_V1', contractVersion: 'CONTRACT_V1', sourceFingerprint: 'sha256:fingerprint',
  inferredAt: new Date('2026-08-22T00:00:00Z'), contributingFactors: [], recommendedActions: [], abstentionReasons: [{ code: 'SERVICE_UNAVAILABLE' }],
  reconciliation: { deterministicFloorPreserved: true }
};

describe('append-only intelligence repository', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.upsert.mockResolvedValue({ id: 'intelligence', ...input }); mocks.findMany.mockResolvedValue([]); mocks.inspectionFind.mockResolvedValue({ caseId: 'case' }); mocks.riskFind.mockResolvedValue({ caseId: 'case', inspectionId: 'inspection' }); });

  it('uses the unique fingerprint idempotently and exposes no destructive update data', async () => {
    await appendIntelligenceAssessment(input);
    await appendIntelligenceAssessment(input);
    expect(mocks.upsert).toHaveBeenCalledTimes(2);
    expect(mocks.upsert).toHaveBeenCalledWith({ where: { sourceFingerprint: input.sourceFingerprint }, create: input, update: {} });
  });

  it('does not mutate Case or RiskAssessment while appending or reading intelligence', async () => {
    await appendIntelligenceAssessment(input);
    await listIntelligenceAssessments('case');
    expect(mocks.caseUpdate).not.toHaveBeenCalled();
    expect(mocks.riskUpdate).not.toHaveBeenCalled();
  });

  it('rejects mismatched authoritative source lineage before persistence', async () => {
    mocks.riskFind.mockResolvedValue({ caseId: 'another-case', inspectionId: 'inspection' });
    await expect(appendIntelligenceAssessment(input)).rejects.toMatchObject({ code: 'INTELLIGENCE_SOURCE_MISMATCH' });
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
});
