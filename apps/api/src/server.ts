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


const app = express();

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

app.get('/api/v1/db-test', async (_req, res) => {

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

app.listen(port, () => {

  console.log(
    `ODYSSEY API running on http://localhost:${port}`
  );

});