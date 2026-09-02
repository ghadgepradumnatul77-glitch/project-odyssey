import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { containsForbiddenStartupCommand, PILOT_MIGRATION_COUNT, PILOT_POSTGRES_MAJOR, runPilotPreflight } from '../../../scripts/pilot-preflight.mjs';

const releaseSha = 'a'.repeat(40);
const validEnv = (overrides: Record<string, string> = {}) => ({
  ODYSSEY_DB_NAME: 'odyssey',
  ODYSSEY_POSTGRES_MAJOR: String(PILOT_POSTGRES_MAJOR),
  ODYSSEY_DB_OWNER_USER: 'odyssey_owner',
  ODYSSEY_DB_OWNER_PASSWORD: 'valid-owner-password-123',
  ODYSSEY_DB_OWNER_DATABASE_URL: 'postgresql://odyssey_owner:valid-owner-password-123@db:5432/odyssey',
  ODYSSEY_DB_MIGRATION_USER: 'odyssey_migration',
  ODYSSEY_DB_MIGRATION_PASSWORD: 'valid-migration-password-123',
  ODYSSEY_DB_MIGRATION_DATABASE_URL: 'postgresql://odyssey_migration:valid-migration-password-123@db:5432/odyssey',
  ODYSSEY_DB_RUNTIME_USER: 'odyssey_runtime',
  ODYSSEY_DB_RUNTIME_PASSWORD: 'valid-runtime-password-123',
  ODYSSEY_DB_RUNTIME_DATABASE_URL: 'postgresql://odyssey_runtime:valid-runtime-password-123@db:5432/odyssey',
  ODYSSEY_DB_BACKUP_USER: 'odyssey_backup',
  ODYSSEY_DB_BACKUP_PASSWORD: 'valid-backup-password-123',
  ODYSSEY_DB_BACKUP_DATABASE_URL: 'postgresql://odyssey_backup:valid-backup-password-123@db:5432/odyssey',
  ODYSSEY_BACKUP_DIRECTORY: 'backups',
  JWT_SECRET: 'valid-jwt-secret-at-least-32-characters',
  ODYSSEY_ALLOWED_ORIGINS: 'http://localhost:8080',
  ODYSSEY_API_PUBLIC_BASE_URL: 'http://localhost:8080/api/v1',
  ODYSSEY_WEB_PUBLIC_BASE_URL: 'http://localhost:8080',
  ODYSSEY_TRUST_PROXY: 'false',
  ODYSSEY_WEB_BIND_HOST: '127.0.0.1',
  ODYSSEY_API_BIND_HOST: '127.0.0.1',
  ODYSSEY_WEB_PORT: '8080',
  ODYSSEY_API_PORT: '4000',
  ODYSSEY_INTELLIGENCE_ENABLED: 'false',
  ODYSSEY_INTELLIGENCE_SERVICE_URL: 'http://ai:8000',
  ODYSSEY_WEATHER_PROVIDER_ENABLED: 'false',
  ODYSSEY_WEATHER_PROVIDER_DEPLOYMENT_CLASS: 'DISABLED',
  ...overrides
});

const envText = (env: Record<string, string>) => Object.entries(env).map(([key, value]) => `${key}=${value}`).join('\n');
const status = (report: Awaited<ReturnType<typeof runPilotPreflight>>, code: string) => report.results.find((result) => result.code === code)?.status;

function harness(options: {
  env?: Record<string, string>;
  command?: (command: string, args: string[]) => { status: number | null; stdout: string; stderr: string };
  migrationCount?: number;
  writable?: () => boolean;
  freeBytes?: number;
  portProbe?: (host: string, port: number) => Promise<void>;
  releaseOk?: boolean;
} = {}) {
  const calls: Array<{ command: string; args: string[] }> = [];
  const command = vi.fn((commandName: string, args: string[]) => {
    calls.push({ command: commandName, args });
    if (options.command) return options.command(commandName, args);
    if (commandName === 'docker' && args[0] === 'version') return { status: 0, stdout: '29.0.0\n', stderr: '' };
    if (commandName === 'docker' && args[0] === 'compose' && args[1] === 'version') return { status: 0, stdout: '5.0.0\n', stderr: '' };
    if (commandName === 'docker' && args.at(-1) === '--images') return { status: 0, stdout: `postgres:${PILOT_POSTGRES_MAJOR}\nodyssey-api\n`, stderr: '' };
    return { status: 0, stdout: '', stderr: '' };
  });
  const readText = (path: string) => path.endsWith('pilot.env')
    ? envText(options.env || validEnv())
    : path.endsWith('Dockerfile')
      ? 'CMD ["npx", "prisma", "migrate", "deploy"]'
      : 'services:\n  migrate:\n  api:\n    depends_on:\n      migrate:\n        condition: service_completed_successfully\n';
  const overrides = {
    command,
    readText,
    migrationCount: () => options.migrationCount ?? PILOT_MIGRATION_COUNT,
    writable: options.writable || (() => true),
    freeBytes: () => options.freeBytes ?? 11 * 1024 * 1024 * 1024,
    portProbe: options.portProbe || (async () => undefined),
    releaseIdentity: () => ({ ok: options.releaseOk ?? true, sha: releaseSha })
  };
  return { calls, command, run: () => runPilotPreflight({ envFile: 'pilot.env', backupDirectory: 'backups' }, overrides) };
}

