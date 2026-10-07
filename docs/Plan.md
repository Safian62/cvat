# Technical Assessment Plan

## Approach

Add a small Django endpoint under `cvat.apps.test` that reads CVAT's labeled
shapes, enforces CVAT task access, and groups counts by label. Add a Task-only
analytics view that requests those counts, draws a bar chart, and supports
filtering by shape type. Keep the existing Project/Job plugin and placeholder
behavior.

## Decision record

- **Chosen:** Reuse CVAT's `LabeledShape`, `TaskPermission`, existing React
  analytics route, Chart.js dependency, and DRF infrastructure. This avoids
  duplicate data/auth systems and keeps the change limited to the assessment.
- **Rejected:** New storage, authentication, chart dependencies, or changes to
  the Project/Job analytics design. These add complexity without helping the
  requested Task count view.
- **Trade-off:** The endpoint aggregates on request. This keeps counts current
  and avoids cache invalidation, at the cost of a database aggregation per
  request. A five-request local sample is recorded in `Objectives.md`; it is a
  small-task baseline, not a large-dataset performance claim.
- **Intentionally skipped:** WebSocket/live updates and reconnect behavior.
  They would introduce lifecycle and event-integration risk beyond the
  assessment's working floor requirements; the graph refreshes when its page
  is loaded or its filter changes.

## Verification

The API and Task analytics UI were manually exercised with Task 2. Django's
system check and Python syntax validation pass; frontend diagnostics report no
errors. The local unauthenticated request was refused (HTTP 401), and an
authenticated request as `safian` returned counts. The implementation checks
`TaskPermission` for task access; a separate authenticated non-member denial
case was not exercised. See `Objectives.md` and `Definition of Done.md` for
measurements and evidence.
