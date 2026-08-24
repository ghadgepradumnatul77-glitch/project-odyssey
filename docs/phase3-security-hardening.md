# Phase 3 security hardening

This document describes the application-level controls verified or strengthened by P3.2. It does not claim security certification, TLS termination, a WAF, or immunity from attack.

## Authentication

ODYSSEY stores bcrypt password hashes, never plaintext passwords. User creation applies bcrypt cost 12 and a server-side password length of 8–128 characters; blank values and unknown fields are rejected. Login accepts only a bounded email and password DTO. Unknown users, incorrect passwords, and inactive users receive the same controlled invalid-credentials response, with a dummy bcrypt comparison reducing account-enumeration timing differences.

Access tokens are signed and verified only with HS256. Verification enforces the configured issuer, audience, signature, and expiration. Bearer parsing is strict. Authentication middleware then loads the current user from PostgreSQL and requires `ACTIVE` status, so a deactivated user cannot continue using a previously issued token.

## Session model

The React application keeps the access token in component memory. It does not write it to local storage, session storage, URLs, or DOM attributes. A 401 response clears authentication state and returns the user to the unauthenticated application flow.

Logout destroys the client-held token state. Access tokens are stateless and there is no server-side access-token revocation or refresh-token session. A copied token therefore remains cryptographically valid until its short configured expiry unless the user is deactivated, in which case the current-user check denies it.

## Authorization

Backend middleware and service boundaries remain authoritative. Route visibility in the frontend is usability only, not authorization.

- `SYSTEM_ADMIN` administers registries and narrowly defined governance surfaces but does not inherit OFFICER operational authority.
- `OFFICER` performs scoped operational work.
- `AUDITOR` is read-oriented except for explicitly governed model-evaluation functions and cannot mutate ordinary operational resources.
- `POLICY_ADMIN` administers policy/governance records within scope and cannot execute, approve, or close operational work.

High-value actor identifiers are derived from the verified `req.user` principal. Strict DTOs reject forged actor, reviewer, verifier, creator, status, risk, priority, and lifecycle fields where those values are server-authoritative. Identity-like request headers are not trusted.

## Scope and IDOR behavior

Department and jurisdiction predicates are applied before resource loading, pagination, history, or aggregation. Scoped direct-ID misses and foreign-scope resources use the same controlled not-found semantics. Cursor values describe ordering only and do not replace scope predicates. `SYSTEM_ADMIN` global reads are explicit; operational mutation separation remains intact.

## API hardening

- JSON request bodies are limited to 256 KiB.
- Oversized and malformed JSON receive controlled JSON errors without stack traces or implementation details.
- A general API limiter permits 600 requests per 15 minutes per resolved client IP; authentication uses a stricter 10 attempts per 15 minutes outside tests.
- Public report submission and tracking retain separate lower anonymous limits.
- P3.1 bounded proxy trust controls which forwarded IP information Express and the limiters may accept.
- Zod DTOs, UUID checks, bounded limits, enum/date validation, and versioned cursors reject malformed input and mass assignment.

No persistent account lockout was added. A database model and multi-instance policy would require separate approval; route throttling avoids a fragile process-local account lock.

## HTTP security

Helmet supplies API response protections including content-type, frame, referrer, cross-origin, and content-security headers. HSTS is enabled only in staging and production, where HTTPS is assumed at the public boundary, and is disabled for local development/test HTTP. ODYSSEY does not itself provision certificates or terminate TLS.

The explicit P3.1 CORS allowlist remains in force. Credentialed responses are allowed only for configured origins; wildcard origins are forbidden. Because authentication uses an Authorization Bearer header rather than an ambient authentication cookie, traditional cookie-based CSRF is not the primary session threat. A future cookie architecture would require a separate CSRF design.

The frontend is separately served, so an operational frontend CSP may additionally be supplied by its static host. Express Helmet controls API responses.

## Public endpoints

Citizen intake uses a strict bounded schema and returns only a public reference, state, and submission time. Reporter contact fields are not returned by tracking or ordinary operational list DTOs. New references contain 96 cryptographically random bits and tracking returns a citizen-safe projection with `Cache-Control: no-store, private`. Existing six-hex pilot references remain readable for compatibility and retain rate-limited lookup protection. Invalid references do not reveal hidden records.

## Injection and file handling

Application-source review found no reachable `$queryRawUnsafe` or `$executeRawUnsafe` use and no string-built SQL. Prisma query APIs remain the data-access boundary. Generated Prisma runtime examples are not application call sites.

The React source does not use `dangerouslySetInnerHTML`; user-controlled content is rendered through React text escaping. The API records evidence metadata rather than accepting arbitrary server filesystem paths or filenames, so no reachable upload path traversal surface was identified in this checkpoint.

## Future identity federation

Future federation can map a verified external OIDC subject to an existing ODYSSEY user record, after which the current database role, active state, department, and jurisdiction remain authoritative:

```text
verified external subject -> ODYSSEY user -> current role and organizational scope
```

P3.2 does not implement OIDC, SSO, or a government identity provider.

## Explicit limitations

- No MFA or hardware-key authentication
- No OIDC, SSO, or government IdP integration
- No server-side JWT revocation or refresh-token session
- No persistent account lockout
- No WAF, API gateway, SIEM, or security SaaS
- No TLS certificate or reverse-proxy deployment
- No penetration-test or government-security certification claim
- No TEE, audit hash chain, live provider, or predictive model

Within these limits, ODYSSEY is security-hardened against the tested application-level threat classes in its documented architecture.
