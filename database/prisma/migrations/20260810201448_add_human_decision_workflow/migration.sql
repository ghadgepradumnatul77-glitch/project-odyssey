-- CreateEnum
CREATE TYPE "OrpDecisionType" AS ENUM ('APPROVED', 'REJECTED', 'MODIFICATION_REQUESTED', 'REINSPECTION_REQUESTED', 'ESCALATED');

-- CreateTable
CREATE TABLE "ApprovalAuthority" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "canApprove" BOOLEAN NOT NULL DEFAULT false,
    "canReject" BOOLEAN NOT NULL DEFAULT false,
    "canRequestModification" BOOLEAN NOT NULL DEFAULT false,
    "canRequestReinspection" BOOLEAN NOT NULL DEFAULT false,
    "canEscalate" BOOLEAN NOT NULL DEFAULT false,
    "maxPriorityLevel" "PriorityLevel",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalAuthority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrpDecision" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "orpId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "authorityGrantId" TEXT NOT NULL,
    "decisionType" "OrpDecisionType" NOT NULL,
    "reason" TEXT,
    "remarks" TEXT,
    "requestedChanges" JSONB,
    "forwardToUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrpDecision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApprovalAuthority_userId_idx" ON "ApprovalAuthority"("userId");

-- CreateIndex
CREATE INDEX "ApprovalAuthority_departmentId_idx" ON "ApprovalAuthority"("departmentId");

-- CreateIndex
CREATE INDEX "ApprovalAuthority_jurisdictionId_idx" ON "ApprovalAuthority"("jurisdictionId");

-- CreateIndex
CREATE INDEX "ApprovalAuthority_isActive_idx" ON "ApprovalAuthority"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "OrpDecision_orpId_key" ON "OrpDecision"("orpId");

-- CreateIndex
CREATE INDEX "OrpDecision_caseId_idx" ON "OrpDecision"("caseId");

-- CreateIndex
CREATE INDEX "OrpDecision_reviewerId_idx" ON "OrpDecision"("reviewerId");

-- CreateIndex
CREATE INDEX "OrpDecision_authorityGrantId_idx" ON "OrpDecision"("authorityGrantId");

-- CreateIndex
CREATE INDEX "OrpDecision_forwardToUserId_idx" ON "OrpDecision"("forwardToUserId");

-- CreateIndex
CREATE INDEX "OrpDecision_decisionType_idx" ON "OrpDecision"("decisionType");

-- CreateIndex
CREATE INDEX "OrpDecision_createdAt_idx" ON "OrpDecision"("createdAt");

-- AddForeignKey
ALTER TABLE "ApprovalAuthority" ADD CONSTRAINT "ApprovalAuthority_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalAuthority" ADD CONSTRAINT "ApprovalAuthority_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalAuthority" ADD CONSTRAINT "ApprovalAuthority_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "Jurisdiction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrpDecision" ADD CONSTRAINT "OrpDecision_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrpDecision" ADD CONSTRAINT "OrpDecision_orpId_fkey" FOREIGN KEY ("orpId") REFERENCES "OperationalResponsePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrpDecision" ADD CONSTRAINT "OrpDecision_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrpDecision" ADD CONSTRAINT "OrpDecision_authorityGrantId_fkey" FOREIGN KEY ("authorityGrantId") REFERENCES "ApprovalAuthority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrpDecision" ADD CONSTRAINT "OrpDecision_forwardToUserId_fkey" FOREIGN KEY ("forwardToUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
