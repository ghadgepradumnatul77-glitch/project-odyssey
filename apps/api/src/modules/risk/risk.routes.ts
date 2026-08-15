import { Router } from 'express';
import prisma from '../../lib/prisma';
import { runAssessmentForCase } from './risk.service';
import { SystemRole } from '../../generated/prisma';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/require-role';
import {
  assertVisibleCase,
  ScopedResourceNotFoundError
} from '../../security/organizational-scope';

const router = Router();

// ======================================================
// ASSESS RISK FOR A CASE
// POST /api/v1/cases/:caseId/assess-risk
// ======================================================
router.post('/:caseId/assess-risk', authenticate, requireRole(SystemRole.OFFICER), async (req, res) => {
  try {
    const { caseId } = req.params;

    if (!caseId || typeof caseId !== 'string' || !caseId.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'caseId is required.'
        }
      });
    }

    const result = await runAssessmentForCase(caseId.trim(), req.user!);

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error: any) {
    if (error.message === 'CASE_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CASE_NOT_FOUND',
          message: 'Case not found.'
        }
      });
    }

    if (error.message === 'NO_INSPECTION_FOUND') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_INSPECTION_FOUND',
          message: 'No inspection exists for this case.'
        }
      });
    }

    if (error.message === 'INVALID_CASE_STATE') {
      return res.status(409).json({
        success: false,
        error: { code: 'INVALID_CASE_STATE', message: 'A closed Case cannot be reassessed.' }
      });
    }

    console.error('Failed to assess risk:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'RISK_ASSESSMENT_FAILED',
        message: 'Could not run risk assessment.'
      }
    });
  }
});

// ======================================================
// GET RISK ASSESSMENTS FOR A CASE
// GET /api/v1/cases/:caseId/risk-assessments
// ======================================================
router.get('/:caseId/risk-assessments', authenticate, async (req, res) => {
  try {
    const { caseId } = req.params;

    if (!caseId || typeof caseId !== 'string' || !caseId.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'caseId is required.'
        }
      });
    }

    await assertVisibleCase(caseId.trim(), req.user!);

    const assessments = await prisma.riskAssessment.findMany({
      where: { caseId: caseId.trim() },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      data: assessments
    });

  } catch (error) {
    if (error instanceof ScopedResourceNotFoundError) {
      return res.status(404).json({ success: false, error: { code: 'CASE_NOT_FOUND', message: 'Case not found.' } });
    }
    console.error('Failed to fetch risk assessments:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'RISK_ASSESSMENTS_FETCH_FAILED',
        message: 'Could not fetch risk assessments.'
      }
    });
  }
});

export default router;
