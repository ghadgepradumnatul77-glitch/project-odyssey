CREATE TYPE "PredictiveProvenanceClass" AS ENUM ('PRODUCTION', 'PILOT', 'DEMO', 'SYNTHETIC', 'TEST');
CREATE TYPE "PredictiveTargetType" AS ENUM ('TASK_LATENESS');
CREATE TYPE "PredictiveRecordStatus" AS ENUM ('ACTIVE', 'VOID');
CREATE TYPE "PredictiveOutcomeValue" AS ENUM ('LATE', 'ON_TIME', 'CANCELLED');

CREATE TABLE "PredictiveFeatureSnapshot" (
    "id" TEXT NOT NULL,
    "targetType" "PredictiveTargetType" NOT NULL,
    "executionTaskId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "predictionTimestamp" TIMESTAMP(3) NOT NULL,
    "featureContractVersion" TEXT NOT NULL,
    "featurePayload" JSONB NOT NULL,
    "provenanceClass" "PredictiveProvenanceClass" NOT NULL,
    "sourceReferences" JSONB NOT NULL,
    "sourceFingerprint" TEXT NOT NULL,
    "status" "PredictiveRecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "voidedAt" TIMESTAMP(3),
    "voidedById" TEXT,
    "voidReason" TEXT,
    "replacementSnapshotId" TEXT,
    CONSTRAINT "PredictiveFeatureSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PredictiveOutcome" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "outcomeContractVersion" TEXT NOT NULL,
    "outcomeTimestamp" TIMESTAMP(3) NOT NULL,
    "outcomeValue" "PredictiveOutcomeValue" NOT NULL,
    "provenanceClass" "PredictiveProvenanceClass" NOT NULL,
    "sourceReferences" JSONB NOT NULL,
    "sourceFingerprint" TEXT NOT NULL,
    "status" "PredictiveRecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "recordedById" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "voidedAt" TIMESTAMP(3),
    "voidedById" TEXT,
    "voidReason" TEXT,
    "replacementOutcomeId" TEXT,
    CONSTRAINT "PredictiveOutcome_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PredictiveFeatureSnapshot_sourceFingerprint_key" ON "PredictiveFeatureSnapshot"("sourceFingerprint");
CREATE UNIQUE INDEX "PredictiveFeatureSnapshot_replacementSnapshotId_key" ON "PredictiveFeatureSnapshot"("replacementSnapshotId");
CREATE UNIQUE INDEX "PredictiveFeatureSnapshot_executionTaskId_targetType_featureContractVersion_key" ON "PredictiveFeatureSnapshot"("executionTaskId", "targetType", "featureContractVersion");
CREATE INDEX "PredictiveFeatureSnapshot_departmentId_jurisdictionId_targetType_predictionTimestamp_id_idx" ON "PredictiveFeatureSnapshot"("departmentId", "jurisdictionId", "targetType", "predictionTimestamp", "id");
CREATE INDEX "PredictiveFeatureSnapshot_provenanceClass_status_idx" ON "PredictiveFeatureSnapshot"("provenanceClass", "status");
CREATE INDEX "PredictiveFeatureSnapshot_caseId_idx" ON "PredictiveFeatureSnapshot"("caseId");
CREATE INDEX "PredictiveFeatureSnapshot_assetId_idx" ON "PredictiveFeatureSnapshot"("assetId");
CREATE INDEX "PredictiveFeatureSnapshot_createdById_idx" ON "PredictiveFeatureSnapshot"("createdById");
CREATE UNIQUE INDEX "PredictiveOutcome_sourceFingerprint_key" ON "PredictiveOutcome"("sourceFingerprint");
CREATE UNIQUE INDEX "PredictiveOutcome_replacementOutcomeId_key" ON "PredictiveOutcome"("replacementOutcomeId");
CREATE UNIQUE INDEX "PredictiveOutcome_snapshotId_outcomeContractVersion_key" ON "PredictiveOutcome"("snapshotId", "outcomeContractVersion");
CREATE INDEX "PredictiveOutcome_outcomeValue_outcomeTimestamp_idx" ON "PredictiveOutcome"("outcomeValue", "outcomeTimestamp");
CREATE INDEX "PredictiveOutcome_provenanceClass_status_idx" ON "PredictiveOutcome"("provenanceClass", "status");
CREATE INDEX "PredictiveOutcome_recordedById_idx" ON "PredictiveOutcome"("recordedById");

ALTER TABLE "PredictiveFeatureSnapshot" ADD CONSTRAINT "PredictiveFeatureSnapshot_executionTaskId_fkey" FOREIGN KEY ("executionTaskId") REFERENCES "ExecutionTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PredictiveFeatureSnapshot" ADD CONSTRAINT "PredictiveFeatureSnapshot_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PredictiveFeatureSnapshot" ADD CONSTRAINT "PredictiveFeatureSnapshot_voidedById_fkey" FOREIGN KEY ("voidedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PredictiveFeatureSnapshot" ADD CONSTRAINT "PredictiveFeatureSnapshot_replacementSnapshotId_fkey" FOREIGN KEY ("replacementSnapshotId") REFERENCES "PredictiveFeatureSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PredictiveOutcome" ADD CONSTRAINT "PredictiveOutcome_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "PredictiveFeatureSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PredictiveOutcome" ADD CONSTRAINT "PredictiveOutcome_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PredictiveOutcome" ADD CONSTRAINT "PredictiveOutcome_voidedById_fkey" FOREIGN KEY ("voidedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PredictiveOutcome" ADD CONSTRAINT "PredictiveOutcome_replacementOutcomeId_fkey" FOREIGN KEY ("replacementOutcomeId") REFERENCES "PredictiveOutcome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
