import { Router } from 'express';
import prisma from '../../lib/prisma';
import { CaseStatus, OrpDecisionType, SystemRole } from '../../generated/prisma';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/require-role';
import {
  assertOperationalCaseScope,
  buildInspectionReadWhere,
  ScopedResourceNotFoundError
} from '../../security/organizational-scope';
import { inspectionCreatedTransition } from '../../workflow/case-state-machine';

const router = Router();

// ======================================================
// GET ALL INSPECTIONS
// GET /api/v1/inspections
// ======================================================

router.get('/', authenticate, async (req, res) => {
  try {
    const inspections = await prisma.inspection.findMany({
      where: buildInspectionReadWhere(req.user!),
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
    console.error('Failed to fetch inspections:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'INSPECTION_FETCH_FAILED',
        message: 'Could not fetch inspections.'
      }
    });
  }
});


// ======================================================
// CREATE INSPECTION
// POST /api/v1/inspections
// ======================================================

router.post('/', authenticate, requireRole(SystemRole.OFFICER), async (req, res) => {
  try {
    const {
      caseId,
      inspectionDate,
      structuralCondition,
      crackSeverity,
      corrosionLevel,
      trafficImportance,
      hospitalRoute,
      weatherRisk,
      heavyRainExpected,
      estimatedDailyUsers,
      inspectionNotes
    } = req.body;


    // --------------------------------------------------
    // Required field validation & type checking
    // --------------------------------------------------

    if (
      !caseId || typeof caseId !== 'string' || !caseId.trim() ||
      !inspectionDate || (typeof inspectionDate !== 'string' && !(inspectionDate instanceof Date)) ||
      !structuralCondition || typeof structuralCondition !== 'string' || !structuralCondition.trim() ||
      !crackSeverity || typeof crackSeverity !== 'string' || !crackSeverity.trim() ||
      !corrosionLevel || typeof corrosionLevel !== 'string' || !corrosionLevel.trim() ||
      !trafficImportance || typeof trafficImportance !== 'string' || !trafficImportance.trim() ||
      typeof hospitalRoute !== 'boolean' ||
      !weatherRisk || typeof weatherRisk !== 'string' || !weatherRisk.trim() ||
      typeof heavyRainExpected !== 'boolean'
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'All required inspection fields must be provided with valid types.'
        }
      });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'inspectorId')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSPECTOR_ID_NOT_ALLOWED',
          message: 'inspectorId is derived from the authenticated identity and must not be supplied.'
        }
      });
    }

    const parsedDate = new Date(inspectionDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'inspectionDate must be a valid date.'
        }
      });
    }

    if (
      estimatedDailyUsers !== undefined &&
      estimatedDailyUsers !== null &&
      (typeof estimatedDailyUsers !== 'number' || isNaN(estimatedDailyUsers))
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'estimatedDailyUsers must be a valid number.'
        }
      });
    }


    // --------------------------------------------------
    // Verify Case exists
    // --------------------------------------------------

    const targetCase = await assertOperationalCaseScope(caseId.trim(), req.user!);

    const latestDecision = targetCase.status === CaseStatus.UNDER_REVIEW
      ? await prisma.orpDecision.findFirst({
          where: { caseId: targetCase.id },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          select: { decisionType: true }
        })
      : null;
    const nextStatus = inspectionCreatedTransition(targetCase.status, latestDecision?.decisionType as OrpDecisionType | undefined);
    if (!nextStatus) {
      return res.status(409).json({
        success: false,
        error: { code: 'INVALID_CASE_STATE', message: 'The Case is not in a state that permits a new inspection.' }
      });
    }


    // --------------------------------------------------
    // Verify Inspector User exists
    // --------------------------------------------------

    const inspector = await prisma.user.findUnique({
      where: {
        id: req.user!.id
      }
    });

    if (!inspector) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INSPECTOR_NOT_FOUND',
          message: 'Inspector not found.'
        }
      });
    }


    // --------------------------------------------------
    // Field Normalization (Categorical strings to UPPERCASE)
    // --------------------------------------------------

    const normalizedStructuralCondition = structuralCondition.trim().toUpperCase();
    const normalizedCrackSeverity = crackSeverity.trim().toUpperCase();
    const normalizedCorrosionLevel = corrosionLevel.trim().toUpperCase();
    const normalizedTrafficImportance = trafficImportance.trim().toUpperCase();
    const normalizedWeatherRisk = weatherRisk.trim().toUpperCase();


    // --------------------------------------------------
    // Create Inspection & Update Case Status if NEW
    // --------------------------------------------------

    const createdInspection = await prisma.$transaction(async (tx) => {
      const newInspection = await tx.inspection.create({
        data: {
          caseId: targetCase.id,
          inspectorId: inspector.id,
          inspectionDate: parsedDate,
          structuralCondition: normalizedStructuralCondition,
          crackSeverity: normalizedCrackSeverity,
          corrosionLevel: normalizedCorrosionLevel,
          trafficImportance: normalizedTrafficImportance,
          hospitalRoute: Boolean(hospitalRoute),
          weatherRisk: normalizedWeatherRisk,
          heavyRainExpected: Boolean(heavyRainExpected),
          estimatedDailyUsers:
            estimatedDailyUsers !== undefined && estimatedDailyUsers !== null
              ? Number(estimatedDailyUsers)
              : null,
          inspectionNotes:
            inspectionNotes !== undefined && inspectionNotes !== null
              ? String(inspectionNotes).trim()
              : null
        },
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
                select: { id: true, name: true, code: true }
              },
              jurisdiction: {
                select: { id: true, name: true, type: true }
              }
            }
          }
        }
      });

      if (targetCase.status !== nextStatus) {
        await tx.case.update({
          where: { id: targetCase.id },
          data: { status: nextStatus }
        });
      }

      return newInspection;
    });


    return res.status(201).json({
      success: true,
      data: createdInspection
    });

  } catch (error) {
    if (error instanceof ScopedResourceNotFoundError) {
      return res.status(404).json({ success: false, error: { code: 'CASE_NOT_FOUND', message: 'Case not found.' } });
    }
    console.error('Failed to create inspection:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'INSPECTION_CREATE_FAILED',
        message: 'Could not create inspection.'
      }
    });
  }
});


export default router;
