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

## Phase 1 approval identity limitation

Human decision endpoints currently accept `reviewerId` in the request body. This
provides domain-level validation against explicit `ApprovalAuthority` grants, but
it is not production-grade authentication. Authentication middleware must later
bind reviewer identity to the authenticated session or token. A job title or
designation never grants approval authority.
