# Phase 3 trusted computation foundation

## Purpose and initial target

P3.3 gives the authoritative deterministic risk assessment a reproducible, versioned computation identity. It records which scoring input produced which result under which risk-engine version. A fingerprint identifies persisted data; it does not establish that an inspection was factually correct.

## Provider architecture

`TrustedRiskComputationProvider` wraps the existing risk calculator. `LocalVerifiedProvider` is the only implementation and has identity `ODYSSEY_LOCAL_VERIFIED_V1`. It runs locally with no network or vendor dependency. A future hardware provider must accept the same logical input contract, support an identified computation version, return a versioned receipt, provide genuinely verified attestation evidence, and fail closed when policy requires hardware attestation. It must never silently relabel local execution as attested execution.

## Canonical input and fingerprints

`ODYSSEY_RISK_TRUSTED_INPUT_V1` includes Case and Inspection identities, the risk version, structural condition, crack severity, corrosion level, traffic importance, hospital-route flag, weather risk, heavy-rain flag, and estimated daily users. It excludes notes, PII, unrelated timestamps, database metadata, and secrets. Recursively sorted-key canonical JSON provides explicit null, boolean, enum, and integer representations. Input and result identities use lowercase `sha256:` plus a full 64-character digest.

The result contract includes the risk version, score, risk level, priority level, ordered reason codes, and ordered structured reasons. It excludes generated IDs and timestamps.

## Receipt, lineage, and runtime trust

`ODYSSEY_TRUSTED_COMPUTATION_RECEIPT_V1` is stored one-to-one with its exact `RiskAssessment`. It records the computation and input versions, fingerprints, provider, `LOCAL_VERIFIED` trust level, execution time, and attestation state. Receipt creation occurs inside the existing assessment transaction; failure rolls back assessment and Case projection changes. There is no update endpoint.

No hardware TEE is implemented. No hardware attestation is generated. Local receipts use `attestationState=NOT_AVAILABLE` and a null reference. A local receipt is reproducibility and provenance evidence, not enclave proof, hardware isolation, factual verification, or tamper-proof history.

## Verification and historical assessments

Scoped receipt read and verification operations reconstruct the canonical input, invoke the same risk calculator, and compare input, stored-result, and recomputed-result fingerprints. `VALID` means those controlled records reproduce under a supported version. It does not prove the inspection facts, officer conduct, hardware isolation, or uncompromised storage. Other controlled results are `INPUT_MISMATCH`, `RESULT_MISMATCH`, `UNSUPPORTED_VERSION`, and `RECEIPT_MISSING`.

Historical assessments are not backfilled or rewritten; they report a missing legacy receipt. Verification is read-only.

## Authority and future boundaries

Receipt metadata cannot approve a response plan, make a human decision, begin execution, verify work, close a Case, or alter organizational authority. The existing deterministic Case projection is unchanged. Predictive model governance is not connected; no model exists. P3.4 may later incorporate receipt-related events into a separately approved audit chain, but P3.3 creates no hash chain.
