import { z } from 'zod';
import { compareMaintenanceEnvelopes, maintenanceEnvelopeSchema, maintenanceEstimateSchema } from './maintenance-scenario.calculations';
import { createMaintenanceScenarioRepository, MaintenanceSnapshotError } from './maintenance-scenario.repository';
import type { OrganizationalPrincipal } from '../../security/organizational-scope';

const requestSchema = z.object({
  envelopes: z.array(maintenanceEnvelopeSchema).min(1).max(5).refine(items => new Set(items.map(e => e.id)).size === items.length),
  assetId: z.string().uuid().optional(), caseId: z.string().uuid().optional()
}).strict();
export class MaintenanceServiceError extends Error {
  constructor(public readonly code: string, public readonly status: number) { super(code); }
}
export function createMaintenanceScenarioService(repository = createMaintenanceScenarioRepository()) {
  return {
    async compare(principal: OrganizationalPrincipal, input: unknown) {
      if (!principal || principal.status !== 'ACTIVE') throw new MaintenanceServiceError('FORBIDDEN', 403);
      const parsed = requestSchema.safeParse(input);
      if (!parsed.success) throw new MaintenanceServiceError('INVALID_MAINTENANCE_REQUEST', 400);
      try {
        const evidence = await repository.snapshot(principal, { assetId: parsed.data.assetId, caseId: parsed.data.caseId });
        if (!evidence.complete) throw new Error('Incomplete snapshot');
        const comparison = compareMaintenanceEnvelopes(evidence.snapshot, parsed.data.envelopes);
        return {
          ...comparison, projectionAsOf: evidence.snapshot.asOf, sourceSetFingerprint: evidence.sourceSetFingerprint,
          coverage: { ...evidence.coverage, invalidEstimateCases: evidence.snapshot.cases.filter(c => c.estimates.some(e => !maintenanceEstimateSchema.safeParse(e).success)).length },
          caseContext: evidence.snapshot.cases.map(c => ({ caseId: c.caseId, assetId: c.assetId, status: c.status, priorityLevel: c.priorityLevel, riskLevel: c.riskLevel, emergencyFlag: c.emergencyFlag, hospitalRoute: c.hospitalRoute, createdAt: c.createdAt })),
          disclosures: [...comparison.disclosures, ...evidence.disclosures]
        };
      } catch (error) {
        if (error instanceof MaintenanceSnapshotError && error.code === 'RESOURCE_NOT_FOUND') throw new MaintenanceServiceError('RESOURCE_NOT_FOUND', 404);
        throw new MaintenanceServiceError('MAINTENANCE_COMPARISON_UNAVAILABLE', 503);
      }
    }
  };
}
