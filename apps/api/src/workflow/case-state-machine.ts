import { CaseStatus, OrpDecisionType } from '../generated/prisma';

export type CaseWorkflowEvent =
  | 'INSPECTION_CREATED'
  | 'RISK_ASSESSED'
  | 'DECISION_APPROVED'
  | 'DECISION_REJECTED'
  | 'MODIFICATION_REQUESTED'
  | 'REINSPECTION_REQUESTED'
  | 'DECISION_ESCALATED'
  | 'EXECUTION_STARTED'
  | 'EXECUTION_COMPLETED'
  | 'CASE_CLOSED';

export const adversePlanningDecisions = [
  OrpDecisionType.MODIFICATION_REQUESTED,
  OrpDecisionType.REJECTED,
  OrpDecisionType.ESCALATED
] as const;

export function inspectionCreatedTransition(
  status: CaseStatus,
  latestDecisionType?: OrpDecisionType | null
): CaseStatus | null {
  if (status === CaseStatus.NEW || status === CaseStatus.INSPECTION_REQUIRED || status === CaseStatus.INSPECTION_IN_PROGRESS) {
    return CaseStatus.INSPECTION_IN_PROGRESS;
  }
  if (status === CaseStatus.UNDER_REVIEW && latestDecisionType && adversePlanningDecisions.includes(latestDecisionType as typeof adversePlanningDecisions[number])) {
    return CaseStatus.INSPECTION_IN_PROGRESS;
  }
  return null;
}

export function riskAssessedTransition(status: CaseStatus): CaseStatus | null {
  return status === CaseStatus.INSPECTION_IN_PROGRESS ? CaseStatus.ORP_READY : null;
}

export const supportedCaseTransitions: ReadonlyArray<{
  from: CaseStatus;
  event: CaseWorkflowEvent;
  to: CaseStatus;
}> = [
  { from: CaseStatus.NEW, event: 'INSPECTION_CREATED', to: CaseStatus.INSPECTION_IN_PROGRESS },
  { from: CaseStatus.INSPECTION_REQUIRED, event: 'INSPECTION_CREATED', to: CaseStatus.INSPECTION_IN_PROGRESS },
  { from: CaseStatus.INSPECTION_IN_PROGRESS, event: 'INSPECTION_CREATED', to: CaseStatus.INSPECTION_IN_PROGRESS },
  { from: CaseStatus.UNDER_REVIEW, event: 'INSPECTION_CREATED', to: CaseStatus.INSPECTION_IN_PROGRESS },
  { from: CaseStatus.INSPECTION_IN_PROGRESS, event: 'RISK_ASSESSED', to: CaseStatus.ORP_READY },
  { from: CaseStatus.ORP_READY, event: 'DECISION_APPROVED', to: CaseStatus.APPROVED },
  { from: CaseStatus.ORP_READY, event: 'DECISION_REJECTED', to: CaseStatus.UNDER_REVIEW },
  { from: CaseStatus.ORP_READY, event: 'MODIFICATION_REQUESTED', to: CaseStatus.UNDER_REVIEW },
  { from: CaseStatus.ORP_READY, event: 'REINSPECTION_REQUESTED', to: CaseStatus.INSPECTION_REQUIRED },
  { from: CaseStatus.ORP_READY, event: 'DECISION_ESCALATED', to: CaseStatus.UNDER_REVIEW },
  { from: CaseStatus.APPROVED, event: 'EXECUTION_STARTED', to: CaseStatus.EXECUTION },
  { from: CaseStatus.EXECUTION, event: 'EXECUTION_COMPLETED', to: CaseStatus.VERIFICATION },
  { from: CaseStatus.VERIFICATION, event: 'CASE_CLOSED', to: CaseStatus.CLOSED }
];
