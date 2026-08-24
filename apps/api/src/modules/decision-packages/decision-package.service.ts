import { createHash } from 'node:crypto';
import { CaseStatus, DecisionPackageStatus, Prisma } from '../../generated/prisma';
import prisma from '../../lib/prisma';
import { pageFromRows, type StableCursor } from '../../lib/pagination';
import type { OrganizationalPrincipal } from '../../security/organizational-scope';
import { assertVisibleCase, buildCaseReadWhere } from '../../security/organizational-scope';
import { resolveCasePolicy } from '../policy-registry/policy-registry.service';
import { evaluateCaseReadiness } from '../readiness/readiness.service';
import { RISK_ASSESSMENT_VERSION } from '../risk/risk.service';
import { appendIntegrityEvent } from '../integrity/integrity.service';

export const DECISION_PACKAGE_CONTRACT_VERSION = 'ODYSSEY_DECISION_PACKAGE_V1';

export class DecisionPackageError extends Error {
  constructor(public code: string, public status: number, message: string, public reasons?: Array<{ code: string; message: string }>) { super(message); }
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`;
  return JSON.stringify(value);
}

const packageInclude = {
  preparedBy: { select: { name: true, employeeCode: true, designation: true } }
} satisfies Prisma.DecisionPackageInclude;

async function authoritativeSource(caseId: string, principal: OrganizationalPrincipal, evaluatedAt: Date) {
  const readiness = await evaluateCaseReadiness(caseId, principal, evaluatedAt);
  if (readiness.outcome !== 'READY') {
    throw new DecisionPackageError(readiness.outcome === 'BLOCKED' ? 'DECISION_PACKAGE_BLOCKED' : 'DECISION_PACKAGE_NOT_READY', 409,
      readiness.outcome === 'BLOCKED' ? 'Decision Package preparation is blocked by a governance or data-integrity issue.' : 'The Case is not ready for Decision Package preparation.', readiness.reasons);
  }
  const target = await prisma.case.findUnique({
    where: { id: caseId },
    select: {
      id: true, caseNumber: true, title: true, status: true, emergencyFlag: true,
      asset: { select: { id: true, assetCode: true, name: true, assetType: true, department: { select: { id: true, code: true, name: true } }, jurisdiction: { select: { id: true, name: true, type: true } } } },
      inspections: { orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 1, select: { id: true, inspectionDate: true, structuralCondition: true, crackSeverity: true, corrosionLevel: true, trafficImportance: true, hospitalRoute: true, weatherRisk: true, heavyRainExpected: true, estimatedDailyUsers: true } },
      riskAssessments: { where: { assessmentVersion: RISK_ASSESSMENT_VERSION }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 1, select: { id: true, inspectionId: true, riskScore: true, riskLevel: true, priorityLevel: true, reasonCodes: true, reasons: true, assessmentVersion: true, createdAt: true } }
    }
  });
  if (!target) throw new DecisionPackageError('CASE_NOT_FOUND', 404, 'Case not found.');
  if (target.status !== CaseStatus.ORP_READY) throw new DecisionPackageError('DECISION_PACKAGE_CASE_STATE_INVALID', 409, 'A Decision Package may only be prepared at the Action Plan preparation boundary.');
  const inspection = target.inspections[0], risk = target.riskAssessments[0];
  if (!inspection || !risk) throw new DecisionPackageError('DECISION_PACKAGE_SOURCE_CHANGED', 409, 'Authoritative source state changed during preparation.');

  const policy = readiness.policySummary.governanceEstablished ? await resolveCasePolicy(caseId, principal, evaluatedAt) : null;
  if (policy && policy.status !== 'RESOLVED') throw new DecisionPackageError('DECISION_PACKAGE_SOURCE_CHANGED', 409, 'Policy governance changed during preparation.');
  const policyRules = policy?.applicableRules ?? [];
  const actionGroups = { MANDATORY: [] as unknown[], RECOMMENDED: [] as unknown[], OPTIONAL: [] as unknown[], PROHIBITED: [] as unknown[] };
  for (const item of policyRules) actionGroups[item.rule.enforcementLevel].push({
    actionId: item.action.id, actionCode: item.action.actionCode, actionVersion: item.action.versionNumber,
    title: item.action.title, category: item.action.category, description: item.action.description,
    sourceReference: item.action.sourceReference, enforcementClassification: item.rule.enforcementLevel
  });

  const material = {
    caseId: target.id, caseStatus: target.status, emergencyFlag: target.emergencyFlag,
    assetId: target.asset.id, departmentId: target.asset.department.id, jurisdictionId: target.asset.jurisdiction.id,
    inspectionId: inspection.id, riskAssessmentId: risk.id, riskAssessmentVersion: risk.assessmentVersion,
    readinessVersion: readiness.assessmentVersion,
    policy: policyRules.map((item) => ({ policyId: item.policy.id, policyVersion: item.policy.versionNumber, ruleId: item.rule.id, actionId: item.action.id, actionVersion: item.action.versionNumber, enforcement: item.rule.enforcementLevel })).sort((a, b) => canonical(a).localeCompare(canonical(b)))
  };
  const intelligence = await prisma.infrastructureIntelligenceAssessment.findFirst({where:{caseId,inspectionId:inspection.id,riskAssessmentId:risk.id,status:'COMPLETED',OR:[{expiresAt:null},{expiresAt:{gt:evaluatedAt}}]},include:{governanceReconciliations:{orderBy:[{reconciledAt:'desc'},{id:'desc'}],take:1}},orderBy:[{inferredAt:'desc'},{id:'desc'}]});
  const reconciliation=intelligence?.governanceReconciliations[0]??null;
  const intelligenceSnapshot=intelligence&&reconciliation?{state:'CURRENT_ADVISORY_WITH_GOVERNANCE',assessment:{id:intelligence.id,status:intelligence.status,predictedRiskScore:intelligence.predictedRiskScore,predictedRiskLevel:intelligence.predictedRiskLevel,recommendedPriority:intelligence.recommendedPriority,confidence:intelligence.confidence,confidenceSemantics:'INPUT_COMPLETENESS_NOT_CALIBRATED_PROBABILITY',provider:intelligence.provider,providerType:intelligence.providerType,productionTrained:false,modelName:intelligence.modelName,modelVersion:intelligence.modelVersion,featureSchemaVersion:intelligence.featureSchemaVersion,contractVersion:intelligence.contractVersion,inferredAt:intelligence.inferredAt,reconciliation:intelligence.reconciliation},governance:{id:reconciliation.id,contractVersion:reconciliation.contractVersion,policyResolutionStatus:reconciliation.policyResolutionStatus,policySnapshot:reconciliation.policySnapshot,reconciledActions:reconciliation.reconciledActions,issues:reconciliation.issues,reconciledAt:reconciliation.reconciledAt},advisoryOnly:true,humanDecision:false}:null;
  if(intelligenceSnapshot)Object.assign(material,{intelligenceAssessmentId:intelligence!.id,intelligenceReconciliationId:reconciliation!.id});
  return {
    readiness, target, inspection, risk, actionGroups,intelligenceSnapshot,
    policySnapshot: policy ? { state: 'APPLICABLE_GOVERNANCE', rules: policyRules.map((item) => ({ rule: item.rule, policy: item.policy, action: item.action })) }
      : { state: 'NO_APPLICABLE_ACTIVE_POLICY_GOVERNANCE', message: 'No applicable active policy governance was established at preparation time.', rules: [] },
    fingerprint: createHash('sha256').update(canonical(material)).digest('hex')
  };
}

function dto(record: Prisma.DecisionPackageGetPayload<{ include: typeof packageInclude }>, reused = false) {
  return {
    id: record.id, caseId: record.caseId, packageVersion: record.packageVersion, packageContractVersion: record.packageContractVersion,
    status: record.status, preparedAt: record.preparedAt, createdAt: record.createdAt, reused,
    preparedBy: record.preparedBy, caseContext: record.caseSnapshot, inspection: record.inspectionSnapshot,
    riskAssessment: record.riskSnapshot, readiness: record.readinessSnapshot, policyGovernance: record.policySnapshot,
    governedActions: record.actionSnapshot, intelligence: record.intelligenceSnapshot,
    humanReviewBoundary: { preparedForHumanReview: true, humanDecision: false, executionAuthorized: false, officerRemainsResponsible: true }
  };
}

export async function prepareDecisionPackage(caseId: string, principal: OrganizationalPrincipal, evaluatedAt = new Date()) {
  await assertVisibleCase(caseId, principal);
  const source = await authoritativeSource(caseId, principal, evaluatedAt);
  const existing = await prisma.decisionPackage.findUnique({ where: { caseId_sourceFingerprint: { caseId, sourceFingerprint: source.fingerprint } }, include: packageInclude });
  if (existing) return dto(existing, true);

  const create = () => prisma.$transaction(async (tx) => {
    const duplicate = await tx.decisionPackage.findUnique({ where: { caseId_sourceFingerprint: { caseId, sourceFingerprint: source.fingerprint } }, include: packageInclude });
    if (duplicate) return { record: duplicate, reused: true };
    const latest = await tx.decisionPackage.findFirst({ where: { caseId }, orderBy: [{ packageVersion: 'desc' }, { id: 'desc' }], select: { packageVersion: true } });
    const record = await tx.decisionPackage.create({
      data: {
        caseId, inspectionId: source.inspection.id, riskAssessmentId: source.risk.id,
        packageVersion: (latest?.packageVersion ?? 0) + 1, packageContractVersion: DECISION_PACKAGE_CONTRACT_VERSION,
        sourceFingerprint: source.fingerprint, preparedById: principal.id,
        caseSnapshot: { caseReference: source.target.caseNumber, title: source.target.title, lifecycleState: source.target.status, emergencyFlag: source.target.emergencyFlag, asset: source.target.asset },
        inspectionSnapshot: source.inspection, riskSnapshot: source.risk,
        readinessSnapshot: { outcome: source.readiness.outcome, assessmentVersion: source.readiness.assessmentVersion, evaluatedAt: source.readiness.evaluatedAt.toISOString(), checks: source.readiness.checks, reasons: source.readiness.reasons } as unknown as Prisma.InputJsonValue,
        policySnapshot: source.policySnapshot as Prisma.InputJsonValue, actionSnapshot: source.actionGroups as Prisma.InputJsonValue,
        intelligenceSnapshot: source.intelligenceSnapshot ? source.intelligenceSnapshot as Prisma.InputJsonValue : Prisma.JsonNull
      }, include: packageInclude
    });
    await tx.decisionPackage.updateMany({ where: { caseId, id: { not: record.id }, status: DecisionPackageStatus.PREPARED }, data: { status: DecisionPackageStatus.SUPERSEDED } });
    await appendIntegrityEvent(tx, {
      eventType: 'DECISION_PACKAGE_PREPARED', sourceEventKey: `DECISION_PACKAGE:${record.id}`,
      resourceType: 'DecisionPackage', resourceId: record.id, actor: principal,
      departmentId: source.target.asset.department.id, jurisdictionId: source.target.asset.jurisdiction.id,
      occurredAt: record.preparedAt,
      facts: { caseId, packageVersion: record.packageVersion, packageContractVersion: record.packageContractVersion, inspectionId: source.inspection.id, riskAssessmentId: source.risk.id, sourceFingerprint: source.fingerprint, status: record.status }
    });
    return { record, reused: false };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try { const result = await create(); return dto(result.record, result.reused); }
    catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || !['P2002', 'P2034'].includes(error.code)) throw error;
      const concurrent = await prisma.decisionPackage.findUnique({ where: { caseId_sourceFingerprint: { caseId, sourceFingerprint: source.fingerprint } }, include: packageInclude });
      if (concurrent) return dto(concurrent, true);
      if (attempt === 1) throw new DecisionPackageError('DECISION_PACKAGE_VERSION_CONFLICT', 409, 'Decision Package preparation conflicted with another request. Retry safely.');
    }
  }
  throw new DecisionPackageError('DECISION_PACKAGE_VERSION_CONFLICT', 409, 'Decision Package preparation conflicted with another request.');
}

export async function listDecisionPackages(caseId: string, principal: OrganizationalPrincipal, options: { limit: number; cursor?: StableCursor }) {
  await assertVisibleCase(caseId, principal);
  const rows = await prisma.decisionPackage.findMany({ where: { caseId, case: buildCaseReadWhere(principal), ...(options.cursor ? { OR: [{ preparedAt: { lt: new Date(options.cursor.at) } }, { preparedAt: new Date(options.cursor.at), id: { lt: options.cursor.id } }] } : {}) }, include: packageInclude, orderBy: [{ preparedAt: 'desc' }, { id: 'desc' }], take: options.limit + 1 });
  const page = pageFromRows(rows, options.limit, (item) => item.preparedAt.toISOString());
  return { ...page, items: page.items.map((item) => dto(item)) };
}

export async function getDecisionPackage(caseId: string, packageId: string, principal: OrganizationalPrincipal) {
  await assertVisibleCase(caseId, principal);
  const record = await prisma.decisionPackage.findFirst({ where: { id: packageId, caseId, case: buildCaseReadWhere(principal) }, include: packageInclude });
  if (!record) throw new DecisionPackageError('DECISION_PACKAGE_NOT_FOUND', 404, 'Decision Package not found.');
  return dto(record);
}

export async function requireCurrentDecisionPackage(caseId: string, principal: OrganizationalPrincipal) {
  const source = await authoritativeSource(caseId, principal, new Date());
  const select = { id: true, status: true, packageVersion: true, packageContractVersion: true, preparedAt: true, policySnapshot: true, actionSnapshot: true } as const;
  const record = await prisma.decisionPackage.findUnique({ where: { caseId_sourceFingerprint: { caseId, sourceFingerprint: source.fingerprint } }, select });
  if (!record || record.status !== DecisionPackageStatus.PREPARED) {
    const latest = await prisma.decisionPackage.findFirst({ where: { caseId, status: DecisionPackageStatus.PREPARED }, orderBy: [{ packageVersion: 'desc' }, { id: 'desc' }], select: { id: true } });
    if (latest) throw new DecisionPackageError('DECISION_PACKAGE_STALE', 409, 'The prepared Decision Package no longer matches current authoritative Case state.');
    throw new DecisionPackageError('CURRENT_DECISION_PACKAGE_REQUIRED', 409, 'Prepare a current Decision Package before generating a new Action Plan.');
  }
  return record;
}
