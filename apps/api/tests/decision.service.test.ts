import { describe, expect, it } from 'vitest';
import { OrpDecisionType, PriorityLevel } from '../src/generated/prisma';
import {
  authorityAllowsDecision,
  decisionStateTransition,
  isAuthorityActive,
  isLatestOrp,
  isPriorityWithinAuthority,
  reviewerScopeError
} from '../src/modules/decisions/decision.service';

const fullGrant = {
  canApprove: true,
  canReject: true,
  canRequestModification: true,
  canRequestReinspection: true,
  canEscalate: true
};

describe('decision authority rules', () => {
  it('matches every decision to its explicit permission', () => {
    for (const type of Object.values(OrpDecisionType)) {
      expect(authorityAllowsDecision(fullGrant, type)).toBe(true);
    }
    expect(authorityAllowsDecision({ ...fullGrant, canApprove: false }, OrpDecisionType.APPROVED)).toBe(false);
  });

  it('accepts only active grants inside their validity window', () => {
    const now = new Date('2026-08-11T00:00:00Z');
    expect(isAuthorityActive({ isActive: true, validFrom: null, validUntil: null }, now)).toBe(true);
    expect(isAuthorityActive({ isActive: false, validFrom: null, validUntil: null }, now)).toBe(false);
    expect(isAuthorityActive({ isActive: true, validFrom: new Date('2026-08-12'), validUntil: null }, now)).toBe(false);
    expect(isAuthorityActive({ isActive: true, validFrom: null, validUntil: new Date('2026-08-10') }, now)).toBe(false);
    expect(isAuthorityActive({ isActive: true, validFrom: now, validUntil: now }, now)).toBe(true);
  });

  it('enforces the actual PriorityLevel ordering', () => {
    expect(isPriorityWithinAuthority(PriorityLevel.LOW, PriorityLevel.MEDIUM)).toBe(true);
    expect(isPriorityWithinAuthority(PriorityLevel.MEDIUM, PriorityLevel.MEDIUM)).toBe(true);
    expect(isPriorityWithinAuthority(PriorityLevel.CRITICAL, PriorityLevel.VERY_HIGH)).toBe(false);
    expect(isPriorityWithinAuthority(PriorityLevel.CRITICAL, PriorityLevel.CRITICAL)).toBe(true);
    expect(isPriorityWithinAuthority(PriorityLevel.CRITICAL, null)).toBe(true);
  });

  it('detects stale ORP IDs', () => {
    expect(isLatestOrp('orp-2', 'orp-2')).toBe(true);
    expect(isLatestOrp('orp-1', 'orp-2')).toBe(false);
  });

  it('validates reviewer department and jurisdiction independently', () => {
    const asset = { departmentId: 'dep-1', jurisdictionId: 'jur-1' };
    expect(reviewerScopeError({ departmentId: 'dep-1', jurisdictionId: 'jur-1' }, asset)).toBeNull();
    expect(reviewerScopeError({ departmentId: 'dep-2', jurisdictionId: 'jur-1' }, asset)).toBe('REVIEWER_DEPARTMENT_MISMATCH');
    expect(reviewerScopeError({ departmentId: 'dep-1', jurisdictionId: 'jur-2' }, asset)).toBe('REVIEWER_JURISDICTION_MISMATCH');
  });

  it.each([
    [OrpDecisionType.APPROVED, 'APPROVED', 'APPROVED'],
    [OrpDecisionType.REJECTED, 'REJECTED', 'UNDER_REVIEW'],
    [OrpDecisionType.MODIFICATION_REQUESTED, 'MODIFICATION_REQUESTED', 'UNDER_REVIEW'],
    [OrpDecisionType.REINSPECTION_REQUESTED, 'REINSPECTION_REQUESTED', 'INSPECTION_REQUIRED'],
    [OrpDecisionType.ESCALATED, 'ESCALATED', 'UNDER_REVIEW']
  ])('maps %s to its deterministic state transition', (type, orpStatus, caseStatus) => {
    expect(decisionStateTransition(type)).toEqual({ orpStatus, caseStatus });
  });
});
