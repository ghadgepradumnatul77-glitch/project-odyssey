CREATE TYPE "PublicReportTriageUrgency" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'URGENT');

CREATE TABLE "PublicReportTriageAnalysis" (
  "id" TEXT NOT NULL,
  "publicReportId" TEXT NOT NULL,
  "analysisVersion" TEXT NOT NULL,
  "suggestedCategory" "PublicReportCategory" NOT NULL,
  "urgencyLevel" "PublicReportTriageUrgency" NOT NULL,
  "confidence" INTEGER NOT NULL,
  "reasonCodes" JSONB NOT NULL,
  "reasons" JSONB NOT NULL,
  "possibleAssetId" TEXT,
  "duplicateCandidates" JSONB NOT NULL,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PublicReportTriageAnalysis_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PublicReportTriageAnalysis_publicReportId_analysisVersion_key" ON "PublicReportTriageAnalysis"("publicReportId", "analysisVersion");
CREATE INDEX "PublicReportTriageAnalysis_publicReportId_createdAt_idx" ON "PublicReportTriageAnalysis"("publicReportId", "createdAt");
CREATE INDEX "PublicReportTriageAnalysis_possibleAssetId_idx" ON "PublicReportTriageAnalysis"("possibleAssetId");
CREATE INDEX "PublicReportTriageAnalysis_createdById_idx" ON "PublicReportTriageAnalysis"("createdById");
ALTER TABLE "PublicReportTriageAnalysis" ADD CONSTRAINT "PublicReportTriageAnalysis_publicReportId_fkey" FOREIGN KEY ("publicReportId") REFERENCES "PublicReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PublicReportTriageAnalysis" ADD CONSTRAINT "PublicReportTriageAnalysis_possibleAssetId_fkey" FOREIGN KEY ("possibleAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PublicReportTriageAnalysis" ADD CONSTRAINT "PublicReportTriageAnalysis_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
