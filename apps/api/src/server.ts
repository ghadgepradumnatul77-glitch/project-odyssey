import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import prisma from './lib/prisma';

import departmentRoutes
  from './modules/departments/department.routes';

import jurisdictionRoutes
  from './modules/jurisdictions/jurisdiction.routes';

import userRoutes
  from './modules/users/user.routes';

import assetRoutes
  from './modules/assets/asset.routes';

import caseRoutes
  from './modules/cases/case.routes';

import inspectionRoutes
  from './modules/inspections/inspection.routes';

import riskRoutes
  from './modules/risk/risk.routes';

import orpRoutes
  from './modules/orp/orp.routes';

import decisionRoutes
  from './modules/decisions/decision.routes';

import authorityRoutes
  from './modules/authorities/authority.routes';

import authRoutes
  from './modules/auth/auth.routes';
import executionRoutes
  from './modules/execution/execution.routes';
import caseClosureRoutes
  from './modules/closures/case-closure.routes';
import reportingRoutes
  from './modules/reporting/reporting.routes';
import publicReportRoutes
  from './modules/public-reports/public-report.routes';
import publicTrackingRoutes
  from './modules/public-reports/public-tracking.routes';
import policyRegistryRoutes
  from './modules/policy-registry/policy-registry.routes';
import readinessRoutes
  from './modules/readiness/readiness.routes';
import decisionPackageRoutes
  from './modules/decision-packages/decision-package.routes';

import { getAuthConfig }
  from './config/auth';
import { authenticate }
  from './middleware/authenticate';
import { requireRole }
  from './middleware/require-role';
import { SystemRole }
  from './generated/prisma';


const app = express();

// Validate authentication configuration during startup, before accepting traffic.
getAuthConfig();

const port =
  Number(process.env.API_PORT || 4000);


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(helmet());

app.use(
  cors({
    origin:
      process.env.WEB_ORIGIN ||
      'http://localhost:5173',

    credentials: true
  })
);

app.use(
  express.json({
    limit: '1mb'
  })
);


// ======================================================
// HEALTH CHECK
// ======================================================

app.get('/api/v1/health', (_req, res) => {

  return res.status(200).json({
    success: true,

    data: {
      service: 'odyssey-api',
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  });

});


// ======================================================
// DATABASE TEST
// ======================================================

app.get('/api/v1/db-test', authenticate, requireRole(SystemRole.SYSTEM_ADMIN), async (_req, res) => {

  try {

    const departments =
      await prisma.department.count();

    const jurisdictions =
      await prisma.jurisdiction.count();

    const users =
      await prisma.user.count();

    const assets =
      await prisma.asset.count();


    return res.status(200).json({
      success: true,

      data: {
        database: 'connected',
        departments,
        jurisdictions,
        users,
        assets
      }
    });

  } catch (error) {

    console.error(
      'Database test failed:',
      error
    );


    return res.status(500).json({
      success: false,

      error: {
        code: 'DATABASE_CONNECTION_FAILED',
        message:
          'Could not connect to the ODYSSEY database.'
      }
    });
  }

});


// ======================================================
// ODYSSEY API ROUTES
// ======================================================

app.use(
  '/api/v1',
  authRoutes
);

app.use(
  '/api/v1/departments',
  departmentRoutes
);

app.use(
  '/api/v1/jurisdictions',
  jurisdictionRoutes
);

app.use(
  '/api/v1/users',
  userRoutes
);

app.use(
  '/api/v1/assets',
  assetRoutes
);

app.use(
  '/api/v1/cases',
  caseRoutes
);

app.use(
  '/api/v1/cases',
  riskRoutes
);

app.use(
  '/api/v1/inspections',
  inspectionRoutes
);

app.use(
  '/api/v1',
  orpRoutes
);

app.use(
  '/api/v1',
  decisionRoutes
);

app.use(
  '/api/v1',
  executionRoutes
);

app.use(
  '/api/v1',
  caseClosureRoutes
);

app.use(
  '/api/v1',
  reportingRoutes
);

app.use(
  '/api/v1',
  authorityRoutes
);

app.use(
  '/api/v1/public-reports',
  publicReportRoutes
);

app.use(
  '/api/v1/public/tracking',
  publicTrackingRoutes
);

app.use('/api/v1', policyRegistryRoutes);

app.use('/api/v1', readinessRoutes);

app.use('/api/v1', decisionPackageRoutes);



// ======================================================
// 404 ROUTE
// ======================================================

app.use((_req, res) => {

  return res.status(404).json({
    success: false,

    error: {
      code: 'ROUTE_NOT_FOUND',
      message:
        'The requested ODYSSEY API route does not exist.'
    }
  });

});


// ======================================================
// START SERVER
// ======================================================

if (process.env.NODE_ENV !== 'test') app.listen(port, () => {

  console.log(
    `ODYSSEY API running on http://localhost:${port}`
  );

});

export { app };
