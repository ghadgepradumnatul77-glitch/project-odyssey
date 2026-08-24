# Phase 2.1 — Longitudinal Asset Condition Analytics

## Purpose

ODYSSEY presents descriptive history showing how persisted asset observations and authoritative deterministic risk assessments changed over time. It helps officers judge whether enough history exists to discuss an observed trend.

## Inputs and observation construction

The projection reads existing `Asset`, `Case`, `Inspection`, and `RiskAssessment` records. It combines inspections from every Case belonging to the requested Asset. Each inspection remains identified by its inspection and Case IDs. The most recently created RiskAssessment linked to that exact inspection is paired when present; no assessment is fabricated when absent.

Observations retain inspection time, structured condition factors, assessment ID and version, risk score and levels, priority, and record timestamps. Reporter details, inspection notes, and other free text are excluded.

## Deterministic method

Contract `ODYSSEY_CONDITION_HISTORY_V1` uses method `ODYSSEY_LONGITUDINAL_RULES_V1`. Observations are ordered by `inspectionDate`, then inspection ID. Latest-versus-previous values are null when two compatible source values do not exist.

Trend compares the earliest and latest observations in the bounded window. Risk-score movement and consistently recognized structural condition, crack severity, and corrosion levels contribute directional signals:

- `WORSENING`: all meaningful comparable signals worsen.
- `IMPROVING`: all meaningful comparable signals improve.
- `STABLE`: comparable signals do not change.
- `MIXED`: meaningful signals disagree.
- `INSUFFICIENT_DATA`: fewer than two observations or no comparable signals.

Reasons report observed changes and elapsed time. They do not assert causes.

## Data readiness

- `SUFFICIENT_FOR_TREND`: at least three observations, all paired to assessments, spanning at least 30 days.
- `LIMITED`: at least two observations exist but the sufficient threshold is unmet.
- `INSUFFICIENT`: zero or one observation.

Readiness applies only to descriptive longitudinal presentation. It does not establish readiness to train or deploy an ML model. Reasons disclose short windows, sparse history, missing assessment pairs, missing daily-user values, and coordinate absence. Completeness reports each important field as complete, partial, or unavailable without supplying defaults.

## API, authorization, and provenance

`GET /api/v1/assets/:assetId/condition-history` is authenticated. `SYSTEM_ADMIN` retains existing global Asset visibility; all other authenticated roles use exact department and jurisdiction scope. Missing and out-of-scope Assets both return the controlled `ASSET_NOT_FOUND` response.

The response exposes contract and method versions, Asset and organizational identifiers, source inspection and assessment IDs, and a deterministic SHA-256 source-set fingerprint. This is traceability metadata, not a digital signature.

## Scaling

The projection deliberately analyzes only the 100 most recent inspections ordered by inspection date and stable ID. The database query requests 101 rows to disclose truncation. Returned history represents the same explicit analysis window; it is never an unbounded Asset-history query. A future checkpoint may add cursor navigation for older archival windows without changing the calculation represented by an individual response.

## Product and governance boundaries

This checkpoint is read-only and does not mutate Cases, risk, priority, assessments, decision packages, action plans, human decisions, execution, verification, or closure.

It does not calculate or claim:

- failure probability or failure date
- future deterioration or future risk
- remaining useful life
- maintenance windows
- predictive confidence
- automated interventions or autonomous decisions

The existing deterministic risk engine remains authoritative. These descriptive records provide a data-quality foundation for possible later validated analytical work; they do not themselves establish production ML readiness.
