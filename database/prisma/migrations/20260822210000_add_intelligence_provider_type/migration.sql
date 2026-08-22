-- Persist explicit provider classification instead of inferring non-ML status from a provider name.
ALTER TABLE "InfrastructureIntelligenceAssessment"
  ADD COLUMN "providerType" TEXT NOT NULL;
