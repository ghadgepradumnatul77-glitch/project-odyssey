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

## P3.7.4 bounded-pilot operator runbook

This runbook is manual and single-host. Before pilot activation, the deploying organization must assign named people outside Odyssey to three roles: the **application operator** runs status checks, reviews application logs, and performs approved controlled service restarts; the **database/recovery owner** owns database availability, protected backup storage, capacity response, and isolated restore drills; and the **security/integrity escalation owner** receives suspected tampering, integrity failures, secret/PII exposure, and preserved incident evidence. These operational roles do not confer Odyssey workflow or statutory authority.

Run the read-only status command at the start of every staffed pilot day, at least every four hours while the pilot is actively used, after each deployment or controlled restart, and after incident recovery:

```powershell
npm run pilot:status -- --env-file .env.pilot --backup-dir C:\secure\odyssey-backups
```

`PASS` permits continued pilot observation. Record the result. `WARN` means core readiness remains available but the application operator must investigate during the same staffed shift; repeated restarts or persistent optional AI/weather degradation must be escalated. `FAIL` means the deployment must not be declared healthy: preserve evidence, open an incident, and escalate immediately to the relevant owner. The status command itself never starts, stops, restarts, migrates, backs up, restores, resets, reseeds, deletes, or writes business data. There is no automatic alert delivery, monitoring SaaS, or destructive self-healing; the assigned application operator owns the stated manual cadence.

| Condition or operation | Safe operator procedure | Owner and boundary |
|---|---|---|
| Deployment/status check | Run preflight before deployment, deploy through the documented Compose command, then run `pilot:status`. Confirm release identity separately and retain the controlled result. | Application operator; never bypass a failed preflight or readiness result. |
| Logs | Use `docker compose --env-file .env.pilot logs --since 30m api web migrate db` and correlate sanitized events by request ID. Increase the time window only as needed. | Application operator; do not copy secrets, reporter PII, request bodies, or raw environment output into evidence. |
| Controlled restart | Record reason and approval, inspect status/logs, then restart only the identified service with `docker compose --env-file .env.pilot restart api web` as applicable. Run status again. Database restart requires the database/recovery owner and a maintenance window. | Application operator or database/recovery owner; one controlled attempt, no restart loop or automatic recovery. |
| Unhealthy service | Preserve `docker compose ps` and bounded logs, identify the failed dependency, and correct only reviewed configuration or service availability. Escalate after one controlled restart fails. | Application operator; never delete volumes or recreate data to clear health. |
| Migration failure | Keep API unavailable, preserve migration output, verify the release and read-only Prisma migration status, and escalate to the database/recovery owner for reviewed remediation. | Database/recovery owner; never use development migration, reset, reseed, or an unreviewed SQL repair. |
| Public web to API failure | Check `http://127.0.0.1:8080/api/v1/health/ready`, then direct loopback API readiness, web/API health, nginx/API logs, origin configuration, and the edge network. | Application operator; do not expose PostgreSQL/API publicly or weaken CORS/proxy trust. |
| Stale or missing backup | Treat the 24-hour RPO as failed. Check protected destination access and capacity, then run the documented manual backup once and verify status. Escalate if it fails. | Database/recovery owner; do not delete older backups or claim coverage from an invalid archive. |
| Low disk | Stop non-essential deployment/backup activity, record free space, identify only known Odyssey artifacts, and escalate storage expansion or reviewed retention action. | Database/recovery owner; no automated deletion, prune, or arbitrary file removal. |
| AI/weather degradation | Continue deterministic workflows when API readiness remains available, inspect protected health/metrics, and record the optional dependency state. | Application operator; do not fabricate data, bypass deterministic rules, or grant Open-Meteo production entitlement. |
| Integrity verification failure | Preserve the result, request IDs, logs, database/backup evidence, and affected scope; stop representing the affected chain as verified and escalate immediately. | Security/integrity escalation owner with SYSTEM_ADMIN/AUDITOR review; never recompute, overwrite, or auto-repair integrity evidence. |
| Manual backup | Run the documented Compose `backup` profile, confirm PostgreSQL 16 archive validation, then run `backup:status`. Record only final filename, UTC time, size, checksum, manifest version, and status. | Database/recovery owner; no scheduler, automatic retention, or source-data mutation. |
| Isolated restore drill | Provision a disposable/replacement PostgreSQL 16 target with a unique project/volume, validate the chosen archive with `pg_restore --list`, restore with `--exit-on-error --no-owner --no-privileges`, and run the post-restore checks below. Remove only the verified disposable target after evidence review. | Database/recovery owner under recorded authorization; never restore over the canonical database and never switch application traffic automatically. |

