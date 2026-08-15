import { Router } from 'express';
import { CaseClosureReason, SystemRole } from '../../generated/prisma';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/require-role';
import { CaseClosureError } from './case-closure-error';
import { closeCase, getCaseClosure, MAX_CLOSURE_SUMMARY_LENGTH } from './case-closure.service';

const router = Router();
const trustedFields = [
  'closedById', 'closureAuthorityGrantId', 'executionPlanId', 'caseId', 'closedAt',
  'createdAt', 'status', 'authorityId', 'userId'
];

function fail(res: any, error: unknown) {
  if (error instanceof CaseClosureError) {
    return res.status(error.status).json({ success: false, error: { code: error.code, message: error.message } });
  }
  console.error('Case closure workflow failed:', error);
  return res.status(500).json({ success: false, error: { code: 'CASE_CLOSURE_FAILED', message: 'Could not process Case closure.' } });
}

router.post('/cases/:caseId/close', authenticate, requireRole(SystemRole.OFFICER), async (req, res) => {
  try {
    const caseId = typeof req.params.caseId === 'string' ? req.params.caseId.trim() : '';
    const closureSummary = typeof req.body.closureSummary === 'string' ? req.body.closureSummary.trim() : '';
    if (!caseId || req.body.closureReason !== CaseClosureReason.EXECUTION_VERIFIED ||
        !closureSummary || closureSummary.length > MAX_CLOSURE_SUMMARY_LENGTH ||
        trustedFields.some((field) => Object.prototype.hasOwnProperty.call(req.body, field))) {
      throw new CaseClosureError('INVALID_INPUT', 400, 'A valid closure reason and summary are required; trusted fields are server controlled.');
    }
    const result = await closeCase(caseId, { closureReason: CaseClosureReason.EXECUTION_VERIFIED, closureSummary }, req.user!);
    return res.status(result.created ? 201 : 200).json({ success: true, data: result.closure, idempotent: !result.created });
  } catch (error) {
    return fail(res, error);
  }
});

router.get('/cases/:caseId/closure', authenticate, async (req, res) => {
  try {
    const caseId = typeof req.params.caseId === 'string' ? req.params.caseId.trim() : '';
    if (!caseId) throw new CaseClosureError('INVALID_INPUT', 400, 'caseId is required.');
    return res.status(200).json({ success: true, data: await getCaseClosure(caseId, req.user!) });
  } catch (error) {
    return fail(res, error);
  }
});

export default router;
