import { readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('pilot deployment packaging', () => {
  const compose = read('docker-compose.yml');
  const apiDockerfile = read('apps/api/Dockerfile');
  const webDockerfile = read('apps/web/Dockerfile');
  const aiDockerfile = read('apps/ai/Dockerfile');
  const dockerignore = read('.dockerignore');

  it('defines database, migration, API, web and optional AI services', () => {
    for (const service of ['db:', 'migrate:', 'provision-db-roles:', 'backup:', 'api:', 'web:', 'ai:']) expect(compose).toContain(service);
    expect(compose).toContain('profiles: ["ai"]');
    const apiSection = compose.slice(compose.indexOf('  api:'), compose.indexOf('  web:'));
    expect(apiSection).not.toMatch(/depends_on:[\s\S]*\bai:/);
  });

  it('gates migrations and API startup on readiness/completion', () => {
    expect(compose).toContain('condition: service_healthy');
    expect(compose).toContain('condition: service_completed_successfully');
    expect(apiDockerfile).toContain('prisma", "migrate", "deploy');
    expect(apiDockerfile).not.toContain('migrate reset');
  });

  it('uses P1 immutable API runtime packaging as a non-root user', () => {
    expect(apiDockerfile).toContain('RUN npm run build');
    expect(apiDockerfile).toContain('COPY database/prisma /workspace/database/prisma');
    expect(apiDockerfile).toContain('npx prisma generate --schema /workspace/database/prisma/schema.prisma');
    expect(apiDockerfile.indexOf('npx prisma generate')).toBeLessThan(apiDockerfile.indexOf('npm run build'));
    expect(apiDockerfile).toContain('apt-get install -y --no-install-recommends openssl');
    expect(apiDockerfile).toContain('.runtime-builds');
    expect(apiDockerfile).toContain('scripts/start-runtime.cjs');
    expect(apiDockerfile).toContain('USER node');
    expect(apiDockerfile).not.toContain('node dist/server.js');
  });

  it('serves a production web build with SPA fallback and same-origin API proxy', () => {
    const nginx = read('apps/web/nginx.conf');
    expect(webDockerfile).toContain('RUN npm run build');
    expect(webDockerfile).toContain('nginx-unprivileged');
    expect(nginx).toContain('try_files $uri $uri/ /index.html');
    expect(nginx).toContain('proxy_pass http://api:4000');
  });

  it('keeps the advisory provider internal, optional and non-root', () => {
    expect(compose).toContain('ODYSSEY_INTELLIGENCE_SERVICE_URL: ${ODYSSEY_INTELLIGENCE_SERVICE_URL:-http://ai:8000}');
    expect(compose).toContain('ODYSSEY_INTELLIGENCE_ENABLED:?');
    const aiSection = compose.slice(compose.indexOf('  ai:'), compose.indexOf('\nvolumes:'));
    expect(aiSection).not.toContain('ports:');
    expect(aiDockerfile).toContain('python:3.12-slim');
    expect(aiDockerfile).toContain('USER odyssey');
    expect(aiDockerfile).not.toMatch(/DATABASE_URL|postgres/i);
  });

  it('requires external secrets and does not expose database by default', () => {
    expect(compose).toContain('ODYSSEY_DB_OWNER_PASSWORD:?');
    expect(compose).toContain('JWT_SECRET:?');
    expect(compose).not.toMatch(/POSTGRES_PASSWORD:\s*(postgres|odyssey)\s*$/m);
    const dbSection = compose.slice(compose.indexOf('  db:'), compose.indexOf('  migrate:'));
    expect(dbSection).not.toContain('ports:');
  });

  it('separates bootstrap, migration, runtime, and backup database identities', () => {
    const migrateSection = compose.slice(compose.indexOf('  migrate:'), compose.indexOf('  provision-db-roles:'));
    const provisionSection = compose.slice(compose.indexOf('  provision-db-roles:'), compose.indexOf('  api:'));
    const apiSection = compose.slice(compose.indexOf('  api:'), compose.indexOf('  web:'));
    expect(compose).toContain('POSTGRES_USER: ${ODYSSEY_DB_OWNER_USER:-odyssey_owner}');
    expect(migrateSection).toContain('DATABASE_URL: ${ODYSSEY_DB_MIGRATION_DATABASE_URL:?');
    expect(apiSection).toContain('DATABASE_URL: ${ODYSSEY_DB_RUNTIME_DATABASE_URL:?');
    expect(apiSection).not.toMatch(/OWNER_DATABASE_URL|MIGRATION_DATABASE_URL|BACKUP_DATABASE_URL/);
    expect(provisionSection).toContain('profiles: ["operations"]');
    expect(provisionSection).toContain('ODYSSEY_DB_BACKUP_PASSWORD:');
    expect(apiSection).not.toContain('provision-db-roles');
  });

  it('keeps manual PostgreSQL 16 backup internal and dedicated-role only', () => {
    const backupSection = compose.slice(compose.indexOf('  backup:'), compose.indexOf('  api:'));
    expect(backupSection).toContain('profiles: ["backup"]');
    expect(backupSection).toContain('target: backup-runtime');
    expect(backupSection).toContain('ODYSSEY_DB_BACKUP_DATABASE_URL:');
    expect(backupSection).toContain('source: ${ODYSSEY_BACKUP_DIRECTORY:?');
    expect(backupSection).toContain('networks: [data]');
    expect(backupSection).not.toContain('ports:');
    expect(apiDockerfile).toContain('FROM postgres:16-bookworm AS backup-runtime');
    expect(apiDockerfile).toContain('ENTRYPOINT ["node", "scripts/backup-postgres.mjs"]');
  });

  it('isolates edge, data, and optional intelligence traffic by service role', () => {
    const dbSection = compose.slice(compose.indexOf('  db:'), compose.indexOf('  migrate:'));
    const migrateSection = compose.slice(compose.indexOf('  migrate:'), compose.indexOf('  provision-db-roles:'));
    const provisionSection = compose.slice(compose.indexOf('  provision-db-roles:'), compose.indexOf('  backup:'));
    const backupSection = compose.slice(compose.indexOf('  backup:'), compose.indexOf('  api:'));
    const apiSection = compose.slice(compose.indexOf('  api:'), compose.indexOf('  web:'));
    const webSection = compose.slice(compose.indexOf('  web:'), compose.indexOf('  ai:'));
    const aiSection = compose.slice(compose.indexOf('  ai:'), compose.indexOf('\nvolumes:'));
    expect(dbSection).toContain('networks: [data]');
    expect(migrateSection).toContain('networks: [data]');
    expect(provisionSection).toContain('networks: [data]');
    expect(backupSection).toContain('networks: [data]');
    expect(apiSection).toContain('networks: [edge, data, intelligence]');
    expect(webSection).toContain('networks: [edge]');
    expect(aiSection).toContain('networks: [intelligence]');
    expect(compose).toMatch(/data:\s+driver: bridge\s+internal: true/);
    expect(compose).toMatch(/intelligence:\s+driver: bridge\s+internal: true/);
  });

  it('adds bounded long-running logs and graceful API/database shutdown', () => {
    expect(compose).toContain('max-size: "10m"');
    expect(compose).toContain('max-file: "5"');
    expect(compose.match(/logging: \*odyssey-logging/g)).toHaveLength(4);
    const dbSection = compose.slice(compose.indexOf('  db:'), compose.indexOf('  migrate:'));
    const apiSection = compose.slice(compose.indexOf('  api:'), compose.indexOf('  web:'));
    expect(dbSection).toContain('stop_grace_period: 30s');
    expect(apiSection).toContain('stop_grace_period: 30s');
  });

  it('quotes PostgreSQL health-check values from the container environment', () => {
    expect(compose).toContain('pg_isready -U \\"$${POSTGRES_USER}\\" -d \\"$${POSTGRES_DB}\\"');
  });

  it('excludes secrets, dependencies and generated artifacts without excluding migrations', () => {
    for (const value of ['.env', '**/node_modules', '**/dist', '**/.runtime-builds', '**/playwright-report', '**/.venv']) {
      expect(dockerignore).toContain(value);
    }
    expect(dockerignore).not.toContain('database/prisma');
  });

  it('fails the supported pilot launch explicitly when a configured host port is occupied', async () => {
    const listener = createServer();
    await new Promise<void>((resolveListen, reject) => {
      listener.once('error', reject);
      listener.listen({ host: '0.0.0.0', port: 0, exclusive: true }, resolveListen);
    });
    const address = listener.address();
    if (!address || typeof address === 'string') throw new Error('Unable to reserve a validation port.');
    const result = spawnSync(process.execPath, [resolve(root, 'scripts/pilot-compose.mjs'), '--check-port', 'api', String(address.port)], { encoding: 'utf8' });
    await new Promise<void>((resolveClose) => listener.close(() => resolveClose()));
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(`PILOT_PORT_COLLISION: Host port ${address.port} for api is unavailable.`);
    expect(result.stderr).toContain('no alternate port was selected');
  });
});
