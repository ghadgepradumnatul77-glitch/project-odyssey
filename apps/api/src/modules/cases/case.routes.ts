import { Router } from 'express';
import prisma from '../../lib/prisma';
import { CaseStatus, PriorityLevel, RiskLevel, SystemRole } from '../../generated/prisma';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/require-role';
import {
  assertCaseCreationAsset,
  assertVisibleCase,
  buildCaseReadWhere,
  ScopedResourceNotFoundError
} from '../../security/organizational-scope';
import { MAP_MAX_ITEMS, pageFromRows, parseCursor, parseEnum, parseLimit, parseSearch, parseUuidQuery, queryError } from '../../lib/pagination';

const router = Router();

// ======================================================
// GET ALL CASES
// GET /api/v1/cases
// ======================================================

router.get('/', authenticate, async (req, res) => {
  try {
    const map = req.query.map === undefined ? false : req.query.map === 'true' ? true : req.query.map === 'false' ? false : (() => { throw new Error('INVALID_MAP'); })();
    const limit = map ? MAP_MAX_ITEMS : parseLimit(req.query.limit);
    const cursor = map ? undefined : parseCursor(req.query.cursor);
    const search = parseSearch(req.query.search);
    const status = parseEnum(req.query.status, Object.values(CaseStatus), 'status');
    const riskLevel = parseEnum(req.query.risk, Object.values(RiskLevel), 'risk');
    const priorityLevel = parseEnum(req.query.priority, Object.values(PriorityLevel), 'priority');
    const departmentId = parseUuidQuery(req.query.departmentId ?? req.query.department, 'departmentId');
    const jurisdictionId = parseUuidQuery(req.query.jurisdictionId ?? req.query.jurisdiction, 'jurisdictionId');
    const emergencyFlag = req.query.emergency === undefined ? undefined : req.query.emergency === 'true' ? true : req.query.emergency === 'false' ? false : (() => { throw new Error('INVALID_EMERGENCY'); })();
    const cases = await prisma.case.findMany({
      where: {
        ...buildCaseReadWhere(req.user!),
        ...(cursor || search ? { AND: [cursor ? { OR: [{ createdAt: { lt: new Date(cursor.at) } }, { createdAt: new Date(cursor.at), id: { lt: cursor.id } }] } : {}, search ? { OR: [{ caseNumber: { contains: search, mode: 'insensitive' } }, { title: { contains: search, mode: 'insensitive' } }, { asset: { is: { OR: [{ assetCode: { contains: search, mode: 'insensitive' } }, { name: { contains: search, mode: 'insensitive' } }] } } }] } : {}] } : {}),
        ...(status ? { status } : {}), ...(riskLevel ? { riskLevel } : {}), ...(priorityLevel ? { priorityLevel } : {}),
        ...(emergencyFlag === undefined ? {} : { emergencyFlag }),
        ...(departmentId ? { asset: { is: { departmentId } } } : {}),
        ...(jurisdictionId ? { asset: { is: { jurisdictionId } } } : {})
      },
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
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1
    });

    return res.status(200).json({
      success: true,
      data: pageFromRows(cases, limit, (item) => item.createdAt.toISOString(), map ? { truncated: cases.length > limit } : {})
    });

  } catch (error) {
    const invalid = queryError(res, error);
    if (invalid) return invalid;
    if (error instanceof Error && error.message === 'INVALID_MAP') return res.status(400).json({ success: false, error: { code: 'INVALID_QUERY', message: 'map must be true or false.' } });
    if (error instanceof Error && error.message === 'INVALID_EMERGENCY') return res.status(400).json({ success: false, error: { code: 'INVALID_QUERY', message: 'emergency must be true or false.' } });
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

    const limit=parseLimit(req.query.limit),cursor=parseCursor(req.query.cursor);
    const inspections = await prisma.inspection.findMany({where:{caseId,...(cursor?{OR:[{createdAt:{lt:new Date(cursor.at)}},{createdAt:new Date(cursor.at),id:{lt:cursor.id}}]}:{})},select:{id:true,caseId:true,inspectionDate:true,structuralCondition:true,crackSeverity:true,corrosionLevel:true,trafficImportance:true,hospitalRoute:true,weatherRisk:true,heavyRainExpected:true,estimatedDailyUsers:true,inspectionNotes:true,createdAt:true,inspector:{select:{id:true,name:true,designation:true}}},orderBy:[{createdAt:'desc'},{id:'desc'}],take:limit+1});

    return res.status(200).json({
      success: true,
      data: pageFromRows(inspections,limit,item=>item.createdAt.toISOString())
    });

  } catch (error) {
    const invalid=queryError(res,error);if(invalid)return invalid;
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
