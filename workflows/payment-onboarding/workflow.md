# Workflow: Payment Onboarding

Status: Planned. This spec must be complete before the workflow runs in production.

| Field | Value |
|---|---|
| Trigger | Flutterwave payment event |
| Steps | To be specified: verify payment, create records, kick off onboarding |
| Failure behavior | To be specified |
| Human approval gate | Yes, until an ADR removes it for this workflow |
| Owner | Operator |

Engine and conventions: [architecture/05-workflow-engine.md](../../architecture/05-workflow-engine.md). Payment rail context: [ADR-0004](../../docs/01-architecture/decisions/0004-flutterwave-for-payments.md).
