# Project ODYSSEY — BUILD 001

Phase-1 foundation for the Government Infrastructure Decision Intelligence Platform.

## Services
- `apps/web` — React + TypeScript frontend
- `apps/api` — Node.js + Express + TypeScript API
- `apps/ai` — Python + FastAPI AI service
- `database/prisma` — PostgreSQL schema

## Quick start
1. Copy `.env.example` to `.env`.
2. Start PostgreSQL with `docker compose up -d db` (or use your existing PostgreSQL installation).
3. In `apps/api`: `npm install`, then `npm run dev`.
4. In `apps/web`: `npm install`, then `npm run dev`.
5. In `apps/ai`: create a virtual environment, install `requirements.txt`, then run `uvicorn app.main:app --reload --port 8000`.

## Health checks
- API: `http://localhost:4000/api/v1/health`
- AI: `http://localhost:8000/health`
- Web: `http://localhost:5173`

## Phase 1 authentication

The API uses short-lived Bearer access tokens. Obtain one from
`POST /api/v1/auth/login` and send it as `Authorization: Bearer <token>`.
`GET /api/v1/auth/me` returns the current database-backed user. Logout is
client-side token disposal in Phase 1; access-token revocation and refresh tokens
are not implemented. Authentication establishes identity only. Operational-plan
authority still comes exclusively from explicit `ApprovalAuthority` grants, never
from a job title, authentication, or system role alone.

All registry and operational endpoints require authentication. Operational reads
are available to authenticated users. Registry writes require `SYSTEM_ADMIN`;
case creation permits `OFFICER` and `SYSTEM_ADMIN`; inspection, risk-assessment,
ORP-generation, and ORP-decision mutations require `OFFICER`. Full user and
approval-authority administration remain `SYSTEM_ADMIN` only. The basic health
endpoint and login remain public. The database diagnostic endpoint is retained
for development utility but requires `SYSTEM_ADMIN`.

## Execution and accountability

An approved ORP can be translated by an explicit, same-scope `OFFICER` request
into an internal execution plan and deterministic task snapshots. Assigned
officers record progress and append evidence references; a different same-scope
officer must verify completion. `AUDITOR` and `POLICY_ADMIN` remain read-only,
and `SYSTEM_ADMIN` has global reads but no execution-mutation authority.

This module coordinates and audits human work. It does not close roads, dispatch
personnel, issue legal orders, control infrastructure, contact external agencies,
commit funds, or implement procurement. Case closure remains a future explicit
human governance workflow.

## Case closure and final accountability

An active same-scope `OFFICER` with an explicit `canCloseCase` authority grant
may formally close a Case only after its approved execution workflow is complete
and independently verified. Closure creates an immutable accountability record;
the actor is always derived from the authenticated user. `SYSTEM_ADMIN`,
`AUDITOR`, and `POLICY_ADMIN` may read according to their existing visibility but
cannot close a Case. Closure is terminal in Phase 1 and has no reopen endpoint.

`POST /api/v1/cases/:caseId/close` performs the human closure and
`GET /api/v1/cases/:caseId/closure` reads its record. Closure records operational
governance only: it does not certify permanent safety, statutory compliance,
payment, procurement, budget completion, or legal settlement, and it triggers no
external or physical action.

## Executive reporting

Authenticated users can read a privacy-conscious, query-time projection through
`GET /api/v1/cases/:caseId/decision-brief` and a deterministic, cursor-paginated
history through `GET /api/v1/cases/:caseId/timeline`. Both endpoints use the
existing organizational visibility rules (`SYSTEM_ADMIN` has global read access),
perform no workflow mutations, and return `404` for missing or out-of-scope Cases.
The brief follows one persisted Case-to-execution relationship chain and does not
recalculate risk or regenerate an ORP. The timeline includes only milestones with
persisted timestamps; it does not infer block, resume, or generic status history.
