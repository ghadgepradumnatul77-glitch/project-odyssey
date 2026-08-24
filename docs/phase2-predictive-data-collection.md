# Phase 2.6 — Predictive data collection foundation

ODYSSEY does not train, deploy, or invoke a predictive model in this phase. The deterministic risk engine, policy resolution, human decision, execution controls, verification, closure, and privacy boundaries remain authoritative.

## Implemented target

`TASK_LATENESS` is the only implemented collection target. At task assignment the API passively records a versioned, immutable feature snapshot containing only facts available at that moment. Completion submission records the objective `LATE` or `ON_TIME` outcome by comparing the governed planned end with the submission time. Cancellation is retained as `CANCELLED`, but excluded from supervised lateness rows.

Collection is idempotent per task and contract version. A collection failure is logged and never rolls back the authoritative assignment, completion, or cancellation transaction. Records are corrected through privileged void-and-replacement provenance, never destructive edits.

## Data governance

Known governed bootstrap asset codes and `DEMO-` prefixes are classified as `DEMO`. Other current collection is conservatively `PILOT`; nothing is automatically promoted to `PRODUCTION`. Default dataset export includes only `PRODUCTION` and `PILOT`. System administrators may explicitly include demo/synthetic/test records, which remain visibly classified.

Exports are allowlisted, organizationally scoped, versioned, paginated, and fingerprinted. They contain no reporter identity, evidence narrative, completion note, verification note, authentication material, or post-prediction feature leakage. Readiness is factual and always reports `NO_MODEL_YET`.

`PLAN_DELAY` and `ASSET_DETERIORATION` are documented future extensions only. They require separately approved target definitions, collection contracts, legitimate longitudinal outcomes, and validation before implementation.
