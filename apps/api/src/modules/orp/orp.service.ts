import prisma from '../../lib/prisma';
import { CaseStatus, Prisma, RiskLevel, PriorityLevel, Inspection } from '../../generated/prisma';
import {
  assertOperationalCaseScope,
  OrganizationalPrincipal
} from '../../security/organizational-scope';
import { requireCurrentDecisionPackage } from '../decision-packages/decision-package.service';


// ======================================================
// APPROVED ACTION LIBRARY (AAL)
// ======================================================

export interface ApprovedAction {
  actionCode: string;
  title: string;
  category: string;
  description: string;
  applicableRationale: string;
}

const APPROVED_ACTIONS: Record<string, ApprovedAction> = {
  ACT_INSPECT_DETAILED: {
    actionCode: 'ACT_INSPECT_DETAILED',
    title: 'Detailed structural engineering assessment',
    category: 'ASSESSMENT',
    description: 'Commission a detailed structural engineering inspection to evaluate load-bearing capacity, material degradation, and failure risk.',
    applicableRationale: 'Required when risk level indicates significant structural concern.'
  },
  ACT_RESTRICT_HEAVY_VEHICLES: {
    actionCode: 'ACT_RESTRICT_HEAVY_VEHICLES',
    title: 'Restrict heavy vehicle movement',
    category: 'INTERIM_SAFETY',
    description: 'Implement immediate restrictions on heavy vehicle traffic to reduce structural load pending detailed assessment.',
    applicableRationale: 'Required when critical structural risk demands immediate load reduction.'
  },
  ACT_TEMP_STABILIZATION: {
    actionCode: 'ACT_TEMP_STABILIZATION',
    title: 'Temporary structural stabilization',
    category: 'INTERIM_SAFETY',
    description: 'Deploy temporary structural supports or reinforcements to mitigate near-term collapse risk.',
    applicableRationale: 'Required when structural integrity is compromised and conditions may worsen.'
  },
  ACT_INCREASE_MONITORING: {
    actionCode: 'ACT_INCREASE_MONITORING',
    title: 'Increase structural monitoring frequency',
    category: 'MONITORING',
    description: 'Increase the frequency of structural health monitoring inspections and sensor checks.',
    applicableRationale: 'Required when risk level demands closer observation of structural behavior.'
  },
  ACT_TRAFFIC_MANAGEMENT: {
    actionCode: 'ACT_TRAFFIC_MANAGEMENT',
    title: 'Prepare traffic management/diversion plan',
    category: 'TRAFFIC',
    description: 'Develop a traffic management or diversion plan to maintain connectivity while managing infrastructure risk.',
    applicableRationale: 'Required when high-priority routes or critical connectivity may be affected.'
  },
  ACT_ESCALATE_AUTHORITY: {
    actionCode: 'ACT_ESCALATE_AUTHORITY',
    title: 'Escalate case to authorized higher authority',
    category: 'GOVERNANCE',
    description: 'Escalate the case to the appropriate higher authority for review, resource allocation, and decision-making.',
    applicableRationale: 'Required when operational priority demands senior oversight and approval.'
  },
  ACT_PERMANENT_REPAIR_PLANNING: {
    actionCode: 'ACT_PERMANENT_REPAIR_PLANNING',
    title: 'Prepare permanent repair intervention plan',
    category: 'REMEDIATION',
    description: 'Develop a comprehensive permanent repair or rehabilitation intervention plan for the asset.',
    applicableRationale: 'Required when structural deficiencies demand long-term corrective action.'
  }
};

export function getApprovedAction(code: string): ApprovedAction | undefined {
  return APPROVED_ACTIONS[code];
}

export function getApprovedActions(codes: string[]): ApprovedAction[] {
  return codes
    .map((c) => APPROVED_ACTIONS[c])
    .filter((a): a is ApprovedAction => a !== undefined);
}


// ======================================================
// URGENCY LEVELS
// ======================================================

