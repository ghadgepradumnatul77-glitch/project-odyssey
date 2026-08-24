# Phase 3.4 tamper-evident audit and evidence integrity

## Architecture and assurance boundary

ODYSSEY keeps each business model authoritative. `IntegrityAuditEvent` is an append-only, cryptographically linked observation of a successful governance mutation; it does not replace Case Timeline, domain lifecycle records, authorization, or workflow state. Exact operational events use `scope:<departmentId>:<jurisdictionId>`, department-wide governance uses `department:<departmentId>`, and truly global registry events use `system:global`. A jurisdiction-only key is reserved defensively and is visible only to system administration because valid ODYSSEY scope always includes a department. The server derives the chain, actor, role snapshot, scope, source identity, and authoritative timestamp.

The chain contract remains `ODYSSEY_INTEGRITY_CHAIN_V1` and the payload contract remains `ODYSSEY_INTEGRITY_EVENT_PAYLOAD_V1`. Completion coverage is identified by `ODYSSEY_P3_4_GOVERNANCE_COVERAGE_V2`. No schema or migration change was required.

Coverage is prospective. Risk and execution-evidence coverage starts with the original P3.4 foundation. Every other event type below starts when the P3.4 completion code is deployed. Historical domain records are not backfilled, rewritten, or described as verified.

## Coverage matrix

`Identity-batched` reconciliation means verification confirms the authoritative source identity still exists using one bounded query per source model per 200-event verification batch. Risk and evidence additionally rebuild their material canonical facts. Lifecycle-event sources are immutable history rows; mutable aggregate rows are not compared to an obsolete prior state, preventing legitimate later transitions from being reported as tampering.

