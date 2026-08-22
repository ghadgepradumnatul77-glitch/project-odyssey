import { CaseStatus, ExecutionTaskStatus, Prisma } from '../../generated/prisma';
import prisma from '../../lib/prisma';
import { buildCaseReadWhere, OrganizationalPrincipal } from '../../security/organizational-scope';
import { ReportingError, reportingIntegrity } from './reporting-error';

const actorSelect = { id: true, name: true, designation: true } as const;
const inspectionSelect = {
  id: true, caseId: true, inspectionDate: true, structuralCondition: true, crackSeverity: true,
  corrosionLevel: true, trafficImportance: true, hospitalRoute: true, weatherRisk: true,
  heavyRainExpected: true, estimatedDailyUsers: true, createdAt: true,
  inspector: { select: actorSelect }
} as const;
const riskSelect = {
  id: true, caseId: true, inspectionId: true, riskScore: true, riskLevel: true, priorityLevel: true,
  reasonCodes: true, reasons: true, assessmentVersion: true, createdAt: true,
  inspection: { select: inspectionSelect }
} as const;
const decisionSelect = {
  id: true, caseId: true, orpId: true, decisionType: true, reason: true, remarks: true, createdAt: true,
  reviewer: { select: actorSelect }
} as const;
const orpSelect = {
  id: true, caseId: true, riskAssessmentId: true, versionNumber: true, status: true, urgency: true,
  recommendedActionCodes: true, temporaryMeasures: true, alternativeActionCodes: true, reasons: true,
  planVersion: true, actionPlanContractVersion: true, governanceMode: true, governedActions: true, decisionPackageId: true, createdAt: true, riskAssessment: { select: riskSelect },
  decisionPackage: { select: { id: true, packageVersion: true, packageContractVersion: true, preparedAt: true, policySnapshot: true, intelligenceSnapshot: true } },
  decisions: { orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] as Prisma.OrpDecisionOrderByWithRelationInput[], take: 1, select: decisionSelect }
} as const;
const taskSelect = {
  id: true, isMandatory: true, status: true,
  assignedTo: { select: actorSelect }, completionSubmittedBy: { select: actorSelect }, verifiedBy: { select: actorSelect },
  evidence: { select: { evidenceType: true } }
} as const;
const planSelect = {
  id: true, caseId: true, orpId: true, approvalDecisionId: true, status: true, templateVersion: true,
  createdAt: true, startedAt: true, completedAt: true, approvalDecision: { select: decisionSelect },
  orp: { select: orpSelect }, tasks: { select: taskSelect }
} as const;

const STATUS_EXPLANATIONS: Record<CaseStatus, string> = {
  NEW: 'The case has been registered and awaits operational assessment.',
  INSPECTION_REQUIRED: 'The case requires an inspection.',
  INSPECTION_IN_PROGRESS: 'An inspection is in progress.',
  UNDER_ANALYSIS: 'Persisted inspection findings are under risk and priority analysis.',
  ORP_READY: 'An operational response plan is ready for human review.',
  UNDER_REVIEW: 'The operational response plan is awaiting a human decision.',
  APPROVED: 'The operational response plan has been approved for execution planning.',
  EXECUTION: 'Approved response work is being executed.',
  VERIFICATION: 'Execution is complete and awaits formal closure verification.',
  CLOSED: 'The verified workflow has been formally closed.',
  CANCELLED: 'The case has been cancelled.'
};

function stringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) reportingIntegrity(`Stored ${field} is malformed.`);
  return value as string[];
}

function reasonArray(value: unknown, field: string): Array<{ code: string | null; message: string }> {
  if (!Array.isArray(value)) reportingIntegrity(`Stored ${field} is malformed.`);
  return value.map((item) => {
    if (typeof item === 'string') return { code: null, message: item };
    if (!item || typeof item !== 'object' || Array.isArray(item)) reportingIntegrity(`Stored ${field} is malformed.`);
    const reason = item as Record<string, unknown>;
    if (typeof reason.reasonCode !== 'string' || typeof reason.message !== 'string') reportingIntegrity(`Stored ${field} is malformed.`);
    return { code: reason.reasonCode, message: reason.message };
  });
}
function governedActionProjection(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) reportingIntegrity('Stored governed Action Plan provenance is malformed.');
  const record=value as Record<string,unknown>;
  for(const key of ['MANDATORY','RECOMMENDED','OPTIONAL','PROHIBITED','ENGINEERING_RECOMMENDED']) if(!Array.isArray(record[key])) reportingIntegrity('Stored governed Action Plan provenance is malformed.');
  return record;
}

