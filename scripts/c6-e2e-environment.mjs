import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const schema = 'odyssey_e2e_c6';
if (process.env.NODE_ENV?.trim().toLowerCase() === 'production') {
  throw new Error('TEST_HELPER_FORBIDDEN_IN_PRODUCTION: C6 isolated browser data setup cannot run when NODE_ENV=production.');
}
const envText = readFileSync(resolve(root, '.env'), 'utf8');
const baseUrl = envText.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim().replace(/^"|"$/g, '');
if (!baseUrl) throw new Error('C6_E2E_SAFETY: canonical DATABASE_URL is unavailable.');
const databaseUrl = `${baseUrl.replace(/\?.*$/, '')}?schema=${schema}`;
if (!schema.startsWith('odyssey_e2e_') || databaseUrl === baseUrl || /[?&]schema=(public|odyssey)(&|$)/i.test(databaseUrl)) {
  throw new Error('C6_E2E_SAFETY: refusing to target a canonical database schema.');
}

const mode = process.argv[2];
if (mode === 'url') {
  process.stdout.write(databaseUrl);
  process.exit(0);
}

process.env.DATABASE_URL = databaseUrl;
process.env.NODE_ENV = 'test';
const require = createRequire(import.meta.url);
const { PrismaClient } = require(resolve(root, 'apps/api/src/generated/prisma'));
const bcrypt = require(resolve(root, 'apps/api/node_modules/bcryptjs'));
const prisma = new PrismaClient();

async function prepare() {
  await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
  await prisma.$executeRawUnsafe(`CREATE OR REPLACE FUNCTION "${schema}".digest(value text, algorithm text) RETURNS bytea LANGUAGE SQL IMMUTABLE STRICT AS 'SELECT public.digest(value, algorithm)'`);
  const migrated = spawnSync(process.execPath, [resolve(root, 'node_modules/prisma/build/index.js'), 'migrate', 'deploy', '--schema', 'database/prisma/schema.prisma'], {
    cwd: root, env: process.env, stdio: 'inherit', windowsHide: true
  });
  if (migrated.status !== 0) throw new Error(`C6_E2E_SETUP: isolated schema migration failed${migrated.error ? `: ${migrated.error.message}` : '.'}`);
  const department = await prisma.department.create({ data: { name: 'C6 Synthetic Works Department', code: 'C6PWD' } });
  const jurisdiction = await prisma.jurisdiction.create({ data: { name: 'C6 Synthetic Division', type: 'DIVISION', departmentId: department.id } });
  const password = process.env.C6_E2E_PASSWORD || 'C6-Synthetic-Only-Password-2026!';
  const passwordHash = await bcrypt.hash(password, 4);
  const specs = [
    ['admin', 'C6-ADMIN-001', 'C6 System Administrator', 'c6.admin@example.test', 'System Administrator', 'SYSTEM_ADMIN'],
    ['primary', 'C6-OFFICER-001', 'C6 Primary Officer', 'c6.primary@example.test', 'Executive Engineer', 'OFFICER'],
    ['verifier', 'C6-OFFICER-002', 'C6 Independent Verifier', 'c6.verifier@example.test', 'Verification Engineer', 'OFFICER'],
    ['closer', 'C6-OFFICER-003', 'C6 Independent Closer', 'c6.closer@example.test', 'Superintending Engineer', 'OFFICER'],
    ['policy', 'C6-POLICY-001', 'C6 Policy Administrator', 'c6.policy@example.test', 'Policy Administrator', 'POLICY_ADMIN']
  ];
  const users = {};
  for (const [key, employeeCode, name, email, designation, role] of specs) {
    users[key] = await prisma.user.create({ data: { employeeCode, name, email, designation, role, passwordHash, departmentId: department.id, jurisdictionId: jurisdiction.id } });
  }
  await prisma.approvalAuthority.createMany({ data: [
    { userId: users.verifier.id, departmentId: department.id, jurisdictionId: jurisdiction.id, canApprove: true, canReject: true, canRequestModification: true, canRequestReinspection: true, maxPriorityLevel: 'CRITICAL' },
    { userId: users.closer.id, departmentId: department.id, jurisdictionId: jurisdiction.id, canCloseCase: true, maxPriorityLevel: 'CRITICAL' }
  ] });
  await prisma.asset.create({ data: { assetCode: 'C6-BROWSER-ASSET-001', name: 'C6 Synthetic Test Flyover', assetType: 'FLYOVER', conditionStatus: 'POOR', departmentId: department.id, jurisdictionId: jurisdiction.id } });
}

async function cleanup() {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
}

try {
  if (mode === 'prepare') { await cleanup(); await prepare(); }
  else if (mode === 'cleanup') await cleanup();
  else throw new Error('Usage: c6-e2e-environment.mjs prepare|cleanup|url');
} finally {
  await prisma.$disconnect();
}
