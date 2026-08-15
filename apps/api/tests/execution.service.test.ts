import { describe, expect, it } from 'vitest';
import { ExecutionTaskStatus } from '../src/generated/prisma';
import { derivePlanStatus, hasClientActorFields } from '../src/modules/execution/execution.service';
describe('execution state rules', () => {
  it('derives plan states', () => { expect(derivePlanStatus([{status:ExecutionTaskStatus.PENDING,isMandatory:true}])).toBe('PLANNED'); expect(derivePlanStatus([{status:ExecutionTaskStatus.ASSIGNED,isMandatory:true}])).toBe('IN_PROGRESS'); expect(derivePlanStatus([{status:ExecutionTaskStatus.COMPLETION_SUBMITTED,isMandatory:true},{status:ExecutionTaskStatus.VERIFIED,isMandatory:true}])).toBe('VERIFICATION_PENDING'); expect(derivePlanStatus([{status:ExecutionTaskStatus.VERIFIED,isMandatory:true}])).toBe('COMPLETED'); });
  it('mandatory cancellation prevents completion', () => expect(derivePlanStatus([{status:ExecutionTaskStatus.CANCELLED,isMandatory:true}])).toBe('IN_PROGRESS'));
  it('active optional work delays completion without becoming mandatory', () => expect(derivePlanStatus([{status:ExecutionTaskStatus.VERIFIED,isMandatory:true},{status:ExecutionTaskStatus.PENDING,isMandatory:false}])).toBe('VERIFICATION_PENDING'));
  it.each([ExecutionTaskStatus.VERIFIED, ExecutionTaskStatus.CANCELLED])('optional terminal state %s permits completion', status => expect(derivePlanStatus([{status:ExecutionTaskStatus.VERIFIED,isMandatory:true},{status,isMandatory:false}])).toBe('COMPLETED'));
  it.each(['createdById','assignedById','submittedById','completionSubmittedById','verifiedById','cancelledById'])('rejects actor field %s', f=>expect(hasClientActorFields({[f]:'u'})).toBe(true));
});
