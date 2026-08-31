import { createHash, randomUUID } from 'node:crypto';
import { createReadStream, constants } from 'node:fs';
import { access, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const BACKUP_CONTRACT_VERSION = 'ODYSSEY_PILOT_BACKUP_V1';
export const PILOT_BACKUP_RPO_MS = 24 * 60 * 60 * 1000;

const safeStamp = (date) => date.toISOString().replace(/[:.]/g, '-');
const required = (value, code) => {
  if (!value?.trim()) throw new Error(code);
  return value.trim();
};

const postgresEnvironment = (databaseUrl) => {
  let url;
  try { url = new URL(databaseUrl); } catch { throw new Error('BACKUP_DATABASE_URL_INVALID'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || !url.username || !url.pathname.slice(1)) {
    throw new Error('BACKUP_DATABASE_URL_INVALID');
  }
  const environment = {
    PGHOST: url.hostname,
    PGPORT: url.port || '5432',
    PGDATABASE: decodeURIComponent(url.pathname.slice(1)),
    PGUSER: decodeURIComponent(url.username),
    PGPASSWORD: decodeURIComponent(url.password)
  };
  const sslMode = url.searchParams.get('sslmode');
  if (sslMode) environment.PGSSLMODE = sslMode;
  return environment;
};

export function backupPlan({ databaseUrl, outputDirectory, now = new Date(), runId = randomUUID() }) {
  const url = required(databaseUrl, 'BACKUP_DATABASE_URL_REQUIRED');
  const directory = path.resolve(required(outputDirectory, 'BACKUP_OUTPUT_DIRECTORY_REQUIRED'));
  let databaseName;
  try { databaseName = decodeURIComponent(new URL(url).pathname.replace(/^\//, '')); } catch { throw new Error('BACKUP_DATABASE_URL_INVALID'); }
  if (!databaseName) throw new Error('BACKUP_DATABASE_URL_INVALID');
  if (!/^[A-Za-z0-9-]{1,64}$/.test(runId)) throw new Error('BACKUP_RUN_ID_INVALID');
  const base = `odyssey-${safeStamp(now)}-${runId}`;
  const temporaryDump = path.join(directory, `.${base}-${runId}.dump.tmp`);
  return {
    directory, databaseName, createdAt: now.toISOString(),
    temporaryDump,
    temporaryChecksum: path.join(directory, `.${base}-${runId}.sha256.tmp`),
    temporaryManifest: path.join(directory, `.${base}-${runId}.manifest.json.tmp`),
    finalDump: path.join(directory, `${base}.dump`),
    finalChecksum: path.join(directory, `${base}.sha256`),
    finalManifest: path.join(directory, `${base}.manifest.json`),
    dumpCommand: { command: 'pg_dump', args: ['--format=custom', '--no-owner', '--no-privileges', '--file', temporaryDump] },
    validateCommand: { command: 'pg_restore', args: ['--list', temporaryDump] },
    safeSummary: { contractVersion: BACKUP_CONTRACT_VERSION, databaseName, createdAt: now.toISOString(), file: `${base}.dump` }
  };
}

function defaultRunCommand(command, args, databaseUrl) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'ignore', 'ignore'], shell: false, env: { ...process.env, ...postgresEnvironment(databaseUrl) } });
    child.once('error', () => reject(new Error('BACKUP_COMMAND_UNAVAILABLE')));
    child.once('exit', (code) => code === 0 ? resolvePromise(undefined) : reject(new Error(`BACKUP_COMMAND_FAILED:${command}:${code}`)));
  });
}

export function sha256File(file) {
  return new Promise((resolvePromise, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(file);
    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolvePromise(hash.digest('hex')));
  });
}

