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
