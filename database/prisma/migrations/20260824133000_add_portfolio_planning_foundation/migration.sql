CREATE TYPE "PlanningEstimateStatus" AS ENUM ('ACTIVE', 'SUPERSEDED', 'WITHDRAWN');

CREATE TABLE "CaseResourceEstimate" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "estimateVersion" INTEGER NOT NULL,
    "status" "PlanningEstimateStatus" NOT NULL DEFAULT 'ACTIVE',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "estimatedCostMinor" BIGINT NOT NULL,
    "estimatedDurationDays" INTEGER,
    "resourceRequirements" JSONB NOT NULL,
    "estimateBasis" TEXT NOT NULL,
    "sourceReference" TEXT NOT NULL,
    "preparedById" TEXT NOT NULL,
    "preparedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseResourceEstimate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PortfolioScenario" (
    "id" TEXT NOT NULL,
    "scenarioVersion" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "budgetMinor" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "resourceCapacities" JSONB NOT NULL,
    "algorithmVersion" TEXT NOT NULL,
    "inputSnapshot" JSONB NOT NULL,
    "resultSnapshot" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PortfolioScenario_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CaseResourceEstimate_caseId_estimateVersion_key" ON "CaseResourceEstimate"("caseId", "estimateVersion");
CREATE INDEX "CaseResourceEstimate_caseId_status_estimateVersion_idx" ON "CaseResourceEstimate"("caseId", "status", "estimateVersion");
CREATE INDEX "CaseResourceEstimate_preparedById_idx" ON "CaseResourceEstimate"("preparedById");
CREATE INDEX "PortfolioScenario_departmentId_jurisdictionId_createdAt_idx" ON "PortfolioScenario"("departmentId", "jurisdictionId", "createdAt");
CREATE INDEX "PortfolioScenario_createdById_idx" ON "PortfolioScenario"("createdById");
ALTER TABLE "CaseResourceEstimate" ADD CONSTRAINT "CaseResourceEstimate_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CaseResourceEstimate" ADD CONSTRAINT "CaseResourceEstimate_preparedById_fkey" FOREIGN KEY ("preparedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PortfolioScenario" ADD CONSTRAINT "PortfolioScenario_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PortfolioScenario" ADD CONSTRAINT "PortfolioScenario_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "Jurisdiction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PortfolioScenario" ADD CONSTRAINT "PortfolioScenario_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
