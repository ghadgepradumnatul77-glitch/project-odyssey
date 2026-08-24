CREATE TYPE "PredictiveModelLifecycleStatus" AS ENUM ('EXPERIMENTAL', 'EVALUATED', 'REJECTED', 'VALIDATED', 'APPROVED', 'ACTIVE', 'DEPRECATED');
CREATE TYPE "PredictiveModelApprovalDecision" AS ENUM ('APPROVED', 'REJECTED');
CREATE TYPE "PredictiveModelLifecycleAction" AS ENUM ('REGISTERED', 'EVALUATED', 'VALIDATED', 'APPROVED', 'REJECTED', 'ACTIVATED', 'REPLACED', 'DEPRECATED', 'ROLLED_BACK');

CREATE TABLE "PredictiveDatasetSnapshot" (
  "id" TEXT NOT NULL, "datasetContractVersion" TEXT NOT NULL, "targetType" "PredictiveTargetType" NOT NULL,
  "featureContractVersion" TEXT NOT NULL, "outcomeContractVersion" TEXT NOT NULL, "departmentId" TEXT, "jurisdictionId" TEXT,
  "includedProvenance" JSONB NOT NULL, "sampleCount" INTEGER NOT NULL, "classBalance" JSONB NOT NULL,
  "periodStart" TIMESTAMP(3), "periodEnd" TIMESTAMP(3), "sampleIdentities" JSONB NOT NULL,
  "datasetFingerprint" TEXT NOT NULL, "createdById" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PredictiveDatasetSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PredictiveModelVersion" (
  "id" TEXT NOT NULL, "modelName" TEXT NOT NULL, "modelVersion" TEXT NOT NULL, "targetType" "PredictiveTargetType" NOT NULL,
  "deploymentSlot" TEXT NOT NULL, "intendedUse" TEXT NOT NULL, "forbiddenUse" TEXT NOT NULL,
  "featureContractVersion" TEXT NOT NULL, "outcomeContractVersion" TEXT NOT NULL, "datasetSnapshotId" TEXT NOT NULL,
  "trainingCodeVersion" TEXT NOT NULL, "artifactReference" TEXT NOT NULL, "artifactDigest" TEXT NOT NULL, "artifactFormat" TEXT NOT NULL,
  "artifactSizeBytes" BIGINT, "trainingTimestamp" TIMESTAMP(3) NOT NULL,
  "lifecycleStatus" "PredictiveModelLifecycleStatus" NOT NULL DEFAULT 'EXPERIMENTAL',
  "createdById" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "validatedById" TEXT, "validatedAt" TIMESTAMP(3), CONSTRAINT "PredictiveModelVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PredictiveModelEvaluation" (
  "id" TEXT NOT NULL, "modelVersionId" TEXT NOT NULL, "datasetSnapshotId" TEXT NOT NULL, "evaluationContractVersion" TEXT NOT NULL,
  "splitStrategy" TEXT NOT NULL, "evaluationPeriodStart" TIMESTAMP(3) NOT NULL, "evaluationPeriodEnd" TIMESTAMP(3) NOT NULL,
  "testSampleCount" INTEGER NOT NULL, "lateCount" INTEGER NOT NULL, "onTimeCount" INTEGER NOT NULL,
  "truePositiveCount" INTEGER NOT NULL, "trueNegativeCount" INTEGER NOT NULL, "falsePositiveCount" INTEGER NOT NULL, "falseNegativeCount" INTEGER NOT NULL,
  "precision" DOUBLE PRECISION NOT NULL, "recall" DOUBLE PRECISION NOT NULL, "f1" DOUBLE PRECISION NOT NULL, "prAuc" DOUBLE PRECISION NOT NULL,
  "calibrationError" DOUBLE PRECISION NOT NULL, "falseNegativeRate" DOUBLE PRECISION NOT NULL,
  "baselineEvidence" JSONB NOT NULL, "subgroupMetricsReference" JSONB, "featureDistributionReference" JSONB, "missingnessReference" JSONB,
  "evaluationArtifactReference" TEXT NOT NULL, "evaluationFingerprint" TEXT NOT NULL,
  "recordedById" TEXT NOT NULL, "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PredictiveModelEvaluation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PredictiveModelApproval" (
  "id" TEXT NOT NULL, "modelVersionId" TEXT NOT NULL, "decision" "PredictiveModelApprovalDecision" NOT NULL,
  "reason" TEXT NOT NULL, "restrictions" JSONB, "reviewDueAt" TIMESTAMP(3), "approvalExpiresAt" TIMESTAMP(3),
  "approvedById" TEXT NOT NULL, "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PredictiveModelApproval_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PredictiveModelLifecycleEvent" (
  "id" TEXT NOT NULL, "modelVersionId" TEXT NOT NULL, "action" "PredictiveModelLifecycleAction" NOT NULL,
  "fromStatus" "PredictiveModelLifecycleStatus", "toStatus" "PredictiveModelLifecycleStatus" NOT NULL,
  "reason" TEXT NOT NULL, "relatedModelVersionId" TEXT, "actorId" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PredictiveModelLifecycleEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PredictiveDatasetSnapshot_datasetFingerprint_key" ON "PredictiveDatasetSnapshot"("datasetFingerprint");
CREATE INDEX "PredictiveDatasetSnapshot_targetType_createdAt_id_idx" ON "PredictiveDatasetSnapshot"("targetType", "createdAt", "id");
CREATE INDEX "PredictiveDatasetSnapshot_departmentId_jurisdictionId_createdAt_idx" ON "PredictiveDatasetSnapshot"("departmentId", "jurisdictionId", "createdAt");
CREATE INDEX "PredictiveDatasetSnapshot_createdById_idx" ON "PredictiveDatasetSnapshot"("createdById");
CREATE UNIQUE INDEX "PredictiveModelVersion_modelName_modelVersion_targetType_key" ON "PredictiveModelVersion"("modelName", "modelVersion", "targetType");
CREATE UNIQUE INDEX "PredictiveModelVersion_single_active_slot" ON "PredictiveModelVersion"("modelName", "targetType", "deploymentSlot") WHERE "lifecycleStatus" = 'ACTIVE';
CREATE INDEX "PredictiveModelVersion_targetType_lifecycleStatus_createdAt_id_idx" ON "PredictiveModelVersion"("targetType", "lifecycleStatus", "createdAt", "id");
CREATE INDEX "PredictiveModelVersion_deploymentSlot_lifecycleStatus_idx" ON "PredictiveModelVersion"("deploymentSlot", "lifecycleStatus");
CREATE INDEX "PredictiveModelVersion_datasetSnapshotId_idx" ON "PredictiveModelVersion"("datasetSnapshotId");
CREATE INDEX "PredictiveModelVersion_createdById_idx" ON "PredictiveModelVersion"("createdById");
CREATE UNIQUE INDEX "PredictiveModelEvaluation_evaluationFingerprint_key" ON "PredictiveModelEvaluation"("evaluationFingerprint");
CREATE UNIQUE INDEX "PredictiveModelEvaluation_modelVersionId_datasetSnapshotId_evaluationContractVersion_key" ON "PredictiveModelEvaluation"("modelVersionId", "datasetSnapshotId", "evaluationContractVersion");
CREATE INDEX "PredictiveModelEvaluation_modelVersionId_recordedAt_idx" ON "PredictiveModelEvaluation"("modelVersionId", "recordedAt");
CREATE INDEX "PredictiveModelEvaluation_datasetSnapshotId_idx" ON "PredictiveModelEvaluation"("datasetSnapshotId");
CREATE INDEX "PredictiveModelEvaluation_recordedById_idx" ON "PredictiveModelEvaluation"("recordedById");
CREATE UNIQUE INDEX "PredictiveModelApproval_modelVersionId_key" ON "PredictiveModelApproval"("modelVersionId");
CREATE INDEX "PredictiveModelApproval_approvedById_idx" ON "PredictiveModelApproval"("approvedById");
CREATE INDEX "PredictiveModelApproval_decision_approvalExpiresAt_idx" ON "PredictiveModelApproval"("decision", "approvalExpiresAt");
CREATE INDEX "PredictiveModelLifecycleEvent_modelVersionId_occurredAt_id_idx" ON "PredictiveModelLifecycleEvent"("modelVersionId", "occurredAt", "id");
CREATE INDEX "PredictiveModelLifecycleEvent_actorId_idx" ON "PredictiveModelLifecycleEvent"("actorId");
CREATE INDEX "PredictiveModelLifecycleEvent_action_occurredAt_idx" ON "PredictiveModelLifecycleEvent"("action", "occurredAt");

ALTER TABLE "PredictiveDatasetSnapshot" ADD CONSTRAINT "PredictiveDatasetSnapshot_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PredictiveModelVersion" ADD CONSTRAINT "PredictiveModelVersion_datasetSnapshotId_fkey" FOREIGN KEY ("datasetSnapshotId") REFERENCES "PredictiveDatasetSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PredictiveModelVersion" ADD CONSTRAINT "PredictiveModelVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PredictiveModelVersion" ADD CONSTRAINT "PredictiveModelVersion_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PredictiveModelEvaluation" ADD CONSTRAINT "PredictiveModelEvaluation_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "PredictiveModelVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PredictiveModelEvaluation" ADD CONSTRAINT "PredictiveModelEvaluation_datasetSnapshotId_fkey" FOREIGN KEY ("datasetSnapshotId") REFERENCES "PredictiveDatasetSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PredictiveModelEvaluation" ADD CONSTRAINT "PredictiveModelEvaluation_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PredictiveModelApproval" ADD CONSTRAINT "PredictiveModelApproval_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "PredictiveModelVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PredictiveModelApproval" ADD CONSTRAINT "PredictiveModelApproval_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PredictiveModelLifecycleEvent" ADD CONSTRAINT "PredictiveModelLifecycleEvent_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "PredictiveModelVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PredictiveModelLifecycleEvent" ADD CONSTRAINT "PredictiveModelLifecycleEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
