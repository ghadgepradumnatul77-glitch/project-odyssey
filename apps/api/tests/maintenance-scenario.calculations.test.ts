import { describe, expect, it } from 'vitest';
import { compareMaintenanceEnvelopes } from '../src/modules/portfolio/maintenance-scenario.calculations';
import type { MaintenanceCase, MaintenanceEnvelope, MaintenanceEstimate, MaintenanceSnapshot } from '../src/modules/portfolio/maintenance-scenario.contracts';

const estimate = (changes: Partial<MaintenanceEstimate> = {}): MaintenanceEstimate => ({ id: 'estimate', estimateVersion: 1, status: 'ACTIVE', currency: 'INR', estimatedCostMinor: '10', estimatedDurationDays: 5, resourcesComplete: true, resourceRequirements: [{ category: 'GENERAL_CREW', quantity: 2, unit: 'UNIT_DAYS' }], ...changes });
const work = (changes: Partial<MaintenanceCase> = {}): MaintenanceCase => ({ caseId: 'case', assetId: 'asset', authorized: true, status: 'ORP_READY', priorityLevel: 'CRITICAL', riskLevel: 'VERY_HIGH', emergencyFlag: false, hospitalRoute: false, createdAt: '2026-01-01T00:00:00Z', estimates: [estimate()], ...changes });
const envelope = (changes: Partial<MaintenanceEnvelope> = {}): MaintenanceEnvelope => ({ id: 'envelope', currency: 'INR', budgetMinor: '20', resourceCapacities: [{ category: 'GENERAL_CREW', quantity: 4, unit: 'UNIT_DAYS' }], ...changes });
const snapshot = (cases = [work()]): MaintenanceSnapshot => ({ asOf: '2026-09-01T00:00:00Z', cases });
const run = (cases = [work()], e = envelope()) => compareMaintenanceEnvelopes(snapshot(cases), [e]).envelopes[0];

