-- AlterEnum
ALTER TYPE "PriorityLevel" ADD VALUE 'VERY_HIGH';

-- AlterEnum
ALTER TYPE "RiskLevel" ADD VALUE 'VERY_HIGH';

-- CreateTable
CREATE TABLE "RiskAssessment" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "priorityLevel" "PriorityLevel" NOT NULL,
    "reasonCodes" JSONB NOT NULL,
    "reasons" JSONB NOT NULL,
    "assessmentVersion" TEXT NOT NULL DEFAULT 'ODYSSEY_RISK_V1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RiskAssessment_caseId_idx" ON "RiskAssessment"("caseId");

-- CreateIndex
CREATE INDEX "RiskAssessment_inspectionId_idx" ON "RiskAssessment"("inspectionId");

-- AddForeignKey
ALTER TABLE "RiskAssessment" ADD CONSTRAINT "RiskAssessment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessment" ADD CONSTRAINT "RiskAssessment_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
