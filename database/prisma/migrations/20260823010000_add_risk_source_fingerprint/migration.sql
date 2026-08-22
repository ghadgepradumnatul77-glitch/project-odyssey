CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE "RiskAssessment"
ADD COLUMN "sourceFingerprint" TEXT;

UPDATE "RiskAssessment" AS risk
SET "sourceFingerprint" = 'sha256:' || encode(
  digest(
    concat_ws(
      E'\x1f',
      risk."caseId",
      risk."inspectionId",
      risk."assessmentVersion",
      inspection."structuralCondition",
      inspection."crackSeverity",
      inspection."corrosionLevel",
      inspection."trafficImportance",
      inspection."hospitalRoute"::text,
      inspection."weatherRisk",
      inspection."heavyRainExpected"::text,
      COALESCE(inspection."estimatedDailyUsers"::text, 'null')
    ),
    'sha256'
  ),
  'hex'
)
FROM "Inspection" AS inspection
WHERE inspection."id" = risk."inspectionId";

ALTER TABLE "RiskAssessment"
ALTER COLUMN "sourceFingerprint" SET NOT NULL;

CREATE UNIQUE INDEX "RiskAssessment_sourceFingerprint_key"
ON "RiskAssessment"("sourceFingerprint");
