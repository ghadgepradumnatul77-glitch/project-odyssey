-- CreateEnum
CREATE TYPE "ObservationSourceType" AS ENUM ('OFFICIAL_GOVERNMENT', 'WEATHER_PROVIDER', 'TRAFFIC_PROVIDER', 'SENSOR_PLATFORM', 'MANUAL_IMPORT', 'INTERNAL_SYSTEM');

-- CreateEnum
CREATE TYPE "ExternalObservationType" AS ENUM ('WEATHER', 'TRAFFIC', 'SENSOR', 'GOVERNMENT_DATA', 'MANUAL_EXTERNAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ObservationQualityState" AS ENUM ('VALID', 'PARTIAL', 'INVALID', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ObservationValidationState" AS ENUM ('ACCEPTED', 'REJECTED', 'QUARANTINED');

-- CreateTable
CREATE TABLE "ObservationSource" (
    "id" TEXT NOT NULL,
    "sourceCode" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "sourceType" "ObservationSourceType" NOT NULL,
    "providerReference" TEXT NOT NULL,
    "description" TEXT,
    "contractVersion" TEXT NOT NULL,
    "provenanceMetadata" JSONB NOT NULL,
    "departmentId" TEXT,
    "jurisdictionId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "deactivatedById" TEXT,
    "deactivatedAt" TIMESTAMP(3),
    "deactivationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObservationSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalObservation" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceRecordId" TEXT NOT NULL,
    "sourceVersion" TEXT NOT NULL,
    "observationType" "ExternalObservationType" NOT NULL,
    "schemaVersion" TEXT NOT NULL,
    "normalizedData" JSONB NOT NULL,
    "sourceMetadata" JSONB NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "qualityState" "ObservationQualityState" NOT NULL,
    "validationState" "ObservationValidationState" NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "assetId" TEXT,
    "caseId" TEXT,
    "ingestedById" TEXT NOT NULL,

    CONSTRAINT "ExternalObservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ObservationSource_createdAt_id_idx" ON "ObservationSource"("createdAt", "id");

-- CreateIndex
CREATE INDEX "ObservationSource_isActive_sourceType_idx" ON "ObservationSource"("isActive", "sourceType");

-- CreateIndex
CREATE INDEX "ObservationSource_departmentId_jurisdictionId_idx" ON "ObservationSource"("departmentId", "jurisdictionId");

-- CreateIndex
CREATE UNIQUE INDEX "ObservationSource_sourceCode_versionNumber_key" ON "ObservationSource"("sourceCode", "versionNumber");

-- CreateIndex
CREATE INDEX "ExternalObservation_ingestedAt_id_idx" ON "ExternalObservation"("ingestedAt", "id");

-- CreateIndex
CREATE INDEX "ExternalObservation_departmentId_jurisdictionId_ingestedAt_idx" ON "ExternalObservation"("departmentId", "jurisdictionId", "ingestedAt");

-- CreateIndex
CREATE INDEX "ExternalObservation_assetId_observedAt_idx" ON "ExternalObservation"("assetId", "observedAt");

-- CreateIndex
CREATE INDEX "ExternalObservation_caseId_observedAt_idx" ON "ExternalObservation"("caseId", "observedAt");

-- CreateIndex
CREATE INDEX "ExternalObservation_sourceId_observationType_observedAt_idx" ON "ExternalObservation"("sourceId", "observationType", "observedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalObservation_sourceId_sourceRecordId_key" ON "ExternalObservation"("sourceId", "sourceRecordId");

-- RenameForeignKey
ALTER TABLE "InfrastructureIntelligenceReconciliation" RENAME CONSTRAINT "InfrastructureIntelligenceReconciliation_intelligenceAssessment" TO "InfrastructureIntelligenceReconciliation_intelligenceAsses_fkey";

-- AddForeignKey
ALTER TABLE "ObservationSource" ADD CONSTRAINT "ObservationSource_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObservationSource" ADD CONSTRAINT "ObservationSource_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "Jurisdiction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObservationSource" ADD CONSTRAINT "ObservationSource_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObservationSource" ADD CONSTRAINT "ObservationSource_deactivatedById_fkey" FOREIGN KEY ("deactivatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalObservation" ADD CONSTRAINT "ExternalObservation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ObservationSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalObservation" ADD CONSTRAINT "ExternalObservation_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalObservation" ADD CONSTRAINT "ExternalObservation_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "Jurisdiction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalObservation" ADD CONSTRAINT "ExternalObservation_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalObservation" ADD CONSTRAINT "ExternalObservation_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalObservation" ADD CONSTRAINT "ExternalObservation_ingestedById_fkey" FOREIGN KEY ("ingestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "GovernedExecutionTaskTemplate_executionTemplateId_sequenceNumbe" RENAME TO "GovernedExecutionTaskTemplate_executionTemplateId_sequenceN_key";

-- RenameIndex
ALTER INDEX "GovernedExecutionTemplate_approvedActionVersionId_status_effect" RENAME TO "GovernedExecutionTemplate_approvedActionVersionId_status_ef_idx";

-- RenameIndex
ALTER INDEX "InfrastructureIntelligenceAssessment_provider_modelName_modelVe" RENAME TO "InfrastructureIntelligenceAssessment_provider_modelName_mod_idx";

-- RenameIndex
ALTER INDEX "InfrastructureIntelligenceReconciliation_caseId_reconciledAt_id" RENAME TO "InfrastructureIntelligenceReconciliation_caseId_reconciledA_idx";

-- RenameIndex
ALTER INDEX "InfrastructureIntelligenceReconciliation_governanceFingerprint_" RENAME TO "InfrastructureIntelligenceReconciliation_governanceFingerpr_key";

-- RenameIndex
ALTER INDEX "InfrastructureIntelligenceReconciliation_intelligenceAssessment" RENAME TO "InfrastructureIntelligenceReconciliation_intelligenceAssess_idx";
