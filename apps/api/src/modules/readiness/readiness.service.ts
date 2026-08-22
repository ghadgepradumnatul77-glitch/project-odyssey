import type { OrganizationalPrincipal } from '../../security/organizational-scope';
import { assertVisibleCase } from '../../security/organizational-scope';
import prisma from '../../lib/prisma';
import { resolveCasePolicy } from '../policy-registry/policy-registry.service';
import { RISK_ASSESSMENT_VERSION } from '../risk/risk.service';

export const READINESS_ASSESSMENT_VERSION = 'ODYSSEY_READINESS_V1';

export type ReadinessOutcome = 'READY' | 'NOT_READY' | 'BLOCKED';
export type ReadinessCheckStatus = 'PASS' | 'NOT_REQUIRED' | 'NOT_APPLICABLE' | 'INCOMPLETE' | 'BLOCKED';
export type ReadinessDimension = 'CASE_CONTEXT' | 'INSPECTION_EVIDENCE' | 'RISK_PRIORITY' | 'POLICY_GOVERNANCE' | 'PLANNING_FEASIBILITY';

export interface ReadinessReason {
  code: string;
  message: string;
}

export interface ReadinessCheck {
  dimension: ReadinessDimension;
  label: string;
  status: ReadinessCheckStatus;
  reasons: ReadinessReason[];
  provenance: Array<{ type: string; id: string; version?: string | number }>;
}

const labels: Record<ReadinessDimension, string> = {
  CASE_CONTEXT: 'Case context',
  INSPECTION_EVIDENCE: 'Inspection & evidence',
  RISK_PRIORITY: 'Risk & priority',
  POLICY_GOVERNANCE: 'Policy governance',
  PLANNING_FEASIBILITY: 'Planning feasibility'
};

function check(dimension: ReadinessDimension, status: ReadinessCheckStatus, reasons: ReadinessReason[] = [], provenance: ReadinessCheck['provenance'] = []): ReadinessCheck {
  return { dimension, label: labels[dimension], status, reasons, provenance };
}

function policyIssueStatus(code: string): 'INCOMPLETE' | 'BLOCKED' {
  if (code === 'NO_APPLICABLE_ACTIVE_POLICY' || code === 'MISSING_CASE_CONTEXT') return 'INCOMPLETE';
  return 'BLOCKED';
}

function policyReason(code: string): ReadinessReason {
  const mapped: Record<string, ReadinessReason> = {
    NO_APPLICABLE_ACTIVE_POLICY: { code: 'READINESS_POLICY_UNRESOLVED', message: 'Active policy governance exists for this scope, but no applicable active policy rule could be resolved.' },
    MISSING_CASE_CONTEXT: { code: 'READINESS_POLICY_REQUIRED', message: 'An active policy rule requires Case context that is not yet available.' },
    CONFLICTING_ENFORCEMENT: { code: 'READINESS_POLICY_CONFLICT', message: 'Active policy rules conflict on whether an action is permitted.' },
    MULTIPLE_ACTIVE_ACTION_VERSIONS: { code: 'READINESS_POLICY_CONFLICT', message: 'More than one active version of the same approved action applies.' },
    INVALID_RULE_CONDITIONS: { code: 'READINESS_POLICY_UNSUPPORTED', message: 'An active policy rule contains unsupported conditions and cannot be interpreted safely.' },
    INVALID_ACTION_APPLICABILITY: { code: 'READINESS_POLICY_UNSUPPORTED', message: 'An active approved action contains unsupported applicability and cannot be interpreted safely.' }
  };
  return mapped[code] ?? { code: 'READINESS_POLICY_UNRESOLVED', message: 'Policy governance could not be resolved safely.' };
}

