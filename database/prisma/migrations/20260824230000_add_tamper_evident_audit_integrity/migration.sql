CREATE TABLE "IntegrityChainHead" (
  "chainKey" TEXT NOT NULL,
  "chainVersion" TEXT NOT NULL,
  "departmentId" TEXT,
  "jurisdictionId" TEXT,
  "latestSequence" INTEGER NOT NULL DEFAULT 0,
  "latestEventId" TEXT,
  "latestEventHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "IntegrityChainHead_pkey" PRIMARY KEY ("chainKey")
);
CREATE TABLE "IntegrityAuditEvent" (
  "id" TEXT NOT NULL,
  "chainKey" TEXT NOT NULL,
  "chainVersion" TEXT NOT NULL,
  "sequenceNumber" INTEGER NOT NULL,
  "previousEventId" TEXT,
  "previousEventHash" TEXT,
  "eventHash" TEXT NOT NULL,
  "payloadHash" TEXT NOT NULL,
  "payloadContractVersion" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "eventType" TEXT NOT NULL,
  "actorUserId" TEXT,
  "actorRoleSnapshot" TEXT,
  "departmentId" TEXT,
  "jurisdictionId" TEXT,
  "resourceType" TEXT NOT NULL,
  "resourceId" TEXT NOT NULL,
  "sourceEventKey" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IntegrityAuditEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "IntegrityAuditEvent_sourceEventKey_key" ON "IntegrityAuditEvent"("sourceEventKey");
CREATE UNIQUE INDEX "IntegrityAuditEvent_chainKey_sequenceNumber_key" ON "IntegrityAuditEvent"("chainKey", "sequenceNumber");
CREATE INDEX "IntegrityChainHead_departmentId_jurisdictionId_idx" ON "IntegrityChainHead"("departmentId", "jurisdictionId");
CREATE INDEX "IntegrityAuditEvent_chainKey_recordedAt_id_idx" ON "IntegrityAuditEvent"("chainKey", "recordedAt", "id");
CREATE INDEX "IntegrityAuditEvent_resourceType_resourceId_idx" ON "IntegrityAuditEvent"("resourceType", "resourceId");
CREATE INDEX "IntegrityAuditEvent_eventType_occurredAt_idx" ON "IntegrityAuditEvent"("eventType", "occurredAt");
CREATE INDEX "IntegrityAuditEvent_departmentId_jurisdictionId_idx" ON "IntegrityAuditEvent"("departmentId", "jurisdictionId");
ALTER TABLE "IntegrityAuditEvent" ADD CONSTRAINT "IntegrityAuditEvent_chainKey_fkey" FOREIGN KEY ("chainKey") REFERENCES "IntegrityChainHead"("chainKey") ON DELETE RESTRICT ON UPDATE CASCADE;
