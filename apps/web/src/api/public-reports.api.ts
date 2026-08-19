import { apiRequest } from './client';

export type PublicReportStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';
export type PublicReportCategory = 'ROAD_DAMAGE' | 'BRIDGE_OR_FLYOVER' | 'WATERLOGGING' | 'STREETLIGHT' | 'DRAINAGE' | 'PUBLIC_BUILDING' | 'OTHER';
export interface PublicReportOrganization { id: string; name: string; }
export interface PublicReportAsset { id: string; assetCode: string; name: string; assetType: string; }
export interface PublicReportSummary {
  id: string; reportNumber: string; title: string; category: PublicReportCategory; status: PublicReportStatus;
  locationText: string; submittedAt: string; department: PublicReportOrganization | null;
  jurisdiction: PublicReportOrganization | null; asset: PublicReportAsset | null;
  latitude: number | null; longitude: number | null;
  createdCase: { id: string; caseNumber: string; status: string } | null;
  triageAnalysis: { suggestedCategory: PublicReportCategory; urgencyLevel: 'LOW'|'MODERATE'|'HIGH'|'URGENT'; confidence: number; reasons: TriageReason[] } | null;
}
export interface PublicReportDetail extends PublicReportSummary {
  description: string; latitude: number | null; longitude: number | null; createdAt: string; updatedAt: string;
  reviewStartedAt: string | null; decisionAt: string | null; rejectionReason: string | null;
  createdCase: { id: string; caseNumber: string; status: string } | null;
}
export function listPublicReports(accessToken: string, signal?: AbortSignal) { return apiRequest<PublicReportSummary[]>('/public-reports', { accessToken, signal }); }
export function getPublicReport(reportId: string, accessToken: string, signal?: AbortSignal) { return apiRequest<PublicReportDetail>(`/public-reports/${encodeURIComponent(reportId)}`, { accessToken, signal }); }
export interface CitizenReportInput {title:string;description:string;category:PublicReportCategory;locationText:string;latitude?:number;longitude?:number;reporterName?:string;reporterContact?:string;}
export interface CitizenReportReceipt {reportNumber:string;status:'SUBMITTED';submittedAt:string;}
export function submitPublicReport(input:CitizenReportInput){return apiRequest<CitizenReportReceipt>('/public-reports',{method:'POST',body:input});}
export type PublicProgressStage='REPORT_RECEIVED'|'UNDER_GOVERNMENT_REVIEW'|'CLOSED_AFTER_REVIEW'|'CASE_RECORDED'|'ASSESSMENT_IN_PROGRESS'|'ACTION_PLANNED'|'ACTION_IN_PROGRESS'|'VERIFICATION'|'RESOLVED';
export interface PublicTrackingTimelineItem{key:'RECEIVED'|'REVIEW'|'CASE'|'ASSESSMENT'|'ACTION'|'VERIFICATION'|'RESOLUTION';label:string;state:'COMPLETED'|'CURRENT'|'PENDING';occurredAt:string|null;}
export interface PublicTrackingResult{reportReference:string;submittedAt:string;category:PublicReportCategory;title:string;locationText:string;status:PublicProgressStage;statusLabel:string;lastProgressAt:string;governedCaseCreated:boolean;caseReference:string|null;outcome:'ACTIVE'|'CLOSED_AFTER_REVIEW'|'RESOLVED';timeline:PublicTrackingTimelineItem[];}
export function trackPublicReport(reference:string,signal?:AbortSignal){return apiRequest<PublicTrackingResult>(`/public/tracking/${encodeURIComponent(reference.trim().toUpperCase())}`,{signal});}
const mutate=<T>(path:string,method:'POST'|'PATCH',body:unknown,accessToken:string)=>apiRequest<T>(path,{method,body,accessToken});
export const beginPublicReportReview=(id:string,token:string)=>mutate<PublicReportDetail>(`/public-reports/${encodeURIComponent(id)}/review`,'POST',{},token);
export const routePublicReport=(id:string,input:{departmentId:string;jurisdictionId:string;assetId:string|null},token:string)=>mutate<PublicReportDetail>(`/public-reports/${encodeURIComponent(id)}/routing`,'PATCH',input,token);
export const rejectPublicReport=(id:string,reason:string,token:string)=>mutate<PublicReportDetail>(`/public-reports/${encodeURIComponent(id)}/reject`,'POST',{reason},token);
export const acceptPublicReport=(id:string,governmentSummary:string,token:string)=>mutate<PublicReportDetail>(`/public-reports/${encodeURIComponent(id)}/accept`,'POST',{governmentSummary},token);
export interface TriageReason { reasonCode:string; message:string; }
export interface DuplicateSignal { publicReportId:string;reportNumber:string;title:string;category:PublicReportCategory;locationText:string;status:string;submittedAt:string;similarityReason:string; }
export interface PublicReportTriageAnalysis {id:string;publicReportId:string;analysisVersion:string;suggestedCategory:PublicReportCategory;urgencyLevel:'LOW'|'MODERATE'|'HIGH'|'URGENT';confidence:number;reasonCodes:string[];reasons:TriageReason[];possibleAsset:PublicReportAsset|null;duplicateCandidates:DuplicateSignal[];createdAt:string;}
export const getPublicReportAnalysis=(id:string,token:string,signal?:AbortSignal)=>apiRequest<PublicReportTriageAnalysis>(`/public-reports/${encodeURIComponent(id)}/analysis`,{accessToken:token,signal}).then((value)=>{if(!Array.isArray(value.reasons)||!Array.isArray(value.duplicateCandidates))throw new Error('Invalid analysis response.');return value;});
export const analyzePublicReport=(id:string,token:string)=>mutate<PublicReportTriageAnalysis>(`/public-reports/${encodeURIComponent(id)}/analyze`,'POST',{},token);
