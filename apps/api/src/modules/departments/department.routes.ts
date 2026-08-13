import { Router } from 'express';
import prisma from '../../lib/prisma';
import { SystemRole } from '../../generated/prisma';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/require-role';
import { hasGlobalReadVisibility } from '../../security/organizational-scope';

const router = Router();

// GET /api/v1/departments
router.get('/', authenticate, async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      where: hasGlobalReadVisibility(req.user!) ? {} : { id: req.user!.departmentId },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Failed to fetch departments:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'DEPARTMENT_FETCH_FAILED',
        message: 'Could not fetch departments.'
      }
    });
  }
});

// POST /api/v1/departments
router.post('/', authenticate, requireRole(SystemRole.SYSTEM_ADMIN), async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Department name and code are required.'
        }
      });
    }

    const existingDepartment = await prisma.department.findUnique({
      where: {
        code: code.trim().toUpperCase()
      }
    });

    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DEPARTMENT_CODE_EXISTS',
          message: 'A department with this code already exists.'
        }
      });
    }

    const department = await prisma.department.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase()
      }
    });

    res.status(201).json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('Failed to create department:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'DEPARTMENT_CREATE_FAILED',
        message: 'Could not create department.'
      }
    });
  }
});

export default router;
