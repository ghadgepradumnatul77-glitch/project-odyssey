import { accessSync, constants, readFileSync, readdirSync, statfsSync, statSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const PILOT_POSTGRES_MAJOR = 16;
export const PILOT_MIN_BACKUP_FREE_BYTES = 10 * 1024 * 1024 * 1024;
export const PILOT_MIGRATION_COUNT = 27;

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requiredKeys = [
  'ODYSSEY_DB_USER', 'ODYSSEY_DB_NAME', 'ODYSSEY_DB_PASSWORD', 'ODYSSEY_DATABASE_URL',
  'JWT_SECRET', 'ODYSSEY_ALLOWED_ORIGINS', 'ODYSSEY_API_PUBLIC_BASE_URL',
  'ODYSSEY_WEB_PUBLIC_BASE_URL', 'ODYSSEY_TRUST_PROXY', 'ODYSSEY_INTELLIGENCE_ENABLED',
  'ODYSSEY_POSTGRES_MAJOR', 'ODYSSEY_API_BIND_HOST', 'ODYSSEY_WEB_BIND_HOST',
  'ODYSSEY_API_PORT', 'ODYSSEY_WEB_PORT', 'ODYSSEY_WEATHER_PROVIDER_ENABLED',
  'ODYSSEY_WEATHER_PROVIDER_DEPLOYMENT_CLASS'
];

const pass = (code, detail) => ({ code, status: 'PASS', detail });
const fail = (code, detail) => ({ code, status: 'FAIL', detail });
const placeholder = (value = '') => {
  const normalized = value.trim().toLowerCase();
  return !normalized || normalized.startsWith('replace-') || ['replace-me', 'changeme', 'change-me', 'secret', 'password'].includes(normalized) || normalized.includes('<');
};
const integerPort = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 65535 ? parsed : null;
};
const booleanValue = (value) => value === 'true' || value === 'false';

export function parseEnvText(text) {
  const values = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    values[key] = value;
  }
  return values;
}

function parseUrl(value) {
  try { return new URL(value); } catch { return null; }
}

