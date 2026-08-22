import prisma from '../../lib/prisma';
import { createHash } from 'node:crypto';
import { RiskLevel, PriorityLevel, CaseStatus, Inspection, Prisma } from '../../generated/prisma';
import {
  assertOperationalCaseScope,
  OrganizationalPrincipal
} from '../../security/organizational-scope';
import { riskAssessedTransition } from '../../workflow/case-state-machine';

// Type definitions for output
export interface RiskCalculationResult {
  riskScore: number;
  riskLevel: RiskLevel;
  priorityLevel: PriorityLevel;
  reasonCodes: string[];
  reasons: Array<{ reasonCode: string; message: string }>;
}

export const RISK_ASSESSMENT_VERSION = 'ODYSSEY_RISK_V1';

type RiskSourceInspection = Pick<Inspection,
  'id' | 'structuralCondition' | 'crackSeverity' | 'corrosionLevel' | 'trafficImportance' |
  'hospitalRoute' | 'weatherRisk' | 'heavyRainExpected' | 'estimatedDailyUsers'>;

export function riskSourceFingerprint(
  caseId: string,
  inspection: RiskSourceInspection,
  assessmentVersion = RISK_ASSESSMENT_VERSION
): string {
  const material = [
    caseId,
    inspection.id,
    assessmentVersion,
    inspection.structuralCondition,
    inspection.crackSeverity,
    inspection.corrosionLevel,
    inspection.trafficImportance,
    String(inspection.hospitalRoute),
    inspection.weatherRisk,
    String(inspection.heavyRainExpected),
    inspection.estimatedDailyUsers === null ? 'null' : String(inspection.estimatedDailyUsers)
  ].join('\x1f');
  return `sha256:${createHash('sha256').update(material).digest('hex')}`;
}

function result(assessment: {
  id: string; caseId: string; inspectionId: string; riskScore: number; riskLevel: RiskLevel; priorityLevel: PriorityLevel;
  assessmentVersion: string; reasonCodes: unknown; reasons: unknown;
}, reused: boolean) {
  return {
    id: assessment.id, caseId: assessment.caseId, inspectionId: assessment.inspectionId,
    riskScore: assessment.riskScore, riskLevel: assessment.riskLevel, priorityLevel: assessment.priorityLevel,
    assessmentVersion: assessment.assessmentVersion, reasonCodes: assessment.reasonCodes, reasons: assessment.reasons, reused
  };
}

async function assertCanonicalProjection(caseId: string, assessment: { riskLevel: RiskLevel; priorityLevel: PriorityLevel }) {
  const projection = await prisma.case.findUnique({ where: { id: caseId }, select: { status: true, riskLevel: true, priorityLevel: true } });
  if (!projection || projection.status !== CaseStatus.ORP_READY || projection.riskLevel !== assessment.riskLevel || projection.priorityLevel !== assessment.priorityLevel) {
    throw new Error('RISK_CASE_PROJECTION_INCONSISTENT');
  }
}

const RISK_LEVELS: RiskLevel[] = [
  RiskLevel.VERY_LOW,
  RiskLevel.LOW,
  RiskLevel.MODERATE,
  RiskLevel.HIGH,
  RiskLevel.VERY_HIGH,
  RiskLevel.CRITICAL
];

const PRIORITY_LEVELS: PriorityLevel[] = [
  PriorityLevel.LOW,
  PriorityLevel.MEDIUM,
  PriorityLevel.HIGH,
  PriorityLevel.VERY_HIGH,
  PriorityLevel.CRITICAL
];

/**
 * Calculates raw risk score, base risk/priority levels, evaluates policy rules,
 * and compiles reasons for the assessment.
 */
