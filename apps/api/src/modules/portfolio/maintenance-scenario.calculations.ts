import { createHash } from 'node:crypto';
import { z } from 'zod';
import {
  MAINTENANCE_CONTRACT_VERSION, MAINTENANCE_CALCULATION_VERSION, MAX_MAINTENANCE_CASES, MAX_MAINTENANCE_ENVELOPES,
  MAX_MAINTENANCE_MINOR, maintenanceResources, type MaintenanceSnapshot, type MaintenanceEnvelope,
  type MaintenanceComparison, type MaintenanceCaseResult, type MaintenanceReason, type MaintenanceCase
} from './maintenance-scenario.contracts';

const priorities = ['CRITICAL', 'VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW'];
const risks = ['CRITICAL', 'VERY_HIGH', 'HIGH', 'MODERATE', 'LOW', 'VERY_LOW'];
const id = z.string().min(1).max(200);
const quantity = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const duration = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const moneyPattern = /^(0|[1-9][0-9]{0,15})$/;
const money = z.string().regex(moneyPattern).refine(value => !moneyPattern.test(value) || BigInt(value) <= BigInt(MAX_MAINTENANCE_MINOR));
const resource = z.object({ category: z.enum(maintenanceResources), quantity: quantity.nullable(), unit: z.literal('UNIT_DAYS') }).strict();
const resources = z.array(resource).max(7).refine(items => new Set(items.map(r => r.category)).size === items.length);
const estimateSchema = z.object({ id, estimateVersion: z.number().int().positive().max(Number.MAX_SAFE_INTEGER), status: z.enum(['ACTIVE', 'SUPERSEDED']), currency: z.literal('INR'), estimatedCostMinor: money.nullable(), estimatedDurationDays: duration.nullable(), resourceRequirements: resources, resourcesComplete: z.boolean().nullable() }).strict();
const envelopeSchema = z.object({ id, currency: z.literal('INR'), budgetMinor: money.nullable(), resourceCapacities: resources, perWorkDurationCeilingDays: duration.nullable().optional() }).strict();
const snapshotSchema = z.object({ asOf: z.string().datetime({ offset: true }), cases: z.array(z.object({
  caseId: id, assetId: id, authorized: z.boolean(), status: z.string(), priorityLevel: z.string().nullable(), riskLevel: z.string().nullable(),
  emergencyFlag: z.boolean().nullable(), hospitalRoute: z.boolean().nullable(), createdAt: z.string(), estimates: z.array(z.unknown()).max(1000)
}).strict()).max(MAX_MAINTENANCE_CASES) }).strict();
export class MaintenanceCalculationError extends Error { constructor() { super('INVALID_MAINTENANCE_COMPARISON'); } }

// Arrays are sets for these contracts; sorted canonical encoding makes insertion order irrelevant.
function canonical(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') return Number.isFinite(value) ? JSON.stringify(value) : `nonfinite:${String(value)}`;
  if (Array.isArray(value)) return '[' + value.map(canonical).sort().join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.entries(value).filter(([, v]) => v !== undefined).sort(([a], [b]) => compareText(a, b)).map(([k, v]) => JSON.stringify(k) + ':' + canonical(v)).join(',') + '}';
  throw new MaintenanceCalculationError();
}
function fingerprint(value: unknown) { return 'sha256:' + createHash('sha256').update(canonical(value)).digest('hex'); }
function compareText(a: string, b: string) { return a < b ? -1 : a > b ? 1 : 0; }
function order(a: MaintenanceCase, b: MaintenanceCase) {
  const rank = (v: string | null, values: string[]) => { const index = values.indexOf(v ?? ''); return index < 0 ? values.length : index; };
  const date = (v: string) => Number.isFinite(Date.parse(v)) ? Date.parse(v) : Number.MAX_SAFE_INTEGER;
  return rank(a.priorityLevel, priorities) - rank(b.priorityLevel, priorities) || rank(a.riskLevel, risks) - rank(b.riskLevel, risks)
    || Number(b.emergencyFlag === true) - Number(a.emergencyFlag === true) || Number(b.hospitalRoute === true) - Number(a.hospitalRoute === true)
    || date(a.createdAt) - date(b.createdAt) || compareText(a.caseId, b.caseId);
}

