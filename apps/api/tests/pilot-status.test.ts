import { describe, expect, it, vi } from 'vitest';
// @ts-expect-error operator script intentionally remains plain ESM
import { runPilotStatus } from '../../../scripts/pilot-status.mjs';
import { PILOT_MIN_BACKUP_FREE_BYTES } from '../../../scripts/pilot-preflight.mjs';

const env = {
  ODYSSEY_WEB_PUBLIC_BASE_URL: 'http://127.0.0.1:8080',
  ODYSSEY_BACKUP_DIRECTORY: 'backups',
  ODYSSEY_INTELLIGENCE_ENABLED: 'false'
};
const services = (overrides: Record<string, Partial<Record<string, unknown>>> = {}) => [
  { Service: 'db', ID: 'db-id', State: 'running', Health: 'healthy', ...overrides.db },
  { Service: 'api', ID: 'api-id', State: 'running', Health: 'healthy', ...overrides.api },
  { Service: 'web', ID: 'web-id', State: 'running', Health: 'healthy', ...overrides.web },
  { Service: 'migrate', ID: 'migration-id', State: 'exited', Health: '', ExitCode: 0, ...overrides.migrate }
];

function harness(options: {
  serviceOverrides?: Record<string, Partial<Record<string, unknown>>>;
  restarts?: Record<string, number>;
  dockerAvailable?: boolean;
  composeAvailable?: boolean;
  readiness?: { ok: boolean; status?: string } | Error;
  backup?: 'PASS' | 'STALE' | 'MISSING';
  freeBytes?: number;
  sensitiveFailure?: string;
} = {}) {
  const calls: Array<{ command: string; args: string[] }> = [];
  const command = vi.fn((command: string, args: string[]) => {
    calls.push({ command, args });
    if (args[0] === 'info') return { status: options.dockerAvailable === false ? 1 : 0, stdout: options.dockerAvailable === false ? '' : '29.7.2', stderr: options.sensitiveFailure || '' };
    if (args[0] === 'compose' && args[1] === 'version') return { status: options.composeAvailable === false ? 1 : 0, stdout: options.composeAvailable === false ? '' : '5.4.0', stderr: '' };
    if (args[0] === 'compose' && args.includes('ps')) return { status: 0, stdout: JSON.stringify(services(options.serviceOverrides)), stderr: '' };
    if (args[0] === 'inspect') return { status: 0, stdout: String(options.restarts?.[args.at(-1)!] || 0), stderr: '' };
    throw new Error(`UNEXPECTED_COMMAND:${command}:${args.join(' ')}`);
  });
  const readiness = vi.fn(async () => {
    if (options.readiness instanceof Error) throw options.readiness;
    return options.readiness || { ok: true, status: 'READY' };
  });
  const backupStatus = vi.fn(async () => ({ status: options.backup || 'PASS' }));
  const report = runPilotStatus(
    { envFile: '.env.pilot', backupDirectory: 'backups' },
    { env, command, readiness, backupStatus, freeBytes: () => options.freeBytes ?? PILOT_MIN_BACKUP_FREE_BYTES, now: new Date('2026-08-31T12:00:00Z') }
  );
  return { report, calls, command, readiness, backupStatus };
}

const check = (report: Awaited<ReturnType<typeof runPilotStatus>>, code: string) => report.results.find((result) => result.code === code)?.status;

describe('pilot operator status', () => {
  it('reports PASS for a healthy read-only pilot and invokes no mutation commands', async () => {
    const { report, calls, readiness, backupStatus } = harness();
    const value = await report;
    expect(value.status).toBe('PASS');
    expect(value.results.every((result) => result.status === 'PASS')).toBe(true);
    expect(readiness).toHaveBeenCalledWith('http://127.0.0.1:8080/api/v1/health/ready', 3000);
    expect(backupStatus).toHaveBeenCalledOnce();
    const serialized = JSON.stringify(calls);
    expect(serialized).not.toMatch(/\b(up|start|stop|restart|down|run|exec|migrate|restore|reset|seed|backup)\b/i);
  });

  it('fails when an expected service is unhealthy', async () => {
    const value = await harness({ serviceOverrides: { api: { Health: 'unhealthy' } } }).report;
    expect(value.status).toBe('FAIL');
    expect(check(value, 'SERVICE_HEALTH')).toBe('FAIL');
  });

  it('warns without failing when a service restart is recorded', async () => {
    const value = await harness({ restarts: { 'api-id': 2 } }).report;
    expect(value.status).toBe('WARN');
    expect(check(value, 'RESTART_COUNTS')).toBe('WARN');
  });

  it('fails when migration completion is unsuccessful', async () => {
    const value = await harness({ serviceOverrides: { migrate: { ExitCode: 1 } } }).report;
    expect(value.status).toBe('FAIL');
    expect(check(value, 'MIGRATION_COMPLETION')).toBe('FAIL');
  });

  it('fails when the public web-to-API readiness path fails', async () => {
    const value = await harness({ readiness: { ok: false } }).report;
    expect(value.status).toBe('FAIL');
    expect(check(value, 'WEB_API_READINESS')).toBe('FAIL');
  });

  it.each(['STALE', 'MISSING'] as const)('fails for %s backup status', async (backup) => {
    const value = await harness({ backup }).report;
    expect(value.status).toBe('FAIL');
    expect(check(value, 'BACKUP_RPO')).toBe('FAIL');
  });

  it('fails when backup disk space is below the pilot threshold', async () => {
    const value = await harness({ freeBytes: PILOT_MIN_BACKUP_FREE_BYTES - 1 }).report;
    expect(value.status).toBe('FAIL');
    expect(check(value, 'BACKUP_FREE_SPACE')).toBe('FAIL');
  });

  it('fails safely when Docker is unavailable', async () => {
    const value = await harness({ dockerAvailable: false }).report;
    expect(value.status).toBe('FAIL');
    expect(check(value, 'DOCKER_ENGINE')).toBe('FAIL');
    expect(check(value, 'SERVICE_HEALTH')).toBe('FAIL');
  });

  it('never exposes sensitive command or probe failures', async () => {
    const secret = 'postgresql://owner:real-secret@db/odyssey';
    const value = await harness({ dockerAvailable: false, sensitiveFailure: secret, readiness: new Error(`Bearer ${secret}`) }).report;
    expect(JSON.stringify(value)).not.toContain(secret);
    expect(JSON.stringify(value)).not.toContain('Bearer');
  });
});
