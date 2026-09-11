import type { AttentionCategory, AttentionReasonCode, AttentionState } from './asset-attention.contracts';

export const ASSET_ATTENTION_REVIEW_CONTRACT_VERSION = 'ODYSSEY_ASSET_ATTENTION_REVIEW_V1';
export const attentionDispositions = [
  'ACKNOWLEDGED', 'INSPECTION_FOLLOW_UP_RECOMMENDED', 'CASE_REVIEW_RECOMMENDED',
  'MONITOR_WITH_RECORDED_RATIONALE', 'DATA_QUALITY_FOLLOW_UP', 'GOVERNED_ESCALATION_RECOMMENDED'
] as const;
export type AssetAttentionDisposition = typeof attentionDispositions[number];
export const REVIEW_RATIONALE_MAX_LENGTH = 2000;
export const REVIEW_CLIENT_REQUEST_ID_MAX_LENGTH = 100;
export const REVIEW_SELECTED_SIGNAL_LIMIT = 100;

export interface AssetAttentionReviewSignalInput {
  category: AttentionCategory;
  signalCode: AttentionReasonCode;
  state: AttentionState;
  evidenceReferenceFingerprint: string;
}

/** Asset identity comes from the future route; identity, scope and projection metadata are server-owned. */
export interface CreateAssetAttentionReviewInput {
  disposition: AssetAttentionDisposition;
  rationale: string;
  clientRequestId: string;
  expectedSourceSetFingerprint: string;
  caseId?: string;
  supersedesReviewId?: string;
  selectedSignals: AssetAttentionReviewSignalInput[];
}

/** Authorized review detail only. No joined User data, source narratives, URLs or raw evidence. */
export interface AssetAttentionReviewDto {
  id: string;
  assetId: string;
  caseId: string | null;
  reviewerId: string;
  reviewerRole: string;
  departmentId: string;
  jurisdictionId: string;
  disposition: AssetAttentionDisposition;
  rationale: string;
  attentionContractVersion: string;
  attentionCalculationVersion: string;
  projectionAsOf: string;
  sourceSetFingerprint: string;
  clientRequestId: string;
  supersedesReviewId: string | null;
  createdAt: string;
  selectedSignals: AssetAttentionReviewSignalInput[];
}

export interface AssetAttentionReviewSuccess {
  success: true;
  data: {
    contractVersion: typeof ASSET_ATTENTION_REVIEW_CONTRACT_VERSION;
    outcome: 'CREATED' | 'IDEMPOTENT_REPLAY';
    review: AssetAttentionReviewDto;
  };
}

// Linkage failures must only be emitted after scope checks; hidden resources use RESOURCE_NOT_FOUND.
export const attentionReviewErrors = {
  ATTENTION_PROJECTION_STALE: { status: 409, message: 'Attention evidence changed. Refresh the projection before reviewing.' },
  INVALID_REVIEW_INPUT: { status: 400, message: 'Invalid Asset attention review request.' },
  STALE_PROJECTION: { status: 409, message: 'Attention evidence changed. Refresh the projection before reviewing.' },
  IDEMPOTENCY_CONFLICT: { status: 409, message: 'The request identifier was already used for a different review.' },
  INVALID_ASSET_LINKAGE: { status: 409, message: 'The review does not match the selected Asset.' },
  INVALID_CASE_LINKAGE: { status: 409, message: 'The selected Case cannot be linked to this review.' },
  INVALID_SUPERSESSION_LINKAGE: { status: 409, message: 'The prior review cannot be superseded by this request.' },
  AUTHENTICATION_REQUIRED: { status: 401, message: 'Authentication is required.' },
  REVIEW_FORBIDDEN: { status: 403, message: 'You are not authorized to record an Asset attention review.' },
  RESOURCE_NOT_FOUND: { status: 404, message: 'Requested review resource was not found.' },
  REVIEW_UNAVAILABLE: { status: 503, message: 'Asset attention review is currently unavailable.' }
} as const;
export type AssetAttentionReviewErrorCode = keyof typeof attentionReviewErrors;
export interface AssetAttentionReviewErrorDto {
  success: false;
  error: { code: AssetAttentionReviewErrorCode; message: string };
}

/** Fixed messages only: never include submitted values, lookup results, exception details or hidden IDs. */
export function assetAttentionReviewError(code: AssetAttentionReviewErrorCode): AssetAttentionReviewErrorDto {
  return { success: false, error: { code, message: attentionReviewErrors[code].message } };
}