export function calculateRiskAndPriority(inspection: Inspection): RiskCalculationResult {
  let rawScore = 0;
  const reasonCodesSet = new Set<string>();
  const reasons: Array<{ reasonCode: string; message: string }> = [];

  const addReason = (code: string, message: string) => {
    if (!reasonCodesSet.has(code)) {
      reasonCodesSet.add(code);
      reasons.push({ reasonCode: code, message });
    }
  };

  // --------------------------------------------------
  // 1. STRUCTURAL CONDITION
  // GOOD = 0, FAIR = 8, POOR = 18, CRITICAL = 25
  // --------------------------------------------------
  const cond = (inspection.structuralCondition || '').trim().toUpperCase();
  if (cond === 'GOOD') {
    rawScore += 0;
  } else if (cond === 'FAIR') {
    rawScore += 8;
  } else if (cond === 'POOR') {
    rawScore += 18;
    addReason('STRUCTURAL_CONDITION_POOR', 'Structural condition is poor.');
  } else if (cond === 'CRITICAL') {
    rawScore += 25;
    addReason('STRUCTURAL_CONDITION_CRITICAL', 'Structural condition is critical.');
  }

  // --------------------------------------------------
  // 2. CRACK SEVERITY
  // NONE = 0, MINOR = 5, MODERATE = 12, SEVERE = 20
  // --------------------------------------------------
  const crack = (inspection.crackSeverity || '').trim().toUpperCase();
  if (crack === 'NONE') {
    rawScore += 0;
  } else if (crack === 'MINOR') {
    rawScore += 5;
  } else if (crack === 'MODERATE') {
    rawScore += 12;
  } else if (crack === 'SEVERE') {
    rawScore += 20;
    addReason('SEVERE_CRACKING', 'Severe structural cracking was reported.');
  }

  // --------------------------------------------------
  // 3. CORROSION LEVEL
  // NONE = 0, LOW = 3, MODERATE = 7, HIGH = 10
  // --------------------------------------------------
  const corr = (inspection.corrosionLevel || '').trim().toUpperCase();
  if (corr === 'NONE') {
    rawScore += 0;
  } else if (corr === 'LOW') {
    rawScore += 3;
  } else if (corr === 'MODERATE') {
    rawScore += 7;
    addReason('MODERATE_CORROSION', 'Moderate corrosion level detected.');
  } else if (corr === 'HIGH') {
    rawScore += 10;
  }

  // --------------------------------------------------
  // 4. TRAFFIC IMPORTANCE
  // LOW = 0, MEDIUM = 4, HIGH = 8, CRITICAL = 10
  // --------------------------------------------------
  const traffic = (inspection.trafficImportance || '').trim().toUpperCase();
  if (traffic === 'LOW') {
    rawScore += 0;
  } else if (traffic === 'MEDIUM') {
    rawScore += 4;
  } else if (traffic === 'HIGH') {
    rawScore += 8;
    addReason('HIGH_TRAFFIC_IMPORTANCE', 'Infrastructure has high traffic importance.');
  } else if (traffic === 'CRITICAL') {
    rawScore += 10;
    addReason('HIGH_TRAFFIC_IMPORTANCE', 'Infrastructure has critical traffic importance.');
  }

  // --------------------------------------------------
  // 5. WEATHER RISK
  // LOW = 0, MEDIUM = 3, HIGH = 6, SEVERE = 8
  // --------------------------------------------------
  const weather = (inspection.weatherRisk || '').trim().toUpperCase();
  if (weather === 'LOW') {
    rawScore += 0;
  } else if (weather === 'MEDIUM') {
    rawScore += 3;
  } else if (weather === 'HIGH') {
    rawScore += 6;
    addReason('HIGH_WEATHER_RISK', 'Weather risk level is high.');
  } else if (weather === 'SEVERE') {
    rawScore += 8;
    addReason('HIGH_WEATHER_RISK', 'Weather risk level is severe.');
  }

  // --------------------------------------------------
  // 6. HOSPITAL ROUTE
  // true = +7, false = +0
  // --------------------------------------------------
  if (inspection.hospitalRoute === true) {
    rawScore += 7;
    addReason('HOSPITAL_ROUTE', 'Infrastructure is on a designated emergency/hospital route.');
  }

  // --------------------------------------------------
  // 7. HEAVY RAIN EXPECTED
  // true = +5, false = +0
  // --------------------------------------------------
  if (inspection.heavyRainExpected === true) {
    rawScore += 5;
    addReason('HEAVY_RAIN_EXPECTED', 'Heavy rain is expected.');
  }

  // --------------------------------------------------
  // 8. ESTIMATED DAILY USERS
  // < 5,000 = 0
  // 5,000-14,999 = 2
  // 15,000-29,999 = 4
  // 30,000-49,999 = 6
  // >= 50,000 = 8
  // --------------------------------------------------
  const users = inspection.estimatedDailyUsers;
  if (users !== null && users !== undefined) {
    if (users < 5000) {
      rawScore += 0;
    } else if (users >= 5000 && users <= 14999) {
      rawScore += 2;
    } else if (users >= 15000 && users <= 29999) {
      rawScore += 4;
    } else if (users >= 30000 && users <= 49999) {
      rawScore += 6;
      addReason('HIGH_PUBLIC_EXPOSURE', 'High public exposure with 30,000-49,999 daily users.');
    } else if (users >= 50000) {
      rawScore += 8;
      addReason('HIGH_PUBLIC_EXPOSURE', 'High public exposure with 50,000 or more daily users.');
    }
  }

  // Bound score strictly between 0 and 100
  const riskScore = Math.max(0, Math.min(rawScore, 100));

  // Determine base risk level
  let riskLevel: RiskLevel;
  if (riskScore <= 24) {
    riskLevel = RiskLevel.LOW;
  } else if (riskScore <= 49) {
    riskLevel = RiskLevel.MODERATE;
  } else if (riskScore <= 74) {
    riskLevel = RiskLevel.HIGH;
  } else if (riskScore <= 89) {
    riskLevel = RiskLevel.VERY_HIGH;
  } else {
    riskLevel = RiskLevel.CRITICAL;
  }

  // Determine base priority level
  let priorityLevel: PriorityLevel;
  if (riskLevel === RiskLevel.LOW) {
    priorityLevel = PriorityLevel.LOW;
  } else if (riskLevel === RiskLevel.MODERATE) {
    priorityLevel = PriorityLevel.MEDIUM;
  } else if (riskLevel === RiskLevel.HIGH) {
    priorityLevel = PriorityLevel.HIGH;
  } else if (riskLevel === RiskLevel.VERY_HIGH) {
    priorityLevel = PriorityLevel.VERY_HIGH;
  } else {
    priorityLevel = PriorityLevel.CRITICAL;
  }

  // Helper functions for comparing and modifying levels
  const getRiskIndex = (lvl: RiskLevel) => RISK_LEVELS.indexOf(lvl);
  const getPriorityIndex = (lvl: PriorityLevel) => PRIORITY_LEVELS.indexOf(lvl);

  // --------------------------------------------------
  // 9. SAFETY ESCALATION POLICY RULES
  // --------------------------------------------------

  // RULE R001
  // If structuralCondition == CRITICAL:
  // riskLevel = CRITICAL, priorityLevel = CRITICAL
  if (cond === 'CRITICAL') {
    riskLevel = RiskLevel.CRITICAL;
    priorityLevel = PriorityLevel.CRITICAL;
    addReason('POLICY_R001', 'Critical structural condition detected.');
  }

  // RULE R002
  // If crackSeverity == SEVERE AND structuralCondition == POOR:
  // minimum riskLevel = VERY_HIGH, minimum priorityLevel = VERY_HIGH
  if (crack === 'SEVERE' && cond === 'POOR') {
    if (getRiskIndex(riskLevel) < getRiskIndex(RiskLevel.VERY_HIGH)) {
      riskLevel = RiskLevel.VERY_HIGH;
    }
    if (getPriorityIndex(priorityLevel) < getPriorityIndex(PriorityLevel.VERY_HIGH)) {
      priorityLevel = PriorityLevel.VERY_HIGH;
    }
    addReason('POLICY_R002', 'Severe cracking combined with poor structural condition.');
  }

  // RULE R003
  // If crackSeverity == SEVERE AND heavyRainExpected == true:
  // minimum riskLevel = VERY_HIGH
  if (crack === 'SEVERE' && inspection.heavyRainExpected === true) {
    if (getRiskIndex(riskLevel) < getRiskIndex(RiskLevel.VERY_HIGH)) {
      riskLevel = RiskLevel.VERY_HIGH;
    }
    addReason('POLICY_R003', 'Severe structural cracking with heavy rainfall expected.');
  }

  // RULE R004
  // If hospitalRoute == true AND trafficImportance == HIGH or CRITICAL AND riskLevel is HIGH or above:
  // minimum priorityLevel = VERY_HIGH
  const isHighOrAboveRisk = getRiskIndex(riskLevel) >= getRiskIndex(RiskLevel.HIGH);
  if (
    inspection.hospitalRoute === true &&
    (traffic === 'HIGH' || traffic === 'CRITICAL') &&
    isHighOrAboveRisk
  ) {
    if (getPriorityIndex(priorityLevel) < getPriorityIndex(PriorityLevel.VERY_HIGH)) {
      priorityLevel = PriorityLevel.VERY_HIGH;
    }
    addReason('POLICY_R004', 'High-risk infrastructure serves an important hospital route.');
  }

  // RULE R005
  // If estimatedDailyUsers >= 30000 AND riskLevel is HIGH or above:
  // increase priority by one level, maximum CRITICAL.
  if (users !== null && users !== undefined && users >= 30000 && isHighOrAboveRisk) {
    const currentIdx = getPriorityIndex(priorityLevel);
    if (currentIdx < getPriorityIndex(PriorityLevel.CRITICAL)) {
      priorityLevel = PRIORITY_LEVELS[currentIdx + 1];
    }
    addReason('POLICY_R005', 'High public exposure due to daily user volume.');
  }

  // RULE R006
  // If: structuralCondition == POOR AND crackSeverity == SEVERE AND heavyRainExpected == true AND hospitalRoute == true:
  // priorityLevel = CRITICAL
  if (
    cond === 'POOR' &&
    crack === 'SEVERE' &&
    inspection.heavyRainExpected === true &&
    inspection.hospitalRoute === true
  ) {
    priorityLevel = PriorityLevel.CRITICAL;
    addReason('POLICY_R006', 'Combined structural, weather, and emergency-route risk requires immediate prioritization.');
  }

  return {
    riskScore,
    riskLevel,
    priorityLevel,
    reasonCodes: Array.from(reasonCodesSet),
    reasons
  };
}

