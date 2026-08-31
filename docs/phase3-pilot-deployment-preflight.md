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

## P3.7.2 Compose isolation and bounded runtime behavior

Compose separates service traffic by role. The `edge` network contains only web and API; the internal `data` network contains API, PostgreSQL, and the one-shot migration service; and the internal `intelligence` network contains only API and optional AI. Web therefore reaches API but cannot resolve PostgreSQL, while API reaches AI when enabled and AI cannot resolve PostgreSQL. PostgreSQL and AI have no host ports. Web and direct API publications remain loopback-only at their configured `127.0.0.1` bindings.

API and PostgreSQL receive a 30-second stop grace period so the API can drain and disconnect cleanly and PostgreSQL can shut down normally. Long-running PostgreSQL, API, web, and AI containers use the Docker `json-file` driver with a maximum of five 10 MiB files per container. The one-shot migration container remains non-restarting and is excluded from runtime log rotation.

Live validation used a uniquely named isolated Compose project, synthetic credentials, dedicated loopback ports, and a dedicated volume. It proved PostgreSQL health, all 27 migrations on an empty database, migration completion before API startup, API/web health, same-origin web-to-API proxying, the intended connectivity denials, exact loopback/no-port exposure, active log settings, and 30-second stop settings. A marker written only to the isolated database survived `down` followed by `up` without `-v`; the migration rerun reported no pending migrations. The deterministic stack remained healthy without AI, while the optional profile produced a healthy internal AI service reachable by API when explicitly enabled. All isolated containers, networks, volume, images, and temporary configuration were removed afterward.

## Remaining P3.7 work

Read-only root filesystems, capability dropping, `no-new-privileges`, CPU/memory/PID limits, and immutable image-digest pinning remain deliberately deferred until separately scoped live compatibility and capacity validation. P3.7 still does not establish TLS/reverse-proxy access, rotate deployment credentials, schedule or retain encrypted backups, add centralized monitoring/log aggregation or alerts, perform an operational restore drill, or conduct a real pilot deployment. It does not grant Open-Meteo production entitlement or make AI authoritative.
