import { Router } from 'express';
import { SystemRole } from '../../generated/prisma';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/require-role';
import { ScopedResourceNotFoundError } from '../../security/organizational-scope';
import { evaluateCaseReadiness } from './readiness.service';

const router = Router();

router.get('/cases/:caseId/readiness', authenticate, requireRole(SystemRole.OFFICER, SystemRole.AUDITOR, SystemRole.SYSTEM_ADMIN), async (req, res) => {
  try {
    const caseId = String(req.params.caseId ?? '').trim();
    if (!caseId) return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'caseId is required.' } });
    return res.json({ success: true, data: await evaluateCaseReadiness(caseId, req.user!) });
  } catch (error) {
    if (error instanceof ScopedResourceNotFoundError || (error instanceof Error && error.message === 'CASE_NOT_FOUND')) {
      return res.status(404).json({ success: false, error: { code: 'CASE_NOT_FOUND', message: 'Case not found.' } });
    }
    console.error('Decision readiness evaluation failed:', error);
    return res.status(500).json({ success: false, error: { code: 'READINESS_EVALUATION_FAILED', message: 'Decision readiness could not be evaluated.' } });
  }
});

export default router;
