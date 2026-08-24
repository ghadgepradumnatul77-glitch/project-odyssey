import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate';
import { getComputationReceipt, TrustedComputationNotFoundError, verifyRiskComputation } from './trusted-computation.service';

const router = Router();
const idSchema = z.string().uuid();
function error(res: any, value: unknown) {
  if (value instanceof TrustedComputationNotFoundError) return res.status(404).json({ success: false, error: { code: 'RISK_ASSESSMENT_NOT_FOUND', message: 'Risk assessment not found.' } });
  console.error('Trusted computation request failed.');
  return res.status(500).json({ success: false, error: { code: 'TRUSTED_COMPUTATION_FAILED', message: 'Computation provenance could not be processed.' } });
}

router.get('/risk-assessments/:assessmentId/computation-receipt', authenticate, async (req, res) => {
  const parsed = idSchema.safeParse(req.params.assessmentId);
  if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'A valid assessmentId is required.' } });
  try { return res.status(200).json({ success: true, data: await getComputationReceipt(parsed.data, req.user!) }); }
  catch (value) { return error(res, value); }
});

router.post('/risk-assessments/:assessmentId/verify-computation', authenticate, async (req, res) => {
  const parsed = idSchema.safeParse(req.params.assessmentId);
  if (!parsed.success || (req.body && Object.keys(req.body).length)) return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'A valid assessmentId and empty body are required.' } });
  try { return res.status(200).json({ success: true, data: await verifyRiskComputation(parsed.data, req.user!) }); }
  catch (value) { return error(res, value); }
});

export default router;
