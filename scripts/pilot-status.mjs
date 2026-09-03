import { readFileSync, statfsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { backupStatus } from './backup-postgres.mjs';
import { parseEnvText, PILOT_MIN_BACKUP_FREE_BYTES } from './pilot-preflight.mjs';
import { parsePilotReadiness, validatePilotReadiness } from './pilot-readiness.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pass = (code, detail) => ({ code, status: 'PASS', detail });
const warn = (code, detail) => ({ code, status: 'WARN', detail });
const fail = (code, detail) => ({ code, status: 'FAIL', detail });

function defaultCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: root, encoding: 'utf8', shell: false, windowsHide: true, timeout: 5_000, maxBuffer: 1024 * 1024
  });
  return { status: result.status, stdout: result.stdout || '', stderr: result.stderr || '', error: result.error };
}

function composeArguments(input, args) {
  const result = ['compose'];
  if (input.projectName) result.push('--project-name', input.projectName);
  result.push('--env-file', input.envFile, ...args);
  return result;
}

export function parseComposeServices(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return trimmed.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  }
}

async function defaultReadiness(url, timeoutMs = 3_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    let body = null;
    try { body = await response.json(); } catch {}
    return { ok: response.ok, status: body?.data?.status };
  } finally { clearTimeout(timer); }
}

function overall(results) {
  if (results.some((result) => result.status === 'FAIL')) return 'FAIL';
  if (results.some((result) => result.status === 'WARN')) return 'WARN';
  return 'PASS';
}

