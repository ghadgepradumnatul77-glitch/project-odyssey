import { describe, expect, it } from 'vitest';
import { Inspection, PriorityLevel, RiskLevel } from '../src/generated/prisma';
import { generateORPActions } from '../src/modules/orp/orp.service';

function inspection(overrides: Partial<Inspection> = {}): Inspection {
  return {
    id: 'inspection-1',
    caseId: 'case-1',
    inspectorId: 'officer-1',
    inspectionDate: new Date('2026-08-10T00:00:00Z'),
    structuralCondition: 'GOOD',
    crackSeverity: 'NONE',
    corrosionLevel: 'LOW',
    trafficImportance: 'LOW',
    hospitalRoute: false,
    weatherRisk: 'LOW',
    heavyRainExpected: false,
    estimatedDailyUsers: 100,
    inspectionNotes: null,
    createdAt: new Date('2026-08-10T00:00:00Z'),
    updatedAt: new Date('2026-08-10T00:00:00Z'),
    ...overrides
  };
}

function actions(result: ReturnType<typeof generateORPActions>) {
  return new Set(result.recommendedActionCodes);
}

describe('generateORPActions', () => {
  it('A001 selects the critical-risk response', () => {
    const result = generateORPActions(RiskLevel.CRITICAL, PriorityLevel.LOW, inspection());
    expect(actions(result)).toEqual(new Set([
      'ACT_RESTRICT_HEAVY_VEHICLES',
      'ACT_INSPECT_DETAILED',
      'ACT_TEMP_STABILIZATION',
      'ACT_INCREASE_MONITORING'
    ]));
    expect(result.urgency).toBe('IMMEDIATE');
  });

  it('A002 selects the very-high-risk response', () => {
    const result = generateORPActions(RiskLevel.VERY_HIGH, PriorityLevel.LOW, inspection());
    expect(actions(result)).toEqual(new Set([
      'ACT_INSPECT_DETAILED',
      'ACT_INCREASE_MONITORING',
      'ACT_PERMANENT_REPAIR_PLANNING'
    ]));
    expect(result.urgency).toBe('URGENT');
  });

  it('A003 escalates critical priority and urgency', () => {
    const result = generateORPActions(RiskLevel.LOW, PriorityLevel.CRITICAL, inspection());
    expect(actions(result)).toEqual(new Set(['ACT_ESCALATE_AUTHORITY', 'ACT_TRAFFIC_MANAGEMENT']));
    expect(result.urgency).toBe('IMMEDIATE');
  });

  it('A004 selects stabilization and monitoring for severe cracks plus rain', () => {
    const result = generateORPActions(
      RiskLevel.HIGH,
      PriorityLevel.HIGH,
      inspection({ crackSeverity: 'SEVERE', heavyRainExpected: true })
    );
    expect(actions(result)).toEqual(new Set(['ACT_TEMP_STABILIZATION', 'ACT_INCREASE_MONITORING']));
  });

  it('A005 selects traffic management for a high-importance hospital route', () => {
    const result = generateORPActions(
      RiskLevel.HIGH,
      PriorityLevel.HIGH,
      inspection({ hospitalRoute: true, trafficImportance: 'HIGH' })
    );
    expect(actions(result)).toEqual(new Set(['ACT_TRAFFIC_MANAGEMENT']));
  });

  it('A006 selects permanent repair planning for poor condition and severe cracks', () => {
    const result = generateORPActions(
      RiskLevel.HIGH,
      PriorityLevel.HIGH,
      inspection({ structuralCondition: 'POOR', crackSeverity: 'SEVERE' })
    );
    expect(actions(result)).toEqual(new Set(['ACT_PERMANENT_REPAIR_PLANNING']));
  });

  it('A007 suppresses emergency stabilization for moderate risk', () => {
    const result = generateORPActions(
      RiskLevel.MODERATE,
      PriorityLevel.MEDIUM,
      inspection({ crackSeverity: 'SEVERE', heavyRainExpected: true })
    );
    expect(result.recommendedActionCodes).not.toContain('ACT_TEMP_STABILIZATION');
    expect(result.recommendedActionCodes).toContain('ACT_INCREASE_MONITORING');
  });

  it('deduplicates overlapping actions and escalates urgency', () => {
    const result = generateORPActions(
      RiskLevel.CRITICAL,
      PriorityLevel.CRITICAL,
      inspection({ crackSeverity: 'SEVERE', heavyRainExpected: true })
    );
    expect(result.recommendedActionCodes.length).toBe(new Set(result.recommendedActionCodes).size);
    expect(result.recommendedActionCodes.filter((code) => code === 'ACT_INCREASE_MONITORING')).toHaveLength(1);
    expect(result.urgency).toBe('IMMEDIATE');
  });

  it('produces the expected BR-101 action set and rule reasons', () => {
    const result = generateORPActions(
      RiskLevel.VERY_HIGH,
      PriorityLevel.CRITICAL,
      inspection({
        structuralCondition: 'POOR',
        crackSeverity: 'SEVERE',
        corrosionLevel: 'MODERATE',
        trafficImportance: 'HIGH',
        hospitalRoute: true,
        weatherRisk: 'HIGH',
        heavyRainExpected: true,
        estimatedDailyUsers: 42000
      })
    );
    expect(actions(result)).toEqual(new Set([
      'ACT_INSPECT_DETAILED',
      'ACT_INCREASE_MONITORING',
      'ACT_PERMANENT_REPAIR_PLANNING',
      'ACT_ESCALATE_AUTHORITY',
      'ACT_TRAFFIC_MANAGEMENT',
      'ACT_TEMP_STABILIZATION'
    ]));
    expect(result.recommendedActionCodes).not.toContain('ACT_RESTRICT_HEAVY_VEHICLES');
    expect(result.reasons.map(({ reasonCode }) => reasonCode)).toEqual(expect.arrayContaining([
      'ORP_RULE_A002', 'ORP_RULE_A003', 'ORP_RULE_A004', 'ORP_RULE_A005', 'ORP_RULE_A006'
    ]));
    expect(result.urgency).toBe('IMMEDIATE');
  });
});
