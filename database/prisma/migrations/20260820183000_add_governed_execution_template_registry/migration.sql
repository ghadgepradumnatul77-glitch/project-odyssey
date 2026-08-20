CREATE TYPE "ExecutionPlanGovernanceMode" AS ENUM ('LEGACY', 'GOVERNED');

CREATE TABLE "GovernedExecutionTemplate" (
  "id" TEXT NOT NULL,
  "templateCode" TEXT NOT NULL,
  "versionNumber" INTEGER NOT NULL,
  "approvedActionVersionId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" "RegistryLifecycleStatus" NOT NULL DEFAULT 'DRAFT',
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveUntil" TIMESTAMP(3),
  "departmentId" TEXT,
  "jurisdictionId" TEXT,
  "createdById" TEXT NOT NULL,
  "approvedById" TEXT,
  "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GovernedExecutionTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GovernedExecutionTaskTemplate" (
  "id" TEXT NOT NULL,
  "executionTemplateId" TEXT NOT NULL,
  "sequenceNumber" INTEGER NOT NULL,
  "taskCode" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "mandatory" BOOLEAN NOT NULL DEFAULT true,
  "evidenceRequired" BOOLEAN NOT NULL DEFAULT true,
  "verificationRequired" BOOLEAN NOT NULL DEFAULT true,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GovernedExecutionTaskTemplate_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ExecutionPlan"
  ADD COLUMN "governanceMode" "ExecutionPlanGovernanceMode" NOT NULL DEFAULT 'LEGACY',
  ADD COLUMN "executionContractVersion" TEXT,
  ADD COLUMN "governedProvenance" JSONB;

ALTER TABLE "ExecutionTask"
  ADD COLUMN "approvedActionVersionId" TEXT,
  ADD COLUMN "governedExecutionTemplateId" TEXT,
  ADD COLUMN "governedTaskTemplateId" TEXT,
  ADD COLUMN "sourceActionVersion" INTEGER,
  ADD COLUMN "sourceTemplateCode" TEXT,
  ADD COLUMN "sourceTemplateVersion" INTEGER,
  ADD COLUMN "evidenceRequired" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "verificationRequired" BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX "GovernedExecutionTemplate_templateCode_versionNumber_key" ON "GovernedExecutionTemplate"("templateCode", "versionNumber");
CREATE INDEX "GovernedExecutionTemplate_approvedActionVersionId_status_effectiveFrom_effectiveUntil_idx" ON "GovernedExecutionTemplate"("approvedActionVersionId", "status", "effectiveFrom", "effectiveUntil");
CREATE INDEX "GovernedExecutionTemplate_departmentId_jurisdictionId_idx" ON "GovernedExecutionTemplate"("departmentId", "jurisdictionId");
CREATE INDEX "GovernedExecutionTemplate_createdById_idx" ON "GovernedExecutionTemplate"("createdById");
CREATE INDEX "GovernedExecutionTemplate_approvedById_idx" ON "GovernedExecutionTemplate"("approvedById");
CREATE UNIQUE INDEX "GovernedExecutionTaskTemplate_executionTemplateId_sequenceNumber_key" ON "GovernedExecutionTaskTemplate"("executionTemplateId", "sequenceNumber");
CREATE UNIQUE INDEX "GovernedExecutionTaskTemplate_executionTemplateId_taskCode_key" ON "GovernedExecutionTaskTemplate"("executionTemplateId", "taskCode");
CREATE INDEX "GovernedExecutionTaskTemplate_executionTemplateId_enabled_idx" ON "GovernedExecutionTaskTemplate"("executionTemplateId", "enabled");
CREATE INDEX "ExecutionTask_approvedActionVersionId_idx" ON "ExecutionTask"("approvedActionVersionId");
CREATE INDEX "ExecutionTask_governedExecutionTemplateId_idx" ON "ExecutionTask"("governedExecutionTemplateId");
CREATE INDEX "ExecutionTask_governedTaskTemplateId_idx" ON "ExecutionTask"("governedTaskTemplateId");

ALTER TABLE "GovernedExecutionTemplate" ADD CONSTRAINT "GovernedExecutionTemplate_approvedActionVersionId_fkey" FOREIGN KEY ("approvedActionVersionId") REFERENCES "ApprovedActionVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GovernedExecutionTemplate" ADD CONSTRAINT "GovernedExecutionTemplate_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GovernedExecutionTemplate" ADD CONSTRAINT "GovernedExecutionTemplate_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "Jurisdiction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GovernedExecutionTemplate" ADD CONSTRAINT "GovernedExecutionTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GovernedExecutionTemplate" ADD CONSTRAINT "GovernedExecutionTemplate_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GovernedExecutionTaskTemplate" ADD CONSTRAINT "GovernedExecutionTaskTemplate_executionTemplateId_fkey" FOREIGN KEY ("executionTemplateId") REFERENCES "GovernedExecutionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExecutionTask" ADD CONSTRAINT "ExecutionTask_approvedActionVersionId_fkey" FOREIGN KEY ("approvedActionVersionId") REFERENCES "ApprovedActionVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExecutionTask" ADD CONSTRAINT "ExecutionTask_governedExecutionTemplateId_fkey" FOREIGN KEY ("governedExecutionTemplateId") REFERENCES "GovernedExecutionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExecutionTask" ADD CONSTRAINT "ExecutionTask_governedTaskTemplateId_fkey" FOREIGN KEY ("governedTaskTemplateId") REFERENCES "GovernedExecutionTaskTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
