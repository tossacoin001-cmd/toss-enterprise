# Monitoring and Observability

This document owns how we know the systems are healthy. Honest current state: **Visibility OS has an uptime monitor on its database-backed health endpoint (since 2026-10-10); the website and the alert channels below are still to be confirmed.** Until all rows below are on, a failure can reach a customer first. This doc defines the minimum bar and the target.

## Minimum bar (Phase 1, cheap and sufficient)

| Signal | Tool | Alert |
|---|---|---|
| Website up | External uptime check (UptimeRobot free tier or similar) on the production URL | Email + push to operator |
| Visibility OS up | UptimeRobot on `https://tossvisibilityos.com/api/health`, every 5 min. The endpoint reads the database, so a paused or unreachable database alerts too ([runbook](database-and-deploy-runbook.md)) | Same |
| Deploy failed | Vercel's built-in deploy notifications | Email |
| CI red on main | GitHub Actions default notifications | Email |

Configured: UptimeRobot (free) for Visibility OS, 2026-10-10. Still to confirm and record here: the exact monitored URL, that Vercel's Deployment Failed email is on for the visibility-os project, and a monitor for the website. The 2026-08-29 to 2026-10-10 silent deploy failure happened because none of these existed.

## Target (as products get real users)

- Error tracking (Sentry or equivalent) on both apps; unhandled route errors and webhook failures are the priority signals.
- Post-deploy Playwright smoke on production (see ci-cd.md) failing loudly.
- Agent run dashboards: every agent already must log structured runs (AIOS rule); a weekly summary of runs, failures, and token spend.
- Database: Supabase and Postgres dashboards reviewed weekly until alerting exists.

## Principles

1. An alert must be actionable; if it fires and the response is "ignore it", delete or fix the alert.
2. Alert the operator on exactly two channels: email and one push channel. No alert spam.
3. Every incident that reaches a customer becomes a line in [incident-response.md](incident-response.md)'s log.
