# Phase 3.5 governed weather provider integration

Provider terms reviewed on: 2026-08-24. Terms can change; deployment owners must review the linked sources again before any pilot or production authorization.

## Provider assessment

| Provider | Contract assessment | Authentication and limits | Selection |
|---|---|---|---|
| Open-Meteo | Forecast API v1 is documented globally, including Pune. Free API is described for non-commercial evaluation/prototyping, with CC BY 4.0 data attribution and no uptime guarantee. Commercial use/dedicated capacity requires a subscription. | No key for the free evaluation endpoint; published free limit is 10,000 calls/day. | Selected as `EVALUATION_ONLY`. No production entitlement is claimed. |
| India Meteorological Department | IMD is the authoritative Indian meteorological agency and publishes API reference material, but the reviewed public material did not establish a sufficiently clear self-service entitlement, rate contract, or pilot SLA for this repository. | Some published interfaces exist; access/usage conditions require direct confirmation with IMD. | Not selected for automated integration. Preferred future authority subject to an explicit agreement and stable contract. |
| WeatherAPI.com | Documented worldwide current/forecast API with plan terms, attribution for free use, caching limits, and plan-specific quotas. | API key/account required; free plan currently advertises 100,000 monthly calls. | Not selected because it adds a secret/account and plan-governance burden without improving the evaluation objective. |