describe('pilot deployment preflight', () => {
  it('accepts the current Compose contract despite harmless bootstrap-owner prose', () => {
    const compose = readFileSync(resolve(import.meta.dirname, '../../../docker-compose.yml'), 'utf8');
    expect(compose).toContain('bootstrap owner URL');
    expect(containsForbiddenStartupCommand(compose)).toBe(false);
  });

  it.each([
    'services:\n  api:\n    command: ["npx", "prisma", "migrate", "reset", "--force"]',
    'services:\n  api:\n    command: npm run reseed',
    'services:\n  api:\n    entrypoint: ["node", "scripts/destructive-bootstrap.mjs"]',
    'services:\n  api:\n    command: |\n      npm run demo:bootstrap\n      node server.js'
  ])('rejects an actual reset, reseed, or destructive bootstrap startup command', (compose) => {
    expect(containsForbiddenStartupCommand(compose)).toBe(true);
  });

  it('passes a valid bounded-pilot configuration', async () => {
    const report = await harness().run();
    expect(report.ok).toBe(true);
    expect(report.results.every((result) => result.status === 'PASS')).toBe(true);
  });

  it('fails clearly when the Docker engine is unavailable', async () => {
    const setup = harness({ command: (_command, args) => args[0] === 'version' ? { status: 1, stdout: '', stderr: 'unavailable' } : { status: 0, stdout: args.at(-1) === '--images' ? 'postgres:16' : '5', stderr: '' } });
    expect(status(await setup.run(), 'DOCKER_ENGINE')).toBe('FAIL');
  });

  it('fails clearly when Docker Compose is unavailable', async () => {
    const setup = harness({ command: (_command, args) => args[0] === 'compose' ? { status: 1, stdout: '', stderr: 'unavailable' } : { status: 0, stdout: '29', stderr: '' } });
    expect(status(await setup.run(), 'DOCKER_COMPOSE')).toBe('FAIL');
  });

  it('rejects placeholder and policy-invalid secrets', async () => {
    const report = await harness({ env: validEnv({ ODYSSEY_DB_RUNTIME_PASSWORD: 'replace-me', ODYSSEY_DB_RUNTIME_DATABASE_URL: 'postgresql://odyssey_runtime:replace-me@db:5432/odyssey', JWT_SECRET: 'secret' }) }).run();
    expect(status(report, 'ENV_PLACEHOLDERS')).toBe('FAIL');
    expect(status(report, 'JWT_SECRET_POLICY')).toBe('FAIL');
    expect(status(report, 'RUNTIME_PASSWORD_POLICY')).toBe('FAIL');
  });

  it('rejects a database URL whose password does not match the configured password', async () => {
    const report = await harness({ env: validEnv({ ODYSSEY_DB_RUNTIME_DATABASE_URL: 'postgresql://odyssey_runtime:different-password-123@db:5432/odyssey' }) }).run();
    expect(status(report, 'RUNTIME_DATABASE_URL')).toBe('FAIL');
  });

  it('reports occupied API and web ports without selecting alternatives', async () => {
    const report = await harness({ portProbe: async () => { throw new Error('EADDRINUSE'); } }).run();
    expect(status(report, 'API_PORT_AVAILABLE')).toBe('FAIL');
    expect(status(report, 'WEB_PORT_AVAILABLE')).toBe('FAIL');
  });

  it('rejects a missing backup directory', async () => {
    const report = await harness({ writable: () => { throw new Error('ENOENT'); } }).run();
    expect(status(report, 'BACKUP_WRITABLE')).toBe('FAIL');
  });

  it('rejects a non-writable backup directory', async () => {
    const report = await harness({ writable: () => { throw new Error('EACCES'); } }).run();
    expect(status(report, 'BACKUP_WRITABLE')).toBe('FAIL');
  });

  it('rejects insufficient backup free space', async () => {
    const report = await harness({ freeBytes: 9 * 1024 * 1024 * 1024 }).run();
    expect(status(report, 'BACKUP_FREE_SPACE')).toBe('FAIL');
  });

  it('rejects a PostgreSQL major-version mismatch', async () => {
    const report = await harness({ env: validEnv({ ODYSSEY_POSTGRES_MAJOR: '18' }) }).run();
    expect(status(report, 'POSTGRES_MAJOR')).toBe('FAIL');
  });

  it('rejects an incomplete committed migration set', async () => {
    const report = await harness({ migrationCount: PILOT_MIGRATION_COUNT - 1 }).run();
    expect(status(report, 'MIGRATION_COUNT')).toBe('FAIL');
  });

  it('rejects an unpublished or dirty release identity', async () => {
    const report = await harness({ releaseOk: false }).run();
    expect(status(report, 'RELEASE_IDENTITY')).toBe('FAIL');
  });

  it('never invokes service startup or database mutation commands', async () => {
    const setup = harness();
    await setup.run();
    const commands = setup.calls.map(({ command, args }) => `${command} ${args.join(' ')}`);
    expect(commands).not.toEqual(expect.arrayContaining([
      expect.stringMatching(/docker compose.*\b(up|run|start|restart)\b/i),
      expect.stringMatching(/\b(migrate reset|db push|seed|bootstrap)\b/i)
    ]));
    expect(commands).toEqual(expect.arrayContaining([expect.stringMatching(/docker compose.*config --quiet/i)]));
  });

  it('does not expose sensitive subprocess output in its report', async () => {
    const secret = 'DO_NOT_LEAK_BEARER_OR_DATABASE_SECRET';
    const setup = harness({ command: (_command, args) => ({ status: 1, stdout: secret, stderr: `${secret}:${args.join(' ')}` }) });
    const report = await setup.run();
    expect(JSON.stringify(report)).not.toContain(secret);
  });
});
