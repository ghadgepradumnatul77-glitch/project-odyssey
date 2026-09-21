import prisma from '../../lib/prisma';
import { OrganizationalPrincipal } from '../../security/organizational-scope';
import { appendIntegrityEvent } from '../integrity/integrity.service';
import { ExecutionError } from './execution-error';
import { executionProvenanceDeclarationInput, EXECUTION_PROVENANCE_CONTRACT_VERSION, requiredProvenanceCapability } from './execution-provenance.contracts';

const selection = {
  id: true, provenanceClassification: true, provenanceDeclaredById: true,
  provenanceDeclaredAt: true, provenanceAuthorityGrantId: true,
  provenanceEvidenceReference: true, provenanceContractVersion: true,
} as const;

export async function declareExecutionProvenance(planId: string, input: unknown, principal: OrganizationalPrincipal) {
  if (principal.role !== 'OFFICER' || principal.status !== 'ACTIVE' || !principal.departmentId || !principal.jurisdictionId)
    throw new ExecutionError('PROVENANCE_FORBIDDEN', 403, 'An active scoped officer is required.');
  const parsed = executionProvenanceDeclarationInput.safeParse(input);
  if (!parsed.success) throw new ExecutionError('INVALID_INPUT', 400, 'A controlled classification and evidence reference are required.');
  const data = parsed.data;
  try {
    return await prisma.$transaction(async tx => {
      // Revalidate the persisted actor in the same serializable snapshot as the grant and plan.
      const actor = await tx.user.findFirst({ where: { id: principal.id, role: 'OFFICER', status: 'ACTIVE', departmentId: principal.departmentId, jurisdictionId: principal.jurisdictionId }, select: { id: true } });
      if (!actor) throw new ExecutionError('PROVENANCE_FORBIDDEN', 403, 'An active scoped officer is required.');
      const plan = await tx.executionPlan.findFirst({ where: { id: planId, case: { asset: { departmentId: principal.departmentId, jurisdictionId: principal.jurisdictionId } } }, select: selection });
      if (!plan) throw new ExecutionError('EXECUTION_PLAN_NOT_FOUND', 404, 'Execution plan not found.');
      const now = new Date();
      const grant = await tx.approvalAuthority.findFirst({ where: {
        userId: principal.id, departmentId: principal.departmentId, jurisdictionId: principal.jurisdictionId,
        isActive: true, [requiredProvenanceCapability(data.classification)]: true,
        AND: [{ OR: [{ validFrom: null }, { validFrom: { lte: now } }] }, { OR: [{ validUntil: null }, { validUntil: { gte: now } }] }],
      }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], select: { id: true } });
      if (!grant) throw new ExecutionError('PROVENANCE_AUTHORITY_REQUIRED', 403, 'A current scope-matched provenance grant is required.');
      if (plan.provenanceClassification !== null) {
        if (plan.provenanceClassification === data.classification && plan.provenanceEvidenceReference === data.evidenceReference && plan.provenanceDeclaredById === principal.id && plan.provenanceContractVersion === EXECUTION_PROVENANCE_CONTRACT_VERSION)
          return { declaration: plan, idempotent: true };
        throw new ExecutionError('PROVENANCE_ALREADY_DECLARED', 409, 'Provenance cannot be redeclared.');
      }
      const changed = await tx.executionPlan.updateMany({ where: { id: plan.id, provenanceClassification: null }, data: {
        provenanceClassification: data.classification, provenanceEvidenceReference: data.evidenceReference,
        provenanceDeclaredById: principal.id, provenanceDeclaredAt: now, provenanceAuthorityGrantId: grant.id,
        provenanceContractVersion: EXECUTION_PROVENANCE_CONTRACT_VERSION,
      } });
      if (changed.count !== 1) throw new ExecutionError('PROVENANCE_CONCURRENT_DECLARATION', 409, 'A concurrent declaration requires a fresh request.');
      const declaration = await tx.executionPlan.findUniqueOrThrow({ where: { id: plan.id }, select: selection });
      await appendIntegrityEvent(tx, {
        eventType: 'EXECUTION_PLAN_PROVENANCE_DECLARED', sourceEventKey: `EXECUTION_PLAN_PROVENANCE:${plan.id}`,
        resourceType: 'ExecutionPlan', resourceId: plan.id, actor: principal,
        departmentId: principal.departmentId, jurisdictionId: principal.jurisdictionId, occurredAt: now,
        facts: { ...declaration, provenanceDeclaredAt: now.toISOString() },
      });
      return { declaration, idempotent: false };
    }, { isolationLevel: 'Serializable', maxWait: 5000, timeout: 10000 });
  } catch (error) {
    if (error instanceof ExecutionError) throw error;
    if ((error as { code?: string })?.code === 'P2034') throw new ExecutionError('PROVENANCE_CONCURRENT_DECLARATION', 409, 'A concurrent declaration requires a fresh request.');
    throw new ExecutionError('PROVENANCE_DECLARATION_UNAVAILABLE', 503, 'Could not record provenance declaration.');
  }
}
