import { expect, it, vi } from 'vitest';
vi.mock('../src/lib/prisma', () => ({ default: {} }));
import { createRecordedOutcomesRepository } from '../src/modules/assets/recorded-outcomes.repository';
import type { OrganizationalPrincipal } from '../src/security/organizational-scope';
const principal = { id:'u', role:'OFFICER', status:'ACTIVE', departmentId:'dep', jurisdictionId:'jur' } as OrganizationalPrincipal;
const date = new Date('2026-01-01T00:00:00Z');
const asset = (id='a') => ({ id,departmentId:'dep',jurisdictionId:'jur',createdAt:date,updatedAt:date });
const caseRow = (id='c', extra={}) => ({ id,assetId:'a',status:'ORP_READY',riskLevel:'VERY_HIGH',priorityLevel:'CRITICAL',createdAt:date,updatedAt:date,closedAt:null,...extra });
const names = ['asset','case','inspection','riskAssessment','operationalResponsePlan','orpDecision','executionPlan','executionTask','executionEvidence','caseClosure','caseResourceEstimate'];
function setup(data: Record<string, any[]> = {}) {
  const tx: any = Object.fromEntries(names.map(name=>[name,{findMany:vi.fn().mockResolvedValue(data[name] ?? (name==='asset'?[asset()]:[]))}]));
  tx.asset.findFirst=vi.fn().mockResolvedValue(null);
  const db: any = { $transaction:vi.fn((fn:any)=>fn(tx)) };
  return { tx,db,repo:createRecordedOutcomesRepository(db,()=>date) };
}
it('retains zero-Case Assets without fabricating evidence',async()=>{
  const {repo}=setup();const result=await repo.snapshot(principal);
  expect(result.coverage).toMatchObject({zeroCaseAssets:1,historyTruncated:false,referencesTruncated:false,counts:{assets:1,cases:0}});
  expect(result.sources.cases).toEqual([]);expect(result.complete).toBe(true);
});
it('preserves multiple open/closed/later Cases independently, without recurrence labels',async()=>{
  const {repo}=setup({case:[caseRow('later',{createdAt:new Date('2026-01-02T00:00:00Z')}),caseRow('closed',{status:'CLOSED',closedAt:date}),caseRow()]});
  const result=await repo.snapshot(principal);expect(result.sources.cases.map(c=>c.id)).toEqual(['c','closed','later']);
  expect(result.sources.cases[2].createdAt).toBe('2026-01-02T00:00:00.000Z');expect(result.coverage.counts.cases).toBe(3);
});
it('retains equal-time inspection candidates and all cross-version risk records',async()=>{
  const {repo}=setup({inspection:[{id:'i2',caseId:'c',inspectionDate:date},{id:'i1',caseId:'c',inspectionDate:date}],riskAssessment:[{id:'r1',caseId:'c',inspectionId:'i1',assessmentVersion:'ODYSSEY_RISK_V1',riskScore:77},{id:'r2',caseId:'c',inspectionId:'i1',assessmentVersion:'OTHER_V2',riskScore:10}]});
  const result=await repo.snapshot(principal);expect(result.sources.inspections).toHaveLength(2);expect(result.sources.assessments.map(r=>r.riskScore)).toEqual([77,10]);
  expect(result.coverage.selection).toBe('ALL_SCOPED_HISTORY_NO_PAIR_SELECTION');expect(result).not.toHaveProperty('before');
});
it('preserves ORP, approval and execution linkage without deriving success',async()=>{
  const {repo}=setup({operationalResponsePlan:[{id:'o',caseId:'c',riskAssessmentId:'r',versionNumber:2,planVersion:'V1'}],orpDecision:[{id:'d',caseId:'c',orpId:'o',decisionType:'APPROVE'}],executionPlan:[{id:'p',caseId:'c',orpId:'o',approvalDecisionId:'d',templateVersion:'V1',status:'IN_PROGRESS'}]});
  const result=await repo.snapshot(principal);expect(result.sources.plans[0].approvalDecisionId).toBe('d');expect(result.sources.orps[0].riskAssessmentId).toBe('r');
});
it.each(['PENDING','BLOCKED','CANCELLED','COMPLETION_SUBMITTED','VERIFIED'])('preserves %s task status, flags and actor IDs',async status=>{
  const task={id:'t',executionPlanId:'p',status,isMandatory:false,evidenceRequired:true,verificationRequired:true,assignedToId:'u',completionSubmittedById:'u',verifiedById:'v',completionSubmittedAt:date,verifiedAt:null};
  const {repo}=setup({executionTask:[task]});expect((await repo.snapshot(principal)).sources.tasks[0]).toMatchObject({...task,completionSubmittedAt:date.toISOString()});
});
it('retains evidence ownership and unknown captured timestamp, not evidence quality',async()=>{
  const {repo}=setup({executionEvidence:[{id:'e',executionTaskId:'t',capturedAt:null,submittedAt:date,evidenceType:'PHOTO'}]});
  expect((await repo.snapshot(principal)).sources.evidence[0]).toMatchObject({executionTaskId:'t',capturedAt:null,submittedAt:date.toISOString()});
});
it('preserves closure inconsistencies for calculations rather than repairing them',async()=>{
  const {repo}=setup({case:[caseRow()],caseClosure:[{id:'cl',caseId:'c',executionPlanId:'different',closureReason:'EXECUTION_VERIFIED',createdAt:date}]});
  const result=await repo.snapshot(principal);expect(result.sources.cases[0].status).toBe('ORP_READY');expect(result.sources.closures[0].executionPlanId).toBe('different');
});
it('retains estimate versions/status/duration and digest-only provenance',async()=>{
  const {repo}=setup({caseResourceEstimate:[{id:'e1',caseId:'c',estimateVersion:1,status:'SUPERSEDED',estimatedDurationDays:null,estimateBasis:'private prose',sourceReference:'https://private.invalid',preparedAt:date},{id:'e2',caseId:'c',estimateVersion:2,status:'ACTIVE',estimatedDurationDays:-1,estimateBasis:'private prose',sourceReference:'https://private.invalid',preparedAt:date}]});
  const result=await repo.snapshot(principal);expect(result.sources.estimates.map(e=>e.estimatedDurationDays)).toEqual([null,-1]);
  expect(result.sources.estimates.map(e=>e.status)).toEqual(['SUPERSEDED','ACTIVE']);expect(result.sources.estimates[0].estimateBasisDigest).toMatch(/^sha256:[a-f0-9]{64}$/);
  expect(JSON.stringify(result)).not.toMatch(/private prose|https:\/\//);
});
it('scopes before traversal and independently scopes all related reads',async()=>{
  const {repo,tx,db}=setup();await repo.snapshot(principal);
  expect(tx.asset.findMany.mock.calls[0][0]).toMatchObject({where:{AND:[{departmentId:'dep',jurisdictionId:'jur'},{},{}]},orderBy:{id:'asc'},take:500});
  for(const name of names.slice(1)) expect(JSON.stringify(tx[name].findMany.mock.calls[0][0].where)).toContain('"departmentId":"dep"');
  expect(tx.executionEvidence.findMany.mock.calls[0][0].where.executionTask.executionPlan.case.AND[1]).toEqual({assetId:{in:['a']}});
  expect(db.$transaction.mock.calls[0][1]).toEqual({isolationLevel:'RepeatableRead',timeout:30000,maxWait:5000});
});
it('denies inaccessible/invalid Asset filters before traversal',async()=>{
  const {repo,tx}=setup();await expect(repo.snapshot(principal,{assetId:'11111111-1111-4111-8111-111111111111'})).rejects.toMatchObject({code:'ASSET_NOT_FOUND'});
  await expect(repo.snapshot(principal,{assetId:'not-a-uuid'})).rejects.toThrow();expect(tx.asset.findMany).not.toHaveBeenCalled();
});
it('validates accessible Asset filter and preserves admin global reads',async()=>{
  const {repo,tx}=setup();const id='11111111-1111-4111-8111-111111111111';tx.asset.findFirst.mockResolvedValue({id});
  await repo.snapshot({...principal,role:'SYSTEM_ADMIN'},{assetId:id});
  expect(tx.asset.findFirst.mock.calls[0][0].where).toEqual({AND:[{},{id}]});expect(tx.asset.findMany.mock.calls[0][0].where.AND[1]).toEqual({id});
});
it('traverses 501 Assets in two batches with bounded flat queries',async()=>{
  const {repo,tx}=setup();tx.asset.findMany.mockReset().mockResolvedValueOnce(Array.from({length:500},(_,i)=>asset(`a${i.toString().padStart(3,'0')}`))).mockResolvedValueOnce([asset('z')]);
  const result=await repo.snapshot(principal);expect(result.coverage.counts.assets).toBe(501);expect(result.coverage.zeroCaseAssets).toBe(501);
  for(const name of names) expect(tx[name].findMany).toHaveBeenCalledTimes(2);
  expect(tx.asset.findMany.mock.calls[1][0].where.AND[2]).toEqual({id:{gt:'a499'}});
});
it('reads >500 inspections without history truncation',async()=>{
  const {repo,tx}=setup();tx.inspection.findMany.mockReset().mockResolvedValueOnce(Array.from({length:500},(_,i)=>({id:`i${i.toString().padStart(3,'0')}`,caseId:'c',inspectionDate:date}))).mockResolvedValueOnce([{id:'z',caseId:'c',inspectionDate:date}]);
  const result=await repo.snapshot(principal);expect(result.sources.inspections).toHaveLength(501);expect(result.coverage.historyTruncated).toBe(false);
  expect(tx.inspection.findMany.mock.calls[1][0].where.id).toEqual({gt:'i499'});
});
it('does not query related tables when authorized population is empty',async()=>{
  const {repo,tx}=setup({asset:[]});expect((await repo.snapshot(principal)).coverage.counts.assets).toBe(0);for(const name of names.slice(1)) expect(tx[name].findMany).not.toHaveBeenCalled();
});
it('selects no profiles, raw JSON, costs, URLs or narratives',async()=>{
  const {repo,tx}=setup();await repo.snapshot(principal);
  const keys=names.flatMap(name=>Object.keys(tx[name].findMany.mock.calls[0][0].select));
  for(const key of ['reporterName','reporterContact','inspectionNotes','description','referenceUrl','documentReference','measurementData','governedProvenance','resourceRequirements','estimatedCostMinor','passwordHash','name','email','reasons','requestedChanges']) expect(keys).not.toContain(key);
  expect(keys).toContain('completionSubmittedById');expect(keys).toContain('verifiedById');
});
it('has deterministic source ordering/fingerprint inputs and does not mutate source rows',async()=>{
  const rows=[caseRow('z'),caseRow('c')],before=JSON.stringify(rows);const one=await setup({case:rows}).repo.snapshot(principal);const two=await setup({case:[...rows].reverse()}).repo.snapshot(principal);
  expect(one).toEqual(two);expect(JSON.stringify(rows)).toBe(before);expect(one.sourceFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/);
});
it.each(['asset','case','executionEvidence','caseResourceEstimate'])('sanitizes %s failure without partial success',async name=>{
  const {repo,tx}=setup();tx[name].findMany.mockRejectedValue(new Error('private password database timeout'));await expect(repo.snapshot(principal)).rejects.toThrow('OUTCOME_SOURCE_UNAVAILABLE');
});
it('fails instead of returning truncated success at the total source safety limit',async()=>{
  const {repo,tx}=setup();let page=0;
  // Increment page per completed batch to exercise the real complete-traversal bound.
  tx.inspection.findMany.mockImplementation(()=>{const rows=Array.from({length:500},(_,i)=>({id:`i${String(page*500+i).padStart(7,'0')}`}));page++;return Promise.resolve(rows);});
  await expect(repo.snapshot(principal)).rejects.toMatchObject({code:'OUTCOME_SOURCE_LIMIT'});
});