/** Pure greedy hypothetical inclusion; no source mutation, persistence or operational authority. */
export function compareMaintenanceEnvelopes(snapshot: MaintenanceSnapshot, envelopes: MaintenanceEnvelope[]): MaintenanceComparison {
  try { return calculate(snapshot, envelopes); } catch { throw new MaintenanceCalculationError(); }
}
function calculate(snapshot: MaintenanceSnapshot, envelopes: MaintenanceEnvelope[]): MaintenanceComparison {
  snapshotSchema.parse(snapshot);
  if (!Array.isArray(envelopes) || envelopes.length < 1 || envelopes.length > MAX_MAINTENANCE_ENVELOPES
    || envelopes.some(e => !id.safeParse(e?.id).success) || new Set(envelopes.map(e => e.id)).size !== envelopes.length
    || new Set(snapshot.cases.map(c => c.caseId)).size !== snapshot.cases.length) throw new MaintenanceCalculationError();
  const inputFingerprint = fingerprint({ contract: MAINTENANCE_CONTRACT_VERSION, snapshot });
  const cases = [...snapshot.cases].sort(order);
  return {
    contractVersion: MAINTENANCE_CONTRACT_VERSION, calculationVersion: MAINTENANCE_CALCULATION_VERSION, inputFingerprint,
    envelopes: envelopes.map(raw => {
      const parsed = envelopeSchema.safeParse(raw);
      const envelope = parsed.success ? parsed.data : null;
      let budget = envelope?.budgetMinor == null ? null : BigInt(envelope.budgetMinor);
      const balances = Object.fromEntries(maintenanceResources.map(category => [category, envelope?.resourceCapacities.find(r => r.category === category)?.quantity ?? null])) as MaintenanceComparison['envelopes'][number]['remainingResources'];
      const result = cases.map(item => {
        const row: MaintenanceCaseResult = { caseId: item.caseId, assetId: item.assetId, estimateId: null, estimateVersion: null, estimatedCostMinor: null, estimatedDurationDays: null, resourcesComplete: null, state: 'INSUFFICIENT_DATA', reasonCodes: [] };
        const finish = (state: MaintenanceCaseResult['state'], ...reasons: MaintenanceReason[]) => ({ ...row, state, reasonCodes: reasons });
        if (!item.authorized) return finish('OUT_OF_SCOPE', 'OUTSIDE_AUTHORIZED_SCOPE');
        if (['CLOSED', 'CANCELLED'].includes(item.status)) return finish('OUT_OF_SCOPE', 'TERMINAL_CASE');
        if (!envelope) return finish('INVALID_DATA', 'ENVELOPE_INVALID');
        if ((item.priorityLevel !== null && !priorities.includes(item.priorityLevel)) || (item.riskLevel !== null && !risks.includes(item.riskLevel))
          || !['NEW', 'INSPECTION_REQUIRED', 'INSPECTION_IN_PROGRESS', 'UNDER_ANALYSIS', 'ORP_READY', 'UNDER_REVIEW', 'APPROVED', 'EXECUTION', 'VERIFICATION'].includes(item.status)
          || !z.string().datetime({ offset: true }).safeParse(item.createdAt).success || Date.parse(item.createdAt) > Date.parse(snapshot.asOf)) return finish('INVALID_DATA', 'CASE_CONTEXT_INVALID');
        if (item.priorityLevel === null || item.riskLevel === null || item.emergencyFlag === null || item.hospitalRoute === null) return finish('INSUFFICIENT_DATA', 'CASE_CONTEXT_MISSING');
        // Unknown/malformed status can conceal an active estimate; fail closed.
        if (item.estimates.some(e => !e || typeof e !== 'object' || !['ACTIVE', 'SUPERSEDED'].includes((e as { status: string }).status))) return finish('INVALID_DATA', 'ESTIMATE_INVALID');
        const active = item.estimates.filter(e => (e as { status: string }).status === 'ACTIVE');
        if (active.length > 1) return finish('INVALID_DATA', 'MULTIPLE_ACTIVE_ESTIMATES');
        if (!active.length) return finish('INSUFFICIENT_DATA', 'ESTIMATE_MISSING');
        const selected = estimateSchema.safeParse(active[0]);
        if (!selected.success) return finish('INVALID_DATA', 'ESTIMATE_INVALID');
        const estimate = selected.data;
        row.estimateId = estimate.id; row.estimateVersion = estimate.estimateVersion;
        row.estimatedCostMinor = estimate.estimatedCostMinor; row.estimatedDurationDays = estimate.estimatedDurationDays; row.resourcesComplete = estimate.resourcesComplete;
        const missing: MaintenanceReason[] = [];
        if (budget === null) missing.push('BUDGET_UNKNOWN');
        if (estimate.estimatedCostMinor === null) missing.push('COST_UNKNOWN');
        if (estimate.resourcesComplete !== true) missing.push('RESOURCE_COMPLETENESS_UNKNOWN');
        if (estimate.resourceRequirements.some(r => r.quantity === null)) missing.push('RESOURCE_QUANTITY_UNKNOWN');
        if (estimate.resourceRequirements.some(r => r.quantity !== 0 && balances[r.category] === null)) missing.push('CAPACITY_UNSPECIFIED');
        if (envelope.perWorkDurationCeilingDays != null && estimate.estimatedDurationDays === null) missing.push('DURATION_UNKNOWN');
        if (missing.length) return finish('INSUFFICIENT_DATA', ...missing);
        const cost = BigInt(estimate.estimatedCostMinor!);
        const exceeded: MaintenanceReason[] = [];
        if (cost > budget!) exceeded.push('BUDGET_EXCEEDED');
        if (estimate.resourceRequirements.some(r => r.quantity! > (balances[r.category] ?? 0))) exceeded.push('RESOURCE_CAPACITY_EXCEEDED');
        if (envelope.perWorkDurationCeilingDays != null && estimate.estimatedDurationDays! > envelope.perWorkDurationCeilingDays) exceeded.push('DURATION_CEILING_EXCEEDED');
        if (exceeded.length) return finish('CONSTRAINT_EXCEEDED', ...exceeded);
        budget = budget! - cost;
        for (const r of estimate.resourceRequirements) if (balances[r.category] !== null) balances[r.category] = balances[r.category]! - r.quantity!;
        return finish('FITS_DECLARED_ENVELOPE', 'HYPOTHETICAL_FIT');
      });
      return { envelopeId: raw.id, calculationFingerprint: fingerprint({ inputFingerprint, calculationVersion: MAINTENANCE_CALCULATION_VERSION, envelope: raw }),
        reasonCodes: (envelope ? [] : ['ENVELOPE_INVALID']) as MaintenanceReason[], cases: result, remainingBudgetMinor: budget?.toString() ?? null, remainingResources: balances };
    }),
    authority: { hypotheticalOnly: true, authorizesExpenditure: false, mutatesWorkflow: false, optimized: false, scheduleFeasibilityEstablished: false },
    disclosures: ['Greedy hypothetical inclusion using recorded Case priority, risk, emergency flag, hospital route, then Case creation time and ID.',
      'Unknown evidence remains explicit. Empty resource requirements require an explicit completeness declaration.',
      'A per-work duration ceiling does not establish portfolio scheduling feasibility. No procurement, allocation, approval or predicted savings are implied.']
  };
}
