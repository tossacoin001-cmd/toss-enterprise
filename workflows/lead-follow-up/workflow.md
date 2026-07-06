# Workflow: Lead Follow-Up

Status: Planned (Initial MVP piece: Automated Follow-Up). This spec must be complete before the workflow runs in production.

| Field | Value |
|---|---|
| Trigger | Lead captured (website form / lead capture system) |
| Steps | To be specified: qualify, sequence, notify operator |
| Failure behavior | To be specified |
| Human approval gate | Yes, on every outbound message (per [architecture/03-ai-organization.md](../../architecture/03-ai-organization.md)) |
| Owner | Operator |

Engine and conventions: [architecture/05-workflow-engine.md](../../architecture/05-workflow-engine.md). The exported definition lands in this folder next to this spec.
