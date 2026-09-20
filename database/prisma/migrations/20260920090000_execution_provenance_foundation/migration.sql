BEGIN;
CREATE TYPE "ExecutionPlanProvenance" AS ENUM ('PILOT', 'PRODUCTION', 'SYNTHETIC', 'DEMO');
ALTER TABLE "ApprovalAuthority"
  ADD COLUMN "canDeclareNonOperationalProvenance" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "canDeclareOperationalProvenance" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ExecutionPlan"
  ADD COLUMN "provenanceClassification" "ExecutionPlanProvenance",
  ADD COLUMN "provenanceDeclaredById" TEXT,
  ADD COLUMN "provenanceDeclaredAt" TIMESTAMP(3),
  ADD COLUMN "provenanceAuthorityGrantId" TEXT,
  ADD COLUMN "provenanceEvidenceReference" VARCHAR(200),
  ADD COLUMN "provenanceContractVersion" VARCHAR(80),
  ADD CONSTRAINT "ExecutionPlan_provenanceDeclaredById_fkey" FOREIGN KEY ("provenanceDeclaredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "ExecutionPlan_provenanceAuthorityGrantId_fkey" FOREIGN KEY ("provenanceAuthorityGrantId") REFERENCES "ApprovalAuthority"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "ExecutionPlan_provenance_complete_check" CHECK (
    num_nonnulls("provenanceClassification", "provenanceDeclaredById", "provenanceDeclaredAt", "provenanceAuthorityGrantId", "provenanceEvidenceReference", "provenanceContractVersion") IN (0, 6)
  ),
  ADD CONSTRAINT "ExecutionPlan_provenance_reference_check" CHECK (
    "provenanceEvidenceReference" IS NULL OR "provenanceEvidenceReference" ~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{0,199}$'
  ),
  ADD CONSTRAINT "ExecutionPlan_provenance_contract_check" CHECK (
    "provenanceContractVersion" IS NULL OR "provenanceContractVersion" = 'ODYSSEY_EXECUTION_PROVENANCE_V1'
  );
CREATE INDEX "ExecutionPlan_provenanceDeclaredById_idx" ON "ExecutionPlan"("provenanceDeclaredById");
CREATE INDEX "ExecutionPlan_provenanceAuthorityGrantId_idx" ON "ExecutionPlan"("provenanceAuthorityGrantId");
COMMIT;
