-- CreateEnum
CREATE TYPE "AssetAttentionDisposition" AS ENUM (
  'ACKNOWLEDGED',
  'INSPECTION_FOLLOW_UP_RECOMMENDED',
  'CASE_REVIEW_RECOMMENDED',
  'MONITOR_WITH_RECORDED_RATIONALE',
  'DATA_QUALITY_FOLLOW_UP',
  'GOVERNED_ESCALATION_RECOMMENDED'
);

-- CreateTable
CREATE TABLE "AssetAttentionReview" (
  "id" TEXT NOT NULL,
  "assetId" TEXT NOT NULL,
  "caseId" TEXT,
  "reviewerId" TEXT NOT NULL,
  "reviewerRole" "SystemRole" NOT NULL,
  "departmentId" TEXT NOT NULL,
  "jurisdictionId" TEXT NOT NULL,
  "disposition" "AssetAttentionDisposition" NOT NULL,
  "rationale" TEXT NOT NULL,
  "attentionContractVersion" TEXT NOT NULL,
  "attentionCalculationVersion" TEXT NOT NULL,
  "projectionAsOf" TIMESTAMP(3) NOT NULL,
  "sourceSetFingerprint" TEXT NOT NULL,
  "clientRequestId" TEXT NOT NULL,
  "supersedesReviewId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AssetAttentionReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetAttentionReviewSignal" (
  "id" TEXT NOT NULL,
  "reviewId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "signalCode" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "evidenceReferenceFingerprint" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AssetAttentionReviewSignal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssetAttentionReview_supersedesReviewId_key" ON "AssetAttentionReview"("supersedesReviewId");
CREATE UNIQUE INDEX "AssetAttentionReview_reviewerId_clientRequestId_key" ON "AssetAttentionReview"("reviewerId", "clientRequestId");
CREATE INDEX "AssetAttentionReview_assetId_createdAt_id_idx" ON "AssetAttentionReview"("assetId", "createdAt", "id");
CREATE INDEX "AssetAttentionReview_caseId_createdAt_id_idx" ON "AssetAttentionReview"("caseId", "createdAt", "id");
CREATE INDEX "AssetAttentionReview_reviewerId_createdAt_id_idx" ON "AssetAttentionReview"("reviewerId", "createdAt", "id");
CREATE INDEX "AssetAttentionReview_departmentId_jurisdictionId_createdAt__idx" ON "AssetAttentionReview"("departmentId", "jurisdictionId", "createdAt", "id");
CREATE INDEX "AssetAttentionReview_sourceSetFingerprint_idx" ON "AssetAttentionReview"("sourceSetFingerprint");
CREATE UNIQUE INDEX "AssetAttentionReviewSignal_reviewId_category_signalCode_sta_key" ON "AssetAttentionReviewSignal"("reviewId", "category", "signalCode", "state", "evidenceReferenceFingerprint");
CREATE INDEX "AssetAttentionReviewSignal_reviewId_createdAt_id_idx" ON "AssetAttentionReviewSignal"("reviewId", "createdAt", "id");
CREATE INDEX "AssetAttentionReviewSignal_category_state_idx" ON "AssetAttentionReviewSignal"("category", "state");

-- AddForeignKey
ALTER TABLE "AssetAttentionReview" ADD CONSTRAINT "AssetAttentionReview_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AssetAttentionReview" ADD CONSTRAINT "AssetAttentionReview_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AssetAttentionReview" ADD CONSTRAINT "AssetAttentionReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AssetAttentionReview" ADD CONSTRAINT "AssetAttentionReview_supersedesReviewId_fkey" FOREIGN KEY ("supersedesReviewId") REFERENCES "AssetAttentionReview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AssetAttentionReviewSignal" ADD CONSTRAINT "AssetAttentionReviewSignal_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "AssetAttentionReview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
