# Phase 3.6 reliability, observability, and recovery

This is a pilot-grade operational diagnostics and recovery foundation. It is not enterprise observability, centralized monitoring, automated alerting, self-healing, continuous backup, or a contractual availability guarantee.

## Pre-P3.6 operational audit

The API previously exposed one shallow `/api/v1/health` response with no database check or liveness/readiness distinction. Docker Compose already waited for PostgreSQL and migrations before starting the API, and the optional AI service exposed a bounded `/health` route. The API had no startup database precheck outside Compose, no graceful Prisma shutdown, no fatal-process shutdown controller, no request IDs, no structured logging utility, no metrics, and no backup or isolated-restore procedure. Operational messages used ad-hoc `console` calls. P3.5 weather was deliberately evaluation-only and had no operational status beyond request errors. The frontend had no system-health view.

## Health contract

`GET /api/v1/health/live` is public, cheap, and dependency-free. It reports only service and `UP`, or `SHUTTING_DOWN` during termination. `GET /api/v1/health/ready` is public and bounded. It reports only service and `READY`, `DEGRADED`, or `NOT_READY`. It performs a bounded `SELECT 1` database probe and, when configured, a bounded call to the existing AI `/health`. It never calls Open-Meteo. A dedicated moderate health-route rate limit prevents abusive probe traffic without consuming the stricter general API budget used by authenticated workflows.

`GET /api/v1/system/health` exposes the detailed dependency result only to SYSTEM_ADMIN and AUDITOR. OFFICER and POLICY_ADMIN are denied. Database is mandatory: failure produces `NOT_READY` and HTTP 503. Optional AI failure produces `DEGRADED` while authoritative workflows remain ready. Disabled AI/weather is not a failure. Enabled evaluation weather is `CONFIGURED_UNKNOWN`, producing `DEGRADED` without an external probe. Migration currency is honestly reported as `DEPLOYMENT_PREFLIGHT`: Compose runs migrations before API startup and operators must run Prisma migration status during deployment; health does not spawn Prisma tooling per request.

## Dependency classification

| Dependency | Mandatory | Health behavior |
|---|---:|---|
| API process/event loop | Yes | Liveness responds while process accepts requests |
| PostgreSQL | Yes | Bounded `SELECT 1`; failure makes readiness `NOT_READY` |
| Advisory AI | No | Disabled, available, or unavailable; outage degrades only |
| Open-Meteo evaluation provider | No | Disabled or configured/unknown; never probed by readiness |
| Migration currency | Deployment gate | `prisma migrate status`, not a per-request subprocess |

## Structured logging and request correlation

The API always generates a cryptographically random UUID request ID, ignores inbound `X-Request-Id`, returns the generated value in `X-Request-Id`, and logs one JSON completion event containing timestamp, level, event, service, environment, requestId, method, normalized path, status code, duration, and bounded error category. Query strings and bodies are not logged. UUID/numeric path components are normalized to `:id`; metrics therefore do not create resource-ID cardinality.

The redactor recursively masks keys matching authorization, cookies, passwords, secrets, tokens, database URLs, API keys, and private tracking references. It also masks bearer/JWT/database-URL patterns in strings. Reporter PII, evidence narratives, credentials, headers, and request bodies are absent from request logs. Unexpected request errors produce a sanitized client envelope and a structured server event with the same request ID. Existing domain error codes remain authoritative; operational categories do not replace client taxonomy.

## Metrics and durability limitation

`GET /api/v1/system/metrics` is read-only and restricted to SYSTEM_ADMIN/AUDITOR. It returns bounded in-process totals: request count, status classes, total/average duration, error total, uptime/start time, and weather success/timeout/rate-limit/invalid/failure outcomes. It has no user, resource, raw URL, or query labels.

Operational metrics shown by the endpoint are process-local diagnostics and reset when the service restarts. They are not durable monitoring history, governance evidence, or an audit source. P3.4 remains the authoritative integrity history. No metrics table, Prometheus server, Grafana, collector, SaaS, queue, or cache was added.

## Startup, shutdown, and fatal errors

Startup sequence is: validate P3.1 configuration during import, run the mandatory database precheck with a five-second bound, start the listener, set process state `READY`, and emit a structured readiness event. Database failure or timeout prevents listening and sets non-success process semantics. Compose separately ensures migrations complete before API startup.

SIGTERM and SIGINT set `SHUTTING_DOWN`, making readiness fail before closure; stop accepting traffic through `server.close`; permit existing Node requests to finish within a 10-second bound; disconnect Prisma within a separate 10-second bound; and set a clean exit code. Duplicate signals are idempotent. `unhandledRejection` and `uncaughtException` emit a safe structured fatal event and initiate the same shutdown with non-zero exit semantics rather than continuing in an unknown state. Signal/fatal handlers are wired only by the non-test bootstrap, preventing test-runner global side effects. The application does not restart itself.

## Backup procedure

Use PostgreSQL custom format through the operator-only CLI script:

