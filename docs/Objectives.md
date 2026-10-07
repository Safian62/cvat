# Assessment Objectives

## Feature objective

For an accessible Task, return the number of saved shape annotations grouped
by label, and show those counts as a bar chart in the Task Analytics page.
The report must expose a `shape_type` filter and handle loading, empty, and
failed-request states. Project and Job analytics remain on their existing
plugin/placeholder path.

**Evidence:** `cvat/apps/test/views.py` (`TaskAnnotationStatsView`) queries
`LabeledShape`, groups by `label__name`, and optionally filters `type`.
`cvat/apps/test/urls.py` registers
`GET /api/test/tasks/<task_id>/annotation-stats`. The Task branch in
`cvat-ui/src/components/analytics-report/analytics-report-content.tsx`
fetches the endpoint and renders Chart.js and the filter.

## Performance objective and result

**Target:** median authenticated endpoint response time below **250 ms** for
five sequential requests in the local CVAT environment.

**Justification:** the median of the observed five-request local baseline is
168.250 ms. A 250 ms target gives approximately 49% headroom over that
baseline while remaining measurable. This is a local small-task target, not a
production-scale or dataset-size-independent guarantee.

**Measurement method:** browser `fetch` against the running local CVAT at
`http://localhost:8080`, using the signed-in browser session (`credentials:
include`) and `performance.now()` around each request, with cache disabled.
Each response was HTTP 200 and returned Task 2's one `person` annotation.
These are client-observed request/response times, including local routing and
container/network overhead, not isolated database execution time.

**Raw output from the machine (elapsed milliseconds):**

```text
run=1 status=200 elapsed_ms=360.490
run=2 status=200 elapsed_ms=171.020
run=3 status=200 elapsed_ms=168.250
run=4 status=200 elapsed_ms=96.905
run=5 status=200 elapsed_ms=161.950
```

**Summary:** sorted values: 96.905, 161.950, 168.250, 171.020, 360.490 ms.
Median: **168.250 ms**. Spread (maximum minus minimum): **263.585 ms**.
The median meets the 250 ms target. The range shows variability; five samples
are too few to infer tail latency or broader workload performance.

## Measurement environment

- CPU: Intel(R) Core(TM) i5-6300U CPU @ 2.40GHz; 2 cores, 4 logical processors
- RAM: 15.88 GB physical
- OS: Microsoft Windows 10 Pro, version 10.0.19045 (build 19045)
- CVAT starting/assessment commit: `e91382005bc09218fab71f70076f4132d0c6e873`
- Local sample: Task 2, authenticated as `safian`; this account is a CVAT
  superuser, so the successful response does not measure a regular user's
  policy scope.

An unauthenticated request returned HTTP 401 with
`Authentication credentials were not provided.` No authenticated user lacking
Task 2 access was available for a negative test; the view does call CVAT's
`TaskPermission.create_scope_view(...).check_access()` and raises
`PermissionDenied` when access is denied.
