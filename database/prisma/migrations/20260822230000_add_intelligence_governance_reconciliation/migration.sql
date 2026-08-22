CREATE TABLE "InfrastructureIntelligenceReconciliation" (
  "id" TEXT NOT NULL,
  "intelligenceAssessmentId" TEXT NOT NULL,
  "caseId" TEXT NOT NULL,
  "contractVersion" TEXT NOT NULL,
  "governanceFingerprint" TEXT NOT NULL,
  "policyResolutionStatus" TEXT NOT NULL,
  "policySnapshot" JSONB NOT NULL,
  "reconciledActions" JSONB NOT NULL,
  "issues" JSONB NOT NULL,
  "reconciledAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InfrastructureIntelligenceReconciliation_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "DecisionPackage" ADD COLUMN "intelligenceSnapshot" JSONB;
CREATE UNIQUE INDEX "InfrastructureIntelligenceReconciliation_governanceFingerprint_key" ON "InfrastructureIntelligenceReconciliation"("governanceFingerprint");
CREATE INDEX "InfrastructureIntelligenceReconciliation_intelligenceAssessmentId_reconciledAt_idx" ON "InfrastructureIntelligenceReconciliation"("intelligenceAssessmentId", "reconciledAt");
CREATE INDEX "InfrastructureIntelligenceReconciliation_caseId_reconciledAt_idx" ON "InfrastructureIntelligenceReconciliation"("caseId", "reconciledAt");
ALTER TABLE "InfrastructureIntelligenceReconciliation" ADD CONSTRAINT "InfrastructureIntelligenceReconciliation_intelligenceAssessmentId_fkey" FOREIGN KEY ("intelligenceAssessmentId") REFERENCES "InfrastructureIntelligenceAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InfrastructureIntelligenceReconciliation" ADD CONSTRAINT "InfrastructureIntelligenceReconciliation_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
