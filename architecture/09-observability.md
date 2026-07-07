# 09. Observability

This blueprint owns the observability architecture: how we know the systems are up, correct, and affordable. The monitoring SOP is owned by [docs/05-operations/monitoring.md](../docs/05-operations/monitoring.md).

## Current state (honest)

Vercel build and runtime logs are the only signal. There is no uptime monitoring, no error tracking, and no alerting; a prod failure is discovered by using the product. The CI quality gate exists but GitHub Actions is currently blocked account-side (billing lock), so it does not run.

## Target design

| Layer | What | Status |
|---|---|---|
| Uptime | External checks on the website, Visibility OS, and future APIs | Phase 1 of [docs/implementation-phases.md](../docs/implementation-phases.md) |
| Errors | Error tracking in both apps, wired to alerts | Planned |
| Logs | Structured logging in services and agents (no `console.log` in production paths, per AGENTS.md) | Planned |
| Dashboards | Dashboards as code in `monitoring/` | Planned |
| Alerting | Routed to email and WhatsApp; incident process in [docs/05-operations/incident-response.md](../docs/05-operations/incident-response.md) | Planned |

## Signals worth watching first

1. Visibility OS audit/scoring failures (the core product loop).
2. Database availability (the free-tier suspend failure mode, [07-database-architecture.md](07-database-architecture.md)).
3. Payment link conversion events (revenue signal).
4. Agent and workflow run outcomes once they exist.

## Rule

A component is not "Live" in any doc until its failure is observable somewhere other than a customer complaint.
