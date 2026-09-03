import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { QueryValidationError } from '../../lib/pagination';
import { ScopedResourceNotFoundError } from '../../security/organizational-scope';
import { assetEvidenceService, validateBaselineQuery } from './asset-evidence-baseline.service';

const router = Router();
for (const [path, method] of [['/evidence-baseline', 'page'], ['/evidence-baseline/summary', 'summary']] as const) {
  router.get(path, authenticate, async (req, res) => {
    try {
      const query = validateBaselineQuery(req.query, method === 'summary');
      const data = await assetEvidenceService[method](req.user!, { ...query });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      if (error instanceof QueryValidationError) return res.status(400).json({ success: false, error: { code: 'INVALID_QUERY', message: 'Invalid evidence baseline query.' } });
      if (error instanceof ScopedResourceNotFoundError) return res.status(404).json({ success: false, error: { code: 'ASSET_NOT_FOUND', message: 'Asset not found.' } });
      // Do not log underlying database/driver errors: they may contain connection secrets.
      return res.status(503).json({ success: false, error: { code: 'EVIDENCE_BASELINE_UNAVAILABLE', message: 'Evidence baseline is currently unavailable.' } });
    }
  });
}
export default router;
