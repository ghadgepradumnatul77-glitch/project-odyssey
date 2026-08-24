import{apiRequest}from'./client';
export interface ResourceItem{category:string;quantity:number;unit:'UNIT_DAYS'}
export interface Estimate{id:string;caseId:string;estimateVersion:number;status:string;currency:string;estimatedCostMinor:string;estimatedDurationDays:number|null;resourceRequirements:ResourceItem[];estimateBasis:string;sourceReference:string;preparedAt:string;preparedBy:{id:string;name:string;designation:string}}
export interface Candidate{id:string;caseNumber:string;title:string;status:string;riskLevel:string|null;priorityLevel:string|null;emergencyFlag:boolean;criticalRoute:boolean;asset:{assetCode:string;name:string;department:{name:string};jurisdiction:{name:string}};estimate:Estimate|null;readiness:{state:'READY'|'LIMITED'|'NOT_READY';reasons:string[]};rankReasons:string[]}
export interface CandidatePage{items:Candidate[];nextCursor:string|null;limit:number;summary:{totalCandidates:number;readyCases:number;missingEstimateCases:number;totalEstimatedCostMinor:string};algorithmVersion:string}
export const getPortfolioCandidates=(token:string,query='',signal?:AbortSignal)=>apiRequest<CandidatePage>(`/portfolio/candidates${query?`?${query}`:''}`,{accessToken:token,signal});
export const createResourceEstimate=(token:string,caseId:string,body:unknown)=>apiRequest<Estimate>(`/cases/${caseId}/resource-estimates`,{accessToken:token,method:'POST',body});
export const getResourceEstimates=(token:string,caseId:string)=>apiRequest<Estimate[]>(`/cases/${caseId}/resource-estimates`,{accessToken:token});
export const createPortfolioScenario=(token:string,body:unknown)=>apiRequest<any>('/portfolio-scenarios',{accessToken:token,method:'POST',body});
