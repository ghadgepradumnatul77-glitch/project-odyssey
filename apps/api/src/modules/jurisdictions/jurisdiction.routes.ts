import { Router } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

// GET /api/v1/jurisdictions
router.get('/', async (_req, res) => {
  try {
    const jurisdictions = await prisma.jurisdiction.findMany({
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      data: jurisdictions
    });
  } catch (error) {
    console.error('Failed to fetch jurisdictions:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'JURISDICTION_FETCH_FAILED',
        message: 'Could not fetch jurisdictions.'
      }
    });
  }
});

// POST /api/v1/jurisdictions
router.post('/', async (req, res) => {
  try {
    const { name, type, departmentId } = req.body;

    if (!name || !type || !departmentId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Name, type and departmentId are required.'
        }
      });
    }

    const department = await prisma.department.findUnique({
      where: {
        id: departmentId
      }
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DEPARTMENT_NOT_FOUND',
          message: 'The selected department does not exist.'
        }
      });
    }

    const jurisdiction = await prisma.jurisdiction.create({
      data: {
        name: name.trim(),
        type: type.trim().toUpperCase(),
        departmentId
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      data: jurisdiction
    });
  } catch (error) {
    console.error('Failed to create jurisdiction:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'JURISDICTION_CREATE_FAILED',
        message: 'Could not create jurisdiction.'
      }
    });
  }
});

export default router;