import { describe, expect, it } from 'vitest';
import { PriorityLevel, RiskLevel } from '../src/generated/prisma';
import {
  buildIntelligenceFeatures,
  createIntelligenceSourceFingerprint,
  intelligenceOrdering,
  isIntelligenceAssessmentStale,
  reconcileSafetyFloor
} from '../src/modules/intelligence/intelligence.contracts';

const fingerprintSource = { caseId: 'case', inspectionId: 'inspection', riskAssessmentId: 'risk', featureSchemaVersion: 'FEATURES_V1', provider: 'controlled-provider', modelName: 'reference-contract', modelVersion: '1' };

describe('G7.1 intelligence contracts', () => {
  it('uses explicit non-lexical enum ordering including VERY_LOW', () => {
    expect(Object.keys(intelligenceOrdering.risk)).toEqual(['VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH', 'CRITICAL']);
    expect(intelligenceOrdering.risk.VERY_LOW).toBeLessThan(intelligenceOrdering.risk.LOW);
    expect(intelligenceOrdering.risk.VERY_HIGH).toBeLessThan(intelligenceOrdering.risk.CRITICAL);
    expect(Object.keys(intelligenceOrdering.priority)).toEqual(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH', 'CRITICAL']);
  });

  it('preserves the deterministic floor exhaustively for every risk and priority combination', () => {
    const risks = Object.keys(intelligenceOrdering.risk) as RiskLevel[];
    const priorities = Object.keys(intelligenceOrdering.priority) as PriorityLevel[];
    for (const deterministicRisk of risks) for (const advisoryRisk of risks) {
      for (const deterministicPriority of priorities) for (const advisoryPriority of priorities) {
        const result = reconcileSafetyFloor({ deterministicRisk, deterministicPriority, advisoryRisk, advisoryPriority });
        expect(intelligenceOrdering.risk[result.effectiveSafetyFloorRisk]).toBeGreaterThanOrEqual(intelligenceOrdering.risk[deterministicRisk]);
        expect(intelligenceOrdering.priority[result.effectiveSafetyFloorPriority]).toBeGreaterThanOrEqual(intelligenceOrdering.priority[deterministicPriority]);
        expect(result.deterministicFloorPreserved).toBe(true);
      }
    }
  });

  it('rejects an advisory downgrade and accepts an advisory escalation', () => {
    expect(reconcileSafetyFloor({ deterministicRisk: RiskLevel.CRITICAL, deterministicPriority: PriorityLevel.CRITICAL, advisoryRisk: RiskLevel.HIGH, advisoryPriority: PriorityLevel.HIGH })).toMatchObject({ effectiveSafetyFloorRisk: RiskLevel.CRITICAL, effectiveSafetyFloorPriority: PriorityLevel.CRITICAL, disagreement: true });
    expect(reconcileSafetyFloor({ deterministicRisk: RiskLevel.HIGH, deterministicPriority: PriorityLevel.HIGH, advisoryRisk: RiskLevel.VERY_HIGH, advisoryPriority: PriorityLevel.CRITICAL })).toMatchObject({ effectiveSafetyFloorRisk: RiskLevel.VERY_HIGH, effectiveSafetyFloorPriority: PriorityLevel.CRITICAL, disagreement: true });
  });

  it('uses deterministic values when advisory intelligence is unavailable', () => {
    expect(reconcileSafetyFloor({ deterministicRisk: RiskLevel.VERY_HIGH, deterministicPriority: PriorityLevel.VERY_HIGH })).toMatchObject({ advisoryRisk: null, advisoryPriority: null, effectiveSafetyFloorRisk: RiskLevel.VERY_HIGH, effectiveSafetyFloorPriority: PriorityLevel.VERY_HIGH, disagreement: false });
  });

  it('creates a deterministic non-PII SHA-256 fingerprint and changes with every authoritative/model source dimension', () => {
    const first = createIntelligenceSourceFingerprint(fingerprintSource);
    expect(first).toBe(createIntelligenceSourceFingerprint({ ...fingerprintSource }));
    expect(first).toMatch(/^sha256:[a-f0-9]{64}$/);
    for (const [field, value] of [['caseId', 'case-2'], ['inspectionId', 'inspection-2'], ['riskAssessmentId', 'risk-2'], ['featureSchemaVersion', 'FEATURES_V2'], ['provider', 'other'], ['modelName', 'other-model'], ['modelVersion', '2']] as const) {
      expect(createIntelligenceSourceFingerprint({ ...fingerprintSource, [field]: value })).not.toBe(first);
    }
  });

  it.each([
    ['newer inspection', { sourceInspectionId: 'old', sourceRiskAssessmentId: 'risk', currentInspectionId: 'new', currentRiskAssessmentId: 'risk', expiresAt: null }],
    ['newer deterministic assessment', { sourceInspectionId: 'inspection', sourceRiskAssessmentId: 'old', currentInspectionId: 'inspection', currentRiskAssessmentId: 'new', expiresAt: null }],
    ['expiry', { sourceInspectionId: 'inspection', sourceRiskAssessmentId: 'risk', currentInspectionId: 'inspection', currentRiskAssessmentId: 'risk', expiresAt: new Date('2026-08-21T23:59:59Z') }]
  ])('marks intelligence stale because of %s', (_reason, value) => {
    expect(isIntelligenceAssessmentStale({ ...value, now: new Date('2026-08-22T00:00:00Z') })).toBe(true);
  });

  it('keeps a current, unexpired result non-stale', () => {
    expect(isIntelligenceAssessmentStale({ sourceInspectionId: 'inspection', sourceRiskAssessmentId: 'risk', currentInspectionId: 'inspection', currentRiskAssessmentId: 'risk', expiresAt: new Date('2026-08-23T00:00:00Z'), now: new Date('2026-08-22T00:00:00Z') })).toBe(false);
  });

  it('constructs only allow-listed structured features and excludes PII, notes, credentials and free text', () => {
    const source = { caseId: 'case', inspectionId: 'inspection', riskAssessmentId: 'risk', assetType: 'BRIDGE', emergencyFlag: false, structuralCondition: 'POOR', crackSeverity: 'SEVERE', corrosionLevel: 'MODERATE', trafficImportance: 'HIGH', hospitalRoute: true, weatherRisk: 'HIGH', heavyRainExpected: true, estimatedDailyUsers: 42000, deterministicRiskScore: 77, deterministicRiskLevel: RiskLevel.VERY_HIGH, deterministicPriorityLevel: PriorityLevel.CRITICAL, deterministicAssessmentVersion: 'ODYSSEY_RISK_V1', reporterName: 'Citizen Name', reporterPhone: '9999999999', reporterEmail: 'citizen@example.test', citizenIdentity: 'secret', authenticationToken: 'Bearer secret', password: 'password', publicReportDescription: 'free text', inspectionNotes: 'private notes' };
    const features = buildIntelligenceFeatures(source);
    const serialized = JSON.stringify(features);
    for (const forbidden of ['Citizen Name', '9999999999', 'citizen@example.test', 'Bearer secret', 'password', 'free text', 'private notes', 'reporterName', 'inspectionNotes']) expect(serialized).not.toContain(forbidden);
  });
});
