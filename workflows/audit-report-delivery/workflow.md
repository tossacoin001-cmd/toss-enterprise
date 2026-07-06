# Workflow: Audit Report Delivery

Status: Planned. This spec must be complete before the workflow runs in production.

| Field | Value |
|---|---|
| Trigger | Visibility OS audit completes |
| Steps | To be specified: render report, deliver to customer, log delivery |
| Failure behavior | To be specified |
| Human approval gate | Yes, until an ADR removes it for this workflow |
| Owner | Operator |

Engine and conventions: [architecture/05-workflow-engine.md](../../architecture/05-workflow-engine.md). Depends on transactional email (Resend, Phase 4 of the roadmap).
