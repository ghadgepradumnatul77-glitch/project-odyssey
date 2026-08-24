# Pilot pagination and collection bounds

## Contract

Operational list APIs return `data: { items, nextCursor, limit }`. The default limit is 25 and the maximum is 100. Cursors are opaque, versioned base64url values carrying the stable `(timestamp, id)` boundary. Clients must treat them as indivisible strings. Results use descending timestamp and descending id order; the id tie-breaker prevents duplicates or skips when timestamps are equal.

`limit` must be an integer from 1 through the endpoint maximum. Malformed/expired-format cursors, invalid enums, overlong search values, and invalid booleans return HTTP 400 with `INVALID_QUERY`; a malformed cursor never restarts at page one. An empty result has `items: []` and `nextCursor: null`. No total count is returned because an unconditional `COUNT(*)` is unnecessary for the pilot UI. Search is trimmed, empty search is omitted, and search is limited to 120 characters. Changing any filter or search value requires discarding the cursor.

Authorization scope and all filters are composed in the Prisma `where` clause before ordering and `take`. Presentation pagination must never be used by workflow code to select a current/latest Inspection, RiskAssessment, ORP, package, governance rule, template, decision, evidence record, or closure state.

Small Departments and Jurisdictions remain full registries for form usability. They must remain deterministically ordered and server-capped at 250. Map data is a separate projection request capped at 250 records per layer and must expose `truncated`; the UI must say that it is showing a capped subset whenever that flag is true.

## Collection inventory (pre-edit baseline)

| Route | Query/shape and consumer | Scope/order/bound at baseline | Classification / P3 decision |
|---|---|---|---|
| `GET /cases` | `case.findMany`, deep Asset organization include; Cases, Dashboard, Map | DB-scoped; `createdAt asc`; unbounded | NEEDS_PAGINATION; summary cursor page |
| `GET /public-reports` | `publicReport.findMany`, summary plus latest triage; Public Reports, Dashboard, Map | DB-scoped; `submittedAt desc/reportNumber`; unbounded | NEEDS_PAGINATION; summary cursor page |
| `GET /assets` | `asset.findMany` with organizations; Admin, routing, Map | DB-scoped; `createdAt asc`; unbounded | NEEDS_PAGINATION / MAP_SPECIAL_CASE |
| `GET /users` | `user.findMany`, safe select; Admin | SYSTEM_ADMIN-only; `createdAt asc`; unbounded | NEEDS_PAGINATION; never C4 assignment |
| `GET /departments` | full Department rows; Admin/forms | identity/global scope; `createdAt asc`; unbounded | SMALL_REGISTRY_BOUNDED (250) |
| `GET /jurisdictions` | rows plus Department; Admin/forms | identity/global scope; `createdAt asc`; unbounded | SMALL_REGISTRY_BOUNDED (250) |
| `GET /approval-authorities` | grants plus safe user/org summaries; Admin/Dashboard | SYSTEM_ADMIN-only; created/id asc; unbounded | NEEDS_PAGINATION |
| `GET /policies` | summary select; Policy & Actions | governance scope in DB; code/version order; unbounded | NEEDS_PAGINATION (registry only) |
| `GET /policies/:id/rules` | rule summary; Policy & Actions | parent scope checked; rule code; unbounded | NEEDS_BOUND; policy-scoped max 100 |
| `GET /approved-actions` | summary select; Policy & Actions | governance scope in DB; code/version; unbounded | NEEDS_PAGINATION (registry only) |
| `GET /execution-templates` | summary incl. task definitions; Templates UI | governance scope in DB; code/version; unbounded | NEEDS_PAGINATION; task definitions bounded by template design |
| `GET /cases/:id/inspections` | large Case/Asset/Inspector graph; Workspace | parent visibility first; created asc; unbounded | NEEDS_PAGINATION and summary DTO |
| `GET /cases/:id/risk-assessments` | assessment history; Workspace | parent visibility first; created desc/id; unbounded | NEEDS_PAGINATION; latest query stays independent |
| `GET /cases/:id/decision-packages` | immutable snapshots; Workspace | Case scope in DB; version/id desc; unbounded | NEEDS_PAGINATION; current package independent |
| `GET /cases/:id/orps` | ORP history; Workspace | parent visibility first; version asc; unbounded | NEEDS_PAGINATION; current ORP independent |
| `GET /orps/:id/decisions`, `GET /cases/:id/decisions` | decision audit histories; Workspace | scope in DB; created/id asc; unbounded | NEEDS_PAGINATION |
| `GET /cases/:id/intelligence-assessments` | assessments with reconciliations; Workspace | Case scope in DB; created/id desc; unbounded plus second batched query | NEEDS_PAGINATION; batched, not per-row N+1 |
| `GET /cases/:id/execution-plans` | plan list; Workspace | Case scope in DB; created asc; unbounded | NEEDS_BOUND; case design makes count small |
| `GET /execution-plans/:id/tasks` | tasks with bounded relations; Workspace | plan scope in DB; sequence asc; unbounded | NEEDS_BOUND; template design limits tasks |
| evidence | embedded in task detail/timeline; no standalone GET collection | complete evidence used by verification/closure | INTERNAL_ONLY / authoritative complete query retained |
| `GET /execution-tasks/:id/eligible-assignees` | safe users; assignment UI | exact task scope + ACTIVE OFFICER; name/id sort; unbounded | SMALL_REGISTRY_BOUNDED; explicit truncation required |
| `GET /cases/:id/timeline` | merges selected event projections | Case scope; cursor already present; max 100 | SAFE after malformed-cursor characterization |
| `GET /cases/:id/decision-brief` | one assembled report | scoped detail, not list | NOT_A_COLLECTION |
| `GET /cases/:id/readiness`, closure, auth/me, public tracking, detail routes | single authoritative resources | scoped/detail | NOT_A_COLLECTION |

