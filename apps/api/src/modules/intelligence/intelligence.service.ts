import { CaseStatus, IntelligenceAssessmentStatus, PriorityLevel, RiskLevel } from '../../generated/prisma';
import prisma from '../../lib/prisma';
import { assertOperationalCaseScope, assertVisibleCase, OrganizationalPrincipal } from '../../security/organizational-scope';
import { invokeIntelligenceProvider, REFERENCE_CONFIDENCE_SEMANTICS, REFERENCE_MODEL, REFERENCE_MODEL_VERSION, REFERENCE_PROVIDER, REFERENCE_PROVIDER_TYPE } from './intelligence.adapter';
import { buildIntelligenceFeatures, createIntelligenceSourceFingerprint, INTELLIGENCE_CONTRACT_VERSION, INTELLIGENCE_FEATURE_SCHEMA_VERSION, isIntelligenceAssessmentStale, reconcileSafetyFloor } from './intelligence.contracts';
import { appendIntelligenceAssessment, listIntelligenceAssessments } from './intelligence.repository';
import { reconcileIntelligenceAssessment } from './intelligence-governance.service';
import { RISK_ASSESSMENT_VERSION } from '../risk/risk.service';
import type { StableCursor } from '../../lib/pagination';

const noAdvisory=(risk:RiskLevel,priority:PriorityLevel)=>reconcileSafetyFloor({deterministicRisk:risk,deterministicPriority:priority});

async function authoritative(caseId:string,principal:OrganizationalPrincipal,mutation:boolean){
  const scoped=mutation?await assertOperationalCaseScope(caseId,principal):await assertVisibleCase(caseId,principal);
  const target=await prisma.case.findUnique({where:{id:scoped.id},include:{asset:true}});
  if(!target)throw new Error('CASE_NOT_FOUND');
  if(mutation&&target.status===CaseStatus.CLOSED)throw new Error('INVALID_CASE_STATE');
  const inspection=await prisma.inspection.findFirst({where:{caseId},orderBy:[{createdAt:'desc'},{id:'desc'}]});
  const assessment=await prisma.riskAssessment.findFirst({where:{caseId,assessmentVersion:RISK_ASSESSMENT_VERSION},orderBy:[{createdAt:'desc'},{id:'desc'}]});
  if(!inspection)throw new Error('NO_INSPECTION_FOUND'); if(!assessment)throw new Error('NO_RISK_ASSESSMENT_FOUND');
  if(assessment.inspectionId!==inspection.id)throw new Error('STALE_RISK_ASSESSMENT');
  return {target,inspection,assessment};
}

export async function requestCaseIntelligence(caseId:string,principal:OrganizationalPrincipal){
  const {target,inspection,assessment}=await authoritative(caseId,principal,true);
  const fingerprint=createIntelligenceSourceFingerprint({caseId,inspectionId:inspection.id,riskAssessmentId:assessment.id,featureSchemaVersion:INTELLIGENCE_FEATURE_SCHEMA_VERSION,provider:REFERENCE_PROVIDER,modelName:REFERENCE_MODEL,modelVersion:REFERENCE_MODEL_VERSION});
  const features=buildIntelligenceFeatures({caseId,inspectionId:inspection.id,riskAssessmentId:assessment.id,assetType:target.asset.assetType,emergencyFlag:target.emergencyFlag,structuralCondition:inspection.structuralCondition,crackSeverity:inspection.crackSeverity,corrosionLevel:inspection.corrosionLevel,trafficImportance:inspection.trafficImportance,hospitalRoute:inspection.hospitalRoute,weatherRisk:inspection.weatherRisk,heavyRainExpected:inspection.heavyRainExpected,estimatedDailyUsers:inspection.estimatedDailyUsers,deterministicRiskScore:assessment.riskScore,deterministicRiskLevel:assessment.riskLevel,deterministicPriorityLevel:assessment.priorityLevel,deterministicAssessmentVersion:assessment.assessmentVersion});
  const payload={contractVersion:INTELLIGENCE_CONTRACT_VERSION,sourceFingerprint:fingerprint,...features};
  const outcome=await invokeIntelligenceProvider(payload);
  if(outcome.kind!=='PROVIDER')return {id:null,persisted:false,status:outcome.kind,reasonCode:outcome.reasonCode,currentlyStale:false,reconciliation:noAdvisory(assessment.riskLevel,assessment.priorityLevel)};
  const value=outcome.data; const completed=value.status==='COMPLETED';
  const reconciliation=reconcileSafetyFloor({deterministicRisk:assessment.riskLevel,deterministicPriority:assessment.priorityLevel,advisoryRisk:completed?value.predictedRiskLevel:null,advisoryPriority:completed?value.recommendedPriority:null});
  const saved=await appendIntelligenceAssessment({caseId,inspectionId:inspection.id,riskAssessmentId:assessment.id,status:completed?IntelligenceAssessmentStatus.COMPLETED:IntelligenceAssessmentStatus.ABSTAINED,predictedRiskScore:completed?value.predictedRiskScore:null,predictedRiskLevel:completed?value.predictedRiskLevel:null,recommendedPriority:completed?value.recommendedPriority:null,confidence:completed?value.confidence:null,provider:value.provenance.provider,providerType:value.provenance.providerType,modelName:value.provenance.modelName,modelVersion:value.provenance.modelVersion,modelArtifactDigest:value.provenance.modelArtifactDigest??null,featureSchemaVersion:value.provenance.featureSchemaVersion,contractVersion:value.provenance.contractVersion,sourceFingerprint:fingerprint,inferredAt:new Date(value.provenance.inferredAt),contributingFactors:value.contributingFactors,explanation:value.explanation,recommendedActions:value.recommendedActions.map(item=>({...item,resolution:'UNRESOLVED'})),abstentionReasons:value.abstentionReasons,reconciliation});
  const governanceReconciliation=completed?await reconcileIntelligenceAssessment(saved.id,principal):null;
  return {...saved,persisted:true,currentlyStale:false,confidenceSemantics:completed?REFERENCE_CONFIDENCE_SEMANTICS:null,productionTrained:false,governanceReconciliation};
}

export async function getCaseIntelligenceHistory(caseId:string,principal:OrganizationalPrincipal,options:{limit:number;cursor?:StableCursor}={limit:25}){
  const {inspection,assessment}=await authoritative(caseId,principal,false); const page=await listIntelligenceAssessments(caseId,options); const now=new Date();
  const reconciliations=await prisma.infrastructureIntelligenceReconciliation.findMany({where:{intelligenceAssessmentId:{in:page.items.map(r=>r.id)}},orderBy:[{reconciledAt:'desc'},{id:'desc'}],take:100});
  const items=page.items.map(row=>{
    const currentlyStale=isIntelligenceAssessmentStale({sourceInspectionId:row.inspectionId,sourceRiskAssessmentId:row.riskAssessmentId,currentInspectionId:inspection.id,currentRiskAssessmentId:assessment.id,expiresAt:row.expiresAt,now});
    return {...row,currentlyStale,confidenceSemantics:row.status===IntelligenceAssessmentStatus.COMPLETED?REFERENCE_CONFIDENCE_SEMANTICS:null,productionTrained:false,governanceReconciliations:reconciliations.filter(r=>r.intelligenceAssessmentId===row.id).map((r,index)=>({...r,governanceFingerprint:undefined,currentlyStale:currentlyStale||index>0}))};
  });
  return {...page,items};
}
