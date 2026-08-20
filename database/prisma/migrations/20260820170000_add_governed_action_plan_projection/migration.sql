CREATE TYPE "ActionPlanGovernanceMode" AS ENUM ('LEGACY', 'GOVERNED_POLICY', 'GOVERNED_ENGINEERING_NO_POLICY');

ALTER TABLE "OperationalResponsePlan"
ADD COLUMN "governanceMode" "ActionPlanGovernanceMode" NOT NULL DEFAULT 'LEGACY',
ADD COLUMN "governedActions" JSONB,
ADD COLUMN "actionPlanContractVersion" TEXT;

CREATE INDEX "OperationalResponsePlan_governanceMode_idx" ON "OperationalResponsePlan"("governanceMode");
