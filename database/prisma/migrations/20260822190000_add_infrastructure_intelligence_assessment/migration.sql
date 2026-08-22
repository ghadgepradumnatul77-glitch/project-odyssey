-- Phase G7.1 adds append-only advisory intelligence provenance.
-- It does not alter or backfill authoritative Case or RiskAssessment data.
CREATE TYPE "IntelligenceAssessmentStatus" AS ENUM (
  'COMPLETED',
  'ABSTAINED',
  'UNAVAILABLE',
  'INVALID_RESPONSE',
  'STALE'
);

CREATE TABLE "InfrastructureIntelligenceAssessment" (
  "id" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "inspectionId" TEXT NOT NULL,
  "riskAssessmentId" TEXT NOT NULL,
  "status" "IntelligenceAssessmentStatus" NOT NULL,
  "predictedRiskScore" INTEGER,
  "predictedRiskLevel" "RiskLevel",
  "recommendedPriority" "PriorityLevel",
  "confidence" DOUBLE PRECISION,
  "provider" TEXT NOT NULL,
  "modelName" TEXT NOT NULL,
  "modelVersion" TEXT NOT NULL,
  "modelArtifactDigest" TEXT,
  "featureSchemaVersion" TEXT NOT NULL,
  "contractVersion" TEXT NOT NULL,
  "sourceFingerprint" TEXT NOT NULL,
  "inferredAt" TIMESTAMP(3) NOT NULL,
  "expiresAt" TIMESTAMP(3),
  "contributingFactors" JSONB NOT NULL,
  "explanation" TEXT,
  "recommendedActions" JSONB NOT NULL,
  "abstentionReasons" JSONB NOT NULL,
  "reconciliation" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InfrastructureIntelligenceAssessment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "InfrastructureIntelligenceAssessment_sourceFingerprint_key"
  ON "InfrastructureIntelligenceAssessment"("sourceFingerprint");
CREATE INDEX "InfrastructureIntelligenceAssessment_caseId_inferredAt_idx"
  ON "InfrastructureIntelligenceAssessment"("caseId", "inferredAt");
CREATE INDEX "InfrastructureIntelligenceAssessment_inspectionId_idx"
  ON "InfrastructureIntelligenceAssessment"("inspectionId");
CREATE INDEX "InfrastructureIntelligenceAssessment_riskAssessmentId_idx"
  ON "InfrastructureIntelligenceAssessment"("riskAssessmentId");
CREATE INDEX "InfrastructureIntelligenceAssessment_status_idx"
  ON "InfrastructureIntelligenceAssessment"("status");
CREATE INDEX "InfrastructureIntelligenceAssessment_provider_modelName_modelVersion_idx"
  ON "InfrastructureIntelligenceAssessment"("provider", "modelName", "modelVersion");

ALTER TABLE "InfrastructureIntelligenceAssessment"
  ADD CONSTRAINT "InfrastructureIntelligenceAssessment_caseId_fkey"
  FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InfrastructureIntelligenceAssessment"
  ADD CONSTRAINT "InfrastructureIntelligenceAssessment_inspectionId_fkey"
  FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InfrastructureIntelligenceAssessment"
  ADD CONSTRAINT "InfrastructureIntelligenceAssessment_riskAssessmentId_fkey"
  FOREIGN KEY ("riskAssessmentId") REFERENCES "RiskAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
