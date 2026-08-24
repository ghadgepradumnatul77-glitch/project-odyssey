# Phase 2.7 — Predictive model governance foundation

## Why governance precedes modeling

ODYSSEY has no legitimate training dataset yet. P2.6 is collecting governed real outcomes and still reports `NO_MODEL_YET`. P2.7 therefore creates control records and legal transitions before any offline experiment is permitted. It trains no model, fabricates no metric, and creates no canonical candidate.

## Model registry

`PredictiveModelVersion` is an immutable identity: name/version, the implemented `TASK_LATENESS` target, `TASK_LATENESS_ADVISORY` registry slot, exact feature/outcome contracts, training code version, training timestamp, immutable dataset snapshot, intended and forbidden use, and artifact reference/digest/format/size. The SHA-256 digest identifies referenced bytes; it is not a signature, attestation, safety proof, or artifact store.

Intended and forbidden use are mandatory. A future lateness model may advise whether an assigned task could finish after its planned end using assignment-time facts. It may not reassign or evaluate officers, impose discipline, change Case risk or priority, bypass policy/execution governance, allocate budgets, authorize work, verify completion, close Cases, or make direct citizen-impact decisions.

## Dataset snapshots

`PredictiveDatasetSnapshot` freezes the existing export contract, target/contracts, organization scope, explicit `PRODUCTION`/`PILOT` provenance selection, counts, class balance, period, ordered sample identities, and deterministic fingerprint. Creation derives identities server-side from eligible active P2.6 snapshots/outcomes. Clients cannot inject sample IDs. Demo, synthetic, test, void, pending, cancelled and temporally invalid samples are excluded.

## Evaluation

`PredictiveModelEvaluation` stores evidence produced by an approved offline process; the API does not calculate metrics. `TASK_LATENESS_EVALUATION_V1` requires a described split, period, reconciled sample/class/confusion counts, precision, recall, F1, PR-AUC, calibration error, false-negative count/rate, evaluation reference, and at least one explicit baseline comparison. Optional references preserve subgroup, feature-distribution and missingness evidence for future drift governance. No performance threshold is invented here; acceptance thresholds require later approved policy.

## Lifecycle

- `EXPERIMENTAL → EVALUATED` when one immutable compatible evaluation is recorded.
- `EVALUATED → VALIDATED` after independent auditor review, or `REJECTED`.
- `VALIDATED → APPROVED` after a separate approval record, or `REJECTED`.
- `APPROVED → ACTIVE` only after every registry precondition passes.
- `ACTIVE → APPROVED` when replaced or rolled back; this preserves approval for a compatible inactive version.
- `APPROVED/ACTIVE → DEPRECATED` by explicit system-administrator action.
- `REJECTED` and `DEPRECATED` are terminal without a future explicit revalidation design.

Every transition appends a lifecycle event. Generic status patching is not exposed.

## Approval

System administrators register model/dataset/evaluation evidence. Auditors receive only narrowly scoped validate/approve/reject actions. Creators and evaluation recorders cannot validate or approve the same candidate. Approval has a reason, optional restrictions, optional review date and optional explicit expiry; no default expiry is invented. Ordinary officers and policy administrators have no registry access or lifecycle power.

## Activation

Activation requires an approved, non-expired approval, compatible implemented target and contracts, immutable non-empty dataset lineage, evaluation evidence and artifact digest. PostgreSQL enforces one `ACTIVE` version per model/target/slot with a partial unique index, while serializable transactions replace an existing active version safely.

Activation is registry metadata only. It does **not** deploy an artifact, alter the Python reference provider, enable inference, or create operational authority.

## Rollback and deprecation

Rollback is explicit and reasoned. It changes the current active registry version back to `APPROVED`, reactivates the latest compatible still-approved predecessor, and appends events to both histories. It never deletes a version. Deprecation is permanent in this contract and does not rewrite historical intelligence assessments.

## Product boundary

- No model trained or deployed.
- No prediction or probability generated.
- No canonical model registered, approved or active.
- No Python provider replacement or dynamic plugin execution.
- No automatic risk/priority mutation, approval, allocation, execution, verification or closure.

Only after sufficient real P2.6 outcomes exist should an independently authorized offline experiment create an immutable dataset snapshot and return external evaluation evidence for governed review.
