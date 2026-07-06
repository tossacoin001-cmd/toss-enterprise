# Monitoring and Observability

This document owns how we know the systems are healthy. Honest current state: **nothing is monitored.** If the website goes down, the first alert is a customer on WhatsApp. This doc defines the minimum bar and the target.

## Minimum bar (Phase 1, cheap and sufficient)

| Signal | Tool | Alert |
|---|---|---|
| Website up | External uptime check (UptimeRobot free tier or similar) on the production URL | Email + push to operator |
| Visibility OS up | Same, on the production URL | Same |
| Deploy failed | Vercel's built-in deploy notifications | Email |
| CI red on main | GitHub Actions default notifications | Email |

Record the chosen uptime tool and the monitored URLs here when configured.

## Target (as products get real users)

- Error tracking (Sentry or equivalent) on both apps; unhandled route errors and webhook failures are the priority signals.
- Post-deploy Playwright smoke on production (see ci-cd.md) failing loudly.
- Agent run dashboards: every agent already must log structured runs (AIOS rule); a weekly summary of runs, failures, and token spend.
- Database: Supabase and Postgres dashboards reviewed weekly until alerting exists.

## Principles

1. An alert must be actionable; if it fires and the response is "ignore it", delete or fix the alert.
2. Alert the operator on exactly two channels: email and one push channel. No alert spam.
3. Every incident that reaches a customer becomes a line in [incident-response.md](incident-response.md)'s log.