Perform an isolated restore drill before initial pilot activation, every 90 days while the pilot continues, and after a material PostgreSQL, schema, backup-format, or recovery-procedure change. After a restore, verify PostgreSQL readiness; all 27 migrations; representative Department/Jurisdiction/User/Asset/Case relationships; authentication and a scoped read-only Case request; trusted-computation receipts; integrity chain verification; observation sources/observations; API readiness; and source-versus-restore record counts where records exist. Successful `pg_restore` alone is not acceptance.

For every check cycle, incident, backup failure, and restore drill, retain a privacy-safe external operations record containing UTC timestamps, release SHA, assigned operator and role, command/check version, overall and per-check status, affected services, Docker health/restart counts, request IDs and sanitized event codes, backup filename/hash/manifest/age, free-space reading, approvals, actions attempted, escalation time/owner, resolution, and post-action verification. Never record credentials, connection URLs, bearer tokens, reporter PII, evidence narratives, or raw request bodies.

Scheduling of status checks and backups, backup retention, encryption, off-host replication, centralized log collection, automatic alerting, automatic restore, and failover remain unimplemented. Operators must not use reset/reseed or destructive self-healing.

## P3.7.5 isolated live pilot acceptance

P3.7.5 used uniquely named disposable PostgreSQL 16 Compose projects, dedicated volumes, synthetic credentials, loopback-only host ports, and governed synthetic repository data. It did not access or mutate the canonical database, project, volume, or unrelated Docker resources.

Source acceptance passed the read-only preflight, two idempotent role-provisioning runs, all 27 migrations plus a clean rerun, web and API readiness through the public web path, synthetic authentication, an authorized scoped read, and anonymous, wrong-role, and cross-scope denials. The deterministic reference Case remained `77 / VERY_HIGH / CRITICAL / ORP_READY`.

Runtime acceptance proved core readiness with AI disabled, internal AI availability when enabled, `DEGRADED` rather than `NOT_READY` when AI stopped, continued deterministic Case/risk reads during degradation, and recovery without an API restart. API/web restart and full `down`/`up` without `-v` preserved the synthetic Case, risk result, and all 27 migrations. The read-only operator status command returned `PASS` on the final healthy stack without changing container fingerprints or business-data counts.

Recovery acceptance created a real PostgreSQL 16.15 custom-format backup, validated it with `pg_restore --list`, matched the SHA-256 sidecar and manifest, reported current backup status, and left no partial file. A second disposable PostgreSQL 16 project restored the archive without overwriting the source. All 27 migrations, representative counts and relations, synthetic authentication, authorized scope, the reference risk state, trusted-computation, integrity-chain, and external-observation tables, and restored API readiness passed. The restore project, backup artifacts, then the source project and all dedicated containers, networks, volumes, images, and local validation files were removed.

Live acceptance exposed and corrected three bounded packaging/compatibility defects: clean API image generation now resolves the installed Prisma package without network auto-install; governed demo scripts normalize paginated GET envelopes while preserving detail/mutation responses; and the governed bootstrap loads Prisma Client from its generated source location. Permanent tests cover these contracts. No reset, reseed of canonical data, automatic restore, production entitlement change, or Phase 3.7.6 work occurred.

## Remaining P3.7 work

Read-only root filesystems, capability dropping, `no-new-privileges`, CPU/memory/PID limits, and immutable image-digest pinning remain deliberately deferred until separately scoped live compatibility and capacity validation. P3.7 still does not establish TLS/reverse-proxy access, rotate deployment credentials, schedule or retain encrypted backups, add centralized monitoring/log aggregation or alerts, perform an operational restore drill, or conduct a real pilot deployment. It does not grant Open-Meteo production entitlement or make AI authoritative.
