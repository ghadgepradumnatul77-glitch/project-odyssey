# ADR-001 — Phase-1 Foundation

## Status
Accepted

## Decision
Use a modular monolith for core business logic, a separate Python FastAPI AI service, PostgreSQL as transactional source of truth, and a React + TypeScript frontend.

## Reason
This is simple enough to build now while keeping clean boundaries for later scaling.