| Event family | Event type | Authoritative source | Transactionally coupled? | Source reconciliation | Coverage start | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Risk | `RISK_ASSESSMENT_RECORDED` | `RiskAssessment` + `TrustedComputationReceipt` | Yes | Exact material rebuild | Original P3.4 genesis | PROTECTED |
| Evidence | `EXECUTION_EVIDENCE_RECORDED` | `ExecutionEvidence` | Yes | Exact record-digest rebuild | Original P3.4 genesis | PROTECTED |
| Policy | `POLICY_VERSION_CREATED` | `PolicyDocument` | Yes | Identity-batched | Completion genesis | PROTECTED |
| Policy | `POLICY_RULE_CREATED` | `PolicyRule` | Yes | Identity-batched | Completion genesis | PROTECTED |
| Policy | `POLICY_STATUS_CHANGED` | `PolicyDocument` transition | Yes | Lifecycle-aware identity | Completion genesis | PROTECTED |
| Approved actions | `APPROVED_ACTION_VERSION_CREATED` | `ApprovedActionVersion` | Yes | Identity-batched | Completion genesis | PROTECTED |
| Approved actions | `APPROVED_ACTION_STATUS_CHANGED` | `ApprovedActionVersion` transition | Yes | Lifecycle-aware identity | Completion genesis | PROTECTED |
| Execution templates | `EXECUTION_TEMPLATE_VERSION_CREATED` | `GovernedExecutionTemplate` | Yes | Identity-batched | Completion genesis | PROTECTED |
| Execution templates | `EXECUTION_TEMPLATE_TASK_ADDED` | `GovernedExecutionTaskTemplate` | Yes | Identity-batched | Completion genesis | PROTECTED |
| Execution templates | `EXECUTION_TEMPLATE_STATUS_CHANGED` | `GovernedExecutionTemplate` transition | Yes | Lifecycle-aware identity | Completion genesis | PROTECTED |
| Authority | `APPROVAL_AUTHORITY_GRANTED` | `ApprovalAuthority` | Yes | Lifecycle-aware identity | Completion genesis | PROTECTED |
| Authority | Deactivation/revocation | No service or route exists | N/A | N/A | N/A | NOT_APPLICABLE |
| Decision | `DECISION_PACKAGE_PREPARED` | `DecisionPackage` | Yes | Identity-batched | Completion genesis | PROTECTED |
| Decision | `ACTION_PLAN_CREATED` | `OperationalResponsePlan` | Yes | Lifecycle-aware identity | Completion genesis | PROTECTED |
| Decision | `HUMAN_DECISION_RECORDED` | `OrpDecision` | Yes | Identity-batched | Completion genesis | PROTECTED |
| Execution | `EXECUTION_PLAN_CREATED` | `ExecutionPlan` | Yes | Lifecycle-aware identity | Completion genesis | PROTECTED |
| Execution | `EXECUTION_TASK_ASSIGNED` | `ExecutionTask` | Yes | Lifecycle-aware identity | Completion genesis | PROTECTED |
| Execution | `EXECUTION_TASK_STARTED` | `ExecutionTask` | Yes | Lifecycle-aware identity | Completion genesis | PROTECTED |
| Execution | `EXECUTION_TASK_BLOCKED` | `ExecutionTaskBlockerEvent` | Yes | Lifecycle-aware identity | Completion genesis | PROTECTED |
| Execution | `EXECUTION_TASK_BLOCKER_RESOLVED` | `ExecutionTaskBlockerEvent` | Yes | Lifecycle-aware identity | Completion genesis | PROTECTED |
| Execution | `EXECUTION_TASK_COMPLETION_SUBMITTED` | `ExecutionTask` | Yes | Lifecycle-aware identity | Completion genesis | PROTECTED |
| Execution | `EXECUTION_TASK_VERIFIED` | `ExecutionTask` | Yes | Lifecycle-aware identity | Completion genesis | PROTECTED |
| Execution | `EXECUTION_TASK_CANCELLED` | `ExecutionTask` | Yes | Lifecycle-aware identity | Completion genesis | PROTECTED |
| Scheduling | `EXECUTION_PLAN_SCHEDULE_REVISED` | `ExecutionScheduleRevision` | Yes | Identity-batched | Completion genesis | PROTECTED |
| Scheduling | `EXECUTION_TASK_SCHEDULE_REVISED` | `ExecutionScheduleRevision` | Yes | Identity-batched | Completion genesis | PROTECTED |
| Dependencies | `EXECUTION_TASK_DEPENDENCY_ADDED` | `ExecutionTaskDependency` | Yes | Identity-batched | Completion genesis | PROTECTED |
| Dependencies | `EXECUTION_TASK_DEPENDENCY_REMOVED` | Deleted dependency snapshot | Yes | Lifecycle snapshot | Completion genesis | PROTECTED |
| Closure | `CASE_CLOSED` | `CaseClosure` | Yes | Identity-batched | Completion genesis | PROTECTED |
| Observation | `OBSERVATION_SOURCE_REGISTERED` | `ObservationSource` | Yes | Lifecycle-aware identity | Completion genesis | PROTECTED |
| Observation | `OBSERVATION_SOURCE_DEACTIVATED` | `ObservationSource` transition | Yes | Lifecycle-aware identity | Completion genesis | PROTECTED |
| Observation | `EXTERNAL_OBSERVATION_INGESTED` | `ExternalObservation` | Yes | Identity-batched | Completion genesis | PROTECTED |
| Portfolio | `CASE_RESOURCE_ESTIMATE_CREATED` | `CaseResourceEstimate` version | Yes | Identity-batched | Completion genesis | PROTECTED |
| Portfolio | `PORTFOLIO_SCENARIO_CREATED` | `PortfolioScenario` | Yes | Identity-batched | Completion genesis | PROTECTED |
| Predictive data | `PREDICTIVE_FEATURE_SNAPSHOT_CREATED` | `PredictiveFeatureSnapshot` | Own persistence transaction | Lifecycle-aware identity | Completion genesis | PROTECTED |
| Predictive data | `PREDICTIVE_OUTCOME_RECORDED` | `PredictiveOutcome` | Own persistence transaction | Lifecycle-aware identity | Completion genesis | PROTECTED |
| Predictive data | `PREDICTIVE_FEATURE_SNAPSHOT_VOIDED` | `PredictiveFeatureSnapshot` transition | Yes | Lifecycle-aware identity | Completion genesis | PROTECTED |
| Predictive data | `PREDICTIVE_OUTCOME_VOIDED` | `PredictiveOutcome` transition | Yes | Lifecycle-aware identity | Completion genesis | PROTECTED |
| Predictive data | `PREDICTIVE_DATASET_SNAPSHOT_CREATED` | `PredictiveDatasetSnapshot` | Yes | Identity-batched | Completion genesis | PROTECTED |
| Model governance | `PREDICTIVE_MODEL_REGISTERED` | `PredictiveModelVersion` | Yes | Lifecycle-aware identity | Completion genesis | PROTECTED |
| Model governance | `PREDICTIVE_MODEL_EVALUATED` | `PredictiveModelEvaluation` | Yes | Identity-batched | Completion genesis | PROTECTED |
| Model governance | `PREDICTIVE_MODEL_VALIDATED` | `PredictiveModelLifecycleEvent` | Yes | Identity-batched | Completion genesis | PROTECTED |
| Model governance | `PREDICTIVE_MODEL_APPROVED` | `PredictiveModelApproval` | Yes | Identity-batched | Completion genesis | PROTECTED |
| Model governance | `PREDICTIVE_MODEL_REJECTED` | `PredictiveModelApproval` | Yes | Identity-batched | Completion genesis | PROTECTED |
| Model governance | `PREDICTIVE_MODEL_ACTIVATED` | `PredictiveModelLifecycleEvent` | Yes | Identity-batched | Completion genesis | PROTECTED |
| Model governance | `PREDICTIVE_MODEL_REPLACED` | `PredictiveModelLifecycleEvent` | Yes | Identity-batched | Completion genesis | PROTECTED |
| Model governance | `PREDICTIVE_MODEL_ROLLED_BACK` | Each immutable rollback lifecycle row | Yes, two source events | Identity-batched | Completion genesis | PROTECTED |
| Model governance | `PREDICTIVE_MODEL_DEPRECATED` | `PredictiveModelLifecycleEvent` | Yes | Identity-batched | Completion genesis | PROTECTED |