Sources: [Open-Meteo API documentation](https://open-meteo.com/en/docs), [Open-Meteo pricing and licence](https://open-meteo.com/en/pricing), [Open-Meteo OpenAPI contract](https://github.com/open-meteo/open-meteo/blob/main/openapi.yml), [IMD API documentation](https://mausam.imd.gov.in/imd_latest/contents/api.pdf), [IMD public API reference notice](https://mausam.imd.gov.in/Forecast/marquee_data/API_doc.pdf), [WeatherAPI documentation](https://www.weatherapi.com/docs/), [WeatherAPI terms](https://www.weatherapi.com/terms.aspx), and [WeatherAPI pricing](https://www.weatherapi.com/pricing.aspx).

No provider SLA is asserted for ODYSSEY. Open-Meteo combines numerical weather-prediction sources; provider output is contextual model-derived weather, not an official Indian warning and not a verified infrastructure condition.

## Governed architecture and boundary

An authorized OFFICER deliberately invokes `POST /api/v1/assets/:assetId/external-observations/weather/fetch`. The server loads the Asset through existing organizational-scope rules and uses its persisted coordinates. Clients cannot submit coordinates, a source ID, an upstream URL, or provider query fields. `OpenMeteoAdapter` owns a fixed HTTPS origin (`https://api.open-meteo.com`), fixed `/v1/forecast` path, and allowlisted current variables.

The adapter validates the upstream structure and exact unit declarations, maps four fields to the existing `ODYSSEY_WEATHER_V1` contract, and calls the existing P2.2 `ingestObservation` service. It never writes Prisma directly. The existing service enforces active source state, source scope, deterministic fingerprinting, replay conflict handling, and the P3.4 `EXTERNAL_OBSERVATION_INGESTED` integrity event in one serializable transaction. There is no second weather table, schema change, migration, provider SDK, queue, worker, cache, background polling, or automatic refresh.

The provider remains outside inspection, deterministic risk, trusted-computation receipts, priority, policy resolution, Decision Package, Action Plan/ORP, Human Decision, execution, verification, closure, portfolio, hotspot, trend, and predictive-data transactions. Provider failure cannot block those workflows and creates neither an observation nor an integrity event.

## Source governance and configuration

A SYSTEM_ADMIN must explicitly register an active `ObservationSource` with source code `OPEN_METEO_CURRENT`, source type `WEATHER_PROVIDER`, provider reference `OPEN_METEO`, and contract version `OPEN_METEO_CURRENT_V1`. Registration is governed and integrity-protected. Fetch never silently creates or activates a source. A missing, inactive, incompatible, or out-of-scope source fails closed.

| Variable | Secret? | Purpose |
|---|---|---|
| `ODYSSEY_WEATHER_PROVIDER_ENABLED` | No | Explicit enable switch; default `false`. |
| `ODYSSEY_WEATHER_PROVIDER` | No | Fixed provider identity; only `OPEN_METEO`. |
| `ODYSSEY_WEATHER_PROVIDER_DEPLOYMENT_CLASS` | No | `DISABLED` or `EVALUATION_ONLY`; must match enabled state. |
| `ODYSSEY_WEATHER_PROVIDER_BASE_URL` | No | Must be exactly `https://api.open-meteo.com`; credentials, alternate hosts, paths, ports, and protocols are rejected. |
| `ODYSSEY_WEATHER_PROVIDER_SOURCE_CODE` | No | Governed source registry identity, default `OPEN_METEO_CURRENT`. |
| `ODYSSEY_WEATHER_PROVIDER_TIMEOUT_MS` | No | Per-attempt timeout, default 3000 ms, allowed 250–10000 ms. |
| `ODYSSEY_WEATHER_PROVIDER_MAX_RETRIES` | No | Additional attempts, default 1, maximum 2. |

The evaluation endpoint requires no API key. No credential is accepted, stored, logged, returned, or exposed to the browser. Staging and production configurations fail closed if this evaluation-only integration is enabled. Production requires a separately reviewed entitlement and a future approved configuration contract; it must not be represented by changing the evaluation classification.

## Weather, time, and provenance contract

| Provider field | ODYSSEY field | Unit | Semantics |
|---|---|---|---|
| `current.temperature_2m` | `temperatureC` | °C | Model-derived current temperature |
| `current.precipitation` | `rainfallMm` | mm | Provider interval precipitation |
| `current.wind_speed_10m` | `windSpeedKph` | km/h | Model-derived 10 m wind speed |
| `current.weather_code` | `weatherCondition` | controlled text | Deterministic WMO-code category mapping |

The provider `current.time` in GMT is persisted as `observedAt` because that is the existing P2.2 event-time field; metadata explicitly calls it `validAt` and `CURRENT_MODEL_DERIVED`, avoiding any claim that it is a ground observation. Database-generated `ingestedAt` remains the separate retrieval/ingestion time. Allowlisted metadata records provider and adapter versions, upstream API, semantics, valid time, target and returned coordinates, interval, WMO code, timezone, canonical units, deployment class, and attribution. A volatile retrieval timestamp is deliberately not duplicated inside fingerprinted metadata because that would break exact replay; `ingestedAt` supplies the authoritative retrieval boundary. Full upstream bodies, headers, cookies, credentials, and networking details are not persisted.

Open-Meteo supplies no native record ID for this response. ODYSSEY derives `sourceRecordId` as SHA-256 over provider ID, adapter contract, governed Asset ID, valid timestamp, and `CURRENT`. Retrieval time is deliberately excluded. Exact replay therefore resolves through P2.2 idempotency without a second observation or integrity event; materially different content for the same identity is rejected as an idempotency conflict.

## Resilience and controlled errors

Each request has a bounded AbortController timeout. One additional attempt is the default. Timeout/network errors and 5xx responses may retry with a short bounded backoff (100 ms per retry). HTTP 429 retries only when numeric `Retry-After` is at most one second and an attempt remains; otherwise it returns `PROVIDER_RATE_LIMITED`. 400, 401, 403, schema errors, unsupported units, and malformed JSON do not retry. Permanent tests inject transport and sleep functions and never call the live provider or wait real retry intervals.

Upstream errors map to controlled ODYSSEY codes and generic UI wording; raw bodies, URLs, stack traces, and secrets are not returned. Added irrelevant fields are ignored. Missing blocks, wrong types, null required values, malformed timestamps, and unexpected unit labels fail as `PROVIDER_RESPONSE_INVALID` without partial persistence.

## Authorization and user experience

OFFICER is the only operational fetch role and remains limited to Assets in the exact authorized department and jurisdiction. Anonymous, AUDITOR, POLICY_ADMIN, SYSTEM_ADMIN, and cross-scope requests cannot trigger ingestion. SYSTEM_ADMIN retains source registration/deactivation and global read responsibilities but does not inherit operational OFFICER authority.

The existing Case Workspace observation panel displays persisted weather, provider-valid and ingestion times, validation states, contextual non-authority wording, model-derived semantics, and required text attribution: “Weather data by Open-Meteo.com.” The OFFICER fetch button has loading, success, idempotent replay, and controlled failure states and prevents concurrent repeated clicks. The UI identifies the integration as evaluation use and never claims production certification or provider endorsement.

## Production prerequisites

Before a live government pilot or production enablement: obtain and document the appropriate provider commercial/public-sector agreement, validate retention and attribution obligations, establish approved capacity/rate limits and operational support, decide whether IMD should replace or supplement the provider under an explicit contract, add the corresponding approved deployment classification and customer endpoint allowlist without weakening SSRF controls, and repeat legal/security/provider-contract review. This checkpoint neither invents nor grants that authority.
