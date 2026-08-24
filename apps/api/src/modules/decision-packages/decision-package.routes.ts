import { Router } from 'express';
import { SystemRole } from '../../generated/prisma';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/require-role';
import { ScopedResourceNotFoundError } from '../../security/organizational-scope';
import { DecisionPackageError, getDecisionPackage, listDecisionPackages, prepareDecisionPackage } from './decision-package.service';
import { z } from 'zod';
import { parseCursor, parseLimit, queryError } from '../../lib/pagination';

const router = Router();
const readers = requireRole(SystemRole.OFFICER, SystemRole.AUDITOR, SystemRole.SYSTEM_ADMIN);
const preparers = requireRole(SystemRole.OFFICER, SystemRole.SYSTEM_ADMIN);
function parameter(value: string | string[] | undefined) { if (Array.isArray(value)) return null; const parsed = z.string().uuid().safeParse(value?.trim()); return parsed.success ? parsed.data : null; }
function fail(res: any, error: unknown) {
  const invalid = queryError(res, error); if (invalid) return invalid;
  if (error instanceof DecisionPackageError) return res.status(error.status).json({ success: false, error: { code: error.code, message: error.message, reasons: error.reasons } });
  if (error instanceof ScopedResourceNotFoundError) return res.status(404).json({ success: false, error: { code: 'CASE_NOT_FOUND', message: 'Case not found.' } });
  console.error('Decision Package operation failed:', error);
  return res.status(500).json({ success: false, error: { code: 'DECISION_PACKAGE_FAILED', message: 'The Decision Package operation could not be completed.' } });
}

router.post('/cases/:caseId/decision-packages', authenticate, preparers, async (req, res) => {
  const caseId = parameter(req.params.caseId); if (!caseId) return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'caseId is required.' } });
  try { const data = await prepareDecisionPackage(caseId, req.user!); return res.status(data.reused ? 200 : 201).json({ success: true, data }); } catch (error) { return fail(res, error); }
});
router.get('/cases/:caseId/decision-packages', authenticate, readers, async (req, res) => {
  const caseId = parameter(req.params.caseId); if (!caseId) return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'caseId is required.' } });
  try { return res.json({ success: true, data: await listDecisionPackages(caseId, req.user!, { limit: parseLimit(req.query.limit), cursor: parseCursor(req.query.cursor) }) }); } catch (error) { return fail(res, error); }
});
router.get('/cases/:caseId/decision-packages/:packageId', authenticate, readers, async (req, res) => {
  const caseId = parameter(req.params.caseId), packageId = parameter(req.params.packageId); if (!caseId || !packageId) return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'caseId and packageId are required.' } });
  try { return res.json({ success: true, data: await getDecisionPackage(caseId, packageId, req.user!) }); } catch (error) { return fail(res, error); }
});
export default router;
