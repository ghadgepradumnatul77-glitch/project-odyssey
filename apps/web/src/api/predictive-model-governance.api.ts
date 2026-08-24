import{apiRequest}from'./client';
export interface GovernanceSummary{registeredModels:number;evaluated:number;validated:number;approved:number;active:number;deprecated:number;datasetSnapshots:number;inferenceIntegration:'NOT_IMPLEMENTED';modelTrainingPerformed:false;predictiveDataReadiness:{state:string;modelStatus:string}}
export interface ModelVersion{id:string;modelName:string;modelVersion:string;targetType:string;deploymentSlot:string;intendedUse:string;forbiddenUse:string;featureContractVersion:string;outcomeContractVersion:string;artifactDigest:string;artifactFormat:string;lifecycleStatus:string;createdAt:string;evaluations:unknown[];approvals:unknown[]}
export interface ModelPage{items:ModelVersion[];nextCursor:string|null;limit:number}
export const getModelGovernanceSummary=(token:string,signal?:AbortSignal)=>apiRequest<GovernanceSummary>('/predictive-models/summary',{accessToken:token,signal});
export const getPredictiveModels=(token:string,signal?:AbortSignal)=>apiRequest<ModelPage>('/predictive-models?limit=25',{accessToken:token,signal});
