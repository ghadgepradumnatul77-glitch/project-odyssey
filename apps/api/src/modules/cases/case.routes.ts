import { Router } from 'express';
import prisma from '../../lib/prisma';
import { SystemRole } from '../../generated/prisma';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/require-role';
import {
  assertCaseCreationAsset,
  assertVisibleCase,
  buildCaseReadWhere,
  ScopedResourceNotFoundError
} from '../../security/organizational-scope';

const router = Router();

// ======================================================
// GET ALL CASES
// GET /api/v1/cases
// ======================================================

router.get('/', authenticate, async (req, res) => {
  try {
    const cases = await prisma.case.findMany({
      where: buildCaseReadWhere(req.user!),
      include: {
        sourcePublicReport: { select: { id: true, reportNumber: true } },
        asset: {
          include: {
            department: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            jurisdiction: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      data: cases
    });

  } catch (error) {
    console.error('Failed to fetch cases:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'CASE_FETCH_FAILED',
        message: 'Could not fetch cases.'
      }
    });
  }
});


// ======================================================
// CREATE CASE
// POST /api/v1/cases
// ======================================================

router.post('/', authenticate, requireRole(SystemRole.OFFICER, SystemRole.SYSTEM_ADMIN), async (req, res) => {
  try {
    const {
      caseNumber,
      assetId,
      title,
      description,
      emergencyFlag
    } = req.body;


    // --------------------------------------------------
    // Required field validation
    // --------------------------------------------------

    if (
      !caseNumber ||
      !assetId ||
      !title ||
      typeof caseNumber !== 'string' ||
      typeof assetId !== 'string' ||
      typeof title !== 'string' ||
      !caseNumber.trim() ||
      !assetId.trim() ||
      !title.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'caseNumber, assetId and title are required.'
        }
      });
    }


    // --------------------------------------------------
    // Check asset exists
    // --------------------------------------------------

    await assertCaseCreationAsset(assetId.trim(), req.user!);


    // --------------------------------------------------
    // Check duplicate case number
    // --------------------------------------------------

    const normalizedCaseNumber = caseNumber.trim();

    const existingCase = await prisma.case.findUnique({
      where: {
        caseNumber: normalizedCaseNumber
      }
    });

    if (existingCase) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CASE_NUMBER_EXISTS',
          message: 'A case with this case number already exists.'
        }
      });
    }


    // --------------------------------------------------
    // Create Case
    // --------------------------------------------------

    const newCase = await prisma.case.create({
      data: {
        caseNumber: normalizedCaseNumber,
        assetId: assetId.trim(),
        title: title.trim(),
        description:
          description !== undefined && description !== null
            ? String(description).trim()
            : null,
        emergencyFlag:
          emergencyFlag !== undefined
            ? Boolean(emergencyFlag)
            : false
      },
      include: {
        asset: {
          include: {
            department: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            jurisdiction: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }
      }
    });


    return res.status(201).json({
      success: true,
      data: newCase
    });

  } catch (error) {
    if (error instanceof ScopedResourceNotFoundError) {
      return res.status(404).json({ success: false, error: { code: 'ASSET_NOT_FOUND', message: 'Selected asset does not exist.' } });
    }
    console.error('Failed to create case:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'CASE_CREATE_FAILED',
        message: 'Could not create case.'
      }
    });
  }
});


// ======================================================
// GET INSPECTIONS FOR A CASE
// GET /api/v1/cases/:caseId/inspections
// ======================================================

router.get('/:caseId/inspections', authenticate, async (req, res) => {
  try {
    const caseId = Array.isArray(req.params.caseId) ? '' : req.params.caseId;

    if (!caseId || !caseId.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'caseId is required.' }
      });
    }

    await assertVisibleCase(caseId, req.user!);

    const inspections = await prisma.inspection.findMany({
      where: {
        caseId
      },
      include: {
        case: {
          include: {
            asset: {
              include: {
                department: {
                  select: {
                    id: true,
                    name: true,
                    code: true
                  }
                },
                jurisdiction: {
                  select: {
                    id: true,
                    name: true,
                    type: true
                  }
                }
              }
            }
          }
        },
        inspector: {
          select: {
            id: true,
            employeeCode: true,
            name: true,
            email: true,
            designation: true,
            role: true,
            status: true,
            departmentId: true,
            jurisdictionId: true,
            createdAt: true,
            updatedAt: true,
            department: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            jurisdiction: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      data: inspections
    });

  } catch (error) {
    if (error instanceof ScopedResourceNotFoundError) {
      return res.status(404).json({ success: false, error: { code: error.code, message: error.code === 'ASSET_NOT_FOUND' ? 'Selected asset does not exist.' : 'Case not found.' } });
    }
    console.error('Failed to fetch case inspections:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'CASE_INSPECTION_FETCH_FAILED',
        message: 'Could not fetch case inspections.'
      }
    });
  }
});


export default router;