function actors(values: Array<{ id: string; name: string; designation: string } | null>) {
  const unique = new Map<string, { id: string; name: string; designation: string }>();
  for (const value of values) if (value) unique.set(value.id, value);
  return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}

export function executionMetrics(tasks: Array<{ isMandatory: boolean; status: ExecutionTaskStatus; evidence: unknown[] }>) {
  const mandatoryTasks = tasks.filter((task) => task.isMandatory).length;
  const verifiedMandatoryTasks = tasks.filter((task) => task.isMandatory && task.status === ExecutionTaskStatus.VERIFIED).length;
  const optionalTasks = tasks.length - mandatoryTasks;
  const terminalOptionalTasks = tasks.filter((task) => !task.isMandatory && (task.status === ExecutionTaskStatus.VERIFIED || task.status === ExecutionTaskStatus.CANCELLED)).length;
  return {
    totalTasks: tasks.length,
    mandatoryTasks,
    verifiedMandatoryTasks,
    optionalTasks,
    terminalOptionalTasks,
    verifiedTasks: tasks.filter((task) => task.status === ExecutionTaskStatus.VERIFIED).length,
    blockedTasks: tasks.filter((task) => task.status === ExecutionTaskStatus.BLOCKED).length,
    cancelledTasks: tasks.filter((task) => task.status === ExecutionTaskStatus.CANCELLED).length,
    evidenceCount: tasks.reduce((total, task) => total + task.evidence.length, 0),
    completionPercentage: mandatoryTasks === 0 ? null : Math.round((verifiedMandatoryTasks / mandatoryTasks) * 10000) / 100
  };
}

