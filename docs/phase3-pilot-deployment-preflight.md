# Phase 3.7 pilot deployment contract and preflight

This checkpoint defines a bounded, single-host pilot contract. It is not a production, high-availability, or Government of India deployment claim. The web service is the intended browser entrypoint, but both web and direct API host publications remain bound to `127.0.0.1`; PostgreSQL and the optional advisory AI service are not published. Remote access requires a separately approved TLS and network boundary. Open-Meteo remains disabled and `EVALUATION_ONLY`, and AI remains optional and non-authoritative.

## PostgreSQL baseline

The supported pilot baseline is PostgreSQL 16, matching the existing Compose and repository evidence. Do not change the image major version for an existing volume without a planned, backed-up, tested PostgreSQL upgrade. In particular, never mount a PostgreSQL 18 data directory into PostgreSQL 16: PostgreSQL data directories are not backward-compatible. Do not downgrade existing data. Preserve the volume, establish its actual server major version, and use an approved logical or `pg_upgrade` migration procedure when a future upgrade is authorized.

## Read-only preflight

Create an ignored `.env.pilot` from `.env.pilot.example`, replace every placeholder, and choose an existing protected backup directory with at least 10 GiB free. Run from the repository root:

```powershell
npm run pilot:preflight -- --env-file .env.pilot --backup-dir C:\secure\odyssey-backups
```

The preflight validates required configuration and rejects placeholder secrets without printing their values. It checks Docker engine and Compose availability, validates the Compose model, confirms PostgreSQL 16 resolution, verifies loopback bindings and available API/web ports, checks the backup directory and free space, validates the Prisma schema and the committed 27-migration prerequisite, rejects demo/test mutation configuration or startup commands, and requires a clean published `master` release identity matching `origin/master`.

The command performs no Compose `up`, `run`, `start`, or restart; starts no service; connects to no database; and performs no migration, reset, reseed, bootstrap, or business-data write. Compose configuration validation and local Prisma schema validation are read-only. A successful preflight does not apply migrations or prove that a database backup exists.

## Migration and data safety

The deployment remains gated by the existing one-shot `prisma migrate deploy` container before API startup. Review populated-database migration caveats and take a verified protected backup before any deployment. Never use `prisma migrate reset`, development migration, seed, demo bootstrap, or volume deletion against a valued pilot database. Preflight checks the committed migration set and static startup gate; operators must still verify migration status against the intended database during the controlled deployment window.

### Database role provisioning

The pilot uses four distinct identities: the PostgreSQL bootstrap owner, a non-superuser migration owner, a runtime API role with table/sequence data access only, and a read-only backup role. The API receives only `ODYSSEY_DB_RUNTIME_DATABASE_URL`; the migration container receives only `ODYSSEY_DB_MIGRATION_DATABASE_URL`; and the manual backup service receives only `ODYSSEY_DB_BACKUP_DATABASE_URL`. Normal API or migration startup never creates roles or changes privileges.

For a new empty volume, start only PostgreSQL, provision roles explicitly, then start the deterministic stack:

```powershell
docker compose --env-file .env.pilot up -d db
docker compose --env-file .env.pilot --profile operations run --rm provision-db-roles
docker compose --env-file .env.pilot up -d migrate api web
```

For an existing volume, first take and verify a protected backup using the current known-good credentials. Stop API and migration activity, populate all new owner/migration/runtime/backup values, and run the same explicit `provision-db-roles` operation during an approved maintenance window. It creates missing roles, rotates their supplied passwords, transfers database/schema and existing object ownership from the bootstrap owner to the migration role, reapplies current/default privileges, and exits. It does not reset, reseed, restore, or delete data. Verify role capabilities, all 27 migrations, API readiness, and representative authenticated reads/writes before reopening access. Do not change `POSTGRES_USER` for an existing volume until its actual bootstrap owner and the upgrade inputs have been reviewed; PostgreSQL initialization variables do not retrofit roles into an existing data directory.

### Manual backup and 24-hour status

Set `ODYSSEY_BACKUP_DIRECTORY` to an existing protected host directory writable by the container's PostgreSQL user. Run the manual PostgreSQL 16 client on the internal data network:

