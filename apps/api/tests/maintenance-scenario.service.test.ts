import { expect, it, vi } from 'vitest';
vi.mock('../src/lib/prisma', () => ({ default: {} }));
import { createMaintenanceScenarioService } from '../src/modules/portfolio/maintenance-scenario.service';
import { MaintenanceSnapshotError } from '../src/modules/portfolio/maintenance-scenario.repository';
const principal: any = { id: 'u', role: 'OFFICER', status: 'ACTIVE', departmentId: 'd', jurisdictionId: 'j' };
const envelope = { id: 'e', currency: 'INR', budgetMinor: '100', resourceCapacities: [] };
const estimate = { id: 'estimate', estimateVersion: 1, status: 'ACTIVE', currency: 'INR', estimatedCostMinor: '50', estimatedDurationDays: 2, resourceRequirements: [], resourcesComplete: true };
const work = { caseId: 'c', assetId: 'a', authorized: true, status: 'ORP_READY', priorityLevel: 'CRITICAL', riskLevel: 'VERY_HIGH', emergencyFlag: false, hospitalRoute: true, createdAt: '2026-01-01T00:00:00Z', estimates: [estimate] };
function setup(cases: any[] = [work]) {
  const evidence = { complete: true, snapshot: { asOf: '2026-02-01T00:00:00Z', cases }, sourceSetFingerprint: 'hash', fingerprintInputs: { secret: 'private' }, coverage: { assets: 2, cases: cases.length, zeroCaseAssets: 1, noActiveEstimateCases: 0, multipleActiveEstimateCases: 0 }, disclosures: ['Unknown completeness remains unknown.'] };
  const repository = { snapshot: vi.fn().mockResolvedValue(evidence) };
  return { evidence, repository, service: createMaintenanceScenarioService(repository as any) };
}
it.each([1, 2, 3, 4, 5])('compares %i envelopes with one common scoped snapshot', async count => {
  const { service, repository, evidence } = setup(); const before = JSON.stringify(evidence);
  const input = { envelopes: Array.from({ length: count }, (_, i) => ({ ...envelope, id: String(i) })) };
  const result = await service.compare(principal, input);
  expect(repository.snapshot).toHaveBeenCalledTimes(1); expect(repository.snapshot).toHaveBeenCalledWith(principal, { assetId: undefined, caseId: undefined });
  expect(result.envelopes).toHaveLength(count); expect(result.coverage.zeroCaseAssets).toBe(1);
  expect(JSON.stringify(evidence)).toBe(before); expect(result.authority.mutatesWorkflow).toBe(false);
  expect(result).toEqual(await service.compare(principal, input));
  expect(JSON.stringify(result)).not.toContain('private'); expect(result.caseContext[0].priorityLevel).toBe('CRITICAL');
});
it.each([[], Array.from({ length: 6 }, (_, i) => ({ ...envelope, id: String(i) })), [envelope, envelope], [{ ...envelope, currency: 'USD' }]])('rejects invalid envelopes before querying', async envelopes => {
  const { service, repository } = setup(); await expect(service.compare(principal, { envelopes })).rejects.toMatchObject({ status: 400 }); expect(repository.snapshot).not.toHaveBeenCalled();
});
it('passes validated filters and never accepts identity overrides', async () => {
  const { service, repository } = setup(); const id = '11111111-1111-4111-8111-111111111111';
  await service.compare(principal, { envelopes: [envelope], assetId: id, caseId: id }); expect(repository.snapshot).toHaveBeenCalledWith(principal, { assetId: id, caseId: id });
  await expect(service.compare(principal, { envelopes: [envelope], reviewerId: 'other' })).rejects.toMatchObject({ status: 400 });
});
it('preserves missing/multiple/invalid/superseded estimate outcomes', async () => {
  const { service } = setup([ { ...work, estimates: [] }, { ...work, caseId: 'multi', estimates: [estimate, { ...estimate, id: 'e2' }] }, { ...work, caseId: 'invalid', estimates: [{ ...estimate, resourceRequirements: null }] }, { ...work, caseId: 'old', estimates: [{ ...estimate, status: 'SUPERSEDED' }] } ]);
  const result = await service.compare(principal, { envelopes: [envelope] });
  expect(result.envelopes[0].cases.flatMap(c => c.reasonCodes)).toEqual(expect.arrayContaining(['ESTIMATE_MISSING', 'MULTIPLE_ACTIVE_ESTIMATES', 'ESTIMATE_INVALID'])); expect(result.coverage.invalidEstimateCases).toBe(1);
});
it('retains zero versus unknown budgets and duration limits', async () => {
  const { service } = setup(); const result = await service.compare(principal, { envelopes: [{ ...envelope, id: 'zero', budgetMinor: '0' }, { ...envelope, id: 'unknown', budgetMinor: null }, { ...envelope, id: 'duration', perWorkDurationCeilingDays: 1 }] });
  expect(result.envelopes.map(e => e.cases[0].reasonCodes)).toEqual([['BUDGET_EXCEEDED'], ['BUDGET_UNKNOWN'], ['DURATION_CEILING_EXCEEDED']]);
});
it('preserves unknown resources and resource exhaustion', async () => {
  const { service } = setup([{ ...work, estimates: [{ ...estimate, resourceRequirements: [{ category: 'GENERAL_CREW', quantity: 2, unit: 'UNIT_DAYS' }] }] }]);
  const result = await service.compare(principal, { envelopes: [envelope, { ...envelope, id: 'zero', resourceCapacities: [{ category: 'GENERAL_CREW', quantity: 0, unit: 'UNIT_DAYS' }] }] });
  expect(result.envelopes[0].cases[0].reasonCodes).toContain('CAPACITY_UNSPECIFIED'); expect(result.envelopes[1].cases[0].reasonCodes).toContain('RESOURCE_CAPACITY_EXCEEDED');
});
it('sanitizes scope and timeout failures; rejects incomplete snapshots', async () => {
  const { service, repository, evidence } = setup();
  repository.snapshot.mockRejectedValueOnce(new MaintenanceSnapshotError('RESOURCE_NOT_FOUND'));
  await expect(service.compare(principal, { envelopes: [envelope] })).rejects.toMatchObject({ status: 404 });
  repository.snapshot.mockRejectedValueOnce(new Error('secret database timeout'));
  await expect(service.compare(principal, { envelopes: [envelope] })).rejects.toThrow('MAINTENANCE_COMPARISON_UNAVAILABLE');
  evidence.complete = false; await expect(service.compare(principal, { envelopes: [envelope] })).rejects.toMatchObject({ status: 503 });
});
