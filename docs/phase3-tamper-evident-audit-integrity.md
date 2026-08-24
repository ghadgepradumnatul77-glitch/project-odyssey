# Phase 3.4 tamper-evident audit and evidence integrity

## Existing architecture found

Before P3.4, ODYSSEY persisted domain-specific immutable or lifecycle history for risk assessments, trusted-computation receipts, decision packages, response plans, human decisions, execution plans/tasks, blockers, schedule revisions, evidence, closures, observations, portfolio estimates/scenarios, predictive records, and model lifecycle events. Case Timeline assembled these sources for presentation. Several domains already used SHA-256 source fingerprints. There was no cryptographically linked, concurrency-safe integrity history. P3.4 therefore protects selected authoritative records without replacing those business models or the timeline.

## Protected event registry

`RISK_ASSESSMENT_RECORDED` is appended atomically with a new RiskAssessment, its P3.3 TrustedComputationReceipt, and the existing Case projection. It protects risk/version/reason identity, inspection/source lineage, and the P3.3 input/result fingerprints and truthful provider state.

`EXECUTION_EVIDENCE_RECORDED` is appended atomically with an ExecutionEvidence record. It protects digests of the governed record fields, not external file bytes.

Policy/action/template lifecycle, ApprovalAuthority, DecisionPackage, ORP, HumanDecision, execution-state/schedule/dependency/blocker mutations, closure, observation, portfolio, predictive-data, and predictive-model lifecycle events were evaluated. They retain their existing authoritative histories but are intentionally not claimed as P3.4-protected in this bounded first registry. Extending coverage requires transaction-by-transaction integration and tests; no synthetic event type or retrospective coverage is fabricated.

## Chain partition and concurrency

Operational events use `scope:<departmentId>:<jurisdictionId>`. Truly global future events use `system:global`; clients cannot select a chain. This partition matches organizational privacy, reduces contention, and bounds verification. `IntegrityChainHead` stores the exact head. Every append obtains a PostgreSQL transaction-scoped advisory lock derived from the server-generated chain key, checks the unique source identity, appends the next event, and advances the head in the same transaction. Database uniqueness on `(chainKey, sequenceNumber)` and `sourceEventKey`, plus serializable authoritative transactions, prevents duplicate positions, retries, and valid forks.

## Canonical payload and hash contract

The payload contract is `ODYSSEY_INTEGRITY_EVENT_PAYLOAD_V1`; the chain contract is `ODYSSEY_INTEGRITY_CHAIN_V1`. The allowlisted payload contains event/source/resource identity, server-derived actor and role snapshot, organizational scope, authoritative timestamp, and event-specific material facts. It excludes credentials, tokens, reporter PII, inspection notes, arbitrary row dumps, environment data, and unnecessary free text. Governance-critical evidence text/references are represented by digests.

Canonical JSON recursively sorts object keys while preserving array order and explicit null, boolean, string, and number representations.

`payloadHash = SHA256(canonicalPayload)`.

`eventHash = SHA256({ chainVersion, chainKey, sequenceNumber, previousEventHash, payloadHash, payloadContractVersion })`.

Digests use `sha256:` plus 64 lowercase hexadecimal characters.

## Genesis, legacy, append-only, and idempotency

The first event in each chain has sequence 1 and null previous ID/hash. Verification covers P3.4 events from this explicit genesis onward. Historical business records are neither rewritten nor presented as individually verified. There is no backfill.

No update, delete, hash, sequence, chain, actor, or timestamp mutation API exists. `sourceEventKey` uniquely identifies the authoritative event, so retrying an idempotent business operation cannot append a duplicate.

## Transactional coupling and failure

Covered business records and their integrity event commit in one PostgreSQL transaction or both roll back. Integrity append is not a best-effort side effect. The integrity layer observes the authorized mutation; it does not authorize or execute workflow actions.

## Evidence integrity

ExecutionEvidence uses `RECORD_DIGEST`. The protected facts include evidence type, task and submitter identity, and digests of description, URL/reference, document reference, and structured measurement data. `contentDigest` is null and `contentVerified` is false because ODYSSEY does not ingest or control referenced binary bytes. Evidence record integrity is protected; external referenced content is not cryptographically verified by ODYSSEY. No object storage was added.

## P3.3 composition

P3.3 remains reproducible computation provenance. P3.4 commits the receipt version, provider/trust state, input fingerprint, and result fingerprint into the risk integrity payload. It does not replace those fingerprints, change risk calculation, or claim hardware attestation.

## Verification, scope, and scaling

AUDITOR can read and verify only the exact department/jurisdiction chain in their authenticated scope. SYSTEM_ADMIN can inspect all chains. OFFICER and POLICY_ADMIN have no integrity API access. Cross-scope and unknown identifiers return non-disclosing not-found results. Raw payloads are not returned by collection APIs.

The service verifies specific events, lists bounded event pages, and verifies complete chains in deterministic ascending batches of 200 without imposing the presentation limit. Results distinguish valid history, payload mismatch, event-hash mismatch, broken linkage, sequence gap, head mismatch, unsupported version, and current-source mismatch. Verification is read-only.

## Guarantees and limitations

The internally stored chain detects ordinary inconsistent modification, deletion/gaps, reordering, broken linkage, payload corruption, and source-record divergence where reconciliation is implemented. It is tamper-evident, not tamper-proof. It is not blockchain, immutable storage, an external timestamp authority, digital signature, external notarization, or hardware-backed ledger/TEE evidence.

An attacker with unrestricted database control could rewrite all events, source records, and chain heads and recompute the entire chain. Stronger future assurance could use independently controlled append-only storage, externally anchored heads, signed checkpoints with approved key custody, or hardware-backed custody. None is implemented or claimed here.

## Product boundary

P3.4 changes no risk rule, priority, policy authority, approval authority, human decision, execution authorization, four-eyes verification, closure authority, portfolio authority, predictive status, or model governance. It adds no model, autonomous decision, rollback automation, SIEM, message bus, or P3.5 functionality.