There are no `DEFERRED_WITH_BLOCKER` items in the approved P3.4 scope.

## Event identity and canonical payloads

Every protected mutation has an event-specific allowlist. Free text that is material to governance—decision reason, closure summary, schedule reason, blocker reason, evidence description/reference, and similar values—is represented by a SHA-256 digest rather than copied into audit APIs. Model events include governed artifact and dataset fingerprints, approval/lifecycle lineage, and `inferenceDeployed: false`; they never contain model binaries.

`sourceEventKey` uses immutable source IDs, version IDs, revision IDs, dependency IDs, lifecycle-event IDs, or stable single-transition resource IDs. Timestamps are never the sole identity. Database uniqueness on `sourceEventKey` makes retry append idempotent. Domain idempotency remains unchanged: exact Case closure retries return the original closure, ORP/plan/package retries retain their existing behavior, and rejected duplicate HumanDecision attempts cannot create a second audit event.

Canonical JSON recursively sorts object keys while preserving array order and explicit JSON values.

`payloadHash = SHA256(canonicalPayload)`

`eventHash = SHA256({ chainVersion, chainKey, sequenceNumber, previousEventHash, payloadHash, payloadContractVersion })`

Digests use `sha256:` followed by 64 lowercase hexadecimal characters.

## Transaction coupling, lock order, and multi-event operations

Authoritative business rows are created or transitioned first inside their existing serializable transaction. The integrity event is appended last in that same transaction. `appendIntegrityEvent` then obtains the transaction-scoped PostgreSQL advisory lock for the server-derived chain, checks source-key idempotency, appends the next linked event, and advances the head. No integrity path acquires the chain lock before a domain lock. The consistent order is therefore:

