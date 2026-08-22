import { createHash } from 'node:crypto';
import { PriorityLevel, RiskLevel } from '../../generated/prisma';

export const INTELLIGENCE_CONTRACT_VERSION = 'ODYSSEY_INTELLIGENCE_V1';
export const INTELLIGENCE_FEATURE_SCHEMA_VERSION = 'ODYSSEY_INFRA_FEATURES_V1';

const riskRank: Record<RiskLevel, number> = {
  VERY_LOW: 0,
  LOW: 1,
  MODERATE: 2,
  HIGH: 3,
  VERY_HIGH: 4,
  CRITICAL: 5
};

const priorityRank: Record<PriorityLevel, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  VERY_HIGH: 3,
  CRITICAL: 4
};

export interface IntelligenceFeatureSource {
  caseId: string;
  inspectionId: string;
  riskAssessmentId: string;
  assetType: string;
  emergencyFlag: boolean;
  structuralCondition: string;
  crackSeverity: string;
  corrosionLevel: string;
  trafficImportance: string;
  hospitalRoute: boolean;
  weatherRisk: string;
  heavyRainExpected: boolean;
  estimatedDailyUsers: number | null;
  deterministicRiskScore: number;
  deterministicRiskLevel: RiskLevel;
  deterministicPriorityLevel: PriorityLevel;
  deterministicAssessmentVersion: string;
}

export function buildIntelligenceFeatures(source: IntelligenceFeatureSource) {
  return {
    featureSchemaVersion: INTELLIGENCE_FEATURE_SCHEMA_VERSION,
    caseId: source.caseId,
    inspectionId: source.inspectionId,
    riskAssessmentId: source.riskAssessmentId,
    assetType: source.assetType,
    emergencyFlag: source.emergencyFlag,
    structuralCondition: source.structuralCondition,
    crackSeverity: source.crackSeverity,
    corrosionLevel: source.corrosionLevel,
    trafficImportance: source.trafficImportance,
    hospitalRoute: source.hospitalRoute,
    weatherRisk: source.weatherRisk,
    heavyRainExpected: source.heavyRainExpected,
    estimatedDailyUsers: source.estimatedDailyUsers,
    deterministicRiskScore: source.deterministicRiskScore,
    deterministicRiskLevel: source.deterministicRiskLevel,
    deterministicPriorityLevel: source.deterministicPriorityLevel,
    deterministicAssessmentVersion: source.deterministicAssessmentVersion
  } as const;
}

export interface FingerprintSource {
  caseId: string;
  inspectionId: string;
  riskAssessmentId: string;
  featureSchemaVersion: string;
  provider: string;
  modelName: string;
  modelVersion: string;
}

export function createIntelligenceSourceFingerprint(source: FingerprintSource): string {
  const canonical = JSON.stringify({
    caseId: source.caseId,
    inspectionId: source.inspectionId,
    riskAssessmentId: source.riskAssessmentId,
    featureSchemaVersion: source.featureSchemaVersion,
    provider: source.provider,
    modelName: source.modelName,
    modelVersion: source.modelVersion
  });
  return `sha256:${createHash('sha256').update(canonical, 'utf8').digest('hex')}`;
}

function maximum<T extends string>(first: T, second: T | null | undefined, ranks: Record<T, number>): T {
  return second !== null && second !== undefined && ranks[second] > ranks[first] ? second : first;
}

export function reconcileSafetyFloor(input: {
  deterministicRisk: RiskLevel;
  deterministicPriority: PriorityLevel;
  advisoryRisk?: RiskLevel | null;
  advisoryPriority?: PriorityLevel | null;
}) {
  const effectiveSafetyFloorRisk = maximum(input.deterministicRisk, input.advisoryRisk, riskRank);
  const effectiveSafetyFloorPriority = maximum(input.deterministicPriority, input.advisoryPriority, priorityRank);
  const disagreement = (input.advisoryRisk != null && input.advisoryRisk !== input.deterministicRisk)
    || (input.advisoryPriority != null && input.advisoryPriority !== input.deterministicPriority);
  return {
    deterministicRisk: input.deterministicRisk,
    deterministicPriority: input.deterministicPriority,
    advisoryRisk: input.advisoryRisk ?? null,
    advisoryPriority: input.advisoryPriority ?? null,
    effectiveSafetyFloorRisk,
    effectiveSafetyFloorPriority,
    disagreement,
    deterministicFloorPreserved: riskRank[effectiveSafetyFloorRisk] >= riskRank[input.deterministicRisk]
      && priorityRank[effectiveSafetyFloorPriority] >= priorityRank[input.deterministicPriority]
  } as const;
}

export function isIntelligenceAssessmentStale(input: {
  sourceInspectionId: string;
  sourceRiskAssessmentId: string;
  currentInspectionId: string;
  currentRiskAssessmentId: string;
  expiresAt?: Date | null;
  now: Date;
}): boolean {
  return input.sourceInspectionId !== input.currentInspectionId
    || input.sourceRiskAssessmentId !== input.currentRiskAssessmentId
    || (input.expiresAt !== null && input.expiresAt !== undefined && input.expiresAt.getTime() <= input.now.getTime());
}

export const intelligenceOrdering = {
  risk: Object.freeze({ ...riskRank }),
  priority: Object.freeze({ ...priorityRank })
};
