import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { QueryValidationError } from '../../lib/pagination';
import { ScopedResourceNotFoundError } from '../../security/organizational-scope';
import { assetAttentionService, validateAttentionQuery } from './asset-attention.service';

const router = Router();
for (const [path, method] of [['/attention', 'page'], ['/attention/summary', 'summary']] as const) {
  router.get(path, authenticate, async (req, res) => {
    try {
      const query = validateAttentionQuery(req.query, method === 'summary');
      const data = await assetAttentionService[method](req.user!, { ...query });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      if (error instanceof QueryValidationError) return res.status(400).json({ success: false, error: { code: 'INVALID_QUERY', message: 'Invalid Asset attention query.' } });
      if (error instanceof ScopedResourceNotFoundError) return res.status(404).json({ success: false, error: { code: 'ASSET_NOT_FOUND', message: 'Asset not found.' } });
      return res.status(503).json({ success: false, error: { code: 'ASSET_ATTENTION_UNAVAILABLE', message: 'Asset attention is currently unavailable.' } });
    }
  });
}
export default router;
