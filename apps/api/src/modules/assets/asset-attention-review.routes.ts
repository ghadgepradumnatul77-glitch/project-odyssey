import { Router, type Response } from 'express';
import { SystemRole } from '../../generated/prisma';
import { authenticate } from '../../middleware/authenticate';
import { QueryValidationError, parseUuidQuery, parseLimit, parseCursor } from '../../lib/pagination';
import { assetAttentionReviewService, AttentionReviewServiceError } from './asset-attention-review.service';
import { assetAttentionReviewError, attentionReviewErrors, type AssetAttentionReviewErrorCode } from './asset-attention-review.contracts';
import { validateAssetAttentionReview } from './asset-attention-review.validation';

const router = Router();
function fail(res: Response, error: unknown) {
  let code: AssetAttentionReviewErrorCode = error instanceof QueryValidationError ? 'INVALID_REVIEW_INPUT'
    : error instanceof AttentionReviewServiceError ? error.code : 'REVIEW_UNAVAILABLE';
  // Linkage visibility must never be inferred from a detailed error response.
  if (['INVALID_ASSET_LINKAGE', 'INVALID_CASE_LINKAGE', 'INVALID_SUPERSESSION_LINKAGE'].includes(code)) code = 'RESOURCE_NOT_FOUND';
  return res.status(attentionReviewErrors[code].status).json(assetAttentionReviewError(code));
}
router.post('/:assetId/attention-reviews', authenticate, async (req, res) => {
  if (req.user!.role !== SystemRole.OFFICER) return fail(res, new AttentionReviewServiceError('REVIEW_FORBIDDEN'));
  try {
    const assetId = parseUuidQuery(req.params.assetId, 'assetId')!;
    if (Object.keys(req.query).length) throw new QueryValidationError();
    const parsed = validateAssetAttentionReview(req.body);
    if (!parsed.success) return res.status(400).json(parsed);
    const result = await assetAttentionReviewService.create(req.user!, assetId, parsed.data);
    return res.status(result.data.outcome === 'IDEMPOTENT_REPLAY' ? 200 : 201).json(result);
  } catch (error) { return fail(res, error); }
});
router.get('/:assetId/attention-reviews', authenticate, async (req, res) => {
  try {
    const assetId = parseUuidQuery(req.params.assetId, 'assetId')!;
    if (Object.keys(req.query).some(key => key !== 'limit' && key !== 'cursor')) throw new QueryValidationError();
    parseLimit(req.query.limit); parseCursor(req.query.cursor);
    const data = await assetAttentionReviewService.history(req.user!, assetId, { limit: req.query.limit, cursor: req.query.cursor });
    return res.status(200).json({ success: true, data });
  } catch (error) { return fail(res, error); }
});
export default router;
