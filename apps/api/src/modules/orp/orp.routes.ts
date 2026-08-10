import { Router } from 'express';
import prisma from '../../lib/prisma';
import { createORPForCase, getApprovedActions } from './orp.service';

const router = Router();

function requiredParam(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function parseStoredActionCodes(value: unknown, fieldName: string, orpId: string): string[] {
  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
    return value;
  }

  console.error(`ORP data integrity issue: ${fieldName} is not an array of strings.`, { orpId });
  return [];
}


// ======================================================
// CREATE ORP FOR A CASE
// POST /api/v1/cases/:caseId/orps
// ======================================================

router.post('/cases/:caseId/orps', async (req, res) => {
  try {
    const caseId = requiredParam(req.params.caseId);
    if (!caseId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'caseId is required.' }
      });
    }

    const orp = await createORPForCase(caseId);

    return res.status(201).json({
      success: true,
      data: orp
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

    if (error.message === 'RISK_ASSESSMENT_REQUIRED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'RISK_ASSESSMENT_REQUIRED',
          message: 'No risk assessment exists for this case. Run a risk assessment before generating an ORP.'
        }
      });
    }

    if (error.message === 'CASE_NOT_READY_FOR_ORP') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CASE_NOT_READY_FOR_ORP',
          message: 'The case must be ORP_READY before an operational response plan can be generated.'
        }
      });
    }

    if (error.message === 'ORP_VERSION_CONFLICT') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'ORP_VERSION_CONFLICT',
          message: 'Another operational response plan version was created concurrently. Please retry.'
        }
      });
    }

    if (error.message === 'INSPECTION_NOT_FOUND') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSPECTION_NOT_FOUND',
          message: 'The inspection referenced by the risk assessment could not be found.'
        }
      });
    }

    console.error('Failed to generate ORP:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'ORP_GENERATION_FAILED',
        message: 'Could not generate operational response plan.'
      }
    });
  }
});


// ======================================================
// GET ORP HISTORY FOR A CASE
// GET /api/v1/cases/:caseId/orps
// ======================================================

router.get('/cases/:caseId/orps', async (req, res) => {
  try {
    const caseId = requiredParam(req.params.caseId);
    if (!caseId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'caseId is required.' }
      });
    }

    const existingCase = await prisma.case.findUnique({
      where: { id: caseId }
    });

    if (!existingCase) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CASE_NOT_FOUND',
          message: 'Case not found.'
        }
      });
    }

    const orps = await prisma.operationalResponsePlan.findMany({
      where: { caseId },
      orderBy: [
        { createdAt: 'desc' },
        { versionNumber: 'desc' }
      ]
    });

    return res.status(200).json({
      success: true,
      data: orps
    });

  } catch (error) {
    console.error('Failed to fetch ORPs:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'ORP_FETCH_FAILED',
        message: 'Could not fetch operational response plans.'
      }
    });
  }
});


// ======================================================
// GET SINGLE ORP BY ID
// GET /api/v1/orps/:orpId
// ======================================================

router.get('/orps/:orpId', async (req, res) => {
  try {
    const orpId = requiredParam(req.params.orpId);
    if (!orpId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'orpId is required.' }
      });
    }

    const orp = await prisma.operationalResponsePlan.findUnique({
      where: { id: orpId },
      include: {
        case: {
          include: {
            asset: {
              include: {
                department: {
                  select: { id: true, name: true, code: true }
                },
                jurisdiction: {
                  select: { id: true, name: true, type: true }
                }
              }
            }
          }
        },
        riskAssessment: true
      }
    });

    if (!orp) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORP_NOT_FOUND',
          message: 'Operational response plan not found.'
        }
      });
    }

    // Expand action codes into full action objects
    const recommendedActionCodes = parseStoredActionCodes(
      orp.recommendedActionCodes,
      'recommendedActionCodes',
      orp.id
    );
    const alternativeActionCodes = parseStoredActionCodes(
      orp.alternativeActionCodes,
      'alternativeActionCodes',
      orp.id
    );

    const recommendedActions = getApprovedActions(recommendedActionCodes);
    const alternativeActions = getApprovedActions(alternativeActionCodes);

    return res.status(200).json({
      success: true,
      data: {
        ...orp,
        recommendedActions,
        alternativeActions
      }
    });

  } catch (error) {
    console.error('Failed to fetch ORP:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'ORP_FETCH_FAILED',
        message: 'Could not fetch operational response plan.'
      }
    });
  }
});


export default router;
