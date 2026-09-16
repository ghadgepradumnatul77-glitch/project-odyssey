import { expect,it,vi } from 'vitest';
vi.mock('../src/lib/prisma',()=>({default:{}}));
import { createRecordedOutcomesService } from '../src/modules/assets/recorded-outcomes.service';
import { OutcomeRepositoryError } from '../src/modules/assets/recorded-outcomes.repository';
import { summarizeRecordedMetrics, recordedTaskCoverage } from '../src/modules/assets/recorded-outcomes.calculations';
const id=(n:number)=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const start='2026-01-01T00:00:00.000Z',end='2026-01-03T00:00:00.000Z';
const principal:any={id:'u',role:'OFFICER',status:'ACTIVE',departmentId:'d',jurisdictionId:'j'};
const query={beforeInspectionId:id(3),afterInspectionId:id(4)};
function setup() {
  const sources:any={assets:[{id:id(1),departmentId:'d',jurisdictionId:'j'}],cases:[{id:id(2),assetId:id(1),status:'CLOSED',createdAt:start,closedAt:end}],
    inspections:[{id:id(3),caseId:id(2),inspectionDate:start,structuralCondition:'POOR',crackSeverity:'SEVERE',corrosionLevel:'HIGH'},{id:id(4),caseId:id(2),inspectionDate:end,structuralCondition:'GOOD',crackSeverity:'NONE',corrosionLevel:'LOW'}],
    assessments:[{id:id(5),caseId:id(2),inspectionId:id(3),createdAt:start,assessmentVersion:'ODYSSEY_RISK_V1',riskScore:77,riskLevel:'VERY_HIGH',priorityLevel:'CRITICAL'},{id:id(6),caseId:id(2),inspectionId:id(4),createdAt:end,assessmentVersion:'ODYSSEY_RISK_V1',riskScore:10,riskLevel:'LOW',priorityLevel:'LOW'}],
    plans:[{id:id(7),caseId:id(2),status:'COMPLETED',templateVersion:'V1',executionContractVersion:null,startedAt:start,completedAt:end}],
    tasks:[{id:id(8),executionPlanId:id(7),status:'VERIFIED',isMandatory:true,verificationRequired:true,evidenceRequired:true,assignedToId:'u',completionSubmittedById:'u',verifiedById:'v',startedAt:start,completionSubmittedAt:end,verifiedAt:end}],
    evidence:[{id:id(9),executionTaskId:id(8),submittedAt:end}],closures:[{id:id(10),caseId:id(2),executionPlanId:id(7),closureReason:'EXECUTION_VERIFIED',createdAt:end}],estimates:[{id:id(11),caseId:id(2),estimateVersion:1,status:'ACTIVE',estimatedDurationDays:2}],orps:[],decisions:[]};
  const snapshot:any={complete:true,asOf:end,sources,sourceFingerprint:'sha256:'+'a'.repeat(64),coverage:{counts:{assets:1,cases:1},zeroCaseAssets:0,historyTruncated:false,referencesTruncated:false}};
  const repository={snapshot:vi.fn().mockResolvedValue(snapshot)};
  return {sources,snapshot,repository,service:createRecordedOutcomesService(repository as any)};
}
it('uses one snapshot and pure metrics for an explicit pair without mutating inputs',async()=>{
  const {sources,repository,service}=setup(),before=JSON.stringify(sources);
  const result=await service.detail(principal,id(1),query);expect(repository.snapshot).toHaveBeenCalledTimes(1);expect(repository.snapshot).toHaveBeenCalledWith(principal,{assetId:id(1)});
  const c=result.items[0].cases[0];expect(c.conditionChange.structuralCondition.value?.direction).toBe('IMPROVING');expect(c.riskChange.value?.scoreDelta).toBe(-67);
  expect(c.closure.state).toBe('PRESENT');expect(c.creationToClosure.value?.milliseconds).toBe(172800000);
  expect(c.plans[0].executionProgress.counts?.numerator).toBe(1);expect(c.plans[0].estimateDuration.state).toBe('NOT_COMPARABLE');expect(JSON.stringify(sources)).toBe(before);
});
it('does not choose among inspection or assessment candidates',async()=>{
  const {sources,service}=setup();expect((await service.detail(principal,id(1))).items[0].cases[0].conditionChange.structuralCondition.state).toBe('NOT_COMPARABLE');
  sources.assessments.push({...sources.assessments[0],id:id(15)});
  expect((await service.detail(principal,id(1),query)).items[0].cases[0].riskChange.state).toBe('NOT_COMPARABLE');
  expect((await service.detail(principal,id(1),{...query,beforeAssessmentId:id(5)})).items[0].cases[0].riskChange.state).toBe('PRESENT');
});
it('preserves risk version incompatibility',async()=>{
  const {sources,service}=setup();sources.assessments[1].assessmentVersion='OTHER';expect((await service.detail(principal,id(1),query)).items[0].cases[0].riskChange.state).toBe('NOT_COMPARABLE');
});
it('retains zero-Case Assets and zero-denominator summaries',async()=>{
  const {sources,service,snapshot}=setup();sources.cases=[];snapshot.coverage.zeroCaseAssets=1;
  const result=await service.detail(principal,id(1));expect(result.items).toEqual([{assetId:id(1),cases:[]}]);expect(result.summary.executionProgress.state).toBe('NOT_APPLICABLE');
});
it('preserves independent Cases and plans',async()=>{
  const {sources,service}=setup();sources.cases.push({...sources.cases[0],id:id(22),status:'NEW',closedAt:null});sources.plans.push({...sources.plans[0],id:id(27),caseId:id(22),status:'PLANNED',completedAt:null});
  const result=await service.detail(principal,id(1));expect(result.items[0].cases).toHaveLength(2);expect(result.items[0].cases[1].plans[0].planId).toBe(id(27));expect(result.items[0].cases[1].creationToClosure.state).toBe('UNKNOWN');
});
it.each(['BLOCKED','CANCELLED','PENDING'])('preserves %s as nonverified',async status=>{
  const {sources,service}=setup();Object.assign(sources.tasks[0],{status,startedAt:null,completionSubmittedAt:null,completionSubmittedById:null,verifiedAt:null,verifiedById:null});
  const plan=(await service.detail(principal,id(1))).items[0].cases[0].plans[0];expect(plan.executionProgress.counts?.numerator).toBe(0);expect(plan.executionProgress.recordedStatusCounts[status]).toBe(1);expect(plan.tasks[0].startToSubmission.state).toBe('UNKNOWN');
});
it('excludes optional tasks from mandatory denominator',async()=>{
  const {sources,service}=setup();sources.tasks[0].isMandatory=false;const r=(await service.summary(principal)).summary.executionProgress;
  expect(r.state).toBe('NOT_APPLICABLE');expect(r.counts?.excluded).toBe(1);expect(r.stateCounts.NOT_APPLICABLE).toBe(1);
});
it('does not count invalid verification as positive coverage or elapsed outcome',async()=>{
  const {sources,service}=setup();sources.tasks[0].verifiedById='u';const result=await service.detail(principal,id(1));
  expect(result.summary.verificationCoverage.counts).toMatchObject({numerator:0,denominator:0,invalid:1});expect(result.summary.verificationCoverage.stateCounts.INVALID).toBe(1);
  expect(result.items[0].cases[0].plans[0].tasks[0].submissionToVerification.state).toBe('INVALID');
});
it('preserves unknown evidence time',async()=>{
  const {sources,service}=setup();sources.evidence[0].submittedAt=null;const r=(await service.summary(principal)).summary.evidenceCoverage;expect(r.stateCounts.UNKNOWN).toBe(1);expect(r.counts?.unknown).toBe(1);
});
it('shows subsequent recorded Case activity without claiming recurrence',async()=>{
  const {sources,service,snapshot}=setup();snapshot.asOf='2026-01-05T00:00:00.000Z';sources.cases.push({...sources.cases[0],id:id(30),createdAt:'2026-01-04T00:00:00.000Z',closedAt:null,status:'NEW'});
  const r=(await service.detail(principal,id(1))).items[0].cases[0].subsequentCaseActivity;expect(r.value).toMatchObject({count:1,provesRecurrence:false});
});
it('gates closure time on recorded linkage consistency',async()=>{
  const {sources,service}=setup();sources.closures[0].executionPlanId=id(99);expect((await service.detail(principal,id(1))).items[0].cases[0].creationToClosure.state).toBe('INVALID');
});
it('summary exposes all state counters and only eligible ratios',()=>{
  const context={asOf:end,cohortId:'x',window:{start:start,end:end}};
  const empty=recordedTaskCoverage({planId:'p',complete:true,tasks:[]},'EXECUTION',context);
  const r=summarizeRecordedMetrics([empty], 'execution',context);expect(r.stateCounts).toEqual({PRESENT:0,UNKNOWN:0,INVALID:0,NOT_COMPARABLE:0,NOT_APPLICABLE:1});expect(r.excludedObservations).toBe(1);
});
it('keeps invalid plans outside eligible summary denominators without hiding invalid task counts',async()=>{
  const {sources,service}=setup();sources.plans.push({...sources.plans[0],id:id(70)});sources.tasks.push({...sources.tasks[0],id:id(80),executionPlanId:id(70),verifiedById:'u'});
  const result=(await service.summary(principal)).summary.executionProgress;
  expect(result.stateCounts).toMatchObject({PRESENT:1,INVALID:1});expect(result.counts).toMatchObject({numerator:1,denominator:1,invalid:1});expect(result.excludedObservations).toBe(1);
});
it.each([{beforeInspectionId:id(3)},{beforeAssessmentId:id(5)},{windowStart:'bad'},{windowStart:end,windowEnd:start},{other:'field'}])('rejects invalid query %#',async query=>{
  await expect(setup().service.detail(principal,id(1),query)).rejects.toMatchObject({status:400});
});
it('rejects foreign inspection/assessment linkage',async()=>{
  const {service}=setup();await expect(service.detail(principal,id(1),{...query,afterInspectionId:id(99)})).rejects.toMatchObject({status:404});await expect(service.detail(principal,id(1),{...query,beforeAssessmentId:id(6)})).rejects.toMatchObject({status:404});
});
it.each(['OUTCOME_SOURCE_UNAVAILABLE','OUTCOME_SOURCE_LIMIT','ASSET_NOT_FOUND'] as const)('maps repository %s safely',async code=>{
  const {service,repository}=setup();repository.snapshot.mockRejectedValue(new OutcomeRepositoryError(code));await expect(service.detail(principal,id(1))).rejects.toMatchObject({status:code==='ASSET_NOT_FOUND'?404:503});
});
it('fails closed for incomplete snapshots and unexpected private errors',async()=>{
  const {service,snapshot,repository}=setup();snapshot.complete=false;await expect(service.summary(principal)).rejects.toMatchObject({status:503});repository.snapshot.mockRejectedValue(new Error('secret URL'));await expect(service.summary(principal)).rejects.toThrow('OUTCOMES_UNAVAILABLE');
});
it('returns deterministic safe DTOs and descriptive authority only',async()=>{
  const {sources,service}=setup();sources.tasks[0].description='PRIVATE_SENTINEL';sources.inspections[0].inspectionNotes='PRIVATE_SENTINEL';sources.evidence[0].referenceUrl='PRIVATE_SENTINEL';
  const r=await service.detail(principal,id(1),query);expect(r).toEqual(await service.detail(principal,id(1),query));expect(JSON.stringify(r)).not.toContain('PRIVATE_SENTINEL');expect(JSON.stringify(r)).not.toMatch(/assignedToId|verifiedById|rawPayload|attentionScore|predictedSavings/);
  expect(r.authority).toEqual({descriptiveOnly:true,establishesCausation:false,mutatesWorkflow:false});expect(r.resultFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/);
});