type Urgency = 'ROUTINE' | 'PRIORITY' | 'URGENT' | 'IMMEDIATE';

const URGENCY_ORDER: Urgency[] = ['ROUTINE', 'PRIORITY', 'URGENT', 'IMMEDIATE'];

function urgencyIndex(u: Urgency): number {
  return URGENCY_ORDER.indexOf(u);
}

function maxUrgency(a: Urgency, b: Urgency): Urgency {
  return urgencyIndex(a) >= urgencyIndex(b) ? a : b;
}

function riskLevelToUrgency(level: RiskLevel): Urgency {
  switch (level) {
    case RiskLevel.VERY_LOW:
    case RiskLevel.LOW:
      return 'ROUTINE';
    case RiskLevel.MODERATE:
      return 'PRIORITY';
    case RiskLevel.HIGH:
    case RiskLevel.VERY_HIGH:
      return 'URGENT';
    case RiskLevel.CRITICAL:
      return 'IMMEDIATE';
    default:
      return 'ROUTINE';
  }
}


// ======================================================
// ORP GENERATION RESULT
// ======================================================

export interface ORPGenerationResult {
  recommendedActionCodes: string[];
  temporaryMeasures: string[];
  alternativeActionCodes: string[];
  urgency: Urgency;
  reasons: Array<{ reasonCode: string; message: string }>;
}


// ======================================================
// DETERMINISTIC ACTION SELECTION
// ======================================================

