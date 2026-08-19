CREATE TYPE "DecisionPackageStatus" AS ENUM ('PREPARED', 'SUPERSEDED');

CREATE TABLE "DecisionPackage" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "riskAssessmentId" TEXT NOT NULL,
    "packageVersion" INTEGER NOT NULL,
    "packageContractVersion" TEXT NOT NULL DEFAULT 'ODYSSEY_DECISION_PACKAGE_V1',
    "status" "DecisionPackageStatus" NOT NULL DEFAULT 'PREPARED',
    "sourceFingerprint" TEXT NOT NULL,
    "caseSnapshot" JSONB NOT NULL,
    "inspectionSnapshot" JSONB NOT NULL,
    "riskSnapshot" JSONB NOT NULL,
    "readinessSnapshot" JSONB NOT NULL,
    "policySnapshot" JSONB NOT NULL,
    "actionSnapshot" JSONB NOT NULL,
    "preparedById" TEXT NOT NULL,
    "preparedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DecisionPackage_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "OperationalResponsePlan" ADD COLUMN "decisionPackageId" TEXT;

CREATE UNIQUE INDEX "DecisionPackage_caseId_packageVersion_key" ON "DecisionPackage"("caseId", "packageVersion");
CREATE UNIQUE INDEX "DecisionPackage_caseId_sourceFingerprint_key" ON "DecisionPackage"("caseId", "sourceFingerprint");
CREATE INDEX "DecisionPackage_caseId_status_packageVersion_idx" ON "DecisionPackage"("caseId", "status", "packageVersion");
CREATE INDEX "DecisionPackage_inspectionId_idx" ON "DecisionPackage"("inspectionId");
CREATE INDEX "DecisionPackage_riskAssessmentId_idx" ON "DecisionPackage"("riskAssessmentId");
CREATE INDEX "DecisionPackage_preparedById_idx" ON "DecisionPackage"("preparedById");
CREATE INDEX "DecisionPackage_preparedAt_idx" ON "DecisionPackage"("preparedAt");
CREATE INDEX "OperationalResponsePlan_decisionPackageId_idx" ON "OperationalResponsePlan"("decisionPackageId");

ALTER TABLE "DecisionPackage" ADD CONSTRAINT "DecisionPackage_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DecisionPackage" ADD CONSTRAINT "DecisionPackage_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DecisionPackage" ADD CONSTRAINT "DecisionPackage_riskAssessmentId_fkey" FOREIGN KEY ("riskAssessmentId") REFERENCES "RiskAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DecisionPackage" ADD CONSTRAINT "DecisionPackage_preparedById_fkey" FOREIGN KEY ("preparedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OperationalResponsePlan" ADD CONSTRAINT "OperationalResponsePlan_decisionPackageId_fkey" FOREIGN KEY ("decisionPackageId") REFERENCES "DecisionPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
