import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks=vi.hoisted(()=>({assessment:vi.fn(),actions:vi.fn(),resolve:vi.fn(),upsert:vi.fn()}));
vi.mock('../src/lib/prisma',()=>({default:{infrastructureIntelligenceAssessment:{findUnique:mocks.assessment},approvedActionVersion:{findMany:mocks.actions},infrastructureIntelligenceReconciliation:{upsert:mocks.upsert}}}));
vi.mock('../src/modules/policy-registry/policy-registry.service',()=>({resolveCasePolicy:mocks.resolve}));

import { reconcileIntelligenceAssessment } from '../src/modules/intelligence/intelligence-governance.service';

const principal={} as any;
const at=new Date('2026-08-22T12:00:00Z');
const assessment={id:'intel-1',caseId:'case-1',recommendedActions:[{actionCode:'ACT_TEST',rationale:'Advisory only'}],case:{asset:{departmentId:'dep-1',jurisdictionId:'jur-1'}}};
const resolution=(policyVersion=1,actionVersion=1)=>({status:'RESOLVED',asOf:at,issues:[],applicableRules:[{policy:{id:`policy-${policyVersion}`,policyCode:'POLICY_TEST',versionNumber:policyVersion},rule:{id:`rule-${policyVersion}`,code:'RULE_TEST',enforcementLevel:'MANDATORY'},action:{id:`action-${actionVersion}`,actionCode:'ACT_TEST',versionNumber:actionVersion,title:'Test',category:'SAFETY',sourceReference:'REF'}}]});

describe('intelligence governance persistence',()=>{
  beforeEach(()=>{vi.clearAllMocks();mocks.assessment.mockResolvedValue(assessment);mocks.actions.mockResolvedValue([]);mocks.upsert.mockImplementation(async args=>args.create);mocks.resolve.mockResolvedValue(resolution());});

  it('reuses an identical governance fingerprint without overwriting history',async()=>{
    await reconcileIntelligenceAssessment('intel-1',principal,at);
    await reconcileIntelligenceAssessment('intel-1',principal,at);
    const first=mocks.upsert.mock.calls[0][0];
    const second=mocks.upsert.mock.calls[1][0];
    expect(second.where.governanceFingerprint).toBe(first.where.governanceFingerprint);
    expect(first.update).toEqual({});
    expect(first.create).not.toHaveProperty('case');
    expect(first.create.reconciledActions[0]).toMatchObject({enforcementClassification:'MANDATORY',approvedActionVersion:{id:'action-1',versionNumber:1}});
  });

  it('creates new identities for governed policy or action version changes',async()=>{
    mocks.resolve.mockResolvedValueOnce(resolution(1,1)).mockResolvedValueOnce(resolution(2,1)).mockResolvedValueOnce(resolution(2,2));
    await reconcileIntelligenceAssessment('intel-1',principal,at);
    await reconcileIntelligenceAssessment('intel-1',principal,at);
    await reconcileIntelligenceAssessment('intel-1',principal,at);
    const fingerprints=mocks.upsert.mock.calls.map(call=>call[0].where.governanceFingerprint);
    expect(new Set(fingerprints).size).toBe(3);
  });
});
