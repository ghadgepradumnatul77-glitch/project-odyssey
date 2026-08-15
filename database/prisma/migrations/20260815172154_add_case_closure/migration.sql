-- CreateEnum
CREATE TYPE "CaseClosureReason" AS ENUM ('EXECUTION_VERIFIED');

-- AlterTable
ALTER TABLE "ApprovalAuthority" ADD COLUMN     "canCloseCase" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CaseClosure" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "executionPlanId" TEXT NOT NULL,
    "closedById" TEXT NOT NULL,
    "closureAuthorityGrantId" TEXT NOT NULL,
    "closureReason" "CaseClosureReason" NOT NULL,
    "closureSummary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseClosure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CaseClosure_caseId_key" ON "CaseClosure"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseClosure_executionPlanId_key" ON "CaseClosure"("executionPlanId");

-- CreateIndex
CREATE INDEX "CaseClosure_closedById_idx" ON "CaseClosure"("closedById");

-- CreateIndex
CREATE INDEX "CaseClosure_closureAuthorityGrantId_idx" ON "CaseClosure"("closureAuthorityGrantId");

-- CreateIndex
CREATE INDEX "CaseClosure_closureReason_idx" ON "CaseClosure"("closureReason");

-- CreateIndex
CREATE INDEX "CaseClosure_createdAt_idx" ON "CaseClosure"("createdAt");

-- AddForeignKey
ALTER TABLE "CaseClosure" ADD CONSTRAINT "CaseClosure_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseClosure" ADD CONSTRAINT "CaseClosure_executionPlanId_fkey" FOREIGN KEY ("executionPlanId") REFERENCES "ExecutionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseClosure" ADD CONSTRAINT "CaseClosure_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseClosure" ADD CONSTRAINT "CaseClosure_closureAuthorityGrantId_fkey" FOREIGN KEY ("closureAuthorityGrantId") REFERENCES "ApprovalAuthority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