export function generateORPActions(
  riskLevel: RiskLevel,
  priorityLevel: PriorityLevel,
  inspection: Inspection
): ORPGenerationResult {
  const actionSet = new Set<string>();
  const reasonCodesSet = new Set<string>();
  const reasons: Array<{ reasonCode: string; message: string }> = [];

  const addReason = (code: string, message: string) => {
    if (!reasonCodesSet.has(code)) {
      reasonCodesSet.add(code);
      reasons.push({ reasonCode: code, message });
    }
  };

  let urgency: Urgency = riskLevelToUrgency(riskLevel);

  // Normalize inspection fields
  const cond = (inspection.structuralCondition || '').trim().toUpperCase();
  const crack = (inspection.crackSeverity || '').trim().toUpperCase();
  const traffic = (inspection.trafficImportance || '').trim().toUpperCase();

  // --------------------------------------------------
  // RULE A001
  // If riskLevel == CRITICAL:
  // include ACT_RESTRICT_HEAVY_VEHICLES, ACT_INSPECT_DETAILED,
  //         ACT_TEMP_STABILIZATION, ACT_INCREASE_MONITORING
  // Urgency = IMMEDIATE
  // --------------------------------------------------
  if (riskLevel === RiskLevel.CRITICAL) {
    actionSet.add('ACT_RESTRICT_HEAVY_VEHICLES');
    actionSet.add('ACT_INSPECT_DETAILED');
    actionSet.add('ACT_TEMP_STABILIZATION');
    actionSet.add('ACT_INCREASE_MONITORING');
    urgency = maxUrgency(urgency, 'IMMEDIATE');
    addReason('ORP_RULE_A001', 'Critical risk level requires immediate emergency response actions including vehicle restrictions and structural stabilization.');
  }

  // --------------------------------------------------
  // RULE A002
  // If riskLevel == VERY_HIGH:
  // include ACT_INSPECT_DETAILED, ACT_INCREASE_MONITORING,
  //         ACT_PERMANENT_REPAIR_PLANNING
  // Urgency = URGENT
  // --------------------------------------------------
  if (riskLevel === RiskLevel.VERY_HIGH) {
    actionSet.add('ACT_INSPECT_DETAILED');
    actionSet.add('ACT_INCREASE_MONITORING');
    actionSet.add('ACT_PERMANENT_REPAIR_PLANNING');
    urgency = maxUrgency(urgency, 'URGENT');
    addReason('ORP_RULE_A002', 'Very high structural risk requires urgent engineering assessment and permanent repair planning.');
  }

  // --------------------------------------------------
  // RULE A003
  // If priorityLevel == CRITICAL:
  // include ACT_ESCALATE_AUTHORITY, ACT_TRAFFIC_MANAGEMENT
  // Urgency must be at least IMMEDIATE
  // --------------------------------------------------
  if (priorityLevel === PriorityLevel.CRITICAL) {
    actionSet.add('ACT_ESCALATE_AUTHORITY');
    actionSet.add('ACT_TRAFFIC_MANAGEMENT');
    urgency = maxUrgency(urgency, 'IMMEDIATE');
    addReason('ORP_RULE_A003', 'Critical operational priority requires escalation for human review and traffic management planning.');
  }

  // --------------------------------------------------
  // RULE A004
  // If heavyRainExpected == true AND crackSeverity == SEVERE:
  // include ACT_TEMP_STABILIZATION, ACT_INCREASE_MONITORING
  // --------------------------------------------------
  if (inspection.heavyRainExpected === true && crack === 'SEVERE') {
    actionSet.add('ACT_TEMP_STABILIZATION');
    actionSet.add('ACT_INCREASE_MONITORING');
    addReason('ORP_RULE_A004', 'Severe cracking combined with expected heavy rainfall increases near-term safety concern.');
  }

  // --------------------------------------------------
  // RULE A005
  // If hospitalRoute == true AND trafficImportance == HIGH or CRITICAL:
  // include ACT_TRAFFIC_MANAGEMENT
  // --------------------------------------------------
  if (inspection.hospitalRoute === true && (traffic === 'HIGH' || traffic === 'CRITICAL')) {
    actionSet.add('ACT_TRAFFIC_MANAGEMENT');
    addReason('ORP_RULE_A005', 'Hospital-route connectivity requires traffic-management planning to preserve critical access.');
  }

  // --------------------------------------------------
  // RULE A006
  // If structuralCondition == POOR or CRITICAL AND crackSeverity == SEVERE:
  // include ACT_PERMANENT_REPAIR_PLANNING
  // --------------------------------------------------
  if ((cond === 'POOR' || cond === 'CRITICAL') && crack === 'SEVERE') {
    actionSet.add('ACT_PERMANENT_REPAIR_PLANNING');
    addReason('ORP_RULE_A006', 'Poor structural condition with severe cracking requires permanent repair planning.');
  }

  // --------------------------------------------------
  // RULE A007
  // If riskLevel == LOW or MODERATE:
  // do NOT include emergency stabilization by default.
  // (Remove ACT_TEMP_STABILIZATION if it was somehow added)
  // --------------------------------------------------
  if (riskLevel === RiskLevel.LOW || riskLevel === RiskLevel.MODERATE ||
      riskLevel === RiskLevel.VERY_LOW) {
    actionSet.delete('ACT_TEMP_STABILIZATION');
    // No reason added — this rule suppresses an action
  }

  // --------------------------------------------------
  // Derive temporary measures from selected actions
  // --------------------------------------------------
  const temporaryMeasures: string[] = [];
  if (actionSet.has('ACT_TEMP_STABILIZATION')) {
    temporaryMeasures.push('Deploy temporary structural supports at identified weak points.');
  }
  if (actionSet.has('ACT_RESTRICT_HEAVY_VEHICLES')) {
    temporaryMeasures.push('Enforce immediate heavy vehicle movement restrictions.');
  }
  if (actionSet.has('ACT_INCREASE_MONITORING')) {
    temporaryMeasures.push('Increase structural monitoring inspection frequency to daily or as conditions warrant.');
  }
  if (actionSet.has('ACT_TRAFFIC_MANAGEMENT')) {
    temporaryMeasures.push('Prepare traffic diversion plan to maintain connectivity during response.');
  }

  // --------------------------------------------------
  // Derive alternatives
  // --------------------------------------------------
  const recommendedActionCodes = Array.from(actionSet);
  const alternativeActionCodes: string[] = [];

  // If full urgent response is recommended, offer a reduced subset as alternative
  if (urgency === 'IMMEDIATE' || urgency === 'URGENT') {
    const alternativeSet = new Set<string>();
    // Always suggest monitoring and escalation as minimum alternative
    if (actionSet.has('ACT_INCREASE_MONITORING')) {
      alternativeSet.add('ACT_INCREASE_MONITORING');
    }
    if (actionSet.has('ACT_ESCALATE_AUTHORITY')) {
      alternativeSet.add('ACT_ESCALATE_AUTHORITY');
    }
    if (actionSet.has('ACT_TEMP_STABILIZATION')) {
      alternativeSet.add('ACT_TEMP_STABILIZATION');
    }
    // Only include alternatives that are a strict subset
    if (alternativeSet.size > 0 && alternativeSet.size < actionSet.size) {
      for (const code of alternativeSet) {
        alternativeActionCodes.push(code);
      }
      addReason('ORP_ALTERNATIVE_NOTE', 'Alternative action set is a reduced subset. Adopting it may leave significant residual risk requiring additional justification.');
    }
  }

  return {
    recommendedActionCodes,
    temporaryMeasures,
    alternativeActionCodes,
    urgency,
    reasons
  };
}