export async function evaluateCaseReadiness(caseId: string, principal: OrganizationalPrincipal, evaluatedAt = new Date()) {
  await assertVisibleCase(caseId, principal);
  const target = await prisma.case.findUnique({
    where: { id: caseId },
    select: {
      id: true,
      caseNumber: true,
      status: true,
      riskLevel: true,
      priorityLevel: true,
      asset: {
        select: {
          id: true,
          departmentId: true,
          jurisdictionId: true,
          department: { select: { id: true } },
          jurisdiction: { select: { id: true, departmentId: true } }
        }
      },
      inspections: { orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 1, select: { id: true, createdAt: true } },
      riskAssessments: { where: { assessmentVersion: RISK_ASSESSMENT_VERSION }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 1, select: { id: true, inspectionId: true, riskLevel: true, priorityLevel: true, assessmentVersion: true, createdAt: true } }
    }
  });
  if (!target) throw new Error('CASE_NOT_FOUND');

  const checks: ReadinessCheck[] = [];
  const contextValid = Boolean(target.asset?.department?.id && target.asset?.jurisdiction?.id) &&
    target.asset.departmentId === target.asset.department.id &&
    target.asset.jurisdictionId === target.asset.jurisdiction.id &&
    target.asset.jurisdiction.departmentId === target.asset.departmentId;
  checks.push(contextValid
    ? check('CASE_CONTEXT', 'PASS', [], [{ type: 'CASE', id: target.id }, { type: 'ASSET', id: target.asset.id }, { type: 'DEPARTMENT', id: target.asset.departmentId }, { type: 'JURISDICTION', id: target.asset.jurisdictionId }])
    : check('CASE_CONTEXT', 'BLOCKED', [{ code: 'READINESS_CONTEXT_INVALID', message: 'The Case organizational relationships are inconsistent or invalid.' }]));

  const inspection = target.inspections[0];
  checks.push(inspection
    ? check('INSPECTION_EVIDENCE', 'PASS', [], [{ type: 'INSPECTION', id: inspection.id }])
    : check('INSPECTION_EVIDENCE', 'INCOMPLETE', [{ code: 'READINESS_INSPECTION_MISSING', message: 'A persisted inspection is required before decision-package preparation.' }]));

  const assessment = target.riskAssessments[0];
  if (!assessment) {
    checks.push(check('RISK_PRIORITY', 'INCOMPLETE', [{ code: 'READINESS_RISK_ASSESSMENT_MISSING', message: 'A governed Risk Assessment has not yet been recorded.' }]));
  } else if (!target.riskLevel || !target.priorityLevel || target.riskLevel !== assessment.riskLevel || target.priorityLevel !== assessment.priorityLevel) {
    checks.push(check('RISK_PRIORITY', 'BLOCKED', [{ code: 'READINESS_RISK_STATE_INCONSISTENT', message: 'Persisted Case risk or priority does not match the latest governing Risk Assessment.' }], [{ type: 'RISK_ASSESSMENT', id: assessment.id, version: assessment.assessmentVersion }]));
  } else if (inspection && assessment.inspectionId !== inspection.id) {
    checks.push(check('RISK_PRIORITY', 'BLOCKED', [{ code: 'READINESS_RISK_SOURCE_STALE', message: 'The latest governing Risk Assessment does not reference the latest inspection.' }], [{ type: 'RISK_ASSESSMENT', id: assessment.id, version: assessment.assessmentVersion }, { type: 'INSPECTION', id: inspection.id }]));
  } else {
    checks.push(check('RISK_PRIORITY', 'PASS', [], [{ type: 'RISK_ASSESSMENT', id: assessment.id, version: assessment.assessmentVersion }]));
  }

  const activePolicyCount = contextValid ? await prisma.policyDocument.count({
    where: {
      status: 'ACTIVE', effectiveFrom: { lte: evaluatedAt }, OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: evaluatedAt } }],
      AND: [{ OR: [{ departmentId: null }, { departmentId: target.asset.departmentId }] }, { OR: [{ jurisdictionId: null }, { jurisdictionId: target.asset.jurisdictionId }] }]
    }
  }) : 0;
  if (!contextValid) {
    checks.push(check('POLICY_GOVERNANCE', 'BLOCKED', [{ code: 'READINESS_CONTEXT_INVALID', message: 'Policy applicability cannot be evaluated against invalid organizational context.' }]));
  } else if (activePolicyCount === 0) {
    checks.push(check('POLICY_GOVERNANCE', 'NOT_REQUIRED', [{ code: 'READINESS_POLICY_NOT_ESTABLISHED', message: 'No active policy governance is established for this Case scope; no policy requirement is asserted by this Phase-1 gate.' }]));
  } else {
    const resolution = await resolveCasePolicy(caseId, principal, evaluatedAt);
    if (resolution.status === 'RESOLVED') {
      const provenance = resolution.applicableRules.flatMap((item) => [
        { type: 'POLICY_DOCUMENT', id: item.policy.id, version: item.policy.versionNumber },
        { type: 'POLICY_RULE', id: item.rule.id },
        { type: 'APPROVED_ACTION', id: item.action.id, version: item.action.versionNumber }
      ]);
      checks.push(check('POLICY_GOVERNANCE', 'PASS', [], provenance));
    } else {
      const status = resolution.issues.some((issue) => policyIssueStatus(issue.code) === 'BLOCKED') ? 'BLOCKED' : 'INCOMPLETE';
      checks.push(check('POLICY_GOVERNANCE', status, resolution.issues.map((issue) => policyReason(issue.code))));
    }
  }

  checks.push(check('PLANNING_FEASIBILITY', 'NOT_APPLICABLE', [{ code: 'READINESS_PLANNING_NOT_ENFORCEABLE', message: 'Phase-1 does not persist a separate governed feasibility approval required at this boundary.' }]));
  const outcome: ReadinessOutcome = checks.some((item) => item.status === 'BLOCKED') ? 'BLOCKED'
    : checks.some((item) => item.status === 'INCOMPLETE') ? 'NOT_READY' : 'READY';
  const reasons = checks.flatMap((item) => item.reasons);
  if (outcome === 'READY') reasons.push({ code: 'READINESS_READY', message: 'Required governed inputs are available and internally consistent for decision-package preparation.' });

  return {
    caseReference: target.caseNumber,
    outcome,
    assessmentVersion: READINESS_ASSESSMENT_VERSION,
    evaluatedAt,
    checks,
    reasons,
    policySummary: { governanceEstablished: activePolicyCount > 0, status: checks.find((item) => item.dimension === 'POLICY_GOVERNANCE')!.status },
    governance: { readOnly: true, caseMutated: false, approvalGranted: false, officerJudgmentRequired: true }
  };
}
