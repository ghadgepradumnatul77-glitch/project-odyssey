import { describe, expect, it } from 'vitest';
import { Inspection, PriorityLevel, RiskLevel } from '../src/generated/prisma';
import { calculateRiskAndPriority } from '../src/modules/risk/risk.service';

function inspection(overrides: Partial<Inspection> = {}): Inspection {
  return {
    id: 'inspection', caseId: 'case', inspectorId: 'officer', inspectionDate: new Date('2026-08-22T00:00:00Z'),
    structuralCondition: 'GOOD', crackSeverity: 'NONE', corrosionLevel: 'NONE', trafficImportance: 'LOW',
    hospitalRoute: false, weatherRisk: 'LOW', heavyRainExpected: false, estimatedDailyUsers: 0,
    inspectionNotes: null, createdAt: new Date('2026-08-22T00:00:00Z'), updatedAt: new Date('2026-08-22T00:00:00Z'),
    ...overrides
  };
}

describe('ODYSSEY_RISK_V1 characterization', () => {
  it('keeps benign inputs at the lower LOW boundary and does not produce VERY_LOW', () => {
    expect(calculateRiskAndPriority(inspection())).toMatchObject({ riskScore: 0, riskLevel: RiskLevel.LOW, priorityLevel: PriorityLevel.LOW, reasonCodes: [] });
  });

  it.each([
    [24, RiskLevel.LOW, { weatherRisk: 'HIGH', hospitalRoute: true, heavyRainExpected: true, estimatedDailyUsers: 30000 }],
    [25, RiskLevel.MODERATE, { trafficImportance: 'MEDIUM', weatherRisk: 'MEDIUM', hospitalRoute: true, heavyRainExpected: true, estimatedDailyUsers: 30000 }],
    [49, RiskLevel.MODERATE, { crackSeverity: 'MINOR', corrosionLevel: 'HIGH', trafficImportance: 'HIGH', weatherRisk: 'HIGH', hospitalRoute: true, heavyRainExpected: true, estimatedDailyUsers: 50000 }],
    [50, RiskLevel.HIGH, { crackSeverity: 'MINOR', corrosionLevel: 'MODERATE', trafficImportance: 'CRITICAL', weatherRisk: 'SEVERE', hospitalRoute: true, heavyRainExpected: true, estimatedDailyUsers: 50000 }],
    [74, RiskLevel.HIGH, { structuralCondition: 'POOR', crackSeverity: 'MODERATE', corrosionLevel: 'HIGH', trafficImportance: 'HIGH', weatherRisk: 'HIGH', hospitalRoute: true, heavyRainExpected: true, estimatedDailyUsers: 50000 }],
    [75, RiskLevel.VERY_HIGH, { structuralCondition: 'POOR', crackSeverity: 'MODERATE', corrosionLevel: 'MODERATE', trafficImportance: 'CRITICAL', weatherRisk: 'SEVERE', hospitalRoute: true, heavyRainExpected: true, estimatedDailyUsers: 50000 }],
    [90, RiskLevel.CRITICAL, { structuralCondition: 'CRITICAL', crackSeverity: 'SEVERE', corrosionLevel: 'MODERATE', trafficImportance: 'CRITICAL', weatherRisk: 'SEVERE', hospitalRoute: true, heavyRainExpected: true, estimatedDailyUsers: 50000 }]
  ])('maps score %i to %s under existing scoring and escalation semantics', (score, level, overrides) => {
    expect(calculateRiskAndPriority(inspection(overrides)).riskScore).toBe(score);
    expect(calculateRiskAndPriority(inspection(overrides)).riskLevel).toBe(level);
  });

  it('bounds all accepted maximum inputs to the 0-100 score contract', () => {
    const result = calculateRiskAndPriority(inspection({ structuralCondition: 'CRITICAL', crackSeverity: 'SEVERE', corrosionLevel: 'HIGH', trafficImportance: 'CRITICAL', hospitalRoute: true, weatherRisk: 'SEVERE', heavyRainExpected: true, estimatedDailyUsers: 50000 }));
    expect(result.riskScore).toBe(93);
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
  });

  it.each([
    ['POLICY_R001', { structuralCondition: 'CRITICAL' }, RiskLevel.CRITICAL, PriorityLevel.CRITICAL],
    ['POLICY_R002', { structuralCondition: 'POOR', crackSeverity: 'SEVERE' }, RiskLevel.VERY_HIGH, PriorityLevel.VERY_HIGH],
    ['POLICY_R003', { crackSeverity: 'SEVERE', heavyRainExpected: true }, RiskLevel.VERY_HIGH, PriorityLevel.MEDIUM],
    ['POLICY_R004', { structuralCondition: 'POOR', crackSeverity: 'MODERATE', corrosionLevel: 'HIGH', trafficImportance: 'HIGH', weatherRisk: 'MEDIUM', hospitalRoute: true }, RiskLevel.HIGH, PriorityLevel.VERY_HIGH],
    ['POLICY_R005', { structuralCondition: 'POOR', crackSeverity: 'MODERATE', corrosionLevel: 'HIGH', trafficImportance: 'HIGH', estimatedDailyUsers: 30000 }, RiskLevel.HIGH, PriorityLevel.VERY_HIGH],
    ['POLICY_R006', { structuralCondition: 'POOR', crackSeverity: 'SEVERE', hospitalRoute: true, heavyRainExpected: true }, RiskLevel.VERY_HIGH, PriorityLevel.CRITICAL]
  ])('preserves %s escalation and its reason code', (code, overrides, riskLevel, priorityLevel) => {
    const result = calculateRiskAndPriority(inspection(overrides));
    expect(result).toMatchObject({ riskLevel, priorityLevel });
    expect(result.reasonCodes).toContain(code);
    expect(result.reasons).toContainEqual(expect.objectContaining({ reasonCode: code }));
  });

  it('generates deterministic input and policy reasons without duplicates', () => {
    const result = calculateRiskAndPriority(inspection({ structuralCondition: 'POOR', crackSeverity: 'SEVERE', corrosionLevel: 'MODERATE', trafficImportance: 'HIGH', hospitalRoute: true, weatherRisk: 'HIGH', heavyRainExpected: true, estimatedDailyUsers: 42000 }));
    expect(result).toMatchObject({ riskScore: 77, riskLevel: RiskLevel.VERY_HIGH, priorityLevel: PriorityLevel.CRITICAL });
    expect(result.reasonCodes).toEqual(['STRUCTURAL_CONDITION_POOR', 'SEVERE_CRACKING', 'MODERATE_CORROSION', 'HIGH_TRAFFIC_IMPORTANCE', 'HIGH_WEATHER_RISK', 'HOSPITAL_ROUTE', 'HEAVY_RAIN_EXPECTED', 'HIGH_PUBLIC_EXPOSURE', 'POLICY_R002', 'POLICY_R003', 'POLICY_R004', 'POLICY_R005', 'POLICY_R006']);
    expect(new Set(result.reasonCodes).size).toBe(result.reasonCodes.length);
  });

  it('is repeatable and ODYSSEY_RISK_V1 never emits the Prisma VERY_LOW level', () => {
    const input = inspection({ structuralCondition: 'FAIR', crackSeverity: 'MODERATE', estimatedDailyUsers: 16000 });
    expect(calculateRiskAndPriority(input)).toEqual(calculateRiskAndPriority(input));
    const representative = [inspection(), input, inspection({ structuralCondition: 'CRITICAL' })].map(calculateRiskAndPriority);
    expect(representative.every((result) => result.riskLevel !== RiskLevel.VERY_LOW)).toBe(true);
  });
});
