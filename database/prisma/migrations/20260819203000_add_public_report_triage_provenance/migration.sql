ALTER TABLE "PublicReport"
ADD COLUMN "reviewStartedAt" TIMESTAMP(3),
ADD COLUMN "reviewedById" TEXT,
ADD COLUMN "decisionAt" TIMESTAMP(3),
ADD COLUMN "decisionById" TEXT,
ADD COLUMN "rejectionReason" TEXT,
ADD COLUMN "createdCaseId" TEXT;
CREATE UNIQUE INDEX "PublicReport_createdCaseId_key" ON "PublicReport"("createdCaseId");
CREATE INDEX "PublicReport_reviewedById_idx" ON "PublicReport"("reviewedById");
CREATE INDEX "PublicReport_decisionById_idx" ON "PublicReport"("decisionById");
ALTER TABLE "PublicReport" ADD CONSTRAINT "PublicReport_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PublicReport" ADD CONSTRAINT "PublicReport_decisionById_fkey" FOREIGN KEY ("decisionById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PublicReport" ADD CONSTRAINT "PublicReport_createdCaseId_fkey" FOREIGN KEY ("createdCaseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
