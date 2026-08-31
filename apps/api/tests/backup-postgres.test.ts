import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// @ts-expect-error operator script intentionally remains plain ESM
import { BACKUP_CONTRACT_VERSION, backupPlan, backupStatus, runBackup } from '../../../scripts/backup-postgres.mjs';

const databaseUrl = 'postgresql://odyssey_backup:synthetic-secret@db:5432/odyssey';
let directory: string;

beforeEach(async () => { directory = await mkdtemp(path.join(tmpdir(), 'odyssey-backup-test-')); });
afterEach(async () => { await rm(directory, { recursive: true, force: true }); vi.restoreAllMocks(); });

const successfulCommands = async (command: string, args: string[]) => {
  if (command === 'pg_dump') await writeFile(args[args.indexOf('--file') + 1], 'synthetic-custom-format-dump');
  else if (command !== 'pg_restore') throw new Error('UNEXPECTED_COMMAND');
};

describe('PostgreSQL pilot backup operations', () => {
  it('creates a validated dump, checksum, and bounded manifest', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const result = await runBackup({ databaseUrl, outputDirectory: directory, now: new Date('2026-08-31T10:00:00Z'), runId: 'success', runCommand: successfulCommands });
    expect(await readFile(result.dumpPath, 'utf8')).toBe('synthetic-custom-format-dump');
    expect(await readFile(result.checksumPath, 'utf8')).toBe(`${result.sha256}  ${result.file}\n`);
    expect(JSON.parse(await readFile(result.manifestPath, 'utf8'))).toEqual(expect.objectContaining({ contractVersion: BACKUP_CONTRACT_VERSION, file: result.file, sha256: result.sha256, sizeBytes: 28 }));
  });

  it('validates with pg_restore before publishing the final filename', async () => {
    const commands: string[] = [];
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    await runBackup({ databaseUrl, outputDirectory: directory, runId: 'order', runCommand: async (command: string, args: string[]) => { commands.push(command); await successfulCommands(command, args); } });
    expect(commands).toEqual(['pg_dump', 'pg_restore']);
    expect((await readdir(directory)).some((file) => file.endsWith('.tmp'))).toBe(false);
  });

  it('removes only temporary files after validation failure', async () => {
    await expect(runBackup({ databaseUrl, outputDirectory: directory, runId: 'failed', runCommand: async (command: string, args: string[]) => {
      if (command === 'pg_dump') await successfulCommands(command, args);
      else throw new Error('VALIDATION_FAILED');
    } })).rejects.toThrow('VALIDATION_FAILED');
    expect(await readdir(directory)).toEqual([]);
  });

  it('reports PASS for the newest checksum-valid backup within 24 hours', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    await runBackup({ databaseUrl, outputDirectory: directory, now: new Date('2026-08-31T10:00:00Z'), runId: 'fresh', runCommand: successfulCommands });
    expect(await backupStatus({ outputDirectory: directory, now: new Date('2026-09-01T09:59:59Z') })).toEqual(expect.objectContaining({ status: 'PASS', rpoHours: 24 }));
  });

  it('reports STALE after the 24-hour RPO boundary', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    await runBackup({ databaseUrl, outputDirectory: directory, now: new Date('2026-08-30T10:00:00Z'), runId: 'stale', runCommand: successfulCommands });
    expect((await backupStatus({ outputDirectory: directory, now: new Date('2026-08-31T10:00:01Z') })).status).toBe('STALE');
  });

  it('reports MISSING when no complete valid backup exists', async () => {
    expect((await backupStatus({ outputDirectory: directory })).status).toBe('MISSING');
    await writeFile(path.join(directory, 'odyssey-invalid.manifest.json'), '{}');
    expect((await backupStatus({ outputDirectory: directory })).status).toBe('MISSING');
  });

  it('rejects a checksum-tampered dump from valid status', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const backup = await runBackup({ databaseUrl, outputDirectory: directory, runId: 'tamper', runCommand: successfulCommands });
    await writeFile(backup.dumpPath, 'tampered');
    expect((await backupStatus({ outputDirectory: directory })).status).toBe('MISSING');
  });

  it('does not leak credentials or delete older completed backups', async () => {
    const plan = backupPlan({ databaseUrl, outputDirectory: directory, now: new Date('2026-08-31T10:00:00Z'), runId: 'security' });
    expect(JSON.stringify({ dumpCommand: plan.dumpCommand, validateCommand: plan.validateCommand, safeSummary: plan.safeSummary })).not.toContain('synthetic-secret');
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    await runBackup({ databaseUrl, outputDirectory: directory, now: new Date('2026-08-30T10:00:00Z'), runId: 'old', runCommand: successfulCommands });
    await runBackup({ databaseUrl, outputDirectory: directory, now: new Date('2026-08-31T10:00:00Z'), runId: 'new', runCommand: successfulCommands });
    expect((await readdir(directory)).filter((file) => file.endsWith('.dump'))).toHaveLength(2);
    expect(JSON.stringify(log.mock.calls)).not.toContain('synthetic-secret');
  });
});
