import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const identifierPattern = /^[a-z_][a-z0-9_]{0,62}$/;
const quoteIdentifier = (value) => `"${value.replaceAll('"', '""')}"`;
const quoteLiteral = (value) => `'${value.replaceAll("'", "''")}'`;

const required = (value, code) => {
  if (!value?.trim()) throw new Error(code);
  return value.trim();
};

const postgresEnvironment = (databaseUrl) => {
  let url;
  try { url = new URL(databaseUrl); } catch { throw new Error('OWNER_DATABASE_URL_INVALID'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || !url.username || !url.pathname.slice(1)) {
    throw new Error('OWNER_DATABASE_URL_INVALID');
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

const role = (value, code) => {
  const result = required(value, code);
  if (!identifierPattern.test(result)) throw new Error(`${code}_INVALID`);
  return result;
};

export function roleProvisioningPlan(input) {
  const databaseName = role(input.databaseName, 'DATABASE_NAME_REQUIRED');
  const ownerRole = role(input.ownerRole, 'OWNER_ROLE_REQUIRED');
  const migrationRole = role(input.migrationRole, 'MIGRATION_ROLE_REQUIRED');
  const runtimeRole = role(input.runtimeRole, 'RUNTIME_ROLE_REQUIRED');
  const backupRole = role(input.backupRole, 'BACKUP_ROLE_REQUIRED');
  const migrationPassword = required(input.migrationPassword, 'MIGRATION_PASSWORD_REQUIRED');
  const runtimePassword = required(input.runtimePassword, 'RUNTIME_PASSWORD_REQUIRED');
  const backupPassword = required(input.backupPassword, 'BACKUP_PASSWORD_REQUIRED');
  const roles = [ownerRole, migrationRole, runtimeRole, backupRole];
  if (new Set(roles).size !== roles.length) throw new Error('DATABASE_ROLES_MUST_BE_DISTINCT');

  const db = quoteIdentifier(databaseName);
  const owner = quoteIdentifier(ownerRole);
  const migration = quoteIdentifier(migrationRole);
  const runtime = quoteIdentifier(runtimeRole);
  const backup = quoteIdentifier(backupRole);
  const sql = `\nBEGIN;
DO $odyssey_roles$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = ${quoteLiteral(migrationRole)}) THEN
    CREATE ROLE ${migration} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = ${quoteLiteral(runtimeRole)}) THEN
    CREATE ROLE ${runtime} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = ${quoteLiteral(backupRole)}) THEN
    CREATE ROLE ${backup} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION;
  END IF;
END
$odyssey_roles$;

ALTER ROLE ${migration} WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION PASSWORD ${quoteLiteral(migrationPassword)};
ALTER ROLE ${runtime} WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION PASSWORD ${quoteLiteral(runtimePassword)};
ALTER ROLE ${backup} WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION PASSWORD ${quoteLiteral(backupPassword)};

ALTER DATABASE ${db} OWNER TO ${migration};
ALTER SCHEMA public OWNER TO ${migration};

DO $odyssey_objects$
DECLARE
  item record;
BEGIN
  FOR item IN
    SELECT nspname
    FROM pg_namespace
    WHERE nspowner = (SELECT oid FROM pg_roles WHERE rolname = ${quoteLiteral(ownerRole)})
      AND nspname !~ '^pg_'
      AND nspname <> 'information_schema'
  LOOP
    EXECUTE format('ALTER SCHEMA %I OWNER TO %I', item.nspname, ${quoteLiteral(migrationRole)});
  END LOOP;

  FOR item IN
    SELECT namespace.nspname, class.relname, class.relkind
    FROM pg_class class
    JOIN pg_namespace namespace ON namespace.oid = class.relnamespace
    WHERE class.relowner = (SELECT oid FROM pg_roles WHERE rolname = ${quoteLiteral(ownerRole)})
      AND namespace.nspname !~ '^pg_'
      AND namespace.nspname <> 'information_schema'
      AND class.relkind IN ('r', 'p', 'S', 'v', 'm', 'f')
  LOOP
    EXECUTE format(
      'ALTER %s %I.%I OWNER TO %I',
      CASE item.relkind
        WHEN 'S' THEN 'SEQUENCE'
        WHEN 'v' THEN 'VIEW'
        WHEN 'm' THEN 'MATERIALIZED VIEW'
        WHEN 'f' THEN 'FOREIGN TABLE'
        ELSE 'TABLE'
      END,
      item.nspname,
      item.relname,
      ${quoteLiteral(migrationRole)}
    );
  END LOOP;

  FOR item IN
    SELECT namespace.nspname, procedure.proname,
      pg_get_function_identity_arguments(procedure.oid) AS arguments,
      procedure.prokind
    FROM pg_proc procedure
    JOIN pg_namespace namespace ON namespace.oid = procedure.pronamespace
    WHERE procedure.proowner = (SELECT oid FROM pg_roles WHERE rolname = ${quoteLiteral(ownerRole)})
      AND namespace.nspname !~ '^pg_'
      AND namespace.nspname <> 'information_schema'
      AND procedure.prokind IN ('f', 'p')
  LOOP
    EXECUTE format(
      'ALTER %s %I.%I(%s) OWNER TO %I',
      CASE item.prokind WHEN 'p' THEN 'PROCEDURE' ELSE 'FUNCTION' END,
      item.nspname,
      item.proname,
      item.arguments,
      ${quoteLiteral(migrationRole)}
    );
  END LOOP;

  FOR item IN
    SELECT namespace.nspname, type.typname
    FROM pg_type type
    JOIN pg_namespace namespace ON namespace.oid = type.typnamespace
    WHERE type.typowner = (SELECT oid FROM pg_roles WHERE rolname = ${quoteLiteral(ownerRole)})
      AND namespace.nspname !~ '^pg_'
      AND namespace.nspname <> 'information_schema'
      AND type.typtype IN ('d', 'e', 'r', 'm')
  LOOP
    EXECUTE format('ALTER TYPE %I.%I OWNER TO %I', item.nspname, item.typname, ${quoteLiteral(migrationRole)});
  END LOOP;
END
$odyssey_objects$;

REVOKE ALL PRIVILEGES ON DATABASE ${db} FROM ${runtime}, ${backup};
REVOKE CREATE, TEMPORARY ON DATABASE ${db} FROM PUBLIC;
GRANT CONNECT ON DATABASE ${db} TO ${runtime}, ${backup};
GRANT TEMPORARY ON DATABASE ${db} TO ${migration};
REVOKE ALL PRIVILEGES ON SCHEMA public FROM ${runtime}, ${backup};
GRANT USAGE ON SCHEMA public TO ${runtime}, ${backup};

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM ${runtime}, ${backup};
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM ${runtime}, ${backup};
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${runtime};
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO ${runtime};
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ${backup};
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO ${backup};

ALTER DEFAULT PRIVILEGES FOR ROLE ${migration} IN SCHEMA public REVOKE ALL ON TABLES FROM ${runtime}, ${backup};
ALTER DEFAULT PRIVILEGES FOR ROLE ${migration} IN SCHEMA public REVOKE ALL ON SEQUENCES FROM ${runtime}, ${backup};
ALTER DEFAULT PRIVILEGES FOR ROLE ${migration} IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${runtime};
ALTER DEFAULT PRIVILEGES FOR ROLE ${migration} IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO ${runtime};
ALTER DEFAULT PRIVILEGES FOR ROLE ${migration} IN SCHEMA public GRANT SELECT ON TABLES TO ${backup};
ALTER DEFAULT PRIVILEGES FOR ROLE ${migration} IN SCHEMA public GRANT SELECT ON SEQUENCES TO ${backup};
COMMIT;\n`;
  return {
    command: 'psql',
    args: ['--no-psqlrc', '--set=ON_ERROR_STOP=1', '--quiet'],
    sql,
    safeSummary: { databaseName, ownerRole, migrationRole, runtimeRole, backupRole }
  };
}

export async function provisionPilotDatabaseRoles({ config, ownerDatabaseUrl, spawnProcess = spawn }) {
  const plan = roleProvisioningPlan(config);
  const databaseUrl = required(ownerDatabaseUrl, 'OWNER_DATABASE_URL_REQUIRED');
  await new Promise((resolvePromise, reject) => {
    const child = spawnProcess(plan.command, plan.args, {
      stdio: ['pipe', 'pipe', 'pipe'], shell: false, env: { ...process.env, ...postgresEnvironment(databaseUrl) }
    });
    child.once('error', () => reject(new Error('ROLE_PROVISIONING_COMMAND_UNAVAILABLE')));
    child.once('exit', (code) => code === 0 ? resolvePromise(undefined) : reject(new Error(`ROLE_PROVISIONING_FAILED:${code}`)));
    child.stdin.end(plan.sql);
  });
  console.log(JSON.stringify({ event: 'PILOT_DATABASE_ROLES_PROVISIONED', ...plan.safeSummary }));
  return plan.safeSummary;
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  provisionPilotDatabaseRoles({
    ownerDatabaseUrl: process.env.ODYSSEY_DB_OWNER_DATABASE_URL,
    config: {
      databaseName: process.env.ODYSSEY_DB_NAME,
      ownerRole: process.env.ODYSSEY_DB_OWNER_USER,
      migrationRole: process.env.ODYSSEY_DB_MIGRATION_USER,
      migrationPassword: process.env.ODYSSEY_DB_MIGRATION_PASSWORD,
      runtimeRole: process.env.ODYSSEY_DB_RUNTIME_USER,
      runtimePassword: process.env.ODYSSEY_DB_RUNTIME_PASSWORD,
      backupRole: process.env.ODYSSEY_DB_BACKUP_USER,
      backupPassword: process.env.ODYSSEY_DB_BACKUP_PASSWORD
    }
  }).catch((error) => {
    console.error(error instanceof Error ? error.message : 'ROLE_PROVISIONING_FAILED');
    process.exitCode = 1;
  });
}