export async function runBackup({
  databaseUrl = process.env.ODYSSEY_DB_BACKUP_DATABASE_URL || process.env.DATABASE_URL,
  outputDirectory,
  now = new Date(),
  runId,
  runCommand = defaultRunCommand
} = {}) {
  const plan = backupPlan({ databaseUrl, outputDirectory, now, runId });
  const temporaryFiles = [plan.temporaryDump, plan.temporaryChecksum, plan.temporaryManifest];
  try {
    const destination = await stat(plan.directory);
    if (!destination.isDirectory()) throw new Error('BACKUP_DESTINATION_NOT_DIRECTORY');
    await access(plan.directory, constants.W_OK);
    await runCommand(plan.dumpCommand.command, plan.dumpCommand.args, databaseUrl);
    await runCommand(plan.validateCommand.command, plan.validateCommand.args, databaseUrl);
    const dump = await stat(plan.temporaryDump);
    if (!dump.isFile() || dump.size < 1) throw new Error('BACKUP_DUMP_EMPTY');
    const sha256 = await sha256File(plan.temporaryDump);
    const manifest = {
      contractVersion: BACKUP_CONTRACT_VERSION,
      databaseName: plan.databaseName,
      createdAt: plan.createdAt,
      file: path.basename(plan.finalDump),
      sizeBytes: dump.size,
      sha256
    };
    await writeFile(plan.temporaryChecksum, `${sha256}  ${path.basename(plan.finalDump)}\n`, { encoding: 'utf8', flag: 'wx' });
    await writeFile(plan.temporaryManifest, `${JSON.stringify(manifest, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
    await rename(plan.temporaryChecksum, plan.finalChecksum);
    await rename(plan.temporaryManifest, plan.finalManifest);
    await rename(plan.temporaryDump, plan.finalDump);
    console.log(JSON.stringify({ event: 'POSTGRES_BACKUP_CREATED', ...plan.safeSummary, sizeBytes: dump.size, sha256 }));
    return { ...manifest, dumpPath: plan.finalDump, checksumPath: plan.finalChecksum, manifestPath: plan.finalManifest };
  } catch (error) {
    await Promise.all(temporaryFiles.map((file) => rm(file, { force: true }).catch(() => undefined)));
    throw error;
  }
}

async function validManifest(directory, manifestFile) {
  try {
    const manifest = JSON.parse(await readFile(path.join(directory, manifestFile), 'utf8'));
    if (manifest.contractVersion !== BACKUP_CONTRACT_VERSION || typeof manifest.file !== 'string' || typeof manifest.sha256 !== 'string') return null;
    if (path.basename(manifest.file) !== manifest.file || !/^odyssey-[A-Za-z0-9-]+\.dump$/.test(manifest.file)) return null;
    if (manifestFile !== manifest.file.replace(/\.dump$/, '.manifest.json')) return null;
    const createdAt = new Date(manifest.createdAt);
    if (!Number.isFinite(createdAt.getTime())) return null;
    const dumpPath = path.join(directory, manifest.file);
    const checksumPath = path.join(directory, manifest.file.replace(/\.dump$/, '.sha256'));
    const dump = await stat(dumpPath);
    if (!dump.isFile() || dump.size !== manifest.sizeBytes) return null;
    const actual = await sha256File(dumpPath);
    const checksum = (await readFile(checksumPath, 'utf8')).trim();
    if (actual !== manifest.sha256 || checksum !== `${actual}  ${manifest.file}`) return null;
    return { createdAt, file: manifest.file, sha256: actual, sizeBytes: dump.size };
  } catch { return null; }
}

export async function backupStatus({ outputDirectory, now = new Date(), rpoMs = PILOT_BACKUP_RPO_MS } = {}) {
  const directory = path.resolve(required(outputDirectory, 'BACKUP_OUTPUT_DIRECTORY_REQUIRED'));
  let files;
  try { files = await readdir(directory); } catch { return { status: 'MISSING', checkedAt: now.toISOString(), rpoHours: rpoMs / 3_600_000, newest: null }; }
  const candidates = (await Promise.all(files.filter((file) => file.endsWith('.manifest.json')).map((file) => validManifest(directory, file)))).filter(Boolean);
  if (!candidates.length) return { status: 'MISSING', checkedAt: now.toISOString(), rpoHours: rpoMs / 3_600_000, newest: null };
  candidates.sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  const newest = candidates[0];
  const ageMs = Math.max(0, now.getTime() - newest.createdAt.getTime());
  return {
    status: ageMs <= rpoMs ? 'PASS' : 'STALE', checkedAt: now.toISOString(), rpoHours: rpoMs / 3_600_000,
    newest: { file: newest.file, createdAt: newest.createdAt.toISOString(), ageSeconds: Math.floor(ageMs / 1000), sizeBytes: newest.sizeBytes, sha256: newest.sha256 }
  };
}

function argument(args, name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
}

async function main(args) {
  const mode = args[0];
  const outputDirectory = argument(args, '--directory') || process.env.ODYSSEY_BACKUP_DIRECTORY;
  if (mode === 'create') {
    await runBackup({ outputDirectory });
    return 0;
  }
  if (mode === 'status') {
    const result = await backupStatus({ outputDirectory });
    console.log(JSON.stringify({ event: 'POSTGRES_BACKUP_STATUS', ...result }));
    return result.status === 'PASS' ? 0 : result.status === 'STALE' ? 2 : 3;
  }
  throw new Error('BACKUP_MODE_REQUIRED');
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) main(process.argv.slice(2)).then((code) => { process.exitCode = code; }).catch((error) => {
  console.error(error instanceof Error ? error.message : 'BACKUP_FAILED');
  process.exitCode = 1;
});
