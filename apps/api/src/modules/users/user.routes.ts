import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';
import { SystemRole } from '../../generated/prisma';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/require-role';
import { pageFromRows, parseCursor, parseEnum, parseLimit, parseSearch, parseUuidQuery, queryError } from '../../lib/pagination';
import { UserStatus } from '../../generated/prisma';

const router = Router();
router.use(authenticate, requireRole(SystemRole.SYSTEM_ADMIN));

// ======================================================
// GET ALL USERS
// GET /api/v1/users
// ======================================================

router.get('/', async (req, res) => {
  try {
    const limit=parseLimit(req.query.limit),cursor=parseCursor(req.query.cursor),search=parseSearch(req.query.search);
    const role=parseEnum(req.query.role,Object.values(SystemRole),'role'),status=parseEnum(req.query.status,Object.values(UserStatus),'status'),departmentId=parseUuidQuery(req.query.departmentId,'departmentId'),jurisdictionId=parseUuidQuery(req.query.jurisdictionId,'jurisdictionId');
    const users = await prisma.user.findMany({
      where:{...(role?{role}:{}),...(status?{status}:{}),...(departmentId?{departmentId}:{}),...(jurisdictionId?{jurisdictionId}:{}),AND:[search?{OR:[{name:{contains:search,mode:'insensitive'}},{employeeCode:{contains:search,mode:'insensitive'}},{email:{contains:search,mode:'insensitive'}}]}:{},cursor?{OR:[{createdAt:{lt:new Date(cursor.at)}},{createdAt:new Date(cursor.at),id:{lt:cursor.id}}]}:{}]},
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
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: limit + 1
    });

    return res.status(200).json({
      success: true,
      data: pageFromRows(users,limit,(item)=>item.createdAt.toISOString())
    });

  } catch (error) {
    const invalid=queryError(res,error);if(invalid)return invalid;
    console.error('Failed to fetch users:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'USER_FETCH_FAILED',
        message: 'Could not fetch users.'
      }
    });
  }
});


// ======================================================
// CREATE USER
// POST /api/v1/users
// ======================================================

router.post('/', async (req, res) => {
  try {
    const {
      employeeCode,
      name,
      email,
      password,
      designation,
      role,
      departmentId,
      jurisdictionId
    } = req.body;

    // --------------------------------------------------
    // Required field validation
    // --------------------------------------------------

    if (
      !employeeCode ||
      !name ||
      !email ||
      !password ||
      !designation ||
      !departmentId ||
      !jurisdictionId
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message:
            'employeeCode, name, email, password, designation, departmentId and jurisdictionId are required.'
        }
      });
    }

    // --------------------------------------------------
    // Password validation
    // --------------------------------------------------

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: 'Password must contain at least 8 characters.'
        }
      });
    }

    // --------------------------------------------------
    // Verify Department
    // --------------------------------------------------

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
          message: 'Selected department does not exist.'
        }
      });
    }

    // --------------------------------------------------
    // Verify Jurisdiction
    // --------------------------------------------------

    const jurisdiction = await prisma.jurisdiction.findUnique({
      where: {
        id: jurisdictionId
      }
    });

    if (!jurisdiction) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'JURISDICTION_NOT_FOUND',
          message: 'Selected jurisdiction does not exist.'
        }
      });
    }

    // Jurisdiction must belong to the selected department
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
    // Check employee code
    // --------------------------------------------------

    const normalizedEmployeeCode = employeeCode.trim().toUpperCase();

    const employeeExists = await prisma.user.findUnique({
      where: {
        employeeCode: normalizedEmployeeCode
      }
    });

    if (employeeExists) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMPLOYEE_CODE_EXISTS',
          message: 'Employee code already exists.'
        }
      });
    }

    // --------------------------------------------------
    // Check email
    // --------------------------------------------------

    const normalizedEmail = email.trim().toLowerCase();

    const emailExists = await prisma.user.findUnique({
      where: {
        email: normalizedEmail
      }
    });

    if (emailExists) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email already exists.'
        }
      });
    }

    // --------------------------------------------------
    // Validate system role
    // --------------------------------------------------

    const allowedRoles = [
      'OFFICER',
      'POLICY_ADMIN',
      'AUDITOR',
      'SYSTEM_ADMIN'
    ];

    const normalizedRole = role
      ? role.trim().toUpperCase()
      : 'OFFICER';

    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ROLE',
          message:
            'Role must be OFFICER, POLICY_ADMIN, AUDITOR or SYSTEM_ADMIN.'
        }
      });
    }

    // --------------------------------------------------
    // Hash password
    // --------------------------------------------------

    const passwordHash = await bcrypt.hash(password, 12);

    // --------------------------------------------------
    // Create User
    // --------------------------------------------------

    const user = await prisma.user.create({
      data: {
        employeeCode: normalizedEmployeeCode,
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        designation: designation.trim(),
        role: normalizedRole as
          | 'OFFICER'
          | 'POLICY_ADMIN'
          | 'AUDITOR'
          | 'SYSTEM_ADMIN',
        departmentId,
        jurisdictionId
      },

      // Never return passwordHash
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
      data: user
    });

  } catch (error) {
    console.error('Failed to create user:', error);

    return res.status(500).json({
      success: false,
      error: {
        code: 'USER_CREATE_FAILED',
        message: 'Could not create user.'
      }
    });
  }
});

export default router;
