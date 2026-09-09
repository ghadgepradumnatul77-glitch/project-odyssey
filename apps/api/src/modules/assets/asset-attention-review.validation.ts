import { z } from 'zod';
import { attentionCategories, attentionReasonCodes, attentionStates } from './asset-attention.contracts';
import {
  attentionDispositions, assetAttentionReviewError, REVIEW_RATIONALE_MAX_LENGTH,
  REVIEW_CLIENT_REQUEST_ID_MAX_LENGTH, REVIEW_SELECTED_SIGNAL_LIMIT,
  type CreateAssetAttentionReviewInput, type AssetAttentionReviewErrorDto
} from './asset-attention-review.contracts';

const fingerprint = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const selectedSignal = z.object({
  category: z.enum(attentionCategories),
  signalCode: z.enum(attentionReasonCodes),
  state: z.enum(attentionStates),
  evidenceReferenceFingerprint: fingerprint
}).strict();

// Deliberately private: raw Zod errors can contain arbitrary submitted property names.
const requestSchema = z.object({
  disposition: z.enum(attentionDispositions),
  rationale: z.string().trim().min(1).max(REVIEW_RATIONALE_MAX_LENGTH),
  clientRequestId: z.string().trim().min(1).max(REVIEW_CLIENT_REQUEST_ID_MAX_LENGTH),
  expectedSourceSetFingerprint: fingerprint,
  caseId: z.string().uuid().optional(),
  supersedesReviewId: z.string().uuid().optional(),
  selectedSignals: z.array(selectedSignal).min(1).max(REVIEW_SELECTED_SIGNAL_LIMIT)
}).strict().superRefine((request, context) => {
  const seen = new Set<string>();
  for (const item of request.selectedSignals) {
    // Include the evidence identity: distinct Case signals may share category/code/state.
    const key = JSON.stringify([item.category, item.signalCode, item.state, item.evidenceReferenceFingerprint]);
    if (seen.has(key)) context.addIssue({ code: 'custom', message: 'Duplicate selected signal.' });
    seen.add(key);
  }
});

/** Shape validation only. Future service must resolve scope, links and exact projection membership. */
export function validateAssetAttentionReview(input: unknown):
  { success: true; data: CreateAssetAttentionReviewInput } | AssetAttentionReviewErrorDto {
  const result = requestSchema.safeParse(input);
  return result.success ? { success: true, data: result.data } : assetAttentionReviewError('INVALID_REVIEW_INPUT');
}
