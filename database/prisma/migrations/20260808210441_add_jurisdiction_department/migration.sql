/*
  Warnings:

  - Added the required column `departmentId` to the `Jurisdiction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Jurisdiction" ADD COLUMN     "departmentId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Jurisdiction_departmentId_idx" ON "Jurisdiction"("departmentId");

-- AddForeignKey
ALTER TABLE "Jurisdiction" ADD CONSTRAINT "Jurisdiction_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
