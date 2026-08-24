CREATE TABLE "TrustedComputationReceipt" (
    "id" TEXT NOT NULL,
    "riskAssessmentId" TEXT NOT NULL,
    "receiptVersion" TEXT NOT NULL,
    "computationType" TEXT NOT NULL,
    "inputContractVersion" TEXT NOT NULL,
    "inputFingerprint" TEXT NOT NULL,
    "computationVersion" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "runtimeTrustLevel" TEXT NOT NULL,
    "resultFingerprint" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL,
    "attestationState" TEXT NOT NULL,
    "attestationReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrustedComputationReceipt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TrustedComputationReceipt_riskAssessmentId_key"
ON "TrustedComputationReceipt"("riskAssessmentId");

CREATE INDEX "TrustedComputationReceipt_computationType_computationVersion_idx"
ON "TrustedComputationReceipt"("computationType", "computationVersion");

CREATE INDEX "TrustedComputationReceipt_providerId_runtimeTrustLevel_idx"
ON "TrustedComputationReceipt"("providerId", "runtimeTrustLevel");

ALTER TABLE "TrustedComputationReceipt"
ADD CONSTRAINT "TrustedComputationReceipt_riskAssessmentId_fkey"
FOREIGN KEY ("riskAssessmentId") REFERENCES "RiskAssessment"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