/**
 * Loads the latest inspection for a case, executes risk assessment calculations,
 * and updates the case details within an atomic Prisma transaction.
 */
export async function runAssessmentForCase(caseId: string, principal: OrganizationalPrincipal) {
  // Find case
  const existingCase = await assertOperationalCaseScope(caseId, principal);
  if (existingCase.status !== CaseStatus.INSPECTION_IN_PROGRESS && existingCase.status !== CaseStatus.ORP_READY) {
    throw new Error('INVALID_CASE_STATE');
  }
  // Find latest inspection
  const latestInspection = await prisma.inspection.findFirst({
    where: { caseId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
  });
  if (!latestInspection) {
    throw new Error('NO_INSPECTION_FOUND');
  }

  const sourceFingerprint = riskSourceFingerprint(caseId, latestInspection);
  const canonical = await prisma.riskAssessment.findUnique({ where: { sourceFingerprint } });
  if (canonical) {
    await assertCanonicalProjection(caseId, canonical);
    return result(canonical, true);
  }

  const updatedStatus = riskAssessedTransition(existingCase.status);
  if (!updatedStatus) throw new Error('INVALID_CASE_STATE');

  // Run calculation
  const calc = calculateRiskAndPriority(latestInspection);

  // Prisma atomic transaction to create assessment and update case
  let assessment;
  try {
    assessment = await prisma.$transaction(async (tx) => {
    // 1. Create RiskAssessment
    const createdAssessment = await tx.riskAssessment.create({
      data: {
        caseId,
        inspectionId: latestInspection.id,
        riskScore: calc.riskScore,
        riskLevel: calc.riskLevel,
        priorityLevel: calc.priorityLevel,
        reasonCodes: calc.reasonCodes,
        reasons: calc.reasons,
        assessmentVersion: RISK_ASSESSMENT_VERSION,
        sourceFingerprint
      }
    });

    // 2. Update Case risk level, priority level, and status
    await tx.case.update({
      where: { id: caseId },
      data: {
        riskLevel: calc.riskLevel,
        priorityLevel: calc.priorityLevel,
        status: updatedStatus
      }
    });

    return createdAssessment;
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error;
    const winner = await prisma.riskAssessment.findUnique({ where: { sourceFingerprint } });
    if (!winner) throw error;
    await assertCanonicalProjection(caseId, winner);
    return result(winner, true);
  }

  return result(assessment, false);
}
