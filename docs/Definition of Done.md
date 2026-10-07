# Definition of Done

- [x] **API exists.** `cvat/apps/test/urls.py` registers
  `GET /api/test/tasks/<task_id>/annotation-stats`; the route is included at
  `/api/test/` in `cvat/urls.py`.
- [x] **Counts saved annotations by class from the database.**
  `TaskAnnotationStatsView` in `cvat/apps/test/views.py` queries
  `LabeledShape`, groups by `label__name`, and returns `total` and `counts`.
- [x] **Task analytics calls the endpoint.**
  `AnnotationAnalytics` in
  `cvat-ui/src/components/analytics-report/analytics-report-content.tsx`
  fetches `/api/test/tasks/${resource.id}/annotation-stats`.
- [x] **Graph displays counts.** The same component constructs a Chart.js
  `bar` chart using response labels and counts. Browser observation at
  `/tasks/2/analytics` showed Task 2, total 1, and a rendered chart canvas.
- [x] **Loading state exists.** `AnnotationAnalytics` initially renders
  Ant Design `Spin`; the browser showed the spinner while its resource loaded.
- [x] **No-data state exists.** A zero total renders Ant Design `Empty` with a
  task-appropriate description.
- [x] **Failed-request state exists.** Non-2xx responses and fetch failures
  render an Ant Design error alert with a message and description.
- [x] **Authentication and task access checks are present.** CVAT's DRF
  defaults include `IsAuthenticated`; `TaskAnnotationStatsView` additionally
  calls `TaskPermission.create_scope_view(request, task).check_access()` and
  raises `PermissionDenied` when disallowed. Observed unauthenticated response:
  HTTP 401. Observed authenticated superuser response: HTTP 200. A separate
  authenticated non-member denial request was not tested.
- [x] **Shape-type filter works.** The UI sends the selected shape as
  `shape_type`; an authenticated request with
  `?shape_type=rectangle` returned HTTP 200 and
  `"filter":{"shape_type":"rectangle"}`.
- [x] **Performance target and measurements are documented.**
  `Objectives.md` records the target, method, five raw results, median, spread,
  and machine metadata. The five-request median was 168.250 ms against the
  250 ms target.
- [x] **Assessment documentation exists.** `Plan.md`, `Objectives.md`, and
  this Definition of Done record approach, decisions, measurements, and
  evidence. WebSocket work is explicitly skipped.
- [x] **Feature commits are incremental.** History contains `74f3c65` (plan),
  `760b3f1` (API), and `e913820` (UI). Documentation is committed separately;
  see the final repository log for current hashes.

## Validation record

- `docker exec cvat_server python manage.py check` — passed:
  `System check identified no issues (0 silenced).`
- Pylance Python file syntax check on `cvat/apps/test/views.py` — no syntax
  errors.
- Frontend editor diagnostics on `analytics-report-content.tsx` — no errors.
- `git diff --check` — passed at feature inspection.
- Local API checks: unauthenticated request HTTP 401; authenticated Task 2
  request HTTP 200 with `person: 1`; authenticated `shape_type=rectangle`
  request HTTP 200.
- `npm` lint/build was not run because `cvat-ui/node_modules` is unavailable.
- WebSocket/live updates and reconnect handling are not implemented.
