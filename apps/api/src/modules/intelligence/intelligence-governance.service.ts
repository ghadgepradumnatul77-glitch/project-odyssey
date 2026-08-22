import { createHash } from 'node:crypto';
import { Prisma, RegistryLifecycleStatus } from '../../generated/prisma';
import prisma from '../../lib/prisma';
import { OrganizationalPrincipal } from '../../security/organizational-scope';
import { resolveCasePolicy } from '../policy-registry/policy-registry.service';

export const INTELLIGENCE_GOVERNANCE_CONTRACT_VERSION='ODYSSEY_INTELLIGENCE_GOVERNANCE_V1';
type Suggestion={actionCode:string;rationale:string;modelRank?:number;resolution?:string};
type Rule=Awaited<ReturnType<typeof resolveCasePolicy>>['applicableRules'][number];
const canonical=(value:unknown):string=>Array.isArray(value)?`[${value.map(canonical).join(',')}]`:value&&typeof value==='object'?`{${Object.entries(value as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`:JSON.stringify(value);

export function reconcileIntelligenceActions(suggestions:Suggestion[],resolution:Awaited<ReturnType<typeof resolveCasePolicy>>,catalog:Array<{id:string;actionCode:string;versionNumber:number;status:RegistryLifecycleStatus;effectiveFrom:Date;effectiveUntil:Date|null;departmentId:string|null;jurisdictionId:string|null}>,scope:{departmentId:string;jurisdictionId:string},asOf:Date){
 const conflict=resolution.issues.some(i=>['CONFLICTING_ENFORCEMENT','MULTIPLE_ACTIVE_ACTION_VERSIONS'].includes(i.code));
 return suggestions.map(s=>{
  if(resolution.status==='ABSTAINED')return{...s,resolution:conflict?'GOVERNANCE_CONFLICT':'POLICY_ABSTAINED',policyIssues:resolution.issues};
  const matches=resolution.applicableRules.filter(r=>r.action.actionCode===s.actionCode);
  if(matches.length){const r=matches[0];return{...s,resolution:r.rule.enforcementLevel==='PROHIBITED'?'PROHIBITED':'APPROVED_ACTIVE',enforcementClassification:r.rule.enforcementLevel,approvedActionVersion:{id:r.action.id,actionCode:r.action.actionCode,versionNumber:r.action.versionNumber,title:r.action.title,category:r.action.category,sourceReference:r.action.sourceReference},policy:{id:r.policy.id,policyCode:r.policy.policyCode,versionNumber:r.policy.versionNumber},rule:{id:r.rule.id,ruleCode:r.rule.code}};}
  const versions=catalog.filter(a=>a.actionCode===s.actionCode).sort((a,b)=>b.versionNumber-a.versionNumber);if(!versions.length)return{...s,resolution:'UNKNOWN'};const a=versions[0];
  if(a.status!==RegistryLifecycleStatus.ACTIVE)return{...s,resolution:'INACTIVE',candidateActionVersion:{id:a.id,versionNumber:a.versionNumber}};
  if(a.effectiveFrom>asOf||(a.effectiveUntil&&a.effectiveUntil<=asOf))return{...s,resolution:'EXPIRED',candidateActionVersion:{id:a.id,versionNumber:a.versionNumber}};
  if((a.departmentId&&a.departmentId!==scope.departmentId)||(a.jurisdictionId&&a.jurisdictionId!==scope.jurisdictionId))return{...s,resolution:'OUT_OF_SCOPE',candidateActionVersion:{id:a.id,versionNumber:a.versionNumber}};
  return{...s,resolution:'UNKNOWN'};
 });
}

export async function reconcileIntelligenceAssessment(assessmentId:string,principal:OrganizationalPrincipal,asOf=new Date()){
 const assessment=await prisma.infrastructureIntelligenceAssessment.findUnique({where:{id:assessmentId},include:{case:{include:{asset:true}}}});if(!assessment)throw new Error('INTELLIGENCE_NOT_FOUND');
 const suggestions=Array.isArray(assessment.recommendedActions)?assessment.recommendedActions as unknown as Suggestion[]:[];const resolution=await resolveCasePolicy(assessment.caseId,principal,asOf);
 const catalog=await prisma.approvedActionVersion.findMany({where:{actionCode:{in:suggestions.map(s=>s.actionCode)}},select:{id:true,actionCode:true,versionNumber:true,status:true,effectiveFrom:true,effectiveUntil:true,departmentId:true,jurisdictionId:true}});
 const reconciledActions=reconcileIntelligenceActions(suggestions,resolution,catalog,{departmentId:assessment.case.asset.departmentId,jurisdictionId:assessment.case.asset.jurisdictionId},asOf);
 const policyMaterial=resolution.status==='RESOLVED'?resolution.applicableRules.map((r:Rule)=>({policyId:r.policy.id,policyVersion:r.policy.versionNumber,ruleId:r.rule.id,actionId:r.action.id,actionVersion:r.action.versionNumber,enforcement:r.rule.enforcementLevel})).sort((a,b)=>canonical(a).localeCompare(canonical(b))):resolution.issues.map(i=>({code:i.code,actionCode:i.actionCode??null,ruleCode:i.ruleCode??null}));
 const governanceFingerprint=createHash('sha256').update(canonical({assessmentId,departmentId:assessment.case.asset.departmentId,jurisdictionId:assessment.case.asset.jurisdictionId,contractVersion:INTELLIGENCE_GOVERNANCE_CONTRACT_VERSION,policyMaterial})).digest('hex');
 return prisma.infrastructureIntelligenceReconciliation.upsert({where:{governanceFingerprint},update:{},create:{intelligenceAssessmentId:assessmentId,caseId:assessment.caseId,contractVersion:INTELLIGENCE_GOVERNANCE_CONTRACT_VERSION,governanceFingerprint,policyResolutionStatus:resolution.status,policySnapshot:{status:resolution.status,asOf:resolution.asOf,applicableRules:resolution.applicableRules},reconciledActions:reconciledActions as unknown as Prisma.InputJsonValue,issues:resolution.issues,reconciledAt:asOf}});
}