// ======================================================
// CREATE ORP FOR A CASE
// ======================================================

export async function createORPForCase(caseId: string, principal: OrganizationalPrincipal) {
  // 1. Find the Case
  const existingCase = await assertOperationalCaseScope(caseId, principal);
  if (existingCase.status !== CaseStatus.ORP_READY) {
    throw new Error('CASE_NOT_READY_FOR_ORP');
  }

  // New Action Plans must be traceable to a current, governed Decision Package.
  // Historical plans remain valid with a null package reference.
  const decisionPackage = await requireCurrentDecisionPackage(caseId, principal);

  // 2. Find the latest RiskAssessment
  const latestAssessment = await prisma.riskAssessment.findFirst({
    where: { caseId },
    orderBy: [
      { createdAt: 'desc' },
      { id: 'desc' }
    ]
  });
  if (!latestAssessment) {
    throw new Error('RISK_ASSESSMENT_REQUIRED');
  }

  // 3. Find the Inspection used by the assessment
  const inspection = await prisma.inspection.findUnique({
    where: { id: latestAssessment.inspectionId }
  });
  if (!inspection) {
    throw new Error('INSPECTION_NOT_FOUND');
  }

  // 4. Generate deterministic ORP
  const orpResult = generateORPActions(
    latestAssessment.riskLevel,
    latestAssessment.priorityLevel,
    inspection
  );

  // 5. Save ORP within a transaction, deriving versionNumber from max existing
  const createNextVersion = () => prisma.$transaction(async (tx) => {
    // Derive next version number from existing max
    const maxVersionRecord = await tx.operationalResponsePlan.findFirst({
      where: { caseId },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true }
    });
    const nextVersion = (maxVersionRecord?.versionNumber ?? 0) + 1;

    const createdORP = await tx.operationalResponsePlan.create({
      data: {
        caseId,
        riskAssessmentId: latestAssessment.id,
        versionNumber: nextVersion,
        status: 'AWAITING_REVIEW',
        urgency: orpResult.urgency,
        recommendedActionCodes: orpResult.recommendedActionCodes,
        temporaryMeasures: orpResult.temporaryMeasures,
        reasons: orpResult.reasons,
        alternativeActionCodes: orpResult.alternativeActionCodes,
        planVersion: 'ODYSSEY_ORP_V1',
        decisionPackageId: decisionPackage.id
      }
    });

    return createdORP;
  });

  let orp;
  try {
    orp = await createNextVersion();
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
      throw error;
    }

    try {
      orp = await createNextVersion();
    } catch (retryError) {
      if (retryError instanceof Prisma.PrismaClientKnownRequestError && retryError.code === 'P2002') {
        throw new Error('ORP_VERSION_CONFLICT');
      }
      throw retryError;
    }
  }

  return orp;
}
