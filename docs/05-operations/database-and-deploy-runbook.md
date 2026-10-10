# Runbook: database and deploy failures (Visibility OS)

Read this when the Visibility OS site errors, a deploy goes red, or an uptime alert fires. It exists because production deploys failed silently from 2026-08-29 to 2026-10-10: the free Supabase database had paused, the Vercel build runs `prisma migrate deploy` first, so every build failed, and nobody was told.

## How the pieces fit

- The Vercel build command (`apps/visibility-os/vercel.json`) runs `prisma migrate deploy` and then builds. **If the database is unreachable, the whole deploy fails.**
- The database is the Supabase project `supabase-champagne-nest`, attached through the Vercel integration (`POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`).
- `GET /api/health` runs one cheap database read and answers `{"status":"ok"}` (200) or `{"status":"down"}` (503). It reveals nothing else.
- The daily cron (`/api/cron/weekly-score`) also reads the database every day.
- The free Supabase plan pauses a project after about a week with no activity. The monitor and the daily cron are what keep it active; neither is a guarantee. See [ADR-0012](../01-architecture/decisions/0012-supabase-free-tier-until-first-paying-customer.md).

## Alerts that should reach the operator

| Signal | Where | Goes to |
|---|---|---|
| Site or database down | UptimeRobot monitor on `https://tossvisibilityos.com/api/health`, every 5 min | Email |
| Deploy failed | Vercel notifications (project visibility-os, Deployment Failed) | Email |
| CI red | GitHub Actions default notifications | Email |

If any of these is not turned on, turn it on before launch. The failure above was silent because none of them existed.

## Playbook: site shows errors or /api/health is 503

1. Open the Supabase dashboard for `supabase-champagne-nest`. Status paused: press **Restore** (documented window is 90 days; one Supabase page says one year, so check the dashboard). Status active: go to step 3.
2. After the restore finishes (a few minutes), reload `/api/health`. It should return 200. Done.
3. Active but failing: check Supabase status, then Vercel's Storage tab for the integration, then confirm the `POSTGRES_*` environment variables in the visibility-os project still exist.
4. If the project cannot be restored: download the backup from the paused project's overview, create a new Supabase project, reconnect it through the Vercel integration (this replaces the `POSTGRES_*` variables), and redeploy. `prisma migrate deploy` rebuilds the schema. Restore the backup into the new database if it holds data worth keeping.

## Playbook: a deploy failed

1. Open the failed deployment from the email or from Vercel, and read the **last 30 lines** of the build log.
2. `Can't reach database server` or a bare schema-engine error: the database is paused. Follow the playbook above, then **Redeploy**.
3. A migration error: the migration is the problem, not the database. Do not edit an applied migration; add a new one.
4. A type or build error: reproduce locally with `pnpm type-check`, `pnpm lint`, `pnpm --filter @toss/visibility-os test`, `pnpm build`.

## Before the first paying customer

Upgrade the Supabase project to Pro (about $25 a month). It removes pausing and adds backups. This is a recorded decision, not a suggestion: see ADR-0012. After upgrading, update that ADR's status and this page.

## Incident log

Add one line per incident that reached a customer, in [incident-response.md](incident-response.md)'s log.