1. authorize and load/lock domain state;
2. write authoritative domain rows;
3. acquire the chain advisory lock;
4. append the integrity event and update the chain head;
5. commit both or roll back both.

This preserves the foundation's no-fork concurrency behavior and avoids chain-lock/domain-lock inversion. The unique `(chainKey, sequenceNumber)` constraint remains a second database guard.

Model replacement records one event for the previous model's immutable `REPLACED` lifecycle row and one `ACTIVATED` event for the new model's independent lifecycle row. Rollback records two `PREDICTIVE_MODEL_ROLLED_BACK` events because two immutable lifecycle source rows represent distinct governed state transitions. Schedule revisions create one integrity event for the revision source row; they do not duplicate an event for the mutable plan/task aggregate.

Predictive feature and outcome collection is intentionally best-effort relative to execution. A predictive record and its integrity event are atomic inside their own transaction, but failure of that transaction remains nonblocking for the operational assignment/completion/cancellation that triggered collection. This preserves the existing boundary: passive predictive collection is not operational authority.

## Verification, lifecycle semantics, and scaling

Verification is read-only. It loads integrity events in deterministic ascending batches of 200. For each batch it groups heterogeneous resource IDs by source model and performs at most one source query per represented model—never one query per event. A 501-event heterogeneous fixture crosses three batches and proves complete verification without presentation truncation. The first source mismatch sequence is reported while the chain itself is still fully checked.

Risk and evidence records have exact event-specific source rebuilds. Other event families receive batched authoritative identity reconciliation. This deliberately does not compare an old grant/activation/task event to a mutable aggregate's current lifecycle state. Immutable revision, decision, closure, evaluation, approval, and lifecycle source records remain independently addressable. Dependency removal is an explicit lifecycle snapshot because the authoritative dependency row is deleted by the governed operation.

The Integrity Audit summary reports `protectedEventTypes`, scoped `eventCountsByType`, `coverageContractVersion`, the prospective coverage disclosure, and `historicalBackfill: false`. Event collection responses exclude raw payloads. AUDITOR access is limited to the exact authenticated department/jurisdiction; SYSTEM_ADMIN may inspect all chains. OFFICER and POLICY_ADMIN cannot use the integrity APIs. Cross-scope and unknown resources use non-disclosing not-found behavior.

## Evidence and P3.3 composition

Execution evidence remains `RECORD_DIGEST`, not `CONTENT_DIGEST`. ODYSSEY protects the governed evidence record fields and explicitly reports `contentDigest: null` and `contentVerified: false`; referenced external bytes are not controlled or cryptographically verified.

P3.3 remains reproducible computation provenance with `LOCAL_VERIFIED` runtime trust. P3.4 links the receipt version, provider/trust state, input fingerprint, and result fingerprint into the risk event. It does not change the deterministic risk algorithm and does not claim hardware TEE or attestation.

## Guarantees and limitations

The chain detects ordinary inconsistent modification, deletion/gaps, reordering, broken linkage, payload corruption, unsupported contracts, head mismatch, and reconciled source deletion/divergence. It is tamper-evident, not tamper-proof. It is not a blockchain, immutable database, digital-signature system, external timestamp/notarization authority, SIEM, message bus, or hardware-backed ledger.

An attacker with unrestricted database control could rewrite source records, events, and heads and recompute the chain. Stronger future assurance would require independently controlled append-only storage, externally anchored or signed checkpoints with approved key custody, or hardware-backed custody. None is implemented or claimed.

P3.4 changes no risk rule, priority, policy authority, approval authority, human decision, execution authorization, four-eyes verification, closure authority, portfolio authority, predictive lifecycle rule, or model deployment behavior. It trains and deploys no model, performs no autonomous decision, and starts no P3.5 work.
