import { Router } from 'express';
import prisma from '../../lib/prisma';
import { SystemRole } from '../../generated/prisma';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/require-role';

const router = Router();

// ======================================================
// GET ALL ASSETS
// GET /api/v1/assets
// ======================================================

router.get('/', authenticate, async (_req, res) => {
  try {
    const assets = await prisma.asset.findMany({
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
      },

      orderBy: {
        createdAt: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      data: assets
    });

  } catch (error) {
    console.error('Failed to fetch assets:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'ASSET_FETCH_FAILED',
        message: 'Could not fetch assets.'
      }
    });
  }
});


// ======================================================
// CREATE ASSET
// POST /api/v1/assets
// ======================================================

router.post('/', authenticate, requireRole(SystemRole.SYSTEM_ADMIN), async (req, res) => {
  try {
    const {
      assetCode,
      name,
      assetType,
      departmentId,
      jurisdictionId,
      latitude,
      longitude,
      constructionYear,
      conditionStatus
    } = req.body;


    // --------------------------------------------------
    // Required field validation
    // --------------------------------------------------

    if (
      !assetCode ||
      !name ||
      !assetType ||
      !departmentId ||
      !jurisdictionId
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message:
            'assetCode, name, assetType, departmentId and jurisdictionId are required.'
        }
      });
    }


    // --------------------------------------------------
    // Asset type validation
    // --------------------------------------------------

    const normalizedAssetType =
      String(assetType).trim().toUpperCase();

    const allowedAssetTypes = [
      'BRIDGE',
      'ROAD',
      'FLYOVER'
    ];

    if (!allowedAssetTypes.includes(normalizedAssetType)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ASSET_TYPE',
          message:
            'Asset type must be BRIDGE, ROAD or FLYOVER.'
        }
      });
    }


    // --------------------------------------------------
    // Check department
    // --------------------------------------------------

    const department =
      await prisma.department.findUnique({
        where: {
          id: departmentId
        }
      });

    if (!department) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DEPARTMENT_NOT_FOUND',
          message:
            'Selected department does not exist.'
        }
      });
    }


    // --------------------------------------------------
    // Check jurisdiction
    // --------------------------------------------------

    const jurisdiction =
      await prisma.jurisdiction.findUnique({
        where: {
          id: jurisdictionId
        }
      });

    if (!jurisdiction) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'JURISDICTION_NOT_FOUND',
          message:
            'Selected jurisdiction does not exist.'
        }
      });
    }


    // --------------------------------------------------
    // Check jurisdiction belongs to department
    // --------------------------------------------------

    if (jurisdiction.departmentId !== departmentId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'JURISDICTION_DEPARTMENT_MISMATCH',
          message:
            'Selected jurisdiction does not belong to the selected department.'
        }
      });
    }


    // --------------------------------------------------
    // Check duplicate asset code
    // --------------------------------------------------

    const normalizedAssetCode =
      String(assetCode).trim().toUpperCase();

    const existingAsset =
      await prisma.asset.findUnique({
        where: {
          assetCode: normalizedAssetCode
        }
      });

    if (existingAsset) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'ASSET_CODE_EXISTS',
          message:
            'An asset with this code already exists.'
        }
      });
    }


    // --------------------------------------------------
    // Create Asset
    // --------------------------------------------------

    const asset = await prisma.asset.create({
      data: {
        assetCode: normalizedAssetCode,

        name: String(name).trim(),

        assetType:
          normalizedAssetType as
            | 'BRIDGE'
            | 'ROAD'
            | 'FLYOVER',

        departmentId,

        jurisdictionId,

        latitude:
          latitude !== undefined &&
          latitude !== null
            ? Number(latitude)
            : null,

        longitude:
          longitude !== undefined &&
          longitude !== null
            ? Number(longitude)
            : null,

        constructionYear:
          constructionYear !== undefined &&
          constructionYear !== null
            ? Number(constructionYear)
            : null,

        conditionStatus:
          conditionStatus
            ? String(conditionStatus)
                .trim()
                .toUpperCase()
            : null
      },

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
    });


    return res.status(201).json({
      success: true,
      data: asset
    });

  } catch (error) {
    console.error('Failed to create asset:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'ASSET_CREATE_FAILED',
        message:
          'Could not create asset.'
      }
    });
  }
});


export default router;
