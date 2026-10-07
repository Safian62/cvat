# Technical Assessment Plan

## Approach

Implement annotation analytics inside a new Django app named 	est.

The implementation order is:

1. Create the required assessment plan and commit it first.
2. Start CVAT locally and prepare a task with annotation data.
3. Inspect CVAT's existing annotation and label models.
4. Implement a backend API that reads annotations from the database and returns counts grouped by label/class.
5. Add a web interface page that calls the API and displays the counts as a graph.
6. Handle loading, no-data, and failed-request states.
7. Verify CVAT authentication and task-access permissions.
8. Define and measure one API performance target using five measurements.
9. Add one useful filter/grouping feature beyond the basic class count.
10. If time permits, integrate WebSocket updates and reconnect handling.
11. Complete Objectives and Definition of Done documentation.
12. Record the final walkthrough and submit a PR from dev-test01 to the main branch of my fork.

## Time Allocation

- Plan and environment: 15 minutes
- CVAT startup and sample data: 30–45 minutes
- Backend API: 60–75 minutes
- Frontend page and graph: 60 minutes
- Empty/error handling and access control: 30–40 minutes
- Performance measurement and filter: 30–40 minutes
- WebSocket and reconnect: up to 60 minutes if the core feature is stable
- Documentation, testing, Loom and PR: remaining time

## Priority

Items 1–4 are the minimum working feature and will be completed before WebSocket work.

If time becomes limited, WebSocket functionality will be reduced or skipped rather than compromising the database API, frontend graph, error handling, or authentication/access control.

## Decision Record

The backend will use CVAT's existing database models and permission mechanisms rather than introducing duplicate annotation or authentication logic.

The frontend will reuse existing CVAT UI patterns and dependencies where possible to minimize implementation and dependency cost.

WebSocket work will use CVAT's existing event/WebSocket infrastructure where practical instead of introducing a separate real-time system.

## What May Be Skipped

If the core feature or required tests take longer than expected, optional WebSocket enhancements and additional UI polish will be skipped first.
