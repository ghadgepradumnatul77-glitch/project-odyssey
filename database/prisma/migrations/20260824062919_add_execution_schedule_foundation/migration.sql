-- CreateEnum
CREATE TYPE "ExecutionBlockerCategory" AS ENUM ('RESOURCE_UNAVAILABLE', 'ACCESS_RESTRICTED', 'MATERIAL_UNAVAILABLE', 'WEATHER', 'DEPENDENCY', 'SAFETY_CONDITION', 'EXTERNAL_APPROVAL', 'OTHER');

-- AlterTable
ALTER TABLE "ExecutionPlan" ADD COLUMN     "plannedEndAt" TIMESTAMP(3),
ADD COLUMN     "plannedStartAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ExecutionTask" ADD COLUMN     "plannedEndAt" TIMESTAMP(3),
ADD COLUMN     "plannedStartAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ExecutionTaskDependency" (
    "id" TEXT NOT NULL,
    "executionPlanId" TEXT NOT NULL,
    "dependentTaskId" TEXT NOT NULL,
    "predecessorTaskId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutionTaskDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionTaskBlockerEvent" (
    "id" TEXT NOT NULL,
    "executionTaskId" TEXT NOT NULL,
    "category" "ExecutionBlockerCategory" NOT NULL,
    "reason" TEXT NOT NULL,
    "blockedById" TEXT NOT NULL,
    "blockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolutionReason" TEXT,

    CONSTRAINT "ExecutionTaskBlockerEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutionScheduleRevision" (
    "id" TEXT NOT NULL,
    "executionPlanId" TEXT NOT NULL,
    "executionTaskId" TEXT,
    "previousStartAt" TIMESTAMP(3),
    "previousEndAt" TIMESTAMP(3),
    "newStartAt" TIMESTAMP(3) NOT NULL,
    "newEndAt" TIMESTAMP(3) NOT NULL,
    "changedById" TEXT NOT NULL,
    "changeReason" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutionScheduleRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExecutionTaskDependency_executionPlanId_idx" ON "ExecutionTaskDependency"("executionPlanId");

-- CreateIndex
CREATE INDEX "ExecutionTaskDependency_predecessorTaskId_idx" ON "ExecutionTaskDependency"("predecessorTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutionTaskDependency_dependentTaskId_predecessorTaskId_key" ON "ExecutionTaskDependency"("dependentTaskId", "predecessorTaskId");

-- CreateIndex
CREATE INDEX "ExecutionTaskBlockerEvent_executionTaskId_resolvedAt_idx" ON "ExecutionTaskBlockerEvent"("executionTaskId", "resolvedAt");

-- CreateIndex
CREATE INDEX "ExecutionTaskBlockerEvent_blockedAt_idx" ON "ExecutionTaskBlockerEvent"("blockedAt");

-- CreateIndex
CREATE INDEX "ExecutionScheduleRevision_executionPlanId_changedAt_idx" ON "ExecutionScheduleRevision"("executionPlanId", "changedAt");

-- CreateIndex
CREATE INDEX "ExecutionScheduleRevision_executionTaskId_changedAt_idx" ON "ExecutionScheduleRevision"("executionTaskId", "changedAt");

-- CreateIndex
CREATE INDEX "ExecutionTask_executionPlanId_plannedStartAt_idx" ON "ExecutionTask"("executionPlanId", "plannedStartAt");

-- CreateIndex
CREATE INDEX "ExecutionTask_executionPlanId_plannedEndAt_idx" ON "ExecutionTask"("executionPlanId", "plannedEndAt");

-- AddForeignKey
ALTER TABLE "ExecutionTaskDependency" ADD CONSTRAINT "ExecutionTaskDependency_executionPlanId_fkey" FOREIGN KEY ("executionPlanId") REFERENCES "ExecutionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionTaskDependency" ADD CONSTRAINT "ExecutionTaskDependency_dependentTaskId_fkey" FOREIGN KEY ("dependentTaskId") REFERENCES "ExecutionTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionTaskDependency" ADD CONSTRAINT "ExecutionTaskDependency_predecessorTaskId_fkey" FOREIGN KEY ("predecessorTaskId") REFERENCES "ExecutionTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionTaskDependency" ADD CONSTRAINT "ExecutionTaskDependency_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionTaskBlockerEvent" ADD CONSTRAINT "ExecutionTaskBlockerEvent_executionTaskId_fkey" FOREIGN KEY ("executionTaskId") REFERENCES "ExecutionTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionTaskBlockerEvent" ADD CONSTRAINT "ExecutionTaskBlockerEvent_blockedById_fkey" FOREIGN KEY ("blockedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionTaskBlockerEvent" ADD CONSTRAINT "ExecutionTaskBlockerEvent_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionScheduleRevision" ADD CONSTRAINT "ExecutionScheduleRevision_executionPlanId_fkey" FOREIGN KEY ("executionPlanId") REFERENCES "ExecutionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionScheduleRevision" ADD CONSTRAINT "ExecutionScheduleRevision_executionTaskId_fkey" FOREIGN KEY ("executionTaskId") REFERENCES "ExecutionTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutionScheduleRevision" ADD CONSTRAINT "ExecutionScheduleRevision_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
