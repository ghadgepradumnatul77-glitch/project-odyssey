import { apiRequest } from './client';
export interface PredictiveReadiness {state:string;modelStatus:'NO_MODEL_YET';disclosures:string[];targetContracts:Array<{targetType:string;status:string;featureContractVersion?:string;outcomeContractVersion?:string}>;counts:{snapshots:number;eligibleRealOutcomes:number;pendingRealOutcomes:number;invalidRealRecords:number;provenance:Record<string,number>}}
export const getPredictiveReadiness=(token:string,signal?:AbortSignal)=>apiRequest<PredictiveReadiness>('/predictive-data/readiness',{accessToken:token,signal});