export function validatePilotEnvironment(env) {
  const results = [];
  const missing = requiredKeys.filter((key) => !env[key]?.trim());
  results.push(missing.length ? fail('ENV_REQUIRED', `Missing required keys: ${missing.join(', ')}`) : pass('ENV_REQUIRED', 'All required pilot keys are present.'));

  const sensitiveKeys = ['ODYSSEY_DB_PASSWORD', 'ODYSSEY_DATABASE_URL', 'JWT_SECRET'];
  const placeholders = sensitiveKeys.filter((key) => placeholder(env[key]));
  results.push(placeholders.length ? fail('ENV_PLACEHOLDERS', `Placeholder values remain for: ${placeholders.join(', ')}`) : pass('ENV_PLACEHOLDERS', 'No deployment secret placeholder was detected.'));

  results.push(env.JWT_SECRET?.length >= 32 ? pass('JWT_SECRET_POLICY', 'JWT secret meets the minimum length contract.') : fail('JWT_SECRET_POLICY', 'JWT_SECRET must contain at least 32 characters.'));
  results.push(env.ODYSSEY_DB_PASSWORD?.length >= 16 && /^[A-Za-z0-9._~-]+$/.test(env.ODYSSEY_DB_PASSWORD)
    ? pass('DATABASE_PASSWORD_POLICY', 'Database password is URL-safe and meets the minimum length contract.')
    : fail('DATABASE_PASSWORD_POLICY', 'ODYSSEY_DB_PASSWORD must be URL-safe and contain at least 16 characters.'));

  const databaseUrl = parseUrl(env.ODYSSEY_DATABASE_URL);
  const databaseMatches = databaseUrl?.protocol === 'postgresql:' && databaseUrl.hostname === 'db' && databaseUrl.port === '5432'
    && decodeURIComponent(databaseUrl.username) === env.ODYSSEY_DB_USER
    && decodeURIComponent(databaseUrl.password) === env.ODYSSEY_DB_PASSWORD
    && databaseUrl.pathname === `/${env.ODYSSEY_DB_NAME}`;
  results.push(databaseMatches ? pass('DATABASE_URL_CONTRACT', 'Database URL targets the internal db service and configured database identity.') : fail('DATABASE_URL_CONTRACT', 'ODYSSEY_DATABASE_URL must target postgresql://<configured-user>@db:5432/<configured-database>.'));

  results.push(Number(env.ODYSSEY_POSTGRES_MAJOR) === PILOT_POSTGRES_MAJOR
    ? pass('POSTGRES_MAJOR', `Pilot PostgreSQL major is ${PILOT_POSTGRES_MAJOR}.`)
    : fail('POSTGRES_MAJOR', `Pilot PostgreSQL major must be ${PILOT_POSTGRES_MAJOR}; existing data must never be downgraded.`));

  const webUrl = parseUrl(env.ODYSSEY_WEB_PUBLIC_BASE_URL);
  const apiUrl = parseUrl(env.ODYSSEY_API_PUBLIC_BASE_URL);
  const webOriginOnly = webUrl && ['http:', 'https:'].includes(webUrl.protocol) && webUrl.pathname === '/' && !webUrl.search && !webUrl.hash && !webUrl.username && !webUrl.password;
  results.push(webOriginOnly ? pass('WEB_ENTRYPOINT', 'Web URL is a valid browser entrypoint origin.') : fail('WEB_ENTRYPOINT', 'ODYSSEY_WEB_PUBLIC_BASE_URL must be an HTTP(S) origin without credentials or a path.'));
  const sameOriginApi = webOriginOnly && apiUrl && apiUrl.origin === webUrl.origin && apiUrl.pathname.replace(/\/$/, '') === '/api/v1' && !apiUrl.search && !apiUrl.hash;
  results.push(sameOriginApi ? pass('API_ENTRYPOINT', 'Browser API uses the web entrypoint and same-origin /api/v1 proxy.') : fail('API_ENTRYPOINT', 'ODYSSEY_API_PUBLIC_BASE_URL must use the web origin with path /api/v1.'));

  const allowedOrigins = (env.ODYSSEY_ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean);
  results.push(webOriginOnly && allowedOrigins.length === 1 && allowedOrigins[0] === webUrl.origin
    ? pass('CORS_CONTRACT', 'CORS allowlist contains only the pilot web origin.')
    : fail('CORS_CONTRACT', 'ODYSSEY_ALLOWED_ORIGINS must contain exactly the pilot web origin.'));

  results.push(env.ODYSSEY_API_BIND_HOST === '127.0.0.1'
    ? pass('API_BINDING', 'Direct API publication is restricted to loopback.')
    : fail('API_BINDING', 'ODYSSEY_API_BIND_HOST must be 127.0.0.1 for the bounded pilot.'));
  results.push(env.ODYSSEY_WEB_BIND_HOST === '127.0.0.1'
    ? pass('WEB_BINDING', 'Pilot web publication is restricted to the single host until an approved TLS boundary exists.')
    : fail('WEB_BINDING', 'ODYSSEY_WEB_BIND_HOST must be 127.0.0.1 for P3.7.1.'));
  results.push(env.ODYSSEY_TRUST_PROXY === 'false'
    ? pass('PROXY_CONTRACT', 'Proxy trust is disabled for the loopback-only pilot.')
    : fail('PROXY_CONTRACT', 'ODYSSEY_TRUST_PROXY must be false until an approved proxy topology is deployed.'));

  const apiPort = integerPort(env.ODYSSEY_API_PORT);
  const webPort = integerPort(env.ODYSSEY_WEB_PORT);
  results.push(apiPort && webPort && apiPort !== webPort ? pass('PORT_CONFIG', 'API and web ports are valid and distinct.') : fail('PORT_CONFIG', 'API and web ports must be distinct integers from 1 to 65535.'));

  const intelligenceValid = booleanValue(env.ODYSSEY_INTELLIGENCE_ENABLED)
    && (env.ODYSSEY_INTELLIGENCE_ENABLED === 'false' || env.ODYSSEY_INTELLIGENCE_SERVICE_URL === 'http://ai:8000');
  results.push(intelligenceValid ? pass('AI_CONTRACT', 'Advisory AI is explicit, optional, internal, and non-authoritative.') : fail('AI_CONTRACT', 'AI must be explicitly disabled or use the internal http://ai:8000 service.'));

  const weatherDisabled = env.ODYSSEY_WEATHER_PROVIDER_ENABLED === 'false' && env.ODYSSEY_WEATHER_PROVIDER_DEPLOYMENT_CLASS === 'DISABLED';
  results.push(weatherDisabled ? pass('WEATHER_CONTRACT', 'Open-Meteo remains disabled in the production-mode pilot; its integration remains evaluation-only.') : fail('WEATHER_CONTRACT', 'The pilot must keep weather disabled; Open-Meteo may only remain EVALUATION_ONLY outside production operation.'));

  const mutationKeys = Object.keys(env).filter((key) => key.startsWith('ODYSSEY_DEMO_') || key.startsWith('C6_'));
  results.push(mutationKeys.length ? fail('NO_DEMO_MODE', `Demo/test mutation keys are forbidden: ${mutationKeys.join(', ')}`) : pass('NO_DEMO_MODE', 'No demo or test mutation configuration is present.'));
  return results;
}

