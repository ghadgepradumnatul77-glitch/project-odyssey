import { z } from 'zod';
import { getIntelligenceConfig } from '../../config/intelligence';
import { INTELLIGENCE_CONTRACT_VERSION, INTELLIGENCE_FEATURE_SCHEMA_VERSION } from './intelligence.contracts';

export const REFERENCE_PROVIDER = 'ODYSSEY_REFERENCE_PROVIDER_V1';
export const REFERENCE_PROVIDER_TYPE = 'REFERENCE_NON_ML';
export const REFERENCE_MODEL = 'ODYSSEY_REFERENCE_HEURISTIC';
export const REFERENCE_MODEL_VERSION = '1';
export const REFERENCE_CONFIDENCE_SEMANTICS = 'INPUT_COMPLETENESS_NOT_CALIBRATED_PROBABILITY';

const risk = z.enum(['VERY_LOW','LOW','MODERATE','HIGH','VERY_HIGH','CRITICAL']);
const priority = z.enum(['LOW','MEDIUM','HIGH','VERY_HIGH','CRITICAL']);
const factor = z.object({code:z.string().regex(/^[A-Z][A-Z0-9_]+$/),direction:z.enum(['INCREASES_RISK','DECREASES_RISK','NEUTRAL']),importance:z.number().min(0).max(1),observedValue:z.union([z.string(),z.number(),z.boolean()]),explanation:z.string().min(1).max(240)}).strict();
const action = z.object({actionCode:z.string().regex(/^ACT_[A-Z0-9_]+$/),rationale:z.string().min(1).max(240)}).strict();
const abstention = z.object({code:z.enum(['INSUFFICIENT_FEATURES','UNSUPPORTED_FEATURE_SCHEMA','UNSUPPORTED_CONTRACT_VERSION','INPUT_OUT_OF_DOMAIN']),message:z.string().min(1).max(240)}).strict();
const provenance = z.object({provider:z.literal(REFERENCE_PROVIDER),providerType:z.literal(REFERENCE_PROVIDER_TYPE),modelName:z.literal(REFERENCE_MODEL),modelVersion:z.literal(REFERENCE_MODEL_VERSION),featureSchemaVersion:z.literal(INTELLIGENCE_FEATURE_SCHEMA_VERSION),contractVersion:z.literal(INTELLIGENCE_CONTRACT_VERSION),inferredAt:z.string().datetime({offset:true}),productionTrained:z.literal(false),modelArtifactDigest:z.string().regex(/^sha256:[a-f0-9]{64}$/).optional()}).strict();
const completed = z.object({status:z.literal('COMPLETED'),predictedRiskScore:z.number().int().min(0).max(100),predictedRiskLevel:risk,recommendedPriority:priority,confidence:z.number().min(0).max(1),confidenceSemantics:z.literal(REFERENCE_CONFIDENCE_SEMANTICS),contributingFactors:z.array(factor),explanation:z.string().min(1).max(300),recommendedActions:z.array(action),abstentionReasons:z.array(abstention).length(0),provenance}).strict();
const abstained = z.object({status:z.literal('ABSTAINED'),contributingFactors:z.array(factor).length(0),explanation:z.literal('Reference provider abstained; no advisory prediction was produced.'),recommendedActions:z.array(action).length(0),abstentionReasons:z.array(abstention).min(1),provenance}).strict();
export const providerResponseSchema = z.discriminatedUnion('status',[completed,abstained]);
export type ProviderResponse = z.infer<typeof providerResponseSchema>;

export type AdapterResult = {kind:'PROVIDER';data:ProviderResponse}|{kind:'UNAVAILABLE';reasonCode:'SERVICE_TIMEOUT'|'SERVICE_UNAVAILABLE'|'SERVICE_HTTP_ERROR'}|{kind:'INVALID_RESPONSE';reasonCode:'MALFORMED_JSON'|'SCHEMA_INVALID'};

export async function invokeIntelligenceProvider(payload: unknown, fetchImpl: typeof fetch = fetch): Promise<AdapterResult> {
  const config=getIntelligenceConfig(); const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),config.timeoutMs);
  try {
    let response:Response;
    try { response=await fetchImpl(`${config.serviceUrl}/v1/intelligence/infer`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload),signal:controller.signal}); }
    catch(error){return {kind:'UNAVAILABLE',reasonCode:error instanceof Error&&error.name==='AbortError'?'SERVICE_TIMEOUT':'SERVICE_UNAVAILABLE'};}
    if(!response.ok)return {kind:'UNAVAILABLE',reasonCode:'SERVICE_HTTP_ERROR'};
    let body:unknown; try{body=await response.json();}catch{return {kind:'INVALID_RESPONSE',reasonCode:'MALFORMED_JSON'};}
    const parsed=providerResponseSchema.safeParse(body); return parsed.success?{kind:'PROVIDER',data:parsed.data}:{kind:'INVALID_RESPONSE',reasonCode:'SCHEMA_INVALID'};
  } finally {clearTimeout(timer);}
}
