-- CreateEnum
CREATE TYPE "SystemRole" AS ENUM ('OFFICER', 'POLICY_ADMIN', 'AUDITOR', 'SYSTEM_ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "SystemRole" NOT NULL DEFAULT 'OFFICER';

-- CreateIndex
CREATE INDEX "Asset_departmentId_idx" ON "Asset"("departmentId");

-- CreateIndex
CREATE INDEX "Asset_jurisdictionId_idx" ON "Asset"("jurisdictionId");

-- CreateIndex
CREATE INDEX "Asset_assetType_idx" ON "Asset"("assetType");

-- CreateIndex
CREATE INDEX "Case_riskLevel_idx" ON "Case"("riskLevel");

-- CreateIndex
CREATE INDEX "User_departmentId_idx" ON "User"("departmentId");

-- CreateIndex
CREATE INDEX "User_jurisdictionId_idx" ON "User"("jurisdictionId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");
