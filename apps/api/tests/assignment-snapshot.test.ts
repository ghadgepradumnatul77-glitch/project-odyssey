import { beforeEach, expect, it, vi } from 'vitest';
const m = vi.hoisted(() => ({ transaction: vi.fn(), event: vi.fn(), failSnapshot: false, loseRace: false, failAssignment: false }));
vi.mock('../src/lib/prisma', () => ({ default: { $transaction: m.transaction } }));
vi.mock('../src/modules/integrity/integrity.service', () => ({ appendIntegrityEvent: m.event }));
import { assignTask } from '../src/modules/execution/execution.service';
import { captureTaskOutcome } from '../src/modules/predictive-data/predictive-data.service';
import { captureInitialAssignmentSnapshot, initialAssignmentFeatures, ASSIGNMENT_FEATURE_VERSION } from '../src/modules/predictive-data/assignment-snapshot.service';
const actor = { id: 'actor', role: 'OFFICER', status: 'ACTIVE', departmentId: 'd', jurisdictionId: 'j' } as const;
let task: any, snapshots: any[], tx: any;
beforeEach(() => {
  vi.resetAllMocks(); m.failSnapshot = false; m.loseRace = false; m.failAssignment = false;
  snapshots = [];
  task = { id: 'task', status: 'PENDING', assignedAt: null, assignedToId: null, assignedById: null, executionPlanId: 'plan',
    plannedStartAt: null, plannedEndAt: new Date('2026-10-01T00:00:00Z'), sourceActionCode: 'ACTION', sourceActionVersion: 1,
    templateTaskKey: 'T', sourceTemplateCode: 'TPL', sourceTemplateVersion: 1, categorySnapshot: 'REPAIR', isMandatory: true,
    completionSubmittedAt: new Date(), evidence: ['private'], blockedReason: 'private',
    executionPlan: { status: 'PLANNED', provenanceClassification: null, provenanceDeclaredAt: null, provenanceAuthorityGrantId: null, provenanceEvidenceReference: null, provenanceContractVersion: null,
      case: { id: 'case', status: 'EXECUTION', riskLevel: 'HIGH', priorityLevel: 'HIGH', emergencyFlag: false,
        asset: { id: 'asset', assetCode: 'DEMO-SECRET', departmentId: 'd', jurisdictionId: 'j', assetType: 'BRIDGE', constructionYear: null, conditionStatus: null } } } };
  tx = {
    user: { findFirst: vi.fn(async () => ({ id: 'assignee' })) },
    executionTask: {
      findUnique: vi.fn(async () => task), findUniqueOrThrow: vi.fn(async () => task), findMany: vi.fn(async () => [task]),
      updateMany: vi.fn(async ({ where, data }) => { if (m.failAssignment) throw new Error('assignment failed'); if (m.loseRace || task.status !== where.status || task.assignedAt !== null) return { count: 0 }; Object.assign(task, data); return { count: 1 }; }),
    },
    executionPlan: { findUnique: vi.fn(async () => ({ caseId: 'case', status: 'PLANNED' })), update: vi.fn(async () => ({})) },
    predictiveFeatureSnapshot: { findFirst: vi.fn(async () => snapshots[0] ?? null), create: vi.fn(async ({ data }) => { if (m.failSnapshot) throw new Error('snapshot failed'); const row = { ...data, id: 'snapshot', createdAt: new Date() }; snapshots.push(row); return row; }) },
  };
  m.transaction.mockImplementation(async fn => { const before = structuredClone(task), beforeSnapshots = structuredClone(snapshots); try { return await fn(tx); } catch (e) { task = before; snapshots = beforeSnapshots; throw e; } });
});
it('captures within the assignment transaction with exact frozen due date and no identity/outcome features', async () => {
  await assignTask('task', 'assignee', actor);
  expect(m.transaction).toHaveBeenCalledTimes(1); expect(m.transaction.mock.calls[0][1]).toEqual({ isolationLevel: 'Serializable' });
  expect(snapshots).toHaveLength(1); const row = snapshots[0];
  expect(row.predictionTimestamp).toEqual(task.assignedAt); expect(row.featurePayload.plannedEndAt).toBe('2026-10-01T00:00:00.000Z');
  expect(row.provenanceClass).toBe('UNKNOWN'); expect(row.featureContractVersion).toBe(ASSIGNMENT_FEATURE_VERSION);
  expect(JSON.stringify(row.featurePayload)).not.toMatch(/assignedTo|assignedBy|actor|assignee|completion|verification|evidence|blocked|"status"|DEMO-SECRET/i);
  expect(m.event).toHaveBeenCalledTimes(2); expect(m.event.mock.calls.every(call => call[0] === tx)).toBe(true);
});
it('preserves missing due date without fabrication', async () => { task.plannedEndAt = null; await assignTask('task', 'assignee', actor); expect(snapshots[0].featurePayload.plannedEndAt).toBeNull(); });
it.each(['PILOT', 'PRODUCTION', 'DEMO', 'SYNTHETIC'])('copies explicit %s independently of asset codes', async provenance => { task.executionPlan.provenanceClassification = provenance; await assignTask('task', 'assignee', actor); expect(snapshots[0].provenanceClass).toBe(provenance); });
it('snapshot failure rolls back assignment', async () => { m.failSnapshot = true; await expect(assignTask('task', 'assignee', actor)).rejects.toThrow(); expect(task.status).toBe('PENDING'); expect(task.assignedAt).toBeNull(); expect(snapshots).toEqual([]); });
it('assignment failure creates no snapshot', async () => { m.failAssignment = true; await expect(assignTask('task', 'assignee', actor)).rejects.toThrow(); expect(tx.predictiveFeatureSnapshot.create).not.toHaveBeenCalled(); });
it('lost concurrent compare-and-set creates no snapshot', async () => { m.loseRace = true; await expect(assignTask('task', 'assignee', actor)).rejects.toMatchObject({ status: 409 }); expect(tx.predictiveFeatureSnapshot.create).not.toHaveBeenCalled(); });
it('retry cannot recapture later facts', async () => { await assignTask('task', 'assignee', actor); const before = structuredClone(snapshots); task.plannedEndAt = new Date('2030-01-01'); await expect(assignTask('task', 'assignee', actor)).rejects.toMatchObject({ status: 409 }); expect(snapshots).toEqual(before); });
it('existing snapshots prevent initial assignment backfill and remain untouched', async () => { snapshots.push({ id: 'historical', featureContractVersion: 'V1' }); await expect(assignTask('task', 'assignee', actor)).rejects.toThrow('already exists'); expect(task.status).toBe('PENDING'); expect(snapshots).toEqual([{ id: 'historical', featureContractVersion: 'V1' }]); });
it('integrity failure rolls back assignment and snapshot', async () => { m.event.mockImplementation(async (_tx, event) => { if (event.eventType === 'PREDICTIVE_FEATURE_SNAPSHOT_CREATED') throw new Error('integrity failure'); }); await expect(assignTask('task', 'assignee', actor)).rejects.toThrow(); expect(task.status).toBe('PENDING'); expect(snapshots).toEqual([]); });
it('fingerprint is deterministic and changes with frozen source facts', async () => {
  task.status = 'ASSIGNED'; task.assignedAt = new Date('2026-09-22T00:00:00Z');
  await captureInitialAssignmentSnapshot(tx, 'task', task.assignedAt, actor); const first = snapshots[0].sourceFingerprint;
  snapshots = []; await captureInitialAssignmentSnapshot(tx, 'task', task.assignedAt, actor); expect(snapshots[0].sourceFingerprint).toBe(first);
  snapshots = []; task.plannedEndAt = null; await captureInitialAssignmentSnapshot(tx, 'task', task.assignedAt, actor); expect(snapshots[0].sourceFingerprint).not.toBe(first);
});
it('strict feature contract rejects added identity or outcome fields', async () => { await assignTask('task', 'assignee', actor); for (const key of ['assignedById', 'assignedToId', 'completionSubmittedAt', 'evidence', 'blockers', 'status', 'name']) expect(initialAssignmentFeatures.safeParse({ ...snapshots[0].featurePayload, [key]: 'x' }).success).toBe(false); });
it('existing outcome recording reads the new frozen deadline without rereading a revised deadline', async () => {
  await assignTask('task', 'assignee', actor);
  task.plannedEndAt = new Date('2040-01-01');
  task.completionSubmittedAt = new Date('2030-01-01');
  task.predictiveSnapshots = snapshots;
  tx.predictiveOutcome = { upsert: vi.fn(async ({ create }) => ({ ...create, id: 'outcome', recordedAt: new Date() })) };
  await captureTaskOutcome('task', 'COMPLETION', actor);
  expect(tx.predictiveOutcome.upsert.mock.calls[0][0].create).toMatchObject({ outcomeValue: 'LATE', provenanceClass: 'UNKNOWN' });
});
