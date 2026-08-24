import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks=vi.hoisted(()=>({findFirst:vi.fn(),where:vi.fn(()=>({case:{departmentId:'d'}}))}));
vi.mock('../src/lib/prisma',()=>({default:{riskAssessment:{findFirst:mocks.findFirst}}}));
vi.mock('../src/security/organizational-scope',async(original)=>({...await original<typeof import('../src/security/organizational-scope')>(),buildRiskAssessmentReadWhere:mocks.where}));
import { calculateRiskAndPriority, RISK_ASSESSMENT_VERSION } from '../src/modules/risk/risk.service';
import { canonicalRiskInput, canonicalRiskResult, COMPUTATION_TYPE, LOCAL_PROVIDER_ID, RECEIPT_VERSION, sha256Fingerprint, TRUSTED_INPUT_VERSION } from '../src/modules/trusted-computation/trusted-computation.provider';
import { getComputationReceipt, TrustedComputationNotFoundError, verifyRiskComputation } from '../src/modules/trusted-computation/trusted-computation.service';
const principal={id:'u',role:'OFFICER',status:'ACTIVE',departmentId:'d',jurisdictionId:'j'} as any;
const inspection={id:'inspection',structuralCondition:'POOR',crackSeverity:'SEVERE',corrosionLevel:'MODERATE',trafficImportance:'HIGH',hospitalRoute:true,weatherRisk:'HIGH',heavyRainExpected:true,estimatedDailyUsers:42000} as any;
const result=calculateRiskAndPriority(inspection);
const receipt={receiptVersion:RECEIPT_VERSION,computationType:COMPUTATION_TYPE,inputContractVersion:TRUSTED_INPUT_VERSION,inputFingerprint:sha256Fingerprint(canonicalRiskInput('case',inspection,RISK_ASSESSMENT_VERSION)),computationVersion:RISK_ASSESSMENT_VERSION,providerId:LOCAL_PROVIDER_ID,runtimeTrustLevel:'LOCAL_VERIFIED',resultFingerprint:sha256Fingerprint(canonicalRiskResult(result,RISK_ASSESSMENT_VERSION)),executedAt:new Date(),attestationState:'NOT_AVAILABLE',attestationReference:null,createdAt:new Date()};
const assessment={id:'risk',caseId:'case',inspectionId:'inspection',assessmentVersion:RISK_ASSESSMENT_VERSION,...result,inspection,trustedComputationReceipt:receipt};
describe('trusted computation verification',()=>{
 beforeEach(()=>{vi.clearAllMocks();mocks.findFirst.mockResolvedValue(assessment);});
 it('enforces organizational scope and returns controlled receipt metadata',async()=>{const value=await getComputationReceipt('risk',principal);expect(value.status).toBe('AVAILABLE');expect(mocks.findFirst).toHaveBeenCalledWith(expect.objectContaining({where:{id:'risk',AND:[{case:{departmentId:'d'}}]}}));expect(value.receipt).not.toHaveProperty('canonicalInput');});
 it('returns VALID without performing any write',async()=>{expect(await verifyRiskComputation('risk',principal)).toMatchObject({status:'VALID',verified:true});expect(Object.keys((await import('../src/lib/prisma')).default.riskAssessment)).toEqual(['findFirst']);});
 it.each([['INPUT_MISMATCH',{...receipt,inputFingerprint:'sha256:'+ '0'.repeat(64)}],['RESULT_MISMATCH',{...receipt,resultFingerprint:'sha256:'+ '0'.repeat(64)}],['UNSUPPORTED_VERSION',{...receipt,receiptVersion:'V2'}]])('returns %s safely',async(status,changed)=>{mocks.findFirst.mockResolvedValue({...assessment,trustedComputationReceipt:changed});expect(await verifyRiskComputation('risk',principal)).toMatchObject({status,verified:false});});
 it('supports legacy receipt absence and safe nonexistent behavior',async()=>{mocks.findFirst.mockResolvedValueOnce({...assessment,trustedComputationReceipt:null});expect(await verifyRiskComputation('risk',principal)).toMatchObject({status:'RECEIPT_MISSING'});mocks.findFirst.mockResolvedValueOnce(null);await expect(getComputationReceipt('unknown',principal)).rejects.toBeInstanceOf(TrustedComputationNotFoundError);});
});
