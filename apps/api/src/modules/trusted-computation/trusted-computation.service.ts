import prisma from '../../lib/prisma';
import type { OrganizationalPrincipal } from '../../security/organizational-scope';
import { buildRiskAssessmentReadWhere } from '../../security/organizational-scope';
import { calculateRiskAndPriority, RISK_ASSESSMENT_VERSION } from '../risk/risk.service';
import {
  canonicalRiskInput,
  canonicalRiskResult,
  COMPUTATION_TYPE,
  LOCAL_PROVIDER_ID,
  RECEIPT_VERSION,
  sha256Fingerprint,
  TRUSTED_INPUT_VERSION
} from './trusted-computation.provider';

const receiptSelect = {
  receiptVersion: true, computationType: true, inputContractVersion: true,
  inputFingerprint: true, computationVersion: true, providerId: true,
  runtimeTrustLevel: true, resultFingerprint: true, executedAt: true,
  attestationState: true, attestationReference: true, createdAt: true
} as const;

export class TrustedComputationNotFoundError extends Error {}

async function loadAssessment(id: string, principal: OrganizationalPrincipal) {
  const assessment = await prisma.riskAssessment.findFirst({
    where: { id, AND: [buildRiskAssessmentReadWhere(principal)] },
    include: { inspection: true, trustedComputationReceipt: { select: receiptSelect } }
  });
  if (!assessment) throw new TrustedComputationNotFoundError();
  return assessment;
}

export async function getComputationReceipt(id: string, principal: OrganizationalPrincipal) {
  const assessment = await loadAssessment(id, principal);
  return assessment.trustedComputationReceipt
    ? { status: 'AVAILABLE' as const, assessmentId: assessment.id, receipt: assessment.trustedComputationReceipt }
    : { status: 'RECEIPT_MISSING' as const, assessmentId: assessment.id, receipt: null };
}

export async function verifyRiskComputation(id: string, principal: OrganizationalPrincipal) {
  const assessment = await loadAssessment(id, principal);
  const receipt = assessment.trustedComputationReceipt;
  const base = { assessmentId: assessment.id, verifiedAt: new Date().toISOString() };
  if (!receipt) return { ...base, status: 'RECEIPT_MISSING' as const, verified: false };
  if (
    receipt.receiptVersion !== RECEIPT_VERSION || receipt.computationType !== COMPUTATION_TYPE ||
    receipt.inputContractVersion !== TRUSTED_INPUT_VERSION || receipt.computationVersion !== RISK_ASSESSMENT_VERSION ||
    receipt.providerId !== LOCAL_PROVIDER_ID || receipt.runtimeTrustLevel !== 'LOCAL_VERIFIED'
  ) return { ...base, status: 'UNSUPPORTED_VERSION' as const, verified: false };

  const inputFingerprint = sha256Fingerprint(canonicalRiskInput(assessment.caseId, assessment.inspection, assessment.assessmentVersion));
  if (inputFingerprint !== receipt.inputFingerprint) return { ...base, status: 'INPUT_MISMATCH' as const, verified: false };

  const recomputed = calculateRiskAndPriority(assessment.inspection);
  const recomputedFingerprint = sha256Fingerprint(canonicalRiskResult(recomputed, assessment.assessmentVersion));
  const storedFingerprint = sha256Fingerprint(canonicalRiskResult({
    riskScore: assessment.riskScore, riskLevel: assessment.riskLevel, priorityLevel: assessment.priorityLevel,
    reasonCodes: Array.isArray(assessment.reasonCodes) ? assessment.reasonCodes.filter((v): v is string => typeof v === 'string') : [],
    reasons: Array.isArray(assessment.reasons) ? assessment.reasons.filter((v): v is { reasonCode: string; message: string } =>
      Boolean(v && typeof v === 'object' && typeof (v as any).reasonCode === 'string' && typeof (v as any).message === 'string')) : []
  }, assessment.assessmentVersion));
  if (storedFingerprint !== receipt.resultFingerprint || recomputedFingerprint !== receipt.resultFingerprint) {
    return { ...base, status: 'RESULT_MISMATCH' as const, verified: false };
  }
  return {
    ...base, status: 'VALID' as const, verified: true, inputFingerprint, resultFingerprint: receipt.resultFingerprint,
    providerId: receipt.providerId, runtimeTrustLevel: receipt.runtimeTrustLevel,
    attestationState: receipt.attestationState
  };
}
