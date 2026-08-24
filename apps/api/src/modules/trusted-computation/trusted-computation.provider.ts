import { createHash } from 'node:crypto';
import type { Inspection } from '../../generated/prisma';
import type { RiskCalculationResult } from '../risk/risk.service';

export const TRUSTED_INPUT_VERSION = 'ODYSSEY_RISK_TRUSTED_INPUT_V1';
export const RECEIPT_VERSION = 'ODYSSEY_TRUSTED_COMPUTATION_RECEIPT_V1';
export const COMPUTATION_TYPE = 'DETERMINISTIC_RISK_ASSESSMENT';
export const LOCAL_PROVIDER_ID = 'ODYSSEY_LOCAL_VERIFIED_V1';

export type RiskMaterialInput = Pick<Inspection,
  'id' | 'structuralCondition' | 'crackSeverity' | 'corrosionLevel' | 'trafficImportance' |
  'hospitalRoute' | 'weatherRisk' | 'heavyRainExpected' | 'estimatedDailyUsers'>;

export interface CanonicalRiskInput {
  inputContractVersion: typeof TRUSTED_INPUT_VERSION;
  computationVersion: string;
  caseId: string;
  inspectionId: string;
  structuralCondition: string;
  crackSeverity: string;
  corrosionLevel: string;
  trafficImportance: string;
  hospitalRoute: boolean;
  weatherRisk: string;
  heavyRainExpected: boolean;
  estimatedDailyUsers: number | null;
}

export interface TrustedRiskExecution {
  result: RiskCalculationResult;
  receipt: {
    receiptVersion: typeof RECEIPT_VERSION;
    computationType: typeof COMPUTATION_TYPE;
    inputContractVersion: typeof TRUSTED_INPUT_VERSION;
    inputFingerprint: string;
    computationVersion: string;
    providerId: typeof LOCAL_PROVIDER_ID;
    runtimeTrustLevel: 'LOCAL_VERIFIED';
    resultFingerprint: string;
    executedAt: Date;
    attestationState: 'NOT_AVAILABLE';
    attestationReference: null;
  };
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
}

export function sha256Fingerprint(value: unknown): string {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`;
}

export function canonicalRiskInput(caseId: string, inspection: RiskMaterialInput, computationVersion: string): CanonicalRiskInput {
  if (!caseId || !inspection.id) throw new Error('INVALID_TRUSTED_COMPUTATION_INPUT');
  if (inspection.estimatedDailyUsers !== null && (!Number.isInteger(inspection.estimatedDailyUsers) || inspection.estimatedDailyUsers < 0)) {
    throw new Error('INVALID_TRUSTED_COMPUTATION_INPUT');
  }
  return {
    inputContractVersion: TRUSTED_INPUT_VERSION, computationVersion, caseId, inspectionId: inspection.id,
    structuralCondition: inspection.structuralCondition, crackSeverity: inspection.crackSeverity,
    corrosionLevel: inspection.corrosionLevel, trafficImportance: inspection.trafficImportance,
    hospitalRoute: inspection.hospitalRoute, weatherRisk: inspection.weatherRisk,
    heavyRainExpected: inspection.heavyRainExpected, estimatedDailyUsers: inspection.estimatedDailyUsers
  };
}

export function canonicalRiskResult(result: RiskCalculationResult, computationVersion: string) {
  return {
    computationVersion,
    riskScore: result.riskScore,
    riskLevel: result.riskLevel,
    priorityLevel: result.priorityLevel,
    reasonCodes: [...result.reasonCodes],
    reasons: result.reasons.map(({ reasonCode, message }) => ({ reasonCode, message }))
  };
}

export interface TrustedRiskComputationProvider {
  readonly providerId: string;
  readonly runtimeTrustLevel: 'LOCAL_VERIFIED';
  execute(caseId: string, inspection: RiskMaterialInput, computationVersion: string, calculator: (inspection: Inspection) => RiskCalculationResult): TrustedRiskExecution;
}

export const localVerifiedRiskProvider: TrustedRiskComputationProvider = {
  providerId: LOCAL_PROVIDER_ID,
  runtimeTrustLevel: 'LOCAL_VERIFIED',
  execute(caseId, inspection, computationVersion, calculator) {
    const input = canonicalRiskInput(caseId, inspection, computationVersion);
    const result = calculator(inspection as Inspection);
    return {
      result,
      receipt: {
        receiptVersion: RECEIPT_VERSION, computationType: COMPUTATION_TYPE,
        inputContractVersion: TRUSTED_INPUT_VERSION, inputFingerprint: sha256Fingerprint(input),
        computationVersion, providerId: LOCAL_PROVIDER_ID, runtimeTrustLevel: 'LOCAL_VERIFIED',
        resultFingerprint: sha256Fingerprint(canonicalRiskResult(result, computationVersion)),
        executedAt: new Date(), attestationState: 'NOT_AVAILABLE', attestationReference: null
      }
    };
  }
};
