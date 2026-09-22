import { z } from 'zod';
import { Prisma, PredictiveProvenanceClass } from '../../generated/prisma';
import { OrganizationalPrincipal } from '../../security/organizational-scope';
import { appendIntegrityEvent } from '../integrity/integrity.service';
import { predictiveFingerprint } from './predictive-data.contracts';

export const ASSIGNMENT_FEATURE_VERSION = 'TASK_LATENESS_INITIAL_ASSIGNMENT_V2';
// V1 remains a historical read contract. New features contain no actor identities.
export const initialAssignmentFeatures = z.object({
  assignedAt: z.string().datetime(), plannedStartAt: z.string().datetime().nullable(), plannedEndAt: z.string().datetime().nullable(),
  sourceActionCode: z.string(), sourceActionVersion: z.number().int().nullable(),
  templateTaskKey: z.string(), sourceTemplateCode: z.string().nullable(), sourceTemplateVersion: z.number().int().nullable(),
  categorySnapshot: z.string(), isMandatory: z.boolean(),
  caseRiskLevel: z.string().nullable(), casePriorityLevel: z.string().nullable(), emergencyFlag: z.boolean(),
  assetType: z.string(), constructionYear: z.number().int().nullable(), conditionStatus: z.string().nullable(),
}).strict();

// Caller must have just won the PENDING/unassigned -> ASSIGNED compare-and-set.
// No standalone/post-commit entry point, and no upsert/backfill of old snapshots.
export async function captureInitialAssignmentSnapshot(tx: Prisma.TransactionClient, taskId: string, assignedAt: Date, actor: OrganizationalPrincipal) {
  const task = await tx.executionTask.findUniqueOrThrow({ where: { id: taskId }, select: {
    id: true, executionPlanId: true, assignedAt: true, status: true,
    plannedStartAt: true, plannedEndAt: true, sourceActionCode: true, sourceActionVersion: true,
    templateTaskKey: true, sourceTemplateCode: true, sourceTemplateVersion: true, categorySnapshot: true, isMandatory: true,
    executionPlan: { select: {
      provenanceClassification: true, provenanceDeclaredAt: true, provenanceAuthorityGrantId: true,
      provenanceEvidenceReference: true, provenanceContractVersion: true,
      case: { select: { id: true, riskLevel: true, priorityLevel: true, emergencyFlag: true,
        asset: { select: { id: true, departmentId: true, jurisdictionId: true, assetType: true, constructionYear: true, conditionStatus: true } },
      } },
    } },
  } });
  if (task.status !== 'ASSIGNED' || task.assignedAt?.getTime() !== assignedAt.getTime()) throw new Error('Initial assignment snapshot boundary mismatch');
  if (await tx.predictiveFeatureSnapshot.findFirst({ where: { executionTaskId: taskId, targetType: 'TASK_LATENESS' }, select: { id: true } })) throw new Error('Initial assignment snapshot already exists');
  const plan = task.executionPlan, c = plan.case, asset = c.asset;
  const featurePayload = initialAssignmentFeatures.parse({
    assignedAt: assignedAt.toISOString(), plannedStartAt: task.plannedStartAt?.toISOString() ?? null, plannedEndAt: task.plannedEndAt?.toISOString() ?? null,
    sourceActionCode: task.sourceActionCode, sourceActionVersion: task.sourceActionVersion,
    templateTaskKey: task.templateTaskKey, sourceTemplateCode: task.sourceTemplateCode, sourceTemplateVersion: task.sourceTemplateVersion,
    categorySnapshot: task.categorySnapshot, isMandatory: task.isMandatory,
    caseRiskLevel: c.riskLevel, casePriorityLevel: c.priorityLevel, emergencyFlag: c.emergencyFlag,
    assetType: asset.assetType, constructionYear: asset.constructionYear, conditionStatus: asset.conditionStatus,
  });
  const provenanceClass = plan.provenanceClassification ?? PredictiveProvenanceClass.UNKNOWN;
  const sourceReferences = {
    executionTaskId: task.id, executionPlanId: task.executionPlanId, caseId: c.id, assetId: asset.id,
    predictionPoint: 'INITIAL_ASSIGNMENT', provenanceClass,
    provenanceDeclaredAt: plan.provenanceDeclaredAt?.toISOString() ?? null,
    provenanceAuthorityGrantId: plan.provenanceAuthorityGrantId, provenanceEvidenceReference: plan.provenanceEvidenceReference,
    provenanceContractVersion: plan.provenanceContractVersion,
  };
  const sourceFingerprint = predictiveFingerprint({ contract: ASSIGNMENT_FEATURE_VERSION, featurePayload, sourceReferences });
  const snapshot = await tx.predictiveFeatureSnapshot.create({ data: {
    targetType: 'TASK_LATENESS', executionTaskId: task.id, caseId: c.id, assetId: asset.id,
    departmentId: asset.departmentId, jurisdictionId: asset.jurisdictionId, predictionTimestamp: assignedAt,
    featureContractVersion: ASSIGNMENT_FEATURE_VERSION, featurePayload, provenanceClass,
    sourceReferences, sourceFingerprint, createdById: actor.id,
  } });
  await appendIntegrityEvent(tx, {
    eventType: 'PREDICTIVE_FEATURE_SNAPSHOT_CREATED', sourceEventKey: `PREDICTIVE_FEATURE_SNAPSHOT:${snapshot.id}`,
    resourceType: 'PredictiveFeatureSnapshot', resourceId: snapshot.id, actor,
    departmentId: asset.departmentId, jurisdictionId: asset.jurisdictionId, occurredAt: snapshot.createdAt,
    facts: { executionTaskId: task.id, predictionTimestamp: assignedAt.toISOString(), featureContractVersion: ASSIGNMENT_FEATURE_VERSION, provenanceClass, sourceFingerprint },
  });
  return snapshot;
}
