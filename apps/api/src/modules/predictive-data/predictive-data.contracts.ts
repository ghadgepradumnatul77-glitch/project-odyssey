import { createHash } from 'node:crypto';
import { z } from 'zod';
import { PredictiveOutcomeValue, PredictiveProvenanceClass } from '../../generated/prisma';

export const PREDICTIVE_DATASET_CONTRACT_VERSION = 'ODYSSEY_TASK_LATENESS_DATASET_V1';
export const TASK_LATENESS_FEATURE_CONTRACT_VERSION = 'TASK_LATENESS_FEATURES_V1';
export const TASK_LATENESS_OUTCOME_CONTRACT_VERSION = 'TASK_LATENESS_OUTCOME_V1';

const iso = z.string().datetime();
export const taskLatenessFeatureSchema = z.object({
  executionTaskId: z.string().uuid(), caseId: z.string().uuid(), assetId: z.string().uuid(), departmentId: z.string().uuid(), jurisdictionId: z.string().uuid(),
  sourceActionCode: z.string().min(1), sourceActionVersion: z.number().int().positive().nullable(), templateTaskKey: z.string().min(1), sourceTemplateCode: z.string().nullable(), sourceTemplateVersion: z.number().int().positive().nullable(),
  categorySnapshot: z.string().min(1), isMandatory: z.boolean(), plannedStartAt: iso.nullable(), plannedEndAt: iso.nullable(), assignedAt: iso, assignedToId: z.string().uuid(), assignedById: z.string().uuid(),
  caseRiskLevel: z.string().nullable(), casePriorityLevel: z.string().nullable(), emergencyFlag: z.boolean(), assetType: z.string(), constructionYear: z.number().int().nullable(), conditionStatus: z.string().nullable(),
  dependencyCount: z.number().int().nonnegative(), unmetDependencyCount: z.number().int().nonnegative(), scheduleRevisionCount: z.number().int().nonnegative(),
  activeEstimate: z.object({ estimateId: z.string().uuid(), estimateVersion: z.number().int().positive(), currency: z.string(), estimatedCostMinor: z.string().regex(/^\d+$/), estimatedDurationDays: z.number().int().positive().nullable(), resourceRequirements: z.unknown() }).nullable()
}).strict();
export type TaskLatenessFeatures = z.infer<typeof taskLatenessFeatureSchema>;

const demoAssetCodes = new Set(['BR-101','BR-204','FL-301','RD-410','BR-212','RD-118','FL-509','RD-330']);
export function classifyPredictiveProvenance(assetCode: string) {
  return demoAssetCodes.has(assetCode) || assetCode.startsWith('DEMO-') ? PredictiveProvenanceClass.DEMO : PredictiveProvenanceClass.PILOT;
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value as Record<string, unknown>).sort(([a],[b]) => a.localeCompare(b)).map(([key,item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`;
  return JSON.stringify(value);
}
export const predictiveFingerprint = (value: unknown) => createHash('sha256').update(canonical(value)).digest('hex');

export function deriveTaskLatenessOutcome(plannedEndAt: string | null, eventAt: Date, cancelled: boolean): PredictiveOutcomeValue | null {
  if (cancelled) return PredictiveOutcomeValue.CANCELLED;
  if (!plannedEndAt) return null;
  return eventAt.getTime() > new Date(plannedEndAt).getTime() ? PredictiveOutcomeValue.LATE : PredictiveOutcomeValue.ON_TIME;
}
