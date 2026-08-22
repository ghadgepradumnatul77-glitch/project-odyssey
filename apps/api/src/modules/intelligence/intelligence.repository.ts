import { IntelligenceAssessmentStatus, Prisma } from '../../generated/prisma';
import prisma from '../../lib/prisma';

export class IntelligencePersistenceError extends Error {
  constructor(public code: 'INTELLIGENCE_SOURCE_MISMATCH') {
    super(code);
  }
}

export interface AppendIntelligenceAssessmentInput {
  caseId: string;
  inspectionId: string;
  riskAssessmentId: string;
  status: IntelligenceAssessmentStatus;
  predictedRiskScore?: number | null;
  predictedRiskLevel?: Prisma.InfrastructureIntelligenceAssessmentCreateInput['predictedRiskLevel'];
  recommendedPriority?: Prisma.InfrastructureIntelligenceAssessmentCreateInput['recommendedPriority'];
  confidence?: number | null;
  provider: string;
  providerType: string;
  modelName: string;
  modelVersion: string;
  modelArtifactDigest?: string | null;
  featureSchemaVersion: string;
  contractVersion: string;
  sourceFingerprint: string;
  inferredAt: Date;
  expiresAt?: Date | null;
  contributingFactors: Prisma.InputJsonValue;
  explanation?: string | null;
  recommendedActions: Prisma.InputJsonValue;
  abstentionReasons: Prisma.InputJsonValue;
  reconciliation: Prisma.InputJsonValue;
}

/** Append-only by design: this module intentionally exposes no update or delete operation. */
export async function appendIntelligenceAssessment(input: AppendIntelligenceAssessmentInput) {
  const [inspection, riskAssessment] = await Promise.all([
    prisma.inspection.findUnique({ where: { id: input.inspectionId }, select: { caseId: true } }),
    prisma.riskAssessment.findUnique({ where: { id: input.riskAssessmentId }, select: { caseId: true, inspectionId: true } })
  ]);
  if (!inspection || !riskAssessment || inspection.caseId !== input.caseId || riskAssessment.caseId !== input.caseId || riskAssessment.inspectionId !== input.inspectionId) {
    throw new IntelligencePersistenceError('INTELLIGENCE_SOURCE_MISMATCH');
  }
  return prisma.infrastructureIntelligenceAssessment.upsert({
    where: { sourceFingerprint: input.sourceFingerprint },
    create: input,
    update: {}
  });
}

export async function listIntelligenceAssessments(caseId: string) {
  return prisma.infrastructureIntelligenceAssessment.findMany({
    where: { caseId },
    orderBy: [{ inferredAt: 'desc' }, { id: 'desc' }]
  });
}