```powershell
docker compose --env-file .env.pilot --profile backup run --rm backup
npm run backup:status -- --directory C:\secure\odyssey-backups
```

The backup service receives only the dedicated read-only backup URL and has no host port. It writes a hidden temporary custom-format dump, validates it with `pg_restore --list`, computes SHA-256, writes a small versioned manifest and checksum sidecar, and renames the dump to its final name only after validation. Failure removes only this run's temporary files. Completed backups are never automatically deleted. The read-only status command recomputes checksum validity and reports `PASS` when the newest complete backup is no more than 24 hours old, `STALE` when older, and `MISSING` when no complete checksum-valid backup exists. `STALE` and `MISSING` return non-zero process status. Scheduling, retention deletion, encryption, off-host replication, and automatic restore remain out of scope.

P3.7.3 live validation used a uniquely named disposable Compose project, synthetic credentials, a dedicated PostgreSQL volume, and a temporary host backup directory. PostgreSQL 16 initialized under the bootstrap owner; explicit role provisioning succeeded repeatedly without unsafe changes; the non-superuser migration role applied all 27 migrations and performed required DDL; the runtime role completed representative CRUD but was denied table creation and deletion; and the backup role read governed tables but was denied insert, update, delete, and DDL. PostgreSQL had no host port. A real Compose backup used PostgreSQL 16.15 client tools, produced a non-empty custom archive accepted by `pg_restore --list`, matched its SHA-256 sidecar and versioned manifest, left no temporary partial files, and returned backup status `PASS` against the 24-hour target. No reset, reseed, automatic restore, or canonical database resource was used, and all disposable resources and artifacts were removed.

Live validation also corrected two root causes before acceptance. Cluster-wide `REASSIGN OWNED` was replaced with target-database-only transfer of non-system schemas, relations, routines, and governed user types because the bootstrap identity also owns PostgreSQL system databases. Provisioning and backup subprocesses now parse their configured PostgreSQL URI into libpq environment fields instead of placing the URI in `PGDATABASE`; credentials remain absent from command arguments and controlled output.

## P3.7.2 Compose isolation and bounded runtime behavior

Compose separates service traffic by role. The `edge` network contains only web and API; the internal `data` network contains API, PostgreSQL, and the one-shot migration service; and the internal `intelligence` network contains only API and optional AI. Web therefore reaches API but cannot resolve PostgreSQL, while API reaches AI when enabled and AI cannot resolve PostgreSQL. PostgreSQL and AI have no host ports. Web and direct API publications remain loopback-only at their configured `127.0.0.1` bindings.

API and PostgreSQL receive a 30-second stop grace period so the API can drain and disconnect cleanly and PostgreSQL can shut down normally. Long-running PostgreSQL, API, web, and AI containers use the Docker `json-file` driver with a maximum of five 10 MiB files per container. The one-shot migration container remains non-restarting and is excluded from runtime log rotation.

Live validation used a uniquely named isolated Compose project, synthetic credentials, dedicated loopback ports, and a dedicated volume. It proved PostgreSQL health, all 27 migrations on an empty database, migration completion before API startup, API/web health, same-origin web-to-API proxying, the intended connectivity denials, exact loopback/no-port exposure, active log settings, and 30-second stop settings. A marker written only to the isolated database survived `down` followed by `up` without `-v`; the migration rerun reported no pending migrations. The deterministic stack remained healthy without AI, while the optional profile produced a healthy internal AI service reachable by API when explicitly enabled. All isolated containers, networks, volume, images, and temporary configuration were removed afterward.

## Remaining P3.7 work

Read-only root filesystems, capability dropping, `no-new-privileges`, CPU/memory/PID limits, and immutable image-digest pinning remain deliberately deferred until separately scoped live compatibility and capacity validation. P3.7 still does not establish TLS/reverse-proxy access, rotate deployment credentials, schedule or retain encrypted backups, add centralized monitoring/log aggregation or alerts, perform an operational restore drill, or conduct a real pilot deployment. It does not grant Open-Meteo production entitlement or make AI authoritative.
