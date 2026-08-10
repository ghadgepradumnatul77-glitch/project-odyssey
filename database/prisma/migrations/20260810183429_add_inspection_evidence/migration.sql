-- CreateTable
CREATE TABLE "Inspection" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "inspectionDate" TIMESTAMP(3) NOT NULL,
    "structuralCondition" TEXT NOT NULL,
    "crackSeverity" TEXT NOT NULL,
    "corrosionLevel" TEXT NOT NULL,
    "trafficImportance" TEXT NOT NULL,
    "hospitalRoute" BOOLEAN NOT NULL,
    "weatherRisk" TEXT NOT NULL,
    "heavyRainExpected" BOOLEAN NOT NULL,
    "estimatedDailyUsers" INTEGER,
    "inspectionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Inspection_caseId_idx" ON "Inspection"("caseId");

-- CreateIndex
CREATE INDEX "Inspection_inspectorId_idx" ON "Inspection"("inspectorId");

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
