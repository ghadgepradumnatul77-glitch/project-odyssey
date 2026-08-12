import { Router } from 'express';
import { PriorityLevel } from '../../generated/prisma';
import { createApprovalAuthority, listApprovalAuthorities } from './authority.service';
import { requiredText, WorkflowError } from '../decisions/workflow-error';

const router = Router();
const priorities = new Set(Object.values(PriorityLevel));

function optionalBoolean(value: unknown): boolean | undefined | null {
  return value === undefined ? undefined : typeof value === 'boolean' ? value : null;
}

function optionalDate(value: unknown): Date | null | undefined | 'INVALID' {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  if (typeof value !== 'string') return 'INVALID';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'INVALID' : date;
}

router.post('/approval-authorities', async (req, res) => {
  try {
    const userId = requiredText(req.body.userId);
    const departmentId = requiredText(req.body.departmentId);
    const jurisdictionId = requiredText(req.body.jurisdictionId);
    const booleanFields = [
      'canApprove', 'canReject', 'canRequestModification', 'canRequestReinspection', 'canEscalate'
    ] as const;
    const booleans = Object.fromEntries(booleanFields.map((field) => [field, optionalBoolean(req.body[field])]));
    const validFrom = optionalDate(req.body.validFrom);
    const validUntil = optionalDate(req.body.validUntil);
    const maxPriorityLevel = req.body.maxPriorityLevel ?? null;

    if (!userId || !departmentId || !jurisdictionId ||
        Object.values(booleans).includes(null) || validFrom === 'INVALID' || validUntil === 'INVALID' ||
        (maxPriorityLevel !== null && !priorities.has(maxPriorityLevel))) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Authority grant input is invalid.' }
      });
    }

    const authority = await createApprovalAuthority({
      userId,
      departmentId,
      jurisdictionId,
      ...booleans,
      maxPriorityLevel,
      validFrom,
      validUntil
    });
    return res.status(201).json({ success: true, data: authority });
  } catch (error) {
    if (error instanceof WorkflowError) {
      return res.status(error.status).json({ success: false, error: { code: error.code, message: error.message } });
    }
    console.error('Failed to create approval authority:', error);
    return res.status(500).json({ success: false, error: { code: 'AUTHORITY_CREATE_FAILED', message: 'Could not create approval authority.' } });
  }
});

router.get('/approval-authorities', async (_req, res) => {
  try {
    return res.status(200).json({ success: true, data: await listApprovalAuthorities() });
  } catch (error) {
    console.error('Failed to fetch approval authorities:', error);
    return res.status(500).json({ success: false, error: { code: 'AUTHORITY_FETCH_FAILED', message: 'Could not fetch approval authorities.' } });
  }
});

export default router;
