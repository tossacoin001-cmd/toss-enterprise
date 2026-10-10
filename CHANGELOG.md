# Changelog

Notable changes to the Toss Enterprise OS, newest first. The detailed record is the Conventional Commit history; this file only keeps the milestones.

## 2026-10-10

- Plan for the free instant scan with no sign-up (Visibility OS phase B), with its assumptions tested before any build: [plan](docs/04-product/visibility-os-instant-scan-plan.md), experiment scripts in [research/instant-scan-experiments/](research/instant-scan-experiments/). Key findings: the current audit wrongly reports working sites as unreachable after one 8s timeout; plain fetch misses JavaScript-added signals on about 1 in 5 real sites; Instagram, X and YouTube links can be verified, Facebook and TikTok cannot.
- Visibility OS Vercel build fixed: the build command now builds workspace packages first (`pnpm --filter "@toss/visibility-os..." build`). Without it, `@toss/email` (a built, gitignored `dist`) could not be resolved, so every Vercel build of the weekly digest work failed even though local builds passed. A test guards the command.
- Visibility OS database reliability ([ADR-0012](docs/01-architecture/decisions/0012-supabase-free-tier-until-first-paying-customer.md)). The free Supabase database had paused, which silently failed every production deploy from 2026-08-29. Restored; added `GET /api/health` (reads the database, 200 or 503) for an uptime monitor, a runbook for database and deploy failures, and a recorded rule to upgrade to Supabase Pro before the first paying customer.
- Visibility OS launch readiness, phase A ([ADR-0011](docs/01-architecture/decisions/0011-daily-time-boxed-weekly-run-and-connect-listing.md)). Onboarding no longer fails when no Google listing is picked (or "Other" country); the weekly run is daily and time-boxed so it cannot time out as users grow; the digest links to the dashboard and has a one-click unsubscribe; a Google listing can be connected after onboarding; friendly error pages; speed check is tiered. First test suite in the repo (Vitest, `apps/visibility-os`), with a regression test per bug.

## 2026-10-08

- Visibility OS launch readiness: merged the 2026-08-29 audit fixes (no onboarding crash from a shared blank email, SSRF-safe redirect handling in the website audit, Sign Out ends the Clerk session, `middleware.ts` renamed to `proxy.ts`, business detail page). Website audit no longer gives false "not mobile-friendly" or "no search description" results on minified HTML, and a redirect chain can no longer exceed the audit's 8s budget.

## 2026-09-23

- Visibility OS: weekly re-score cron and digest email. Every business is re-scored weekly via a Vercel Cron job, and every owner gets an email every week regardless of whether anything changed: delta-led when something moved, top-open-action-item-led when it didn't ([ADR-0010](docs/01-architecture/decisions/0010-weekly-rescore-cron-and-digest.md)). New shared `@toss/email` package (Resend), extracted from the website's contact-form notifier at its second occurrence.

## 2026-09-22

- Visibility OS: real Google data at onboarding. The free-text Google URL field is replaced with a Places API (New) search; the Google subscore now requires a verified `googlePlaceId`, and `reviewCount`/`avgRating` are populated from live Google data instead of always reading 0 ([ADR-0009](docs/01-architecture/decisions/0009-google-places-api-for-live-google-data.md)).

## 2026-07-06

- Architecture pack created in `architecture/`: ten numbered blueprints mapping the current system to the target AI Growth OS (sprint goal 1).
- Scaffold placeholders: three workflow specs in `workflows/`, three proposed MCP server stubs in `mcp/`, prompt registry in `prompts/`, knowledge sources and corpora format in `knowledge/`. `ENGINEERING.md` gained the standards in brief; `ROADMAP.md` gained the Phase 0 to 4 milestone view.
- Knowledge taxonomy: nineteen numbered domain sections under `knowledge/` (governance to archive), each with a scope README citing its owning doc. Nine role-agent charters added under `agents/` (ceo, coo, cfo, cto, marketing, research, seo, support, automation); charters are README-only until their specs land.
- Enterprise OS top-level layout adopted ([ADR-0008](docs/01-architecture/decisions/0008-enterprise-os-top-level-layout.md)): full folder skeleton with scoped READMEs, plus `PROJECT.md`, this changelog, and root entry points `AI_CONTEXT.md`, `ENGINEERING.md`, `STACK.md`, `ROADMAP.md`.
- Visibility OS scoring MVP live in production: database wiring, scoring v1, audit flow ([ADR-0007](docs/01-architecture/decisions/0007-supabase-postgres-and-in-app-scoring-v1.md)).
- Visibility OS brand design system and a real landing page.
- Auth routes pinned in code, immune to corrupted env values.
- Database migration path fixed: migrations run through the non-pooling URL.

## 2026-07-05

- Phase 0 complete: honest toolchain (pnpm plus Turborepo, single lockfile), CI quality gate across the whole workspace, per-folder READMEs.
- Knowledge Brain built: company docs, ADRs 0001 to 0006, engineering and AI standards, implementation phases, first repository audit.
- Agent scaffolds compile: visibility, sales, and audit agents.

## Earlier

- Marketing website (`apps/website`) live on Vercel.
- Visibility OS app structure created with landing page and layout.