export async function getDecisionBrief(caseId: string, principal: OrganizationalPrincipal) {
  const target = await prisma.case.findFirst({
    where: { id: caseId, ...buildCaseReadWhere(principal) },
    select: {
      id: true, caseNumber: true, title: true, description: true, status: true, emergencyFlag: true,
      createdAt: true, updatedAt: true, closedAt: true,
      asset: { select: { id: true, assetCode: true, name: true, assetType: true, department: { select: { id: true, code: true, name: true } }, jurisdiction: { select: { id: true, name: true, type: true } } } },
      closure: { select: { id: true, caseId: true, executionPlanId: true, closureReason: true, closureSummary: true, createdAt: true, closedBy: { select: actorSelect }, executionPlan: { select: planSelect } } },
      executionPlans: { orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 1, select: planSelect },
      operationalResponsePlans: { orderBy: [{ versionNumber: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }], take: 1, select: orpSelect },
      riskAssessments: { orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 1, select: riskSelect },
      inspections: { orderBy: [{ inspectionDate: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }], take: 1, select: inspectionSelect }
    }
  });
  if (!target) throw new ReportingError('CASE_NOT_FOUND', 404, 'Case not found.');

  const plan = target.closure?.executionPlan ?? target.executionPlans[0] ?? null;
  const orp = plan?.orp ?? target.operationalResponsePlans[0] ?? null;
  const risk = orp?.riskAssessment ?? target.riskAssessments[0] ?? null;
  const inspection = risk?.inspection ?? target.inspections[0] ?? null;
  const decision = plan?.approvalDecision ?? orp?.decisions[0] ?? null;

  if (target.closure && (target.closure.caseId !== target.id || target.closure.executionPlanId !== plan?.id || plan?.caseId !== target.id)) reportingIntegrity();
  if (plan && (plan.caseId !== target.id || plan.orpId !== orp?.id || plan.approvalDecisionId !== decision?.id || decision?.orpId !== orp?.id || decision.caseId !== target.id)) reportingIntegrity();
  if (!plan && decision && (decision.orpId !== orp?.id || decision.caseId !== target.id)) reportingIntegrity();
  if (orp && (orp.caseId !== target.id || orp.riskAssessmentId !== risk?.id)) reportingIntegrity();
  const orpGovernanceMode = orp?.governanceMode ?? 'LEGACY';
  const orpDecisionPackageId = orp?.decisionPackageId ?? null;
  if (orp && ((orpGovernanceMode === 'LEGACY') !== (orpDecisionPackageId === null))) reportingIntegrity('Action Plan governance mode and package provenance are inconsistent.');
  if (orp?.decisionPackageId && orp.decisionPackage?.id !== orp.decisionPackageId) reportingIntegrity('Decision Package provenance is inconsistent.');
  if (risk && (risk.caseId !== target.id || risk.inspectionId !== inspection?.id || inspection.caseId !== target.id)) reportingIntegrity();

  const evidenceTypes = plan?.tasks.flatMap((task) => task.evidence.map((item) => item.evidenceType)) ?? [];
  const countsByType = Object.fromEntries([...new Set(evidenceTypes)].sort().map((type) => [type, evidenceTypes.filter((item) => item === type).length]));
  return {
    case: { id: target.id, caseNumber: target.caseNumber, title: target.title, description: target.description, status: target.status, statusExplanation: STATUS_EXPLANATIONS[target.status], emergencyFlag: target.emergencyFlag, createdAt: target.createdAt, updatedAt: target.updatedAt, closedAt: target.closedAt },
    asset: target.asset,
    workflow: { coherent: true, warnings: [], statusExplanationVersion: 'ODYSSEY_CASE_STATUS_V1', anchor: target.closure ? 'CASE_CLOSURE' : plan ? 'EXECUTION_PLAN' : orp ? 'ORP' : risk ? 'RISK_ASSESSMENT' : inspection ? 'INSPECTION' : 'CASE' },
    inspection: inspection && { id: inspection.id, inspectionDate: inspection.inspectionDate, structuralCondition: inspection.structuralCondition, crackSeverity: inspection.crackSeverity, corrosionLevel: inspection.corrosionLevel, trafficImportance: inspection.trafficImportance, hospitalRoute: inspection.hospitalRoute, weatherRisk: inspection.weatherRisk, heavyRainExpected: inspection.heavyRainExpected, estimatedDailyUsers: inspection.estimatedDailyUsers, createdAt: inspection.createdAt, inspector: inspection.inspector },
    risk: risk && { id: risk.id, riskScore: risk.riskScore, riskLevel: risk.riskLevel, priorityLevel: risk.priorityLevel, reasonCodes: stringArray(risk.reasonCodes, 'risk reasonCodes'), reasons: reasonArray(risk.reasons, 'risk reasons'), assessmentVersion: risk.assessmentVersion, createdAt: risk.createdAt },
    orp: orp && { id: orp.id, versionNumber: orp.versionNumber, status: orp.status, urgency: orp.urgency, recommendedActionCodes: stringArray(orp.recommendedActionCodes, 'ORP recommendedActionCodes'), temporaryMeasures: stringArray(orp.temporaryMeasures, 'ORP temporaryMeasures'), alternativeActionCodes: stringArray(orp.alternativeActionCodes, 'ORP alternativeActionCodes'), reasons: reasonArray(orp.reasons, 'ORP reasons'), planVersion: orp.planVersion, actionPlanContractVersion: orp.actionPlanContractVersion, governanceMode: orpGovernanceMode, governedActions: orpGovernanceMode === 'LEGACY' ? null : governedActionProjection(orp.governedActions), decisionPackage: orp.decisionPackage && { id: orp.decisionPackage.id, packageVersion: orp.decisionPackage.packageVersion, packageContractVersion: orp.decisionPackage.packageContractVersion, preparedAt: orp.decisionPackage.preparedAt, policyGovernance: orp.decisionPackage.policySnapshot, intelligence: orp.decisionPackage.intelligenceSnapshot }, humanReviewBoundary: { decisionSupportOnly: true, executionAuthorized: false }, createdAt: orp.createdAt },
    decision: decision && { id: decision.id, decisionType: decision.decisionType, reason: decision.reason, remarks: decision.remarks, createdAt: decision.createdAt, reviewer: decision.reviewer },
    execution: plan && { id: plan.id, status: plan.status, templateVersion: plan.templateVersion, createdAt: plan.createdAt, startedAt: plan.startedAt, completedAt: plan.completedAt, metrics: executionMetrics(plan.tasks), accountability: { assignees: actors(plan.tasks.map((task) => task.assignedTo)), completionSubmitters: actors(plan.tasks.map((task) => task.completionSubmittedBy)), verifiers: actors(plan.tasks.map((task) => task.verifiedBy)) } },
    evidence: plan && { totalEvidence: evidenceTypes.length, countsByType },
    closure: target.closure && { id: target.closure.id, closureReason: target.closure.closureReason, closureSummary: target.closure.closureSummary, createdAt: target.closure.createdAt, closedBy: target.closure.closedBy }
  };
}
