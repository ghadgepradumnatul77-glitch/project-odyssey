import { describe, expect, it } from 'vitest';
import { calculateRiskAndPriority, RISK_ASSESSMENT_VERSION } from '../src/modules/risk/risk.service';
import { canonicalRiskInput, canonicalRiskResult, localVerifiedRiskProvider, sha256Fingerprint } from '../src/modules/trusted-computation/trusted-computation.provider';

const inspection = { id:'inspection-1', structuralCondition:'POOR', crackSeverity:'SEVERE', corrosionLevel:'MODERATE', trafficImportance:'HIGH', hospitalRoute:true, weatherRisk:'HIGH', heavyRainExpected:true, estimatedDailyUsers:42000 } as any;

describe('local verified trusted computation provider',()=>{
  it('wraps the single authoritative risk calculator without changing its result',()=>{
    const direct=calculateRiskAndPriority(inspection);
    const execution=localVerifiedRiskProvider.execute('case-1',inspection,RISK_ASSESSMENT_VERSION,calculateRiskAndPriority);
    expect(execution.result).toEqual(direct);
    expect(execution.result).toMatchObject({riskScore:77,riskLevel:'VERY_HIGH',priorityLevel:'CRITICAL'});
    expect(execution.receipt).toMatchObject({providerId:'ODYSSEY_LOCAL_VERIFIED_V1',runtimeTrustLevel:'LOCAL_VERIFIED',attestationState:'NOT_AVAILABLE',attestationReference:null});
    expect(execution.receipt.inputFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(execution.receipt.resultFingerprint).toBe(sha256Fingerprint(canonicalRiskResult(direct,RISK_ASSESSMENT_VERSION)));
  });
  it('canonicalizes property order and excludes irrelevant metadata and timestamps',()=>{
    const canonical=canonicalRiskInput('case-1',inspection,RISK_ASSESSMENT_VERSION);
    expect(sha256Fingerprint(canonical)).toBe(sha256Fingerprint(Object.fromEntries(Object.entries(canonical).reverse())));
    expect(canonicalRiskInput('case-1',{...inspection,notes:'private',createdAt:new Date(0)},RISK_ASSESSMENT_VERSION)).toEqual(canonical);
    expect(sha256Fingerprint(canonicalRiskInput('case-1',{...inspection,hospitalRoute:false},RISK_ASSESSMENT_VERSION))).not.toBe(sha256Fingerprint(canonical));
  });
  it('has explicit null, boolean, enum, and integer semantics and rejects invalid counts',()=>{
    expect(canonicalRiskInput('case-1',{...inspection,estimatedDailyUsers:null},RISK_ASSESSMENT_VERSION).estimatedDailyUsers).toBeNull();
    expect(()=>canonicalRiskInput('case-1',{...inspection,estimatedDailyUsers:-1},RISK_ASSESSMENT_VERSION)).toThrow('INVALID_TRUSTED_COMPUTATION_INPUT');
    expect(()=>canonicalRiskInput('case-1',{...inspection,estimatedDailyUsers:1.2},RISK_ASSESSMENT_VERSION)).toThrow('INVALID_TRUSTED_COMPUTATION_INPUT');
  });
  it('fingerprints stable ordered reasons and detects material result changes',()=>{
    const result=calculateRiskAndPriority(inspection);
    const base=sha256Fingerprint(canonicalRiskResult(result,RISK_ASSESSMENT_VERSION));
    expect(sha256Fingerprint(canonicalRiskResult({...result,riskScore:76},RISK_ASSESSMENT_VERSION))).not.toBe(base);
    expect(sha256Fingerprint(canonicalRiskResult({...result,reasonCodes:[...result.reasonCodes].reverse()},RISK_ASSESSMENT_VERSION))).not.toBe(base);
  });
});
