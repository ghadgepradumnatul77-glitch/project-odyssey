# Phase 3.1 — Production configuration foundation

ODYSSEY validates one typed backend runtime contract before the Express listener accepts traffic. Deployment systems inject values externally; no secret manager, cloud resource, or production deployment is introduced here.

## Environments

| Environment | Purpose | Defaults |
|---|---|---|
| `development` | Local developer runtime | Localhost database, web, API, and advisory defaults are allowed. Proxy trust defaults to false. |
| `test` | Isolated automated validation | Deterministic local test defaults are allowed. Tests may inject an isolated database. |
| `staging` | Deployment-equivalent validation | Deployment-critical values must be explicit; unsafe local fallbacks are rejected. |
| `production` | Live production runtime | Deployment-critical values and secrets must be explicit; placeholders and silent localhost fallbacks fail startup. |

Unknown `NODE_ENV` values are rejected rather than interpreted as development.

## Backend variables

| Variable | Secret | Required environments | Purpose | Safe example format |
|---|---:|---|---|---|
| `NODE_ENV` | No | staging, production | Exact runtime environment | `production` |
| `API_PORT` | No | Optional | Listener port; defaults to `4000` outside explicit deployment configuration | `4000` |
| `DATABASE_URL` | **Yes** | staging, production | Prisma/PostgreSQL connection | `postgresql://USER:PASSWORD@HOST:5432/DATABASE` |
| `JWT_SECRET` | **Yes** | staging, production | HMAC access-token signing | `<inject-at-deployment>` |
| `JWT_ISSUER` | No | Optional | Token issuer | `project-odyssey-api` |
| `JWT_AUDIENCE` | No | Optional | Token audience | `project-odyssey-clients` |
| `JWT_ACCESS_TTL_SECONDS` | No | Optional | Access-token lifetime, 60–3600 seconds | `900` |
| `ALLOWED_ORIGINS` | No | staging, production | Comma-separated explicit browser origins | `https://app.example.gov.in` |
| `TRUST_PROXY` | No | staging, production | Express proxy trust: `false`, `loopback`, or 1–10 hops | `1` |
| `API_PUBLIC_BASE_URL` | No | staging, production | Externally reachable API URL | `https://api.example.gov.in/api/v1` |
| `WEB_PUBLIC_BASE_URL` | No | staging, production | Externally reachable browser application URL | `https://app.example.gov.in` |
| `ODYSSEY_INTELLIGENCE_ENABLED` | No | staging, production | Explicitly enables or disables optional advisory invocation | `false` |
| `ODYSSEY_INTELLIGENCE_SERVICE_URL` | No | When advisory integration is enabled | Internal HTTP(S) advisory endpoint without credentials | `https://advisory.internal` |
| `ODYSSEY_INTELLIGENCE_TIMEOUT_MS` | No | Optional | Fail-fast advisory timeout, 100–10000 ms | `2000` |

`DATABASE_URL`, `JWT_SECRET`, provider credentials, tokens, and private keys are backend-only. Configuration failures name the invalid key but never echo its supplied value. A redacted summary exposes only non-secret metadata and configured/not-configured booleans; there is no public configuration-dump endpoint.

## Frontend variables

| Variable | Client-visible | Required | Purpose |
|---|---:|---|---|
| `VITE_API_BASE_URL` | Yes | Optional | Browser API base. Development/test default to `http://localhost:4000/api/v1`; staging/production default safely to same-origin `/api/v1`. |

Every `VITE_*` value is public once bundled. JWT secrets, database URLs, provider secrets, passwords, and private credentials must never use that prefix. Absolute HTTP(S) and root-relative API bases are accepted; malformed schemes and unsupported build modes are rejected.

## Startup validation

`apps/api/src/server.ts` loads environment files, validates `apps/api/src/config/runtime.ts`, configures proxy/CORS behavior, and only then creates the listener. Missing production secrets, missing deployment URLs, wildcard or malformed origins, unsafe proxy settings, placeholder/local database fallbacks, or an enabled advisory integration without an explicit deployment URL prevent startup. Parsing performs no database query or mutation and is safe during tests and builds.

## CORS

Development/test trust only the documented local web origin by default. Staging/production require `ALLOWED_ORIGINS`. Values are normalized as exact origins, deduplicated, and may not contain wildcards, credentials, paths, queries, or fragments. Requests without an Origin header remain available to non-browser service and health clients. Credentialed browser responses are emitted only for an explicitly allowed origin; an unknown origin receives no CORS authorization.

## Trusted proxy

Proxy trust defaults to `false` in development/test. Staging/production must explicitly select `false`, `loopback`, or a bounded hop count from 1 to 10. ODYSSEY never uses the unsafe blanket `true` setting. Operators must match this value to the real reverse-proxy topology because it affects client IP, protocol detection, secure-cookie decisions, and rate limiting.

## AI integration

Advisory intelligence is optional and failure-safe. Staging/production must explicitly enable or disable it. When disabled, invocation returns controlled `SERVICE_DISABLED` unavailability without contacting a service. When enabled, an explicit non-local HTTP(S) URL without embedded credentials is required. This does not train, activate, load, or deploy a model; the existing provider remains deterministic, untrained, and advisory.

## Demo and test protection

The governed demo bootstrap, public-report demo bootstrap mode, and synthetic geolocation enrichment all call the shared server-side guard in `apps/api/scripts/runtime-safety.ts`. Mutation attempts under `NODE_ENV=production` fail with `DEMO_BOOTSTRAP_FORBIDDEN_IN_PRODUCTION`. Explicit read-only verification and dry-run modes remain permitted. The C6 browser harness remains restricted to its fixed isolated schema and now refuses entry with `TEST_HELPER_FORBIDDEN_IN_PRODUCTION` before reading or changing database configuration; it cannot reinterpret a production process as test.

## Data provenance boundary

Runtime environment and predictive data provenance are independent. Setting `NODE_ENV=production` does not convert existing or new records to `PredictiveProvenanceClass.PRODUCTION`. P2.6 continues to classify records through its governed data-provenance rules, and demo/synthetic records remain excluded from real datasets by default.

## Secret handling

Real `.env` and `.env.*` files remain ignored. Only placeholder `.env.example` and `.env.pilot.example` files are tracked. Deployment secrets must be injected through the runtime environment and must not be committed, printed, bundled into Vite output, or embedded in URLs exposed to the browser.
