-- CreateTable
CREATE TABLE "OperationalResponsePlan" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "riskAssessmentId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AWAITING_REVIEW',
    "urgency" TEXT NOT NULL,
    "recommendedActionCodes" JSONB NOT NULL,
    "temporaryMeasures" JSONB NOT NULL,
    "reasons" JSONB NOT NULL,
    "alternativeActionCodes" JSONB NOT NULL,
    "planVersion" TEXT NOT NULL DEFAULT 'ODYSSEY_ORP_V1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationalResponsePlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OperationalResponsePlan_caseId_idx" ON "OperationalResponsePlan"("caseId");

-- CreateIndex
CREATE INDEX "OperationalResponsePlan_riskAssessmentId_idx" ON "OperationalResponsePlan"("riskAssessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "OperationalResponsePlan_caseId_versionNumber_key" ON "OperationalResponsePlan"("caseId", "versionNumber");

-- AddForeignKey
ALTER TABLE "OperationalResponsePlan" ADD CONSTRAINT "OperationalResponsePlan_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationalResponsePlan" ADD CONSTRAINT "OperationalResponsePlan_riskAssessmentId_fkey" FOREIGN KEY ("riskAssessmentId") REFERENCES "RiskAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
