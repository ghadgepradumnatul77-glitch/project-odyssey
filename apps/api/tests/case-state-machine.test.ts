import { describe, expect, it } from 'vitest';
import { CaseStatus, OrpDecisionType } from '../src/generated/prisma';
import { inspectionCreatedTransition, riskAssessedTransition, supportedCaseTransitions } from '../src/workflow/case-state-machine';

describe('Case state-machine characterization', () => {
  it('declares the complete implemented transition table without terminal-state recovery', () => {
    expect(supportedCaseTransitions).toEqual([
      { from: 'NEW', event: 'INSPECTION_CREATED', to: 'INSPECTION_IN_PROGRESS' },
      { from: 'INSPECTION_REQUIRED', event: 'INSPECTION_CREATED', to: 'INSPECTION_IN_PROGRESS' },
      { from: 'INSPECTION_IN_PROGRESS', event: 'INSPECTION_CREATED', to: 'INSPECTION_IN_PROGRESS' },
      { from: 'UNDER_REVIEW', event: 'INSPECTION_CREATED', to: 'INSPECTION_IN_PROGRESS' },
      { from: 'INSPECTION_IN_PROGRESS', event: 'RISK_ASSESSED', to: 'ORP_READY' },
      { from: 'ORP_READY', event: 'DECISION_APPROVED', to: 'APPROVED' },
      { from: 'ORP_READY', event: 'DECISION_REJECTED', to: 'UNDER_REVIEW' },
      { from: 'ORP_READY', event: 'MODIFICATION_REQUESTED', to: 'UNDER_REVIEW' },
      { from: 'ORP_READY', event: 'REINSPECTION_REQUESTED', to: 'INSPECTION_REQUIRED' },
      { from: 'ORP_READY', event: 'DECISION_ESCALATED', to: 'UNDER_REVIEW' },
      { from: 'APPROVED', event: 'EXECUTION_STARTED', to: 'EXECUTION' },
      { from: 'EXECUTION', event: 'EXECUTION_COMPLETED', to: 'VERIFICATION' },
      { from: 'VERIFICATION', event: 'CASE_CLOSED', to: 'CLOSED' }
    ]);
    expect(supportedCaseTransitions.some(({ from }) => from === CaseStatus.CLOSED || from === CaseStatus.CANCELLED)).toBe(false);
  });

  it.each([OrpDecisionType.MODIFICATION_REQUESTED, OrpDecisionType.REJECTED, OrpDecisionType.ESCALATED])(
    'requires a new inspection to recover UNDER_REVIEW after %s',
    (decision) => expect(inspectionCreatedTransition(CaseStatus.UNDER_REVIEW, decision)).toBe(CaseStatus.INSPECTION_IN_PROGRESS)
  );

  it('does not treat an unrelated or missing decision as UNDER_REVIEW recovery authority', () => {
    expect(inspectionCreatedTransition(CaseStatus.UNDER_REVIEW)).toBeNull();
    expect(inspectionCreatedTransition(CaseStatus.UNDER_REVIEW, OrpDecisionType.APPROVED)).toBeNull();
  });

  it.each([CaseStatus.ORP_READY, CaseStatus.APPROVED, CaseStatus.EXECUTION, CaseStatus.VERIFICATION, CaseStatus.CLOSED, CaseStatus.CANCELLED])(
    'does not reopen %s through inspection creation',
    (status) => expect(inspectionCreatedTransition(status)).toBeNull()
  );

  it('allows risk to advance only the explicit analysis boundary', () => {
    for (const status of Object.values(CaseStatus)) {
      expect(riskAssessedTransition(status)).toBe(status === CaseStatus.INSPECTION_IN_PROGRESS ? CaseStatus.ORP_READY : null);
    }
  });
});
