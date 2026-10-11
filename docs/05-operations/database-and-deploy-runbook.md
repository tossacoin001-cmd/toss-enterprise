# Runbook: database and deploy failures (Visibility OS)

Read this when the Visibility OS site errors, a deploy goes red, or an uptime alert fires. It exists because production deploys failed silently from 2026-08-29 to 2026-10-10: the free Supabase database had paused, the Vercel build runs `prisma migrate deploy` first, so every build failed, and nobody was told. Once the database was restored a second, separate failure appeared (the build command did not build `@toss/email`; see the deploy playbook).

## How the pieces fit

- The Vercel build command (`apps/visibility-os/vercel.json`) runs `prisma migrate deploy` **in production builds only**, then builds. **If the database is unreachable, a production deploy fails.** Preview builds do not touch the database.
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

## Previews share the production database (mitigated 2026-10-11)

The `POSTGRES_*` variables in Vercel apply to Production, Preview and Development alike, so every environment talks to the **same database**. Until 2026-10-11 the build ran `prisma migrate deploy` for every build, which meant building any branch preview applied that branch's migrations to production before anything was merged (the 2026-10-09 migration reached production this way; it was additive, so no harm).

What protects production now ([ADR-0013](../01-architecture/decisions/0013-migrations-only-in-production-builds-and-url-safety.md)):

1. **Only production builds migrate.** `vercel.json` runs the migration when `VERCEL_ENV` is exactly `production`. Anything else, including a typo or an unset value, skips it. `tests/vercel-config.test.ts` runs the real command in all those cases.
2. **Migrations must be expand-only**, because production migrates before the new code goes live and the old code keeps running meanwhile. Add tables, columns (nullable or with a default) and indexes. To remove or rename something, do it in a second release after nothing uses it. `tests/migrations.test.ts` fails on drops, renames, type changes, truncates, deleting every row, and new required columns with no default. A destructive migration needs a recorded decision and a `-- DESTRUCTIVE-APPROVED: <reason>` line.
3. **A separate preview database is still the cleaner answer**, deferred until a preview needs database-backed behaviour or before the first paying customer.

What this means in practice: a preview build log has **no migration step**, so previews run against the production schema. Previews cannot sign in (Clerk keys exist only in Production), and use the database only for `/api/health`. A new migration reaches the database only when its branch is merged to `main` and the production build runs.

## Playbook: site shows errors or /api/health is 503

1. Open the Supabase dashboard for `supabase-champagne-nest`. Status paused: press **Restore** (documented window is 90 days; one Supabase page says one year, so check the dashboard). Status active: go to step 3.
2. After the restore finishes (a few minutes), reload `/api/health`. It should return 200. Done.
3. Active but failing: check Supabase status, then Vercel's Storage tab for the integration, then confirm the `POSTGRES_*` environment variables in the visibility-os project still exist.
4. If the project cannot be restored: download the backup from the paused project's overview, create a new Supabase project, reconnect it through the Vercel integration (this replaces the `POSTGRES_*` variables), and redeploy. `prisma migrate deploy` rebuilds the schema. Restore the backup into the new database if it holds data worth keeping.

## Playbook: a deploy failed

1. Open the failed deployment from the email or from Vercel, and read the **last 30 lines** of the build log.
2. `Can't reach database server` or a bare schema-engine error: the database is paused. Follow the playbook above, then **Redeploy**.
3. `Can't resolve '@toss/<package>'` (for example `@toss/email`): the build command is not building the app's workspace packages. Their `dist` folders are gitignored, so they must be built in the same command. `apps/visibility-os/vercel.json` uses `pnpm --filter "@toss/visibility-os..." build` for this, and `tests/vercel-config.test.ts` guards it. Local builds can pass anyway because an old `dist` folder exists, so reproduce with `rm -rf packages/<package>/dist` first.
4. A migration error (production builds only, since previews do not migrate): the migration is the problem, not the database. Do not edit an applied migration; add a new one. If `tests/migrations.test.ts` fails in CI, the migration breaks the expand-only rule: redesign it as an additive change, or record the approval line after a decision.
4a. The preview build is green but the page misbehaves: the preview runs against the production schema and has not applied its own migration. Test migration-dependent behaviour locally against a throwaway database, not on the preview.
5. A type or build error: reproduce locally with `pnpm type-check`, `pnpm lint`, `pnpm --filter @toss/visibility-os test`, `pnpm build`.

## Before the first paying customer

Upgrade the Supabase project to Pro (about $25 a month). It removes pausing and adds backups. This is a recorded decision, not a suggestion: see ADR-0012. After upgrading, update that ADR's status and this page.

## Incident log

Add one line per incident that reached a customer, in [incident-response.md](incident-response.md)'s log.
