import { Prisma, SystemRole } from '../../generated/prisma';
import prisma from '../../lib/prisma';
import { randomBytes } from 'node:crypto';
import type { OrganizationalPrincipal } from '../../security/organizational-scope';
import { pageFromRows, type StableCursor } from '../../lib/pagination';

export class PublicReportNotFoundError extends Error {}
export class PublicReportConflictError extends Error {}
export class PublicReportValidationError extends Error {}

const organizationSelect = { id: true, name: true } as const;
const assetSelect = { id: true, assetCode: true, name: true, assetType: true } as const;
const publicReportListSelect = {
  id: true, reportNumber: true, title: true, category: true, status: true,
  locationText: true, submittedAt: true, latitude: true, longitude: true,
  department: { select: organizationSelect }, jurisdiction: { select: organizationSelect },
  asset: { select: assetSelect },
  createdCase: { select: { id: true, caseNumber: true, status: true } },
  triageAnalyses: {
    orderBy: { createdAt: 'desc' as const }, take: 1,
    select: { suggestedCategory: true, urgencyLevel: true, confidence: true, reasons: true }
  }
} satisfies Prisma.PublicReportSelect;
const publicReportDetailSelect = {
  ...publicReportListSelect, description: true, latitude: true, longitude: true,
  createdAt: true, updatedAt: true, reviewStartedAt:true, decisionAt:true, rejectionReason:true,
  createdCase:{select:{id:true,caseNumber:true,status:true}}
} satisfies Prisma.PublicReportSelect;

export function buildPublicReportReadWhere(principal: OrganizationalPrincipal): Prisma.PublicReportWhereInput {
  if (principal.role === SystemRole.SYSTEM_ADMIN) return {};
  return {
    OR: [
      { departmentId: principal.departmentId, jurisdictionId: principal.jurisdictionId },
      { departmentId: null, jurisdictionId: principal.jurisdictionId }
    ]
  };
}

export async function listPublicReports(principal: OrganizationalPrincipal, options: { limit: number; cursor?: StableCursor; search?: string; status?: Prisma.PublicReportWhereInput['status']; category?: Prisma.PublicReportWhereInput['category']; jurisdictionId?: string; map?: boolean } = {limit:25}) {
  const reports = await prisma.publicReport.findMany({
    where: { AND: [buildPublicReportReadWhere(principal), options.cursor ? { OR: [{ submittedAt: { lt: new Date(options.cursor.at) } }, { submittedAt: new Date(options.cursor.at), id: { lt: options.cursor.id } }] } : {}],
      ...(options.status ? { status: options.status } : {}),
      ...(options.category ? { category: options.category } : {}),
      ...(options.jurisdictionId ? { jurisdictionId: options.jurisdictionId } : {}),
      ...(options.search ? { OR: [{ reportNumber: { contains: options.search, mode: 'insensitive' } }, { title: { contains: options.search, mode: 'insensitive' } }, { locationText: { contains: options.search, mode: 'insensitive' } }] } : {}) },
    select: publicReportListSelect,
    orderBy: [{ submittedAt: 'desc' }, { id: 'desc' }], take: options.limit + 1
  });
  const rows = reports.map(({ triageAnalyses, ...report }) => ({
    ...report,
    latitude: report.latitude === null ? null : Number(report.latitude),
    longitude: report.longitude === null ? null : Number(report.longitude),
    triageAnalysis: triageAnalyses[0] ?? null
  }));
  return pageFromRows(rows, options.limit, (item) => item.submittedAt.toISOString(), options.map ? { truncated: rows.length > options.limit } : {});
}

export async function getPublicReport(reportId: string, principal: OrganizationalPrincipal) {
  const report = await prisma.publicReport.findFirst({
    where: { id: reportId, AND: [buildPublicReportReadWhere(principal)] },
    select: publicReportDetailSelect
  });
  if (!report) throw new PublicReportNotFoundError('Public report not found.');
  return {
    ...report,
    latitude: report.latitude === null ? null : Number(report.latitude),
    longitude: report.longitude === null ? null : Number(report.longitude)
  };
}

export interface CitizenReportInput { title:string;description:string;category:Prisma.PublicReportCreateInput['category'];locationText:string;latitude?:number;longitude?:number;reporterName?:string;reporterContact?:string; }
export async function createCitizenPublicReport(input:CitizenReportInput){
  for(let attempt=0;attempt<3;attempt++){
    const date=new Date().toISOString().slice(0,10).replaceAll('-','');
    const reportNumber=`JNV-PUB-${date}-${randomBytes(3).toString('hex').toUpperCase()}`;
    try{const created=await prisma.publicReport.create({data:{reportNumber,title:input.title,description:input.description,category:input.category,locationText:input.locationText,latitude:input.latitude,longitude:input.longitude,reporterName:input.reporterName,reporterContact:input.reporterContact,status:'SUBMITTED'},select:{reportNumber:true,status:true,submittedAt:true}});return created;}catch(error){if(!(error instanceof Prisma.PrismaClientKnownRequestError)||error.code!=='P2002'||attempt===2)throw error;}
  }
  throw new Error('REPORT_NUMBER_GENERATION_FAILED');
}

