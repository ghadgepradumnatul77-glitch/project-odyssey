import { z } from 'zod';

export const EXECUTION_PROVENANCE_CONTRACT_VERSION = 'ODYSSEY_EXECUTION_PROVENANCE_V1';
export const executionProvenanceClassification = z.enum(['PILOT', 'PRODUCTION', 'SYNTHETIC', 'DEMO']);
// Identifier only: no free-text evidence, credentials, or query strings.
export const executionProvenanceEvidenceReference = z.string().min(1).max(200).regex(/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,199}$/);
export const executionProvenanceDeclarationInput = z.object({
  classification: executionProvenanceClassification,
  evidenceReference: executionProvenanceEvidenceReference,
}).strict();

// Contract mapping, not an authorization decision. Future declaration service must
// require an ACTIVE OFFICER, exact scope and a currently valid explicit grant.
export function requiredProvenanceCapability(value: z.infer<typeof executionProvenanceClassification>) {
  return value === 'PILOT' || value === 'PRODUCTION'
    ? 'canDeclareOperationalProvenance' as const
    : 'canDeclareNonOperationalProvenance' as const;
}
export const UNKNOWN_EXECUTION_PROVENANCE = { classification: null, state: 'UNKNOWN', predictivelyEligible: false } as const;
