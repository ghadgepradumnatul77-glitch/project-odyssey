# Phase 2.5 — Portfolio and Resource Planning

This checkpoint adds governed planning estimates and deterministic portfolio scenarios. It is decision support, not financial approval, procurement authority, execution authorization, or an optimization claim.

Amounts are stored as integer minor units with an explicit INR currency. Each Case estimate is versioned; recording a revision supersedes the previous active estimate while retaining its provenance. Scenarios are immutable snapshots of authorized active Cases, their authoritative risk/priority, the exact estimate versions used, a hypothetical budget, controlled resource capacities, the deterministic algorithm version, and the resulting selection or constraint reasons.

The ordering is lexicographic: authoritative priority, authoritative risk, emergency flag, hospital-route indicator, oldest Case, and stable Case ID. Missing or incomplete estimates remain visible as not ready. A critical Case that cannot fit the hypothetical budget is explicitly reported as `CRITICAL_UNFUNDED`; it is never silently demoted. Resource capacity uses controlled categories measured in unit-days.

Only scoped operational officers may create estimates or scenarios. Authenticated readers retain existing organizational visibility, and system administrators receive global read visibility only. These operations do not mutate Case risk, priority, status, policy resolution, decision packages, Action Plans, human decisions, execution, verification, closure, or citizen records.