function mutationWhere(id:string,principal:OrganizationalPrincipal):Prisma.PublicReportWhereInput{return principal.role===SystemRole.SYSTEM_ADMIN?{id}:{id,departmentId:principal.departmentId,jurisdictionId:principal.jurisdictionId};}
export async function beginPublicReportReview(id:string,principal:OrganizationalPrincipal){const result=await prisma.publicReport.updateMany({where:{...mutationWhere(id,principal),status:'SUBMITTED'},data:{status:'UNDER_REVIEW',reviewStartedAt:new Date(),reviewedById:principal.id}});if(!result.count)throw new PublicReportConflictError('Report cannot enter review.');return getPublicReport(id,principal);}
export async function routePublicReport(id:string,input:{departmentId:string;jurisdictionId:string;assetId?:string|null},principal:OrganizationalPrincipal){
 const report=await prisma.publicReport.findFirst({where:{...mutationWhere(id,principal),status:'UNDER_REVIEW'}});if(!report)throw new PublicReportConflictError('Report is not available for routing.');
 const jurisdiction=await prisma.jurisdiction.findFirst({where:{id:input.jurisdictionId,departmentId:input.departmentId}});if(!jurisdiction)throw new PublicReportValidationError('Department and jurisdiction are incompatible.');
 if(principal.role!==SystemRole.SYSTEM_ADMIN&&(input.departmentId!==principal.departmentId||input.jurisdictionId!==principal.jurisdictionId))throw new PublicReportNotFoundError();
 if(input.assetId){const asset=await prisma.asset.findFirst({where:{id:input.assetId,departmentId:input.departmentId,jurisdictionId:input.jurisdictionId}});if(!asset)throw new PublicReportValidationError('Asset is incompatible with routing.');}
 await prisma.publicReport.update({where:{id},data:{departmentId:input.departmentId,jurisdictionId:input.jurisdictionId,assetId:input.assetId??null}});return getPublicReport(id,principal);
}
export async function rejectPublicReport(id:string,reason:string,principal:OrganizationalPrincipal){const result=await prisma.publicReport.updateMany({where:{...mutationWhere(id,principal),status:'UNDER_REVIEW',createdCaseId:null},data:{status:'REJECTED',rejectionReason:reason,decisionAt:new Date(),decisionById:principal.id}});if(!result.count)throw new PublicReportConflictError('Report cannot be rejected.');return getPublicReport(id,principal);}
export async function acceptPublicReportAsCase(id:string,summary:string,principal:OrganizationalPrincipal){try{return await prisma.$transaction(async(tx)=>{
 const report=await tx.publicReport.findFirst({where:{...mutationWhere(id,principal),status:'UNDER_REVIEW',createdCaseId:null},include:{asset:true}});if(!report)throw new PublicReportConflictError('Report cannot be converted.');if(!report.departmentId||!report.jurisdictionId||!report.asset||report.asset.departmentId!==report.departmentId||report.asset.jurisdictionId!==report.jurisdictionId)throw new PublicReportValidationError('Link a compatible infrastructure asset before creating a governed case.');
 const date=new Date().toISOString().slice(2,10).replaceAll('-','');const caseNumber=`CASE-PUB-${date}-${randomBytes(3).toString('hex').toUpperCase()}`;
 const created=await tx.case.create({data:{caseNumber,assetId:report.asset.id,title:report.title.trim().slice(0,200),description:summary,status:'NEW',emergencyFlag:false},select:{id:true,caseNumber:true,status:true}});
 const updated=await tx.publicReport.updateMany({where:{id,status:'UNDER_REVIEW',createdCaseId:null},data:{status:'ACCEPTED',createdCaseId:created.id,decisionAt:new Date(),decisionById:principal.id}});if(updated.count!==1)throw new PublicReportConflictError('Report was converted concurrently.');return created;
 },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});}catch(error){if(error instanceof PublicReportConflictError)throw error;if(error instanceof Prisma.PrismaClientKnownRequestError&&(error.code==='P2002'||error.code==='P2034'))throw new PublicReportConflictError('Report conversion conflicted with another request.');throw error;}}
