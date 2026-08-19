import { Prisma, PublicReportCategory, PublicReportTriageUrgency } from '../../generated/prisma';
import prisma from '../../lib/prisma';
import type { OrganizationalPrincipal } from '../../security/organizational-scope';
import { buildAssetReadWhere } from '../../security/organizational-scope';
import { buildPublicReportReadWhere, PublicReportNotFoundError } from './public-report.service';

export const TRIAGE_ANALYSIS_VERSION = 'JANSEVA_TRIAGE_V1';
export class PublicReportAnalysisNotFoundError extends Error {}

type ReportInput={id:string;reportNumber:string;title:string;description:string;category:PublicReportCategory;locationText:string;submittedAt:Date;status:string;assetId:string|null};
type AssetInput={id:string;assetCode:string;name:string;assetType:string};
type CandidateInput={id:string;reportNumber:string;title:string;category:PublicReportCategory;locationText:string;submittedAt:Date;status:string;assetId:string|null};
type Reason={reasonCode:string;message:string};
type DuplicateCandidate={publicReportId:string;reportNumber:string;title:string;category:PublicReportCategory;locationText:string;status:string;submittedAt:Date;similarityReason:string};

const categorySignals:Array<{category:PublicReportCategory;terms:string[]}>= [
  {category:'BRIDGE_OR_FLYOVER',terms:['bridge','flyover','overpass','structural','crack','cracking']},
  {category:'WATERLOGGING',terms:['waterlogging','waterlogged','flood','flooding','standing water','underpass']},
  {category:'STREETLIGHT',terms:['streetlight','street light','lamp post','lighting','electrical']},
  {category:'DRAINAGE',terms:['drain','drainage','sewer','overflow','blocked drain']},
  {category:'ROAD_DAMAGE',terms:['pothole','road surface','carriageway','pavement','road damage']},
  {category:'PUBLIC_BUILDING',terms:['public building','municipal building','plaster','government building']}
];
const stopWords=new Set(['the','and','near','with','from','this','that','public','road','issue','pune','reported','report']);
function normalized(value:string){return value.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
function tokens(value:string){return new Set(normalized(value).split(/\s+/).filter((token)=>token.length>2&&!stopWords.has(token)));}
function overlap(a:Set<string>,b:Set<string>){if(!a.size||!b.size)return 0;let common=0;for(const item of a)if(b.has(item))common++;return common/Math.min(a.size,b.size);}
function has(text:string,terms:string[]){return terms.some((term)=>text.includes(term));}

export function calculatePublicReportTriage(report:ReportInput,assets:AssetInput[],candidates:CandidateInput[]){
  const text=normalized(`${report.title} ${report.description} ${report.locationText}`);const reasons:Reason[]=[];const add=(reasonCode:string,message:string)=>{if(!reasons.some((item)=>item.reasonCode===reasonCode))reasons.push({reasonCode,message});};
  let suggestedCategory=report.category;let bestScore=0;
  for(const signal of categorySignals){const score=signal.terms.filter((term)=>text.includes(term)).length;if(score>bestScore){bestScore=score;suggestedCategory=signal.category;}}
  if(bestScore){add('TRIAGE_CATEGORY_LANGUAGE',suggestedCategory===report.category?'Report language supports the citizen-selected infrastructure category.':'Report language suggests a different infrastructure category for officer review.');}
  else add('TRIAGE_CITIZEN_CATEGORY_ONLY','No stronger category signal was identified; the citizen-selected category remains the advisory suggestion.');

  let urgencyLevel:PublicReportTriageUrgency='LOW';
  if(has(text,['collapse','collapsed','structural failure','exposed wire','exposed electrical','immediate danger'])){urgencyLevel='URGENT';add('TRIAGE_IMMEDIATE_SAFETY_LANGUAGE','Report contains language indicating a possible immediate safety concern requiring prompt verification.');}
  else if(has(text,['major crack','severe crack','flooding','blocked drainage','blocked drain','road obstruction','danger to traffic','hospital access'])){urgencyLevel='HIGH';add('TRIAGE_ELEVATED_SAFETY_LANGUAGE','Report contains an elevated access, obstruction, flooding, or structural indicator.');}
  else if(has(text,['waterlogging','waterlogged','pothole','deterioration','streetlight','street light','drainage','overflow','crack'])){urgencyLevel='MODERATE';add('TRIAGE_SERVICE_DISRUPTION_LANGUAGE','Report describes deterioration or a public-service disruption that warrants government review.');}
  else add('TRIAGE_NO_ELEVATED_LANGUAGE','No explicit elevated urgency indicator was identified in the submitted text.');
  if(has(text,['bridge','flyover','structural','crack']))add('TRIAGE_STRUCTURAL_LANGUAGE','Report mentions bridge, flyover, cracking, or structural deterioration language.');
  if(has(text,['waterlogging','waterlogged','flood','flooding','standing water']))add('TRIAGE_WATERLOGGING_LANGUAGE','Report describes water accumulation or flooding.');
  if(has(text,['streetlight','street light','electrical','exposed wire']))add('TRIAGE_ELECTRICAL_LANGUAGE','Report describes public-lighting or electrical infrastructure.');

  const compatible=(asset:AssetInput)=>suggestedCategory==='BRIDGE_OR_FLYOVER'?['BRIDGE','FLYOVER'].includes(asset.assetType):['ROAD_DAMAGE','DRAINAGE','WATERLOGGING'].includes(suggestedCategory)?asset.assetType==='ROAD':true;
  const reportTokens=tokens(`${report.title} ${report.locationText}`);let possibleAsset:AssetInput|null=null;let assetScore=0;
  for(const asset of assets){if(!compatible(asset))continue;const score=(text.includes(normalized(asset.assetCode))?4:0)+(text.includes(normalized(asset.name))?5:0)+Math.round(overlap(reportTokens,tokens(asset.name))*4);if(score>assetScore){assetScore=score;possibleAsset=asset;}}
  if(possibleAsset&&assetScore>=2)add('TRIAGE_POSSIBLE_ASSET_MATCH','An existing infrastructure record has compatible identity or location language.');else possibleAsset=null;

  const duplicateCandidates:DuplicateCandidate[]=candidates.map((candidate)=>{const sameAsset=Boolean(report.assetId&&candidate.assetId===report.assetId);const location=overlap(tokens(report.locationText),tokens(candidate.locationText));const title=overlap(tokens(report.title),tokens(candidate.title));const sameCategory=candidate.category===suggestedCategory;let similarityReason='';if(sameAsset)similarityReason='Both reports reference the same linked infrastructure.';else if(sameCategory&&location>=.5)similarityReason='Category and reported location are similar.';else if(sameCategory&&title>=.5)similarityReason='Category and issue wording are similar.';return similarityReason?{publicReportId:candidate.id,reportNumber:candidate.reportNumber,title:candidate.title,category:candidate.category,locationText:candidate.locationText,status:candidate.status,submittedAt:candidate.submittedAt,similarityReason}:null;}).filter((item):item is DuplicateCandidate=>item!==null).slice(0,5);
  if(duplicateCandidates.length)add('TRIAGE_POSSIBLE_DUPLICATE','One or more privacy-safe reports have similar category, location, asset, or issue wording.');
  const confidence=Math.min(95,45+(bestScore?20:0)+(suggestedCategory===report.category?10:0)+(urgencyLevel!=='LOW'?10:0)+(possibleAsset?10:0));
  return{analysisVersion:TRIAGE_ANALYSIS_VERSION,suggestedCategory,urgencyLevel,confidence,reasonCodes:reasons.map((item)=>item.reasonCode),reasons,possibleAsset,duplicateCandidates};
}

const analysisSelect={id:true,publicReportId:true,analysisVersion:true,suggestedCategory:true,urgencyLevel:true,confidence:true,reasonCodes:true,reasons:true,duplicateCandidates:true,createdAt:true,possibleAsset:{select:{id:true,assetCode:true,name:true,assetType:true}}} satisfies Prisma.PublicReportTriageAnalysisSelect;
export async function getPublicReportAnalysis(publicReportId:string,principal:OrganizationalPrincipal){const analysis=await prisma.publicReportTriageAnalysis.findFirst({where:{publicReportId,publicReport:{AND:[buildPublicReportReadWhere(principal)]}},select:analysisSelect,orderBy:{createdAt:'desc'}});if(!analysis)throw new PublicReportAnalysisNotFoundError();return analysis;}
export async function analyzePublicReport(publicReportId:string,principal:OrganizationalPrincipal){
  const existing=await prisma.publicReportTriageAnalysis.findUnique({where:{publicReportId_analysisVersion:{publicReportId,analysisVersion:TRIAGE_ANALYSIS_VERSION}},select:analysisSelect});if(existing)return existing;
  const report=await prisma.publicReport.findFirst({where:{id:publicReportId,AND:[buildPublicReportReadWhere(principal)]},select:{id:true,reportNumber:true,title:true,description:true,category:true,locationText:true,submittedAt:true,status:true,assetId:true}});if(!report)throw new PublicReportNotFoundError();
  const [assets,candidates]=await Promise.all([prisma.asset.findMany({where:buildAssetReadWhere(principal),select:{id:true,assetCode:true,name:true,assetType:true}}),prisma.publicReport.findMany({where:{id:{not:publicReportId},AND:[buildPublicReportReadWhere(principal)],submittedAt:{gte:new Date(report.submittedAt.getTime()-90*86400000)}},select:{id:true,reportNumber:true,title:true,category:true,locationText:true,submittedAt:true,status:true,assetId:true},orderBy:{submittedAt:'desc'}})]);
  const result=calculatePublicReportTriage(report,assets,candidates);
  try{return await prisma.publicReportTriageAnalysis.create({data:{publicReportId,analysisVersion:result.analysisVersion,suggestedCategory:result.suggestedCategory,urgencyLevel:result.urgencyLevel,confidence:result.confidence,reasonCodes:result.reasonCodes,reasons:result.reasons,possibleAssetId:result.possibleAsset?.id,duplicateCandidates:result.duplicateCandidates,createdById:principal.id},select:analysisSelect});}catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==='P2002')return getPublicReportAnalysis(publicReportId,principal);throw error;}
}
