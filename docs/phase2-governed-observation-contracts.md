# Phase 2.2 — Governed Observation and Source Contracts

## Purpose

ODYSSEY stores source-agnostic external observations as contextual evidence for possible future approved analysis. No live provider is connected by this checkpoint.

## Source model

`ObservationSource` identifies a stable source code and version, controlled source type, provider reference, contract version, provenance metadata, optional organizational applicability, status, registering SYSTEM_ADMIN, and any later deactivation actor, time, and reason. Only SYSTEM_ADMIN may register or deactivate sources. Inactive versions remain readable and retain their observations but reject ingestion.

## Observation envelope

`ExternalObservation` is immutable after ingestion. It records source and source-record identity, source and payload schema versions, observation type, normalized data, bounded source metadata, observed and ingestion times, quality and validation states, fingerprint, canonical organization, optional Asset and Case, and ingestion actor.

Initial normalized contracts use canonical units: WEATHER accepts Celsius, millimetres, and kilometres per hour; TRAFFIC accepts non-negative vehicle volume and a controlled congestion level; SENSOR requires a metric, numeric value, and explicit unit. Government, manual, and other observations accept a shallow scalar envelope rather than arbitrary nested provider data.

Phase 2.2 deterministically contract-validates manually submitted records and stores them as `VALID` and `ACCEPTED`. Invalid contracts are rejected before persistence; no AI quality score is used. `observedAt` may differ from `ingestedAt`; observations more than five minutes in the future are rejected to allow limited clock skew.

## Idempotency and immutability

`sourceId + sourceRecordId` is unique. The fingerprint covers normalized content, source and schema versions, time, linkage, organization, and source metadata. The first request creates a record. An exact retry returns the original with `idempotentReplay=true`. A retry with different material returns `OBSERVATION_IDEMPOTENCY_CONFLICT`; evidence is never overwritten. There is no observation update or delete endpoint. Corrections require a future governed append/void checkpoint.

## Linkage and scope

Asset-only, Case-only, both-linked, and explicitly scoped standalone observations are supported. Case-only scope is derived from its Asset. When both are supplied, the Case must belong to the Asset. Canonical Asset/Case organization overrides client claims. Standalone jurisdiction membership is validated. A scoped source must apply to the derived target organization.

SYSTEM_ADMIN has existing global reads. Other authenticated roles read only exact department and jurisdiction observations. Asset history verifies Asset visibility before pagination. Operational DTOs expose necessary source contract identity but omit source provenance metadata.

## Pagination and APIs

Source and observation collections reuse ODYSSEY opaque versioned cursors with default 25 and maximum 100. Sources order by `createdAt + id`; observations order by `ingestedAt + id`. Queries request `limit + 1`. Indexes support source versions, status, scope, linkage, type, time, and stable pagination.

Endpoints include source list/create/detail/deactivate, observation ingest/list/detail, and scoped Asset observation history. Ingestion is API-only and SYSTEM_ADMIN-only in this checkpoint; exposing a generic browser ingestion form would encourage arbitrary evidence submission before dedicated import workflows exist.

## Product boundary

External observations do not create Inspections or Cases, recalculate risk, change priority or Asset condition, generate intelligence, policy, Decision Packages or ORPs, approve decisions, authorize execution, create tasks, verify work, or close Cases. Fingerprints are integrity identifiers, not digital signatures. Live weather, traffic, sensor, government, and machine-credential integrations require separate approval and implementation checkpoints.
