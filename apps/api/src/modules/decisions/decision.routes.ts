import { Router } from 'express';
import { OrpDecisionType } from '../../generated/prisma';
import { getCaseDecisionHistory, getOrpDecisionHistory, submitOrpDecision } from './decision.service';
import { requiredText, WorkflowError } from './workflow-error';
import { authenticate } from '../../middleware/authenticate';

const router = Router();
const decisionTypes = new Set(Object.values(OrpDecisionType));

function sendError(res: Parameters<Parameters<typeof router.post>[1]>[1], error: unknown) {
  if (error instanceof WorkflowError) {
    return res.status(error.status).json({ success: false, error: { code: error.code, message: error.message } });
  }
  console.error('Decision workflow failed:', error);
  return res.status(500).json({ success: false, error: { code: 'DECISION_WORKFLOW_FAILED', message: 'Could not process decision workflow.' } });
}

router.post('/orps/:orpId/decisions', authenticate, async (req, res) => {
  try {
    const orpId = requiredText(req.params.orpId);
    const decisionType = req.body.decisionType;
    if (Object.prototype.hasOwnProperty.call(req.body, 'reviewerId')) {
      return res.status(400).json({ success: false, error: { code: 'REVIEWER_ID_NOT_ALLOWED', message: 'reviewerId is derived from the authenticated identity and must not be supplied.' } });
    }
    if (!orpId || !decisionTypes.has(decisionType)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'orpId and a valid decisionType are required.' } });
    }
    const decision = await submitOrpDecision(orpId, req.user!.id, {
      decisionType,
      reason: req.body.reason,
      remarks: req.body.remarks,
      forwardToUserId: req.body.forwardToUserId,
      requestedChanges: req.body.requestedChanges
    });
    return res.status(201).json({ success: true, data: decision });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/orps/:orpId/decisions', async (req, res) => {
  try {
    const orpId = requiredText(req.params.orpId);
    if (!orpId) return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'orpId is required.' } });
    return res.status(200).json({ success: true, data: await getOrpDecisionHistory(orpId), ordering: 'createdAt ASC, id ASC' });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/cases/:caseId/decisions', async (req, res) => {
  try {
    const caseId = requiredText(req.params.caseId);
    if (!caseId) return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'caseId is required.' } });
    return res.status(200).json({ success: true, data: await getCaseDecisionHistory(caseId), ordering: 'createdAt ASC, id ASC' });
  } catch (error) {
    return sendError(res, error);
  }
});

export default router;
