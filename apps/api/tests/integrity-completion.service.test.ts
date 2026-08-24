import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  head: vi.fn(), events: vi.fn(), groupBy: vi.fn(),
  authorities: vi.fn(), closures: vi.fn(), modelLifecycle: vi.fn()
}));

vi.mock('../src/lib/prisma', () => ({ default: {
  integrityChainHead: { findFirst: mocks.head },
  integrityAuditEvent: { findMany: mocks.events, groupBy: mocks.groupBy },
  approvalAuthority: { findMany: mocks.authorities },
  caseClosure: { findMany: mocks.closures },
  predictiveModelLifecycleEvent: { findMany: mocks.modelLifecycle }
} }));

import {
  canonicalIntegrityPayload,
  getIntegrityCoverageSummary,
  INTEGRITY_CHAIN_VERSION,
  INTEGRITY_COVERAGE_CONTRACT_VERSION,
  INTEGRITY_PAYLOAD_VERSION,
  integrityEventHash,
  integrityPayloadHash,
  PROTECTED_EVENT_TYPES,
  verifyIntegrityChain,
  type AppendIntegrityInput
} from '../src/modules/integrity/integrity.service';

const principal = { id: 'auditor', role: 'AUDITOR', status: 'ACTIVE', departmentId: 'dep', jurisdictionId: 'jur' } as any;

function heterogeneousEvents(count: number) {
  const rows: any[] = [];
  let previousEventHash: string | null = null;
  let previousEventId: string | null = null;
  const families = [
    ['APPROVAL_AUTHORITY_GRANTED', 'ApprovalAuthority', 'authority'],
    ['CASE_CLOSED', 'CaseClosure', 'closure'],
    ['PREDICTIVE_MODEL_DEPRECATED', 'PredictiveModelLifecycleEvent', 'model-lifecycle']
  ] as const;
  for (let index = 0; index < count; index += 1) {
    const sequenceNumber = index + 1;
    const [eventType, resourceType, prefix] = families[index % families.length];
    const resourceId = `${prefix}-${sequenceNumber}`;
    const sourceEventKey = `${eventType}:${resourceId}`;
    const occurredAt = new Date('2026-08-24T00:00:00.000Z');
    const input: AppendIntegrityInput = {
      eventType, sourceEventKey, resourceType, resourceId, actor: null,
      departmentId: 'dep', jurisdictionId: 'jur', occurredAt, facts: { sourceId: resourceId }
    };
    const payload = canonicalIntegrityPayload(input);
    const payloadHash = integrityPayloadHash(payload);
    const eventHash = integrityEventHash({ chainKey: 'scope:dep:jur', sequenceNumber, previousEventHash, payloadHash });
    const id = `event-${sequenceNumber}`;
    rows.push({
      id, chainKey: 'scope:dep:jur', chainVersion: INTEGRITY_CHAIN_VERSION, sequenceNumber,
      previousEventId, previousEventHash, eventHash, payloadHash,
      payloadContractVersion: INTEGRITY_PAYLOAD_VERSION, payload, eventType,
      resourceType, resourceId, sourceEventKey, occurredAt
    });
    previousEventId = id;
    previousEventHash = eventHash;
  }
  return rows;
}

describe('P3.4 completion integrity service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('publishes the complete prospective governance coverage registry', () => {
    expect(PROTECTED_EVENT_TYPES).toEqual(expect.arrayContaining([
      'POLICY_VERSION_CREATED', 'APPROVAL_AUTHORITY_GRANTED', 'DECISION_PACKAGE_PREPARED',
      'ACTION_PLAN_CREATED', 'HUMAN_DECISION_RECORDED', 'EXECUTION_PLAN_CREATED',
      'EXECUTION_TASK_VERIFIED', 'EXECUTION_TASK_DEPENDENCY_REMOVED', 'CASE_CLOSED',
      'OBSERVATION_SOURCE_DEACTIVATED', 'PORTFOLIO_SCENARIO_CREATED',
      'PREDICTIVE_DATASET_SNAPSHOT_CREATED', 'PREDICTIVE_MODEL_APPROVED',
      'PREDICTIVE_MODEL_ACTIVATED', 'PREDICTIVE_MODEL_ROLLED_BACK', 'PREDICTIVE_MODEL_DEPRECATED'
    ]));
  });

  it('reports scoped event counts without exposing payloads or implying backfill', async () => {
    mocks.groupBy.mockResolvedValue([
      { eventType: 'CASE_CLOSED', _count: { _all: 2 } },
      { eventType: 'HUMAN_DECISION_RECORDED', _count: { _all: 3 } }
    ]);
    const result = await getIntegrityCoverageSummary(principal);
    expect(mocks.groupBy).toHaveBeenCalledWith(expect.objectContaining({
      where: { OR: [{ departmentId: 'dep', jurisdictionId: 'jur' }, { departmentId: 'dep', jurisdictionId: null }] }
    }));
    expect(result).toMatchObject({
      coverageContractVersion: INTEGRITY_COVERAGE_CONTRACT_VERSION,
      eventCountsByType: { CASE_CLOSED: 2, HUMAN_DECISION_RECORDED: 3 },
      historicalBackfill: false
    });
    expect(JSON.stringify(result)).not.toMatch(/payloadHash|payload|actorUserId|reason/i);
  });

  it('verifies a heterogeneous 501-event chain with bounded model-specific source batches', async () => {
    const rows = heterogeneousEvents(501);
    mocks.head.mockResolvedValue({ latestSequence: 501, latestEventId: rows[500].id, latestEventHash: rows[500].eventHash });
    mocks.events.mockImplementation(({ where, take }: any) => rows.filter((row) => row.sequenceNumber > where.sequenceNumber.gt).slice(0, take));
    const present = ({ where }: any) => where.id.in.map((id: string) => ({ id }));
    mocks.authorities.mockImplementation(present);
    mocks.closures.mockImplementation(present);
    mocks.modelLifecycle.mockImplementation(present);

    const result = await verifyIntegrityChain('scope:dep:jur', principal);

    expect(result).toMatchObject({ status: 'VALID', eventsChecked: 501, complete: true, sourceReconciliation: 'MATCH' });
    expect(mocks.events).toHaveBeenCalledTimes(3);
    for (const sourceMock of [mocks.authorities, mocks.closures, mocks.modelLifecycle]) {
      expect(sourceMock).toHaveBeenCalledTimes(3);
      for (const [query] of sourceMock.mock.calls) expect(query.where.id.in.length).toBeLessThanOrEqual(200);
    }
  });

  it('reports the first heterogeneous source mismatch while completing chain verification', async () => {
    const rows = heterogeneousEvents(501);
    const missing = rows[376];
    mocks.head.mockResolvedValue({ latestSequence: 501, latestEventId: rows[500].id, latestEventHash: rows[500].eventHash });
    mocks.events.mockImplementation(({ where, take }: any) => rows.filter((row) => row.sequenceNumber > where.sequenceNumber.gt).slice(0, take));
    const present = ({ where }: any) => where.id.in.filter((id: string) => id !== missing.resourceId).map((id: string) => ({ id }));
    mocks.authorities.mockImplementation(present);
    mocks.closures.mockImplementation(present);
    mocks.modelLifecycle.mockImplementation(present);

    expect(await verifyIntegrityChain('scope:dep:jur', principal)).toMatchObject({
      status: 'SOURCE_MISMATCH', eventsChecked: 501, firstFailureSequence: 377, complete: true
    });
  });
});
