-- CreateEnum
CREATE TYPE "ExecutionPlanStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'VERIFICATION_PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExecutionTaskStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETION_SUBMITTED', 'VERIFIED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExecutionEvidenceType" AS ENUM ('PHOTO_REFERENCE', 'DOCUMENT_REFERENCE', 'MEASUREMENT', 'COMPLETION_NOTE', 'INSPECTION_REPORT', 'OTHER');

-- CreateTable
CREATE TABLE "ExecutionPlan" (
    "id" TEXT NOT NULL,
    "orpId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "approvalDecisionId" TEXT NOT NULL,
    "status" "ExecutionPlanStatus" NOT NULL DEFAULT 'PLANNED',
    "createdById" TEXT NOT NULL,
    "templateVersion" TEXT NOT NULL DEFAULT 'ODYSSEY_EXECUTION_V1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,

    CONSTRAINT "ExecutionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionTask" (
    "id" TEXT NOT NULL,
    "executionPlanId" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "sourceActionCode" TEXT NOT NULL,
    "templateTaskKey" TEXT NOT NULL,
    "titleSnapshot" TEXT NOT NULL,
    "descriptionSnapshot" TEXT NOT NULL,
    "categorySnapshot" TEXT NOT NULL,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "status" "ExecutionTaskStatus" NOT NULL DEFAULT 'PENDING',
    "assignedToId" TEXT,
    "assignedById" TEXT,
    "assignedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completionSubmittedById" TEXT,
    "completionSubmittedAt" TIMESTAMP(3),
    "completionNote" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verificationNote" TEXT,
    "blockedReason" TEXT,
    "cancelledById" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExecutionTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionEvidence" (
    "id" TEXT NOT NULL,
    "executionTaskId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "evidenceType" "ExecutionEvidenceType" NOT NULL,
    "description" TEXT NOT NULL,
    "referenceUrl" TEXT,
    "documentReference" TEXT,
    "measurementData" JSONB,
    "capturedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutionEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionPlan_orpId_key" ON "ExecutionPlan"("orpId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionPlan_approvalDecisionId_key" ON "ExecutionPlan"("approvalDecisionId");

-- CreateIndex
CREATE INDEX "ExecutionPlan_caseId_idx" ON "ExecutionPlan"("caseId");

-- CreateIndex
CREATE INDEX "ExecutionPlan_status_idx" ON "ExecutionPlan"("status");

-- CreateIndex
CREATE INDEX "ExecutionPlan_createdById_idx" ON "ExecutionPlan"("createdById");

-- CreateIndex
CREATE INDEX "ExecutionTask_executionPlanId_idx" ON "ExecutionTask"("executionPlanId");

-- CreateIndex
CREATE INDEX "ExecutionTask_status_idx" ON "ExecutionTask"("status");

-- CreateIndex
CREATE INDEX "ExecutionTask_assignedToId_idx" ON "ExecutionTask"("assignedToId");

-- CreateIndex
CREATE INDEX "ExecutionTask_verifiedById_idx" ON "ExecutionTask"("verifiedById");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionTask_executionPlanId_sequenceNumber_key" ON "ExecutionTask"("executionPlanId", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionTask_executionPlanId_sourceActionCode_templateTask_key" ON "ExecutionTask"("executionPlanId", "sourceActionCode", "templateTaskKey");

-- CreateIndex
CREATE INDEX "ExecutionEvidence_executionTaskId_idx" ON "ExecutionEvidence"("executionTaskId");

-- CreateIndex
CREATE INDEX "ExecutionEvidence_submittedById_idx" ON "ExecutionEvidence"("submittedById");

-- CreateIndex
CREATE INDEX "ExecutionEvidence_evidenceType_idx" ON "ExecutionEvidence"("evidenceType");

-- CreateIndex
CREATE INDEX "ExecutionEvidence_submittedAt_idx" ON "ExecutionEvidence"("submittedAt");

-- AddForeignKey
ALTER TABLE "ExecutionPlan" ADD CONSTRAINT "ExecutionPlan_orpId_fkey" FOREIGN KEY ("orpId") REFERENCES "OperationalResponsePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionPlan" ADD CONSTRAINT "ExecutionPlan_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionPlan" ADD CONSTRAINT "ExecutionPlan_approvalDecisionId_fkey" FOREIGN KEY ("approvalDecisionId") REFERENCES "OrpDecision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionPlan" ADD CONSTRAINT "ExecutionPlan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionTask" ADD CONSTRAINT "ExecutionTask_executionPlanId_fkey" FOREIGN KEY ("executionPlanId") REFERENCES "ExecutionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionTask" ADD CONSTRAINT "ExecutionTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionTask" ADD CONSTRAINT "ExecutionTask_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionTask" ADD CONSTRAINT "ExecutionTask_completionSubmittedById_fkey" FOREIGN KEY ("completionSubmittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionTask" ADD CONSTRAINT "ExecutionTask_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionTask" ADD CONSTRAINT "ExecutionTask_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionEvidence" ADD CONSTRAINT "ExecutionEvidence_executionTaskId_fkey" FOREIGN KEY ("executionTaskId") REFERENCES "ExecutionTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionEvidence" ADD CONSTRAINT "ExecutionEvidence_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
