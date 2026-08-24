# Phase 2.3 — Execution Schedule and Risk Foundation

## Purpose

P2.3 adds governed planned schedules and descriptive cycle-time analytics to the existing execution workflow. Schedule status is derived only from persisted plans and lifecycle events.

## Plan schedule

`ExecutionPlan.plannedStartAt` and `plannedEndAt` define the approved operational window. Start must precede end, and scheduled tasks must remain inside it. Scoped `OFFICER` users may record changes through the dedicated schedule endpoint. Every change creates an attributable `ExecutionScheduleRevision`; dates are never changed automatically.

## Task schedule

Tasks use planned start/end timestamps. Planned duration is derived from those timestamps; it is not stored as a competing value. `startedAt`, `completionSubmittedAt`, and `verifiedAt` remain authoritative actual lifecycle timestamps.

## Dependencies

`ExecutionTaskDependency` represents “dependent task requires predecessor task.” Both tasks must belong to the same plan. Self, duplicate, cross-plan, and cyclic dependencies are rejected. A dependent task cannot start until every predecessor is `VERIFIED`. Cancelled mandatory or optional predecessors do not silently satisfy the dependency; an authorized officer must correct the governed plan.

## Blockers

Categories are `RESOURCE_UNAVAILABLE`, `ACCESS_RESTRICTED`, `MATERIAL_UNAVAILABLE`, `WEATHER`, `DEPENDENCY`, `SAFETY_CONDITION`, `EXTERNAL_APPROVAL`, and `OTHER`. The assigned officer records a category and reason. `ExecutionTaskBlockerEvent` preserves actor/time/reason history and resolution metadata across repeated blocks. Resumption requires a resolution reason.

## Schedule status

The deterministic task states are `UNSCHEDULED`, `NOT_STARTED_ON_SCHEDULE`, `NOT_STARTED_LATE`, `STARTED_ON_TIME`, `STARTED_LATE`, `OVERDUE`, `COMPLETED_ON_TIME`, and `COMPLETED_LATE`. Analysis uses a single server-controlled `asOf` time. Completed classification uses recorded completion submission/verification; overdue means the planned end is past while work remains incomplete.

## Cycle time

Available durations are assignment-to-start, start-to-completion-submission, completion-submission-to-verification, assignment-to-verification, plan-creation-to-first-start, and plan-creation-to-completion. A missing endpoint timestamp yields `null`, never zero.

## Authorization

Authenticated scoped readers may view schedule analysis. Only scoped operational `OFFICER` users may alter schedules or dependencies. `SYSTEM_ADMIN`, `AUDITOR`, and `POLICY_ADMIN` do not gain operational mutation authority. Blocking remains restricted to the assigned officer; four-eyes verification and closure rules are unchanged.

## Product boundary

This checkpoint adds no delay probability, completion prediction, machine learning, automatic rescheduling, autonomous execution, or change to risk/priority authority. Schedule status is an observation against approved dates, not a forecast.

## Future predictive readiness

The governed schedule, actual lifecycle timestamps, dependency graph, blocker history, and revision provenance may support future research when legitimate historical data exists. Any predictive capability requires a separately approved governed phase and must never be trained or represented as production intelligence using synthetic demonstration data.