## N+1 and query-shape audit

No frontend list-to-per-row detail request was found in the primary registries. Intelligence reconciliation uses one assessment query plus one batched `IN` reconciliation query, not one query per row. The public-report list selects only the latest triage analysis in the same query. The baseline Case and Inspection list shapes are heavier than the presentation needs and should be reduced only alongside consumer tests so that removing relations does not introduce frontend N+1 requests.

## Index decision

No migration is introduced in P3. Existing pilot volume plus bounded `take` makes a code-only bound the lower-risk first step. A future additive-index change must be justified with `EXPLAIN (ANALYZE, BUFFERS)` against representative isolated data. Candidate query shapes are `(asset scope, createdAt, id)` for Cases, `(departmentId, jurisdictionId, submittedAt, id)` for Public Reports, and `(caseId, createdAt, id)` for histories. Each composite index improves scoped ordered reads but adds write amplification and storage; none should be added without measured evidence. Existing migrations remain untouched.

## Final frontend and presentation behavior

Cases, Public Reports, Assets, Users, Approval Authorities, Policy Documents, Approved Actions, and Execution Templates use first-page loading followed by explicit cursor-based **Load more** controls. Case Workspace histories use the same behavior for Inspections, Risk Assessments, Decision Packages, Action Plans, Human Decisions, Intelligence Assessments, and Execution Plans. Appends are deduplicated by persisted ID. A failed later page leaves prior pages visible and exposes retry; exhaustion removes traversal and reports that all history is loaded. Case, search, filter, or registry changes discard accumulated cursor state.

Policy Rules are lazy-loaded only when a policy is expanded, removing the previous registry-row N+1 request pattern. Execution Template task definitions remain an embedded governed presentation. Eligible assignees return at most 100 safe officer summaries and explicit `truncated` metadata; the assignment UI warns that additional eligible officers exist when the cap is reached. Map projections return at most 250 rows per layer and identify each incomplete layer in the UI.

Evidence embedded in a task presentation is capped at 100 and carries `evidenceTruncated`. Embedded execution-plan tasks are similarly bounded for display. These presentation bounds are deliberately separate from authoritative verification, four-eyes, completion, and closure queries, which continue to inspect the complete persisted task/evidence set.

## Deterministic boundedness characterization

| Surface | Requested/default bound | Observable query/presentation evidence |
|---|---:|---|
| Cases and Public Reports | default 25, maximum 100 | Scope, filters, cursor boundary, stable timestamp/ID ordering, then `take(limit + 1)`; no total-count query |
| Users and Approval Authorities | default 25, maximum 100 | Server-backed search/filtering occurs in Prisma `where` before `take(limit + 1)` |
| Governance registries | default 25, maximum 100 | Registry scope and search compose in one `where`; mounted test proves `limit=2` produces `take: 3` |
| Case histories | default 25, maximum 100 | Parent/organizational visibility precedes cursor and `take(limit + 1)`; current/latest workflow queries remain independent |
| Execution plans/tasks | default 25, maximum 100 | Both collections use stable created-at/ID cursors; embedded task/evidence display has separate caps |
| Map projections | 250 per layer | Separate summary projection and explicit `truncated`; never automatically fetches full operational registries |
| Eligible assignees | 100 | One scoped safe-select query with one look-ahead row; UI discloses truncation |
| Policy rules | 25-page registry contract | Zero rule requests while policy rows are collapsed; one request only for the expanded policy |

The characterization records structural bounds and query counts visible from deterministic mocks: one primary Prisma `findMany` for each listed page, plus the documented batched reconciliation query for Intelligence history. It makes no latency, requests-per-second, national-scale, or production-throughput claim.

## Acceptance evidence

Shared cursor tests cover versioned round-trip encoding, malformed/unsupported cursors, integer bounds, booleans, enums, and search length. Mounted Express tests use the real application, authentication middleware, authorization, route parsing, and mocked isolated Prisma adapters. They prove governance scope and search are in `where` before bounded `take`, malformed traversal is rejected before Prisma, scoped task assignment does not expose cross-scope candidates, and organizational routes preserve their role/scope boundary. Frontend tests prove cursor history append, ID deduplication, later-page failure retention, retry, exhaustion, map disclosure, eligible-assignee truncation disclosure, and lazy Policy Rule loading.
