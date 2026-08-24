# Phase 2.4 — Geospatial Hotspot Analytics

## Purpose

P2.4 provides descriptive infrastructure-risk geography for the currently authorized organizational scope. It identifies observed concentrations in persisted records; it does not predict future failures.

## Inputs

The analysis includes unique Assets, current active Cases, and distinct Public Reports. Active Cases are every current Case except `CLOSED` and `CANCELLED`; the persisted Case `riskLevel` and `priorityLevel` are authoritative. Public Reports in `SUBMITTED`, `UNDER_REVIEW`, and `ACCEPTED` are counted separately as unverified citizen signals. Rejected reports, historic RiskAssessment rows, inspections, condition trends, generic ExternalObservations, execution schedules, and blocker events do not affect hotspot severity.

## Coordinate validation

Coordinates are valid only when both persisted numeric values are present and finite, latitude is within `[-90, 90]`, and longitude is within `[-180, 180]`. Two absent values are missing; a partial pair, malformed value, or out-of-range value is invalid. Strings are not coerced. No coordinate is invented and no address is geocoded.

## Coverage

Coverage is reported separately for Assets, active Cases, Public Reports, and their combined record population. Every section reports eligible, mapped, unmapped, invalid-coordinate, and percentage values. Cases use their Asset coordinate, but remain a separate eligible analytical record. Coverage and summary counts cover the complete filtered authorized scope, including records beyond presentation caps.

## Grid method

The fixed grid is 0.01 degrees in both dimensions, approximately 1.1 km north–south and about 1.05 km east–west near Pune. This neighborhood-scale cell is appropriate for the current Pune Division demonstration geography without implying road-network or parcel precision. Indices are `floor(latitude / 0.01)` and `floor(longitude / 0.01)`. The stable cell identity combines analysis version grid notation, Department, Jurisdiction, latitude index, and longitude index. Organization separation prevents adjacent cross-jurisdiction records from becoming one administrative hotspot. The displayed center is the six-decimal arithmetic mean of contributing record coordinates and is labelled as a visual center, not an incident location.

## Deduplication

Asset and Case identifiers are stored in sets inside each cell. One Asset is counted once even when it has multiple current Cases. Each current Case is counted once; historical assessments and inspections are never traversed. Each eligible Public Report is counted once and is not inferred to describe the same defect as a nearby Case. Contributor IDs are limited to 20 per governed type with explicit contributor truncation; reporter identifiers are never returned.

## Severity

Only current Case priority contributes to the observed severity index: `CRITICAL=5`, `VERY_HIGH=4`, `HIGH=3`, `MEDIUM=2`, and `LOW=1`. The index is the sum of those components. Public Reports and raw Asset presence contribute to concentration but add no severity weight. A cell qualifies when it contains at least two distinct represented records or at least one Case with CRITICAL risk/priority. Sorting is severity index, CRITICAL priority count, active Case count, represented-record count, then stable cell ID. Isolated CRITICAL records therefore remain visible while ordinary isolated Assets remain available through the raw Asset layer rather than being called hotspots.

## Scope

`SYSTEM_ADMIN` receives global read visibility and may narrow by Department or Jurisdiction. `OFFICER`, `AUDITOR`, and `POLICY_ADMIN` analysis is constrained to their persisted Department and Jurisdiction before aggregation. Supplied filters are additional `AND` predicates and cannot expand scope. Optional minimum priority/risk filters use the existing enum order.

## Scaling

Assets, Cases, and Public Reports are traversed independently in stable ID cursor batches of 500 inside one repeatable-read snapshot. Final coverage, summaries, cell membership, severity, and hotspot count are complete. The API returns at most the top 100 hotspot groups and reports `totalHotspots`, `hotspotsReturned`, and `truncated`. Existing raw map layers remain independently capped at 250 and retain their own disclosure.

## Privacy

The Public Report query selects only ID, coordinates, and organizational labels. Reporter name, contact information, description, tracking references, and triage material are not selected or returned. Public Reports are labelled as unverified and never treated as authoritative risk.

## Product boundary

P2.4 introduces no predictive geospatial ML, failure forecast, accident prediction, congestion prediction, route optimization, automated operational priority, resource allocation, PostGIS, live external data provider, geocoding service, or lifecycle mutation. OpenStreetMap remains the existing visual basemap only.

## Future path

Advanced spatial analysis may be evaluated in a separately governed phase if legitimate geometry, network, and historical outcome datasets become available. Synthetic demonstration data must not be represented as production-trained intelligence.