export function probePort(host, port) {
  return new Promise((resolveProbe, reject) => {
    const server = createServer();
    server.unref();
    server.once('error', reject);
    server.listen({ host, port, exclusive: true }, () => server.close(() => resolveProbe()));
  });
}

function defaultCommand(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', shell: false, windowsHide: true });
  return { status: result.status, stdout: result.stdout || '', stderr: result.stderr || '', error: result.error };
}

function defaultReleaseIdentity(command) {
  const head = command('git', ['rev-parse', 'HEAD']);
  const origin = command('git', ['rev-parse', 'origin/master']);
  const branch = command('git', ['branch', '--show-current']);
  const status = command('git', ['status', '--porcelain']);
  const sha = head.stdout.trim();
  return {
    ok: head.status === 0 && origin.status === 0 && branch.status === 0 && status.status === 0
      && /^[0-9a-f]{40}$/.test(sha) && sha === origin.stdout.trim() && branch.stdout.trim() === 'master' && !status.stdout.trim(),
    sha
  };
}

export async function runPilotPreflight(input, overrides = {}) {
  const command = overrides.command || defaultCommand;
  const readText = overrides.readText || ((path) => readFileSync(path, 'utf8'));
  const migrations = overrides.migrationCount || (() => readdirSync(resolve(root, 'database/prisma/migrations'), { withFileTypes: true }).filter((entry) => entry.isDirectory()).length);
  const writable = overrides.writable || ((path) => {
    if (!statSync(path).isDirectory()) throw new Error('BACKUP_DESTINATION_NOT_DIRECTORY');
    accessSync(path, constants.W_OK);
    return true;
  });
  const freeBytes = overrides.freeBytes || ((path) => { const stats = statfsSync(path); return stats.bavail * stats.bsize; });
  const portProbe = overrides.portProbe || probePort;
  const releaseIdentity = overrides.releaseIdentity || (() => defaultReleaseIdentity(command));
  const envPath = resolve(root, input.envFile);
  const backupDirectory = resolve(input.backupDirectory);
  const results = [];
  let env = {};

  try { env = parseEnvText(readText(envPath)); results.push(pass('ENV_FILE', 'Pilot environment file is readable.')); }
  catch { results.push(fail('ENV_FILE', 'Pilot environment file cannot be read.')); }
  results.push(...validatePilotEnvironment(env));

  const docker = command('docker', ['version', '--format', '{{.Server.Version}}']);
  results.push(docker.status === 0 && docker.stdout.trim() ? pass('DOCKER_ENGINE', 'Docker engine is available.') : fail('DOCKER_ENGINE', 'Docker engine is unavailable. Preflight will not attempt repair.'));
  const compose = command('docker', ['compose', 'version', '--short']);
  results.push(compose.status === 0 && compose.stdout.trim() ? pass('DOCKER_COMPOSE', 'Docker Compose is available.') : fail('DOCKER_COMPOSE', 'Docker Compose is unavailable.'));
  const composeConfig = command('docker', ['compose', '--env-file', envPath, 'config', '--quiet']);
  results.push(composeConfig.status === 0 ? pass('COMPOSE_CONFIG', 'Compose configuration validates without starting services.') : fail('COMPOSE_CONFIG', 'Compose configuration validation failed.'));
  const images = command('docker', ['compose', '--env-file', envPath, 'config', '--images']);
  const configuredImages = images.stdout.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
  results.push(images.status === 0 && configuredImages.includes(`postgres:${PILOT_POSTGRES_MAJOR}`)
    ? pass('COMPOSE_POSTGRES_IMAGE', `Compose resolves PostgreSQL ${PILOT_POSTGRES_MAJOR}.`)
    : fail('COMPOSE_POSTGRES_IMAGE', `Compose must resolve postgres:${PILOT_POSTGRES_MAJOR}.`));

  try { writable(backupDirectory); results.push(pass('BACKUP_WRITABLE', 'Backup destination exists and is writable.')); }
  catch { results.push(fail('BACKUP_WRITABLE', 'Backup destination must already exist and be writable.')); }
  try {
    const available = freeBytes(backupDirectory);
    results.push(available >= PILOT_MIN_BACKUP_FREE_BYTES
      ? pass('BACKUP_FREE_SPACE', 'Backup destination meets the 10 GiB free-space threshold.')
      : fail('BACKUP_FREE_SPACE', 'Backup destination requires at least 10 GiB free space.'));
  } catch { results.push(fail('BACKUP_FREE_SPACE', 'Backup destination free space could not be determined.')); }

  const apiPort = integerPort(env.ODYSSEY_API_PORT);
  const webPort = integerPort(env.ODYSSEY_WEB_PORT);
  for (const [code, host, port] of [['API_PORT_AVAILABLE', env.ODYSSEY_API_BIND_HOST, apiPort], ['WEB_PORT_AVAILABLE', env.ODYSSEY_WEB_BIND_HOST, webPort]]) {
    if (!host || !port) { results.push(fail(code, 'Port configuration is invalid.')); continue; }
    try { await portProbe(host, port); results.push(pass(code, 'Required host port is available.')); }
    catch { results.push(fail(code, 'Required host port is already occupied.')); }
  }

  const migrationCount = migrations();
  results.push(migrationCount === PILOT_MIGRATION_COUNT
    ? pass('MIGRATION_COUNT', `Exactly ${PILOT_MIGRATION_COUNT} committed migrations are present.`)
    : fail('MIGRATION_COUNT', `Expected ${PILOT_MIGRATION_COUNT} committed migrations but found ${migrationCount}.`));
  const prisma = command(process.execPath, [resolve(root, 'node_modules/prisma/build/index.js'), 'validate', '--schema', 'database/prisma/schema.prisma']);
  results.push(prisma.status === 0 ? pass('PRISMA_SCHEMA', 'Prisma schema validates locally without database mutation.') : fail('PRISMA_SCHEMA', 'Prisma schema validation failed.'));
  const composeText = readText(resolve(root, 'docker-compose.yml'));
  results.push(/prisma", "migrate", "deploy/.test(readText(resolve(root, 'apps/api/Dockerfile'))) && /condition:\s*service_completed_successfully/.test(composeText)
    ? pass('MIGRATION_DEPLOY_GATE', 'One-shot migrate deploy remains the database-status prerequisite before API startup.')
    : fail('MIGRATION_DEPLOY_GATE', 'Migration deployment gate is missing or bypassed.'));

  const release = releaseIdentity();
  results.push(release.ok ? pass('RELEASE_IDENTITY', `Release is published clean master commit ${release.sha}.`) : fail('RELEASE_IDENTITY', 'Release must be a clean master commit matching the local origin/master reference.'));
  const forbiddenCommand = /\b(demo|bootstrap|seed|migrate\s+reset|test:e2e)\b/i.test(composeText);
  results.push(forbiddenCommand ? fail('NO_MUTATION_STARTUP', 'Compose contains a forbidden demo/test/reset startup command.') : pass('NO_MUTATION_STARTUP', 'Compose startup contains no demo, seed, test, or reset command.'));

  return { ok: results.every((result) => result.status === 'PASS'), results, release: release.sha || null };
}

function parseArguments(args) {
  const value = (name) => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : null; };
  const envFile = value('--env-file');
  const backupDirectory = value('--backup-dir');
  if (!envFile || !backupDirectory) throw new Error('PREFLIGHT_ARGUMENTS_REQUIRED');
  return { envFile, backupDirectory };
}

async function main() {
  try {
    const report = await runPilotPreflight(parseArguments(process.argv.slice(2)));
    console.log('ODYSSEY P3.7.1 PILOT PREFLIGHT');
    console.log(`CONTRACT: SINGLE_HOST / POSTGRESQL_${PILOT_POSTGRES_MAJOR} / LOOPBACK_WEB_ENTRYPOINT / OPTIONAL_AI`);
    for (const result of report.results) console.log(`${result.status} ${result.code}: ${result.detail}`);
    console.log(`PILOT_PREFLIGHT_STATUS=${report.ok ? 'PASS' : 'FAIL'}`);
    if (!report.ok) process.exitCode = 1;
  } catch {
    console.error('FAIL PREFLIGHT_ARGUMENTS: --env-file and --backup-dir are required.');
    console.error('PILOT_PREFLIGHT_STATUS=FAIL');
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