```powershell
$env:DATABASE_URL = '<deployment-supplied connection URL>'
npm run backup:postgres -- C:\secure\odyssey-backups
```

The script requires `DATABASE_URL` and an output directory, creates a timestamped `odyssey-<UTC>.dump`, invokes `pg_dump` with an argument array and `shell: false`, uses `--format=custom --no-owner --no-privileges`, fails on process/output errors, and never deletes earlier backups. It logs only the output path and format, not the connection URL. No backup HTTP endpoint exists. A backup is a read-only operation against the source database.

Backups can contain sensitive operational and identity data. Store them under access control. Production/pilot storage must supply encryption at rest and secure transport under deployment policy; `pg_dump` itself does not provide that claim. No key or backup artifact is committed. Scheduling and retention are not implemented here.

## Restore procedure and verification

Never restore over the canonical database. Provision a disposable/replacement PostgreSQL target, then run:

```powershell
createdb --maintenance-db '<replacement-admin-url>' odyssey_restore
pg_restore --exit-on-error --clean --if-exists --no-owner --no-privileges --dbname '<isolated-target-url>' '<backup.dump>'
npx prisma migrate status --schema database/prisma/schema.prisma
```

For the P3.6 proof, a read-only custom-format backup is taken from the canonical local database, restored into an isolated temporary PostgreSQL container/database, checked, and removed. Verification must confirm the Prisma migration table and 27 applied migrations; representative relational tables and foreign keys; `TrustedComputationReceipt`; `IntegrityAuditEvent`/chain state; `ObservationSource`; and `ExternalObservation`. Representative source/target counts are compared where records exist. Successful `pg_restore` alone is insufficient evidence. The source database is never reset, reseeded, dropped, or written.

## Pilot RPO and RTO targets

Pilot target RPO: **24 hours**. This assumes P3.7 schedules and verifies at least one successful backup every 24 hours. P3.6 does not deploy scheduling.

Pilot target RTO: **4 hours**. This is an operational recovery objective based on the tested isolated restore procedure, not a contractual SLA. It includes replacement database provisioning, restore, migration/schema checks, application restart, and post-restore verification.

Recommended—but not approved or implemented—P3.7 policy: retain seven daily backups after storage, privacy, and legal review.

## Recovery runbook

| Scenario | Symptom/severity | Safe operator checks/action | Prohibited action / escalation |
|---|---|---|---|
| API will not start | Fatal; listener absent | Validate P3.1 configuration, inspect structured startup event, check DB readiness and migration job, correct deployment configuration, restart through supervisor | Do not bypass config/DB precheck; escalate after one controlled retry |
| Database unavailable | `NOT_READY`; core outage | Check PostgreSQL/container health, network and deployment secret availability without printing credentials; restore service or provision replacement | Never reset/reseed canonical DB; escalate to DB operator |
| Weather unavailable | Fetch error; optional degradation | Continue authoritative workflow, inspect bounded weather metrics, retry later | Do not fabricate weather or switch to unapproved provider |
| AI unavailable | `DEGRADED`; advisory absent | Continue deterministic workflow, verify optional service health/configuration | Do not block or replace deterministic authority |
| High error rate | Rising 4xx/5xx process counters | Correlate by request ID and normalized route, inspect sanitized errors and dependencies | Do not log bodies/PII; escalate sustained 5xx |
| Integrity verification failure | Verification reports mismatch | Stop treating affected chain as verified, preserve DB/log/backup evidence, restrict high-risk action under approved policy, investigate source records | Never recompute hashes or auto-repair; escalate to authorized SYSTEM_ADMIN/AUDITOR |
| Backup creation | Script fails or no output | Verify `pg_dump`, target permissions/capacity, and deployment-supplied URL; rerun once | Do not expose URL or delete source/old backups automatically |
| Restore replacement | Disaster recovery | Provision isolated/replacement target, restore with `--exit-on-error`, validate migrations/schema/counts, repoint only after authorization | Never target canonical DB or expose restore through HTTP |
| Migration verification | Deployment/restore gate | Run Prisma validate and migrate status; confirm 27 migrations | Do not generate or apply unreviewed destructive migration |
| Service restart | Dependency restored | Re-run readiness/detailed health, authenticate, verify representative read-only workflow and integrity status | Do not reseed or silently change provider entitlement |

## Post-restore checks

Confirm database readiness; migration count/status; representative Department/Jurisdiction/User/Asset/Case relations; risk receipt presence; integrity chain verification state; observation source/observation availability; API readiness; authentication; and a read-only Case retrieval. Preserve the recovery evidence and record operator authorization outside application tables under the deployment incident process.

## Explicit non-goals and P3.7 prerequisites

No external monitoring, alerts, centralized log retention, automated backup schedule, retention enforcement, automatic recovery, failover, provider fallback, immutable logs, 24/7 operations, model work, or pilot rollout is implemented. P3.7 must approve and deploy backup scheduling/retention, protected/encrypted storage, production monitoring/log aggregation, alert ownership/escalation, restore-drill cadence, capacity thresholds, operator access, incident handling, and provider production entitlement if ever proposed.