export async function runPilotStatus(input, overrides = {}) {
  const command = overrides.command || defaultCommand;
  const readText = overrides.readText || ((path) => readFileSync(path, 'utf8'));
  const freeBytes = overrides.freeBytes || ((path) => { const value = statfsSync(path); return value.bavail * value.bsize; });
  const readBackupStatus = overrides.backupStatus || backupStatus;
  const readiness = overrides.readiness || defaultReadiness;
  const envPath = resolve(root, input.envFile);
  let env = overrides.env;
  const results = [];

  if (!env) {
    try { env = parseEnvText(readText(envPath)); }
    catch { env = {}; results.push(fail('ENV_FILE', 'Pilot environment file is unavailable.')); }
  }
  const backupDirectory = resolve(root, input.backupDirectory || env.ODYSSEY_BACKUP_DIRECTORY || '');
  const gitHead = overrides.releaseSha ? null : command('git', ['rev-parse', 'HEAD']);
  const currentReleaseSha = overrides.releaseSha || (gitHead?.status === 0 && /^[0-9a-f]{40}$/.test(gitHead.stdout.trim()) ? gitHead.stdout.trim() : 'UNAVAILABLE');

  try {
    const readinessPath = resolve(root, env.ODYSSEY_PILOT_READINESS_FILE || '');
    const readiness = parsePilotReadiness(readText(readinessPath));
    results.push(...validatePilotReadiness(readiness, {
      now: overrides.now || new Date(),
      releaseSha: currentReleaseSha,
      intelligenceEnabled: env.ODYSSEY_INTELLIGENCE_ENABLED === 'true'
    }));
  } catch {
    results.push(...validatePilotReadiness(null, {
      now: overrides.now || new Date(),
      releaseSha: currentReleaseSha,
      intelligenceEnabled: env.ODYSSEY_INTELLIGENCE_ENABLED === 'true'
    }));
  }

  const docker = command('docker', ['info', '--format', '{{.ServerVersion}}']);
  const dockerAvailable = docker.status === 0 && Boolean(docker.stdout.trim());
  results.push(dockerAvailable ? pass('DOCKER_ENGINE', 'Docker engine is available.') : fail('DOCKER_ENGINE', 'Docker engine is unavailable.'));
  const compose = command('docker', ['compose', 'version', '--short']);
  const composeAvailable = compose.status === 0 && Boolean(compose.stdout.trim());
  results.push(composeAvailable ? pass('DOCKER_COMPOSE', 'Docker Compose is available.') : fail('DOCKER_COMPOSE', 'Docker Compose is unavailable.'));

  if (dockerAvailable && composeAvailable) {
    const ps = command('docker', composeArguments({ ...input, envFile: envPath }, ['ps', '--all', '--format', 'json']));
    let services = [];
    try { services = ps.status === 0 ? parseComposeServices(ps.stdout) : []; } catch {}
    const byService = new Map(services.map((service) => [service.Service, service]));
    const expected = ['db', 'api', 'web', ...(env.ODYSSEY_INTELLIGENCE_ENABLED === 'true' ? ['ai'] : [])];
    const unhealthy = expected.filter((name) => {
      const service = byService.get(name);
      return !service || String(service.State).toLowerCase() !== 'running' || String(service.Health).toLowerCase() !== 'healthy';
    });
    results.push(!unhealthy.length
      ? pass('SERVICE_HEALTH', `Expected services are running and healthy: ${expected.join(', ')}.`)
      : fail('SERVICE_HEALTH', `Expected services are missing or unhealthy: ${unhealthy.join(', ')}.`));

    const migration = byService.get('migrate');
    const migrationPassed = migration && String(migration.State).toLowerCase() === 'exited' && Number(migration.ExitCode) === 0;
    results.push(migrationPassed
      ? pass('MIGRATION_COMPLETION', 'Migration service completed successfully.')
      : fail('MIGRATION_COMPLETION', 'Migration service completion is missing or unsuccessful.'));

    let restartTotal = 0;
    let restartUnknown = false;
    for (const name of expected) {
      const service = byService.get(name);
      const id = service?.ID || service?.Id;
      if (!id) { restartUnknown = true; continue; }
      const inspected = command('docker', ['inspect', '--format', '{{.RestartCount}}', id]);
      const count = Number(inspected.stdout.trim());
      if (inspected.status !== 0 || !Number.isInteger(count) || count < 0) restartUnknown = true;
      else restartTotal += count;
    }
    results.push(restartUnknown
      ? fail('RESTART_COUNTS', 'Container restart counts could not be determined.')
      : restartTotal > 0
        ? warn('RESTART_COUNTS', `${restartTotal} unexpected service restart(s) require operator review.`)
        : pass('RESTART_COUNTS', 'No service restarts were recorded.'));
  } else {
    results.push(fail('SERVICE_HEALTH', 'Service health cannot be checked without Docker and Compose.'));
    results.push(fail('MIGRATION_COMPLETION', 'Migration completion cannot be checked without Docker and Compose.'));
    results.push(fail('RESTART_COUNTS', 'Restart counts cannot be checked without Docker and Compose.'));
  }

  try {
    const web = new URL(env.ODYSSEY_WEB_PUBLIC_BASE_URL);
    const probe = await readiness(new URL('/api/v1/health/ready', web).toString(), 3_000);
    results.push(probe.ok && probe.status === 'READY'
      ? pass('WEB_API_READINESS', 'Public web-to-API readiness path reports READY.')
      : probe.ok && probe.status === 'DEGRADED'
        ? warn('WEB_API_READINESS', 'Public web-to-API readiness path reports DEGRADED.')
        : fail('WEB_API_READINESS', 'Public web-to-API readiness path is unavailable or not ready.'));
  } catch { results.push(fail('WEB_API_READINESS', 'Public web-to-API readiness path is unavailable or invalid.')); }

  try {
    const backup = await readBackupStatus({ outputDirectory: backupDirectory, now: overrides.now || new Date() });
    results.push(backup.status === 'PASS'
      ? pass('BACKUP_RPO', 'Newest checksum-valid backup meets the 24-hour RPO target.')
      : fail('BACKUP_RPO', backup.status === 'STALE' ? 'Newest valid backup exceeds the 24-hour RPO target.' : 'No valid backup is available.'));
  } catch { results.push(fail('BACKUP_RPO', 'Backup status could not be determined.')); }

  try {
    const available = freeBytes(backupDirectory);
    results.push(available >= PILOT_MIN_BACKUP_FREE_BYTES
      ? pass('BACKUP_FREE_SPACE', 'Backup destination meets the 10 GiB free-space threshold.')
      : fail('BACKUP_FREE_SPACE', 'Backup destination has less than 10 GiB free space.'));
  } catch { results.push(fail('BACKUP_FREE_SPACE', 'Backup destination free space could not be determined.')); }

  return { status: overall(results), results };
}

function parseArguments(args) {
  const value = (name) => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : null; };
  const envFile = value('--env-file');
  const backupDirectory = value('--backup-dir');
  if (!envFile || !backupDirectory) throw new Error('STATUS_ARGUMENTS_REQUIRED');
  return { envFile, backupDirectory, projectName: value('--project-name') || undefined };
}

async function main() {
  try {
    const report = await runPilotStatus(parseArguments(process.argv.slice(2)));
    console.log('ODYSSEY P3.7.4 PILOT OPERATOR STATUS');
    for (const result of report.results) console.log(`${result.status} ${result.code}: ${result.detail}`);
    console.log(`PILOT_OPERATOR_STATUS=${report.status}`);
    if (report.status === 'FAIL') process.exitCode = 1;
  } catch {
    console.error('FAIL STATUS_ARGUMENTS: --env-file and --backup-dir are required.');
    console.error('PILOT_OPERATOR_STATUS=FAIL');
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
