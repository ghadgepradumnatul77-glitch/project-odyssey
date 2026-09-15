import { describe, expect, it } from 'vitest';
import { recordedConditionChange, recordedRiskChange, recordedTaskCoverage, recordedElapsedTime, recordedClosureConsistency, subsequentRecordedCases, estimateRecordedDuration } from '../src/modules/assets/recorded-outcomes.calculations';
import type { OutcomeContext, OutcomePair, OutcomeAssessment, OutcomeTask, OutcomeClosure, OutcomeDurationLink } from '../src/modules/assets/recorded-outcomes.contracts';
const a='2026-01-01T00:00:00Z', b='2026-01-02T00:00:00Z', c='2026-01-03T00:00:00Z';
const ctx: OutcomeContext = { asOf:c, cohortId:'cohort', window:{start:a,end:c} };
const pair: OutcomePair = { selection:'EXPLICIT', before:{ id:'i1',assetId:'a',caseId:'c',observedAt:a,structuralCondition:'POOR',crackSeverity:'SEVERE',corrosionLevel:'LOW' },after:{ id:'i2',assetId:'a',caseId:'c',observedAt:b,structuralCondition:'GOOD',crackSeverity:'SEVERE',corrosionLevel:'HIGH' } };
const risk: OutcomeAssessment = { id:'r1',inspectionId:'i1',caseId:'c',recordedAt:a,version:'ODYSSEY_RISK_V1',score:77,riskLevel:'VERY_HIGH',priorityLevel:'CRITICAL' };
const afterRisk: OutcomeAssessment = { ...risk,id:'r2',inspectionId:'i2',recordedAt:b,score:0 };
const task: OutcomeTask = { id:'t',planId:'p',templateVersion:'V1',status:'VERIFIED',mandatory:true,verificationRequired:true,evidenceRequired:true,assignedToId:'u',submittedById:'u',verifiedById:'v',startedAt:a,submittedAt:b,verifiedAt:c,evidence:[{id:'e',taskId:'t',submittedAt:b}] };
const population = (tasks: OutcomeTask[] = [task]) => ({ planId:'p',complete:true,tasks });
const closure: OutcomeClosure = { caseId:'c',caseStatus:'CLOSED',caseCreatedAt:a,closedAt:c,record:{ id:'cl',caseId:'c',planId:'p',recordedAt:c,reason:'EXECUTION_VERIFIED' },plan:{id:'p',caseId:'c',status:'COMPLETED',completedAt:b} };
const link: OutcomeDurationLink = { linkage:'EXPLICIT_SAME_WORK',caseId:'c',estimate:{id:'e',caseId:'c',version:1,preparedAt:a,durationDays:1,provenanceFingerprint:'sha256:'+'a'.repeat(64)},plan:{id:'p',caseId:'c',templateVersion:'V1',startedAt:b,completedAt:c} };
describe('explicit observations',()=>{
  it('measures separate recorded directions without collapsing them',()=>{
    const r=recordedConditionChange(pair,ctx); expect(r.structuralCondition.value?.direction).toBe('IMPROVING');expect(r.crackSeverity.value?.direction).toBe('UNCHANGED');expect(r.corrosionLevel.value?.direction).toBe('WORSENING');
  });
  it.each([
    [{...pair,selection:'AMBIGUOUS'},'NOT_COMPARABLE'],[{...pair,before:null},'UNKNOWN'],
    [{...pair,after:{...pair.after,id:'i1'}},'INVALID'],[{...pair,after:{...pair.after,assetId:'other'}},'NOT_COMPARABLE'],
    [{...pair,after:{...pair.after,observedAt:a}},'NOT_COMPARABLE'],[{...pair,after:{...pair.after,observedAt:'2025-12-31T00:00:00Z'}},'INVALID'],
    [{...pair,after:{...pair.after,observedAt:'2027-01-01T00:00:00Z'}},'INVALID'],[{...pair,after:{...pair.after,observedAt:null}},'UNKNOWN'],
    [{...pair,after:{...pair.after,observedAt:'2026-02-30T00:00:00Z'}},'INVALID'],
    [{...pair,after:{...pair.after,structuralCondition:null}},'UNKNOWN'],[{...pair,after:{...pair.after,structuralCondition:'ALIEN'}},'INVALID']
  ])('preserves unavailable pair/field state %#',(p,state)=>expect(recordedConditionChange(p as OutcomePair,ctx).structuralCondition.state).toBe(state));
  it('rejects explicit pairs outside declared window',()=>expect(recordedConditionChange(pair,{...ctx,window:{start:b,end:c}}).structuralCondition.state).toBe('NOT_COMPARABLE'));
  it('preserves recorded zero risk; does not rescore risk labels',()=>{
    const r=recordedRiskChange(pair,risk,afterRisk,ctx);expect(r.state).toBe('PRESENT');expect(r.value?.scoreDelta).toBe(-77);expect(r.value?.afterRisk).toBe('VERY_HIGH');expect(r.engineVersions).toEqual(['ODYSSEY_RISK_V1']);
  });
  it.each(['V2','',null])('rejects incompatible risk version %s',version=>expect(recordedRiskChange(pair,risk,{...afterRisk,version},ctx).state).toBe('NOT_COMPARABLE'));
  it('rejects even matching unsupported versions',()=>expect(recordedRiskChange(pair,{...risk,version:'V2'},{...afterRisk,version:'V2'},ctx).state).toBe('NOT_COMPARABLE'));
  it.each([-1,101,0.5,NaN,Infinity])('rejects invalid recorded score %s',score=>expect(recordedRiskChange(pair,risk,{...afterRisk,score},ctx).state).toBe('INVALID'));
  it('does not interpret missing assessment as improvement',()=>expect(recordedRiskChange(pair,null,afterRisk,ctx)).toMatchObject({state:'UNKNOWN',value:null}));
  it('checks risk linkage and assessment recording time',()=>{
    expect(recordedRiskChange(pair,risk,{...afterRisk,inspectionId:'other'},ctx).state).toBe('INVALID');
    expect(recordedRiskChange(pair,risk,{...afterRisk,recordedAt:a},ctx).state).toBe('INVALID');
  });
});
describe('task progress and evidence',()=>{
  it.each(['EXECUTION','VERIFICATION','EVIDENCE'] as const)('counts eligible %s records',kind=>expect(recordedTaskCoverage(population(),kind,ctx)).toMatchObject({state:'PRESENT',counts:{numerator:1,denominator:1,unknown:0,invalid:0,excluded:0}}));
  it.each(['EXECUTION','VERIFICATION','EVIDENCE'] as const)('zero denominator %s',kind=>expect(recordedTaskCoverage(population([]),kind,ctx)).toMatchObject({state:'NOT_APPLICABLE',counts:{numerator:0,denominator:0}}));
  it('discloses pending, blocked, cancelled separately; none is verified',()=>{
    const tasks=['PENDING','BLOCKED','CANCELLED'].map(status=>({...task,id:status,status,startedAt:null,submittedAt:null,submittedById:null,verifiedAt:null,verifiedById:null}));
    expect(recordedTaskCoverage(population(tasks),'EXECUTION',ctx)).toMatchObject({state:'PRESENT',counts:{numerator:0,denominator:3},value:{byStatus:{PENDING:1,BLOCKED:1,CANCELLED:1}}});
  });
  it('distinguishes submitted-but-unverified from verified',()=>expect(recordedTaskCoverage(population([{...task,status:'COMPLETION_SUBMITTED',verifiedAt:null,verifiedById:null}]),'VERIFICATION',ctx)).toMatchObject({counts:{numerator:0,denominator:1},value:{submittedUnverified:1}}));
  it.each([{verifiedById:'u'},{submittedById:'other'},{verifiedAt:null},{verifiedAt:a},{verifiedAt:'2027-01-01T00:00:00Z'},{status:'PENDING'},{status:'INVALID'}])('rejects inconsistent task %#',extra=>expect(recordedTaskCoverage(population([{...task,...extra}]),'VERIFICATION',ctx)).toMatchObject({state:'INVALID',counts:{numerator:0,invalid:1,denominator:1}}));
  it('unknown membership is not a zero eligible cohort',()=>expect(recordedTaskCoverage(population([{...task,mandatory:null}]),'EXECUTION',ctx)).toMatchObject({state:'UNKNOWN',counts:{unknown:1,denominator:0}}));
  it('excludes explicitly nonmandatory tasks',()=>expect(recordedTaskCoverage(population([{...task,mandatory:false}]),'EXECUTION',ctx)).toMatchObject({state:'NOT_APPLICABLE',counts:{excluded:1}}));
  it('distinguishes missing evidence set from measured empty',()=>{
    expect(recordedTaskCoverage(population([{...task,evidence:null}]),'EVIDENCE',ctx).state).toBe('UNKNOWN');
    expect(recordedTaskCoverage(population([{...task,evidence:[]}]),'EVIDENCE',ctx)).toMatchObject({state:'PRESENT',counts:{numerator:0,denominator:1}});
  });
  it('rejects evidence linkage/future timestamps/duplicates',()=>{
    for(const evidence of [[{id:'e',taskId:'other',submittedAt:b}],[{id:'e',taskId:'t',submittedAt:'2027-01-01T00:00:00Z'}],[...task.evidence!,...task.evidence!]]) expect(recordedTaskCoverage(population([{...task,evidence}]),'EVIDENCE',ctx).state).toBe('INVALID');
  });
  it('keeps missing evidence time unknown and status breakdown visible',()=>{
    const r=recordedTaskCoverage(population([{...task,evidence:[{id:'e',taskId:'t',submittedAt:null}]}]),'EVIDENCE',ctx);
    expect(r.state).toBe('UNKNOWN');expect(r.counts?.unknown).toBe(1);expect(r.recordedStatusCounts.VERIFIED).toBe(1);
  });
  it('rejects submitted facts on an in-progress task',()=>expect(recordedTaskCoverage(population([{...task,status:'IN_PROGRESS',verifiedAt:null,verifiedById:null}]),'VERIFICATION',ctx).state).toBe('INVALID'));
  it('rejects incomplete population, duplicates and wrong plan',()=>{
    expect(recordedTaskCoverage({...population(),complete:false},'EXECUTION',ctx).state).toBe('UNKNOWN');
    expect(recordedTaskCoverage(population([task,task]),'EXECUTION',ctx).state).toBe('INVALID');
    expect(recordedTaskCoverage(population([{...task,planId:'other'}]),'EXECUTION',ctx).state).toBe('INVALID');
  });
});
describe('recorded dates and closure',()=>{
  it.each(['CASE_CREATION_TO_CLOSURE','TASK_START_TO_SUBMISSION','SUBMISSION_TO_VERIFICATION'] as const)('supports exact zero interval %s',kind=>expect(recordedElapsedTime('x',a,a,kind,ctx)).toMatchObject({state:'PRESENT',value:{milliseconds:0,completed:true}}));
  it.each([[null,b,'UNKNOWN'],[a,null,'UNKNOWN'],[b,a,'INVALID'],['invalid',b,'INVALID'],[a,'2027-01-01T00:00:00Z','INVALID']] as const)('handles time boundary %#',(start,end,state)=>expect(recordedElapsedTime('x',start,end,'CASE_CREATION_TO_CLOSURE',ctx).state).toBe(state));
  it('unfinished remains unknown with no completed duration',()=>expect(recordedElapsedTime('x',a,null,'CASE_CREATION_TO_CLOSURE',ctx)).toMatchObject({state:'UNKNOWN',value:null,reasonCodes:['UNFINISHED']}));
  it('checks closure lineage without claiming physical improvement',()=>expect(recordedClosureConsistency(closure,ctx)).toMatchObject({state:'PRESENT',value:{provesPhysicalImprovement:false}}));
  it.each([{record:null},{caseStatus:'NEW'},{closedAt:a},{plan:{...closure.plan!,status:'IN_PROGRESS'}},{record:{...closure.record!,caseId:'other'}}])('rejects closure inconsistency %#',extra=>expect(recordedClosureConsistency({...closure,...extra},ctx).state).toBe('INVALID'));
  it('open case has no completed closure',()=>expect(recordedClosureConsistency({...closure,caseStatus:'NEW',closedAt:null,record:null},ctx)).toMatchObject({state:'UNKNOWN',reasonCodes:['UNFINISHED']}));
});
describe('subsequent activity and duration facts',()=>{
  const activity={assetId:'a',closedCaseId:'closed',closedAt:a,complete:true,cases:[{id:'new',assetId:'a',createdAt:b}]};
  it('counts later Case records, not proven recurrence',()=>expect(subsequentRecordedCases(activity,ctx)).toMatchObject({state:'PRESENT',value:{count:1,provesRecurrence:false}}));
  it('explicit zero requires complete observation set',()=>{
    expect(subsequentRecordedCases({...activity,cases:[]},ctx)).toMatchObject({state:'PRESENT',value:{count:0}});
    expect(subsequentRecordedCases({...activity,cases:[],complete:false},ctx).state).toBe('UNKNOWN');
  });
  it('rejects wrong asset and invalid chronology window',()=>{
    expect(subsequentRecordedCases({...activity,cases:[{...activity.cases[0],assetId:'other'}]},ctx).state).toBe('INVALID');
    expect(subsequentRecordedCases({...activity,closedAt:b},ctx).state).toBe('NOT_COMPARABLE');
  });
  it('shows only same-work estimate and calendar elapsed facts',()=>expect(estimateRecordedDuration(link,ctx)).toMatchObject({state:'PRESENT',value:{estimatedDays:1,recordedElapsedMilliseconds:86400000,measuresLabourEffort:false}}));
  it('rejects malformed provenance fingerprint',()=>expect(estimateRecordedDuration({...link,estimate:{...link.estimate!,provenanceFingerprint:'arbitrary'}},ctx).state).toBe('INVALID'));
  it.each([
    [{...link,linkage:'AMBIGUOUS'},'NOT_COMPARABLE'],[{...link,estimate:null},'UNKNOWN'],
    [{...link,estimate:{...link.estimate,durationDays:null}},'UNKNOWN'],[{...link,estimate:{...link.estimate,durationDays:0}},'INVALID'],
    [{...link,estimate:{...link.estimate,provenanceFingerprint:null}},'NOT_COMPARABLE'],[{...link,plan:{...link.plan,caseId:'other'}},'INVALID'],
    [{...link,plan:{...link.plan,completedAt:null}},'UNKNOWN'],[{...link,estimate:{...link.estimate,preparedAt:c}},'INVALID']
  ])('rejects unsupported duration comparison %#',(input,state)=>expect(estimateRecordedDuration(input as OutcomeDurationLink,ctx).state).toBe(state));
});
it('has deterministic fingerprints, metadata, no mutation, and no operational authority',()=>{
  const p=population([task,{...task,id:'t2',evidence:[]}]); const before=JSON.stringify(p);
  const first=recordedTaskCoverage(p,'EXECUTION',ctx),second=recordedTaskCoverage({...p,tasks:[...p.tasks].reverse()},'EXECUTION',ctx);
  expect(first).toEqual(second);expect(JSON.stringify(p)).toBe(before);
  expect(first.sourceFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/);expect(first.templateVersions).toEqual(['V1']);
  expect(first.authority).toEqual({descriptiveOnly:true,establishesCausation:false,mutatesWorkflow:false});
  expect(recordedTaskCoverage(population([{...task,mandatory:false}]),'EXECUTION',ctx).sourceFingerprint).not.toBe(first.sourceFingerprint);
});
it.each([{...ctx,asOf:'bad'},{...ctx,window:{start:c,end:a}},{...ctx,window:{start:a,end:'2027-01-01T00:00:00Z'}}])('rejects invalid context %#',context=>expect(recordedElapsedTime('x',a,b,'CASE_CREATION_TO_CLOSURE',context).state).toBe('INVALID'));
