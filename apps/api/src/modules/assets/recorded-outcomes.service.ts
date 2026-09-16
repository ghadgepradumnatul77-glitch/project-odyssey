import { z } from 'zod';
import { createHash } from 'node:crypto';
import { createRecordedOutcomesRepository, OutcomeRepositoryError } from './recorded-outcomes.repository';
import { recordedConditionChange, recordedRiskChange, recordedTaskCoverage, recordedClosureConsistency, recordedElapsedTime, subsequentRecordedCases, estimateRecordedDuration, gateRecordedMetric, summarizeRecordedMetrics } from './recorded-outcomes.calculations';
import { OUTCOME_CONTRACT_VERSION, OUTCOME_CALCULATION_VERSION, type OutcomePair, type OutcomeMetric, type OutcomeContext } from './recorded-outcomes.contracts';
import { timestamp } from './asset-evidence-baseline.calculations';
import type { OrganizationalPrincipal } from '../../security/organizational-scope';

const querySchema = z.object({ windowStart:z.string().optional(),windowEnd:z.string().optional(),beforeInspectionId:z.string().uuid().optional(),afterInspectionId:z.string().uuid().optional(),beforeAssessmentId:z.string().uuid().optional(),afterAssessmentId:z.string().uuid().optional() }).strict();
type Snapshot = Awaited<ReturnType<ReturnType<typeof createRecordedOutcomesRepository>['snapshot']>>;
type Sources = Snapshot['sources'];
export class RecordedOutcomeServiceError extends Error { constructor(public readonly code:string,public readonly status:number) { super(code); } }
const invalid = () => new RecordedOutcomeServiceError('INVALID_OUTCOME_QUERY',400);
function group<T>(rows:T[], key:(row:T)=>string) { const map=new Map<string,T[]>();for(const row of rows) { const k=key(row);const bucket=map.get(k);if(bucket) bucket.push(row);else map.set(k,[row]); }return map; }
const stamp = (v:string) => { const result=timestamp(v);if(result.state!=='PRESENT') throw invalid();return result.value; };
function project(e:Snapshot,q:z.infer<typeof querySchema>,assetId?:string) {
  const s=e.sources;
  const ctx:OutcomeContext={asOf:e.asOf,cohortId:assetId?`ASSET:${assetId}`:'AUTHORIZED_ASSETS',window:{start:q.windowStart??'1970-01-01T00:00:00.000Z',end:q.windowEnd??e.asOf}};
  if(stamp(ctx.window.start)>stamp(ctx.window.end)||stamp(ctx.window.end)>stamp(ctx.asOf)) throw invalid();
  const cases=group(s.cases,c=>c.assetId),inspections=group(s.inspections,i=>i.caseId),assessments=group(s.assessments,a=>a.inspectionId),plans=group(s.plans,p=>p.caseId),tasks=group(s.tasks,t=>t.executionPlanId),evidence=group(s.evidence,e=>e.executionTaskId),closures=group(s.closures,c=>c.caseId),estimates=group(s.estimates,e=>e.caseId);
  const planById=new Map(s.plans.map(p=>[p.id,p]));
  const before=q.beforeInspectionId?s.inspections.find(i=>i.id===q.beforeInspectionId):undefined;
  const after=q.afterInspectionId?s.inspections.find(i=>i.id===q.afterInspectionId):undefined;
  if(q.beforeInspectionId&&(!before||!after||before.caseId!==after.caseId)) throw new RecordedOutcomeServiceError('OUTCOME_SOURCE_NOT_FOUND',404);
  if(q.beforeAssessmentId&&!s.assessments.some(a=>a.id===q.beforeAssessmentId&&a.inspectionId===before?.id)) throw new RecordedOutcomeServiceError('OUTCOME_SOURCE_NOT_FOUND',404);
  if(q.afterAssessmentId&&!s.assessments.some(a=>a.id===q.afterAssessmentId&&a.inspectionId===after?.id)) throw new RecordedOutcomeServiceError('OUTCOME_SOURCE_NOT_FOUND',404);
  const all:Record<string,OutcomeMetric<unknown>[]> = Object.fromEntries(['structuralCondition','crackSeverity','corrosionLevel','riskChange','closure','creationToClosure','subsequentCaseActivity','executionProgress','verificationCoverage','evidenceCoverage','startToSubmission','submissionToVerification','estimateDuration'].map(key=>[key,[]]));
  function add<T extends OutcomeMetric<unknown>>(key:string,value:T):T { (all[key]??=[]).push(value);return value; }
  const items=s.assets.map(asset=>({assetId:asset.id,cases:(cases.get(asset.id)??[]).map(c=>{
    const candidates=inspections.get(c.id)??[];
    const selected=before?.caseId===c.id&&after?.caseId===c.id;
    const inspection=(i:Sources['inspections'][number])=>({id:i.id,assetId:asset.id,caseId:i.caseId,observedAt:i.inspectionDate,structuralCondition:i.structuralCondition,crackSeverity:i.crackSeverity,corrosionLevel:i.corrosionLevel});
    const pair:OutcomePair={selection:selected?'EXPLICIT':candidates.length>1?'AMBIGUOUS':'EXPLICIT',before:selected?inspection(before!):null,after:selected?inspection(after!):null};
    const condition=recordedConditionChange(pair,ctx);
    for(const key of ['structuralCondition','crackSeverity','corrosionLevel'] as const) add(key,condition[key]);
    const br=selected?assessments.get(before!.id)??[]:[], ar=selected?assessments.get(after!.id)??[]:[];
    const b=q.beforeAssessmentId?br.find(a=>a.id===q.beforeAssessmentId):br.length===1?br[0]:undefined;
    const a=q.afterAssessmentId?ar.find(a=>a.id===q.afterAssessmentId):ar.length===1?ar[0]:undefined;
    const assessment=(r:Sources['assessments'][number]|undefined)=>r?{id:r.id,inspectionId:r.inspectionId,caseId:r.caseId,recordedAt:r.createdAt,version:r.assessmentVersion,score:r.riskScore,riskLevel:r.riskLevel,priorityLevel:r.priorityLevel}:null;
    const risk=add('riskChange',recordedRiskChange((br.length>1&&!q.beforeAssessmentId)||(ar.length>1&&!q.afterAssessmentId)?{...pair,selection:'AMBIGUOUS'}:pair,assessment(b),assessment(a),ctx));
    const closure=(closures.get(c.id)??[])[0];const closedPlan=closure?planById.get(closure.executionPlanId):undefined;
    const closureMetric=add('closure',recordedClosureConsistency({caseId:c.id,caseStatus:c.status,caseCreatedAt:c.createdAt,closedAt:c.closedAt,record:closure?{id:closure.id,caseId:closure.caseId,planId:closure.executionPlanId,recordedAt:closure.createdAt,reason:closure.closureReason}:null,plan:closedPlan?{id:closedPlan.id,caseId:closedPlan.caseId,status:closedPlan.status,completedAt:closedPlan.completedAt}:null},ctx));
    const elapsed=add('creationToClosure',gateRecordedMetric(recordedElapsedTime(c.id,c.createdAt,c.closedAt,'CASE_CREATION_TO_CLOSURE',ctx),closureMetric));
    const laterContext={...ctx,window:{start:q.windowStart??c.closedAt??ctx.window.start,end:ctx.window.end}};
    const later=add('subsequentCaseActivity',gateRecordedMetric(subsequentRecordedCases({assetId:asset.id,closedCaseId:c.id,closedAt:c.closedAt,complete:true,cases:(cases.get(asset.id)??[]).map(row=>({id:row.id,assetId:row.assetId,createdAt:row.createdAt}))},laterContext),closureMetric));
    return {caseId:c.id,recordedStatus:c.status,conditionChange:condition,riskChange:risk,closure:closureMetric,creationToClosure:elapsed,subsequentCaseActivity:later,
      inspectionCandidates:candidates.map(i=>({id:i.id,observedAt:i.inspectionDate,assessmentIds:(assessments.get(i.id)??[]).map(r=>r.id)})),
      plans:(plans.get(c.id)??[]).map(p=>{
        const rows=(tasks.get(p.id)??[]).map(t=>({id:t.id,planId:t.executionPlanId,templateVersion:p.executionContractVersion??p.templateVersion,status:t.status,mandatory:t.isMandatory,verificationRequired:t.verificationRequired,evidenceRequired:t.evidenceRequired,assignedToId:t.assignedToId,submittedById:t.completionSubmittedById,verifiedById:t.verifiedById,startedAt:t.startedAt,submittedAt:t.completionSubmittedAt,verifiedAt:t.verifiedAt,evidence:(evidence.get(t.id)??[]).map(ev=>({id:ev.id,taskId:ev.executionTaskId,submittedAt:ev.submittedAt}))}));
        const population={planId:p.id,complete:true,tasks:rows};
        return {planId:p.id,recordedStatus:p.status,executionProgress:add('executionProgress',recordedTaskCoverage(population,'EXECUTION',ctx)),verificationCoverage:add('verificationCoverage',recordedTaskCoverage(population,'VERIFICATION',ctx)),evidenceCoverage:add('evidenceCoverage',recordedTaskCoverage(population,'EVIDENCE',ctx)),
          tasks:rows.map(t=>{const consistency=recordedTaskCoverage({planId:p.id,complete:true,tasks:[{...t,mandatory:true}]},'EXECUTION',ctx);return {taskId:t.id,recordedStatus:t.status,startToSubmission:add('startToSubmission',gateRecordedMetric(recordedElapsedTime(t.id,t.startedAt,t.submittedAt,'TASK_START_TO_SUBMISSION',ctx),consistency)),submissionToVerification:add('submissionToVerification',gateRecordedMetric(recordedElapsedTime(t.id,t.submittedAt,t.verifiedAt,'SUBMISSION_TO_VERIFICATION',ctx),consistency))};}),
          // Case association alone never establishes same-work linkage.
          estimateDuration:add('estimateDuration',estimateRecordedDuration({caseId:c.id,linkage:'AMBIGUOUS',estimate:null,plan:{id:p.id,caseId:p.caseId,templateVersion:p.templateVersion,startedAt:p.startedAt,completedAt:p.completedAt}},ctx)),
          estimateReferences:(estimates.get(c.id)??[]).map(e=>({id:e.id,version:e.estimateVersion,status:e.status,durationDays:e.estimatedDurationDays}))};
      })};
  })}));
  const summary=Object.fromEntries(Object.entries(all).map(([key,metrics])=>[key,summarizeRecordedMetrics(metrics,key,ctx)]));
  return {contractVersion:OUTCOME_CONTRACT_VERSION,calculationVersion:OUTCOME_CALCULATION_VERSION,context:ctx,sourceFingerprint:e.sourceFingerprint,
    resultFingerprint:'sha256:'+createHash('sha256').update(JSON.stringify({ctx,items,summary})).digest('hex'),coverage:e.coverage,items,summary,
    authority:{descriptiveOnly:true,establishesCausation:false,mutatesWorkflow:false},
    disclosures:['Current recorded cohort; window bounds inspection comparisons and subsequent Case activity, not historical status reconstruction.','Inspection pairs require explicit IDs; multiple assessment candidates also require explicit IDs.','Recorded closure does not establish physical improvement. Evidence presence does not establish quality.','No persisted estimate-to-execution same-work linkage exists; duration comparison remains NOT_COMPARABLE.']};
}
export function createRecordedOutcomesService(repository=createRecordedOutcomesRepository()) {
  async function run(principal:OrganizationalPrincipal,query:unknown,assetId?:string) {
    if(!principal||principal.status!=='ACTIVE') throw new RecordedOutcomeServiceError('FORBIDDEN',403);
    const parsed=querySchema.safeParse(query);if(!parsed.success) throw invalid();const q=parsed.data;
    if(assetId&&!z.string().uuid().safeParse(assetId).success) throw invalid();
    if(Boolean(q.beforeInspectionId)!==Boolean(q.afterInspectionId)||((q.beforeAssessmentId||q.afterAssessmentId)&&!q.beforeInspectionId)||(!assetId&&(q.beforeInspectionId||q.beforeAssessmentId||q.afterAssessmentId))) throw invalid();
    for(const t of [q.windowStart,q.windowEnd]) if(t!==undefined) stamp(t);
    try { const snapshot=await repository.snapshot(principal,assetId?{assetId}:{});if(!snapshot.complete) throw new Error();return project(snapshot,q,assetId); }
    catch(error) {if(error instanceof RecordedOutcomeServiceError) throw error;if(error instanceof OutcomeRepositoryError&&error.code==='ASSET_NOT_FOUND') throw new RecordedOutcomeServiceError('ASSET_NOT_FOUND',404);throw new RecordedOutcomeServiceError('OUTCOMES_UNAVAILABLE',503);}
  }
  return {detail:(principal:OrganizationalPrincipal,assetId:string,query:unknown={})=>run(principal,query,assetId),
    summary:async(principal:OrganizationalPrincipal,query:unknown={})=>{const {items,...result}=await run(principal,query);return result;}};
}
