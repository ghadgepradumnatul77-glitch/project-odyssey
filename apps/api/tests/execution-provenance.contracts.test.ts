import { describe, expect, it } from 'vitest';
import { executionProvenanceDeclarationInput, requiredProvenanceCapability, UNKNOWN_EXECUTION_PROVENANCE, EXECUTION_PROVENANCE_CONTRACT_VERSION } from '../src/modules/execution/execution-provenance.contracts';
describe('execution provenance foundation',()=>{
  it.each(['PILOT','PRODUCTION','SYNTHETIC','DEMO'] as const)('accepts only explicit %s with its independent capability',classification=>{
    expect(executionProvenanceDeclarationInput.parse({classification,evidenceReference:'RECORD:2026-001'}).classification).toBe(classification);
    expect(requiredProvenanceCapability(classification)).toBe(['PILOT','PRODUCTION'].includes(classification)?'canDeclareOperationalProvenance':'canDeclareNonOperationalProvenance');
  });
  it.each(['UNKNOWN','TEST','pilot','',null])('rejects unsupported declaration %s',classification=>expect(executionProvenanceDeclarationInput.safeParse({classification,evidenceReference:'REF-1'}).success).toBe(false));
  it.each(['',' text ','secret?token=x','user@example.com','a'.repeat(201)])('rejects unbounded/uncontrolled evidence reference',evidenceReference=>expect(executionProvenanceDeclarationInput.safeParse({classification:'DEMO',evidenceReference}).success).toBe(false));
  it('never infers provenance or accepts client authority metadata',()=>{
    expect(UNKNOWN_EXECUTION_PROVENANCE).toEqual({classification:null,state:'UNKNOWN',predictivelyEligible:false});
    expect(executionProvenanceDeclarationInput.safeParse({classification:'DEMO',evidenceReference:'REF',declaredById:'u'}).success).toBe(false);
    expect(EXECUTION_PROVENANCE_CONTRACT_VERSION).toBe('ODYSSEY_EXECUTION_PROVENANCE_V1');
  });
});