describe('maintenance envelope pure foundation', () => {
  it('includes fitting work hypothetically and deducts exact balances', () => {
    const r = run(); expect(r.cases[0].state).toBe('FITS_DECLARED_ENVELOPE'); expect(r.remainingBudgetMinor).toBe('10'); expect(r.remainingResources.GENERAL_CREW).toBe(2); expect(r.remainingResources.OTHER).toBeNull();
  });
  it('distinguishes zero and unknown budget', () => {
    expect(run(undefined, envelope({ budgetMinor: null })).cases[0]).toMatchObject({ state: 'INSUFFICIENT_DATA', reasonCodes: ['BUDGET_UNKNOWN'] });
    expect(run(undefined, envelope({ budgetMinor: '0' })).cases[0].state).toBe('CONSTRAINT_EXCEEDED');
    expect(run([work({ estimates: [estimate({ estimatedCostMinor: '0' })] })], envelope({ budgetMinor: '0' })).cases[0].state).toBe('FITS_DECLARED_ENVELOPE');
  });
  it.each(['-1', '1.1', '1e3', '9000000000000001', '001', ''])('rejects invalid budget %s', budgetMinor => {
    expect(run(undefined, envelope({ budgetMinor })).cases[0].state).toBe('INVALID_DATA');
  });
  it('uses exact arithmetic at the supported maximum', () => {
    const r = run([work({ estimates: [estimate({ estimatedCostMinor: '8999999999999999' })] })], envelope({ budgetMinor: '9000000000000000' }));
    expect(r.remainingBudgetMinor).toBe('1');
  });
  it('rejects unsupported currency on either side', () => {
    expect(run(undefined, envelope({ currency: 'USD' })).cases[0].reasonCodes).toContain('ENVELOPE_INVALID');
    expect(run([work({ estimates: [estimate({ currency: 'USD' })] })]).cases[0].reasonCodes).toContain('ESTIMATE_INVALID');
  });
  it('distinguishes unspecified, unknown and zero resource capacity', () => {
    for (const resourceCapacities of [[], [{ category: 'GENERAL_CREW' as const, quantity: null, unit: 'UNIT_DAYS' as const }]]) {
      expect(run(undefined, envelope({ resourceCapacities })).cases[0].reasonCodes).toContain('CAPACITY_UNSPECIFIED');
    }
    expect(run(undefined, envelope({ resourceCapacities: [{ category: 'GENERAL_CREW', quantity: 0, unit: 'UNIT_DAYS' }] })).cases[0].reasonCodes).toContain('RESOURCE_CAPACITY_EXCEEDED');
    const r = run([work({ estimates: [estimate({ resourceRequirements: [{ category: 'GENERAL_CREW', quantity: 0, unit: 'UNIT_DAYS' }] })] })], envelope({ resourceCapacities: [] }));
    expect(r.cases[0].state).toBe('FITS_DECLARED_ENVELOPE'); expect(r.remainingResources.GENERAL_CREW).toBeNull();
  });
  it('requires explicit completeness even for an empty resource list', () => {
    for (const resourcesComplete of [null, false]) expect(run([work({ estimates: [estimate({ resourcesComplete, resourceRequirements: [] })] })]).cases[0].reasonCodes).toContain('RESOURCE_COMPLETENESS_UNKNOWN');
    expect(run([work({ estimates: [estimate({ resourceRequirements: [] })] })]).cases[0].state).toBe('FITS_DECLARED_ENVELOPE');
    expect(run([work({ estimates: [estimate({ resourceRequirements: [{ category: 'GENERAL_CREW', quantity: null, unit: 'UNIT_DAYS' }] })] })]).cases[0].reasonCodes).toContain('RESOURCE_QUANTITY_UNKNOWN');
  });
  it('bounds resource quantities and rejects duplicate categories or malformed JSON', () => {
    for (const quantity of [-1, 0.1, Number.MAX_SAFE_INTEGER + 1, Infinity]) {
      expect(run([work({ estimates: [estimate({ resourceRequirements: [{ category: 'GENERAL_CREW', quantity, unit: 'UNIT_DAYS' }] })] })]).cases[0].state).toBe('INVALID_DATA');
    }
    const e = estimate();
    expect(run([work({ estimates: [{ ...e, resourceRequirements: [...e.resourceRequirements, ...e.resourceRequirements] }] })]).cases[0].state).toBe('INVALID_DATA');
    expect(run([work({ estimates: [{ ...e, resourceRequirements: {} }] })]).cases[0].state).toBe('INVALID_DATA');
  });
  it('applies duration only as an individual ceiling', () => {
    expect(run(undefined, envelope({ perWorkDurationCeilingDays: 4 })).cases[0].reasonCodes).toContain('DURATION_CEILING_EXCEEDED');
    expect(run(undefined, envelope({ perWorkDurationCeilingDays: 5 })).cases[0].state).toBe('FITS_DECLARED_ENVELOPE');
    const unknown = [work({ estimates: [estimate({ estimatedDurationDays: null })] })];
    expect(run(unknown, envelope({ perWorkDurationCeilingDays: 5 })).cases[0].reasonCodes).toContain('DURATION_UNKNOWN');
    expect(run(unknown).cases[0]).toMatchObject({ state: 'FITS_DECLARED_ENVELOPE', estimatedDurationDays: null });
    expect(run(undefined, envelope({ perWorkDurationCeilingDays: 0 })).cases[0].state).toBe('INVALID_DATA');
  });
  it('never substitutes superseded estimates and detects conflicting active versions', () => {
    expect(run([work({ estimates: [] })]).cases[0].reasonCodes).toContain('ESTIMATE_MISSING');
    expect(run([work({ estimates: [estimate({ status: 'SUPERSEDED' })] })]).cases[0].reasonCodes).toContain('ESTIMATE_MISSING');
    expect(run([work({ estimates: [estimate(), estimate({ id: 'new', estimateVersion: 2 })] })]).cases[0].reasonCodes).toContain('MULTIPLE_ACTIVE_ESTIMATES');
    expect(run([work({ estimates: [estimate({ status: 'SUPERSEDED' }), { ...estimate(), estimatedCostMinor: '-1' }] })]).cases[0].state).toBe('INVALID_DATA');
  });
  it('preserves unknown cost and malformed estimates', () => {
    expect(run([work({ estimates: [estimate({ estimatedCostMinor: null })] })]).cases[0].reasonCodes).toContain('COST_UNKNOWN');
    for (const e of [null, {}, 'invalid', { ...estimate(), estimatedDurationDays: 0 }]) expect(run([work({ estimates: [e] })]).cases[0].state).toBe('INVALID_DATA');
  });
  it('uses existing priority/risk/flags/date/ID ordering regardless of input ordering or cost', () => {
    const cases = [work({ caseId: 'z', priorityLevel: 'LOW' }), work({ caseId: 'b' }), work({ caseId: 'a' }), work({ caseId: 'emergency', emergencyFlag: true }), work({ caseId: 'route', hospitalRoute: true }), work({ caseId: 'risk', riskLevel: 'CRITICAL' })];
    expect(run(cases).cases.map(c => c.caseId)).toEqual(['risk', 'emergency', 'route', 'a', 'b', 'z']);
    expect(run([...cases].reverse())).toEqual(run(cases));
  });
  it('leaves balances unchanged for excluded or insufficient work and continues considering later work', () => {
    const cases = [work({ caseId: 'a', estimates: [estimate({ estimatedCostMinor: '30' })] }), work({ caseId: 'b' })];
    expect(run(cases).cases.map(c => c.state)).toEqual(['CONSTRAINT_EXCEEDED', 'FITS_DECLARED_ENVELOPE']);
    expect(run(cases).remainingBudgetMinor).toBe('10');
  });
  it('keeps missing context explicit and excludes terminal or unauthorized Cases', () => {
    expect(run([work({ priorityLevel: null })]).cases[0].state).toBe('INSUFFICIENT_DATA');
    expect(run([work({ riskLevel: 'bogus' })]).cases[0].state).toBe('INVALID_DATA');
    expect(run([work({ authorized: false })]).cases[0].state).toBe('OUT_OF_SCOPE');
    expect(run([work({ status: 'CLOSED' })]).cases[0].state).toBe('OUT_OF_SCOPE');
    expect(run([work({ createdAt: '2027-01-01T00:00:00Z' })]).cases[0].state).toBe('INVALID_DATA');
  });
  it('compares bounded envelopes on one common snapshot with independent balances', () => {
    const s = snapshot(); const result = compareMaintenanceEnvelopes(s, [envelope(), envelope({ id: 'small', budgetMinor: '0' })]);
    expect(result.envelopes.map(e => e.cases[0].state)).toEqual(['FITS_DECLARED_ENVELOPE', 'CONSTRAINT_EXCEEDED']);
    expect(result.inputFingerprint).toBe(compareMaintenanceEnvelopes(s, [envelope()]).inputFingerprint);
    for (const envelopes of [[], Array.from({ length: 6 }, (_, i) => envelope({ id: `${i}` })), [envelope(), envelope()]]) expect(() => compareMaintenanceEnvelopes(s, envelopes)).toThrow('INVALID_MAINTENANCE_COMPARISON');
  });
  it('fingerprints canonical snapshot and envelope facts deterministically', () => {
    const first = compareMaintenanceEnvelopes(snapshot(), [envelope()]);
    expect(first).toEqual(compareMaintenanceEnvelopes(JSON.parse(JSON.stringify(snapshot())), [envelope()]));
    const changed = compareMaintenanceEnvelopes(snapshot(), [envelope({ budgetMinor: '19' })]);
    expect(changed.inputFingerprint).toBe(first.inputFingerprint); expect(changed.envelopes[0].calculationFingerprint).not.toBe(first.envelopes[0].calculationFingerprint);
    expect(compareMaintenanceEnvelopes(snapshot([work({ estimates: [estimate({ estimatedDurationDays: 6 })] })]), [envelope()]).inputFingerprint).not.toBe(first.inputFingerprint);
  });
  it('does not mutate inputs or grant authority', () => {
    const s = snapshot(), e = [envelope()]; const before = JSON.stringify([s, e]); Object.freeze(s.cases); Object.freeze(s); Object.freeze(e);
    const result = compareMaintenanceEnvelopes(s, e);
    expect(JSON.stringify([s, e])).toBe(before);
    expect(result.authority).toEqual({ hypotheticalOnly: true, authorizesExpenditure: false, mutatesWorkflow: false, optimized: false, scheduleFeasibilityEstablished: false });
    expect(JSON.stringify(result)).not.toMatch(/attentionScore|failureProbability|predictedSavings|allocatedAmount/);
  });
});
