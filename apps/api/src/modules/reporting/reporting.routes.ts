import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { getCaseTimeline, TIMELINE_DEFAULT_LIMIT } from './case-timeline.service';
import { getDecisionBrief } from './decision-brief.service';
import { ReportingError } from './reporting-error';

const router = Router();
function requiredId(value: unknown) { return typeof value === 'string' && value.trim() ? value.trim() : null; }
function fail(res: any, error: unknown) {
  if (error instanceof ReportingError) return res.status(error.status).json({ success: false, error: { code: error.code, message: error.message } });
  console.error('Reporting projection failed:', error);
  return res.status(500).json({ success: false, error: { code: 'REPORTING_FAILED', message: 'Could not produce the requested report.' } });
}
router.get('/cases/:caseId/decision-brief', authenticate, async (req, res) => {
  try { const caseId = requiredId(req.params.caseId); if (!caseId) throw new ReportingError('INVALID_INPUT', 400, 'caseId is required.'); return res.status(200).json({ success: true, data: await getDecisionBrief(caseId, req.user!) }); } catch (error) { return fail(res, error); }
});
router.get('/cases/:caseId/timeline', authenticate, async (req, res) => {
  try {
    const caseId = requiredId(req.params.caseId);
    if (!caseId) throw new ReportingError('INVALID_INPUT', 400, 'caseId is required.');
    const rawLimit = req.query.limit;
    const limit = rawLimit === undefined ? TIMELINE_DEFAULT_LIMIT : typeof rawLimit === 'string' && /^\d+$/.test(rawLimit) ? Number(rawLimit) : Number.NaN;
    const cursor = req.query.cursor === undefined ? undefined : typeof req.query.cursor === 'string' ? req.query.cursor : '';
    if (!Number.isInteger(limit) || limit < 1 || limit > 200 || cursor === '') throw new ReportingError('INVALID_INPUT', 400, 'limit or cursor is invalid.');
    return res.status(200).json({ success: true, data: await getCaseTimeline(caseId, req.user!, limit, cursor) });
  } catch (error) { return fail(res, error); }
});
export default router;
