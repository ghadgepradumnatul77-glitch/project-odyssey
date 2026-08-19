import { createHash } from 'node:crypto';
import { CaseStatus, DecisionPackageStatus, Prisma } from '../../generated/prisma';
import prisma from '../../lib/prisma';
import type { OrganizationalPrincipal } from '../../security/organizational-scope';
import { assertVisibleCase, buildCaseReadWhere } from '../../security/organizational-scope';
import { resolveCasePolicy } from '../policy-registry/policy-registry.service';
import { evaluateCaseReadiness } from '../readiness/readiness.service';

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
      riskAssessments: { orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 1, select: { id: true, inspectionId: true, riskScore: true, riskLevel: true, priorityLevel: true, reasonCodes: true, reasons: true, assessmentVersion: true, createdAt: true } }
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
  return {
    readiness, target, inspection, risk, actionGroups,
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
    governedActions: record.actionSnapshot,
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
        policySnapshot: source.policySnapshot as Prisma.InputJsonValue, actionSnapshot: source.actionGroups as Prisma.InputJsonValue
      }, include: packageInclude
    });
    await tx.decisionPackage.updateMany({ where: { caseId, id: { not: record.id }, status: DecisionPackageStatus.PREPARED }, data: { status: DecisionPackageStatus.SUPERSEDED } });
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

export async function listDecisionPackages(caseId: string, principal: OrganizationalPrincipal) {
  await assertVisibleCase(caseId, principal);
  return (await prisma.decisionPackage.findMany({ where: { caseId, case: buildCaseReadWhere(principal) }, include: packageInclude, orderBy: [{ packageVersion: 'desc' }, { id: 'desc' }] })).map((item) => dto(item));
}

export async function getDecisionPackage(caseId: string, packageId: string, principal: OrganizationalPrincipal) {
  await assertVisibleCase(caseId, principal);
  const record = await prisma.decisionPackage.findFirst({ where: { id: packageId, caseId, case: buildCaseReadWhere(principal) }, include: packageInclude });
  if (!record) throw new DecisionPackageError('DECISION_PACKAGE_NOT_FOUND', 404, 'Decision Package not found.');
  return dto(record);
}

export async function requireCurrentDecisionPackage(caseId: string, principal: OrganizationalPrincipal) {
  const source = await authoritativeSource(caseId, principal, new Date());
  const record = await prisma.decisionPackage.findUnique({ where: { caseId_sourceFingerprint: { caseId, sourceFingerprint: source.fingerprint } }, select: { id: true, status: true } });
  if (!record || record.status !== DecisionPackageStatus.PREPARED) throw new DecisionPackageError('CURRENT_DECISION_PACKAGE_REQUIRED', 409, 'Prepare a current Decision Package before generating a new Action Plan.');
  return record;
}
