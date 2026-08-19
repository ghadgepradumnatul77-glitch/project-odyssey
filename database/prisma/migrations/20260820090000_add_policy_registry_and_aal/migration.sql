CREATE TYPE "RegistryLifecycleStatus" AS ENUM ('DRAFT', 'VALIDATION', 'APPROVED', 'ACTIVE', 'SUPERSEDED', 'ARCHIVED');
CREATE TYPE "PolicyValidationState" AS ENUM ('NOT_VALIDATED', 'VALIDATED', 'REJECTED');
CREATE TYPE "EnforcementClassification" AS ENUM ('MANDATORY', 'RECOMMENDED', 'OPTIONAL', 'PROHIBITED');

CREATE TABLE "PolicyDocument" (
  "id" TEXT NOT NULL,
  "policyCode" TEXT NOT NULL,
  "versionNumber" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "sourceTitle" TEXT NOT NULL,
  "sourceReference" TEXT NOT NULL,
  "sourceUrl" TEXT,
  "departmentId" TEXT,
  "jurisdictionId" TEXT,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveUntil" TIMESTAMP(3),
  "status" "RegistryLifecycleStatus" NOT NULL DEFAULT 'DRAFT',
  "validationState" "PolicyValidationState" NOT NULL DEFAULT 'NOT_VALIDATED',
  "createdById" TEXT NOT NULL,
  "approvedById" TEXT,
  "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PolicyDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApprovedActionVersion" (
  "id" TEXT NOT NULL,
  "actionCode" TEXT NOT NULL,
  "versionNumber" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "applicability" JSONB NOT NULL,
  "enforcementClassification" "EnforcementClassification" NOT NULL,
  "provenancePolicyDocumentId" TEXT,
  "sourceReference" TEXT NOT NULL,
  "departmentId" TEXT,
  "jurisdictionId" TEXT,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveUntil" TIMESTAMP(3),
  "status" "RegistryLifecycleStatus" NOT NULL DEFAULT 'DRAFT',
  "createdById" TEXT NOT NULL,
  "approvedById" TEXT,
  "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ApprovedActionVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PolicyRule" (
  "id" TEXT NOT NULL,
  "policyDocumentId" TEXT NOT NULL,
  "ruleCode" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "conditions" JSONB NOT NULL,
  "actionId" TEXT NOT NULL,
  "enforcementLevel" "EnforcementClassification" NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PolicyRule_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PolicyDocument_policyCode_versionNumber_key" ON "PolicyDocument"("policyCode", "versionNumber");
CREATE INDEX "PolicyDocument_status_effectiveFrom_effectiveUntil_idx" ON "PolicyDocument"("status", "effectiveFrom", "effectiveUntil");
CREATE INDEX "PolicyDocument_departmentId_jurisdictionId_idx" ON "PolicyDocument"("departmentId", "jurisdictionId");
CREATE INDEX "PolicyDocument_createdById_idx" ON "PolicyDocument"("createdById");
CREATE INDEX "PolicyDocument_approvedById_idx" ON "PolicyDocument"("approvedById");
CREATE UNIQUE INDEX "ApprovedActionVersion_actionCode_versionNumber_key" ON "ApprovedActionVersion"("actionCode", "versionNumber");
CREATE INDEX "ApprovedActionVersion_status_effectiveFrom_effectiveUntil_idx" ON "ApprovedActionVersion"("status", "effectiveFrom", "effectiveUntil");
CREATE INDEX "ApprovedActionVersion_departmentId_jurisdictionId_idx" ON "ApprovedActionVersion"("departmentId", "jurisdictionId");
CREATE INDEX "ApprovedActionVersion_provenancePolicyDocumentId_idx" ON "ApprovedActionVersion"("provenancePolicyDocumentId");
CREATE INDEX "ApprovedActionVersion_createdById_idx" ON "ApprovedActionVersion"("createdById");
CREATE INDEX "ApprovedActionVersion_approvedById_idx" ON "ApprovedActionVersion"("approvedById");
CREATE UNIQUE INDEX "PolicyRule_policyDocumentId_ruleCode_key" ON "PolicyRule"("policyDocumentId", "ruleCode");
CREATE INDEX "PolicyRule_actionId_idx" ON "PolicyRule"("actionId");
CREATE INDEX "PolicyRule_enforcementLevel_idx" ON "PolicyRule"("enforcementLevel");

ALTER TABLE "PolicyDocument" ADD CONSTRAINT "PolicyDocument_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PolicyDocument" ADD CONSTRAINT "PolicyDocument_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "Jurisdiction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PolicyDocument" ADD CONSTRAINT "PolicyDocument_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PolicyDocument" ADD CONSTRAINT "PolicyDocument_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ApprovedActionVersion" ADD CONSTRAINT "ApprovedActionVersion_provenancePolicyDocumentId_fkey" FOREIGN KEY ("provenancePolicyDocumentId") REFERENCES "PolicyDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ApprovedActionVersion" ADD CONSTRAINT "ApprovedActionVersion_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ApprovedActionVersion" ADD CONSTRAINT "ApprovedActionVersion_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "Jurisdiction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ApprovedActionVersion" ADD CONSTRAINT "ApprovedActionVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ApprovedActionVersion" ADD CONSTRAINT "ApprovedActionVersion_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PolicyRule" ADD CONSTRAINT "PolicyRule_policyDocumentId_fkey" FOREIGN KEY ("policyDocumentId") REFERENCES "PolicyDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PolicyRule" ADD CONSTRAINT "PolicyRule_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "ApprovedActionVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
