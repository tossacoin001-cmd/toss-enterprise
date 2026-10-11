# Deployment

This document owns how deploys happen and how to roll back. Pipeline internals: [../02-engineering/ci-cd.md](../02-engineering/ci-cd.md).

## How production deploys work today

- **apps/website**: push to `main` deploys via the Vercel GitHub integration. There is no root `vercel.json` in the repo (verified 2026-08-29; an earlier version of this doc claimed one existed) — the Vercel project's Root Directory setting, configured in the Vercel dashboard, points it at `apps/website`. The CI workflow also runs a Vercel deploy; this double path is a known defect scheduled for Phase 0 (keep the integration, delete the CI deploy job).
- **apps/visibility-os**: separate Vercel project, deployed via the GitHub integration with `apps/visibility-os/vercel.json`. This config has broken repeatedly (see commit history); `tests/vercel-config.test.ts` now runs the real build command and checks it. The build command (1) runs `prisma migrate deploy` **only when `VERCEL_ENV` is exactly `production`**, and (2) builds the app's workspace packages first (`pnpm --filter "@toss/visibility-os..." build`). Previews and development builds never migrate: the `POSTGRES_*` variables point every environment at the same production database, so a preview that migrated would change production before merge ([ADR-0013](../01-architecture/decisions/0013-migrations-only-in-production-builds-and-url-safety.md)). Migrations are expand-only (add, never drop or rename in the same release) and `tests/migrations.test.ts` enforces it. Previews therefore run against the production schema.

## Deploy rules

1. Never merge to `main` if you cannot watch the deploy finish. A broken deploy left overnight is an incident.
2. Preview deployments are the staging environment: verify there first for anything touching payments CTAs, auth, webhooks, or deploy config.
3. Database schema changes deploy in this order: additive migration first, code that uses it second. Destructive migrations require a backup confirmation and their own PR.
4. Every deploy that changes user-visible behavior gets a quick manual smoke check of the four website conversion paths ([../04-product/website.md](../04-product/website.md)) or the Visibility OS sign-in flow, until automated post-deploy smoke tests exist.

## Rollback

- Vercel: promote the previous deployment from the project's Deployments tab ("Instant Rollback"). This is the fastest path and does not require a git operation.
- Then fix forward in git; do not leave production pointing at an old deployment longer than necessary.
- Prisma migrations do not auto-rollback. A bad migration is fixed by a new forward migration, never by editing an applied one.

## Access

Vercel project access, domain settings, and provider dashboards (Clerk, Supabase, Flutterwave) are held by the operator (tossacoin001@gmail.com). There is no shared access today; document any future grant here.
