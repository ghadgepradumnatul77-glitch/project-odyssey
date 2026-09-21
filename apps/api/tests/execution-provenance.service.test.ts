import { beforeEach, expect, it, vi } from 'vitest';
const m = vi.hoisted(() => ({ actor: vi.fn(), plan: vi.fn(), grant: vi.fn(), update: vi.fn(), read: vi.fn(), event: vi.fn(), transaction: vi.fn() }));
vi.mock('../src/lib/prisma', () => ({ default: { $transaction: m.transaction } }));
vi.mock('../src/modules/integrity/integrity.service', () => ({ appendIntegrityEvent: m.event }));
import { declareExecutionProvenance } from '../src/modules/execution/execution-provenance.service';
const principal = { id: 'u', role: 'OFFICER', status: 'ACTIVE', departmentId: 'd', jurisdictionId: 'j' } as const;
const input = { classification: 'DEMO', evidenceReference: 'REF:1' };
let stored: any;
let tx: any;
beforeEach(() => {
  vi.resetAllMocks();
  stored = { id: 'p', provenanceClassification: null };
  tx = { user: { findFirst: m.actor }, executionPlan: { findFirst: m.plan, updateMany: m.update, findUniqueOrThrow: m.read }, approvalAuthority: { findFirst: m.grant } };
  m.actor.mockResolvedValue({ id: 'u' }); m.grant.mockResolvedValue({ id: 'g' });
  m.plan.mockImplementation(async () => ({ ...stored }));
  m.update.mockImplementation(async ({ data }) => { stored = { ...stored, ...data }; return { count: 1 }; });
  m.read.mockImplementation(async () => ({ ...stored }));
  m.transaction.mockImplementation(async fn => { const before = { ...stored }; try { return await fn(tx); } catch (e) { stored = before; throw e; } });
});
it.each(['DEMO', 'SYNTHETIC', 'PILOT', 'PRODUCTION'])('declares %s using only its explicit scoped capability', async classification => {
  const result = await declareExecutionProvenance('p', { ...input, classification }, principal);
  expect(result.idempotent).toBe(false);
  const where = m.grant.mock.calls[0][0].where;
  expect(where).toMatchObject({ userId: 'u', departmentId: 'd', jurisdictionId: 'j', isActive: true });
  expect(where[['PILOT', 'PRODUCTION'].includes(classification) ? 'canDeclareOperationalProvenance' : 'canDeclareNonOperationalProvenance']).toBe(true);
  expect(where.AND).toHaveLength(2);
  expect(m.plan.mock.calls[0][0].where.case.asset).toEqual({ departmentId: 'd', jurisdictionId: 'j' });
  expect(m.transaction.mock.calls[0][1].isolationLevel).toBe('Serializable');
  expect(m.event.mock.calls[0][0]).toBe(tx);
  expect(m.event.mock.calls[0][1]).toMatchObject({ eventType: 'EXECUTION_PLAN_PROVENANCE_DECLARED', actor: principal, resourceId: 'p', facts: { provenanceDeclaredById: 'u', provenanceAuthorityGrantId: 'g', provenanceContractVersion: 'ODYSSEY_EXECUTION_PROVENANCE_V1' } });
  expect(Object.keys(m.update.mock.calls[0][0].data).sort()).toEqual(['provenanceClassification','provenanceDeclaredById','provenanceDeclaredAt','provenanceAuthorityGrantId','provenanceEvidenceReference','provenanceContractVersion'].sort());
});
it.each(['SYSTEM_ADMIN', 'AUDITOR', 'POLICY_ADMIN'])('denies %s', async role => {
  await expect(declareExecutionProvenance('p', input, { ...principal, role } as any)).rejects.toMatchObject({ status: 403 }); expect(m.transaction).not.toHaveBeenCalled();
});
it('rejects inactive and null-scope principals', async () => {
  for (const p of [{ ...principal, status: 'INACTIVE' }, { ...principal, jurisdictionId: null }]) await expect(declareExecutionProvenance('p', input, p as any)).rejects.toMatchObject({ status: 403 });
});
it('rechecks persisted officer activity and scope', async () => { m.actor.mockResolvedValue(null); await expect(declareExecutionProvenance('p', input, principal)).rejects.toMatchObject({ status: 403 }); expect(m.update).not.toHaveBeenCalled(); });
it('denies inaccessible plans', async () => { m.plan.mockResolvedValue(null); await expect(declareExecutionProvenance('p', input, principal)).rejects.toMatchObject({ status: 404 }); });
it('denies missing/expired/wrong-scope capability matches', async () => { m.grant.mockResolvedValue(null); await expect(declareExecutionProvenance('p', input, principal)).rejects.toMatchObject({ status: 403 }); expect(m.update).not.toHaveBeenCalled(); });
it('returns identical retry without another write/event', async () => { const first = await declareExecutionProvenance('p', input, principal); const second = await declareExecutionProvenance('p', input, principal); expect(second).toEqual({ ...first, idempotent: true }); expect(m.update).toHaveBeenCalledTimes(1); expect(m.event).toHaveBeenCalledTimes(1); });
it('rejects changed payload or actor redeclaration', async () => { await declareExecutionProvenance('p', input, principal); for (const request of [{ ...input, classification: 'PILOT' }, { ...input, evidenceReference: 'REF:2' }]) await expect(declareExecutionProvenance('p', request, principal)).rejects.toMatchObject({ status: 409 }); await expect(declareExecutionProvenance('p', input, { ...principal, id: 'other' })).rejects.toMatchObject({ status: 409 }); });
it('rejects a lost compare-and-set race', async () => { m.update.mockResolvedValue({ count: 0 }); await expect(declareExecutionProvenance('p', input, principal)).rejects.toMatchObject({ status: 409 }); expect(m.event).not.toHaveBeenCalled(); });
it('maps serializable concurrent conflicts safely', async () => { m.transaction.mockRejectedValue({ code: 'P2034', secret: 'private' }); await expect(declareExecutionProvenance('p', input, principal)).rejects.toMatchObject({ status: 409, code: 'PROVENANCE_CONCURRENT_DECLARATION' }); });
it('rolls back the declaration if integrity append fails', async () => { m.event.mockRejectedValue(new Error('private database detail')); await expect(declareExecutionProvenance('p', input, principal)).rejects.toMatchObject({ status: 503, message: 'Could not record provenance declaration.' }); expect(stored).toEqual({ id: 'p', provenanceClassification: null }); });
it('rejects client actor metadata and uncontrolled evidence', async () => { for (const data of [{ ...input, declaredById: 'other' }, { ...input, evidenceReference: 'bad?secret=x' }]) await expect(declareExecutionProvenance('p', data, principal)).rejects.toMatchObject({ status: 400 }); expect(m.transaction).not.toHaveBeenCalled(); });
