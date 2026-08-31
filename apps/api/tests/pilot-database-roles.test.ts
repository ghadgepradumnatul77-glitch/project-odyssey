import { EventEmitter } from 'node:events';
import { describe, expect, it, vi } from 'vitest';
// @ts-expect-error operator script intentionally remains plain ESM
import { provisionPilotDatabaseRoles, roleProvisioningPlan } from '../../../scripts/provision-pilot-db-roles.mjs';

const config = {
  databaseName: 'odyssey',
  ownerRole: 'odyssey_owner',
  migrationRole: 'odyssey_migration',
  migrationPassword: 'migration-secret-value',
  runtimeRole: 'odyssey_runtime',
  runtimePassword: 'runtime-secret-value',
  backupRole: 'odyssey_backup',
  backupPassword: 'backup-secret-value'
};

describe('pilot database role provisioning', () => {
  it('creates four distinct identities without elevated application roles', () => {
    const plan = roleProvisioningPlan(config);
    expect(plan.sql).toContain('CREATE ROLE "odyssey_migration" LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION');
    expect(plan.sql).toContain('CREATE ROLE "odyssey_runtime" LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION');
    expect(plan.sql).toContain('CREATE ROLE "odyssey_backup" LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION');
    expect(() => roleProvisioningPlan({ ...config, backupRole: config.runtimeRole })).toThrow('DATABASE_ROLES_MUST_BE_DISTINCT');
  });

  it('makes migration the database/schema owner for required DDL', () => {
    const { sql } = roleProvisioningPlan(config);
    expect(sql).toContain('ALTER DATABASE "odyssey" OWNER TO "odyssey_migration"');
    expect(sql).toContain('ALTER SCHEMA public OWNER TO "odyssey_migration"');
    expect(sql).toContain("class.relkind IN ('r', 'p', 'S', 'v', 'm', 'f')");
    expect(sql).toContain("procedure.prokind IN ('f', 'p')");
    expect(sql).toContain("type.typtype IN ('d', 'e', 'r', 'm')");
    expect(sql).not.toContain('REASSIGN OWNED BY');
  });

  it('grants runtime data operations but no schema or database DDL', () => {
    const { sql } = roleProvisioningPlan(config);
    expect(sql).toContain('REVOKE ALL PRIVILEGES ON DATABASE "odyssey" FROM "odyssey_runtime", "odyssey_backup"');
    expect(sql).toContain('REVOKE ALL PRIVILEGES ON SCHEMA public FROM "odyssey_runtime", "odyssey_backup"');
    expect(sql).toContain('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "odyssey_runtime"');
    expect(sql).not.toContain('GRANT CREATE ON SCHEMA public TO "odyssey_runtime"');
  });

  it('keeps the backup role read-only for existing and future objects', () => {
    const { sql } = roleProvisioningPlan(config);
    expect(sql).toContain('GRANT SELECT ON ALL TABLES IN SCHEMA public TO "odyssey_backup"');
    expect(sql).toContain('GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO "odyssey_backup"');
    expect(sql).toContain('GRANT SELECT ON TABLES TO "odyssey_backup"');
    expect(sql).not.toMatch(/GRANT (?:INSERT|UPDATE|DELETE|CREATE)[^;]*TO "odyssey_backup"/);
  });

  it('is idempotent and reapplies controlled passwords and grants', () => {
    const { sql } = roleProvisioningPlan(config);
    expect(sql.match(/IF NOT EXISTS \(SELECT 1 FROM pg_roles/g)).toHaveLength(3);
    expect(sql).toContain('ALTER ROLE "odyssey_migration" WITH LOGIN NOSUPERUSER');
    expect(sql).toContain('ALTER DEFAULT PRIVILEGES FOR ROLE "odyssey_migration"');
    expect(sql).toMatch(/^\nBEGIN;[\s\S]*COMMIT;\n$/);
  });

  it('does not place owner URLs or role passwords in subprocess arguments or safe output', () => {
    const plan = roleProvisioningPlan(config);
    const serialized = JSON.stringify({ args: plan.args, safeSummary: plan.safeSummary });
    for (const secret of [config.migrationPassword, config.runtimePassword, config.backupPassword]) expect(serialized).not.toContain(secret);
    expect(plan.args.join(' ')).not.toContain('postgresql://');
  });

  it('captures psql output and emits only a secret-free completion event', async () => {
    let writtenSql = '';
    const spawnProcess = vi.fn(() => {
      const child = new EventEmitter() as EventEmitter & { stdin: { end: (value: string) => void } };
      child.stdin = { end: (value) => { writtenSql = value; setTimeout(() => child.emit('exit', 0), 0); } };
      return child;
    });
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    await provisionPilotDatabaseRoles({ config, ownerDatabaseUrl: 'postgresql://owner:owner-secret@db/odyssey', spawnProcess });
    expect(writtenSql).toContain(config.runtimePassword);
    const options = spawnProcess.mock.calls[0][2];
    expect(options).toEqual(expect.objectContaining({ shell: false, stdio: ['pipe', 'pipe', 'pipe'] }));
    expect(options.env).toEqual(expect.objectContaining({ PGHOST: 'db', PGDATABASE: 'odyssey', PGUSER: 'owner', PGPASSWORD: 'owner-secret' }));
    expect(spawnProcess.mock.calls[0][1]).not.toContain(expect.stringContaining('secret'));
    expect(JSON.stringify(log.mock.calls)).not.toMatch(/owner-secret|migration-secret|runtime-secret|backup-secret/);
    log.mockRestore();
  });
});
