CREATE TYPE "PublicReportStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED');
CREATE TYPE "PublicReportCategory" AS ENUM ('ROAD_DAMAGE', 'BRIDGE_OR_FLYOVER', 'WATERLOGGING', 'STREETLIGHT', 'DRAINAGE', 'PUBLIC_BUILDING', 'OTHER');

CREATE TABLE "PublicReport" (
    "id" TEXT NOT NULL,
    "reportNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "PublicReportCategory" NOT NULL,
    "locationText" TEXT NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "reporterName" TEXT,
    "reporterContact" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PublicReportStatus" NOT NULL DEFAULT 'SUBMITTED',
    "departmentId" TEXT,
    "jurisdictionId" TEXT,
    "assetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PublicReport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PublicReport_reportNumber_key" ON "PublicReport"("reportNumber");
CREATE INDEX "PublicReport_status_idx" ON "PublicReport"("status");
CREATE INDEX "PublicReport_category_idx" ON "PublicReport"("category");
CREATE INDEX "PublicReport_submittedAt_idx" ON "PublicReport"("submittedAt");
CREATE INDEX "PublicReport_departmentId_jurisdictionId_idx" ON "PublicReport"("departmentId", "jurisdictionId");
CREATE INDEX "PublicReport_assetId_idx" ON "PublicReport"("assetId");
ALTER TABLE "PublicReport" ADD CONSTRAINT "PublicReport_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PublicReport" ADD CONSTRAINT "PublicReport_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PublicReport" ADD CONSTRAINT "PublicReport_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
